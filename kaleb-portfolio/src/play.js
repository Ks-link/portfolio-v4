import {
  LEADERBOARD_SIZE,
  NAME_PATTERN,
  sanitizeName,
  scoreQualifies,
  subscribeTop10,
  submitScore,
} from './leaderboard.js'

const GRID = 88
const WORLD = GRID * 48
const FOOD_COUNT = 1600
const FOOD_MASS = 1.15
const START_MASS = 42
const MIN_SPLIT_MASS = 36
const MAX_CELLS = 8
const EAT_RATIO = 1.15
const MERGE_DELAY = 10
const MERGE_TOUCH = 1.02
const MERGE_FINISH = 0.24
const MERGE_PULL = 1.25
const MERGE_SEEK = 24
const LAUNCH_SPEED = 960
const AI_COUNT = 7
const PLAYER_OWNER = 0
const RESPAWN_WAIT = 1.15
const AI_RESPAWN_WAIT = 2.2
const TAP_MS = 280
const TAP_DIST = 16
const STICK_RADIUS = 52
const STICK_DEAD = 0.12
const STICK_ZONE = 0.45
const STICK_AIM = 2400
const SHOOT_CORNER = 150
const AI_HUNT_RANGE = 520
const AI_FLEE_PAD = 180
const AI_DANGER_PAD = 80
const AI_FLEE_STEP = 420
const AI_LAUNCH_NEAR = 90
const AI_LAUNCH_FAR = 340
const AI_LAUNCH_THREAT_PAD = 140

const AI_COLORS = ['#5c8f76', '#c45c5c', '#5c7ec4', '#a56bb8', '#c49a4a', '#4aa3b5']

const escapeHtml = (value) =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')

const rand = (min, max) => min + Math.random() * (max - min)
const clamp = (n, min, max) => Math.min(max, Math.max(min, n))
const hypot = Math.hypot
const damp = (current, target, lambda, dt) =>
  current + (target - current) * (1 - Math.exp(-lambda * dt))

const wrapAngle = (a) => {
  while (a > Math.PI) a -= Math.PI * 2
  while (a < -Math.PI) a += Math.PI * 2
  return a
}

const dampAngle = (current, target, lambda, dt) => {
  const diff = wrapAngle(target - current)
  return wrapAngle(current + diff * (1 - Math.exp(-lambda * dt)))
}

const radiusOf = (mass) => Math.sqrt(Math.max(mass, 0.2)) * 4.15
const speedOf = (mass) => 620 / Math.pow(mass + 28, 0.38)

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
  if (!root) return { start() {}, stop() {}, pause() {}, kill() {} }

  const canvas = document.createElement('canvas')
  canvas.className = 'play-canvas'
  canvas.setAttribute('aria-hidden', 'true')

  const welcome = document.createElement('div')
  welcome.className = 'play-welcome'
  welcome.innerHTML = `
    <div class="play-leaderboard-wrap">
      <ol class="play-leaderboard" aria-label="Global leaderboard"></ol>
      <svg class="play-leaderboard-chevron" viewBox="0 0 24 24" aria-hidden="true">
        <path fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" d="M10 5l7 7-7 7"/>
      </svg>
    </div>
    <button type="button" class="play-start" aria-label="Play">
      <span class="play-start-blob">
        <span class="play-start-shape">
          <span class="play-start-label">play</span>
        </span>
      </span>
    </button>
    <form class="play-name-prompt">
      <p class="play-name-prompt-title">new high score <span class="play-name-prompt-score">0</span></p>
      <label class="play-name-field">
        <span class="play-name-field-label">name</span>
        <input
          class="play-name-input"
          type="text"
          maxlength="9"
          pattern="[A-Za-z0-9]+"
          autocomplete="off"
          autocapitalize="off"
          spellcheck="false"
          inputmode="text"
          aria-label="Leaderboard name"
        />
      </label>
      <div class="play-name-actions">
        <button type="submit" class="play-name-save">save</button>
        <button type="button" class="play-name-skip">skip</button>
      </div>
    </form>
  `

  const hint = document.createElement('p')
  hint.className = 'play-hint'
  hint.innerHTML = `
    <span class="play-hint--desktop">space — shoot</span>
  `

  const hud = document.createElement('div')
  hud.className = 'play-hud'
  hud.innerHTML = `
    <button type="button" class="play-shoot" aria-label="Shoot">
      <span class="play-shoot-shape">
        <span class="play-shoot-label">shoot</span>
      </span>
    </button>
    <div class="play-stick" hidden>
      <span class="play-stick-base"></span>
      <span class="play-stick-thumb"></span>
    </div>
  `

  const stats = document.createElement('p')
  stats.className = 'play-stats'
  stats.innerHTML = `
    <span class="play-stats-score">score 0</span>
    <span class="play-stats-kills">kills 0</span>
  `

  root.replaceChildren(canvas, welcome, hint, stats, hud)
  const ctx = canvas.getContext('2d')
  const startBtn = welcome.querySelector('.play-start')
  const startBlob = welcome.querySelector('.play-start-blob')
  const boardWrap = welcome.querySelector('.play-leaderboard-wrap')
  const boardEl = welcome.querySelector('.play-leaderboard')
  const nameForm = welcome.querySelector('.play-name-prompt')
  const nameInput = welcome.querySelector('.play-name-input')
  const nameScoreEl = welcome.querySelector('.play-name-prompt-score')
  const nameSkip = welcome.querySelector('.play-name-skip')
  const shootBtn = hud.querySelector('.play-shoot')
  const stickEl = hud.querySelector('.play-stick')
  const stickThumb = hud.querySelector('.play-stick-thumb')
  const statsScore = stats.querySelector('.play-stats-score')
  const statsKills = stats.querySelector('.play-stats-kills')

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const hoverNone = window.matchMedia('(hover: none)')
  const isMobileHud = () => hoverNone.matches
  const pointer = { x: WORLD / 2, y: WORLD / 2, valid: false }
  const mouse = { x: 0, y: 0 }
  const startMagnet = { x: 0, y: 0 }
  const camera = { x: WORLD / 2, y: WORLD / 2, zoom: 1 }
  const tap = { id: null, t: 0, x: 0, y: 0 }
  const stick = { id: null, ox: 0, oy: 0, nx: 0, ny: 0, mag: 0, lastNx: 1, lastNy: 0 }
  const heading = { angle: 0, alpha: 0 }

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
  let kills = 0
  let peakScore = 0
  let boardEntries = []
  let pendingNameScore = 0
  let unsubBoard = null
  let naming = false

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

  const localPoint = (clientX, clientY) => {
    const rect = root.getBoundingClientRect()
    return { x: clientX - rect.left, y: clientY - rect.top }
  }

  const hideStick = () => {
    stick.id = null
    stick.nx = 0
    stick.ny = 0
    stick.mag = 0
    stickEl.hidden = true
    stickThumb.style.transform = ''
  }

  const moveStick = (clientX, clientY) => {
    const p = localPoint(clientX, clientY)
    const dx = p.x - stick.ox
    const dy = p.y - stick.oy
    const dist = hypot(dx, dy)
    const clamped = Math.min(dist, STICK_RADIUS)
    const ux = dist > 0.001 ? dx / dist : 0
    const uy = dist > 0.001 ? dy / dist : 0
    stickThumb.style.transform = `translate(${ux * clamped}px, ${uy * clamped}px)`
    const raw = clamped / STICK_RADIUS
    if (raw < STICK_DEAD) {
      stick.nx = 0
      stick.ny = 0
      stick.mag = 0
      return
    }
    stick.nx = ux
    stick.ny = uy
    stick.mag = (raw - STICK_DEAD) / (1 - STICK_DEAD)
    stick.lastNx = ux
    stick.lastNy = uy
  }

  const showStick = (clientX, clientY) => {
    const p = localPoint(clientX, clientY)
    stick.ox = p.x
    stick.oy = p.y
    stickEl.hidden = false
    stickEl.style.left = `${p.x}px`
    stickEl.style.top = `${p.y}px`
    moveStick(clientX, clientY)
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
    const palette = [theme.accent, ...AI_COLORS]
    food.push({
      x: rand(24, WORLD - 24),
      y: rand(24, WORLD - 24),
      mass: FOOD_MASS,
      phase: rand(0, Math.PI * 2),
      color: palette[Math.floor(Math.random() * palette.length)],
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
    kills = 0
    peakScore = Math.round(START_MASS)
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
    kills = 0
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

  const steerCell = (cell, tx, ty, dt, speedScale = 1) => {
    const dx = tx - cell.x
    const dy = ty - cell.y
    const dist = hypot(dx, dy) || 1
    const max = speedOf(cell.mass) * speedScale
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
    const lastOfOwner = prey.owner !== eater.owner && ownerCells(prey.owner).length === 1
    eater.mass += prey.mass
    cells.splice(preyIndex, 1)
    if (lastOfOwner && eater.owner === PLAYER_OWNER) kills += 1
  }

  const syncStats = () => {
    const mass = Math.round(massCenter(ownerCells(PLAYER_OWNER)).mass)
    if (mass > peakScore) peakScore = mass
    statsScore.textContent = `score ${mass}`
    statsKills.textContent = `kills ${kills}`
  }

  const sameOwnerMergeReady = (a, b) =>
    a.owner === b.owner && time >= a.mergeAt && time >= b.mergeAt

  const tickMergePull = (dt) => {
    if (reduceMotion) {
      for (const cell of cells) cell.merging = false
      return
    }

    const groups = new Map()
    for (const cell of cells) {
      const pack = groups.get(cell.owner)
      if (pack) pack.push(cell)
      else groups.set(cell.owner, [cell])
    }
    for (const pack of groups.values()) {
      if (pack.length < 2) continue
      const com = massCenter(pack)
      for (const cell of pack) {
        const dx = com.x - cell.x
        const dy = com.y - cell.y
        const dist = hypot(dx, dy)
        if (dist < 8) continue
        const step = Math.min(dist, MERGE_SEEK * dt)
        const nx = dx / dist
        const ny = dy / dist
        cell.x += nx * step
        cell.y += ny * step
        cell.vx += nx * MERGE_SEEK * dt
        cell.vy += ny * MERGE_SEEK * dt
        clampCell(cell)
      }
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

  const thinkAI = (cell) => {
    if (!cell) return null
    const myR = radiusOf(cell.mass)
    const threats = []
    const preyList = []

    for (const other of cells) {
      if (other.owner === cell.owner) continue
      const dist = hypot(other.x - cell.x, other.y - cell.y)
      if (other.mass > cell.mass * EAT_RATIO) threats.push({ cell: other, dist })
      else if (cell.mass > other.mass * EAT_RATIO) preyList.push({ cell: other, dist })
    }

    let nearestThreat = null
    let nearestThreatDist = Infinity
    for (const item of threats) {
      if (item.dist < nearestThreatDist) {
        nearestThreat = item.cell
        nearestThreatDist = item.dist
      }
    }

    let prey = null
    let preyDist = Infinity
    let preyScore = Infinity
    for (const item of preyList) {
      if (item.dist > AI_HUNT_RANGE) continue
      let isolation = Infinity
      for (const danger of threats) {
        const gap = hypot(danger.cell.x - item.cell.x, danger.cell.y - item.cell.y)
        if (gap < isolation) isolation = gap
      }
      const score = item.dist - Math.min(isolation, 320) * 0.55
      if (score < preyScore) {
        prey = item.cell
        preyDist = item.dist
        preyScore = score
      }
    }

    const imminent =
      nearestThreat &&
      nearestThreatDist < radiusOf(nearestThreat.mass) + myR + AI_DANGER_PAD
    const canHunt =
      prey && preyDist < AI_HUNT_RANGE && (!imminent || preyDist < nearestThreatDist)
    if (canHunt) return { x: prey.x, y: prey.y, hunt: prey }

    const fleeRange = nearestThreat ? radiusOf(nearestThreat.mass) + myR + AI_FLEE_PAD : 0
    if (nearestThreat && nearestThreatDist < fleeRange) {
      let fx = 0
      let fy = 0
      for (const item of threats) {
        const range = radiusOf(item.cell.mass) + myR + AI_FLEE_PAD
        if (item.dist > range) continue
        const away = hypot(cell.x - item.cell.x, cell.y - item.cell.y) || 1
        const weight = ((range - item.dist) / range) * item.cell.mass
        fx += ((cell.x - item.cell.x) / away) * weight
        fy += ((cell.y - item.cell.y) / away) * weight
      }
      let dist = hypot(fx, fy)
      if (dist < 0.001) {
        fx = cell.x - nearestThreat.x
        fy = cell.y - nearestThreat.y
        dist = hypot(fx, fy) || 1
      }
      return {
        x: cell.x + (fx / dist) * AI_FLEE_STEP,
        y: cell.y + (fy / dist) * AI_FLEE_STEP,
        hunt: null,
      }
    }

    let pellet = null
    let pelletDist = Infinity
    for (const item of food) {
      const dist = hypot(item.x - cell.x, item.y - cell.y)
      if (dist < pelletDist) {
        pellet = item
        pelletDist = dist
      }
    }
    if (pellet) return { x: pellet.x, y: pellet.y, hunt: null }

    return {
      x: cell.x + Math.cos(time * 0.2 + cell.owner) * 200,
      y: cell.y + Math.sin(time * 0.17 + cell.owner) * 200,
      hunt: null,
    }
  }

  const splitWouldBeSafe = (cell, hunt, half) => {
    const halfR = radiusOf(half)
    for (const other of cells) {
      if (other === hunt || other.owner === cell.owner) continue
      if (other.mass <= half * EAT_RATIO) continue
      const reach = radiusOf(other.mass) + halfR + AI_LAUNCH_THREAT_PAD
      if (hypot(other.x - cell.x, other.y - cell.y) < reach) return false
      if (hypot(other.x - hunt.x, other.y - hunt.y) < reach) return false
    }
    return true
  }

  const maybeAILaunch = (cell, goal) => {
    if (!goal?.hunt) return
    const cool = aiLaunchCool.get(cell.owner) ?? 0
    if (cool > 0) return
    if (cell.mass < MIN_SPLIT_MASS * 1.15) return
    const hunt = goal.hunt
    const half = cell.mass / 2
    if (half <= hunt.mass * EAT_RATIO) return
    if (!splitWouldBeSafe(cell, hunt, half)) return
    const dist = hypot(hunt.x - cell.x, hunt.y - cell.y)
    const reach = radiusOf(cell.mass) + AI_LAUNCH_NEAR
    if (dist < reach || dist > AI_LAUNCH_FAR) return
    if (splitCell(cell, hunt.x - cell.x, hunt.y - cell.y)) {
      aiLaunchCool.set(cell.owner, 3.5 + Math.random() * 2.5)
    }
  }

  const maintainPop = (dt) => {
    if (playing && !ownerCells(PLAYER_OWNER).length) {
      if (!playerRespawnAt) {
        const finalPeak = peakScore
        if (scoreQualifies(finalPeak, boardEntries)) {
          showNamePrompt(finalPeak)
          pause()
        } else {
          playerRespawnAt = time + RESPAWN_WAIT
        }
      } else if (time >= playerRespawnAt) spawnPlayer()
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
    const useStick = playing && isMobileHud()

    for (const cell of player) {
      cell.color = theme.accent
      if (useStick) {
        if (stick.mag > 0) {
          steerCell(cell, cell.x + stick.nx * STICK_AIM, cell.y + stick.ny * STICK_AIM, dt, stick.mag)
        } else {
          steerCell(cell, cell.x, cell.y, dt, 0)
        }
      } else {
        steerCell(cell, aimX, aimY, dt)
      }
    }

    for (let owner = 1; owner <= AI_COUNT; owner++) {
      for (const cell of ownerCells(owner)) {
        const goal = thinkAI(cell)
        if (!goal) continue
        maybeAILaunch(cell, goal)
        steerCell(cell, goal.x, goal.y, dt)
      }
    }

    eatFood()
    tickMergePull(dt)
    for (let n = 0; n < 8 && resolveMoving(); n++) {
      /* merge / eat can shift indices; repeat a few times */
    }

    for (const cell of cells) tickStretch(cell, dt)
    tickMoveHeading(dt, player)

    const follow = massCenter(ownerCells(PLAYER_OWNER))
    if (playing && follow.mass) {
      const camRate = reduceMotion ? 18 : 5.2
      camera.x = damp(camera.x, follow.x, camRate, dt)
      camera.y = damp(camera.y, follow.y, camRate, dt)
      const landscape = viewW > viewH && isMobileHud()
      const coverFloor = landscape ? 0.58 : 0.42
      const zMin = landscape ? 0.32 : 0.42
      const cover = Math.max(radiusOf(follow.mass) * 9.5, Math.min(viewW, viewH) * coverFloor)
      const z = clamp(Math.min(viewW, viewH) / (cover * 2.15), zMin, 1)
      camera.zoom = reduceMotion ? z : damp(camera.zoom, z, 2.4, dt)
    } else if (!playing) {
      const tx = WORLD / 2 + Math.sin(time * 0.08) * 520
      const ty = WORLD / 2 + Math.cos(time * 0.06) * 380
      const camRate = reduceMotion ? 0.8 : 0.55
      camera.x = damp(camera.x, tx, camRate, dt)
      camera.y = damp(camera.y, ty, camRate, dt)
      camera.zoom = damp(camera.zoom, 0.78, 1.2, dt)
    }

    if (playing) syncStats()
  }

  const tickStartMagnet = (dt) => {
    if (!startBlob) return
    let targetX = 0
    let targetY = 0
    const magnetOn = !playing && !naming && !reduceMotion && window.matchMedia('(hover: hover)').matches
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
    ctx.fillStyle = item.color || theme.accent
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

  const drawCrownIcon = (size) => {
    const s = size
    ctx.beginPath()
    ctx.moveTo(-s * 0.5, -s * 0.3)
    ctx.lineTo(-s * 0.35, s * 0.24)
    ctx.lineTo(s * 0.35, s * 0.24)
    ctx.lineTo(s * 0.5, -s * 0.3)
    ctx.lineTo(s * 0.25, -s * 0.1)
    ctx.lineTo(0, -s * 0.48)
    ctx.lineTo(-s * 0.25, -s * 0.1)
    ctx.closePath()
    ctx.fill()
    ctx.fillRect(-s * 0.32, s * 0.3, s * 0.64, s * 0.1)
  }

  const heaviestCell = () => {
    let best = null
    for (const cell of cells) {
      if (!best || cell.mass > best.mass) best = cell
    }
    return best
  }

  const drawLeaderCrown = (cell) => {
    if (!cell) return
    const r = radiusOf(cell.mass)
    const size = Math.max(6, r * 0.34)
    ctx.save()
    ctx.translate(cell.x, cell.y)
    ctx.globalAlpha = 0.78
    ctx.fillStyle = theme.bg
    drawCrownIcon(size)
    ctx.restore()
  }

  const tickMoveHeading = (dt, player) => {
    const steering = playing && isMobileHud() && stick.mag > 0 && player.length
    if (steering) {
      const target = Math.atan2(stick.ny, stick.nx)
      if (heading.alpha < 0.05) heading.angle = target
      else heading.angle = dampAngle(heading.angle, target, 16, dt)
      heading.alpha = damp(heading.alpha, 1, 14, dt)
      return
    }
    heading.alpha = damp(heading.alpha, 0, 12, dt)
    if (heading.alpha < 0.01) heading.alpha = 0
  }

  const drawHeadingChevron = (color) => {
    const size = 3.6 / camera.zoom
    ctx.beginPath()
    ctx.moveTo(-size * 0.22, -size * 0.62)
    ctx.lineTo(size * 0.38, 0)
    ctx.lineTo(-size * 0.22, size * 0.62)
    ctx.strokeStyle = color
    ctx.lineWidth = 1.05 / camera.zoom
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.stroke()
  }

  const drawMoveHeading = () => {
    if (heading.alpha < 0.02) return
    const player = ownerCells(PLAYER_OWNER)
    if (!player.length) return
    ctx.save()
    ctx.globalAlpha = 0.82 * heading.alpha
    for (const blob of player) {
      const r = radiusOf(blob.mass)
      const orbit = r * (1 + (blob.stretch || 0)) + 7 / camera.zoom
      ctx.save()
      ctx.translate(
        blob.x + Math.cos(heading.angle) * orbit,
        blob.y + Math.sin(heading.angle) * orbit,
      )
      ctx.rotate(heading.angle)
      drawHeadingChevron(blob.color)
      ctx.restore()
    }
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

  const drawEnemyArrows = (leader) => {
    if (!playing) return
    const pad = 18
    const insetW = viewW / 2 - pad
    const insetH = viewH / 2 - pad
    const size = 5.25
    const seen = new Set()
    const leaderOwner = leader && leader.owner !== PLAYER_OWNER ? leader.owner : null

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
      ctx.globalAlpha = 0.42
      if (cell.owner === leaderOwner) {
        ctx.fillStyle = cell.color
        ctx.globalAlpha = 0.85
        drawCrownIcon(16)
      } else {
        ctx.rotate(Math.atan2(sy, sx))
        ctx.beginPath()
        ctx.moveTo(-size * 0.4, -size * 0.72)
        ctx.lineTo(size * 0.58, 0)
        ctx.lineTo(-size * 0.4, size * 0.72)
        ctx.strokeStyle = cell.color
        ctx.lineWidth = 1.2
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
        ctx.stroke()
      }
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

    const leader = heaviestCell()
    if (playing) drawLeaderCrown(leader)
    drawMoveHeading()

    ctx.restore()
    drawEnemyArrows(leader)
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

  const shootAim = (player) => {
    if (!isMobileHud()) return pointer.valid ? pointer : massCenter(player)
    let nx = stick.mag > 0 ? stick.nx : stick.lastNx
    let ny = stick.mag > 0 ? stick.ny : stick.lastNy
    if (hypot(nx, ny) < 0.01) {
      const biggest = player.reduce((a, b) => (a.mass >= b.mass ? a : b))
      const v = hypot(biggest.vx, biggest.vy)
      if (v > 8) {
        nx = biggest.vx / v
        ny = biggest.vy / v
      } else {
        nx = 1
        ny = 0
      }
    }
    const center = massCenter(player)
    return { x: center.x + nx * 400, y: center.y + ny * 400 }
  }

  const tryLaunch = () => {
    if (!playing || launchCool > 0) return
    const player = ownerCells(PLAYER_OWNER)
    if (!player.length) return
    const aim = shootAim(player)
    if (launchOwner(PLAYER_OWNER, aim.x, aim.y)) launchCool = 0.42
  }

  const onPointerMove = (e) => {
    if (!running) return
    mouse.x = e.clientX
    mouse.y = e.clientY
    if (playing && isMobileHud()) {
      if (stick.id === e.pointerId) moveStick(e.clientX, e.clientY)
      return
    }
    if (playing) setPointer(e.clientX, e.clientY)
  }

  const inShootCorner = (p) =>
    p.x <= Math.min(SHOOT_CORNER, viewW * 0.34) &&
    p.y >= viewH - Math.min(SHOOT_CORNER, viewH * 0.34)

  const flashShoot = () => {
    if (!shootBtn) return
    shootBtn.classList.add('is-pressed')
    window.setTimeout(() => shootBtn.classList.remove('is-pressed'), 140)
  }

  const onPointerDown = (e) => {
    if (!running || !playing) return
    if (e.target?.closest?.('button')) return
    if (isMobileHud()) {
      const p = localPoint(e.clientX, e.clientY)
      if (inShootCorner(p)) {
        flashShoot()
        tryLaunch()
        return
      }
      if (p.x < viewW * STICK_ZONE || stick.id != null) return
      stick.id = e.pointerId
      showStick(e.clientX, e.clientY)
      return
    }
    setPointer(e.clientX, e.clientY)
    tap.id = e.pointerId
    tap.t = e.timeStamp
    tap.x = e.clientX
    tap.y = e.clientY
  }

  const onPointerUp = (e) => {
    if (!running || !playing) return
    if (isMobileHud()) {
      if (stick.id === e.pointerId) hideStick()
      return
    }
    if (tap.id !== e.pointerId) return
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

  const syncBoardChevron = () => {
    boardWrap?.classList.toggle('is-scrolled', (boardEl?.scrollTop ?? 0) > 1)
  }

  const renderBoard = (entries) => {
    boardEntries = entries
    if (!boardEl) return
    const rows = []
    for (let i = 0; i < LEADERBOARD_SIZE; i++) {
      const entry = entries[i]
      if (entry) {
        rows.push(
          `<li><span class="play-leaderboard-rank">${i + 1}</span><span class="play-leaderboard-name">${escapeHtml(entry.name)}</span><span class="play-leaderboard-score">${entry.score}</span></li>`,
        )
      } else {
        rows.push(
          `<li class="is-empty"><span class="play-leaderboard-rank">${i + 1}</span><span class="play-leaderboard-name">—</span><span class="play-leaderboard-score"></span></li>`,
        )
      }
    }
    boardEl.innerHTML = rows.join('')
    syncBoardChevron()
  }

  const showNamePrompt = (score) => {
    naming = true
    pendingNameScore = score
    welcome.classList.add('is-naming')
    if (nameScoreEl) nameScoreEl.textContent = String(Math.round(score))
    if (nameInput) nameInput.value = ''
  }

  const hideNamePrompt = () => {
    naming = false
    pendingNameScore = 0
    welcome.classList.remove('is-naming')
    if (nameInput) nameInput.value = ''
  }

  const beginPlay = () => {
    if (!running || playing || naming) return
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
    hideStick()
    heading.alpha = 0
    pointer.valid = false
    startMagnet.x = 0
    startMagnet.y = 0
    startBlob?.style.setProperty('--magnet-x', '0px')
    startBlob?.style.setProperty('--magnet-y', '0px')
    requestAnimationFrame(() => {
      if (naming) nameInput?.focus({ preventScroll: true })
      else startBtn?.focus({ preventScroll: true })
    })
    root.dispatchEvent(new Event('playchange', { bubbles: true }))
  }

  const kill = () => {
    if (!running || !playing) return
    if (!ownerCells(PLAYER_OWNER).length) return
    cells = cells.filter((c) => c.owner !== PLAYER_OWNER)
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
    renderBoard(boardEntries)
    unsubBoard = subscribeTop10(renderBoard, () => renderBoard(boardEntries))
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
    unsubBoard?.()
    unsubBoard = null
    hideNamePrompt()
    tap.id = null
    hideStick()
    heading.alpha = 0
    root.dispatchEvent(new Event('playchange', { bubbles: true }))
  }

  boardEl?.addEventListener('scroll', syncBoardChevron, { passive: true })
  startBtn?.addEventListener('click', beginPlay)
  nameInput?.addEventListener('input', () => {
    const caret = nameInput.selectionStart
    const next = sanitizeName(nameInput.value)
    if (nameInput.value !== next) {
      nameInput.value = next
      const pos = Math.min(caret ?? next.length, next.length)
      nameInput.setSelectionRange(pos, pos)
    }
  })
  nameForm?.addEventListener('submit', async (e) => {
    e.preventDefault()
    const name = sanitizeName(nameInput?.value)
    if (!NAME_PATTERN.test(name) || !pendingNameScore) return
    const score = pendingNameScore
    try {
      await submitScore(name, score)
      hideNamePrompt()
      requestAnimationFrame(() => startBtn?.focus({ preventScroll: true }))
    } catch {
      nameInput?.focus({ preventScroll: true })
    }
  })
  nameSkip?.addEventListener('click', () => {
    hideNamePrompt()
    requestAnimationFrame(() => startBtn?.focus({ preventScroll: true }))
  })
  shootBtn?.addEventListener('pointerdown', (e) => {
    e.preventDefault()
    e.stopPropagation()
    tryLaunch()
  })

  return { start, stop, pause, kill }
}
