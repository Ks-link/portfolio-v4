import './style.css'
import { createMetaballs, parseCssColor } from './metaballs.js'
import { mountPlay } from './play.js'
import { ACCENT_PALETTE, DEFAULT_ACCENT } from './blob-colors.js'

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
         M12.3 7.6a1.2 1.2 0 1 0 2.4 0a1.2 1.2 0 1 0-2.4 0z
         M8.83 11.17c1.02-.84 3.06-.66 4.26.3.84.66.84 1.68 0 2.1-1.26.66-3.24.36-4.14-.6-.66-.66-.72-1.2-.12-1.8z"/>
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

const menuToggleIcon = `
  <svg class="theme-icon menu-toggle__icon" viewBox="0 0 24 24" aria-hidden="true"
    fill="currentColor">
    <rect class="menu-toggle__line menu-toggle__line--1" x="4" y="5" width="16" height="2.25" rx="1.125" ry="1.125"/>
    <rect class="menu-toggle__line menu-toggle__line--2" x="4" y="10.875" width="16" height="2.25" rx="1.125" ry="1.125"/>
    <rect class="menu-toggle__line menu-toggle__line--3" x="4" y="16.75" width="16" height="2.25" rx="1.125" ry="1.125"/>
  </svg>
`

/* Lucide settings paths; rotation mimics Animate UI icons-settings default. */
const settingsToggleIcon = `
  <svg class="theme-icon settings-toggle__icon" viewBox="0 0 24 24" aria-hidden="true"
    fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
    <g class="settings-toggle__gear">
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
      <circle cx="12" cy="12" r="3"/>
    </g>
  </svg>
`

const mapGridIcon = `
  <svg class="theme-icon" viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="6" cy="6" r="1.85" fill="currentColor"/>
    <circle cx="12" cy="6" r="1.85" fill="currentColor"/>
    <circle cx="18" cy="6" r="1.85" fill="currentColor"/>
    <circle cx="6" cy="12" r="1.85" fill="currentColor"/>
    <circle cx="12" cy="12" r="1.85" fill="currentColor"/>
    <circle cx="18" cy="12" r="1.85" fill="currentColor"/>
    <circle cx="6" cy="18" r="1.85" fill="currentColor"/>
    <circle cx="12" cy="18" r="1.85" fill="currentColor"/>
    <circle cx="18" cy="18" r="1.85" fill="currentColor"/>
  </svg>
`

const accentIcon = `
  <span class="theme-icon accent-toggle__blob" aria-hidden="true"></span>
`

const accentPickerMarkup = ACCENT_PALETTE.map(
  (color, index) => `
    <button
      type="button"
      class="accent-swatch"
      role="option"
      data-accent="${color}"
      style="--swatch: ${color}; --i: ${ACCENT_PALETTE.length - 1 - index}"
      aria-label="Accent ${color}"
      aria-selected="false"
    ></button>
  `,
).join('')

const cursorIcon = `
  <svg class="theme-icon" viewBox="0 0 24 24" aria-hidden="true"
    fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
    <path d="M9.07 13.9V4.23a1.68 1.68 0 0 1 3.36 0V9.7"/>
    <path d="M12.43 7.8a1.26 1.26 0 0 1 2.52 0v2.5"/>
    <path d="M14.95 9.46a1.26 1.26 0 0 1 2.52 0v2.14"/>
    <path d="M17.47 10.64a1.155 1.155 0 0 1 2.31 0V15q0 1.3-.68 2.3l-.7 1.1q-.5.7-.5 1.6v1.24H9.7V20.1q0-.7-.5-1.4L4.2 11.9a1.5 1.5 0 0 1 2.1-1.8l2.77 2.53"/>
    <path d="M14.74 14.1v2.5M17.26 14.94v1.66"/>
  </svg>
`

const pinterestIcon = `
  <svg class="profile-social__icon" viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="12" cy="12" r="10.5" fill="#fff"/>
    <path fill="#e60023"
      d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z"/>
  </svg>
`

const letterboxdIcon = `
  <svg class="profile-social__icon" viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="4.45" cy="12" r="4.444" fill="#ff8000"/>
    <circle cx="12" cy="12" r="4.444" fill="#00e054"/>
    <circle cx="19.55" cy="12" r="4.444" fill="#40bcf4"/>
    <path fill="#fff"
      d="M8.224 9.648c.427.682.674 1.488.674 2.352s-.247 1.67-.674 2.352c-.427-.682-.673-1.488-.673-2.352s.246-1.67.673-2.352zM15.776 9.648c.427.682.673 1.488.673 2.352s-.246 1.67-.673 2.352c-.427-.682-.675-1.488-.675-2.352s.248-1.67.675-2.352z"/>
  </svg>
`

const chessIcon = `
  <svg class="profile-social__icon" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="#81b64c"
      d="M12 0a3.85 3.85 0 0 0-3.875 3.846A3.84 3.84 0 0 0 9.73 6.969l-2.79 1.85c0 .622.144 1.114.434 1.649H9.83c-.014.245-.014.549-.014.925 0 .025.003.048.006.071-.064 1.353-.507 3.472-3.62 5.842-.816.625-1.423 1.495-1.806 2.533a.33.33 0 0 0-.045.084 8.124 8.124 0 0 0-.39 2.516c0 .1.216 1.561 8.038 1.561s8.038-1.46 8.038-1.561c0-2.227-.824-4.048-2.24-5.133-4.034-3.08-3.586-5.74-3.644-6.838h2.458c.29-.535.434-1.027.434-1.649l-2.79-1.836a3.86 3.86 0 0 0 1.604-3.123A3.873 3.873 0 0 0 13.445.275c-.004-.002-.01.004-.015.004A3.76 3.76 0 0 0 12 0Z"/>
  </svg>
`

const spotifyIcon = `
  <svg class="profile-social__icon" viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="12" cy="12" r="10.5" fill="#000"/>
    <path fill="#1ed760"
      d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
  </svg>
`

const faviconArrowPath = 'M3 2.5 19.1 10.9 11.05 13.8 7.4 20.1Z'

/* Click lines are drawn from the inner end outward so the dash animation bursts away from the tip. */
const faviconArrowSvg = (className, { clicks = true } = {}) => `
  <svg class="${className}" viewBox="0 0 24 24" aria-hidden="true">
    ${clicks ? `
    <g class="cursor-arrow-clicks">
      <path d="M-2.5 4.8-6 4.5" pathLength="10"/>
      <path d="M.35-1.2-1.6-3.25" pathLength="10"/>
      <path d="M6.2-3 6.7-6.1" pathLength="10"/>
    </g>` : ''}
    <path d="${faviconArrowPath}" fill="currentColor" stroke="currentColor"
      stroke-width="3.5" stroke-linejoin="round"/>
  </svg>
`

const CURSOR_STYLES = ['blob', 'favicon', 'ring', 'system']
const DEFAULT_CURSOR_STYLE = 'blob'

const cursorStyleLabels = {
  blob: 'Blob cursor',
  favicon: 'Arrow cursor',
  ring: 'Ring cursor',
  system: 'System cursor',
}

const cursorStylePreviews = {
  blob: '<span class="cursor-swatch__blob"></span>',
  favicon: faviconArrowSvg('cursor-swatch__arrow', { clicks: false }),
  ring: '<span class="cursor-swatch__ring"></span>',
  system: `
    <svg class="cursor-swatch__icon" viewBox="0 0 24 24">
      <path d="M5 2.5v16.2l4.1-3.9 2.7 6.2 2.9-1.3-2.7-6h5.9z"
        fill="currentColor" stroke="var(--bg)" stroke-width="1.25" stroke-linejoin="round"/>
    </svg>
  `,
}

const cursorPickerMarkup = CURSOR_STYLES.map(
  (style, index) => `
    <button
      type="button"
      class="cursor-swatch"
      role="option"
      data-cursor-style="${style}"
      style="--i: ${CURSOR_STYLES.length - 1 - index}"
      aria-label="${cursorStyleLabels[style]}"
      aria-selected="false"
    >${cursorStylePreviews[style]}</button>
  `,
).join('')

const BLOB_COUNT = 12
const VISIBLE_MIN = 5
const VISIBLE_MAX = 8
const SPAWN_GAP_MIN = 0.8
const SPAWN_GAP_MAX = 1.8
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
            <a class="project-link" href="/work/${project.id}/" data-project="${project.id}">
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

const stageMapSelectArrow = `
  <svg class="stage-map__select-arrow" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
      d="M9 5l7 7-7 7"/>
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
      <filter
        id="stage-map-goo"
        x="-40%"
        y="-40%"
        width="180%"
        height="180%"
        color-interpolation-filters="sRGB"
      >
        <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
        <feColorMatrix
          in="blur"
          mode="matrix"
          values="
            1 0 0 0 0
            0 1 0 0 0
            0 0 1 0 0
            0 0 0 16 -8"
          result="goo"
        />
      </filter>
    </defs>
  </svg>
  <div class="blob-cursor" aria-hidden="true">
    <span class="blob-cursor-motion">
      <span class="blob-cursor-shape"></span>
      ${faviconArrowSvg('blob-cursor-arrow')}
    </span>
  </div>
  <div class="grain" aria-hidden="true"></div>
  <div class="blobs" aria-hidden="true">
    <canvas class="blobs-canvas"></canvas>
    <span class="blob blob--endcap" data-endcap="top"></span>
    <span class="blob blob--endcap" data-endcap="bottom"></span>
    ${Array.from({ length: BLOB_COUNT }, (_, i) => `<span class="blob" data-blob="${i}"></span>`).join('')}
  </div>
  <div class="corner-cluster corner-cluster--home">
    <button type="button" class="corner-btn home-toggle" aria-label="Home">
      ${homeIcon}
    </button>
    <button type="button" class="corner-btn kill-toggle" aria-label="Die">
      ${killIcon}
    </button>
  </div>
  <div class="corner-cluster corner-cluster--controls">
    <button
      type="button"
      class="corner-btn menu-toggle"
      aria-label="Open menu"
      aria-expanded="false"
      aria-controls="corner-menu"
    >
      <span class="menu-toggle__blob" aria-hidden="true"></span>
      ${menuToggleIcon}
    </button>
    <button
      type="button"
      class="corner-btn settings-toggle"
      aria-label="Open settings"
      aria-expanded="false"
      aria-controls="corner-menu"
    >
      ${settingsToggleIcon}
    </button>
    <div id="corner-menu" class="corner-menu">
      <div class="corner-menu__shape">
        <div class="corner-menu__item corner-menu__item--map">
          <button
            type="button"
            class="corner-btn map-toggle"
            aria-label="Open site map"
            aria-pressed="false"
          >
            ${mapGridIcon}
          </button>
        </div>
        <div class="corner-menu__item">
          <button type="button" class="corner-btn theme-toggle" aria-label="Toggle dark mode">
            ${moonIcon}
          </button>
        </div>
        <div class="corner-menu__item corner-menu__item--accent">
          <button
            type="button"
            class="corner-btn accent-toggle"
            aria-label="Choose accent colour"
            aria-expanded="false"
            aria-controls="accent-picker"
          >
            ${accentIcon}
          </button>
          <div
            id="accent-picker"
            class="accent-picker"
            role="listbox"
            aria-label="Accent colours"
            hidden
          >
            <div class="accent-picker__canvas" style="--count: ${ACCENT_PALETTE.length}">
              ${accentPickerMarkup}
            </div>
          </div>
        </div>
        <div class="corner-menu__item corner-menu__item--cursor">
          <button
            type="button"
            class="corner-btn cursor-toggle"
            aria-label="Choose cursor style"
            aria-expanded="false"
            aria-controls="cursor-picker"
          >
            ${cursorIcon}
          </button>
          <div
            id="cursor-picker"
            class="cursor-picker"
            role="listbox"
            aria-label="Cursor styles"
            hidden
          >
            <div class="cursor-picker__canvas" style="--count: ${CURSOR_STYLES.length}">
              ${cursorPickerMarkup}
            </div>
          </div>
        </div>
        <div class="corner-menu__item corner-menu__item--blobs">
          <button type="button" class="corner-btn blobs-toggle" aria-label="Stop creating blobs" aria-pressed="true">
            ${lavaLampOnIcon}
          </button>
        </div>
      </div>
    </div>
  </div>
  <aside class="brand-mark brand-mark--corner" tabindex="0" aria-expanded="false" aria-label="Link Web Development">
    <img class="brand-mark__icon" src="/favicon-light.png" alt="" width="40" height="40" decoding="async" />
    <div class="brand-mark__label">
      <span class="brand-mark__name">Link Web Development</span>
      <span class="brand-mark__meta">
        <span class="brand-mark__copy">© 2026</span>
        <a class="brand-mark__link" href="/terms/">Terms</a>
        <a class="brand-mark__link" href="/privacy/">Privacy</a>
      </span>
    </div>
  </aside>
  <div class="legal-cat" aria-hidden="true">
    <img class="legal-cat__img" alt="" width="200" height="338" decoding="async" />
  </div>
  <nav class="stage-map" aria-label="Site map">
    <p class="stage-map__title">Mini Map</p>
    <div class="stage-map__scale">
      <div class="stage-map__goo" aria-hidden="true">
        <div class="stage-map__blobs">
          <span class="stage-map__blob" data-to="play"></span>
          <span class="stage-map__blob" data-to="home"></span>
          <span class="stage-map__blob" data-to="work"></span>
          <span class="stage-map__blob stage-map__blob--locked" data-to="terms" aria-hidden="true"></span>
          <span class="stage-map__blob" data-to="about"></span>
          <span class="stage-map__blob" data-to="experience"></span>
          <span class="stage-map__blob stage-map__blob--locked" data-to="privacy" aria-hidden="true"></span>
          <span class="stage-map__blob" data-to="contact"></span>
          <span class="stage-map__void"></span>
        </div>
      </div>
      <div class="stage-map__grid">
        <button type="button" class="stage-map__cell" data-to="play" aria-label="Play">
          ${stageMapSelectArrow}
          <span class="stage-map__label">play</span>
        </button>
        <button type="button" class="stage-map__cell" data-to="home" aria-label="Home">
          ${stageMapSelectArrow}
          <span class="stage-map__label">home</span>
        </button>
        <button type="button" class="stage-map__cell" data-to="work" aria-label="View work">
          ${stageMapSelectArrow}
          <span class="stage-map__label">work</span>
        </button>
        <span class="stage-map__slot" data-to="terms" aria-hidden="true"></span>
        <button type="button" class="stage-map__cell" data-to="about" aria-label="About">
          ${stageMapSelectArrow}
          <span class="stage-map__label">about</span>
        </button>
        <button type="button" class="stage-map__cell" data-to="experience" aria-label="Experience">
          ${stageMapSelectArrow}
          <span class="stage-map__label">experience</span>
        </button>
        <span class="stage-map__slot" data-to="privacy" aria-hidden="true"></span>
        <button type="button" class="stage-map__cell" data-to="contact" aria-label="Get In Touch">
          ${stageMapSelectArrow}
          <span class="stage-map__label">contact</span>
        </button>
        <span class="stage-map__slot" aria-hidden="true"></span>
      </div>
    </div>
  </nav>
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
              <div class="work-detail-live" hidden></div>
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
          <div class="about-copy">
            <p class="about-intro">
              Hey there, I'm Kaleb
              <svg class="about-wave" viewBox="36 38 210 214" aria-hidden="true">
                <path fill="currentColor" fill-rule="evenodd" stroke="currentColor" stroke-width="8" stroke-linejoin="round" d="M132.3 48.6C125.7 51.9 124.8 54.3 113.5 98.8C106.7 125.2 104.2 132.2 98.8 138.4L95.5 142.1 92.1 134.9C83.6 117.2 64.2 106.2 52.3 112.4C44.8 116.2 44 122.6 50 131.3C55.5 139.4 57.9 146.5 59.1 158.3C61.7 184.4 64.1 193.6 71.4 206.1C79.7 220.3 97 232.1 116.4 237C145.9 244.4 170.1 229.4 190 191.5C195 182.1 196.5 180.3 216 160.5C233.4 142.9 236.9 138.9 237.4 135.9C238.6 129.2 233.6 121.6 227.3 120.4C221.2 119.3 217.7 120.7 208.1 128.6C203 132.7 198.6 136 198.4 135.8C198.2 135.6 203.7 126.4 210.5 115.5C217.4 104.5 223.3 94 223.6 92.3C225.5 82.4 216.6 73.5 206.7 75.4C201.5 76.4 199.1 78.8 189 93C183.9 100.1 179.7 106 179.5 106C179.3 106 182.3 98.7 186.2 89.8C197.5 63.5 198 60.7 192.3 53.9C184.8 45 171.2 46.8 166.1 57.2C165 59.6 160.3 69.8 155.6 80C150.9 90.2 147 98.3 147 98C147 97.7 148.6 89.5 150.4 79.7C153.2 65.3 153.6 61.2 152.8 58.2C150.3 49.1 140.6 44.5 132.3 48.6M134 55.8C131.7 57.7 124.2 83.1 118 110.5C114.7 124.6 109.4 137.2 104.1 143.2C100.2 147.6 100.2 147.6 104.8 149.9C117.7 156.6 126.7 173.9 124.5 187.8C123.4 194.8 123 195.8 121.4 196.4C118 197.7 117 195.2 117 185.6C117 169.1 112 161.1 97.6 154.5C90.8 151.3 90.3 150.8 89.1 146.8C84.3 130.7 71.8 118 60.6 118C53.1 118 51 121.4 55.4 126.7C61.8 134.3 65.1 145.3 67 165.4C70 196.3 80 213 102.1 223.9C137.4 241.4 163.3 229.3 185.7 184.6C190 176.1 191.3 174.6 210.1 156.2C227.9 138.9 230 136.4 230 133.5C230 129.8 227.4 127 223.9 127C222.2 127 215.3 131.9 202.1 142.5C181.4 159.1 181.9 158.8 179.6 156.4C177.6 154.4 176.7 156 198.9 120.5C208.9 104.5 217 90.5 217 89.2C217 86.2 212.7 82 209.6 82C205.9 82 203.3 84.9 190.9 102.5C177.4 121.7 168.1 134.8 165.8 137.9C163.8 140.7 159.6 140.5 159.2 137.5C159.1 136.4 163.9 123.8 170 109.5C188.9 65.3 189.5 63.7 187.9 60.4C185.2 54.8 178.2 53.5 174.4 57.9C173.5 58.9 165.5 75.6 156.5 95.1C141.6 127.2 139.9 130.5 137.5 130.8C135.9 131 134.8 130.6 134.4 129.5C134 128.7 136.5 113.8 139.9 96.6C143.2 79.4 146 63.7 146 61.7C146 55.4 138.9 51.9 134 55.8"/>
              </svg>
            </p>
            <p class="about-bio">
              I'm a web developer based in Abbotsford, BC. I'm a retired hip-hop dancer, high handicap golfer and karaoke drummer. Web design is my passion!
            </p>
            <div class="about-stack-wrap">
              <p class="about-label" id="about-stack-label">Toolkit</p>
              <ul class="about-stack" aria-labelledby="about-stack-label">
                <li class="about-stack__chip">WordPress</li>
                <li class="about-stack__chip">JavaScript</li>
                <li class="about-stack__chip">Shopify</li>
                <li class="about-stack__chip">PHP</li>
                <li class="about-stack__chip">HTML</li>
                <li class="about-stack__chip">CSS</li>
                <li class="about-stack__chip">SEO</li>
                <li class="about-stack__chip">Google Analytics</li>
              </ul>
            </div>
            <p class="about-caption" aria-live="polite" hidden></p>
          </div>
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
            <ul class="profile-socials" aria-label="Social profiles">
              <li>
                <a class="profile-social" target="_blank" rel="noopener noreferrer" href="https://www.pinterest.com/ks_link/" aria-label="Pinterest">
                  ${pinterestIcon}
                </a>
              </li>
              <li>
                <a class="profile-social" target="_blank" rel="noopener noreferrer" href="https://boxd.it/jPee1" aria-label="Letterboxd">
                  ${letterboxdIcon}
                </a>
              </li>
              <li>
                <a class="profile-social" target="_blank" rel="noopener noreferrer" href="https://www.chess.com/member/k_link" aria-label="Chess.com">
                  ${chessIcon}
                </a>
              </li>
              <li>
                <a class="profile-social" target="_blank" rel="noopener noreferrer" href="https://open.spotify.com/user/kaleb.s.link" aria-label="Spotify">
                  ${spotifyIcon}
                </a>
              </li>
            </ul>
          </div>
        </div>
    </section>
    <section class="screen screen--contact" aria-labelledby="contact-heading">
      <div class="screen-inner contact-layout">
        <h2 id="contact-heading" class="screen-title">Get In Touch</h2>
        <ul class="contact-list">
          <li>
            <a class="contact-list__email" href="mailto:contact@kaleblink.com">
              <span class="contact-list__label">Email</span>
              <span class="contact-list__detail">
                <span class="contact-list__copy-icon" aria-hidden="true">
                  <svg class="contact-list__copy-icon-copy" viewBox="0 0 24 24">
                    <rect x="9" y="9" width="11" height="11" rx="2" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linejoin="round"/>
                    <path fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" d="M15 9V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h3"/>
                  </svg>
                  <svg class="contact-list__copy-icon-check" viewBox="0 0 24 24">
                    <path fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" d="M5 12.5l4.5 4.5L19 7.5"/>
                  </svg>
                </span>
                <span class="contact-list__email-text" aria-live="polite">contact@kaleblink.com</span>
              </span>
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
    <section class="screen screen--terms" aria-labelledby="terms-heading">
      <div class="screen-inner legal-inner">
        <button type="button" class="legal-back" data-to="home">Back</button>
        <h2 id="terms-heading" class="legal-title">Terms &amp; Conditions</h2>
        <p class="legal-lede">Link Web Development</p>
        <p class="legal-updated">Last updated: 22 September 2026</p>

        <h3 class="legal-heading">1. Agreement to these terms</h3>
        <p>
          These Terms &amp; Conditions (“Terms”) govern your access to and use of
          <a href="https://kaleblink.com/">kaleblink.com</a> (the “Site”),
          operated by Link Web Development / Kaleb Link in Abbotsford, British
          Columbia, Canada. By using the Site, you agree to these Terms. If you
          do not agree, do not use the Site.
        </p>
        <p>
          Our collection and use of personal information is described in the
          <a class="legal-spa-link" href="/privacy/">Privacy Policy</a>.
        </p>

        <h3 class="legal-heading">2. The Site</h3>
        <p>
          The Site is a personal/professional portfolio and includes optional
          features such as a contact form and a play/leaderboard experience. We
          may change, suspend, or discontinue any part of the Site at any time
          without notice.
        </p>

        <h3 class="legal-heading">3. Acceptable use</h3>
        <p>You agree not to:</p>
        <ul>
          <li>Use the Site in any way that is unlawful or infringes others’ rights</li>
          <li>
            Abuse, overload, scrape, probe, or interfere with the Site,
            contact form, play feature, or related infrastructure
          </li>
          <li>
            Submit spam, malware, deceptive content, or harassing material
            through the contact form or play features
          </li>
          <li>
            Attempt to gain unauthorized access to accounts, systems, or data
          </li>
          <li>
            Impersonate others or use offensive, misleading, or infringing
            display names on the leaderboard
          </li>
        </ul>
        <p>
          We may remove content, reset game data, or restrict access if we
          reasonably believe these Terms have been violated.
        </p>

        <h3 class="legal-heading">4. Intellectual property</h3>
        <p>
          Unless otherwise noted, the Site’s design, text, graphics, logos, brand
          mark, code samples, and other materials are owned by Link Web
          Development or used with permission. You may view and share links to
          the Site for personal or ordinary professional reference. You may not
          copy, modify, distribute, sell, or create derivative works from Site
          content for commercial use without prior written permission, except as
          allowed by applicable law (including fair dealing).
        </p>

        <h3 class="legal-heading">5. User submissions</h3>
        <p>
          If you send a contact message or provide a play display name / game
          data, you grant us a non-exclusive, worldwide, royalty-free license to
          use that material as needed to operate the Site (for example, to reply
          to you and to display leaderboard entries). You represent that you have
          the right to submit that content and that it does not violate any law
          or third-party rights.
        </p>

        <h3 class="legal-heading">6. Play feature</h3>
        <p>
          The play experience is provided for entertainment on an “as is” basis.
          Scores, matches, and leaderboard rankings may be delayed, inaccurate,
          moderated, reset, or discontinued. We do not guarantee availability,
          fairness, or continuity of multiplayer or leaderboard data.
        </p>

        <h3 class="legal-heading">7. Third-party links and services</h3>
        <p>
          The Site may link to third-party sites or services (for example GitHub,
          LinkedIn, Google Analytics, Web3Forms, or Firebase). We are not
          responsible for their content, availability, or practices. Your use of
          third-party services is at your own risk and subject to their terms.
        </p>

        <h3 class="legal-heading">8. Disclaimers</h3>
        <p>
          The Site and its content are provided “as is” and “as available”
          without warranties of any kind, whether express or implied, including
          warranties of accuracy, merchantability, fitness for a particular
          purpose, or non-infringement, to the fullest extent permitted by law.
          Portfolio descriptions and project information are for general
          informational purposes and do not constitute professional advice or a
          binding offer of services unless separately agreed in writing.
        </p>

        <h3 class="legal-heading">9. Limitation of liability</h3>
        <p>
          To the fullest extent permitted by the laws of British Columbia and
          Canada, Link Web Development and Kaleb Link will not be liable for any
          indirect, incidental, special, consequential, or punitive damages, or
          any loss of profits, data, or goodwill, arising from your use of (or
          inability to use) the Site. Our total liability for any claim relating
          to the Site will not exceed CAD $100, except where liability cannot be
          limited under applicable law.
        </p>

        <h3 class="legal-heading">10. Indemnity</h3>
        <p>
          You agree to indemnify and hold harmless Link Web Development and Kaleb
          Link from claims, damages, losses, and expenses (including reasonable
          legal fees) arising out of your misuse of the Site or your violation of
          these Terms.
        </p>

        <h3 class="legal-heading">11. Changes and termination</h3>
        <p>
          We may update these Terms from time to time. The “Last updated” date
          will change when we do. Continued use of the Site after changes means
          you accept the updated Terms. We may suspend or terminate access to the
          Site or any feature at any time.
        </p>

        <h3 class="legal-heading">12. Governing law and venue</h3>
        <p>
          These Terms are governed by the laws of the Province of British
          Columbia and the applicable laws of Canada, without regard to conflict
          of law principles. You agree that courts located in British Columbia
          have exclusive jurisdiction over disputes arising from these Terms or
          the Site, except where prohibited by law.
        </p>

        <h3 class="legal-heading">13. Contact</h3>
        <p>
          Questions about these Terms:
          <a href="mailto:contact@kaleblink.com">contact@kaleblink.com</a>
        </p>

        <p class="legal-disclaimer">
          These Terms are a site-specific draft tailored to kaleblink.com. They
          are not formal legal advice. Consider having a lawyer review them if you
          need a binding commercial agreement.
        </p>

        <p class="legal-meta">
          © 2026 Link Web Development ·
          <a class="legal-spa-link" href="/privacy/">Privacy Policy</a>
        </p>
      </div>
    </section>
    <section class="screen screen--privacy" aria-labelledby="privacy-heading">
      <div class="screen-inner legal-inner">
        <button type="button" class="legal-back" data-to="home">Back</button>
        <h2 id="privacy-heading" class="legal-title">Privacy Policy</h2>
        <p class="legal-lede">Link Web Development</p>
        <p class="legal-updated">Last updated: 22 September 2026</p>

        <h3 class="legal-heading">1. Who we are</h3>
        <p>
          This Privacy Policy explains how Link Web Development (“we”, “us”, or
          “our”), operated by Kaleb Link in Abbotsford, British Columbia, Canada,
          collects, uses, and shares information when you use
          <a href="https://kaleblink.com/">kaleblink.com</a> (the “Site”),
          including the portfolio and play experience.
        </p>
        <p>
          Questions about this policy:
          <a href="mailto:contact@kaleblink.com">contact@kaleblink.com</a>
        </p>

        <h3 class="legal-heading">2. Information we collect</h3>
        <p>Depending on how you use the Site, we may collect:</p>
        <ul>
          <li>
            <strong>Contact form data.</strong> If you send a message, we receive
            your name, email address, and message content.
          </li>
          <li>
            <strong>Analytics data.</strong> If you accept analytics cookies, we
            use Google Analytics to collect usage information such as pages
            viewed, approximate location derived from IP address, device/browser
            type, and referral source.
          </li>
          <li>
            <strong>Local preferences.</strong> We store preferences in your
            browser (for example theme, blob animation preference, and cookie
            consent choice) using local storage.
          </li>
          <li>
            <strong>Play / leaderboard data.</strong> If you use the play feature,
            we may process an anonymous Firebase account identifier, a display
            name you choose, and game-related data such as scores for the
            leaderboard and multiplayer experience.
          </li>
        </ul>
        <p>
          We do not intentionally collect sensitive personal information through
          the Site.
        </p>

        <h3 class="legal-heading">3. How we use information</h3>
        <p>We use information to:</p>
        <ul>
          <li>Respond to inquiries and provide services you request</li>
          <li>Operate, maintain, and improve the Site</li>
          <li>Run the play feature and leaderboard</li>
          <li>Understand aggregate traffic and engagement (when analytics are accepted)</li>
          <li>Remember your preferences and consent choices</li>
          <li>Protect the Site against abuse and spam</li>
        </ul>

        <h3 class="legal-heading">4. Cookies and similar technologies</h3>
        <p>
          We show a consent banner for analytics. If you accept, Google Analytics
          may set cookies (such as <code>_ga</code> / <code>_gid</code>) to
          measure Site use. If you decline, we do not load Google Analytics and
          we will attempt to clear related Google Analytics cookies.
        </p>
        <p>
          Preference storage (theme, animation, consent) uses browser local
          storage rather than advertising cookies. You can clear cookies and site
          data in your browser settings at any time.
        </p>

        <h3 class="legal-heading">5. Third-party processors</h3>
        <p>We use service providers that process data on our behalf or as
          independent controllers, including:</p>
        <ul>
          <li>
            <strong>Google Analytics</strong> — usage analytics when you consent
          </li>
          <li>
            <strong>Web3Forms</strong> — delivery of contact form submissions
          </li>
          <li>
            <strong>Google Firebase</strong> (Authentication, Firestore, Realtime
            Database) — play accounts, game state, and leaderboard data
          </li>
        </ul>
        <p>
          Those providers have their own privacy practices. We encourage you to
          review them.
        </p>

        <h3 class="legal-heading">6. Retention</h3>
        <ul>
          <li>
            Contact messages are kept as long as reasonably needed to respond and
            manage follow-up communication.
          </li>
          <li>
            Analytics retention follows Google Analytics settings and Google’s
            policies.
          </li>
          <li>
            Play and leaderboard data are kept while the feature is offered,
            unless we remove data earlier or you successfully request deletion.
          </li>
          <li>
            Local preferences remain on your device until you clear them.
          </li>
        </ul>

        <h3 class="legal-heading">7. Your choices</h3>
        <ul>
          <li>Decline analytics via the cookie consent banner (or clear site data and choose again).</li>
          <li>
            Email
            <a href="mailto:contact@kaleblink.com">contact@kaleblink.com</a>
            to request access to or deletion of contact-form or play-related data
            we hold, where feasible and permitted by law. We may need enough
            information to locate your records (for example the email used in a
            contact message, or a display name and approximate play time).
          </li>
        </ul>

        <h3 class="legal-heading">8. Children’s privacy</h3>
        <p>
          The Site is not directed at children under 13, and we do not knowingly
          collect personal information from children under 13. If you believe a
          child has provided personal information, contact us and we will take
          reasonable steps to delete it.
        </p>

        <h3 class="legal-heading">9. International transfers</h3>
        <p>
          We are based in Canada. Some processors (including Google and Web3Forms)
          may store or process data in the United States or other countries. Those
          jurisdictions may have different data-protection laws than yours.
        </p>

        <h3 class="legal-heading">10. Changes</h3>
        <p>
          We may update this Privacy Policy from time to time. The “Last updated”
          date at the top will change when we do. Continued use of the Site after
          an update means you acknowledge the revised policy.
        </p>

        <h3 class="legal-heading">11. Governing law</h3>
        <p>
          This Privacy Policy is governed by the laws of the Province of British
          Columbia and the applicable laws of Canada, without regard to conflict
          of law principles.
        </p>

        <p class="legal-disclaimer">
          This page describes how the Site handles information based on its
          current features. It is provided for transparency and is not formal
          legal advice.
        </p>

        <p class="legal-meta">
          © 2026 Link Web Development ·
          <a class="legal-spa-link" href="/terms/">Terms &amp; Conditions</a>
        </p>
      </div>
    </section>
  </div>
`

const play = mountPlay(document.querySelector('.play-root'))
const root = document.documentElement
const toggle = document.querySelector('.theme-toggle')
const blobsRoot = document.querySelector('.blobs')
let metaballsRenderer = createMetaballs(document.querySelector('.blobs-canvas'))

const readBlobColor = () =>
  parseCssColor(getComputedStyle(root).getPropertyValue('--blob'))

const readAccentColor = () =>
  parseCssColor(getComputedStyle(root).getPropertyValue('--blob-depth'))

const syncMetaballColor = () => {
  metaballsRenderer?.setColor(readBlobColor())
  metaballsRenderer?.setAccent(readAccentColor())
  metaballsRenderer?.setGain(root.getAttribute('data-theme') === 'dark' ? 1.45 : 1)
}

if (metaballsRenderer) {
  blobsRoot?.classList.add('is-webgl')
  syncMetaballColor()
}

const getPreferredTheme = () => {
  const stored = localStorage.getItem('theme')
  if (stored === 'light' || stored === 'dark') return stored
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

const brandMarkIcons = document.querySelectorAll('.brand-mark__icon')
let themeFaviconLink = document.querySelector('link[rel="icon"][type="image/png"]:not([media])')
if (!themeFaviconLink) {
  themeFaviconLink = document.createElement('link')
  themeFaviconLink.rel = 'icon'
  themeFaviconLink.type = 'image/png'
  document.head.appendChild(themeFaviconLink)
}

const faviconForTheme = (theme) =>
  theme === 'dark' ? '/favicon-dark.png' : '/favicon-light.png'

const applyTheme = (theme) => {
  root.setAttribute('data-theme', theme)
  localStorage.setItem('theme', theme)
  const isDark = theme === 'dark'
  toggle.innerHTML = isDark ? sunIcon : moonIcon
  toggle.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode')
  const iconSrc = faviconForTheme(theme)
  brandMarkIcons.forEach((icon) => {
    icon.src = iconSrc
  })
  // Drop OS media-query icons so the tab follows the in-app theme.
  document.querySelectorAll('link[rel="icon"][media]').forEach((link) => link.remove())
  themeFaviconLink.href = iconSrc
  syncMetaballColor()
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

const accentToggle = document.querySelector('.accent-toggle')
const accentPicker = document.querySelector('#accent-picker')
const accentSwatches = [...document.querySelectorAll('.accent-swatch')]

const getPreferredAccent = () => {
  const stored = localStorage.getItem('accent')
  if (stored && ACCENT_PALETTE.includes(stored)) return stored
  return DEFAULT_ACCENT
}

const isAccentPickerOpen = () => Boolean(accentPicker?.classList.contains('is-open'))

let accentPickerCloseToken = 0

const setAccentPickerOpen = (open) => {
  const next = Boolean(open)
  if (accentPicker && next !== isAccentPickerOpen()) {
    const token = ++accentPickerCloseToken
    accentPicker.classList.toggle('is-open', next)
    accentPicker.classList.toggle('is-closing', !next)
    if (next) {
      accentPicker.hidden = false
    } else {
      const exits = accentPicker
        .getAnimations({ subtree: true })
        .filter((animation) => animation.animationName === 'accent-swatch-out')
      Promise.all(exits.map((animation) => animation.finished))
        .catch(() => { })
        .then(() => {
          if (token !== accentPickerCloseToken) return
          accentPicker.hidden = true
          accentPicker.classList.remove('is-closing')
        })
    }
  }
  accentToggle?.setAttribute('aria-expanded', next ? 'true' : 'false')
  accentToggle?.setAttribute(
    'aria-label',
    next ? 'Close accent colours' : 'Choose accent colour',
  )
}

const closeAccentPicker = () => setAccentPickerOpen(false)

const applyAccent = (color) => {
  const next = ACCENT_PALETTE.includes(color) ? color : DEFAULT_ACCENT
  root.style.setProperty('--accent', next)
  root.style.setProperty('--cursor-blob', next)
  localStorage.setItem('accent', next)
  accentSwatches.forEach((swatch) => {
    const selected = swatch.dataset.accent === next
    swatch.setAttribute('aria-selected', selected ? 'true' : 'false')
    swatch.classList.toggle('is-selected', selected)
  })
}

applyAccent(getPreferredAccent())

accentToggle?.addEventListener('click', (event) => {
  event.stopPropagation()
  setAccentPickerOpen(!isAccentPickerOpen())
})

accentPicker?.addEventListener('click', (event) => {
  event.stopPropagation()
  const swatch =
    event.target instanceof Element ? event.target.closest('.accent-swatch') : null
  if (!swatch?.dataset.accent) return
  applyAccent(swatch.dataset.accent)
})

const cursorToggle = document.querySelector('.cursor-toggle')
const cursorPicker = document.querySelector('#cursor-picker')
const cursorSwatches = [...document.querySelectorAll('.cursor-swatch')]

/** Replaced by the cursor follower once it is set up. */
let syncCursorStyle = () => { }

const getPreferredCursorStyle = () => {
  const stored = localStorage.getItem('cursorStyle')
  if (CURSOR_STYLES.includes(stored)) return stored
  return DEFAULT_CURSOR_STYLE
}

const isCursorPickerOpen = () => Boolean(cursorPicker?.classList.contains('is-open'))

let cursorPickerCloseToken = 0

const setCursorPickerOpen = (open) => {
  const next = Boolean(open)
  if (cursorPicker && next !== isCursorPickerOpen()) {
    const token = ++cursorPickerCloseToken
    cursorPicker.classList.toggle('is-open', next)
    cursorPicker.classList.toggle('is-closing', !next)
    if (next) {
      cursorPicker.hidden = false
    } else {
      const exits = cursorPicker
        .getAnimations({ subtree: true })
        .filter((animation) => animation.animationName === 'accent-swatch-out')
      Promise.all(exits.map((animation) => animation.finished))
        .catch(() => { })
        .then(() => {
          if (token !== cursorPickerCloseToken) return
          cursorPicker.hidden = true
          cursorPicker.classList.remove('is-closing')
        })
    }
  }
  cursorToggle?.setAttribute('aria-expanded', next ? 'true' : 'false')
  cursorToggle?.setAttribute(
    'aria-label',
    next ? 'Close cursor styles' : 'Choose cursor style',
  )
}

const closeCursorPicker = () => setCursorPickerOpen(false)

const applyCursorStyle = (style) => {
  const next = CURSOR_STYLES.includes(style) ? style : DEFAULT_CURSOR_STYLE
  root.dataset.cursor = next
  localStorage.setItem('cursorStyle', next)
  cursorSwatches.forEach((swatch) => {
    const selected = swatch.dataset.cursorStyle === next
    swatch.setAttribute('aria-selected', selected ? 'true' : 'false')
    swatch.classList.toggle('is-selected', selected)
  })
  syncCursorStyle()
}

applyCursorStyle(getPreferredCursorStyle())

cursorToggle?.addEventListener('click', (event) => {
  event.stopPropagation()
  setCursorPickerOpen(!isCursorPickerOpen())
})

cursorPicker?.addEventListener('click', (event) => {
  event.stopPropagation()
  const swatch =
    event.target instanceof Element ? event.target.closest('.cursor-swatch') : null
  if (!swatch?.dataset.cursorStyle) return
  applyCursorStyle(swatch.dataset.cursorStyle)
})

const menuToggle = document.querySelector('.menu-toggle')
const settingsToggle = document.querySelector('.settings-toggle')
const cornerMenu = document.querySelector('.corner-menu')
const mobileMenuMq = window.matchMedia('(max-width: 48rem)')

document.addEventListener('pointerdown', (event) => {
  if (!isAccentPickerOpen()) return
  const target = event.target
  if (!(target instanceof Node)) return
  if (accentPicker.contains(target) || accentToggle?.contains(target)) return
  closeAccentPicker()
})

document.addEventListener('pointerdown', (event) => {
  if (!isCursorPickerOpen()) return
  const target = event.target
  if (!(target instanceof Node)) return
  if (cursorPicker.contains(target) || cursorToggle?.contains(target)) return
  closeCursorPicker()
})

/** Extra px beyond each control’s visual radius for forgiving mobile taps. */
const MOBILE_TAP_HIT_PAD = 36

const isCornerBtnTappable = (btn) => {
  if (!(btn instanceof HTMLElement)) return false
  const style = getComputedStyle(btn)
  if (style.display === 'none' || style.visibility === 'hidden') return false
  if (style.pointerEvents === 'none') return false
  const rect = btn.getBoundingClientRect()
  return rect.width >= 1 && rect.height >= 1
}

const nearestCornerIconBtn = (clientX, clientY) => {
  if (!mobileMenuMq.matches) return null
  let best = null
  let bestDist = Infinity
  for (const btn of document.querySelectorAll('.corner-cluster .corner-btn')) {
    if (!isCornerBtnTappable(btn)) continue
    const rect = btn.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    const dist = Math.hypot(clientX - cx, clientY - cy)
    const hitR = Math.max(rect.width, rect.height) / 2 + MOBILE_TAP_HIT_PAD
    if (dist <= hitR && dist < bestDist) {
      bestDist = dist
      best = btn
    }
  }
  return best
}

const setCornerMenuOpen = (open) => {
  const onPlayMobile = mobileMenuMq.matches && app.dataset.screen === 'play'
  // Mobile play flattens to theme-only; menu toggle is hidden there.
  const next = Boolean(open) && !onPlayMobile
  if (next) app.dataset.cornerMenu = 'open'
  else delete app.dataset.cornerMenu
  cornerMenu?.classList.toggle('is-open', next)
  if (!next) {
    closeAccentPicker()
    closeCursorPicker()
  }
  if (cornerMenu) {
    // Play mobile shows theme inline; elsewhere hide closed overlay from a11y.
    const a11yHidden = !next && !onPlayMobile
    cornerMenu.setAttribute('aria-hidden', a11yHidden ? 'true' : 'false')
  }
  if (menuToggle) {
    menuToggle.setAttribute('aria-expanded', next ? 'true' : 'false')
    menuToggle.setAttribute('aria-label', next ? 'Close menu' : 'Open menu')
  }
  if (settingsToggle) {
    settingsToggle.setAttribute('aria-expanded', next ? 'true' : 'false')
    settingsToggle.setAttribute('aria-label', next ? 'Close settings' : 'Open settings')
  }
}

const closeCornerMenu = () => setCornerMenuOpen(false)

setCornerMenuOpen(false)

const toggleCornerMenu = (event) => {
  event.stopPropagation()
  setCornerMenuOpen(app.dataset.cornerMenu !== 'open')
}

menuToggle?.addEventListener('click', toggleCornerMenu)
settingsToggle?.addEventListener('click', toggleCornerMenu)

const brandMarkCorner = document.querySelector('.brand-mark--corner')

const setBrandMarkOpen = (open) => {
  if (!brandMarkCorner) return
  const next = Boolean(open) && mobileMenuMq.matches && app.dataset.screen !== 'play'
  brandMarkCorner.setAttribute('aria-expanded', next ? 'true' : 'false')
}

const closeBrandMark = () => setBrandMarkOpen(false)

brandMarkCorner?.addEventListener('click', (event) => {
  if (!mobileMenuMq.matches) return
  if (event.target instanceof Element && event.target.closest('a')) return
  event.stopPropagation()
  setBrandMarkOpen(brandMarkCorner.getAttribute('aria-expanded') !== 'true')
})

brandMarkCorner?.addEventListener('keydown', (event) => {
  if (!mobileMenuMq.matches) return
  if (event.key !== 'Enter' && event.key !== ' ') return
  if (event.target !== brandMarkCorner) return
  event.preventDefault()
  setBrandMarkOpen(brandMarkCorner.getAttribute('aria-expanded') !== 'true')
})

document.addEventListener('pointerdown', (event) => {
  if (app.dataset.cornerMenu !== 'open') return
  const target = event.target
  if (!(target instanceof Node)) return
  if (
    cornerMenu?.contains(target) ||
    menuToggle?.contains(target) ||
    settingsToggle?.contains(target)
  ) {
    return
  }
  // Keep open when tapping within a menu icon’s hit radius (same pad as mini map).
  if (nearestCornerIconBtn(event.clientX, event.clientY)) return
  closeCornerMenu()
})

document.addEventListener(
  'click',
  (event) => {
    if (!mobileMenuMq.matches) return
    if (swipeClaimedClick) return
    const nearest = nearestCornerIconBtn(event.clientX, event.clientY)
    if (!nearest) return
    const hit =
      event.target instanceof Element ? event.target.closest('.corner-btn') : null
    if (hit === nearest) return
    // Prefer closest icon when tap lands in overlapping hit radii, or activate on near-miss.
    if (
      !hit &&
      event.target instanceof Element &&
      event.target.closest(
        'a, button, input, textarea, select, label, .stage-map__cell, .accent-picker, .cursor-picker',
      )
    ) {
      return
    }
    event.preventDefault()
    event.stopImmediatePropagation()
    nearest.click()
  },
  true,
)

document.addEventListener('pointerdown', (event) => {
  if (brandMarkCorner?.getAttribute('aria-expanded') !== 'true') return
  const target = event.target
  if (!(target instanceof Node)) return
  if (brandMarkCorner.contains(target)) return
  closeBrandMark()
})

const onMobileMenuMqChange = () => {
  setCornerMenuOpen(false)
  closeBrandMark()
}

if (typeof mobileMenuMq.addEventListener === 'function') {
  mobileMenuMq.addEventListener('change', onMobileMenuMqChange)
} else {
  mobileMenuMq.addListener(onMobileMenuMqChange)
}

const screens = new Set(['play', 'home', 'work', 'about', 'experience', 'contact', 'terms', 'privacy'])
const lockedScreens = new Set(['terms', 'privacy'])
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
  iframe: null,
  arm: document.querySelector('.work-detail-live-arm'),
  blob: document.querySelector('.work-detail-live-arm-blob'),
  magnet: { x: 0, y: 0 },
  previewUrl: '',
  hasLoaded: false,
  resetting: false,
}

const LIVE_IFRAME_SANDBOX = 'allow-scripts allow-same-origin'

const resetLivePreviewNavState = () => {
  projectLive.previewUrl = ''
  projectLive.hasLoaded = false
  projectLive.resetting = false
}

const ensureLiveIframe = () => {
  if (projectLive.iframe || !projectLive.live) return projectLive.iframe
  const iframe = document.createElement('iframe')
  iframe.className = 'work-detail-live-frame'
  iframe.title = ''
  iframe.loading = 'lazy'
  iframe.referrerPolicy = 'no-referrer'
  iframe.setAttribute('sandbox', LIVE_IFRAME_SANDBOX)
  iframe.addEventListener('load', () => {
    if (projectLive.resetting) {
      projectLive.resetting = false
      projectLive.hasLoaded = true
      return
    }
    if (!projectLive.hasLoaded) {
      projectLive.hasLoaded = true
      return
    }
    const url = projectLive.previewUrl
    if (!url || !projectLive.iframe) return
    projectLive.resetting = true
    projectLive.iframe.src = url
  })
  projectLive.live.appendChild(iframe)
  projectLive.iframe = iframe
  return iframe
}

const destroyLiveIframe = () => {
  if (!projectLive.iframe) return
  projectLive.iframe.removeAttribute('src')
  projectLive.iframe.remove()
  projectLive.iframe = null
  resetLivePreviewNavState()
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
  destroyLiveIframe()
}

const setupLivePreview = (project) => {
  if (!project?.url || project.livePreview === false || !projectLive.live || !projectLive.arm) {
    teardownLivePreview()
    return
  }

  const iframe = ensureLiveIframe()
  if (!iframe) {
    teardownLivePreview()
    return
  }

  projectLive.wrap?.classList.add('is-live')
  projectLive.wrap?.classList.remove('is-armed')
  projectLive.live.hidden = false
  projectLive.arm.hidden = false
  iframe.title = `Live preview of ${project.name}`
  projectLive.previewUrl = project.url
  if (iframe.getAttribute('src') !== project.url) {
    projectLive.hasLoaded = false
    projectLive.resetting = false
    iframe.src = project.url
  }
  syncPreviewScale()
}

const parseRouteParts = (rawPath) => {
  const path = rawPath.replace(/^\/?/, '').replace(/\/$/, '')
  if (!path) return { screen: 'home', project: '' }
  const [screenPart, projectPart] = path.split('/')
  const screen = screens.has(screenPart) ? screenPart : 'home'
  const project =
    screen === 'work' && projectPart && projectById.has(projectPart) ? projectPart : ''
  return { screen, project }
}

const parsePath = () => parseRouteParts(window.location.pathname)

const pathForRoute = (screen, project = '') => {
  if (screen === 'home') return '/'
  if (screen === 'work' && project) return `/work/${project}/`
  return `/${screen}/`
}

const migrateLegacyHashRoute = () => {
  const hash = window.location.hash
  if (!hash.startsWith('#/')) return null
  const route = parseRouteParts(hash.replace(/^#\/?/, ''))
  const nextPath = pathForRoute(route.screen, route.project)
  history.replaceState(route, '', nextPath + window.location.search)
  return route
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
  if (dest === 'terms') return 'Terms & Conditions'
  if (dest === 'privacy') return 'Privacy Policy'
  return dest
}

const navBlobs = [...document.querySelectorAll('.nav-blob')]
const stageMap = document.querySelector('.stage-map')
const stageMapCells = [...document.querySelectorAll('.stage-map__cell')]
const stageMapBlobs = [...document.querySelectorAll('.stage-map__blob')]
const mapToggle = document.querySelector('.map-toggle')
const mobileStageMapMq = window.matchMedia('(max-width: 48rem)')

const clearStageMapSelection = () => {
  stageMapCells.forEach((cell) => cell.classList.remove('is-selected'))
  stageMapBlobs.forEach((blob) => blob.classList.remove('is-selected'))
}

const selectStageMapDest = (dest) => {
  if (lockedScreens.has(dest)) {
    clearStageMapSelection()
    return
  }
  stageMapCells.forEach((cell) => {
    cell.classList.toggle('is-selected', cell.dataset.to === dest)
  })
  stageMapBlobs.forEach((blob) => {
    blob.classList.toggle('is-selected', blob.dataset.to === dest)
  })
}

const isStageMapOpen = () => app.dataset.stageMap === 'open'

const syncStageMapA11y = () => {
  if (!stageMap) return
  if (!mobileStageMapMq.matches) {
    stageMap.removeAttribute('aria-hidden')
  } else {
    stageMap.setAttribute('aria-hidden', isStageMapOpen() ? 'false' : 'true')
  }
  if (mapToggle) {
    const open = isStageMapOpen()
    mapToggle.setAttribute('aria-pressed', open ? 'true' : 'false')
    mapToggle.setAttribute('aria-label', open ? 'Close site map' : 'Open site map')
  }
}

const closeStageMap = () => {
  if (!isStageMapOpen()) return
  delete app.dataset.stageMap
  stageMap?.classList.remove('is-mobile-open')
  clearStageMapSelection()
  syncStageMapA11y()
}

const openStageMap = () => {
  if (!mobileStageMapMq.matches || isStageMapOpen()) return
  if (document.querySelector('.play-root.is-playing')) return
  closeCornerMenu()
  app.dataset.stageMap = 'open'
  stageMap?.classList.add('is-mobile-open')
  // Current page starts selected so its label shows; another tap moves selection.
  selectStageMapDest(app.dataset.screen || 'home')
  syncStageMapA11y()
}

const toggleStageMap = () => {
  if (isStageMapOpen()) closeStageMap()
  else openStageMap()
}

/** Extra px beyond each blob’s visual radius for forgiving mobile taps. */
const STAGE_MAP_HIT_PAD = MOBILE_TAP_HIT_PAD

const nearestStageMapBlob = (clientX, clientY) => {
  let best = null
  let bestDist = Infinity
  for (const blob of stageMapBlobs) {
    if (!blob.dataset.to) continue
    const rect = blob.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    const dist = Math.hypot(clientX - cx, clientY - cy)
    const hitR = Math.max(rect.width, rect.height) / 2 + STAGE_MAP_HIT_PAD
    if (dist <= hitR && dist < bestDist) {
      bestDist = dist
      best = blob
    }
  }
  return best
}

const nearestStageMapDest = (clientX, clientY) => {
  const dest = nearestStageMapBlob(clientX, clientY)?.dataset.to
  return dest && !lockedScreens.has(dest) ? dest : null
}

const pulseLockedStageMapBlob = (dest) => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const blob = stageMapBlobs.find((b) => b.dataset.to === dest)
  if (!blob) return
  blob.getAnimations().forEach((anim) => {
    if (anim.id === 'stage-map-locked-pulse') anim.cancel()
  })
  const anim = blob.animate(
    [{ scale: 1 }, { scale: 1.32, offset: 0.4 }, { scale: 0.94, offset: 0.75 }, { scale: 1 }],
    { duration: 420, easing: 'ease-out' },
  )
  anim.id = 'stage-map-locked-pulse'
}

const activateStageMapDest = (dest) => {
  if (!dest || lockedScreens.has(dest)) return
  if (isStageMapOpen()) {
    const selected = stageMapCells.some(
      (cell) => cell.dataset.to === dest && cell.classList.contains('is-selected'),
    )
    if (selected) setScreen(dest, { push: true })
    else selectStageMapDest(dest)
    const focused = document.activeElement
    if (focused instanceof HTMLElement && focused.classList.contains('stage-map__cell')) {
      focused.blur()
    }
    return
  }
  setScreen(dest, { push: true })
}

document.addEventListener('pointerdown', (event) => {
  if (!isStageMapOpen()) return
  const target = event.target
  if (!(target instanceof Element)) return
  if (target.closest('.corner-cluster')) return
  // Keep open when tapping a blob or within its hit radius.
  if (nearestStageMapBlob(event.clientX, event.clientY)) return
  if (target.closest('.stage-map__cell')) return
  closeStageMap()
})

stageMap?.querySelector('.stage-map__scale')?.addEventListener('click', (event) => {
  const target = event.target instanceof Element ? event.target : null
  if (!isStageMapOpen()) {
    const slot = target?.closest('.stage-map__slot[data-to]')
    if (slot && lockedScreens.has(slot.dataset.to)) pulseLockedStageMapBlob(slot.dataset.to)
    return
  }
  // Direct cell hits are handled below; this catches near-misses on slots/gaps.
  if (target?.closest('.stage-map__cell')) return
  const dest = nearestStageMapBlob(event.clientX, event.clientY)?.dataset.to
  if (!dest) return
  event.preventDefault()
  if (lockedScreens.has(dest)) pulseLockedStageMapBlob(dest)
  else activateStageMapDest(dest)
})

const routeEffects = {
  syncScroll: () => { },
  syncCursor: () => { },
}
document.querySelector('.play-root')?.addEventListener('playchange', () => {
  routeEffects.syncCursor()
})

document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return
  if (isAccentPickerOpen()) {
    closeAccentPicker()
    accentToggle?.focus({ preventScroll: true })
    return
  }
  if (isCursorPickerOpen()) {
    closeCursorPicker()
    cursorToggle?.focus({ preventScroll: true })
    return
  }
  if (app.dataset.stageMap === 'open') {
    closeStageMap()
    return
  }
  if (app.dataset.cornerMenu === 'open') {
    closeCornerMenu()
    const focusToggle = mobileMenuMq.matches ? menuToggle : settingsToggle
    focusToggle?.focus({ preventScroll: true })
    return
  }
  if (brandMarkCorner?.getAttribute('aria-expanded') === 'true') {
    closeBrandMark()
    brandMarkCorner.focus({ preventScroll: true })
  }
})

syncStageMapA11y()
if (typeof mobileStageMapMq.addEventListener === 'function') {
  mobileStageMapMq.addEventListener('change', () => {
    if (!mobileStageMapMq.matches) closeStageMap()
    syncStageMapA11y()
  })
} else {
  mobileStageMapMq.addListener(() => {
    if (!mobileStageMapMq.matches) closeStageMap()
    syncStageMapA11y()
  })
}

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

let stageMapTravelTimer = 0
const syncStageMap = (screen) => {
  stageMapCells.forEach((cell) => {
    const here = cell.dataset.to === screen
    cell.classList.toggle('is-here', here)
    if (here) cell.setAttribute('aria-current', 'page')
    else cell.removeAttribute('aria-current')
  })
  stageMapBlobs.forEach((blob) => {
    blob.classList.toggle('is-here', blob.dataset.to === screen)
  })
}

const flashStageMapTravel = (screen) => {
  const destCells = stageMapCells.filter((cell) => cell.dataset.to === screen)
  const destBlobs = stageMapBlobs.filter((blob) => blob.dataset.to === screen)
  if (!destCells.length && !destBlobs.length) return

  stageMapCells.forEach((cell) => cell.classList.remove('is-traveling'))
  stageMapBlobs.forEach((blob) => blob.classList.remove('is-traveling'))
  destCells.forEach((cell) => cell.classList.add('is-traveling'))
  destBlobs.forEach((blob) => blob.classList.add('is-traveling'))

  window.clearTimeout(stageMapTravelTimer)
  stageMapTravelTimer = window.setTimeout(() => {
    destCells.forEach((cell) => cell.classList.remove('is-traveling'))
    destBlobs.forEach((blob) => blob.classList.remove('is-traveling'))
  }, 480)
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
  const pagePath = window.location.pathname + window.location.search
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

const legalCat = document.querySelector('.legal-cat')
const legalCatImg = legalCat?.querySelector('.legal-cat__img')
const LEGAL_CAT_SRC = '/legal/clapping-cat.webp'
/** Total frame duration of clapping-cat.webp (one full loop). Update if the animation changes. */
const LEGAL_CAT_MS = 6869
let legalCatTimer = 0
let legalCatShowId = 0
let legalCatBlob = null
let legalCatUrl = ''

const loadLegalCatBlob = () => {
  legalCatBlob ??= fetch(LEGAL_CAT_SRC)
    .then((res) => {
      if (!res.ok) throw new Error(`clapping cat ${res.status}`)
      return res.blob()
    })
    .catch((err) => {
      legalCatBlob = null
      throw err
    })
  return legalCatBlob
}

const hideLegalCat = () => {
  legalCatShowId += 1
  window.clearTimeout(legalCatTimer)
  legalCat?.classList.remove('is-visible')
}

const showLegalCat = () => {
  if (!legalCat || !legalCatImg) return
  hideLegalCat()
  const showId = legalCatShowId
  loadLegalCatBlob()
    .then((blob) => {
      if (showId !== legalCatShowId) return
      // A fresh object URL makes the browser restart the GIF from frame one.
      if (legalCatUrl) URL.revokeObjectURL(legalCatUrl)
      legalCatUrl = URL.createObjectURL(blob)
      legalCatImg.onload = () => {
        if (showId !== legalCatShowId) return
        legalCat.classList.add('is-visible')
        legalCatTimer = window.setTimeout(hideLegalCat, LEGAL_CAT_MS)
      }
      legalCatImg.src = legalCatUrl
    })
    .catch(() => { })
}

const setRoute = (screen, project = '', { push = false, focus = false } = {}) => {
  if (!screens.has(screen)) {
    screen = 'home'
    project = ''
  }
  if (screen !== 'work') project = ''
  if (project && !projectById.has(project)) project = ''

  closeStageMap()

  const prevScreen = app.dataset.screen || ''
  const prevProject = app.dataset.project || ''
  const shouldFocus = focus && prevProject !== project
  const opening = Boolean(project) && !prevProject

  app.dataset.screen = screen
  if (lockedScreens.has(screen) && screen !== prevScreen) showLegalCat()
  else if (!lockedScreens.has(screen)) hideLegalCat()
  closeCornerMenu()
  closeBrandMark()
  app.style.setProperty('--work-swipe', '0px')
  syncNavLabels(screen, project)
  syncStageMap(screen)
  if (screen !== prevScreen) flashStageMapTravel(screen)
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

  const nextPath = pathForRoute(screen, project)
  const state = { screen, project }
  if (window.location.pathname !== nextPath) {
    if (push) history.pushState(state, '', nextPath)
    else history.replaceState(state, '', nextPath)
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

stageMapCells.forEach((btn) => {
  btn.addEventListener('click', (event) => {
    const dest = btn.dataset.to
    if (!dest) return
    if (isStageMapOpen()) {
      // Prefer closest blob when the tap lands in overlapping hit radii.
      const nearest = nearestStageMapDest(event.clientX, event.clientY)
      activateStageMapDest(nearest || dest)
      return
    }
    activateStageMapDest(dest)
    btn.blur()
  })
})

mapToggle?.addEventListener('click', (event) => {
  event.stopPropagation()
  toggleStageMap()
})

window.addEventListener('popstate', () => {
  const { screen, project } = parsePath()
  setRoute(screen, project, { push: false, focus: true })
})

const initialRoute = migrateLegacyHashRoute() ?? parsePath()
setRoute(initialRoute.screen, initialRoute.project)

homeToggle.addEventListener('click', () => {
  setScreen('home', { push: true })
})

document.querySelector('.hero-cta')?.addEventListener('click', (e) => {
  e.preventDefault()
  setScreen('contact', { push: true })
})

document.querySelectorAll('.brand-mark__link, .legal-spa-link').forEach((link) => {
  link.addEventListener('click', (e) => {
    const href = link.getAttribute('href') || ''
    const screen = href.replace(/^\/|\/$/g, '')
    if (!lockedScreens.has(screen)) return
    e.preventDefault()
    setScreen(screen, { push: true })
  })
})

document.querySelectorAll('.legal-back').forEach((btn) => {
  btn.addEventListener('click', () => {
    const dest = btn.dataset.to || 'home'
    setScreen(dest, { push: true })
  })
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

const PLAY_START_SWIPE_PAD = 56

const isInteractiveTarget = (el) => {
  if (!el?.closest) return false
  if (el.closest('.profile-blob-shape')) return true
  // Gameplay captures gestures; welcome screen allows swipe-back to home
  if (el.closest('.play-root.is-playing')) return true
  // Keep play CTA / naming / leaderboard from starting page swipes
  if (el.closest('.play-start, .play-name-prompt, .play-leaderboard-wrap')) return true
  // Contact form fills the screen — allow edge swipes from fields/buttons
  if (app.dataset.screen === 'contact' && el.closest('.contact-form, .contact-form-wrap')) {
    return false
  }
  return Boolean(el.closest('button, a, input, textarea, select, label'))
}

const inPlayStartSafeZone = (x, y) => {
  if (app.dataset.screen !== 'play') return false
  if (document.querySelector('.play-root.is-playing')) return false
  const btn = document.querySelector('.play-start')
  if (!btn) return false
  const r = btn.getBoundingClientRect()
  return (
    x >= r.left - PLAY_START_SWIPE_PAD &&
    x <= r.right + PLAY_START_SWIPE_PAD &&
    y >= r.top - PLAY_START_SWIPE_PAD &&
    y <= r.bottom + PLAY_START_SWIPE_PAD
  )
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
  if (isStageMapOpen()) return
  if (isInteractiveTarget(target)) return
  // Near-miss taps on the play blob should start the game, not a page swipe
  if (inPlayStartSafeZone(x, y)) return
  // Same forgiving radius as the expanded mini map / corner icons
  if (nearestCornerIconBtn(x, y)) return
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

const PINCH_MAP_THRESHOLD = 40
let mapPinch = null

const touchPairDistance = (touches) => {
  const a = touches[0]
  const b = touches[1]
  return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY)
}

const canPinchStageMap = () => {
  if (!swipeMq.matches) return false
  if (document.querySelector('.play-root.is-playing')) return false
  return true
}

const cancelActiveSwipe = () => {
  if (!swipeStart) return
  swipeStart = null
  resetSwipeOffset()
}

app.addEventListener(
  'touchstart',
  (e) => {
    if (!canPinchStageMap()) return
    if (e.touches.length !== 2) return
    if (e.target?.closest?.('input, textarea, select, label')) return
    cancelActiveSwipe()
    mapPinch = {
      startDist: touchPairDistance(e.touches),
      fired: false,
    }
  },
  { passive: true, capture: true },
)

app.addEventListener(
  'touchmove',
  (e) => {
    if (!mapPinch || e.touches.length !== 2) return
    if (e.cancelable) e.preventDefault()
    if (mapPinch.fired) return
    const dist = touchPairDistance(e.touches)
    const delta = dist - mapPinch.startDist
    if (Math.abs(delta) < PINCH_MAP_THRESHOLD) return
    mapPinch.fired = true
    if (delta < 0) openStageMap()
    else closeStageMap()
  },
  { passive: false, capture: true },
)

const endMapPinch = (e) => {
  if (e.touches.length < 2) mapPinch = null
}

app.addEventListener('touchend', endMapPinch, { passive: true, capture: true })
app.addEventListener('touchcancel', endMapPinch, { passive: true, capture: true })


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

const randomBlobLight = () => {
  const a = rand(0, Math.PI * 2)
  const r = rand(0.1, 0.88)
  return {
    lx: Math.cos(a) * r,
    ly: Math.sin(a) * r,
    hiSize: rand(0.5, 1),
    hiBright: rand(0.12, 0.38),
  }
}

const createBlob = (el, index) => {
  const size = rand(0.07, 0.4)
  const lane = rand(0.18, 0.82)
  const light = randomBlobLight()
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
    ...light,
  }
}

const blobs = blobEls.map((el, i) => {
  const blob = createBlob(el, i)
  if (i >= VISIBLE_MAX) {
    blob.retired = true
    blob.progress = i % 2 ? 1 : 0
    blob.nest = 0
  }
  return blob
})
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
const PROFILE_SOCIAL_SIZE = 0.2
const PROFILE_SOCIAL_MIN = 44
const PROFILE_SOCIAL_MAX = 60
const PROFILE_SOCIAL_PUSH = 0.35
const PROFILE_SOCIAL_ORBITS = [
  { angle: Math.PI * 0.5, speed: 0.05, rx: 0.62, ry: 0.72 },
  { angle: Math.PI * 1.25, speed: 0.045, rx: 0.64, ry: 0.7 },
  { angle: Math.PI * 1.8, speed: 0.055, rx: 0.6, ry: 0.74 },
  { angle: Math.PI * 0.95, speed: 0.048, rx: 0.63, ry: 0.72 },
]
const PROFILE_SOCIAL_STATIC_OFFSETS = [
  { fx: 0.92, fy: 0.12 },
  { fx: 0.06, fy: 0.62 },
  { fx: 0.9, fy: 0.84 },
  { fx: 0.08, fy: 0.3 },
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
const PROFILE_CAPTIONS = ["That's me", 'I like fishing too', 'Posing for the camera']
const PROFILE_OUCHES = [
  'Ouch!',
  'That tickles',
  'YEEEEOOOOOOCH',
  'Ow ow ow ow',
  'Hey, careful now',
  'Ouchie',
  'Oof',
  'AHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH',
]

const profileWrap = document.querySelector('.profile-blob')
const profileShapes = [...(profileWrap?.querySelectorAll('.profile-blob-shape') ?? [])]
const randInt = (min, max) => Math.floor(rand(min, max + 1))

const aboutWave = document.querySelector('.about-wave')
document.querySelector('.about-intro')?.addEventListener('pointerenter', () => {
  const wave = aboutWave?.getAnimations().find((a) => a.animationName === 'about-wave')
  if (!wave || wave.playState !== 'finished') return
  wave.currentTime = wave.effect.getTiming().delay
  wave.play()
})

const aboutCaption = document.querySelector('.about-caption')
let captionHoverId = null
const captionOuches = []
let lastOuch = ''

const renderAboutCaption = () => {
  if (!aboutCaption) return
  const ouch = captionOuches.at(-1)?.text
  const text = ouch ?? (captionHoverId == null ? null : PROFILE_CAPTIONS[captionHoverId])
  if (!text) {
    aboutCaption.hidden = true
    aboutCaption.textContent = ''
    return
  }
  if (!aboutCaption.hidden && aboutCaption.textContent === text) return
  aboutCaption.textContent = text
  aboutCaption.classList.toggle('is-ouch', ouch != null)
  aboutCaption.style.animation = 'none'
  void aboutCaption.offsetWidth
  aboutCaption.style.animation = ''
  aboutCaption.hidden = false
}

const pinCaptionOuch = (id) => {
  const options = PROFILE_OUCHES.filter((text) => text !== lastOuch)
  lastOuch = options[randInt(0, options.length - 1)]
  const i = captionOuches.findIndex((entry) => entry.id === id)
  if (i >= 0) captionOuches.splice(i, 1)
  captionOuches.push({ id, text: lastOuch })
  renderAboutCaption()
}

const unpinCaptionOuch = (id) => {
  const i = captionOuches.findIndex((entry) => entry.id === id)
  if (i < 0) return
  captionOuches.splice(i, 1)
  renderAboutCaption()
}

const setCaptionHover = (id) => {
  if (swipeMq.matches) id = null
  if (captionHoverId === id) return
  captionHoverId = id
  renderAboutCaption()
}

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

const createProfileSocial = (el, i) => {
  const orbit = PROFILE_SOCIAL_ORBITS[i % PROFILE_SOCIAL_ORBITS.length]
  const social = {
    ...createProfileBlob(el, PROFILE_ORBITS.length + i),
    social: true,
    familyId: null,
    isOrigin: false,
    host: false,
    mode: 'social',
    held: false,
    angle: orbit.angle,
    orbitSpeed: orbit.speed + rand(-0.006, 0.006),
    orbitDir: 1,
    orbitRx: orbit.rx,
    orbitRy: orbit.ry,
  }
  const hold = (held) => () => {
    social.held = held
  }
  el.addEventListener('pointerenter', hold(true))
  el.addEventListener('pointerleave', hold(false))
  el.addEventListener('focus', hold(true))
  el.addEventListener('blur', hold(false))
  return social
}

const profileSocials = profileWrap
  ? [...profileWrap.querySelectorAll('.profile-social')].map(createProfileSocial)
  : []

const profileSizePx = (blob, cw, ch) => {
  if (blob.social) {
    return Math.min(PROFILE_SOCIAL_MAX, Math.max(PROFILE_SOCIAL_MIN, Math.min(cw, ch) * PROFILE_SOCIAL_SIZE))
  }
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

  profileSocials.forEach((social, i) => {
    const off = PROFILE_SOCIAL_STATIC_OFFSETS[i % PROFILE_SOCIAL_STATIC_OFFSETS.length]
    social.s = profileSizePx(social, cw, ch)
    social.left = Math.max(0, cw - social.s) * off.fx
    social.top = Math.max(0, ch - social.s) * off.fy
    social.x = social.left + social.s / 2
    social.y = social.top + social.s / 2
    paintProfileBlob(social, social.left, social.top, social.s, profileBlobRadius(social))
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
  unpinCaptionOuch(family.id)
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
  pinCaptionOuch(family.id)

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

  const moonAnchors = [
    ...(hideMoons ? [] : profileFamilies.filter((family) => !family.host).map((family) => family.anchor)),
    ...profileSocials,
  ]
  const angleGain = 1 - Math.exp(-Math.max(dt, 0.001) * PROFILE_MOON_ANGLE_RATE)
  const minAngle = Math.min(PROFILE_MOON_MIN_ANGLE, ((Math.PI * 2) / moonAnchors.length) * 0.9)
  for (let i = 0; i < moonAnchors.length; i++) {
    for (let j = i + 1; j < moonAnchors.length; j++) {
      const a = moonAnchors[i]
      const b = moonAnchors[j]
      let dAngle = b.angle - a.angle
      while (dAngle > Math.PI) dAngle -= Math.PI * 2
      while (dAngle < -Math.PI) dAngle += Math.PI * 2
      const abs = Math.abs(dAngle) || 0.001
      if (abs >= minAngle) continue
      const push = (minAngle - abs) * angleGain
      const sign = dAngle >= 0 ? 1 : -1
      if (!a.held) a.angle -= sign * push * 0.5
      if (!b.held) b.angle += sign * push * 0.5
    }
  }
  moonAnchors.forEach((anchor) => {
    if (anchor.social) {
      tickProfileOrbit(
        anchor,
        hostAnchor,
        t,
        anchor.held ? 0 : dt,
        mouseX,
        mouseY,
        blobReach,
        blobPush * PROFILE_SOCIAL_PUSH,
      )
    } else {
      tickProfileOrbit(anchor, hostAnchor, t, dt, mouseX, mouseY, blobReach, blobPush)
    }
  })

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
  separateProfileBlobs(dt, [
    ...stillVisible.filter((blob) => blob.mode !== 'merging'),
    ...profileSocials,
  ])
  for (const blob of [...stillVisible, ...profileSocials]) {
    paintProfileBlob(blob, blob.left, blob.top, blob.s, profileBlobRadius(blob, t))
  }
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

  const captionIdFor = (target) => {
    const shape = target instanceof Element ? target.closest('.profile-blob-shape') : null
    if (!shape || !profileWrap.contains(shape)) return null
    return blobFromShape(shape)?.familyId ?? null
  }

  profileWrap.addEventListener('pointerover', (e) => setCaptionHover(captionIdFor(e.target)))
  profileWrap.addEventListener('pointerleave', () => setCaptionHover(null))
  profileWrap.addEventListener('focusin', (e) => setCaptionHover(captionIdFor(e.target)))
  profileWrap.addEventListener('focusout', (e) => {
    if (!profileWrap.contains(e.relatedTarget)) setCaptionHover(null)
  })
}

const bounceBlob = (blob, t, atBottom) => {
  blob.retired = false
  if (!metaballsRenderer) blob.el.style.opacity = '1'
  blob.progress = atBottom ? 1 - ABSORB : ABSORB
  blob.dir = atBottom ? -1 : 1
  blob.targetLane = rand(0.22, 0.78)
  blob.speed = rand(0.018, 0.036)
  blob.nest = 0.55
  blob.targetAccel = atBottom ? rand(-0.02, 0.01) : rand(-0.01, 0.022)
  blob.accelChangeAt = t + rand(0.5, 2)
  Object.assign(blob, randomBlobLight())
}

const blobInFlight = (blob) => !blob.retired

const settleParkedBlob = (blob, w, h, dt) => {
  blob.nest = damp(blob.nest, 0, 3.2, dt)
  blob.x = blob.lane * w
  blob.y = progressToY(blob.progress, h)
  blob.attractX = 0
  blob.attractY = 0
  if (blob.nest <= 0.02) return 0
  return 1 - blob.nest
}

const releaseParkedBlob = (t) => {
  const waiting = blobs.filter((blob) => blob.retired)
  if (!waiting.length) return false
  const blob = waiting[Math.floor(Math.random() * waiting.length)]
  bounceBlob(blob, t, blob.progress >= 0.5)
  return true
}

if (!spawnEnabled()) {
  blobs.forEach((blob) => {
    blob.retired = true
    blob.progress = Math.random() > 0.5 ? 0 : 1
    blob.nest = 0
  })
}

const endcaps = {
  top: { el: topCapEl, swell: 1, ripple: 0, x: 0, y: 0, w: 0, h: 0, ...randomBlobLight() },
  bottom: { el: bottomCapEl, swell: 1, ripple: 0, x: 0, y: 0, w: 0, h: 0, ...randomBlobLight() },
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
  if (metaballsRenderer) return
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

      if (metaballsRenderer) return
      const el = cap.el
      el.style.width = `${cap.w}px`
      el.style.height = `${cap.h}px`
      el.style.opacity = '1'
      const wave = Math.sin(t * 0.2 + offset) * 3 + Math.sin(t * 0.33 + offset * 1.4) * 2
      el.style.borderRadius = `${50 + wave * 0.15}%`
      el.style.transform = `translate3d(${(cap.x - cap.w / 2).toFixed(2)}px, ${(cap.y - cap.h / 2).toFixed(2)}px, 0)`
    })
}

const collectMetaballs = (t = 0) => {
  const balls = []
  const pushCap = (cap) => {
    const rx = cap.w * 0.5
    const ry = cap.h * 0.5
    if (rx > 1 && ry > 1) {
      balls.push({
        x: cap.x,
        y: cap.y,
        rx,
        ry,
        lx: cap.lx,
        ly: cap.ly,
        hiSize: cap.hiSize,
        hiBright: cap.hiBright,
      })
    }
  }
  pushCap(endcaps.top)
  pushCap(endcaps.bottom)

  const hideFloaters = reduceMotion && app.dataset.blobs === 'off'
  blobs.forEach((blob) => {
    if (hideFloaters) return
    const nest = reduceMotion ? 1 : blob.nest
    if (nest <= 0.02) return
    const s = sizePx(blob)
    const stretch = reduceMotion ? 1 : blob.stretch
    const base = 0.97 + Math.sin(t * blob.wobble * 0.7 + blob.phase) * 0.03
    const rx = s * 0.5 * nest * base
    const ry = s * 0.5 * nest * base * stretch
    if (rx < 0.75 || ry < 0.75) return
    balls.push({
      x: blob.x + blob.pushX,
      y: blob.y + blob.pushY,
      rx,
      ry,
      lx: blob.lx,
      ly: blob.ly,
      hiSize: blob.hiSize,
      hiBright: blob.hiBright,
    })
  })
  return balls
}

const paintMetaballs = (t = 0) => {
  if (!metaballsRenderer) return
  if (app.dataset.screen === 'play') return
  metaballsRenderer.setTime(t)
  metaballsRenderer.draw(collectMetaballs(t))
}

blobsToggle.addEventListener('click', () => {
  if (!metaballsRenderer) return
  paintMetaballs(reduceMotion ? 0 : performance.now() / 1000)
})

const placeStaticBlobs = () => {
  endcaps.top.swell = 1
  endcaps.bottom.swell = 1
  endcaps.top.ripple = 0
  endcaps.bottom.ripple = 0
  layoutEndcaps()
  blobs.forEach((blob) => {
    blob.x = blob.lane * window.innerWidth
    blob.y = progressToY(blob.progress, window.innerHeight)
    blob.pushX = 0
    blob.pushY = 0
    blob.stretch = 1
    if (metaballsRenderer) return
    syncBlobSize(blob)
    const s = sizePx(blob)
    blob.el.style.transform = `translate(${blob.x - s / 2}px, ${blob.y - s / 2}px)`
  })
  paintMetaballs(0)
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
  let nextSpawnAt = 0
  let scrollImpulse = 0
  const SCROLL_GAIN = 0.016
  const SCROLL_DECAY = 12
  const SCROLL_MUL_MIN = 0.15
  const SCROLL_MUL_MAX = 7

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
    metaballsRenderer?.resize()
  })

  window.addEventListener(
    'wheel',
    (e) => {
      if (swipeMq.matches) return
      let dy = e.deltaY
      if (e.deltaMode === 1) dy *= 16
      else if (e.deltaMode === 2) dy *= window.innerHeight
      scrollImpulse += dy * SCROLL_GAIN
      scrollImpulse = Math.min(
        SCROLL_MUL_MAX - 1,
        Math.max(SCROLL_MUL_MIN - 1, scrollImpulse),
      )
    },
    { passive: true },
  )

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

    scrollImpulse = damp(scrollImpulse, 0, SCROLL_DECAY, dt)
    const speedMul = swipeMq.matches
      ? 1
      : Math.min(SCROLL_MUL_MAX, Math.max(SCROLL_MUL_MIN, 1 + scrollImpulse))

    blobs.forEach((blob) => {
      if (blob.retired) {
        const absorb = settleParkedBlob(blob, w, h, dt)
        if (absorb) {
          if (blob.progress < 0.5) topAbsorb += absorb
          else bottomAbsorb += absorb
        }
        return
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
      blob.progress += blob.dir * blob.speed * speedMul * dt

      if (blob.progress >= 1) {
        blob.progress = 1
        blob.retired = true
      } else if (blob.progress <= 0) {
        blob.progress = 0
        blob.retired = true
      }

      if (blob.retired) {
        const absorb = settleParkedBlob(blob, w, h, dt)
        if (absorb) {
          if (blob.progress < 0.5) topAbsorb += absorb
          else bottomAbsorb += absorb
        }
        return
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

    if (spawnOn) {
      let inFlight = blobs.filter(blobInFlight).length
      while (inFlight < VISIBLE_MIN && releaseParkedBlob(t)) inFlight += 1
      if (inFlight < VISIBLE_MAX && t >= nextSpawnAt && releaseParkedBlob(t)) {
        nextSpawnAt = t + rand(SPAWN_GAP_MIN, SPAWN_GAP_MAX)
      }
    }

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

      if (metaballsRenderer) return

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

    paintMetaballs(t)
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

// Blob relies on motion, so reduced motion falls back to the system cursor for it.
const followerCursorStyles = new Set(reduceMotion ? ['favicon', 'ring'] : ['blob', 'favicon', 'ring'])

if (blobCursorRoot && blobCursorMotion) {
  const cursor = {
    visible: false,
    enabled: false,
    style: root.dataset.cursor,
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

  const hideCursor = () => {
    cursor.visible = false
    cursor.moving = false
    if (cursor.settleTimer) {
      clearTimeout(cursor.settleTimer)
      cursor.settleTimer = 0
    }
    blobCursorRoot.classList.remove('is-on', 'is-hover', 'is-down', 'is-moving', 'is-melted', 'is-clicking')
    blobCursorMotion.style.transform = ''
  }

  const syncCursorMode = () => {
    const style = root.dataset.cursor
    cursor.enabled = finePointerMq.matches && followerCursorStyles.has(style)
    root.classList.toggle('has-blob-cursor', cursor.enabled)
    if (!cursor.enabled) {
      hideCursor()
    } else if (style !== cursor.style) {
      cursor.angle = 0
      cursor.moving = false
      blobCursorRoot.classList.remove('is-moving', 'is-clicking')
      blobCursorMotion.style.transform = ''
    }
    cursor.style = style
  }

  syncCursorMode()
  routeEffects.syncCursor = syncCursorMode
  syncCursorStyle = syncCursorMode
  finePointerMq.addEventListener('change', syncCursorMode)

  window.addEventListener(
    'pointermove',
    (e) => {
      if (!cursor.enabled || e.pointerType === 'touch') return
      if (e.target?.closest?.('iframe')) {
        hideCursor()
        return
      }

      const isBlob = cursor.style === 'blob'
      const overNavBlob = isBlob && Boolean(e.target?.closest?.('.nav-blob'))
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

      if (!isBlob) return

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
    if (!cursor.enabled || e.pointerType === 'touch') return
    blobCursorRoot.classList.add('is-down')
    if (cursor.style === 'favicon') {
      // Restart the click burst even on rapid repeat clicks.
      blobCursorRoot.classList.remove('is-clicking')
      void blobCursorRoot.offsetWidth
      blobCursorRoot.classList.add('is-clicking')
    }
  })

  window.addEventListener('pointerup', () => {
    blobCursorRoot.classList.remove('is-down')
  })

  window.addEventListener('pointercancel', () => {
    blobCursorRoot.classList.remove('is-down')
  })

  document.documentElement.addEventListener('mouseleave', hideCursor)
}

const CONTACT_EMAIL = 'contact@kaleblink.com'
const CONTACT_EMAIL_COPIED_MS = 2000
const contactEmailLink = document.querySelector('.contact-list__email')
const contactEmailText = contactEmailLink?.querySelector('.contact-list__email-text')
let contactEmailResetTimer = 0

const copyText = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.setAttribute('readonly', '')
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    let copied = false
    try {
      copied = document.execCommand('copy')
    } catch {
      copied = false
    }
    textarea.remove()
    return copied
  }
}

contactEmailLink?.addEventListener('click', async (e) => {
  e.preventDefault()
  const copied = await copyText(CONTACT_EMAIL)
  if (!copied) {
    window.location.href = `mailto:${CONTACT_EMAIL}`
    return
  }
  clearTimeout(contactEmailResetTimer)
  if (contactEmailText) contactEmailText.textContent = 'email copied!'
  contactEmailLink.classList.add('is-copied')
  contactEmailResetTimer = setTimeout(() => {
    if (contactEmailText) contactEmailText.textContent = CONTACT_EMAIL
    contactEmailLink.classList.remove('is-copied')
  }, CONTACT_EMAIL_COPIED_MS)
})

const contactList = document.querySelector('.contact-list')
// Matches the .contact-list__detail expand/collapse transition.
const CONTACT_LINK_EXPAND_MS = 450
let expandedContactLink = null
let contactExpandTimer = 0
let contactExpandReadyAt = 0

const setExpandedContactLink = (link) => {
  expandedContactLink?.classList.remove('is-expanded')
  expandedContactLink = link
  link?.classList.add('is-expanded')
}

const collapseExpandedContactLink = () => {
  if (!expandedContactLink) return
  setExpandedContactLink(null)
  contactExpandReadyAt = Date.now() + CONTACT_LINK_EXPAND_MS
}

const openContactLinkAfterCollapse = (link) => {
  clearTimeout(contactExpandTimer)
  const wait = Math.max(0, contactExpandReadyAt - Date.now())
  const open = () => {
    contactExpandTimer = 0
    setExpandedContactLink(link)
  }
  if (!wait) {
    open()
    return
  }
  contactExpandTimer = window.setTimeout(open, wait)
}

contactList?.addEventListener('click', (e) => {
  if (hoverPreviewMq.matches) return
  const link = e.target.closest('a')
  if (!link || link === expandedContactLink) return
  e.preventDefault()
  e.stopPropagation()
  collapseExpandedContactLink()
  openContactLinkAfterCollapse(link)
}, true)

document.addEventListener('pointerdown', (e) => {
  if ((!expandedContactLink && !contactExpandTimer) || e.target.closest?.('.contact-list a')) return
  clearTimeout(contactExpandTimer)
  contactExpandTimer = 0
  collapseExpandedContactLink()
}, true)

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
