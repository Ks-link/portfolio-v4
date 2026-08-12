import './style.css'

const sunIcon = `
  <svg class="theme-icon" viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="1.75"/>
    <path fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"
      d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.05 5.05l1.55 1.55M17.4 17.4l1.55 1.55M18.95 5.05l-1.55 1.55M6.6 17.4l-1.55 1.55"/>
  </svg>
`

const moonIcon = `
  <svg class="theme-icon" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"
      d="M19.5 13.4A7.5 7.5 0 0 1 10.6 4.5 7.6 7.6 0 1 0 19.5 13.4Z"/>
  </svg>
`

const BLOB_COUNT = 6

document.querySelector('#app').innerHTML = `
  <svg class="goo-svg" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <filter id="goo" color-interpolation-filters="sRGB">
        <feGaussianBlur in="SourceGraphic" stdDeviation="16" result="blur" />
        <feColorMatrix
          in="blur"
          mode="matrix"
          values="
            1 0 0 0 0
            0 1 0 0 0
            0 0 1 0 0
            0 0 0 28 -12"
          result="goo"
        />
      </filter>
    </defs>
  </svg>
  <div class="blobs" aria-hidden="true">
    <span class="blob blob--endcap" data-endcap="top"></span>
    <span class="blob blob--endcap" data-endcap="bottom"></span>
    ${Array.from({ length: BLOB_COUNT }, (_, i) => `<span class="blob" data-blob="${i}"></span>`).join('')}
  </div>
  <button type="button" class="theme-toggle" aria-label="Toggle dark mode">
    ${moonIcon}
  </button>
  <main class="hero">
    <h1 class="name">Kaleb Link</h1>
    <p class="title">web developer</p>
  </main>
`

const root = document.documentElement
const toggle = document.querySelector('.theme-toggle')

const getPreferredTheme = () => {
  const stored = localStorage.getItem('theme')
  if (stored === 'light' || stored === 'dark') return stored
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

const applyTheme = (theme) => {
  root.setAttribute('data-theme', theme)
  localStorage.setItem('theme', theme)
  const isDark = theme === 'dark'
  toggle.innerHTML = isDark ? sunIcon : moonIcon
  toggle.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode')
}

applyTheme(getPreferredTheme())

toggle.addEventListener('click', () => {
  const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'
  applyTheme(next)
})

const hero = document.querySelector('.hero')
const blobEls = [...document.querySelectorAll('.blob[data-blob]')]
const topCapEl = document.querySelector('[data-endcap="top"]')
const bottomCapEl = document.querySelector('[data-endcap="bottom"]')
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

const rand = (min, max) => min + Math.random() * (max - min)
const damp = (current, target, lambda, dt) =>
  current + (target - current) * (1 - Math.exp(-lambda * dt))

const ABSORB = 0.2

const createBlob = (el, index) => {
  const size = rand(0.07, 0.4)
  const lane = rand(0.18, 0.82)
  return {
    el,
    index,
    // 0 at top pool, 1 at bottom pool
    progress: rand(ABSORB, 1 - ABSORB),
    dir: Math.random() > 0.5 ? 1 : -1,
    lane,
    targetLane: lane,
    size,
    phase: rand(0, Math.PI * 2),
    riseSpeed: rand(0.012, 0.028),
    sway: rand(0.03, 0.08),
    wobble: rand(0.15, 0.4),
    stretch: 1,
    nest: 1,
    x: 0,
    y: 0,
    pushX: 0,
    pushY: 0,
    attractX: 0,
    attractY: 0,
  }
}

const blobs = blobEls.map((el, i) => createBlob(el, i))

const endcaps = {
  top: { el: topCapEl, swell: 1, x: 0, y: 0, w: 0, h: 0 },
  bottom: { el: bottomCapEl, swell: 1, x: 0, y: 0, w: 0, h: 0 },
}

const sizePx = (blob) => Math.min(window.innerWidth, window.innerHeight) * blob.size

const nestAmount = (progress) => {
  if (progress < ABSORB) return progress / ABSORB
  if (progress > 1 - ABSORB) return (1 - progress) / ABSORB
  return 1
}

const syncBlobSize = (blob) => {
  const s = sizePx(blob)
  blob.el.style.width = `${s}px`
  blob.el.style.height = `${s}px`
  blob.el.style.opacity = '1'
}

const layoutEndcaps = (t = 0) => {
  const w = window.innerWidth
  const h = window.innerHeight
  const capW = w * 1.25
  const capH = h * 0.28

  endcaps.top.w = capW
  endcaps.top.h = capH * endcaps.top.swell
  endcaps.top.x = w / 2
  endcaps.top.y = h * 0.02

  endcaps.bottom.w = capW
  endcaps.bottom.h = capH * endcaps.bottom.swell
  endcaps.bottom.x = w / 2
  endcaps.bottom.y = h * 0.98

  ;[
    [endcaps.top, 0],
    [endcaps.bottom, 1],
  ].forEach(([cap, offset]) => {
    const el = cap.el
    el.style.width = `${cap.w}px`
    el.style.height = `${cap.h}px`
    const rx = 46 + Math.sin(t * 0.12 + offset) * 6
    el.style.borderRadius = `${rx}%`
    el.style.transform = `translate3d(${(cap.x - cap.w / 2).toFixed(2)}px, ${(cap.y - cap.h / 2).toFixed(2)}px, 0)`
  })
}

const placeStaticBlobs = () => {
  endcaps.top.swell = 1
  endcaps.bottom.swell = 1
  layoutEndcaps()
  blobs.forEach((blob) => {
    syncBlobSize(blob)
    const s = sizePx(blob)
    const x = blob.lane * window.innerWidth - s / 2
    const y = blob.progress * window.innerHeight - s / 2
    blob.el.style.transform = `translate(${x}px, ${y}px)`
  })
}

if (reduceMotion) {
  placeStaticBlobs()
  window.addEventListener('resize', placeStaticBlobs)
} else {
  let mouseX = window.innerWidth / 2
  let mouseY = window.innerHeight / 2
  let heroTargetX = 0
  let heroTargetY = 0
  let heroX = 0
  let heroY = 0
  let rafId = 0
  let last = performance.now()

  const heroMaxOffset = 8
  const heroReach = 220
  const blobReach = 260
  const blobPush = 40
  const mergeRadius = 180
  const attractStrength = 12

  blobs.forEach(syncBlobSize)
  layoutEndcaps()

  window.addEventListener('pointermove', (e) => {
    mouseX = e.clientX
    mouseY = e.clientY

    const cx = window.innerWidth / 2
    const cy = window.innerHeight / 2
    const dx = mouseX - cx
    const dy = mouseY - cy
    const dist = Math.hypot(dx, dy) || 1
    const proximity = Math.max(0, 1 - dist / heroReach)
    const force = heroMaxOffset * proximity * proximity
    heroTargetX = (-dx / dist) * force
    heroTargetY = (-dy / dist) * force
  })

  window.addEventListener('resize', () => {
    blobs.forEach(syncBlobSize)
    layoutEndcaps()
  })

  const tick = (now) => {
    const dt = Math.min(0.05, (now - last) / 1000)
    last = now
    const t = now / 1000
    const h = window.innerHeight
    const w = window.innerWidth

    heroX = damp(heroX, heroTargetX, 6, dt)
    heroY = damp(heroY, heroTargetY, 6, dt)
    if (hero) {
      hero.style.transform = `translate(${heroX.toFixed(2)}px, ${heroY.toFixed(2)}px)`
    }

    let topAbsorb = 0
    let bottomAbsorb = 0

    // Vertical lava travel + pull into endcaps near edges
    blobs.forEach((blob) => {
      blob.progress += blob.dir * blob.riseSpeed * dt

      if (blob.progress >= 1) {
        blob.progress = 1
        blob.dir = -1
        blob.targetLane = rand(0.22, 0.78)
        blob.riseSpeed = rand(0.012, 0.028)
      } else if (blob.progress <= 0) {
        blob.progress = 0
        blob.dir = 1
        blob.targetLane = rand(0.22, 0.78)
        blob.riseSpeed = rand(0.012, 0.028)
      }

      const nest = nestAmount(blob.progress)
      blob.nest = damp(blob.nest, nest, 3.2, dt)

      // Drift toward pool center while being absorbed / emerging
      const edgePull = 1 - nest
      if (edgePull > 0) {
        blob.targetLane = damp(blob.targetLane, 0.5, 1.8 * edgePull, dt)
      }

      blob.lane = damp(blob.lane, blob.targetLane, 0.55, dt)

      const targetStretch =
        (blob.dir > 0 ? 1.1 : 0.9) + Math.sin(t * blob.wobble + blob.phase) * 0.05
      blob.stretch = damp(blob.stretch, targetStretch, 2.2, dt)

      const swayAmp = blob.sway * nest
      const swayX =
        Math.sin(t * (0.18 + blob.wobble * 0.12) + blob.phase) * swayAmp * w +
        Math.sin(t * 0.09 + blob.phase * 1.7) * swayAmp * 0.35 * w

      blob.x = blob.lane * w + swayX
      // Keep motion within the open column between pools
      blob.y = blob.progress * h
      blob.attractX = 0
      blob.attractY = 0

      if (blob.progress < ABSORB) topAbsorb += 1 - nest
      if (blob.progress > 1 - ABSORB) bottomAbsorb += 1 - nest
    })

    endcaps.top.swell = damp(endcaps.top.swell, 1 + Math.min(0.22, topAbsorb * 0.08), 2.4, dt)
    endcaps.bottom.swell = damp(
      endcaps.bottom.swell,
      1 + Math.min(0.22, bottomAbsorb * 0.08),
      2.4,
      dt,
    )
    layoutEndcaps(t)

    // Soft attraction so blobs can merge, then drift apart
    for (let i = 0; i < blobs.length; i++) {
      for (let j = i + 1; j < blobs.length; j++) {
        const a = blobs[i]
        const b = blobs[j]
        const dx = b.x - a.x
        const dy = b.y - a.y
        const dist = Math.hypot(dx, dy) || 1
        const minDist = (sizePx(a) + sizePx(b)) * 0.35

        if (dist < mergeRadius && dist > minDist) {
          const pull = (1 - dist / mergeRadius) * attractStrength
          const nx = dx / dist
          const ny = dy / dist
          a.attractX += nx * pull
          a.attractY += ny * pull
          b.attractX -= nx * pull
          b.attractY -= ny * pull
        } else if (dist <= minDist) {
          const push = (1 - dist / minDist) * attractStrength * 0.5
          const nx = dx / dist
          const ny = dy / dist
          a.attractX -= nx * push
          a.attractY -= ny * push
          b.attractX += nx * push
          b.attractY += ny * push
        }
      }
    }

    // Pull floating blobs into the nearest endcap as they arrive
    blobs.forEach((blob) => {
      const nest = blob.nest
      if (nest >= 0.999) return
      const cap = blob.progress < 0.5 ? endcaps.top : endcaps.bottom
      const dx = cap.x - blob.x
      const dy = cap.y - blob.y
      const pull = (1 - nest) * 28
      blob.attractX += dx * 0.04 * pull
      blob.attractY += dy * 0.05 * pull
    })

    blobs.forEach((blob, i) => {
      const dx = mouseX - blob.x
      const dy = mouseY - blob.y
      const dist = Math.hypot(dx, dy) || 1
      const proximity = Math.max(0, 1 - dist / blobReach) * blob.nest
      const force = blobPush * proximity * proximity
      const targetPushX = (-dx / dist) * force + blob.attractX
      const targetPushY = (-dy / dist) * force + blob.attractY
      blob.pushX = damp(blob.pushX, targetPushX, 3.5, dt)
      blob.pushY = damp(blob.pushY, targetPushY, 3.5, dt)

      const s = sizePx(blob)
      const x = blob.x + blob.pushX - s / 2
      const y = blob.y + blob.pushY - s / 2
      // Shrink into the pool instead of fading out
      const absorbScale = 0.18 + blob.nest * 0.82
      const scale =
        (0.96 + Math.sin(t * blob.wobble * 0.7 + blob.phase) * 0.04) * absorbScale
      const rx1 = 48 + Math.sin(t * 0.18 + i) * 10
      const rx2 = 52 + Math.cos(t * 0.16 + i) * 9
      const rx3 = 46 + Math.sin(t * 0.14 + i * 1.1) * 11
      const rx4 = 54 + Math.cos(t * 0.17 + i) * 8

      blob.el.style.borderRadius = `${rx1}% ${rx2}% ${rx3}% ${rx4}%`
      blob.el.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) scale(${scale.toFixed(3)}, ${(scale * blob.stretch).toFixed(3)})`
    })

    rafId = requestAnimationFrame(tick)
  }

  rafId = requestAnimationFrame(tick)
  window.addEventListener('beforeunload', () => cancelAnimationFrame(rafId))
}
