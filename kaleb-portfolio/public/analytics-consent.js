;(function (global) {
  const MEASUREMENT_ID = 'G-3D21VS20DD'
  const STORAGE_KEY = 'cookieConsent'
  const SCRIPT_ATTR = 'data-analytics-consent'

  const getConsent = () => {
    try {
      return localStorage.getItem(STORAGE_KEY)
    } catch {
      return null
    }
  }

  const setConsent = (value) => {
    try {
      localStorage.setItem(STORAGE_KEY, value)
    } catch {
      /* ignore quota / private mode */
    }
  }

  const hasAnalyticsConsent = () => getConsent() !== 'declined'

  const isConsentDecided = () => {
    const value = getConsent()
    return value === 'accepted' || value === 'declined'
  }

  let enabled = false

  const loadGtag = () => {
    if (enabled || document.querySelector(`script[${SCRIPT_ATTR}]`)) {
      enabled = true
      return
    }

    global.dataLayer = global.dataLayer || []
    if (typeof global.gtag !== 'function') {
      global.gtag = function gtag() {
        global.dataLayer.push(arguments)
      }
    }

    global.gtag('js', new Date())
    global.gtag('config', MEASUREMENT_ID)

    const script = document.createElement('script')
    script.async = true
    script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`
    script.setAttribute(SCRIPT_ATTR, '1')
    document.head.appendChild(script)
    enabled = true
  }

  const enableAnalytics = () => {
    setConsent('accepted')
    loadGtag()
  }

  const clearGaCookies = () => {
    const names = document.cookie
      .split(';')
      .map((part) => part.split('=')[0].trim())
      .filter(
        (name) => name === '_ga' || name === '_gid' || name.startsWith('_ga_'),
      )

    if (!names.length) return

    const hostname = location.hostname
    const domains = ['', hostname, `.${hostname}`]
    const parts = hostname.split('.')
    if (parts.length > 2) {
      domains.push(`.${parts.slice(-2).join('.')}`)
    }

    for (const name of names) {
      for (const domain of domains) {
        const domainPart = domain ? `; domain=${domain}` : ''
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${domainPart}`
      }
    }
  }

  const disableAnalytics = () => {
    setConsent('declined')
    clearGaCookies()
    document.querySelectorAll(`script[${SCRIPT_ATTR}]`).forEach((el) => el.remove())
    global.gtag = function gtag() {}
    enabled = false
  }

  const BANNER_STYLES = `
.cookie-consent {
  position: fixed;
  z-index: 20;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  max-width: none;
  transform: none;
  padding: 0.65rem max(1rem, env(safe-area-inset-right))
    max(0.65rem, env(safe-area-inset-bottom)) max(1rem, env(safe-area-inset-left));
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 0.55rem 0.65rem;
  box-sizing: border-box;
  background: transparent;
  color: #322f2f;
  font-family: "Outfit", "Avenir Next", sans-serif;
  border-radius: 0;
}

@media (prefers-color-scheme: dark) {
  .cookie-consent {
    color: #fffff4;
  }
}

html[data-theme="light"] .cookie-consent {
  color: #322f2f;
}

html[data-theme="dark"] .cookie-consent {
  color: #fffff4;
}

.cookie-consent__copy {
  margin: 0;
  flex: 0 1 auto;
  min-width: 0;
  font-weight: 300;
  font-size: 0.72rem;
  line-height: 1.35;
  letter-spacing: 0.01em;
}

.cookie-consent__actions {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 0.75rem;
}

.cookie-consent__btn {
  appearance: none;
  border: none;
  cursor: pointer;
  font-family: inherit;
  font-weight: 400;
  font-size: 0.72rem;
  letter-spacing: 0.06em;
  text-transform: lowercase;
  padding: 0;
  line-height: 1.35;
  color: inherit;
  background: transparent;
  text-decoration: underline;
  text-underline-offset: 0.2em;
  transition: opacity 0.2s ease;
}

.cookie-consent__btn:hover {
  opacity: 0.7;
}

.cookie-consent__btn:focus-visible {
  outline: 2px solid #ee8533;
  outline-offset: 3px;
}

.cookie-consent__btn--accept {
  color: #ee8533;
}
`

  const injectBannerStyles = () => {
    if (document.getElementById('cookie-consent-fallback-styles')) return
    const style = document.createElement('style')
    style.id = 'cookie-consent-fallback-styles'
    style.textContent = BANNER_STYLES
    document.head.appendChild(style)
  }

  const clearBannerState = (root) => {
    if (!root?.dataset) return
    delete root.dataset.cookieBanner
    root.style.removeProperty('--cookie-banner-h')
    root.style.removeProperty('--cookie-banner-gap')
  }

  const dismissBanner = (el, root) => {
    el?._cookieBannerRo?.disconnect()
    el?.remove()
    clearBannerState(root)
  }

  const isBannerStacked = (el) => {
    const copy = el.querySelector('.cookie-consent__copy')
    const actions = el.querySelector('.cookie-consent__actions')
    if (!copy || !actions) return false
    return Math.abs(copy.getBoundingClientRect().top - actions.getBoundingClientRect().top) > 2
  }

  const syncBannerLayout = (el, root) => {
    if (!root?.dataset || !el.isConnected) return
    root.style.setProperty('--cookie-banner-h', `${el.offsetHeight}px`)
    root.style.setProperty(
      '--cookie-banner-gap',
      isBannerStacked(el) ? '0.55rem' : '0.15rem',
    )
  }

  const mountBanner = (root = document.body, options = {}) => {
    if (isConsentDecided()) return null
    if (document.querySelector('.cookie-consent')) return null

    if (options.injectStyles !== false) injectBannerStyles()

    const el = document.createElement('div')
    el.className = 'cookie-consent'
    el.setAttribute('role', 'dialog')
    el.setAttribute('aria-live', 'polite')
    el.setAttribute('aria-label', 'Cookie consent')
    el.innerHTML = `
      <p class="cookie-consent__copy">
        This site uses analytics cookies to understand visits.
      </p>
      <div class="cookie-consent__actions">
        <button type="button" class="cookie-consent__btn cookie-consent__btn--decline" data-consent="decline">
          Decline
        </button>
        <button type="button" class="cookie-consent__btn cookie-consent__btn--accept" data-consent="accept">
          Accept
        </button>
      </div>
    `

    el.querySelector('[data-consent="accept"]')?.addEventListener('click', () => {
      enableAnalytics()
      dismissBanner(el, root)
    })
    el.querySelector('[data-consent="decline"]')?.addEventListener('click', () => {
      disableAnalytics()
      dismissBanner(el, root)
    })

    root.appendChild(el)
    if (root?.dataset) {
      root.dataset.cookieBanner = 'open'
      const sync = () => syncBannerLayout(el, root)
      sync()
      requestAnimationFrame(sync)
      if (typeof ResizeObserver === 'function') {
        const ro = new ResizeObserver(sync)
        ro.observe(el)
        el._cookieBannerRo = ro
      }
    }
    return el
  }

  const initFromStorage = () => {
    if (hasAnalyticsConsent()) loadGtag()
  }

  global.AnalyticsConsent = {
    MEASUREMENT_ID,
    STORAGE_KEY,
    getConsent,
    hasAnalyticsConsent,
    isConsentDecided,
    enableAnalytics,
    disableAnalytics,
    mountBanner,
    initFromStorage,
  }
})(typeof window !== 'undefined' ? window : globalThis)
