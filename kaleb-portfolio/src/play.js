const WORLD = 5200
const GRID = 88
const FOOD_COUNT = 240
const FOOD_MASS = 1.15
const START_MASS = 42
const MIN_SPLIT_MASS = 36
const MAX_CELLS = 8
const EAT_RATIO = 1.15
const MERGE_DELAY = 10
const MERGE_TOUCH = 1.02
const MERGE_FINISH = 0.24
const MERGE_PULL = 1.25
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

const pointOn = (x, y, angle, r) => [x + Math.cos(angle) * r, y + Math.sin(angle) * r]

const metaballPath = (ctx, x1, y1, r1, x2, y2, r2) => {
  const d = hypot(x2 - x1, y2 - y1)
  if (d < 0.001 || d >= (r1 + r2) * 1.35) return false
  if (d <= Math.abs(r1 - r2) * 0.96) return false

  const v = 0.62
  let u1 = 0
  let u2 = 0
  if (d < r1 + r2) {
    u1 = Math.acos(clamp((r1 * r1 + d * d - r2 * r2) / (2 * r1 * d), -1, 1))
    u2 = Math.acos(clamp((r2 * r2 + d * d - r1 * r1) / (2 * r2 * d), -1, 1))
  }
  const angleBetween = Math.atan2(y1 - y2, x1 - x2)
  const maxSpread = Math.acos(clamp((r1 - r2) / d, -1, 1))
  const a1 = angleBetween + u1 + (maxSpread - u1) * v
  const a2 = angleBetween - u1 - (maxSpread - u1) * v
  const a3 = angleBetween + Math.PI - u2 - (Math.PI - u2 - maxSpread) * v
  const a4 = angleBetween - Math.PI + u2 + (Math.PI - u2 - maxSpread) * v
  const [p1x, p1y] = pointOn(x1, y1, a1, r1)
  const [p2x, p2y] = pointOn(x1, y1, a2, r1)
  const [p3x, p3y] = pointOn(x2, y2, a3, r2)
  const [p4x, p4y] = pointOn(x2, y2, a4, r2)
  const handle = Math.min(2.6 * v, hypot(p1x - p3x, p1y - p3y) / (r1 + r2)) * Math.min(1, (d * 2) / (r1 + r2))
  const h1 = r1 * handle
  const h2 = r2 * handle
  const half = Math.PI / 2
  ctx.moveTo(p1x, p1y)
  ctx.bezierCurveTo(
    p1x + Math.cos(a1 - half) * h1,
    p1y + Math.sin(a1 - half) * h1,
    p3x + Math.cos(a3 + half) * h2,
    p3y + Math.sin(a3 + half) * h2,
    p3x,
    p3y,
  )
  ctx.lineTo(p4x, p4y)
  ctx.bezierCurveTo(
    p4x + Math.cos(a4 - half) * h2,
    p4y + Math.sin(a4 - half) * h2,
    p2x + Math.cos(a2 + half) * h1,
    p2y + Math.sin(a2 + half) * h1,
    p2x,
    p2y,
  )
  ctx.closePath()
  return true
}

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
  stretch: 0,
  angle: 0,
  phase: rand(0, Math.PI * 2),
  wobble: rand(0.7, 1.3),
  merging: false,
})

export const mountPlay = (root) => {
  if (!root) return { start() {}, stop() {} }

  const canvas = document.createElement('canvas')
  canvas.className = 'play-canvas'
  canvas.setAttribute('aria-hidden', 'true')

  const welcome = document.createElement('div')
  welcome.className = 'play-welcome'
  welcome.innerHTML = `
    <button type="button" class="play-start" aria-label="Play">
      <span class="play-start-blob">
        <span class="play-start-shape">
          <span class="play-start-label">play</span>
        </span>
      </span>
    </button>
  `

  const hint = document.createElement('p')
  hint.className = 'play-hint'
  hint.innerHTML = `
    <span class="play-hint--desktop">space — shoot</span>
    <span class="play-hint--mobile">tap — shoot</span>
  `

  root.replaceChildren(canvas, welcome, hint)
  const ctx = canvas.getContext('2d')
  const startBtn = welcome.querySelector('.play-start')
  const startBlob = welcome.querySelector('.play-start-blob')

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const pointer = { x: WORLD / 2, y: WORLD / 2, valid: false }
  const mouse = { x: 0, y: 0 }
  const startMagnet = { x: 0, y: 0 }
  const camera = { x: WORLD / 2, y: WORLD / 2, zoom: 1 }
  const tap = { id: null, t: 0, x: 0, y: 0 }

  let viewW = 1
  let viewH = 1
  let dpr = 1
  let running = false
  let playing = false
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

  const spawnPlayer = (at = null) => {
    cells = cells.filter((c) => c.owner !== PLAYER_OWNER)
    const pos = at
      ? { x: clamp(at.x, 180, WORLD - 180), y: clamp(at.y, 180, WORLD - 180) }
      : clearSpot(160)
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
    for (let i = 1; i <= AI_COUNT; i++) spawnAI(i)
    camera.x = WORLD / 2
    camera.y = WORLD / 2
    camera.zoom = 0.78
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
    const follow = cell.mergeAt > time ? 1.6 : cell.merging ? 0.9 : 5.5
    cell.vx = damp(cell.vx, ax, follow, dt)
    cell.vy = damp(cell.vy, ay, follow, dt)
    cell.x += cell.vx * dt
    cell.y += cell.vy * dt
    clampCell(cell)
  }

  const tickStretch = (cell, dt) => {
    if (reduceMotion) {
      cell.stretch = 0
      return
    }
    if (cell.merging) return
    const spd = hypot(cell.vx, cell.vy)
    const target = Math.min(0.42, (spd / 1000) * 0.36)
    cell.stretch = damp(cell.stretch, target, 8, dt)
    if (spd > 8) cell.angle = Math.atan2(cell.vy, cell.vx)
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

  const sameOwnerMergeReady = (a, b) =>
    a.owner === b.owner && time >= a.mergeAt && time >= b.mergeAt

  const tickMergePull = (dt) => {
    if (reduceMotion) {
      for (const cell of cells) cell.merging = false
      return
    }

    const sticky = new Set()
    for (let i = 0; i < cells.length; i++) {
      for (let j = i + 1; j < cells.length; j++) {
        const a = cells[i]
        const b = cells[j]
        if (!sameOwnerMergeReady(a, b)) continue
        const ra = radiusOf(a.mass)
        const rb = radiusOf(b.mass)
        const dx = b.x - a.x
        const dy = b.y - a.y
        const dist = hypot(dx, dy) || 0.001
        const hold = a.merging && b.merging
        if (dist > (ra + rb) * (hold ? 1.22 : MERGE_TOUCH)) continue

        sticky.add(a)
        sticky.add(b)
        const total = a.mass + b.mass
        const cx = (a.x * a.mass + b.x * b.mass) / total
        const cy = (a.y * a.mass + b.y * b.mass) / total
        const mx = (a.vx * a.mass + b.vx * b.mass) / total
        const my = (a.vy * a.mass + b.vy * b.mass) / total
        a.x = damp(a.x, cx, MERGE_PULL, dt)
        a.y = damp(a.y, cy, MERGE_PULL, dt)
        b.x = damp(b.x, cx, MERGE_PULL, dt)
        b.y = damp(b.y, cy, MERGE_PULL, dt)
        a.vx = damp(a.vx, mx, 3.2, dt)
        a.vy = damp(a.vy, my, 3.2, dt)
        b.vx = damp(b.vx, mx, 3.2, dt)
        b.vy = damp(b.vy, my, 3.2, dt)
        a.angle = Math.atan2(dy, dx)
        b.angle = a.angle
        const reach = clamp((dist / (ra + rb) - MERGE_FINISH) * 0.55, 0, 0.38)
        a.stretch = Math.max(a.stretch, reach)
        b.stretch = Math.max(b.stretch, reach)
        clampCell(a)
        clampCell(b)
      }
    }
    for (const cell of cells) cell.merging = sticky.has(cell)
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
          const minDist = (ra + rb) * 0.92
          const touching = dist <= (ra + rb) * MERGE_TOUCH
          const finishAt = Math.max(6, (ra + rb) * MERGE_FINISH)
          if (mergeReady && touching && (reduceMotion || dist < finishAt)) {
            const keep = a.mass >= b.mass ? a : b
            const drop = keep === a ? j : i
            const total = a.mass + b.mass
            keep.x = (a.x * a.mass + b.x * b.mass) / total
            keep.y = (a.y * a.mass + b.y * b.mass) / total
            keep.mass = total
            keep.vx = (a.vx * a.mass + b.vx * b.mass) / total
            keep.vy = (a.vy * a.mass + b.vy * b.mass) / total
            keep.merging = false
            cells.splice(drop, 1)
            return true
          }
          if (!mergeReady && dist < minDist) {
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
    if (playing && !ownerCells(PLAYER_OWNER).length) {
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
    const hasPlayer = ownerCells(PLAYER_OWNER).length > 0
    if (!playing && hasPlayer) return

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
    tickMergePull(dt)
    for (let n = 0; n < 8 && resolveMoving(); n++) {
      /* merge / eat can shift indices; repeat a few times */
    }

    for (const cell of cells) tickStretch(cell, dt)

    const follow = massCenter(ownerCells(PLAYER_OWNER))
    if (playing && follow.mass) {
      const camRate = reduceMotion ? 18 : 5.2
      camera.x = damp(camera.x, follow.x, camRate, dt)
      camera.y = damp(camera.y, follow.y, camRate, dt)
      const cover = Math.max(radiusOf(follow.mass) * 9.5, Math.min(viewW, viewH) * 0.42)
      const z = clamp(Math.min(viewW, viewH) / (cover * 2.15), 0.42, 1)
      camera.zoom = reduceMotion ? z : damp(camera.zoom, z, 2.4, dt)
    } else if (!playing) {
      const tx = WORLD / 2 + Math.sin(time * 0.08) * 520
      const ty = WORLD / 2 + Math.cos(time * 0.06) * 380
      const camRate = reduceMotion ? 0.8 : 0.55
      camera.x = damp(camera.x, tx, camRate, dt)
      camera.y = damp(camera.y, ty, camRate, dt)
      camera.zoom = damp(camera.zoom, 0.78, 1.2, dt)
    }
  }

  const tickStartMagnet = (dt) => {
    if (!startBlob) return
    let targetX = 0
    let targetY = 0
    const magnetOn = !playing && !reduceMotion && window.matchMedia('(hover: hover)').matches
    if (magnetOn) {
      const rect = startBlob.getBoundingClientRect()
      const cx = rect.left + rect.width / 2 - startMagnet.x
      const cy = rect.top + rect.height / 2 - startMagnet.y
      const dx = mouse.x - cx
      const dy = mouse.y - cy
      const dist = hypot(dx, dy) || 1
      const proximity = Math.max(0, 1 - dist / 220)
      const force = 12 * proximity * proximity
      targetX = (dx / dist) * force
      targetY = (dy / dist) * force
    }
    startMagnet.x = damp(startMagnet.x, targetX, 8, dt)
    startMagnet.y = damp(startMagnet.y, targetY, 8, dt)
    startBlob.style.setProperty('--magnet-x', `${startMagnet.x.toFixed(2)}px`)
    startBlob.style.setProperty('--magnet-y', `${startMagnet.y.toFixed(2)}px`)
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
    const r = radiusOf(cell.mass)
    const stretch = cell.stretch || 0
    ctx.save()
    ctx.translate(cell.x, cell.y)
    ctx.rotate(cell.angle || 0)
    ctx.scale(1 + stretch, 1 - stretch * 0.52)
    ctx.beginPath()
    ctx.arc(0, 0, r, 0, Math.PI * 2)
    ctx.fillStyle = cell.color
    ctx.fill()
    ctx.restore()
  }

  const drawMergeGoo = (a, b) => {
    const ra = radiusOf(a.mass)
    const rb = radiusOf(b.mass)
    ctx.fillStyle = a.color
    ctx.beginPath()
    ctx.arc(a.x, a.y, ra, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.arc(b.x, b.y, rb, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    if (metaballPath(ctx, a.x, a.y, ra, b.x, b.y, rb)) ctx.fill()
  }

  const drawEnemyArrows = () => {
    if (!playing) return
    const pad = 18
    const insetW = viewW / 2 - pad
    const insetH = viewH / 2 - pad
    const size = 5.25
    const seen = new Set()

    for (const cell of cells) {
      if (cell.owner === PLAYER_OWNER || seen.has(cell.owner)) continue
      seen.add(cell.owner)
      const group = massCenter(ownerCells(cell.owner))
      const sx = (group.x - camera.x) * camera.zoom
      const sy = (group.y - camera.y) * camera.zoom
      const r = radiusOf(group.mass) * camera.zoom
      if (Math.abs(sx) + r < viewW / 2 - 10 && Math.abs(sy) + r < viewH / 2 - 10) continue

      let t = Infinity
      if (sx !== 0) t = Math.min(t, insetW / Math.abs(sx))
      if (sy !== 0) t = Math.min(t, insetH / Math.abs(sy))
      if (!Number.isFinite(t) || t >= 1) continue

      ctx.save()
      ctx.translate(viewW / 2 + sx * t, viewH / 2 + sy * t)
      ctx.rotate(Math.atan2(sy, sx))
      ctx.beginPath()
      ctx.moveTo(-size * 0.4, -size * 0.72)
      ctx.lineTo(size * 0.58, 0)
      ctx.lineTo(-size * 0.4, size * 0.72)
      ctx.strokeStyle = cell.color
      ctx.globalAlpha = 0.34
      ctx.lineWidth = 1.2
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.stroke()
      ctx.restore()
    }
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

    const goo = new Set()
    const drawGroup = (group) => {
      for (let i = 0; i < group.length; i++) {
        for (let j = i + 1; j < group.length; j++) {
          const a = group[i]
          const b = group[j]
          if (!sameOwnerMergeReady(a, b)) continue
          const dist = hypot(b.x - a.x, b.y - a.y)
          const span = radiusOf(a.mass) + radiusOf(b.mass)
          if (dist > span * (a.merging && b.merging ? 1.24 : MERGE_TOUCH)) continue
          drawMergeGoo(a, b)
          goo.add(a)
          goo.add(b)
        }
      }
      for (const cell of group) {
        if (!goo.has(cell)) drawCell(cell)
      }
    }

    drawGroup(others)
    drawGroup(mine)

    ctx.restore()
    drawEnemyArrows()
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
    tickStartMagnet(dt)
    draw()
    rafId = requestAnimationFrame(tick)
  }

  const tryLaunch = () => {
    if (!playing || launchCool > 0) return
    const player = ownerCells(PLAYER_OWNER)
    if (!player.length) return
    const aim = pointer.valid ? pointer : massCenter(player)
    if (launchOwner(PLAYER_OWNER, aim.x, aim.y)) launchCool = 0.42
  }

  const onPointerMove = (e) => {
    if (!running) return
    mouse.x = e.clientX
    mouse.y = e.clientY
    if (playing) setPointer(e.clientX, e.clientY)
  }

  const onPointerDown = (e) => {
    if (!running || !playing) return
    if (e.target?.closest?.('button')) return
    setPointer(e.clientX, e.clientY)
    tap.id = e.pointerId
    tap.t = e.timeStamp
    tap.x = e.clientX
    tap.y = e.clientY
  }

  const onPointerUp = (e) => {
    if (!running || !playing || tap.id !== e.pointerId) return
    const dt = e.timeStamp - tap.t
    const dist = hypot(e.clientX - tap.x, e.clientY - tap.y)
    tap.id = null
    if (e.target?.closest?.('button')) return
    if (e.pointerType !== 'mouse' && dt <= TAP_MS && dist <= TAP_DIST) tryLaunch()
  }

  const onKeyDown = (e) => {
    if (!running || !playing) return
    if (e.code !== 'Space' && e.key !== ' ') return
    e.preventDefault()
    if (e.repeat) return
    tryLaunch()
  }

  const observer = new ResizeObserver(resize)

  const beginPlay = () => {
    if (!running || playing) return
    playing = true
    root.classList.add('is-playing')
    if (!ownerCells(PLAYER_OWNER).length) {
      spawnPlayer({ x: camera.x, y: camera.y })
    }
    startMagnet.x = 0
    startMagnet.y = 0
    startBlob?.style.setProperty('--magnet-x', '0px')
    startBlob?.style.setProperty('--magnet-y', '0px')
    startBtn?.blur()
    root.dispatchEvent(new Event('playchange', { bubbles: true }))
  }

  const pause = () => {
    if (!running || !playing) return
    playing = false
    root.classList.remove('is-playing')
    tap.id = null
    pointer.valid = false
    startMagnet.x = 0
    startMagnet.y = 0
    startBlob?.style.setProperty('--magnet-x', '0px')
    startBlob?.style.setProperty('--magnet-y', '0px')
    requestAnimationFrame(() => startBtn?.focus({ preventScroll: true }))
    root.dispatchEvent(new Event('playchange', { bubbles: true }))
  }

  const start = () => {
    if (running) return
    running = true
    playing = false
    root.classList.remove('is-playing')
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
    requestAnimationFrame(() => startBtn?.focus({ preventScroll: true }))
  }

  const stop = () => {
    if (!running) return
    running = false
    playing = false
    root.classList.remove('is-playing')
    cancelAnimationFrame(rafId)
    observer.disconnect()
    window.removeEventListener('pointermove', onPointerMove)
    window.removeEventListener('pointerdown', onPointerDown)
    window.removeEventListener('pointerup', onPointerUp)
    window.removeEventListener('pointercancel', onPointerUp)
    window.removeEventListener('keydown', onKeyDown)
    tap.id = null
    root.dispatchEvent(new Event('playchange', { bubbles: true }))
  }

  startBtn?.addEventListener('click', beginPlay)

  return { start, stop, pause }
}
