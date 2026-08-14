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

const navArrow = `
  <span class="nav-blob-shape">
    <svg class="nav-blob-arrow" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"
        d="M10 5l7 7-7 7"/>
    </svg>
  </span>
`

const app = document.querySelector('#app')

app.innerHTML = `
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
  <button type="button" class="nav-blob nav-blob--right" data-nav="work" aria-label="View work">
    ${navArrow}
  </button>
  <button type="button" class="nav-blob nav-blob--bottom" data-nav="about" aria-label="About">
    ${navArrow}
  </button>
  <button type="button" class="nav-blob nav-blob--left" data-nav="home" aria-label="Back to home">
    ${navArrow}
  </button>
  <button type="button" class="nav-blob nav-blob--top" data-nav="home" aria-label="Back to home">
    ${navArrow}
  </button>
  <div class="swipe-hints" aria-hidden="true">
    <p class="swipe-hints__set swipe-hints__set--home">
      <span>swipe left — work</span>
      <span>swipe up — about</span>
    </p>
    <p class="swipe-hints__set swipe-hints__set--work">
      <span>swipe right — home</span>
    </p>
    <p class="swipe-hints__set swipe-hints__set--about">
      <span>swipe down — home</span>
    </p>
  </div>
  <div class="stage">
    <section class="screen screen--home" aria-label="Home">
      <main class="hero">
        <h1 class="name">Kaleb Link</h1>
        <p class="title">web developer</p>
      </main>
    </section>
    <section class="screen screen--work" aria-labelledby="work-heading">
      <div class="screen-inner">
        <h2 id="work-heading" class="screen-title">Work</h2>
        <ul class="project-grid">
          <li class="project-card">
            <h3 class="project-name">Project one</h3>
            <p class="project-desc">A short line about this project.</p>
          </li>
          <li class="project-card">
            <h3 class="project-name">Project two</h3>
            <p class="project-desc">A short line about this project.</p>
          </li>
          <li class="project-card">
            <h3 class="project-name">Project three</h3>
            <p class="project-desc">A short line about this project.</p>
          </li>
        </ul>
      </div>
    </section>
    <section class="screen screen--about" aria-labelledby="about-heading">
      <div class="screen-inner">
        <h2 id="about-heading" class="screen-title">About</h2>
        <p class="about-bio">
          I’m a web developer who likes making interfaces that feel a little alive.
          More about me soon.
        </p>
        <h3 class="contact-heading">Contact</h3>
        <ul class="contact-list">
          <li><a href="mailto:contact@kaleblink.com">contact@kaleblink.com</a></li>
          <li><a target="_blank" rel="noopener noreferrer href="https://github.com/Ks-link">GitHub</a></li>
          <li><a target="_blank" rel="noopener noreferrer href="https://www.linkedin.com/in/kaleblink/">LinkedIn</a></li>
        </ul>
      </div>
    </section>
  </div>
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

const screens = new Set(['home', 'work', 'about'])

const screenFromHash = () => {
  const path = window.location.hash.replace(/^#\/?/, '').replace(/\/$/, '')
  return screens.has(path) ? path : 'home'
}

const hashForScreen = (screen) => (screen === 'home' ? '#/' : `#/${screen}`)

const setScreen = (screen, { push = false } = {}) => {
  if (!screens.has(screen)) screen = 'home'
  app.dataset.screen = screen
  const nextHash = hashForScreen(screen)
  if (window.location.hash !== nextHash) {
    if (push) history.pushState({ screen }, '', nextHash)
    else history.replaceState({ screen }, '', nextHash)
  }
}

document.querySelectorAll('.nav-blob').forEach((btn) => {
  btn.addEventListener('click', () => {
    setScreen(btn.dataset.nav, { push: true })
  })
})

window.addEventListener('popstate', () => {
  setScreen(screenFromHash())
})

setScreen(screenFromHash())

const swipeMq = window.matchMedia('(max-width: 48rem)')
const SWIPE_MIN = 56
const AXIS_LOCK = 10
const swipeRoutes = {
  home: { x: 'work', y: 'about' },
  work: { x: 'home' },
  about: { y: 'home' },
}

const aboutScreen = document.querySelector('.screen--about')

let swipeStart = null

const isInteractiveTarget = (el) => Boolean(el.closest?.('button'))

const aboutScrolledToTop = () => !aboutScreen || aboutScreen.scrollTop <= 1

const syncAboutPan = () => {
  aboutScreen?.classList.toggle('is-at-top', aboutScrolledToTop())
}

syncAboutPan()
aboutScreen?.addEventListener('scroll', syncAboutPan, { passive: true })

const setSwipeOffset = (x, y) => {
  app.style.setProperty('--swipe-x', `${x}px`)
  app.style.setProperty('--swipe-y', `${y}px`)
}

const resetSwipeOffset = () => {
  app.classList.remove('is-swiping')
  setSwipeOffset(0, 0)
}

const beginSwipe = (id, x, y, target) => {
  if (!swipeMq.matches || swipeStart) return
  if (isInteractiveTarget(target)) return
  swipeStart = {
    id,
    x,
    y,
    lastX: x,
    lastY: y,
    axis: null,
    atTop: aboutScrolledToTop(),
    claimed: false,
  }
}

const offsetForGesture = (dx, dy) => {
  const screen = app.dataset.screen || 'home'
  const { axis, atTop } = swipeStart
  if (screen === 'home' && axis === 'x' && dx < 0) return { x: dx, y: 0, claim: true }
  if (screen === 'home' && axis === 'y' && dy < 0) return { x: 0, y: dy, claim: true }
  if (screen === 'work' && axis === 'x' && dx > 0) return { x: dx, y: 0, claim: true }
  if (screen === 'about' && axis === 'y' && dy > 0 && atTop) return { x: 0, y: dy, claim: true }
  return { x: 0, y: 0, claim: false }
}

const moveSwipe = (id, x, y, preventDefault) => {
  if (!swipeStart || swipeStart.id !== id) return
  const dx = x - swipeStart.x
  const dy = y - swipeStart.y
  swipeStart.lastX = x
  swipeStart.lastY = y

  if (!swipeStart.axis) {
    if (Math.max(Math.abs(dx), Math.abs(dy)) < AXIS_LOCK) return
    swipeStart.axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y'
  }

  const screen = app.dataset.screen || 'home'
  if (screen === 'about' && swipeStart.axis === 'y' && dy < 0 && swipeStart.atTop) {
    aboutScreen.scrollTop = -dy
    return
  }

  const { x: ox, y: oy, claim } = offsetForGesture(dx, dy)
  if (!claim) return

  swipeStart.claimed = true
  preventDefault?.()
  app.classList.add('is-swiping')
  setSwipeOffset(ox, oy)
}

const endSwipe = (id) => {
  if (!swipeStart || swipeStart.id !== id) return
  const { x, y, lastX, lastY, axis, atTop, claimed } = swipeStart
  swipeStart = null

  const dx = lastX - x
  const dy = lastY - y
  const dist = axis === 'y' ? dy : dx
  const abs = Math.abs(dist)
  const screen = app.dataset.screen || 'home'
  const next = axis ? swipeRoutes[screen]?.[axis] : null
  const validDir =
    (screen === 'home' && axis === 'x' && dx < 0) ||
    (screen === 'home' && axis === 'y' && dy < 0) ||
    (screen === 'work' && axis === 'x' && dx > 0) ||
    (screen === 'about' && axis === 'y' && dy > 0 && atTop)

  app.classList.remove('is-swiping')

  if (claimed && validDir && abs >= SWIPE_MIN && next) {
    setSwipeOffset(0, 0)
    setScreen(next, { push: true })
    return
  }

  resetSwipeOffset()
}

const touchPoint = (e) => e.changedTouches[0]

app.addEventListener(
  'touchstart',
  (e) => {
    const t = touchPoint(e)
    beginSwipe(t.identifier, t.clientX, t.clientY, e.target)
  },
  { passive: true, capture: true },
)

app.addEventListener(
  'touchmove',
  (e) => {
    const t = touchPoint(e)
    moveSwipe(t.identifier, t.clientX, t.clientY, () => {
      if (e.cancelable) e.preventDefault()
    })
  },
  { passive: false, capture: true },
)

app.addEventListener(
  'touchend',
  (e) => {
    endSwipe(touchPoint(e).identifier)
  },
  { passive: true, capture: true },
)

app.addEventListener(
  'touchcancel',
  (e) => {
    endSwipe(touchPoint(e).identifier)
  },
  { passive: true, capture: true },
)

app.addEventListener('pointerdown', (e) => {
  if (e.pointerType === 'touch') return
  if (e.button !== 0) return
  beginSwipe(e.pointerId, e.clientX, e.clientY, e.target)
})

window.addEventListener('pointermove', (e) => {
  if (e.pointerType === 'touch') return
  moveSwipe(e.pointerId, e.clientX, e.clientY)
})

window.addEventListener('pointerup', (e) => {
  if (e.pointerType === 'touch') return
  endSwipe(e.pointerId)
})

window.addEventListener('pointercancel', (e) => {
  if (e.pointerType === 'touch') return
  endSwipe(e.pointerId)
})

const hero = document.querySelector('.hero')
const blobEls = [...document.querySelectorAll('.blob[data-blob]')]
const topCapEl = document.querySelector('[data-endcap="top"]')
const bottomCapEl = document.querySelector('[data-endcap="bottom"]')
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

const rand = (min, max) => min + Math.random() * (max - min)
const damp = (current, target, lambda, dt) =>
  current + (target - current) * (1 - Math.exp(-lambda * dt))

const ABSORB = 0.16
const OVERSCAN = 0.2

const createBlob = (el, index) => {
  const size = rand(0.07, 0.4)
  const lane = rand(0.18, 0.82)
  return {
    el,
    index,
    progress: rand(ABSORB + 0.06, 1 - ABSORB - 0.06),
    dir: Math.random() > 0.5 ? 1 : -1,
    lane,
    targetLane: lane,
    size,
    phase: rand(0, Math.PI * 2),
    speed: rand(0.01, 0.028),
    accel: rand(-0.012, 0.012),
    targetAccel: rand(-0.018, 0.02),
    accelChangeAt: rand(0.4, 2.5),
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
  top: { el: topCapEl, swell: 1, ripple: 0, x: 0, y: 0, w: 0, h: 0 },
  bottom: { el: bottomCapEl, swell: 1, ripple: 0, x: 0, y: 0, w: 0, h: 0 },
}

const sizePx = (blob) => Math.min(window.innerWidth, window.innerHeight) * blob.size

const nestAmount = (progress) => {
  if (progress < ABSORB) return progress / ABSORB
  if (progress > 1 - ABSORB) return (1 - progress) / ABSORB
  return 1
}

const progressToY = (progress, h) => {
  const pad = h * OVERSCAN
  return -pad + progress * (h + pad * 2)
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
  // Huge circles centered beyond the edges — only the inner skin shows
  const diameter = Math.max(w * 1.6, h * 0.9)

    ;[
      [endcaps.top, 0],
      [endcaps.bottom, 1],
    ].forEach(([cap, offset]) => {
      const size = diameter * cap.swell
      cap.w = size
      cap.h = size
      cap.x = w / 2 + Math.sin(t * 0.11 + offset * 2.1) * w * 0.02
      // Sit mostly outside; expose a soft curved membrane along the edge
      const inset = h * (0.045 + cap.ripple * 0.04)
      cap.y = offset === 0 ? -size / 2 + inset : h + size / 2 - inset

      const el = cap.el
      el.style.width = `${cap.w}px`
      el.style.height = `${cap.h}px`
      el.style.opacity = '1'
      const wave = Math.sin(t * 0.2 + offset) * 3 + Math.sin(t * 0.33 + offset * 1.4) * 2
      el.style.borderRadius = `${50 + wave * 0.15}%`
      el.style.transform = `translate3d(${(cap.x - cap.w / 2).toFixed(2)}px, ${(cap.y - cap.h / 2).toFixed(2)}px, 0)`
    })
}

const placeStaticBlobs = () => {
  endcaps.top.swell = 1
  endcaps.bottom.swell = 1
  endcaps.top.ripple = 0
  endcaps.bottom.ripple = 0
  layoutEndcaps()
  blobs.forEach((blob) => {
    syncBlobSize(blob)
    const s = sizePx(blob)
    const x = blob.lane * window.innerWidth - s / 2
    const y = progressToY(blob.progress, window.innerHeight) - s / 2
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
  const magnetReach = 150
  const magnetMax = 7
  const navMagnets = [...document.querySelectorAll('.nav-blob')].map((el) => ({
    el,
    x: 0,
    y: 0,
  }))

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

    const magnetOn = !swipeMq.matches
    navMagnets.forEach((item) => {
      let targetX = 0
      let targetY = 0
      if (magnetOn && getComputedStyle(item.el).visibility === 'visible') {
        const rect = item.el.getBoundingClientRect()
        const cx = rect.left + rect.width / 2 - item.x
        const cy = rect.top + rect.height / 2 - item.y
        const dx = mouseX - cx
        const dy = mouseY - cy
        const dist = Math.hypot(dx, dy) || 1
        const proximity = Math.max(0, 1 - dist / magnetReach)
        const force = magnetMax * proximity * proximity
        targetX = (dx / dist) * force
        targetY = (dy / dist) * force
      }
      item.x = damp(item.x, targetX, 8, dt)
      item.y = damp(item.y, targetY, 8, dt)
      item.el.style.setProperty('--magnet-x', `${item.x.toFixed(2)}px`)
      item.el.style.setProperty('--magnet-y', `${item.y.toFixed(2)}px`)
    })

    let topAbsorb = 0
    let bottomAbsorb = 0

    blobs.forEach((blob) => {
      if (t >= blob.accelChangeAt) {
        // Random acceleration bursts — some near-idle, some strong surges
        const surge = Math.random()
        if (surge < 0.2) {
          blob.targetAccel = rand(-0.004, 0.004)
        } else if (surge < 0.55) {
          blob.targetAccel = rand(-0.014, 0.016)
        } else {
          blob.targetAccel = rand(-0.028, 0.032)
        }
        blob.accelChangeAt = t + rand(0.8, 3.8)
      }

      blob.accel = damp(blob.accel, blob.targetAccel, 1.8, dt)
      blob.speed += blob.accel * dt
      blob.speed = Math.min(0.052, Math.max(0.004, blob.speed))
      blob.progress += blob.dir * blob.speed * dt

      if (blob.progress >= 1) {
        blob.progress = 1
        blob.dir = -1
        blob.targetLane = rand(0.22, 0.78)
        blob.speed = rand(0.008, 0.024)
        blob.targetAccel = rand(-0.02, 0.01)
        blob.accelChangeAt = t + rand(0.5, 2)
      } else if (blob.progress <= 0) {
        blob.progress = 0
        blob.dir = 1
        blob.targetLane = rand(0.22, 0.78)
        blob.speed = rand(0.008, 0.024)
        blob.targetAccel = rand(-0.01, 0.022)
        blob.accelChangeAt = t + rand(0.5, 2)
      }

      const nest = nestAmount(blob.progress)
      blob.nest = damp(blob.nest, nest, 3.2, dt)
      blob.lane = damp(blob.lane, blob.targetLane, 0.55, dt)

      const targetStretch =
        (blob.dir > 0 ? 1.1 : 0.9) + Math.sin(t * blob.wobble + blob.phase) * 0.05
      blob.stretch = damp(blob.stretch, targetStretch, 2.2, dt)

      const swayAmp = blob.sway * nest
      const swayX =
        Math.sin(t * (0.18 + blob.wobble * 0.12) + blob.phase) * swayAmp * w +
        Math.sin(t * 0.09 + blob.phase * 1.7) * swayAmp * 0.35 * w

      blob.x = blob.lane * w + swayX
      blob.y = progressToY(blob.progress, h)
      blob.attractX = 0
      blob.attractY = 0

      if (blob.progress < ABSORB) topAbsorb += 1 - nest
      if (blob.progress > 1 - ABSORB) bottomAbsorb += 1 - nest
    })

    // Membrane reacts like blob skin when absorbing / releasing
    endcaps.top.swell = damp(endcaps.top.swell, 1 + Math.min(0.12, topAbsorb * 0.05), 2.2, dt)
    endcaps.bottom.swell = damp(
      endcaps.bottom.swell,
      1 + Math.min(0.12, bottomAbsorb * 0.05),
      2.2,
      dt,
    )
    endcaps.top.ripple = damp(endcaps.top.ripple, Math.min(1, topAbsorb * 0.45), 3, dt)
    endcaps.bottom.ripple = damp(
      endcaps.bottom.ripple,
      Math.min(1, bottomAbsorb * 0.45),
      3,
      dt,
    )
    layoutEndcaps(t)

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

    // Merge into the edge membrane (outer blob layer)
    blobs.forEach((blob) => {
      const nest = blob.nest
      if (nest >= 0.999) return
      const flat = 1 - nest
      const cap = blob.progress < 0.5 ? endcaps.top : endcaps.bottom
      // Aim for the visible skin along the viewport edge
      const skinY = blob.progress < 0.5 ? h * 0.02 : h * 0.98
      blob.attractX += (cap.x - blob.x) * 0.03 * flat
      blob.attractY += (skinY - blob.y) * 0.07 * flat
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
      const flat = 1 - blob.nest
      const x = blob.x + blob.pushX - s / 2
      const y = blob.y + blob.pushY - s / 2
      const base = 0.96 + Math.sin(t * blob.wobble * 0.7 + blob.phase) * 0.04
      const scaleX = base * (1 + flat * 3.8)
      const scaleY = base * blob.stretch * (1 - flat * 0.88)
      const rx1 = 48 + Math.sin(t * 0.18 + i) * 10
      const rx2 = 52 + Math.cos(t * 0.16 + i) * 9
      const rx3 = 46 + Math.sin(t * 0.14 + i * 1.1) * 11
      const rx4 = 54 + Math.cos(t * 0.17 + i) * 8
      const atTop = blob.progress < 0.5

      blob.el.style.transformOrigin =
        flat > 0.02 ? (atTop ? '50% 0%' : '50% 100%') : '50% 50%'
      blob.el.style.borderRadius = `${rx1}% ${rx2}% ${rx3}% ${rx4}%`
      blob.el.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) scale(${scaleX.toFixed(3)}, ${Math.max(0.08, scaleY).toFixed(3)})`
    })

    rafId = requestAnimationFrame(tick)
  }

  rafId = requestAnimationFrame(tick)
  window.addEventListener('beforeunload', () => cancelAnimationFrame(rafId))
}
