import { signInAnonymously } from 'firebase/auth'
import {
  onDisconnect,
  onValue,
  ref,
  runTransaction,
  serverTimestamp,
  set,
  update,
} from 'firebase/database'
import { auth, rtdb } from './firebase.js'

export const EXTRA_SLOT = 0
export const AI_COUNT = 11
export const SLOT_COUNT = 12
export const MAX_HUMANS = 12
export const HOST_STALE_MS = 30000
export const HEARTBEAT_MS = 2000
export const PRESENCE_STALE_MS = 30000

const ROOT = 'play/global'

export const defaultSlots = () => {
  const slots = { [EXTRA_SLOT]: { kind: 'empty' } }
  for (let i = 1; i <= AI_COUNT; i++) slots[i] = { kind: 'ai' }
  return slots
}

export const humanCount = (slots) => {
  if (!slots) return 0
  let n = 0
  for (let i = 0; i < SLOT_COUNT; i++) {
    if (slots[i]?.kind === 'human') n += 1
  }
  return n
}

export const slotOfUid = (slots, uid) => {
  if (!slots || !uid) return -1
  for (let i = 0; i < SLOT_COUNT; i++) {
    if (slots[i]?.kind === 'human' && slots[i].uid === uid) return i
  }
  return -1
}

const bytesToB64 = (bytes) => {
  let bin = ''
  const chunk = 0x8000
  for (let i = 0; i < bytes.length; i += chunk) {
    bin += String.fromCharCode(...bytes.subarray(i, i + chunk))
  }
  return btoa(bin)
}

const b64ToBytes = (b64) => {
  const bin = atob(b64)
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return bytes
}

export const packFood = (food) => {
  const n = food.length
  const buf = new Uint8Array(n * 5)
  const view = new DataView(buf.buffer)
  for (let i = 0; i < n; i++) {
    const o = i * 5
    view.setUint16(o, Math.max(0, Math.min(65535, Math.round(food[i].x))), true)
    view.setUint16(o + 2, Math.max(0, Math.min(65535, Math.round(food[i].y))), true)
    buf[o + 4] = food[i].ci ?? 0
  }
  return { n, p: bytesToB64(buf) }
}

const asList = (value) => {
  if (Array.isArray(value)) return value
  if (!value || typeof value !== 'object') return []
  return Object.keys(value)
    .filter((key) => Number.isInteger(Number(key)) && Number(key) >= 0)
    .sort((a, b) => Number(a) - Number(b))
    .map((key) => value[key])
}

const warnWrite = (label) => (err) => {
  console.warn(`play-net ${label}`, err)
}

export const unpackFood = (packed, palette) => {
  if (!packed?.p || !packed.n) return []
  const buf = b64ToBytes(packed.p)
  const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength)
  const next = []
  const n = Math.min(packed.n, Math.floor(buf.length / 5))
  for (let i = 0; i < n; i++) {
    const o = i * 5
    const ci = buf[o + 4] % palette.length
    next.push({
      x: view.getUint16(o, true),
      y: view.getUint16(o + 2, true),
      mass: 1.15,
      phase: (i * 1.618) % (Math.PI * 2),
      color: palette[ci],
      ci,
    })
  }
  return next
}

export const packCells = (cells) =>
  cells.map((c) => [
    Math.round(c.x * 10) / 10,
    Math.round(c.y * 10) / 10,
    Math.round(c.vx * 10) / 10,
    Math.round(c.vy * 10) / 10,
    Math.round(c.mass * 10) / 10,
    c.owner,
    c.color,
    Math.round(c.mergeAt * 100) / 100,
    Math.round((c.stretch || 0) * 100) / 100,
    Math.round((c.angle || 0) * 100) / 100,
    c.merging ? 1 : 0,
  ])

export const unpackCells = (packed) => {
  const rows = asList(packed)
  return rows
    .map((row) => {
      const cell = asList(row)
      if (cell.length < 7) return null
      return {
        x: cell[0],
        y: cell[1],
        vx: cell[2],
        vy: cell[3],
        mass: cell[4],
        owner: cell[5],
        color: cell[6],
        mergeAt: cell[7],
        stretch: cell[8],
        angle: cell[9],
        merging: !!cell[10],
        phase: 0,
        wobble: 1,
      }
    })
    .filter(Boolean)
}

export const pickClaimSlot = (current, uid) => {
  const slots = current ? { ...current } : defaultSlots()
  for (let i = 0; i < SLOT_COUNT; i++) {
    if (!slots[i]) slots[i] = i === EXTRA_SLOT ? { kind: 'empty' } : { kind: 'ai' }
  }
  const existing = slotOfUid(slots, uid)
  if (existing >= 0) return { slots, slot: existing }
  if (humanCount(slots) >= MAX_HUMANS) return { full: true, slots }
  if (slots[EXTRA_SLOT]?.kind !== 'human') {
    slots[EXTRA_SLOT] = { kind: 'human', uid, at: Date.now() }
    return { slots, slot: EXTRA_SLOT }
  }
  const ai = []
  for (let i = 1; i <= AI_COUNT; i++) {
    if (slots[i]?.kind === 'ai') ai.push(i)
  }
  if (!ai.length) return { full: true, slots }
  const slot = ai[Math.floor(Math.random() * ai.length)]
  slots[slot] = { kind: 'human', uid, at: Date.now() }
  return { slots, slot }
}

const HOST_KEY = 'kaleb-play-host'
const SLOTS_KEY = 'kaleb-play-slots'
const CHANNEL = 'kaleb-play-global'

const readJson = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

const connectLocal = (handlers) => {
  const uid = `local-${Math.random().toString(36).slice(2, 10)}`
  const channel = typeof BroadcastChannel === 'function' ? new BroadcastChannel(CHANNEL) : null
  let slots = readJson(SLOTS_KEY, defaultSlots())
  let hostNow = false
  let hostKnown = false
  let claimedSlot = -1
  let playing = false
  let closed = false
  const presence = {}
  const inputs = {}

  const broadcast = (msg) => {
    try {
      channel?.postMessage(msg)
    } catch {
      /* ignore */
    }
  }

  const setHost = (next) => {
    if (next === hostNow && hostKnown) return
    hostNow = next
    hostKnown = true
    handlers.onHostChange?.(hostNow)
  }

  const elect = () => {
    const host = readJson(HOST_KEY, null)
    const stale = !host?.uid || Date.now() - (host.at || 0) >= HOST_STALE_MS
    if (!stale && host.uid !== uid) {
      setHost(false)
      return
    }
    if (stale && host?.uid !== uid) {
      slots = defaultSlots()
      try {
        localStorage.setItem(SLOTS_KEY, JSON.stringify(slots))
      } catch {
        /* ignore */
      }
    }
    localStorage.setItem(HOST_KEY, JSON.stringify({ uid, at: Date.now() }))
    window.setTimeout(() => {
      if (closed) return
      const confirm = readJson(HOST_KEY, null)
      setHost(confirm?.uid === uid)
    }, 16)
  }

  const applySlots = (next) => {
    slots = next
    try {
      localStorage.setItem(SLOTS_KEY, JSON.stringify(slots))
    } catch {
      /* ignore */
    }
    handlers.onSlots?.(slots)
    broadcast({ type: 'slots', slots })
  }

  const onMessage = (event) => {
    const msg = event.data
    if (closed || !msg || (msg.uid === uid && msg.type !== 'claim-result')) return
    if (msg.type === 'hello' && hostNow) {
      broadcast({ type: 'slots', slots })
      return
    }
    if (msg.type === 'host') {
      if (msg.uid !== uid && Date.now() - (msg.at || 0) < HOST_STALE_MS) setHost(false)
      return
    }
    if (msg.type === 'slots') {
      slots = msg.slots || defaultSlots()
      handlers.onSlots?.(slots)
      return
    }
    if (msg.type === 'cells' && !hostNow) {
      handlers.onCells?.(msg.payload)
      return
    }
    if (msg.type === 'food' && !hostNow) {
      handlers.onFood?.(msg.payload)
      return
    }
    if (msg.type === 'inputs' && hostNow) {
      inputs[msg.uid] = msg.input
      handlers.onInputs?.({ ...inputs })
      return
    }
    if (msg.type === 'presence') {
      presence[msg.uid] = msg.presence
      handlers.onPresence?.({ ...presence })
      return
    }
    if (msg.type === 'claim' && hostNow) {
      const result = pickClaimSlot(slots, msg.uid)
      if (result.full) {
        broadcast({ type: 'claim-result', uid: msg.uid, full: true })
        return
      }
      applySlots(result.slots)
      broadcast({ type: 'claim-result', uid: msg.uid, slot: result.slot })
      return
    }
    if (msg.type === 'release' && hostNow) {
      const slot = slotOfUid(slots, msg.uid)
      if (slot < 0) return
      const next = { ...slots }
      next[slot] = slot === EXTRA_SLOT ? { kind: 'empty' } : { kind: 'ai' }
      applySlots(next)
    }
  }

  channel?.addEventListener('message', onMessage)
  elect()
  handlers.onSlots?.(slots)
  broadcast({ type: 'hello', uid })

  const beat = window.setInterval(() => {
    if (closed) return
    presence[uid] = { at: Date.now(), playing, slot: claimedSlot >= 0 ? claimedSlot : null }
    broadcast({ type: 'presence', uid, presence: presence[uid] })
    handlers.onPresence?.({ ...presence })
    if (hostNow) {
      localStorage.setItem(HOST_KEY, JSON.stringify({ uid, at: Date.now() }))
      broadcast({ type: 'host', uid, at: Date.now() })
    } else {
      const host = readJson(HOST_KEY, null)
      if (!host?.uid || Date.now() - (host.at || 0) >= HOST_STALE_MS) elect()
    }
  }, HEARTBEAT_MS)

  return {
    uid,
    isHost: () => hostNow,
    getSlots: () => slots,
    async claimSlot() {
      if (hostNow || !channel) {
        const result = pickClaimSlot(slots, uid)
        if (result.full) return { full: true }
        claimedSlot = result.slot
        applySlots(result.slots)
        return { slot: result.slot }
      }
      return new Promise((resolve) => {
        const timer = window.setTimeout(() => resolve({ full: true }), 2500)
        const onResult = (event) => {
          const msg = event.data
          if (msg?.type !== 'claim-result' || msg.uid !== uid) return
          window.clearTimeout(timer)
          channel.removeEventListener('message', onResult)
          if (msg.full) resolve({ full: true })
          else {
            claimedSlot = msg.slot
            resolve({ slot: msg.slot })
          }
        }
        channel.addEventListener('message', onResult)
        broadcast({ type: 'claim', uid })
      })
    },
    async releaseSlot() {
      if (claimedSlot < 0) return
      claimedSlot = -1
      playing = false
      if (hostNow || !channel) {
        const slot = slotOfUid(slots, uid)
        if (slot < 0) return
        const next = { ...slots }
        next[slot] = slot === EXTRA_SLOT ? { kind: 'empty' } : { kind: 'ai' }
        applySlots(next)
        return
      }
      broadcast({ type: 'release', uid })
    },
    writeInput(input) {
      if (hostNow) {
        inputs[uid] = input
        handlers.onInputs?.({ ...inputs })
        return
      }
      broadcast({ type: 'inputs', uid, input })
    },
    writePresence(next) {
      playing = !!next.playing
      presence[uid] = { at: Date.now(), playing, slot: claimedSlot >= 0 ? claimedSlot : null }
      broadcast({ type: 'presence', uid, presence: presence[uid] })
    },
    publishCells(payload) {
      if (!hostNow) return
      broadcast({ type: 'cells', uid, payload })
    },
    publishFood(payload) {
      if (!hostNow) return
      broadcast({ type: 'food', uid, payload })
    },
    writeSlots(next) {
      if (!hostNow) return
      applySlots(next)
    },
    disconnect() {
      if (closed) return
      closed = true
      window.clearInterval(beat)
      channel?.removeEventListener('message', onMessage)
      if (claimedSlot >= 0) {
        if (hostNow) {
          const slot = slotOfUid(slots, uid)
          if (slot >= 0) {
            const next = { ...slots }
            next[slot] = slot === EXTRA_SLOT ? { kind: 'empty' } : { kind: 'ai' }
            applySlots(next)
          }
        } else {
          broadcast({ type: 'release', uid })
        }
      }
      if (hostNow) localStorage.removeItem(HOST_KEY)
      channel?.close()
    },
  }
}

const connectRemote = async (handlers) => {
  const cred = await Promise.race([
    signInAnonymously(auth),
    new Promise((_, reject) => {
      window.setTimeout(() => reject(new Error('auth timeout')), 12000)
    }),
  ])
  const uid = cred.user.uid
  const hostRef = ref(rtdb, `${ROOT}/host`)
  const slotsRef = ref(rtdb, `${ROOT}/slots`)
  const presenceRef = ref(rtdb, `${ROOT}/presence/${uid}`)
  const inputsRef = ref(rtdb, `${ROOT}/inputs/${uid}`)
  const allInputsRef = ref(rtdb, `${ROOT}/inputs`)
  const allPresenceRef = ref(rtdb, `${ROOT}/presence`)
  const cellsRef = ref(rtdb, `${ROOT}/snapCells`)
  const foodRef = ref(rtdb, `${ROOT}/snapFood`)
  const connectedRef = ref(rtdb, '.info/connected')
  const offsetRef = ref(rtdb, '.info/serverTimeOffset')

  let hostNow = false
  let hostKnown = false
  let claimedSlot = -1
  let playing = false
  let closed = false
  let latestHost = null
  let latestPresence = {}
  let latestCells = null
  let latestFood = null
  let serverOffset = 0
  const unsubs = []

  const serverNow = () => Date.now() + serverOffset

  const presencePayload = () => ({
    at: serverTimestamp(),
    playing,
    slot: claimedSlot >= 0 ? claimedSlot : null,
  })

  const stampIsLive = (at) => {
    if (at == null) return false
    if (typeof at !== 'number') return true
    return serverNow() - at < HOST_STALE_MS
  }

  const presenceIsLive = (row) => {
    if (!row) return false
    if (typeof row.at !== 'number') return true
    return serverNow() - row.at < PRESENCE_STALE_MS
  }

  const hostIsLive = (host) => {
    if (!host?.uid) return false
    if (presenceIsLive(latestPresence[host.uid])) return true
    return stampIsLive(host.at)
  }

  const becomeHost = async () => {
    try {
      await runTransaction(hostRef, (current) => {
        if (current?.uid && current.uid !== uid && hostIsLive(current)) return current
        return { uid, at: serverTimestamp() }
      })
    } catch (err) {
      warnWrite('becomeHost')(err)
    }
  }

  const applyLatestWorld = () => {
    if (hostNow) return
    if (latestCells) handlers.onCells?.(latestCells)
    if (latestFood) handlers.onFood?.(latestFood)
  }

  const setSlotDisconnect = async (slot) => {
    if (slot < 0) return
    const slotRef = ref(rtdb, `${ROOT}/slots/${slot}`)
    await onDisconnect(slotRef).set(slot === EXTRA_SLOT ? { kind: 'empty' } : { kind: 'ai' })
  }

  const clearSlotDisconnect = async (slot) => {
    if (slot < 0) return
    await onDisconnect(ref(rtdb, `${ROOT}/slots/${slot}`)).cancel()
  }

  const armDisconnects = async () => {
    await onDisconnect(presenceRef).remove()
    await onDisconnect(inputsRef).remove()
    if (claimedSlot >= 0) await setSlotDisconnect(claimedSlot)
    if (hostNow) await onDisconnect(hostRef).remove()
    else await onDisconnect(hostRef).cancel()
  }

  const setHostDisconnect = async (on) => {
    if (on) await onDisconnect(hostRef).remove()
    else await onDisconnect(hostRef).cancel()
  }

  const setHostState = (next) => {
    if (next === hostNow && hostKnown) return
    const wasHost = hostNow
    hostNow = next
    hostKnown = true
    setHostDisconnect(hostNow).catch(warnWrite('hostDisconnect'))
    if (next && !wasHost) {
      if (latestCells) handlers.onCells?.(latestCells)
      if (latestFood) handlers.onFood?.(latestFood)
    }
    handlers.onHostChange?.(hostNow)
    if (!hostNow) applyLatestWorld()
  }

  const syncHost = () => {
    if (closed) return
    if (!hostIsLive(latestHost)) becomeHost()
    setHostState(latestHost?.uid === uid && hostIsLive(latestHost))
  }

  const flushBeat = () => {
    if (closed) return
    set(presenceRef, presencePayload()).catch(warnWrite('presence'))
    if (hostNow) update(hostRef, { uid, at: serverTimestamp() }).catch(warnWrite('host'))
    syncHost()
  }

  unsubs.push(
    onValue(offsetRef, (snap) => {
      if (closed) return
      serverOffset = Number(snap.val()) || 0
    }),
  )

  unsubs.push(
    onValue(connectedRef, async (snap) => {
      if (closed || snap.val() !== true) return
      try {
        await armDisconnects()
        await set(presenceRef, presencePayload())
      } catch (err) {
        warnWrite('reconnect')(err)
      }
      syncHost()
    }),
  )

  unsubs.push(
    onValue(hostRef, (snap) => {
      if (closed) return
      latestHost = snap.val()
      syncHost()
    }),
  )

  unsubs.push(
    onValue(slotsRef, (snap) => {
      if (closed) return
      handlers.onSlots?.(snap.val() || defaultSlots())
    }),
  )

  unsubs.push(
    onValue(cellsRef, (snap) => {
      if (closed) return
      latestCells = snap.val()
      if (!hostNow && latestCells) handlers.onCells?.(latestCells)
    }),
  )

  unsubs.push(
    onValue(foodRef, (snap) => {
      if (closed) return
      latestFood = snap.val()
      if (!hostNow && latestFood) handlers.onFood?.(latestFood)
    }),
  )

  unsubs.push(
    onValue(allInputsRef, (snap) => {
      if (closed || !hostNow) return
      handlers.onInputs?.(snap.val() || {})
    }),
  )

  unsubs.push(
    onValue(allPresenceRef, (snap) => {
      if (closed) return
      latestPresence = snap.val() || {}
      handlers.onPresence?.(latestPresence)
      syncHost()
    }),
  )

  const beat = window.setInterval(flushBeat, HEARTBEAT_MS)
  const onVisible = () => {
    if (document.visibilityState === 'visible') flushBeat()
  }
  document.addEventListener('visibilitychange', onVisible)

  await becomeHost()

  return {
    uid,
    isHost: () => hostNow,
    getSlots: () => defaultSlots(),
    async claimSlot() {
      let slot = -1
      let full = false
      await runTransaction(slotsRef, (current) => {
        const result = pickClaimSlot(current, uid)
        if (result.full) {
          full = true
          return current || defaultSlots()
        }
        slot = result.slot
        return result.slots
      })
      if (full || slot < 0) return { full: true }
      if (claimedSlot >= 0 && claimedSlot !== slot) await clearSlotDisconnect(claimedSlot)
      claimedSlot = slot
      await setSlotDisconnect(slot)
      await set(presenceRef, presencePayload())
      return { slot }
    },
    async releaseSlot() {
      if (claimedSlot < 0) return
      const slot = claimedSlot
      await clearSlotDisconnect(slot)
      await runTransaction(slotsRef, (current) => {
        const slots = current ? { ...current } : defaultSlots()
        if (slots[slot]?.uid !== uid) return slots
        slots[slot] = slot === EXTRA_SLOT ? { kind: 'empty' } : { kind: 'ai' }
        return slots
      })
      claimedSlot = -1
      playing = false
      await set(presenceRef, presencePayload())
    },
    writeInput(input) {
      if (closed) return
      set(inputsRef, { ...input, at: serverTimestamp() }).catch(warnWrite('input'))
    },
    writePresence(next) {
      playing = !!next.playing
      set(presenceRef, presencePayload()).catch(warnWrite('presence'))
    },
    publishCells(payload) {
      if (!hostNow || closed) return
      set(cellsRef, payload).catch(warnWrite('snapCells'))
    },
    publishFood(payload) {
      if (!hostNow || closed) return
      set(foodRef, payload).catch(warnWrite('snapFood'))
    },
    writeSlots(next) {
      if (!hostNow || closed) return
      set(slotsRef, next).catch(warnWrite('slots'))
    },
    disconnect() {
      if (closed) return
      closed = true
      window.clearInterval(beat)
      document.removeEventListener('visibilitychange', onVisible)
      for (const unsub of unsubs) unsub()
      const slot = claimedSlot
      claimedSlot = -1
      playing = false
      set(presenceRef, null).catch(warnWrite('presenceClear'))
      set(inputsRef, null).catch(warnWrite('inputClear'))
      if (slot >= 0) {
        runTransaction(slotsRef, (current) => {
          const slots = current ? { ...current } : defaultSlots()
          if (slots[slot]?.uid !== uid) return slots
          slots[slot] = slot === EXTRA_SLOT ? { kind: 'empty' } : { kind: 'ai' }
          return slots
        }).catch(warnWrite('slotRelease'))
      }
      if (hostNow) set(hostRef, null).catch(warnWrite('hostClear'))
    },
  }
}

export const connectPlaySession = async (handlers) => {
  try {
    return await connectRemote(handlers)
  } catch (err) {
    console.warn('play session offline, using local world', err)
    handlers.onError?.(err)
    return connectLocal(handlers)
  }
}
