import './style.css'
import { mountPlay } from './play.js'

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

const homeIcon = `
  <svg class="theme-icon" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="currentColor" fill-rule="evenodd"
      d="M12.03125 1.5A1.0001 1.0001 0 0 0 11.492188 1.6386719L1.9921875 7.2265625A1.0001 1.0001 0 1 0 3 8.953125L3 20A1.0001 1.0001 0 0 0 4 21L20 21A1.0001 1.0001 0 0 0 21 20L21 8.953125A1.0001 1.0001 0 1 0 22.007812 7.2265625L12.507812 1.6386719A1.0001 1.0001 0 0 0 12.03125 1.5zM12 3.6601562L19 7.7773438L19 19L16 19L16 12A1.0001 1.0001 0 0 0 15 11L9 11A1.0001 1.0001 0 0 0 8 12L8 19L5 19L5 7.7773438L12 3.6601562zM10 13L14 13L14 19L10 19L10 13z"/>
  </svg>
`

const killIcon = `
  <svg class="theme-icon" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="currentColor"
      d="M6.75 5.5A1.25 1.25 0 0 0 5.5 6.75v10.5A1.25 1.25 0 0 0 6.75 18.5h10.5A1.25 1.25 0 0 0 18.5 17.25V6.75A1.25 1.25 0 0 0 17.25 5.5z"/>
  </svg>
`

const lavaLampOnIcon = `
  <svg class="theme-icon" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="currentColor"
      d="M8.55 2.5a1.2 1.2 0 0 1 1.2-1.2h4.5a1.2 1.2 0 0 1 0 2.4h-4.5a1.2 1.2 0 0 1-1.2-1.2z"/>
    <path fill="currentColor" fill-rule="evenodd"
      d="M9.5 4.15h5L16.95 15.2H7.05z
         M12.85 7.55a.95 .95 0 1 0 1.9 0a.95 .95 0 1 0-1.9 0z
         M8.85 11.35c.85-.7 2.55-.55 3.55.25.7.55.7 1.4 0 1.75-1.05.55-2.7.3-3.45-.5-.55-.55-.6-1-.1-1.5z"/>
    <path fill="currentColor"
      d="M7.2 16.4h9.6l-2.05 2.45 2.7 3.9H6.55l2.7-3.9z"/>
  </svg>
`

const lavaLampOffIcon = `
  <svg class="theme-icon" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="currentColor"
      d="M8.55 2.5a1.2 1.2 0 0 1 1.2-1.2h4.5a1.2 1.2 0 0 1 0 2.4h-4.5a1.2 1.2 0 0 1-1.2-1.2z"/>
    <path fill="currentColor"
      d="M9.5 4.15h5L16.95 15.2H7.05z"/>
    <path fill="currentColor"
      d="M7.2 16.4h9.6l-2.05 2.45 2.7 3.9H6.55l2.7-3.9z"/>
  </svg>
`

const BLOB_COUNT = 6
const UNDERLINE_POINTS = 40

const projects = [
  {
    id: 'dirtbuster',
    name: 'The Dirt Buster',
    url: 'https://thedirtbuster.com/',
    tags: ['WordPress', 'SEO', 'PHP', 'HTML', 'CSS', 'Email', 'Google Workspace'],
    summary: 'A WordPress site for a local cleaning business.',
    description:
      'A sleek WordPress build for an established cleaning company in Campbell River. Features a custom theme and local SEO optimization to boost visibility on the web.',
    image: '/projects/dirtbuster.jpg',
    preview: '/projects/dirtbuster-logo.png',
    alt: 'Homepage of The Dirt Buster, a Campbell River carpet cleaning site.',
    previewAlt: 'The Dirt Buster logo',
  },
  {
    id: 'tile-wars',
    name: 'Tile Wars',
    url: '/library/tile-wars/',
    livePreview: false,
    linkText: 'Play game',
    tags: ['JavaScript', 'HTML', 'CSS'],
    summary: 'A two-player browser game built with vanilla JavaScript.',
    description:
      'A local two-player browser game built with vanilla JavaScript, HTML, and CSS. Players move only on tiles they own, shoot to claim new ground, and cancel each other\'s bullets mid-air. I built the grid engine, player movement, collision detection, and game mechanics from scratch. There are customizable grid sizes, colour themes, and keyboard controls for both players on one machine. It\'s pretty fun, give it a try.',
    image: '/projects/tile-wars-gameplay.gif',
    preview: '/projects/tile-wars-preview.gif',
    alt: 'Gameplay of Tile Wars, a two-player territory-shooting browser game.',
    previewAlt: 'Animated Tile Wars gameplay on a yellow and purple grid',
  },
]

const projectById = new Map(projects.map((project) => [project.id, project]))

const underlineSvg = `
  <svg class="project-underline" viewBox="0 0 100 16" preserveAspectRatio="none" aria-hidden="true">
    <path class="project-underline-path" d="M 0 8 L 100 8" fill="none" stroke="currentColor"
      stroke-width="1" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>
  </svg>
`

const projectArrow = `
  <span class="project-desc-arrow-track" aria-hidden="true">
    <svg class="project-desc-arrow" viewBox="0 0 24 24">
      <path fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"
        d="M10 5l7 7-7 7"/>
    </svg>
  </span>
`

const projectCardsHtml = projects
  .map(
    (project) => `
          <li class="project-card">
            <a class="project-link" href="#/work/${project.id}" data-project="${project.id}">
              <h3 class="project-name">${project.name}</h3>
              <p class="project-desc">
                <span class="project-desc-row">
                  <span class="project-desc-text">${project.summary}</span>
                  ${projectArrow}
                </span>
                ${underlineSvg}
              </p>
            </a>
          </li>`,
  )
  .join('')

const navArrow = `
  <span class="nav-blob-shape">
    <svg class="nav-blob-arrow" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"
        d="M10 5l7 7-7 7"/>
    </svg>
    <span class="nav-blob-label" aria-hidden="true"></span>
  </span>
`

const swipeChevron = (dir) => `
  <svg class="swipe-hints__chevron swipe-hints__chevron--${dir}" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"
      d="M8.5 5l7 7-7 7"/>
  </svg>
`

const swipeDir = (dir, to, label) => `
  <button type="button" class="swipe-hints__dir swipe-hints__dir--${dir}" data-to="${to}">
    ${swipeChevron(dir)}
    <span class="swipe-hints__label">${label}</span>
  </button>
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
  <div class="blob-cursor" aria-hidden="true">
    <span class="blob-cursor-motion">
      <span class="blob-cursor-shape"></span>
    </span>
  </div>
  <div class="blobs" aria-hidden="true">
    <span class="blob blob--endcap" data-endcap="top"></span>
    <span class="blob blob--endcap" data-endcap="bottom"></span>
    ${Array.from({ length: BLOB_COUNT }, (_, i) => `<span class="blob" data-blob="${i}"></span>`).join('')}
  </div>
  <div class="corner-cluster">
    <button type="button" class="corner-btn home-toggle" aria-label="Home">
      ${homeIcon}
    </button>
    <button type="button" class="corner-btn kill-toggle" aria-label="Die">
      ${killIcon}
    </button>
  </div>
  <div class="corner-cluster corner-cluster--right">
    <button type="button" class="corner-btn blobs-toggle" aria-label="Stop creating blobs" aria-pressed="true">
      ${lavaLampOnIcon}
    </button>
    <button type="button" class="corner-btn theme-toggle" aria-label="Toggle dark mode">
      ${moonIcon}
    </button>
  </div>
  <button type="button" class="nav-blob nav-blob--right" data-edge="right" aria-label="View work">
    ${navArrow}
  </button>
  <button type="button" class="nav-blob nav-blob--bottom" data-edge="bottom" aria-label="About">
    ${navArrow}
  </button>
  <button type="button" class="nav-blob nav-blob--left" data-edge="left" aria-label="Back to home">
    ${navArrow}
  </button>
  <button type="button" class="nav-blob nav-blob--top" data-edge="top" aria-label="Back to home">
    ${navArrow}
  </button>
  <nav class="swipe-hints">
    <div class="swipe-hints__set swipe-hints__set--play">
      ${swipeDir('right', 'home', 'home')}
    </div>
    <div class="swipe-hints__set swipe-hints__set--home">
      ${swipeDir('left', 'play', 'play')}
      ${swipeDir('down', 'about', 'about')}
      ${swipeDir('right', 'work', 'work')}
    </div>
    <div class="swipe-hints__set swipe-hints__set--work">
      ${swipeDir('left', 'home', 'home')}
      ${swipeDir('down', 'experience', 'experience')}
    </div>
    <div class="swipe-hints__set swipe-hints__set--work-detail">
      ${swipeDir('left', 'work', 'work')}
      ${swipeDir('down', 'experience', 'experience')}
    </div>
    <div class="swipe-hints__set swipe-hints__set--about">
      ${swipeDir('up', 'home', 'home')}
      ${swipeDir('down', 'contact', 'contact')}
      ${swipeDir('right', 'experience', 'experience')}
    </div>
    <div class="swipe-hints__set swipe-hints__set--experience">
      ${swipeDir('left', 'about', 'about')}
      ${swipeDir('up', 'work', 'work')}
    </div>
    <div class="swipe-hints__set swipe-hints__set--contact">
      ${swipeDir('up', 'about', 'about')}
    </div>
  </nav>
  <div class="stage">
    <section class="screen screen--play" aria-label="Play">
      <div class="play-root"></div>
    </section>
    <section class="screen screen--home" aria-label="Home">
      <main class="hero">
        <h1 class="name">Kaleb Link</h1>
        <div class="hero-meta">
          <p class="title">web developer</p>
        </div>
      </main>
    </section>
    <section class="screen screen--work" aria-labelledby="work-heading">
      <div class="work-panes">
        <div class="work-pane work-list">
          <div class="screen-inner">
            <p class="work-kicker">SOME</p>
            <h2 id="work-heading" class="screen-title">Work</h2>
            <ul class="project-grid">
              ${projectCardsHtml}
            </ul>
          </div>
        </div>
        <div class="work-pane work-detail" aria-hidden="true">
          <div class="screen-inner">
            <button type="button" class="work-back" aria-label="Back to work">Work</button>
            <h2 id="work-detail-heading" class="screen-title work-detail-title"></h2>
            <ul class="work-detail-tags" hidden></ul>
            <p class="work-detail-desc"></p>
            <a class="work-detail-link" hidden target="_blank" rel="noopener noreferrer">Visit site</a>
            <div class="work-detail-frame">
              <div class="work-detail-live" hidden>
                <iframe
                  class="work-detail-live-frame"
                  title=""
                  loading="lazy"
                  referrerpolicy="no-referrer"
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
                ></iframe>
              </div>
              <button type="button" class="work-detail-live-arm" hidden>
                <span class="work-detail-live-arm-blob">
                  <span class="work-detail-live-arm-shape">
                    <span class="work-detail-live-arm-label">
                      <span>check</span>
                      <span>it out</span>
                    </span>
                  </span>
                </span>
              </button>
              <img
                class="work-detail-frame-img"
                src="/profile.jpg"
                alt=""
                width="1024"
                height="697"
                decoding="async"
                draggable="false"
              />
              <svg class="work-detail-frame-border" aria-hidden="true">
                <path class="work-detail-frame-path" fill="currentColor" fill-rule="evenodd"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
      <div class="project-preview" aria-hidden="true">
        <span class="project-preview-shape">
          <img class="project-preview-img" src="/profile.jpg" alt="" width="460" height="460" decoding="async" draggable="false" />
        </span>
      </div>
    </section>
    <section class="screen screen--about" aria-labelledby="about-heading">
        <div class="screen-inner about-layout">
          <h2 id="about-heading" class="screen-title">About</h2>
          <p class="about-bio">
            Hey there, I'm Kaleb  👋  
            <br>I'm a web developer based in Abbotsford, BC.
          </p>
          <div class="profile-blob">
            <span class="profile-blob-shape" role="button" tabindex="0" aria-label="Split portrait">
              <img
                class="profile-blob-img"
                src="/profile.jpg"
                alt="Portrait of Kaleb Link"
                width="460"
                height="460"
                decoding="async"
                draggable="false"
              />
            </span>
            <span class="profile-blob-shape profile-blob-shape--small profile-blob-shape--moon" role="button" tabindex="0" aria-label="Split fishing photo">
              <img
                class="profile-blob-img"
                src="/about-fish.jpg"
                alt="Kaleb on a boat holding a salmon"
                width="460"
                height="460"
                decoding="async"
                draggable="false"
              />
            </span>
            <span class="profile-blob-shape profile-blob-shape--small profile-blob-shape--moon" role="button" tabindex="0" aria-label="Split drums photo">
              <img
                class="profile-blob-img"
                src="/about-drums.jpg"
                alt="Kaleb playing drums"
                width="460"
                height="460"
                decoding="async"
                draggable="false"
              />
            </span>
          </div>
        </div>
    </section>
    <section class="screen screen--contact" aria-labelledby="contact-heading">
      <div class="screen-inner contact-layout">
        <h2 id="contact-heading" class="screen-title">Get In Touch</h2>
        <ul class="contact-list">
          <li>
            <a href="mailto:contact@kaleblink.com">
              <span class="contact-list__label">Email</span>
              <span class="contact-list__detail">contact@kaleblink.com</span>
              ${projectArrow}
            </a>
          </li>
          <li>
            <a target="_blank" rel="noopener noreferrer" href="https://github.com/Ks-link">
              <span class="contact-list__label">GitHub</span>
              <span class="contact-list__detail">Ks-link</span>
              ${projectArrow}
            </a>
          </li>
          <li>
            <a target="_blank" rel="noopener noreferrer" href="https://www.linkedin.com/in/kaleblink/">
              <span class="contact-list__label">LinkedIn</span>
              <span class="contact-list__detail">kaleblink</span>
              ${projectArrow}
            </a>
          </li>
        </ul>
        <div class="contact-form-wrap">
          <form class="contact-form">
            <input type="checkbox" name="botcheck" class="contact-form__honeypot" tabindex="-1" autocomplete="off" aria-hidden="true" />
            <input type="hidden" name="subject" value="Portfolio contact" />
            <div class="contact-form__field">
              <label for="contact-name">Name</label>
              <input id="contact-name" name="name" type="text" required maxlength="100" autocomplete="name" />
            </div>
            <div class="contact-form__field">
              <label for="contact-email">Email</label>
              <input id="contact-email" name="email" type="email" required maxlength="254" autocomplete="email" inputmode="email" />
            </div>
            <div class="contact-form__field contact-form__field--message">
              <label for="contact-message">How can I help</label>
              <textarea id="contact-message" name="message" rows="5" required maxlength="2000"></textarea>
            </div>
            <button type="submit" class="contact-form__submit">Send message</button>
            <p class="contact-form__status" role="status" aria-live="polite" hidden></p>
          </form>
          <svg class="contact-form-chevron" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" d="M10 5l7 7-7 7"/>
          </svg>
        </div>
      </div>
    </section>
    <section class="screen screen--experience" aria-labelledby="experience-heading">
      <div class="screen-inner">
        <h2 id="experience-heading" class="screen-title">Experience</h2>
        <ul class="experience-list">
          <li class="experience-card">
            <h3 class="experience-role">Lead Web Developer</h3>
            <p class="experience-meta">Stoney Hill Marketing · 2026 - Present</p>
            <p class="experience-desc">
              Building high-yield sites with practical technologies and helping businesses grow online.
            </p>
          </li>
          <li class="experience-card">
            <h3 class="experience-role">Web Developer</h3>
            <p class="experience-meta">JM Web Design · 2025 - 2026</p>
            <p class="experience-desc">
              Custom websites, SEO, and branding for Vancouver Island clients.
            </p>
          </li>
          <li class="experience-card">
            <h3 class="experience-role">Freelance Web Developer</h3>
            <p class="experience-meta">Link Web Design · 2024 - 2025</p>
            <p class="experience-desc">
              Focused on user friendly design, SEO, and measurable results.
            </p>
          </li>
        </ul>
      </div>
    </section>
  </div>
`

const play = mountPlay(document.querySelector('.play-root'))
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

window.AnalyticsConsent?.mountBanner(app, { injectStyles: false })

toggle.addEventListener('click', () => {
  const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'
  applyTheme(next)
})

const blobsToggle = document.querySelector('.blobs-toggle')
const homeToggle = document.querySelector('.home-toggle')
const killToggle = document.querySelector('.kill-toggle')

const getPreferredBlobs = () => {
  const stored = localStorage.getItem('blobSpawn')
  if (stored === 'off' || stored === 'on') return stored
  return 'on'
}

const applyBlobs = (state) => {
  const on = state !== 'off'
  app.dataset.blobs = on ? 'on' : 'off'
  localStorage.setItem('blobSpawn', on ? 'on' : 'off')
  blobsToggle.innerHTML = on ? lavaLampOnIcon : lavaLampOffIcon
  blobsToggle.setAttribute('aria-label', on ? 'Stop creating blobs' : 'Start creating blobs')
  blobsToggle.setAttribute('aria-pressed', on ? 'true' : 'false')
  blobsToggle.classList.toggle('is-off', !on)
}

applyBlobs(getPreferredBlobs())

blobsToggle.addEventListener('click', () => {
  applyBlobs(app.dataset.blobs === 'off' ? 'on' : 'off')
})

const screens = new Set(['play', 'home', 'work', 'about', 'experience', 'contact'])
const hoverPreviewMq = window.matchMedia('(hover: hover)')

const workScreen = document.querySelector('.screen--work')
const workListEl = document.querySelector('.work-list')
const workDetailEl = document.querySelector('.work-detail')
const workBack = document.querySelector('.work-back')
const projectPreview = document.querySelector('.project-preview')
const projectPreviewImg = document.querySelector('.project-preview-img')
const projectLinks = [...document.querySelectorAll('.project-link')]
const PREVIEW_WIDTH = 1280
const projectLive = {
  wrap: document.querySelector('.work-detail-frame'),
  live: document.querySelector('.work-detail-live'),
  iframe: document.querySelector('.work-detail-live-frame'),
  arm: document.querySelector('.work-detail-live-arm'),
  blob: document.querySelector('.work-detail-live-arm-blob'),
  magnet: { x: 0, y: 0 },
}

const syncPreviewScale = () => {
  const live = projectLive.live
  if (!live || live.hidden) return
  const width = live.clientWidth
  if (width < 1) return
  live.style.setProperty('--preview-scale', String(width / PREVIEW_WIDTH))
}

const disarmLivePreview = () => {
  projectLive.wrap?.classList.remove('is-armed')
  if (projectLive.arm && projectLive.live && !projectLive.live.hidden) {
    projectLive.arm.hidden = false
  }
}

const teardownLivePreview = () => {
  disarmLivePreview()
  projectLive.wrap?.classList.remove('is-live', 'is-armed')
  if (projectLive.live) projectLive.live.hidden = true
  if (projectLive.arm) projectLive.arm.hidden = true
  projectLive.magnet.x = 0
  projectLive.magnet.y = 0
  projectLive.blob?.style.setProperty('--magnet-x', '0px')
  projectLive.blob?.style.setProperty('--magnet-y', '0px')
  if (projectLive.iframe) {
    projectLive.iframe.removeAttribute('title')
    projectLive.iframe.src = 'about:blank'
  }
}

const setupLivePreview = (project) => {
  if (
    !project?.url ||
    project.livePreview === false ||
    !projectLive.live ||
    !projectLive.iframe ||
    !projectLive.arm
  ) {
    teardownLivePreview()
    return
  }

  projectLive.wrap?.classList.add('is-live')
  projectLive.wrap?.classList.remove('is-armed')
  projectLive.live.hidden = false
  projectLive.arm.hidden = false
  projectLive.iframe.title = `Live preview of ${project.name}`
  if (projectLive.iframe.getAttribute('src') !== project.url) {
    projectLive.iframe.src = project.url
  }
  syncPreviewScale()
}

const parseHash = () => {
  const path = window.location.hash.replace(/^#\/?/, '').replace(/\/$/, '')
  if (!path) return { screen: 'home', project: '' }
  const [screenPart, projectPart] = path.split('/')
  const screen = screens.has(screenPart) ? screenPart : 'home'
  const project =
    screen === 'work' && projectPart && projectById.has(projectPart) ? projectPart : ''
  return { screen, project }
}

const hashForRoute = (screen, project = '') => {
  if (screen === 'home') return '#/'
  if (screen === 'work' && project) return `#/work/${project}`
  return `#/${screen}`
}

const edgeNav = {
  play: { right: 'home' },
  home: { left: 'play', right: 'work', bottom: 'about' },
  work: { left: 'home', bottom: 'experience' },
  about: { top: 'home', right: 'experience', bottom: 'contact' },
  experience: { left: 'about', top: 'work' },
  contact: { top: 'about' },
}

const ariaForDest = (dest) => {
  if (dest === 'home') return 'Back to home'
  if (dest === 'play') return 'Play'
  if (dest === 'work') return 'View work'
  if (dest === 'about') return 'About'
  if (dest === 'experience') return 'Experience'
  if (dest === 'contact') return 'Get In Touch'
  return dest
}

const navBlobs = [...document.querySelectorAll('.nav-blob')]
const routeEffects = {
  syncScroll: () => { },
  syncCursor: () => { },
}
document.querySelector('.play-root')?.addEventListener('playchange', () => {
  routeEffects.syncCursor()
})

const syncNavLabels = (screen, project = '') => {
  navBlobs.forEach((btn) => {
    const labelEl = btn.querySelector('.nav-blob-label')
    if (screen === 'work' && project && btn.dataset.edge === 'left') {
      btn.setAttribute('aria-label', 'Back to work')
      if (labelEl) labelEl.textContent = 'work'
      return
    }
    const dest = edgeNav[screen]?.[btn.dataset.edge]
    if (!dest) return
    btn.setAttribute('aria-label', ariaForDest(dest))
    if (labelEl) labelEl.textContent = dest
  })
}

const hideProjectPreview = () => {
  projectPreview?.classList.remove('is-visible')
  projectPreview?.setAttribute('aria-hidden', 'true')
}

const showProjectPreview = (project) => {
  if (!projectPreview || !projectPreviewImg) return
  const src = project.preview || project.image
  if (projectPreviewImg.getAttribute('src') !== src) {
    projectPreviewImg.src = src
  }
  projectPreviewImg.alt = project.previewAlt || project.alt
  projectPreview.classList.add('is-visible')
  projectPreview.setAttribute('aria-hidden', 'false')
}

const canHoverPreview = () =>
  hoverPreviewMq.matches && app.dataset.screen === 'work' && !app.dataset.project

const applyProjectDetail = (id, { focus = false } = {}) => {
  const prevId = workDetailEl?.dataset.projectId || ''
  const project = projectById.get(id)
  const titleEl = workDetailEl?.querySelector('.work-detail-title')
  const tagsEl = workDetailEl?.querySelector('.work-detail-tags')
  const descEl = workDetailEl?.querySelector('.work-detail-desc')
  const linkEl = workDetailEl?.querySelector('.work-detail-link')
  const imgEl = workDetailEl?.querySelector('.work-detail-frame-img')

  projectLinks.forEach((link) => {
    if (link.dataset.project === id) link.setAttribute('aria-current', 'page')
    else link.removeAttribute('aria-current')
  })

  if (!project) {
    workDetailEl?.setAttribute('aria-hidden', 'true')
    if (workDetailEl) workDetailEl.inert = true
    workDetailEl?.removeAttribute('data-project-id')
    if (linkEl) {
      linkEl.hidden = true
      linkEl.removeAttribute('href')
    }
    if (tagsEl) {
      tagsEl.replaceChildren()
      tagsEl.hidden = true
    }
    teardownLivePreview()
    if (workListEl) workListEl.inert = false
    workScreen?.setAttribute('aria-labelledby', 'work-heading')
    hideProjectPreview()
    if (focus && prevId) {
      document.querySelector(`.project-link[data-project="${prevId}"]`)?.focus({
        preventScroll: true,
      })
    }
    return
  }

  if (titleEl) titleEl.textContent = project.name
  if (tagsEl) {
    tagsEl.replaceChildren()
    const tags = project.tags || []
    tags.forEach((tag) => {
      const item = document.createElement('li')
      item.className = 'work-detail-tag'
      item.textContent = tag
      tagsEl.append(item)
    })
    tagsEl.hidden = tags.length === 0
  }
  if (descEl) descEl.textContent = project.description
  if (linkEl) {
    if (project.url) {
      linkEl.href = project.url
      linkEl.textContent = project.linkText || 'Visit site'
      linkEl.hidden = false
    } else {
      linkEl.hidden = true
      linkEl.removeAttribute('href')
    }
  }
  if (imgEl) {
    if (imgEl.getAttribute('src') !== project.image) imgEl.src = project.image
    imgEl.alt = project.alt
  }
  setupLivePreview(project)
  requestAnimationFrame(() => {
    syncPreviewScale()
    tickProjectFrame(0)
  })
  workDetailEl?.setAttribute('aria-hidden', 'false')
  if (workDetailEl) {
    workDetailEl.inert = false
    workDetailEl.dataset.projectId = project.id
    workDetailEl.scrollTop = 0
  }
  if (workListEl) workListEl.inert = true
  workScreen?.setAttribute('aria-labelledby', 'work-detail-heading')
  hideProjectPreview()
}

let lastGtagPath

const trackSpaPageView = () => {
  if (!window.AnalyticsConsent?.hasAnalyticsConsent()) return
  const pagePath =
    window.location.pathname + window.location.search + window.location.hash
  if (lastGtagPath === undefined) {
    lastGtagPath = pagePath
    return
  }
  if (pagePath === lastGtagPath || typeof window.gtag !== 'function') return
  lastGtagPath = pagePath
  window.gtag('event', 'page_view', {
    page_path: pagePath,
    page_location: window.location.href,
    page_title: document.title,
  })
}

const setRoute = (screen, project = '', { push = false, focus = false } = {}) => {
  if (!screens.has(screen)) {
    screen = 'home'
    project = ''
  }
  if (screen !== 'work') project = ''
  if (project && !projectById.has(project)) project = ''

  const prevProject = app.dataset.project || ''
  const shouldFocus = focus && prevProject !== project
  const opening = Boolean(project) && !prevProject

  app.dataset.screen = screen
  app.style.setProperty('--work-swipe', '0px')
  syncNavLabels(screen, project)
  if (screen === 'play') play.start()
  else play.stop()
  routeEffects.syncCursor()

  if (opening && workDetailEl) {
    applyProjectDetail(project, { focus: false })
    void workDetailEl.offsetWidth
  }

  if (project) app.dataset.project = project
  else delete app.dataset.project

  if (!opening) {
    applyProjectDetail(project, { focus: shouldFocus })
  } else if (shouldFocus) {
    window.setTimeout(() => {
      workBack?.focus({ preventScroll: true })
    }, 700)
  }

  routeEffects.syncScroll()

  const nextHash = hashForRoute(screen, project)
  const state = { screen, project }
  if (window.location.hash !== nextHash) {
    if (push) history.pushState(state, '', nextHash)
    else history.replaceState(state, '', nextHash)
  }

  trackSpaPageView()
}

const setScreen = (screen, opts = {}) => setRoute(screen, '', opts)

navBlobs.forEach((btn) => {
  btn.addEventListener('click', () => {
    const screen = app.dataset.screen || 'home'
    if (screen === 'work' && app.dataset.project && btn.dataset.edge === 'left') {
      setRoute('work', '', { push: true, focus: true })
      return
    }
    const dest = edgeNav[screen]?.[btn.dataset.edge]
    if (dest) setScreen(dest, { push: true })
  })
})

document.querySelectorAll('.swipe-hints__dir').forEach((btn) => {
  btn.addEventListener('click', () => {
    const dest = btn.dataset.to
    if (dest) setScreen(dest, { push: true })
  })
})

window.addEventListener('popstate', () => {
  const { screen, project } = parseHash()
  setRoute(screen, project, { push: false, focus: true })
})

const { screen: initialScreen, project: initialProject } = parseHash()
setRoute(initialScreen, initialProject)

homeToggle.addEventListener('click', () => {
  setScreen('home', { push: true })
})

document.querySelector('.hero-cta')?.addEventListener('click', (e) => {
  e.preventDefault()
  setScreen('contact', { push: true })
})

killToggle?.addEventListener('click', () => {
  play.kill()
})

workBack?.addEventListener('click', () => {
  setRoute('work', '', { push: true, focus: true })
})

projectLive.arm?.addEventListener('click', () => {
  projectLive.wrap?.classList.add('is-armed')
  if (projectLive.arm) projectLive.arm.hidden = true
  projectLive.iframe?.focus()
})

document.addEventListener('pointerdown', (e) => {
  if (!projectLive.wrap?.classList.contains('is-armed')) return
  if (projectLive.wrap.contains(e.target)) return
  disarmLivePreview()
})

if (projectLive.live) {
  new ResizeObserver(syncPreviewScale).observe(projectLive.live)
  const lockPreviewWindow = () => {
    if (projectLive.live.scrollTop) projectLive.live.scrollTop = 0
    if (projectLive.live.scrollLeft) projectLive.live.scrollLeft = 0
  }
  projectLive.live.addEventListener('scroll', lockPreviewWindow, { passive: true })
}

projectLinks.forEach((link) => {
  link.addEventListener('click', (e) => {
    e.preventDefault()
    setRoute('work', link.dataset.project, { push: true, focus: true })
  })

  link.addEventListener('pointerenter', () => {
    if (!canHoverPreview()) return
    const project = projectById.get(link.dataset.project)
    if (project) showProjectPreview(project)
  })

  link.addEventListener('pointerleave', () => {
    if (!link.matches(':focus-visible')) hideProjectPreview()
  })

  link.addEventListener('focus', () => {
    if (!canHoverPreview()) return
    const project = projectById.get(link.dataset.project)
    if (project) showProjectPreview(project)
  })

  link.addEventListener('blur', () => {
    if (!link.matches(':hover')) hideProjectPreview()
  })
})

const swipeMq = window.matchMedia('(max-width: 48rem)')
const SWIPE_MIN = 56
const AXIS_LOCK = 10
const swipeMap = {
  play: {
    x: { dir: -1, to: 'home' },
  },
  home: {
    x: [
      { dir: -1, to: 'work' },
      { dir: 1, to: 'play' },
    ],
    y: { dir: -1, to: 'about' },
  },
  work: {
    x: { dir: 1, to: 'home' },
    y: { dir: -1, to: 'experience', needBottom: true },
  },
  about: {
    x: { dir: -1, to: 'experience' },
    y: [
      { dir: 1, to: 'home', needTop: true },
      { dir: -1, to: 'contact' },
    ],
  },
  experience: {
    x: { dir: 1, to: 'about' },
    y: { dir: 1, to: 'work', needTop: true },
  },
  contact: {
    y: { dir: 1, to: 'about', needTop: true },
  },
}

const screenEls = {
  work: workScreen,
  about: document.querySelector('.screen--about'),
  experience: document.querySelector('.screen--experience'),
  contact: document.querySelector('.screen--contact'),
}

const contactForm = document.querySelector('.contact-form')
const contactFormWrap = document.querySelector('.contact-form-wrap')
const contactMessage = document.querySelector('#contact-message')

let swipeStart = null
let swipeClaimedClick = false

const isInteractiveTarget = (el) => {
  if (!el?.closest) return false
  if (el.closest('.profile-blob-shape')) return true
  // Gameplay captures gestures; welcome screen allows swipe-back to home
  if (el.closest('.play-root.is-playing')) return true
  // Contact form fills the screen — allow edge swipes from fields/buttons
  if (app.dataset.screen === 'contact' && el.closest('.contact-form, .contact-form-wrap')) {
    return false
  }
  return Boolean(el.closest('button, a, input, textarea, select, label'))
}

const scrolledToTop = (el) => !el || el.scrollTop <= 1

const scrolledToBottom = (el) => {
  if (!el) return true
  return el.scrollTop + el.clientHeight >= el.scrollHeight - 1
}

const contactAtTop = () => {
  if (!scrolledToTop(contactForm)) return false
  if (contactMessage && contactMessage.scrollTop > 1) return false
  return true
}

const syncContactFormChevron = () => {
  if (!contactFormWrap || !contactForm) return
  const formScrollable = contactForm.scrollHeight > contactForm.clientHeight + 1
  const messageScrollable =
    Boolean(contactMessage) && contactMessage.scrollHeight > contactMessage.clientHeight + 1
  const scrollable = formScrollable || messageScrollable
  const scrolled =
    contactForm.scrollTop > 1 || (contactMessage != null && contactMessage.scrollTop > 1)
  contactFormWrap.classList.toggle('is-scrollable', scrollable)
  contactFormWrap.classList.toggle('is-scrolled', scrolled)
}

const currentScrollEl = () => {
  const screen = app.dataset.screen
  if (screen === 'work') return app.dataset.project ? workDetailEl : workListEl
  if (screen === 'contact') return contactForm
  return screenEls[screen]
}

const syncScrollEdges = () => {
  const workScroller = app.dataset.screen === 'work' ? currentScrollEl() : workListEl
  screenEls.work?.classList.toggle('is-at-bottom', scrolledToBottom(workScroller))
  screenEls.about?.classList.toggle('is-at-top', scrolledToTop(screenEls.about))
  screenEls.experience?.classList.toggle('is-at-top', scrolledToTop(screenEls.experience))
  screenEls.contact?.classList.toggle('is-at-top', contactAtTop())
  syncContactFormChevron()
}

routeEffects.syncScroll = syncScrollEdges
syncScrollEdges()
  ;[workListEl, workDetailEl, screenEls.about, screenEls.experience, contactForm, contactMessage].forEach(
    (el) => {
      el?.addEventListener('scroll', syncScrollEdges, { passive: true })
    },
  )

if (contactForm && typeof ResizeObserver !== 'undefined') {
  const contactFormResizeObserver = new ResizeObserver(syncContactFormChevron)
  contactFormResizeObserver.observe(contactForm)
  if (contactMessage) contactFormResizeObserver.observe(contactMessage)
}
contactForm?.addEventListener('input', syncContactFormChevron)
window.addEventListener('resize', syncContactFormChevron)

const setSwipeOffset = (x, y) => {
  app.style.setProperty('--swipe-x', `${x}px`)
  app.style.setProperty('--swipe-y', `${y}px`)
}

const setWorkSwipe = (x) => {
  app.style.setProperty('--work-swipe', `${x}px`)
}

const resetSwipeOffset = () => {
  app.classList.remove('is-swiping')
  setSwipeOffset(0, 0)
  setWorkSwipe(0)
}

const gestureMatches = (route, delta, atTop, atBottom) => {
  if (!route) return false
  if (route.dir > 0 ? delta <= 0 : delta >= 0) return false
  if (route.needTop && !atTop) return false
  if (route.needBottom && !atBottom) return false
  return true
}

const matchSwipeRoute = (routes, delta, atTop, atBottom) => {
  if (!routes) return null
  const list = Array.isArray(routes) ? routes : [routes]
  return list.find((route) => gestureMatches(route, delta, atTop, atBottom)) ?? null
}

const beginSwipe = (id, x, y, target) => {
  if (!swipeMq.matches || swipeStart) return
  if (isInteractiveTarget(target)) return
  const el = currentScrollEl()
  const screen = app.dataset.screen || 'home'
  swipeStart = {
    id,
    x,
    y,
    lastX: x,
    lastY: y,
    axis: null,
    atTop: screen === 'contact' ? contactAtTop() : scrolledToTop(el),
    atBottom: scrolledToBottom(el),
    claimed: false,
    closeProject: false,
  }
}

const offsetForGesture = (dx, dy) => {
  const screen = app.dataset.screen || 'home'
  const { axis, atTop, atBottom } = swipeStart
  if (screen === 'work' && app.dataset.project && axis === 'x' && dx > 0) {
    return { x: dx, y: 0, claim: true, closeProject: true }
  }
  const routes = swipeMap[screen]?.[axis]
  const delta = axis === 'y' ? dy : dx
  if (!matchSwipeRoute(routes, delta, atTop, atBottom)) return { x: 0, y: 0, claim: false }
  return axis === 'y' ? { x: 0, y: dy, claim: true } : { x: dx, y: 0, claim: true }
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
  const el = currentScrollEl()
  const yRoutes = swipeMap[screen]?.y
  const yList = Array.isArray(yRoutes) ? yRoutes : yRoutes ? [yRoutes] : []
  if (swipeStart.axis === 'y' && el && yList.length) {
    const hasNeedTop = yList.some((route) => route.needTop)
    const hasNeedBottom = yList.some((route) => route.needBottom)
    const navRoute = matchSwipeRoute(yList, dy, swipeStart.atTop, swipeStart.atBottom)
    // Don't rubber-band when this gesture already matches a page transition
    if (!navRoute) {
      if (hasNeedTop && swipeStart.atTop && dy < 0) {
        const nested =
          screen === 'contact' &&
          contactMessage &&
          contactMessage.scrollHeight > contactMessage.clientHeight + 1
            ? contactMessage
            : el
        nested.scrollTop = -dy
        return
      }
      if (hasNeedBottom && swipeStart.atBottom && dy > 0) {
        el.scrollTop = el.scrollHeight - el.clientHeight - dy
        return
      }
    }
  }

  const { x: ox, y: oy, claim, closeProject } = offsetForGesture(dx, dy)
  if (!claim) return

  swipeStart.claimed = true
  swipeStart.closeProject = Boolean(closeProject)
  if (document.activeElement?.closest?.('.contact-form')) {
    document.activeElement.blur()
  }
  preventDefault?.()
  app.classList.add('is-swiping')
  if (closeProject) {
    setWorkSwipe(Math.min(ox, window.innerWidth))
    return
  }
  setSwipeOffset(ox, oy)
}

const endSwipe = (id) => {
  if (!swipeStart || swipeStart.id !== id) return
  const { x, y, lastX, lastY, axis, atTop, atBottom, claimed, closeProject } = swipeStart
  swipeStart = null
  if (claimed) {
    swipeClaimedClick = true
    setTimeout(() => {
      swipeClaimedClick = false
    }, 0)
  }

  const dx = lastX - x
  const dy = lastY - y
  const dist = axis === 'y' ? dy : dx
  const abs = Math.abs(dist)
  const screen = app.dataset.screen || 'home'
  const routes = axis ? swipeMap[screen]?.[axis] : null
  const route = matchSwipeRoute(routes, dist, atTop, atBottom)
  const next = route?.to
  const validDir = Boolean(route)

  app.classList.remove('is-swiping')

  if (claimed && closeProject && dx > 0 && abs >= SWIPE_MIN) {
    setWorkSwipe(0)
    setRoute('work', '', { push: true, focus: true })
    return
  }

  if (claimed && validDir && abs >= SWIPE_MIN && next) {
    setSwipeOffset(0, 0)
    setWorkSwipe(0)
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

const underlines = projectLinks.map((link) => {
  const svg = link.querySelector('.project-underline')
  const path = link.querySelector('.project-underline-path')
  return {
    link,
    svg,
    path,
    active: 0,
    hovering: false,
    contacting: false,
    points: Array.from({ length: UNDERLINE_POINTS }, () => ({ y: 0, v: 0 })),
    splashes: [],
  }
})

const pathFromPoints = (pts) => {
  if (pts.length < 2) return ''
  let d = `M ${pts[0].x.toFixed(2)} ${pts[0].y.toFixed(2)}`
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)]
    const p1 = pts[i]
    const p2 = pts[i + 1]
    const p3 = pts[Math.min(pts.length - 1, i + 2)]
    const cp1x = p1.x + (p2.x - p0.x) / 6
    const cp1y = p1.y + (p2.y - p0.y) / 6
    const cp2x = p2.x - (p3.x - p1.x) / 6
    const cp2y = p2.y - (p3.y - p1.y) / 6
    d += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`
  }
  return d
}

const pathFromClosedPoints = (pts) => {
  const n = pts.length
  if (n < 4) return ''
  const at = (i) => pts[(i + n) % n]
  let d = `M ${at(0).x.toFixed(2)} ${at(0).y.toFixed(2)}`
  for (let i = 0; i < n; i++) {
    const p0 = at(i - 1)
    const p1 = at(i)
    const p2 = at(i + 1)
    const p3 = at(i + 2)
    const cp1x = p1.x + (p2.x - p0.x) / 6
    const cp1y = p1.y + (p2.y - p0.y) / 6
    const cp2x = p2.x - (p3.x - p1.x) / 6
    const cp2y = p2.y - (p3.y - p1.y) / 6
    d += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`
  }
  return `${d} Z`
}

const FRAME_EDGE_POINTS = 18
const FRAME_WAVES = 2
const projectFrame = {
  wrap: document.querySelector('.work-detail-frame'),
  svg: document.querySelector('.work-detail-frame-border'),
  path: document.querySelector('.work-detail-frame-path'),
}

const remPx = (value) => {
  const root = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16
  return parseFloat(value) * root
}

const tickProjectFrame = (t) => {
  const { wrap, svg, path } = projectFrame
  if (!wrap || !svg || !path) return
  if (app.dataset.screen !== 'work' || !app.dataset.project) return

  const rect = svg.getBoundingClientRect()
  const w = Math.max(1, rect.width)
  const h = Math.max(1, rect.height)
  const styles = getComputedStyle(wrap)
  const thickness = remPx(styles.getPropertyValue('--frame-thickness'))
  const wave = remPx(styles.getPropertyValue('--frame-wave'))
  const radius = remPx(styles.getPropertyValue('--frame-radius'))
  const amp = reduceMotion ? wave * 0.55 : wave * (0.82 + 0.18 * Math.sin(t * 0.85))
  const inner = thickness + wave
  const n = FRAME_EDGE_POINTS
  const pts = []

  const edge = (count, xy) => {
    for (let i = 0; i < count; i++) {
      const u = i / count
      const wobble = Math.sin(u * Math.PI * FRAME_WAVES) * amp
      pts.push(xy(u, wobble))
    }
  }

  const outer = wave
  const spanX = w - outer * 2
  const spanY = h - outer * 2

  edge(n, (u, wobble) => ({ x: outer + spanX * u, y: outer + wobble }))
  edge(n, (u, wobble) => ({ x: w - outer + wobble, y: outer + spanY * u }))
  edge(n, (u, wobble) => ({ x: w - outer - spanX * u, y: h - outer + wobble }))
  edge(n, (u, wobble) => ({ x: outer + wobble, y: h - outer - spanY * u }))

  const x1 = inner
  const y1 = inner
  const x2 = w - inner
  const y2 = h - inner
  const r = Math.min(radius, (x2 - x1) / 2, (y2 - y1) / 2)
  const innerHole = `M ${(x1 + r).toFixed(2)} ${y1.toFixed(2)} H ${(x2 - r).toFixed(2)} A ${r.toFixed(2)} ${r.toFixed(2)} 0 0 1 ${x2.toFixed(2)} ${(y1 + r).toFixed(2)} V ${(y2 - r).toFixed(2)} A ${r.toFixed(2)} ${r.toFixed(2)} 0 0 1 ${(x2 - r).toFixed(2)} ${y2.toFixed(2)} H ${(x1 + r).toFixed(2)} A ${r.toFixed(2)} ${r.toFixed(2)} 0 0 1 ${x1.toFixed(2)} ${(y2 - r).toFixed(2)} V ${(y1 + r).toFixed(2)} A ${r.toFixed(2)} ${r.toFixed(2)} 0 0 1 ${(x1 + r).toFixed(2)} ${y1.toFixed(2)} Z`

  svg.setAttribute('viewBox', `0 0 ${w.toFixed(2)} ${h.toFixed(2)}`)
  path.setAttribute('d', `${pathFromClosedPoints(pts)} ${innerHole}`)
}

window.addEventListener('resize', () => tickProjectFrame(0))

const tickLiveArmMagnet = (dt, mouseX, mouseY, magnetOn) => {
  const { arm, blob, magnet } = projectLive
  let targetX = 0
  let targetY = 0

  if (
    magnetOn &&
    arm &&
    blob &&
    !arm.hidden &&
    projectLive.wrap?.classList.contains('is-live') &&
    !projectLive.wrap?.classList.contains('is-armed')
  ) {
    const rect = blob.getBoundingClientRect()
    const cx = rect.left + rect.width / 2 - magnet.x
    const cy = rect.top + rect.height / 2 - magnet.y
    const dx = mouseX - cx
    const dy = mouseY - cy
    const dist = Math.hypot(dx, dy) || 1
    const reach = 220
    const max = 12
    const proximity = Math.max(0, 1 - dist / reach)
    const force = max * proximity * proximity
    targetX = (dx / dist) * force
    targetY = (dy / dist) * force
  }

  magnet.x = damp(magnet.x, targetX, 8, dt)
  magnet.y = damp(magnet.y, targetY, 8, dt)
  blob?.style.setProperty('--magnet-x', `${magnet.x.toFixed(2)}px`)
  blob?.style.setProperty('--magnet-y', `${magnet.y.toFixed(2)}px`)
}

const addSplash = (u, x, w, t, amp = 1) => {
  u.splashes.push({
    x: Math.min(w, Math.max(0, x)),
    born: t,
    amp,
    speed: Math.max(90, w * 0.62),
    width: Math.max(10, w * 0.055),
  })
  if (u.splashes.length > 4) u.splashes.shift()
}

const tickUnderlines = (t, dt, mouseX, mouseY) => {
  const onList = app.dataset.screen === 'work' && !app.dataset.project
  underlines.forEach((u) => {
    if (!u.path || !u.svg) return
    const hovered =
      onList && hoverPreviewMq.matches && (u.link.matches(':hover') || u.link.matches(':focus-visible'))
    u.active = damp(u.active, hovered || u.splashes.length ? 1 : 0, 14, dt)

    const rect = u.svg.getBoundingClientRect()
    const w = Math.max(1, rect.width)
    const height = Math.max(1, rect.height)
    const n = u.points.length
    const localMx = mouseX - rect.left
    const localMy = mouseY - rect.top
    const midPx = height * 0.5
    const nearLine =
      hovered &&
      localMx >= -16 &&
      localMx <= w + 16 &&
      Math.abs(localMy - midPx) < 36

    if (hovered && !u.hovering) addSplash(u, localMx, w, t, 1)
    else if (nearLine && !u.contacting) addSplash(u, localMx, w, t, 0.72)
    u.hovering = hovered
    u.contacting = nearLine

    u.splashes = u.splashes.filter((splash) => t - splash.born < 2.6)

    const ys = u.points.map((p) => p.y)
    const samples = []

    for (let i = 0; i < n; i++) {
      const xNorm = i / (n - 1)
      const px = xNorm * w
      const left = ys[Math.max(0, i - 1)]
      const right = ys[Math.min(n - 1, i + 1)]
      const spread = (left + right - 2 * ys[i]) * 70

      let wave = 0
      for (const splash of u.splashes) {
        const age = t - splash.born
        const fade = Math.exp(-age * 1.45)
        const dist = Math.abs(px - splash.x)
        const r1 = splash.speed * age
        const r2 = splash.speed * age * 0.68
        const crater = Math.exp(-age * 7.5) * Math.exp(-(dist * dist) / (2 * (splash.width * 0.85) ** 2))
        const ring =
          Math.exp(-((dist - r1) ** 2) / (2 * splash.width ** 2)) -
          0.62 * Math.exp(-((dist - r2) ** 2) / (2 * (splash.width * 1.2) ** 2))
        wave += splash.amp * fade * (ring * 6.4 - crater * 5.2)
      }

      const p = u.points[i]
      p.v += (spread + wave * 38 - p.y * 22) * dt
      p.v *= Math.exp(-3.8 * dt)
      p.y += p.v * dt
      p.y = Math.max(-7.4, Math.min(7.4, p.y))
      samples.push({ x: xNorm * 100, y: 8 + p.y * u.active })
    }

    if (u.active > 0.01) u.path.setAttribute('d', pathFromPoints(samples))
  })
}

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
    retired: false,
  }
}

const blobs = blobEls.map((el, i) => createBlob(el, i))
const spawnEnabled = () => app.dataset.blobs !== 'off' && app.dataset.screen !== 'play'

const PROFILE_BLOB_SIZES = [0.88, 0.42, 0.38]
const PROFILE_BLOB_SIZES_MOBILE = [0.92, 0.54, 0.5]
/** Matches `.profile-blob-shape` max size at `(max-width: 48rem)` in style.css */
const PROFILE_BLOB_MAX_MOBILE = 150
const PROFILE_BLOB_STARTS = [
  { progress: 0.5, lane: 0.5 },
  { progress: 0.18, lane: 0.22 },
  { progress: 0.82, lane: 0.78 },
]
const PROFILE_STATIC_OFFSETS = [
  { fx: 0.5, fy: 0.5 },
  { fx: 0.12, fy: 0.06 },
  { fx: 0.88, fy: 0.94 },
]
const PROFILE_ORBITS = [
  null,
  { angle: 0, speed: 0.07, rx: 0.58, ry: 0.66, dir: 1 },
  { angle: Math.PI, speed: 0.055, rx: 0.56, ry: 0.62, dir: 1 },
]
const PROFILE_SEPARATE = 1.28
const PROFILE_SEPARATE_RATE = 7
const PROFILE_MOON_MIN_ANGLE = 1.05
const PROFILE_MOON_ANGLE_RATE = 4.5
const PROFILE_BURST = 0.32
const PROFILE_MERGE_SPEED = 520
const PROFILE_ABSORB = 0.24
const PROFILE_SHARDS = ['22% 28%', '78% 24%', '26% 76%', '74% 78%', '50% 18%', '52% 82%']
const PROFILE_A11Y = [
  {
    whole: 'Split portrait',
    fragment: 'Merge portrait fragment',
    merging: 'Merging portrait fragment',
    core: 'Portrait assembling',
  },
  {
    whole: 'Split fishing photo',
    fragment: 'Merge fishing photo fragment',
    merging: 'Merging fishing photo fragment',
    core: 'Fishing photo assembling',
  },
  {
    whole: 'Split drums photo',
    fragment: 'Merge drums photo fragment',
    merging: 'Merging drums photo fragment',
    core: 'Drums photo assembling',
  },
]

const profileWrap = document.querySelector('.profile-blob')
const profileShapes = [...(profileWrap?.querySelectorAll('.profile-blob-shape') ?? [])]
const randInt = (min, max) => Math.floor(rand(min, max + 1))

const makeProfileShape = () => {
  const lump = rand(3, 6)
  const center = rand(50, 54)
  return {
    radii: Array.from({ length: 8 }, () => center + rand(-lump, lump)),
    morphAmp: Array.from({ length: 8 }, () => rand(2.5, 5)),
    morphSpeed: Array.from({ length: 8 }, () => rand(0.7, 1.35)),
    morphPhase: Array.from({ length: 8 }, () => rand(0, Math.PI * 2)),
  }
}

const profileBlobRadius = (blob, t = 0) => {
  const r = blob.radii.map((base, i) => {
    const wave = Math.sin(t * blob.morphSpeed[i] + blob.morphPhase[i])
    return Math.min(60, Math.max(48, base + wave * blob.morphAmp[i]))
  })
  return `${r[0].toFixed(1)}% ${r[1].toFixed(1)}% ${r[2].toFixed(1)}% ${r[3].toFixed(1)}% / ${r[4].toFixed(1)}% ${r[5].toFixed(1)}% ${r[6].toFixed(1)}% ${r[7].toFixed(1)}%`
}

const createProfileBlob = (el, i) => {
  const start = PROFILE_BLOB_STARTS[i] ?? {
    progress: rand(0.18, 0.82),
    lane: rand(0.22, 0.78),
  }
  const orbit = PROFILE_ORBITS[i]
  const shape = makeProfileShape()
  return {
    wrap: profileWrap,
    el,
    img: el.querySelector('.profile-blob-img'),
    sizeIndex: i,
    size: PROFILE_BLOB_SIZES[i] ?? 0.4,
    familyId: i,
    isOrigin: true,
    host: i === 0,
    mode: 'whole',
    sizeScale: 1,
    vx: 0,
    vy: 0,
    ax: 0,
    ay: 0,
    targetAccelX: 0,
    targetAccelY: 0,
    progress: start.progress,
    dir: i % 2 === 0 ? 1 : -1,
    lane: start.lane,
    targetLane: start.lane,
    phase: rand(0, Math.PI * 2),
    speed: rand(0.01, 0.028),
    accel: rand(-0.012, 0.012),
    targetAccel: rand(-0.018, 0.02),
    accelChangeAt: rand(0.4, 2.5),
    sway: rand(0.03, 0.08),
    wobble: rand(0.15, 0.4),
    angle: orbit ? orbit.angle : 0,
    orbitSpeed: orbit ? orbit.speed + rand(-0.006, 0.006) : 0,
    orbitDir: orbit ? orbit.dir : 0,
    orbitRx: orbit ? orbit.rx : 0,
    orbitRy: orbit ? orbit.ry : 0,
    orbitScale: 1,
    targetOrbitScale: 1,
    radii: shape.radii,
    morphAmp: shape.morphAmp,
    morphSpeed: shape.morphSpeed,
    morphPhase: shape.morphPhase,
    x: 0,
    y: 0,
    left: 0,
    top: 0,
    s: 0,
    pushX: 0,
    pushY: 0,
  }
}

const makeProfileAnchor = (blob) => ({
  wrap: profileWrap,
  sizeIndex: blob.sizeIndex,
  size: blob.size,
  sizeScale: 1,
  host: blob.host,
  progress: blob.progress,
  dir: blob.dir,
  lane: blob.lane,
  targetLane: blob.targetLane,
  phase: blob.phase,
  speed: blob.speed,
  accel: blob.accel,
  targetAccel: blob.targetAccel,
  accelChangeAt: blob.accelChangeAt,
  sway: blob.sway,
  wobble: blob.wobble,
  angle: blob.angle,
  orbitSpeed: blob.orbitSpeed,
  orbitDir: blob.orbitDir,
  orbitRx: blob.orbitRx,
  orbitRy: blob.orbitRy,
  orbitScale: blob.orbitScale,
  targetOrbitScale: blob.targetOrbitScale,
  x: 0,
  y: 0,
  left: 0,
  top: 0,
  s: 0,
  pushX: 0,
  pushY: 0,
})

let profileBlobs = profileWrap ? profileShapes.map(createProfileBlob) : []

const applyProfileInteractive = (el) => {
  el.setAttribute('role', 'button')
  el.setAttribute('tabindex', '0')
}

const updateProfileA11y = (blob) => {
  const copy = PROFILE_A11Y[blob.familyId] ?? PROFILE_A11Y[0]
  const label =
    blob.mode === 'whole'
      ? copy.whole
      : blob.mode === 'fragment'
        ? copy.fragment
        : blob.mode === 'merging'
          ? copy.merging
          : copy.core
  blob.el.setAttribute('aria-label', label)
  blob.el.setAttribute('aria-disabled', blob.mode === 'core' ? 'true' : 'false')
}

const profileFamilies = profileBlobs.map((blob) => {
  applyProfileInteractive(blob.el)
  updateProfileA11y(blob)
  return {
    id: blob.familyId,
    host: blob.host,
    origin: blob,
    anchor: makeProfileAnchor(blob),
    mode: 'whole',
    core: blob,
    pieceCount: 1,
    mergedCount: 1,
  }
})

const profileSizePx = (blob, cw, ch) => {
  const sizes = swipeMq.matches ? PROFILE_BLOB_SIZES_MOBILE : PROFILE_BLOB_SIZES
  let base = Math.min(cw, ch) * (sizes[blob.sizeIndex] ?? blob.size)
  if (swipeMq.matches) base = Math.min(base, PROFILE_BLOB_MAX_MOBILE)
  return base * (blob.sizeScale ?? 1)
}

const hideProfileMoons = () => swipeMq.matches

const isHostBody = (blob) =>
  blob.familyId === 0 && (blob.mode === 'whole' || blob.mode === 'core')

const setProfileZ = (blob) => {
  blob.el.style.zIndex =
    blob.mode === 'merging' ? '3' : blob.mode === 'core' ? '2' : blob.familyId === 0 ? '0' : '1'
}

const bounceProfile = (blob, t, atBottom) => {
  const mobile = swipeMq.matches
  blob.progress = atBottom ? 1 : 0
  blob.dir = atBottom ? -1 : 1
  blob.targetLane = mobile ? rand(0.04, 0.96) : rand(0.22, 0.78)
  blob.speed = mobile ? rand(0.014, 0.038) : rand(0.008, 0.024)
  blob.targetAccel = atBottom ? rand(-0.02, 0.01) : rand(-0.01, 0.022)
  blob.accelChangeAt = t + rand(0.5, 2)
}

const paintProfileBlob = (blob, x, y, s, radius) => {
  const { el, img } = blob
  el.style.width = `${s}px`
  el.style.height = `${s}px`
  el.style.borderRadius = radius
  if (img) img.style.borderRadius = radius
  el.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`
}

const clampProfileInBox = (blob, cw, ch) => {
  const travelX = Math.max(0, cw - blob.s)
  const travelY = Math.max(0, ch - blob.s)
  const left = Math.min(travelX, Math.max(0, blob.x - blob.s / 2))
  const top = Math.min(travelY, Math.max(0, blob.y - blob.s / 2))
  blob.left = left
  blob.top = top
  blob.x = left + blob.s / 2
  blob.y = top + blob.s / 2
}

const placeStaticProfile = () => {
  if (!profileBlobs.length) return
  const cw = profileWrap.clientWidth
  const ch = profileWrap.clientHeight
  if (cw < 2 || ch < 2) return
  const hideMoons = hideProfileMoons()

  profileFamilies.forEach((family) => {
    if (hideMoons && !family.host) return
    const s = profileSizePx({ ...family.anchor, sizeScale: 1 }, cw, ch)
    const travelX = Math.max(0, cw - s)
    const travelY = Math.max(0, ch - s)
    const off = PROFILE_STATIC_OFFSETS[family.id] ?? { fx: 0.5, fy: 0.5 }
    family.anchor.s = s
    family.anchor.left = travelX * off.fx
    family.anchor.top = travelY * off.fy
    family.anchor.x = family.anchor.left + s / 2
    family.anchor.y = family.anchor.top + s / 2
  })

  profileBlobs.forEach((blob) => {
    if (hideMoons && blob.familyId !== 0) return
    const family = profileFamilies[blob.familyId]
    blob.s = profileSizePx(blob, cw, ch)
    if (blob.mode === 'whole' || blob.mode === 'core') {
      blob.x = family.anchor.x
      blob.y = family.anchor.y
    }
    clampProfileInBox(blob, cw, ch)
    paintProfileBlob(blob, blob.left, blob.top, blob.s, profileBlobRadius(blob))
  })
}

const tickProfileBlob = (blob, t, dt, mouseX, mouseY, blobReach, blobPush) => {
  const { wrap } = blob
  const cw = wrap.clientWidth
  const ch = wrap.clientHeight
  if (cw < 2 || ch < 2) return

  const mobile = swipeMq.matches
  const s = profileSizePx(blob, cw, ch)
  blob.s = s
  const speedScale = window.innerHeight / ch * (mobile ? 0.85 : 0.55)

  if (t >= blob.accelChangeAt) {
    const surge = Math.random()
    if (surge < 0.2) blob.targetAccel = rand(-0.004, 0.004)
    else if (surge < 0.55) blob.targetAccel = rand(-0.014, 0.016)
    else blob.targetAccel = rand(-0.028, 0.032)
    blob.accelChangeAt = t + rand(0.8, 3.8)
  }

  blob.accel = damp(blob.accel, blob.targetAccel, 1.8, dt)
  blob.speed += blob.accel * dt
  blob.speed = Math.min(mobile ? 0.085 : 0.052, Math.max(0.004, blob.speed))
  blob.progress += blob.dir * blob.speed * speedScale * dt

  if (blob.progress >= 1) bounceProfile(blob, t, true)
  else if (blob.progress <= 0) bounceProfile(blob, t, false)

  blob.lane = damp(blob.lane, blob.targetLane, mobile ? 0.85 : 0.55, dt)

  const travelX = Math.max(0, cw - s)
  const travelY = Math.max(0, ch - s)
  const swayAmp = blob.sway * (mobile ? 2.6 : 1)
  const swayX =
    Math.sin(t * (0.18 + blob.wobble * 0.12) + blob.phase) * swayAmp * cw +
    Math.sin(t * 0.09 + blob.phase * 1.7) * swayAmp * 0.35 * cw
  const swayY = mobile
    ? Math.sin(t * 0.15 + blob.phase * 1.3) * swayAmp * 0.55 * ch +
      Math.sin(t * 0.07 + blob.phase * 0.8) * swayAmp * 0.2 * ch
    : 0

  const localX = Math.min(travelX, Math.max(0, blob.lane * travelX + swayX))
  const localY = Math.min(travelY, Math.max(0, blob.progress * travelY + swayY))
  blob.x = localX + s / 2
  blob.y = localY + s / 2

  const rect = wrap.getBoundingClientRect()
  const screenX = rect.left + blob.x + blob.pushX
  const screenY = rect.top + blob.y + blob.pushY
  const mdx = mouseX - screenX
  const mdy = mouseY - screenY
  const dist = Math.hypot(mdx, mdy) || 1
  const proximity = Math.max(0, 1 - dist / blobReach)
  const force = blobPush * proximity * proximity
  blob.pushX = damp(blob.pushX, (-mdx / dist) * force, 3.5, dt)
  blob.pushY = damp(blob.pushY, (-mdy / dist) * force, 3.5, dt)

  blob.x = localX + blob.pushX + s / 2
  blob.y = localY + blob.pushY + s / 2
  clampProfileInBox(blob, cw, ch)
}

const tickProfileOrbit = (blob, host, t, dt, mouseX, mouseY, blobReach, blobPush) => {
  const { wrap } = blob
  const cw = wrap.clientWidth
  const ch = wrap.clientHeight
  if (cw < 2 || ch < 2 || !host.s) return

  blob.s = profileSizePx(blob, cw, ch)

  if (t >= blob.accelChangeAt) {
    blob.targetAccel = rand(-0.012, 0.014)
    blob.targetOrbitScale = rand(0.9, 1.12)
    blob.accelChangeAt = t + rand(2.2, 5.5)
  }

  blob.accel = damp(blob.accel, blob.targetAccel, 1.1, dt)
  blob.orbitSpeed = Math.min(0.11, Math.max(0.035, blob.orbitSpeed + blob.accel * dt))
  blob.orbitScale = damp(blob.orbitScale, blob.targetOrbitScale, 0.7, dt)
  blob.angle += blob.orbitDir * blob.orbitSpeed * dt

  const breathe = 1 + Math.sin(t * (0.22 + blob.wobble * 0.2) + blob.phase) * 0.12
  const span = host.s + blob.s
  const rx = span * blob.orbitRx * blob.orbitScale * breathe
  const ry = span * blob.orbitRy * blob.orbitScale * breathe
  const wobble = blob.angle + Math.sin(t * 0.31 + blob.phase) * 0.22
  let ox = Math.cos(wobble) * rx
  let oy = Math.sin(wobble) * ry
  const orbitDist = Math.hypot(ox, oy) || 1
  const minOrbit = (host.s + blob.s) * 0.5 * PROFILE_SEPARATE
  if (orbitDist < minOrbit) {
    ox *= minOrbit / orbitDist
    oy *= minOrbit / orbitDist
  }
  const localX = host.x + ox
  const localY = host.y + oy

  blob.x = localX
  blob.y = localY

  const rect = wrap.getBoundingClientRect()
  const screenX = rect.left + blob.x + blob.pushX
  const screenY = rect.top + blob.y + blob.pushY
  const mdx = mouseX - screenX
  const mdy = mouseY - screenY
  const dist = Math.hypot(mdx, mdy) || 1
  const proximity = Math.max(0, 1 - dist / blobReach)
  const force = blobPush * proximity * proximity
  blob.pushX = damp(blob.pushX, (-mdx / dist) * force, 3.5, dt)
  blob.pushY = damp(blob.pushY, (-mdy / dist) * force, 3.5, dt)

  blob.x = localX + blob.pushX
  blob.y = localY + blob.pushY
  clampProfileInBox(blob, cw, ch)
}

const tickProfileFragment = (blob, t, dt, mouseX, mouseY, blobReach, blobPush) => {
  const { wrap } = blob
  const cw = wrap.clientWidth
  const ch = wrap.clientHeight
  if (cw < 2 || ch < 2) return

  blob.s = profileSizePx(blob, cw, ch)

  if (t >= blob.accelChangeAt) {
    blob.targetAccelX = rand(-55, 55)
    blob.targetAccelY = rand(-55, 55)
    blob.accelChangeAt = t + rand(0.7, 2.6)
  }

  blob.ax = damp(blob.ax, blob.targetAccelX, 1.2, dt)
  blob.ay = damp(blob.ay, blob.targetAccelY, 1.2, dt)
  blob.vx += blob.ax * dt
  blob.vy += blob.ay * dt

  const rect = wrap.getBoundingClientRect()
  const screenX = rect.left + blob.x
  const screenY = rect.top + blob.y
  const mdx = mouseX - screenX
  const mdy = mouseY - screenY
  const dist = Math.hypot(mdx, mdy) || 1
  const proximity = Math.max(0, 1 - dist / blobReach)
  const force = blobPush * 12 * proximity * proximity
  blob.vx += (-mdx / dist) * force * dt
  blob.vy += (-mdy / dist) * force * dt

  const drag = Math.exp(-Math.max(dt, 0.001) * 0.9)
  blob.vx *= drag
  blob.vy *= drag
  const spd = Math.hypot(blob.vx, blob.vy)
  const maxSpd = 220
  if (spd > maxSpd) {
    blob.vx *= maxSpd / spd
    blob.vy *= maxSpd / spd
  }

  blob.x += blob.vx * dt
  blob.y += blob.vy * dt
  blob.pushX = 0
  blob.pushY = 0

  const prevX = blob.x
  const prevY = blob.y
  clampProfileInBox(blob, cw, ch)
  if (blob.x !== prevX) blob.vx *= -0.62
  if (blob.y !== prevY) blob.vy *= -0.62
}

const tickProfileMerge = (blob, family, dt) => {
  const { wrap } = blob
  const cw = wrap.clientWidth
  const ch = wrap.clientHeight
  if (cw < 2 || ch < 2) return

  blob.s = profileSizePx(blob, cw, ch)
  const target = family.core ?? family.anchor
  const dx = target.x - blob.x
  const dy = target.y - blob.y
  const dist = Math.hypot(dx, dy) || 1
  const step = Math.min(dist, PROFILE_MERGE_SPEED * dt)
  blob.x += (dx / dist) * step
  blob.y += (dy / dist) * step
  blob.vx = 0
  blob.vy = 0
  blob.pushX = 0
  blob.pushY = 0
  clampProfileInBox(blob, cw, ch)
}

const cloneProfileBlob = (source) => {
  const el = source.el.cloneNode(true)
  if (source.familyId === 0) {
    el.classList.remove('profile-blob-shape--small', 'profile-blob-shape--moon')
  } else {
    el.classList.add('profile-blob-shape--small', 'profile-blob-shape--moon')
  }
  const blob = createProfileBlob(el, source.familyId)
  blob.familyId = source.familyId
  blob.isOrigin = false
  blob.host = false
  blob.sizeIndex = source.sizeIndex
  blob.size = source.size
  blob.mode = 'fragment'
  blob.sizeScale = source.sizeScale
  applyProfileInteractive(el)
  return blob
}

const removeProfileBlob = (blob) => {
  if (blob.isOrigin) return
  const i = profileBlobs.indexOf(blob)
  if (i >= 0) profileBlobs.splice(i, 1)
  blob.el.remove()
}

const updateCoreScale = (family) => {
  if (!family.core) return
  family.core.sizeScale = Math.sqrt(family.mergedCount / Math.max(family.pieceCount, 1))
}

const promoteToCore = (blob, family) => {
  blob.mode = 'core'
  blob.vx = 0
  blob.vy = 0
  blob.pushX = 0
  blob.pushY = 0
  family.core = blob
  updateCoreScale(family)
  const cw = profileWrap.clientWidth
  const ch = profileWrap.clientHeight
  blob.s = profileSizePx(blob, cw, ch)
  blob.x = family.anchor.x
  blob.y = family.anchor.y
  clampProfileInBox(blob, cw, ch)
  setProfileZ(blob)
  updateProfileA11y(blob)
}

const restoreFamilyWhole = (family) => {
  for (const blob of [...profileBlobs]) {
    if (blob.familyId === family.id && blob !== family.origin) removeProfileBlob(blob)
  }
  const origin = family.origin
  origin.mode = 'whole'
  origin.sizeScale = 1
  origin.vx = 0
  origin.vy = 0
  origin.ax = 0
  origin.ay = 0
  origin.pushX = 0
  origin.pushY = 0
  if (origin.img) origin.img.style.objectPosition = 'center'
  setProfileZ(origin)
  family.mode = 'whole'
  family.core = origin
  family.pieceCount = 1
  family.mergedCount = 1
  updateProfileA11y(origin)
  const cw = profileWrap.clientWidth
  const ch = profileWrap.clientHeight
  origin.s = profileSizePx(origin, cw, ch)
  origin.x = family.anchor.x
  origin.y = family.anchor.y
  clampProfileInBox(origin, cw, ch)
  paintProfileBlob(origin, origin.left, origin.top, origin.s, profileBlobRadius(origin))
}

const absorbFragment = (blob, family) => {
  if (blob.mode === 'core' || blob.mode === 'whole') return

  if (!family.core) {
    family.mergedCount = 1
    promoteToCore(blob, family)
    return
  }

  if (blob === family.core) return

  family.mergedCount += 1

  if (blob === family.origin) {
    const oldCore = family.core
    promoteToCore(family.origin, family)
    if (oldCore !== family.origin) removeProfileBlob(oldCore)
  } else {
    removeProfileBlob(blob)
  }

  updateCoreScale(family)
  if (family.mergedCount >= family.pieceCount) restoreFamilyWhole(family)
}

const absorbIfClose = (blob) => {
  const family = profileFamilies[blob.familyId]
  const target = family.core ?? family.anchor
  const dist = Math.hypot(target.x - blob.x, target.y - blob.y)
  const reach = Math.max(16, ((target.s || blob.s) + blob.s) * PROFILE_ABSORB)
  if (dist > reach) return
  absorbFragment(blob, family)
}

const explodeFamily = (family, instant) => {
  if (family.mode !== 'whole') return
  if (hideProfileMoons() && !family.host) return

  const origin = family.origin
  const n = family.host ? randInt(4, 8) : randInt(2, 4)
  const cw = profileWrap.clientWidth
  const ch = profileWrap.clientHeight
  const ox = origin.x || family.anchor.x
  const oy = origin.y || family.anchor.y
  const burst = Math.min(cw, ch) * PROFILE_BURST
  const scale = 1 / Math.sqrt(n)

  family.mode = 'exploded'
  family.pieceCount = n
  family.mergedCount = 0
  family.core = null

  const pieces = [origin]
  for (let i = 1; i < n; i++) {
    const clone = cloneProfileBlob(origin)
    profileWrap.appendChild(clone.el)
    profileBlobs.push(clone)
    pieces.push(clone)
  }

  pieces.forEach((blob, i) => {
    blob.mode = 'fragment'
    blob.sizeScale = scale
    blob.s = profileSizePx(blob, cw, ch)
    const angle = (i / n) * Math.PI * 2 + rand(-0.28, 0.28)
    if (instant) {
      const dist = burst * rand(0.4, 0.95)
      blob.x = ox + Math.cos(angle) * dist
      blob.y = oy + Math.sin(angle) * dist
      blob.vx = 0
      blob.vy = 0
    } else {
      blob.x = ox + Math.cos(angle) * 10
      blob.y = oy + Math.sin(angle) * 10
      const speed = burst * (2.6 + rand(0, 1.8))
      blob.vx = Math.cos(angle) * speed
      blob.vy = Math.sin(angle) * speed
    }
    blob.pushX = 0
    blob.pushY = 0
    blob.ax = 0
    blob.ay = 0
    blob.targetAccelX = 0
    blob.targetAccelY = 0
    blob.accelChangeAt = 0
    if (blob.img) blob.img.style.objectPosition = PROFILE_SHARDS[i % PROFILE_SHARDS.length]
    setProfileZ(blob)
    updateProfileA11y(blob)
    clampProfileInBox(blob, cw, ch)
    paintProfileBlob(blob, blob.left, blob.top, blob.s, profileBlobRadius(blob))
  })
}

const startProfileMerge = (blob) => {
  if (blob.mode !== 'fragment') return
  blob.mode = 'merging'
  setProfileZ(blob)
  updateProfileA11y(blob)
  if (reduceMotion) {
    absorbFragment(blob, profileFamilies[blob.familyId])
    placeStaticProfile()
  }
}

const activateProfileBlob = (blob) => {
  if (hideProfileMoons() && blob.familyId !== 0) return
  const family = profileFamilies[blob.familyId]
  if (blob.mode === 'whole') explodeFamily(family, reduceMotion)
  else if (blob.mode === 'fragment') startProfileMerge(blob)
  if (reduceMotion) placeStaticProfile()
}

const separateProfileBlobs = (dt, list = profileBlobs) => {
  if (list.length < 2) return
  const cw = profileWrap.clientWidth
  const ch = profileWrap.clientHeight
  const mass = (blob) => (isHostBody(blob) ? 10 : 1)
  const gain = 1 - Math.exp(-Math.max(dt, 0.001) * PROFILE_SEPARATE_RATE)
  const minDistOf = (a, b) => (a.s + b.s) * 0.5 * PROFILE_SEPARATE

  for (let i = 0; i < list.length; i++) {
    for (let j = i + 1; j < list.length; j++) {
      const a = list[i]
      const b = list[j]
      const minDist = minDistOf(a, b)
      const dx = b.x - a.x
      const dy = b.y - a.y
      const dist = Math.hypot(dx, dy) || 0.001
      if (dist >= minDist) continue
      const overlap = minDist - dist
      const invA = 1 / mass(a)
      const invB = 1 / mass(b)
      const share = invA + invB
      const nx = dx / dist
      const ny = dy / dist
      const amount = overlap * gain
      a.x -= nx * amount * (invA / share)
      a.y -= ny * amount * (invA / share)
      b.x += nx * amount * (invB / share)
      b.y += ny * amount * (invB / share)
    }
  }

  list.forEach((blob) => clampProfileInBox(blob, cw, ch))

  for (let i = 0; i < list.length; i++) {
    for (let j = i + 1; j < list.length; j++) {
      const a = list[i]
      const b = list[j]
      const minDist = minDistOf(a, b)
      const dx = b.x - a.x
      const dy = b.y - a.y
      const dist = Math.hypot(dx, dy) || 0.001
      if (dist >= minDist) continue
      const leftover = (minDist - dist) * gain
      if (isHostBody(a) !== isHostBody(b)) {
        const moon = isHostBody(a) ? b : a
        const host = isHostBody(a) ? a : b
        const hx = moon.x - host.x
        const hy = moon.y - host.y
        const hDist = Math.hypot(hx, hy) || 1
        moon.x += (hx / hDist) * leftover
        moon.y += (hy / hDist) * leftover
        moon.targetOrbitScale = Math.min(1.22, moon.targetOrbitScale + leftover * 0.01)
      } else {
        const mx = b.x - a.x
        const my = b.y - a.y
        const mDist = Math.hypot(mx, my) || 1
        a.x -= (mx / mDist) * leftover * 0.5
        a.y -= (my / mDist) * leftover * 0.5
        b.x += (mx / mDist) * leftover * 0.5
        b.y += (my / mDist) * leftover * 0.5
      }
    }
  }

  list.forEach((blob) => clampProfileInBox(blob, cw, ch))
}

const tickAllProfileBlobs = (t, dt, mouseX, mouseY, blobReach, blobPush) => {
  if (!profileBlobs.length || !profileWrap) return
  const cw = profileWrap.clientWidth
  const ch = profileWrap.clientHeight
  if (cw < 2 || ch < 2) return

  const hideMoons = hideProfileMoons()
  const hostAnchor = profileFamilies[0]?.anchor
  if (!hostAnchor) return

  tickProfileBlob(hostAnchor, t, dt, mouseX, mouseY, blobReach, blobPush)

  if (!hideMoons) {
    const moonAnchors = profileFamilies.filter((family) => !family.host).map((family) => family.anchor)
    const angleGain = 1 - Math.exp(-Math.max(dt, 0.001) * PROFILE_MOON_ANGLE_RATE)
    for (let i = 0; i < moonAnchors.length; i++) {
      for (let j = i + 1; j < moonAnchors.length; j++) {
        const a = moonAnchors[i]
        const b = moonAnchors[j]
        let dAngle = b.angle - a.angle
        while (dAngle > Math.PI) dAngle -= Math.PI * 2
        while (dAngle < -Math.PI) dAngle += Math.PI * 2
        const abs = Math.abs(dAngle) || 0.001
        if (abs >= PROFILE_MOON_MIN_ANGLE) continue
        const push = (PROFILE_MOON_MIN_ANGLE - abs) * angleGain
        const sign = dAngle >= 0 ? 1 : -1
        a.angle -= sign * push * 0.5
        b.angle += sign * push * 0.5
      }
    }
    moonAnchors.forEach((anchor) => {
      tickProfileOrbit(anchor, hostAnchor, t, dt, mouseX, mouseY, blobReach, blobPush)
    })
  }

  const visible = profileBlobs.filter((blob) => !(hideMoons && blob.familyId !== 0))

  visible.forEach((blob) => {
    const family = profileFamilies[blob.familyId]
    if (blob.mode === 'whole' || blob.mode === 'core') {
      blob.x = family.anchor.x
      blob.y = family.anchor.y
      blob.pushX = family.anchor.pushX
      blob.pushY = family.anchor.pushY
      blob.s = profileSizePx(blob, cw, ch)
      clampProfileInBox(blob, cw, ch)
    } else if (blob.mode === 'merging') {
      tickProfileMerge(blob, family, dt)
    } else {
      tickProfileFragment(blob, t, dt, mouseX, mouseY, blobReach, blobPush)
    }
  })

  visible
    .filter((blob) => blob.mode === 'merging')
    .forEach((blob) => absorbIfClose(blob))

  const stillVisible = profileBlobs.filter((blob) => !(hideMoons && blob.familyId !== 0))
  separateProfileBlobs(
    dt,
    stillVisible.filter((blob) => blob.mode !== 'merging'),
  )
  stillVisible.forEach((blob) => {
    paintProfileBlob(blob, blob.left, blob.top, blob.s, profileBlobRadius(blob, t))
  })
}

const blobFromShape = (el) => profileBlobs.find((blob) => blob.el === el)

let profileKeyActivated = false

if (profileWrap) {
  profileWrap.addEventListener('click', (e) => {
    if (swipeClaimedClick || profileKeyActivated) return
    const shape = e.target.closest('.profile-blob-shape')
    if (!shape || !profileWrap.contains(shape)) return
    const blob = blobFromShape(shape)
    if (blob) activateProfileBlob(blob)
  })

  profileWrap.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return
    const shape = e.target.closest('.profile-blob-shape')
    if (!shape || !profileWrap.contains(shape)) return
    e.preventDefault()
    profileKeyActivated = true
    const blob = blobFromShape(shape)
    if (blob) activateProfileBlob(blob)
    requestAnimationFrame(() => {
      profileKeyActivated = false
    })
  })
}

const bounceBlob = (blob, t, atBottom) => {
  blob.retired = false
  blob.el.style.opacity = '1'
  blob.progress = atBottom ? 1 : 0
  blob.dir = atBottom ? -1 : 1
  blob.targetLane = rand(0.22, 0.78)
  blob.speed = rand(0.008, 0.024)
  blob.targetAccel = atBottom ? rand(-0.02, 0.01) : rand(-0.01, 0.022)
  blob.accelChangeAt = t + rand(0.5, 2)
}

if (!spawnEnabled()) {
  blobs.forEach((blob) => {
    blob.retired = true
    blob.progress = Math.random() > 0.5 ? 0 : 1
    blob.nest = 0
  })
}

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
  placeStaticProfile()
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
  tickAllProfileBlobs(0, 0, mouseX, mouseY, blobReach, blobPush)

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

    tickLiveArmMagnet(dt, mouseX, mouseY, magnetOn)

    const spawnOn = spawnEnabled()
    let topAbsorb = 0
    let bottomAbsorb = 0

    blobs.forEach((blob) => {
      if (blob.retired) {
        if (spawnOn) {
          bounceBlob(blob, t, blob.progress >= 0.5)
        } else {
          blob.nest = damp(blob.nest, 0, 3.2, dt)
          blob.x = blob.lane * w
          blob.y = progressToY(blob.progress, h)
          blob.attractX = 0
          blob.attractY = 0
          if (blob.nest > 0.02) {
            if (blob.progress < 0.5) topAbsorb += 1 - blob.nest
            else bottomAbsorb += 1 - blob.nest
          }
          return
        }
      }

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
        if (spawnOn) {
          bounceBlob(blob, t, true)
        } else {
          blob.progress = 1
          blob.retired = true
        }
      } else if (blob.progress <= 0) {
        if (spawnOn) {
          bounceBlob(blob, t, false)
        } else {
          blob.progress = 0
          blob.retired = true
        }
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
      if (blobs[i].retired) continue
      for (let j = i + 1; j < blobs.length; j++) {
        const a = blobs[i]
        const b = blobs[j]
        if (b.retired) continue
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

    tickAllProfileBlobs(t, dt, mouseX, mouseY, blobReach, blobPush)
    tickUnderlines(t, dt, mouseX, mouseY)
    tickProjectFrame(t)

    rafId = requestAnimationFrame(tick)
  }

  rafId = requestAnimationFrame(tick)
  window.addEventListener('beforeunload', () => cancelAnimationFrame(rafId))
}

const blobCursorRoot = document.querySelector('.blob-cursor')
const blobCursorMotion = document.querySelector('.blob-cursor-motion')
const finePointerMq = window.matchMedia('(hover: hover) and (pointer: fine)')
const cursorInteractive = 'a, button, [role="button"], summary, label, input, textarea, select, .profile-blob-shape'

if (blobCursorRoot && blobCursorMotion && !reduceMotion) {
  const cursor = {
    visible: false,
    enabled: false,
    moving: false,
    angle: 0,
    lastT: 0,
    settleTimer: 0,
  }

  const restMotion = () => `rotate(${cursor.angle.toFixed(1)}deg)`

  const settleMotion = () => {
    cursor.settleTimer = 0
    cursor.moving = false
    blobCursorRoot.classList.remove('is-moving')
    blobCursorMotion.style.transform = restMotion()
  }

  const syncCursorMode = () => {
    cursor.enabled = finePointerMq.matches
    root.classList.toggle('has-blob-cursor', cursor.enabled)
    if (!cursor.enabled) {
      cursor.visible = false
      blobCursorRoot.classList.remove('is-on', 'is-hover', 'is-down', 'is-moving', 'is-melted')
      blobCursorMotion.style.transform = ''
    }
  }

  const hideCursor = () => {
    cursor.visible = false
    cursor.moving = false
    if (cursor.settleTimer) {
      clearTimeout(cursor.settleTimer)
      cursor.settleTimer = 0
    }
    blobCursorRoot.classList.remove('is-on', 'is-hover', 'is-down', 'is-moving', 'is-melted')
    blobCursorMotion.style.transform = ''
  }

  syncCursorMode()
  routeEffects.syncCursor = syncCursorMode
  finePointerMq.addEventListener('change', syncCursorMode)

  window.addEventListener(
    'pointermove',
    (e) => {
      if (!cursor.enabled || e.pointerType === 'touch') return
      if (e.target?.closest?.('iframe')) {
        hideCursor()
        return
      }

      const overNavBlob = Boolean(e.target?.closest?.('.nav-blob'))
      const hovering = Boolean(e.target?.closest?.(cursorInteractive))
      blobCursorRoot.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`
      blobCursorRoot.classList.toggle('is-hover', hovering && !overNavBlob)
      blobCursorRoot.classList.toggle('is-melted', overNavBlob)

      if (!cursor.visible) {
        cursor.visible = true
        cursor.lastT = e.timeStamp
        blobCursorRoot.classList.add('is-on')
        return
      }

      const dt = Math.max(8, e.timeStamp - cursor.lastT)
      cursor.lastT = e.timeStamp
      const dist = Math.hypot(e.movementX, e.movementY)
      if (dist > 0.6) {
        cursor.angle = Math.atan2(e.movementY, e.movementX) * (180 / Math.PI)
        const cap = hovering ? 0.22 : 0.42
        const stretch = Math.min(cap, (dist / dt) * 0.36)
        if (!cursor.moving) {
          cursor.moving = true
          blobCursorRoot.classList.add('is-moving')
        }
        blobCursorMotion.style.transform = `rotate(${cursor.angle.toFixed(1)}deg) scale(${(1 + stretch).toFixed(3)}, ${(1 - stretch * 0.52).toFixed(3)})`
      }

      if (cursor.settleTimer) clearTimeout(cursor.settleTimer)
      cursor.settleTimer = setTimeout(settleMotion, 40)
    },
    { passive: true },
  )

  window.addEventListener('pointerdown', (e) => {
    if (cursor.enabled && e.pointerType !== 'touch') blobCursorRoot.classList.add('is-down')
  })

  window.addEventListener('pointerup', () => {
    blobCursorRoot.classList.remove('is-down')
  })

  window.addEventListener('pointercancel', () => {
    blobCursorRoot.classList.remove('is-down')
  })

  document.documentElement.addEventListener('mouseleave', hideCursor)
}

const contactStatus = document.querySelector('.contact-form__status')
const contactSubmit = document.querySelector('.contact-form__submit')

const CONTACT_LIMITS = { name: 100, email: 254, message: 2000 }
const CONTACT_COOLDOWN_MS = 30_000
let lastContactSubmitAt = 0

const setContactStatus = (message, type = '') => {
  if (!contactStatus) return
  contactStatus.hidden = !message
  contactStatus.textContent = message
  contactStatus.classList.toggle('is-success', type === 'success')
  contactStatus.classList.toggle('is-error', type === 'error')
  syncContactFormChevron()
}

contactForm?.addEventListener('submit', async (e) => {
  e.preventDefault()
  if (!contactForm.checkValidity()) {
    contactForm.reportValidity()
    return
  }

  const cooldownLeft = lastContactSubmitAt + CONTACT_COOLDOWN_MS - Date.now()
  if (cooldownLeft > 0) {
    const seconds = Math.ceil(cooldownLeft / 1000)
    setContactStatus(`Please wait ${seconds}s before sending another message.`, 'error')
    return
  }

  const accessKey = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY
  if (!accessKey) {
    setContactStatus('Contact form is not configured yet.', 'error')
    return
  }

  const formData = new FormData(contactForm)
  if (formData.get('botcheck')) return

  const name = String(formData.get('name') || '').trim()
  const email = String(formData.get('email') || '').trim()
  const message = String(formData.get('message') || '').trim()

  if (!name || !email || !message) {
    setContactStatus('Please fill out all fields.', 'error')
    return
  }
  if (name.length > CONTACT_LIMITS.name || email.length > CONTACT_LIMITS.email || message.length > CONTACT_LIMITS.message) {
    setContactStatus('One or more fields are too long.', 'error')
    return
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    setContactStatus('Please enter a valid email address.', 'error')
    return
  }

  const payload = new FormData()
  payload.append('access_key', accessKey)
  payload.append('name', name)
  payload.append('email', email)
  payload.append('message', message)
  payload.append('subject', 'Portfolio contact')
  payload.append('botcheck', '')

  contactSubmit.disabled = true
  setContactStatus('Sending…')

  try {
    const res = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      body: payload,
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok || data.success === false) {
      throw new Error(data.message || 'Request failed')
    }
    contactForm.reset()
    lastContactSubmitAt = Date.now()
    setContactStatus('Thanks, your message is on the way.', 'success')
  } catch {
    setContactStatus('Something went wrong. Please try again or email me at contact@kaleblink.com.', 'error')
  } finally {
    contactSubmit.disabled = false
  }
})
