const WORLD = 5200
const GRID = 88
const FOOD_COUNT = 240
const FOOD_MASS = 1.15
const START_MASS = 42
const MIN_SPLIT_MASS = 36
const MAX_CELLS = 8
const EAT_RATIO = 1.15
const MERGE_DELAY = 7
const LAUNCH_SPEED = 820
const AI_COUNT = 7
const PLAYER_OWNER = 0
const RESPAWN_WAIT = 1.15
const AI_RESPAWN_WAIT = 2.2
const TAP_MS = 280
const TAP_DIST = 16

const AI_COLORS = ['#5c8f76', '#c45c5c', '#5c7ec4', '#a56bb8', '#c49a4a', '#4aa3b5']

const rand = (min, max) => min + Math.random() * (max - min)
const clamp = (n, min, max) => Math.min(max, Math.max(min, n))
const hypot = Math.hypot
const damp = (current, target, lambda, dt) =>
  current + (target - current) * (1 - Math.exp(-lambda * dt))

const radiusOf = (mass) => Math.sqrt(Math.max(mass, 0.2)) * 4.15
const speedOf = (mass) => 430 / Math.pow(mass + 28, 0.38)

const readTheme = () => {
  const s = getComputedStyle(document.documentElement)
  return {
    bg: s.getPropertyValue('--bg').trim() || '#fffff4',
    text: s.getPropertyValue('--text').trim() || '#322f2f',
    accent: s.getPropertyValue('--accent').trim() || '#ee8533',
  }
}

const massCenter = (cells) => {
  let m = 0
  let x = 0
  let y = 0
  for (const cell of cells) {
    m += cell.mass
    x += cell.x * cell.mass
    y += cell.y * cell.mass
  }
  if (m < 0.001) return { x: WORLD / 2, y: WORLD / 2, mass: 0 }
  return { x: x / m, y: y / m, mass: m }
}

const makeCell = ({ x, y, mass, owner, color, vx = 0, vy = 0, mergeAt = 0 }) => ({
  x,
  y,
  vx,
  vy,
  mass,
  owner,
  color,
  mergeAt,
  phase: rand(0, Math.PI * 2),
  wobble: rand(0.7, 1.3),
})

export const mountPlay = (root) => {
  if (!root) return { start() {}, stop() {} }

  const canvas = document.createElement('canvas')
  canvas.className = 'play-canvas'
  canvas.setAttribute('aria-hidden', 'true')
  root.replaceChildren(canvas)
  const ctx = canvas.getContext('2d')

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const pointer = { x: WORLD / 2, y: WORLD / 2, valid: false }
  const camera = { x: WORLD / 2, y: WORLD / 2, zoom: 1 }
  const tap = { id: null, t: 0, x: 0, y: 0 }

  let viewW = 1
  let viewH = 1
  let dpr = 1
  let running = false
  let rafId = 0
  let last = 0
  let time = 0
  let cells = []
  let food = []
  let playerRespawnAt = 0
  let aiRespawnAt = new Map()
  let launchCool = 0
  let aiLaunchCool = new Map()

  const theme = { bg: '#fffff4', text: '#322f2f', accent: '#ee8533' }

  const syncTheme = () => Object.assign(theme, readTheme())

  const resize = () => {
    const rect = root.getBoundingClientRect()
    viewW = Math.max(1, rect.width)
    viewH = Math.max(1, rect.height)
    dpr = Math.min(2, window.devicePixelRatio || 1)
    canvas.width = Math.round(viewW * dpr)
    canvas.height = Math.round(viewH * dpr)
  }

  const screenToWorld = (clientX, clientY) => {
    const rect = canvas.getBoundingClientRect()
    const sx = clientX - rect.left
    const sy = clientY - rect.top
    return {
      x: camera.x + (sx - viewW / 2) / camera.zoom,
      y: camera.y + (sy - viewH / 2) / camera.zoom,
    }
  }

  const setPointer = (clientX, clientY) => {
    const w = screenToWorld(clientX, clientY)
    pointer.x = w.x
    pointer.y = w.y
    pointer.valid = true
  }

  const ownerCells = (owner) => cells.filter((c) => c.owner === owner)

  const clearSpot = (minDist, preferFarFrom) => {
    for (let i = 0; i < 28; i++) {
      const x = rand(180, WORLD - 180)
      const y = rand(180, WORLD - 180)
      let ok = true
      if (preferFarFrom) {
        if (hypot(x - preferFarFrom.x, y - preferFarFrom.y) < minDist * 1.6) ok = false
      }
      if (ok) {
        for (const cell of cells) {
          if (hypot(x - cell.x, y - cell.y) < minDist + radiusOf(cell.mass)) {
            ok = false
            break
          }
        }
      }
      if (ok) return { x, y }
    }
    return { x: rand(400, WORLD - 400), y: rand(400, WORLD - 400) }
  }

  const spawnFoodOne = () => {
    food.push({
      x: rand(24, WORLD - 24),
      y: rand(24, WORLD - 24),
      mass: FOOD_MASS,
      phase: rand(0, Math.PI * 2),
    })
  }

  const spawnPlayer = () => {
    cells = cells.filter((c) => c.owner !== PLAYER_OWNER)
    const pos = clearSpot(160)
    cells.push(
      makeCell({
        x: pos.x,
        y: pos.y,
        mass: START_MASS,
        owner: PLAYER_OWNER,
        color: theme.accent,
      }),
    )
    camera.x = pos.x
    camera.y = pos.y
    pointer.x = pos.x
    pointer.y = pos.y
    pointer.valid = false
    playerRespawnAt = 0
  }

  const spawnAI = (owner) => {
    cells = cells.filter((c) => c.owner !== owner)
    const player = massCenter(ownerCells(PLAYER_OWNER))
    const pos = clearSpot(220, player.mass ? player : null)
    cells.push(
      makeCell({
        x: pos.x,
        y: pos.y,
        mass: rand(START_MASS * 0.7, START_MASS * 1.35),
        owner,
        color: AI_COLORS[(owner - 1) % AI_COLORS.length],
      }),
    )
    aiRespawnAt.delete(owner)
    aiLaunchCool.set(owner, 1.2 + Math.random() * 2)
  }

  const resetWorld = () => {
    syncTheme()
    cells = []
    food = []
    time = 0
    launchCool = 0
    playerRespawnAt = 0
    aiRespawnAt = new Map()
    aiLaunchCool = new Map()
    for (let i = 0; i < FOOD_COUNT; i++) spawnFoodOne()
    spawnPlayer()
    for (let i = 1; i <= AI_COUNT; i++) spawnAI(i)
  }

  const clampCell = (cell) => {
    const r = radiusOf(cell.mass)
    const nx = clamp(cell.x, r, WORLD - r)
    const ny = clamp(cell.y, r, WORLD - r)
    if (nx !== cell.x) cell.vx *= 0.2
    if (ny !== cell.y) cell.vy *= 0.2
    cell.x = nx
    cell.y = ny
  }

  const steerCell = (cell, tx, ty, dt) => {
    const dx = tx - cell.x
    const dy = ty - cell.y
    const dist = hypot(dx, dy) || 1
    const max = speedOf(cell.mass)
    const spd = Math.min(max, dist * 3.4)
    const ax = (dx / dist) * spd
    const ay = (dy / dist) * spd
    const follow = cell.mergeAt > time ? 1.6 : 5.5
    cell.vx = damp(cell.vx, ax, follow, dt)
    cell.vy = damp(cell.vy, ay, follow, dt)
    cell.x += cell.vx * dt
    cell.y += cell.vy * dt
    clampCell(cell)
  }

  const splitCell = (cell, dirX, dirY) => {
    if (cell.mass < MIN_SPLIT_MASS) return false
    if (ownerCells(cell.owner).length >= MAX_CELLS) return false
    const dist = hypot(dirX, dirY) || 1
    const nx = dirX / dist
    const ny = dirY / dist
    const half = cell.mass / 2
    const r = radiusOf(half)
    cell.mass = half
    cell.mergeAt = time + MERGE_DELAY
    const shot = makeCell({
      x: cell.x + nx * (r + 2),
      y: cell.y + ny * (r + 2),
      mass: half,
      owner: cell.owner,
      color: cell.color,
      vx: nx * LAUNCH_SPEED + cell.vx,
      vy: ny * LAUNCH_SPEED + cell.vy,
      mergeAt: time + MERGE_DELAY,
    })
    cells.push(shot)
    clampCell(cell)
    clampCell(shot)
    return true
  }

  const launchOwner = (owner, tx, ty) => {
    const mine = ownerCells(owner)
    let did = false
    for (const cell of [...mine]) {
      if (splitCell(cell, tx - cell.x, ty - cell.y)) did = true
    }
    return did
  }

  const canEat = (eater, prey) => {
    if (eater.mass < prey.mass * EAT_RATIO) return false
    const er = radiusOf(eater.mass)
    const pr = radiusOf(prey.mass)
    const dist = hypot(eater.x - prey.x, eater.y - prey.y)
    return dist < er - pr * 0.32
  }

  const absorb = (eater, preyIndex) => {
    const prey = cells[preyIndex]
    eater.mass += prey.mass
    cells.splice(preyIndex, 1)
  }

  const resolveMoving = () => {
    for (let i = 0; i < cells.length; i++) {
      for (let j = i + 1; j < cells.length; j++) {
        const a = cells[i]
        const b = cells[j]
        const dx = b.x - a.x
        const dy = b.y - a.y
        const dist = hypot(dx, dy) || 0.001
        const ra = radiusOf(a.mass)
        const rb = radiusOf(b.mass)

        if (a.owner === b.owner) {
          const mergeReady = time >= a.mergeAt && time >= b.mergeAt
          if (mergeReady && dist < Math.max(ra, rb) * 0.92) {
            const keep = a.mass >= b.mass ? a : b
            const drop = keep === a ? j : i
            const total = a.mass + b.mass
            keep.x = (a.x * a.mass + b.x * b.mass) / total
            keep.y = (a.y * a.mass + b.y * b.mass) / total
            keep.mass = total
            cells.splice(drop, 1)
            return true
          }
          const minDist = (ra + rb) * 0.92
          if (dist < minDist) {
            const push = ((minDist - dist) / 2) * 0.65
            const nx = dx / dist
            const ny = dy / dist
            a.x -= nx * push
            a.y -= ny * push
            b.x += nx * push
            b.y += ny * push
            clampCell(a)
            clampCell(b)
          }
          continue
        }

        if (canEat(a, b)) {
          absorb(a, j)
          return true
        }
        if (canEat(b, a)) {
          absorb(b, i)
          return true
        }
      }
    }
    return false
  }

  const eatFood = () => {
    for (const cell of cells) {
      const r = radiusOf(cell.mass)
      for (let i = food.length - 1; i >= 0; i--) {
        const pellet = food[i]
        if (hypot(cell.x - pellet.x, cell.y - pellet.y) < r * 0.92) {
          cell.mass += pellet.mass
          food.splice(i, 1)
          spawnFoodOne()
        }
      }
    }
  }

  const ownerTotals = () => {
    const totals = new Map()
    for (const cell of cells) {
      const cur = totals.get(cell.owner) || { owner: cell.owner, mass: 0, x: 0, y: 0 }
      cur.mass += cell.mass
      cur.x += cell.x * cell.mass
      cur.y += cell.y * cell.mass
      totals.set(cell.owner, cur)
    }
    for (const cur of totals.values()) {
      cur.x /= cur.mass
      cur.y /= cur.mass
    }
    return totals
  }

  const thinkAI = (owner) => {
    const mine = ownerCells(owner)
    if (!mine.length) return null
    const me = massCenter(mine)
    const myR = radiusOf(me.mass)

    let threat = null
    let threatDist = Infinity
    let prey = null
    let preyDist = Infinity

    for (const other of ownerTotals().values()) {
      if (other.owner === owner) continue
      const dist = hypot(other.x - me.x, other.y - me.y)
      if (other.mass > me.mass * EAT_RATIO && dist < threatDist) {
        threat = other
        threatDist = dist
      } else if (me.mass > other.mass * EAT_RATIO && dist < preyDist) {
        prey = other
        preyDist = dist
      }
    }

    if (threat && threatDist < radiusOf(threat.mass) + myR + 240) {
      const dx = me.x - threat.x
      const dy = me.y - threat.y
      const dist = hypot(dx, dy) || 1
      return {
        x: me.x + (dx / dist) * 420,
        y: me.y + (dy / dist) * 420,
        hunt: null,
      }
    }

    if (prey && preyDist < 520) {
      return { x: prey.x, y: prey.y, hunt: prey }
    }

    let pellet = null
    let pelletDist = Infinity
    for (const item of food) {
      const dist = hypot(item.x - me.x, item.y - me.y)
      if (dist < pelletDist) {
        pellet = item
        pelletDist = dist
      }
    }
    if (pellet) return { x: pellet.x, y: pellet.y, hunt: null }

    return { x: me.x + Math.cos(time * 0.2 + owner) * 200, y: me.y + Math.sin(time * 0.17 + owner) * 200, hunt: null }
  }

  const maybeAILaunch = (owner, goal) => {
    if (!goal?.hunt) return
    const cool = aiLaunchCool.get(owner) ?? 0
    if (cool > 0) return
    const mine = ownerCells(owner)
    const me = massCenter(mine)
    if (me.mass < MIN_SPLIT_MASS * 1.15) return
    const hunt = goal.hunt
    const dx = hunt.x - me.x
    const dy = hunt.y - me.y
    const dist = hypot(dx, dy)
    const reach = radiusOf(me.mass) + 90
    if (dist < reach || dist > 340) return
    if (launchOwner(owner, hunt.x, hunt.y)) {
      aiLaunchCool.set(owner, 3.5 + Math.random() * 2.5)
    }
  }

  const maintainPop = (dt) => {
    if (!ownerCells(PLAYER_OWNER).length) {
      if (!playerRespawnAt) playerRespawnAt = time + RESPAWN_WAIT
      else if (time >= playerRespawnAt) spawnPlayer()
    }

    for (let owner = 1; owner <= AI_COUNT; owner++) {
      if (ownerCells(owner).length) continue
      const due = aiRespawnAt.get(owner)
      if (!due) aiRespawnAt.set(owner, time + AI_RESPAWN_WAIT)
      else if (time >= due) spawnAI(owner)
    }

    launchCool = Math.max(0, launchCool - dt)
    for (const [owner, cool] of aiLaunchCool) {
      aiLaunchCool.set(owner, Math.max(0, cool - dt))
    }
  }

  const update = (dt) => {
    syncTheme()
    time += dt
    maintainPop(dt)

    const player = ownerCells(PLAYER_OWNER)
    const pCenter = massCenter(player)
    const aimX = pointer.valid ? pointer.x : pCenter.x
    const aimY = pointer.valid ? pointer.y : pCenter.y

    for (const cell of player) {
      cell.color = theme.accent
      steerCell(cell, aimX, aimY, dt)
    }

    for (let owner = 1; owner <= AI_COUNT; owner++) {
      const goal = thinkAI(owner)
      if (!goal) continue
      maybeAILaunch(owner, goal)
      for (const cell of ownerCells(owner)) {
        steerCell(cell, goal.x, goal.y, dt)
      }
    }

    eatFood()
    for (let n = 0; n < 8 && resolveMoving(); n++) {
      /* merge / eat can shift indices; repeat a few times */
    }

    const follow = massCenter(ownerCells(PLAYER_OWNER))
    if (follow.mass) {
      const camRate = reduceMotion ? 18 : 5.2
      camera.x = damp(camera.x, follow.x, camRate, dt)
      camera.y = damp(camera.y, follow.y, camRate, dt)
      const cover = Math.max(radiusOf(follow.mass) * 9.5, Math.min(viewW, viewH) * 0.42)
      const z = clamp(Math.min(viewW, viewH) / (cover * 2.15), 0.42, 1)
      camera.zoom = reduceMotion ? z : damp(camera.zoom, z, 2.4, dt)
    }
  }

  const drawGrid = () => {
    const left = camera.x - viewW / 2 / camera.zoom
    const top = camera.y - viewH / 2 / camera.zoom
    const right = camera.x + viewW / 2 / camera.zoom
    const bottom = camera.y + viewH / 2 / camera.zoom
    const x0 = Math.floor(left / GRID) * GRID
    const y0 = Math.floor(top / GRID) * GRID

    ctx.beginPath()
    for (let x = x0; x <= right; x += GRID) {
      ctx.moveTo(x, top)
      ctx.lineTo(x, bottom)
    }
    for (let y = y0; y <= bottom; y += GRID) {
      ctx.moveTo(left, y)
      ctx.lineTo(right, y)
    }
    ctx.strokeStyle = theme.text
    ctx.globalAlpha = 0.08
    ctx.lineWidth = 1 / camera.zoom
    ctx.stroke()

    ctx.globalAlpha = 0.22
    ctx.strokeRect(0, 0, WORLD, WORLD)
    ctx.globalAlpha = 1
  }

  const drawPellet = (item) => {
    const wobble = reduceMotion ? 1 : 1 + Math.sin(time * 2.1 + item.phase) * 0.08
    const r = radiusOf(item.mass) * wobble
    ctx.beginPath()
    ctx.arc(item.x, item.y, r, 0, Math.PI * 2)
    ctx.fillStyle = theme.accent
    ctx.globalAlpha = 0.42
    ctx.fill()
    ctx.globalAlpha = 1
  }

  const drawCell = (cell) => {
    const wobble = reduceMotion ? 1 : 1 + Math.sin(time * 2.4 * cell.wobble + cell.phase) * 0.045
    const r = radiusOf(cell.mass) * wobble
    ctx.beginPath()
    ctx.arc(cell.x, cell.y, r, 0, Math.PI * 2)
    ctx.fillStyle = cell.color
    ctx.fill()
    ctx.globalAlpha = 0.18
    ctx.fillStyle = theme.bg
    ctx.beginPath()
    ctx.arc(cell.x - r * 0.22, cell.y - r * 0.22, r * 0.42, 0, Math.PI * 2)
    ctx.fill()
    ctx.globalAlpha = 1
  }

  const draw = () => {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, viewW, viewH)
    ctx.fillStyle = theme.bg
    ctx.fillRect(0, 0, viewW, viewH)

    ctx.save()
    ctx.translate(viewW / 2, viewH / 2)
    ctx.scale(camera.zoom, camera.zoom)
    ctx.translate(-camera.x, -camera.y)

    drawGrid()
    for (const item of food) drawPellet(item)

    const others = cells.filter((c) => c.owner !== PLAYER_OWNER)
    const mine = cells.filter((c) => c.owner === PLAYER_OWNER)
    others.sort((a, b) => a.mass - b.mass)
    mine.sort((a, b) => a.mass - b.mass)
    for (const cell of others) drawCell(cell)
    for (const cell of mine) drawCell(cell)

    ctx.restore()
  }

  const tick = (now) => {
    if (!running) return
    if (document.hidden) {
      last = now
      rafId = requestAnimationFrame(tick)
      return
    }
    const dt = Math.min(0.05, (now - last) / 1000 || 0.016)
    last = now
    update(dt)
    draw()
    rafId = requestAnimationFrame(tick)
  }

  const tryLaunch = () => {
    if (launchCool > 0) return
    const player = ownerCells(PLAYER_OWNER)
    if (!player.length) return
    const aim = pointer.valid ? pointer : massCenter(player)
    if (launchOwner(PLAYER_OWNER, aim.x, aim.y)) launchCool = 0.42
  }

  const onPointerMove = (e) => {
    if (!running) return
    setPointer(e.clientX, e.clientY)
  }

  const onPointerDown = (e) => {
    if (!running) return
    if (e.target?.closest?.('button')) return
    setPointer(e.clientX, e.clientY)
    tap.id = e.pointerId
    tap.t = e.timeStamp
    tap.x = e.clientX
    tap.y = e.clientY
  }

  const onPointerUp = (e) => {
    if (!running || tap.id !== e.pointerId) return
    const dt = e.timeStamp - tap.t
    const dist = hypot(e.clientX - tap.x, e.clientY - tap.y)
    tap.id = null
    if (e.target?.closest?.('button')) return
    if (e.pointerType !== 'mouse' && dt <= TAP_MS && dist <= TAP_DIST) tryLaunch()
  }

  const onKeyDown = (e) => {
    if (!running) return
    if (e.code !== 'Space' && e.key !== ' ') return
    e.preventDefault()
    if (e.repeat) return
    tryLaunch()
  }

  const observer = new ResizeObserver(resize)

  const start = () => {
    if (running) return
    running = true
    resize()
    resetWorld()
    last = performance.now()
    observer.observe(root)
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('pointerup', onPointerUp)
    window.addEventListener('pointercancel', onPointerUp)
    window.addEventListener('keydown', onKeyDown)
    rafId = requestAnimationFrame(tick)
  }

  const stop = () => {
    if (!running) return
    running = false
    cancelAnimationFrame(rafId)
    observer.disconnect()
    window.removeEventListener('pointermove', onPointerMove)
    window.removeEventListener('pointerdown', onPointerDown)
    window.removeEventListener('pointerup', onPointerUp)
    window.removeEventListener('pointercancel', onPointerUp)
    window.removeEventListener('keydown', onKeyDown)
    tap.id = null
  }

  return { start, stop }
}
