import { initializeApp } from 'firebase/app'
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check'
import {
  browserLocalPersistence,
  browserSessionPersistence,
  indexedDBLocalPersistence,
  initializeAuth,
} from 'firebase/auth'
import { getDatabase } from 'firebase/database'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
}

export const app = initializeApp(firebaseConfig)

// Help chat calls Firebase AI Logic. Enable it with `npx -y firebase-tools@latest init ailogic`,
// then register a reCAPTCHA v3 site key in App Check and set VITE_RECAPTCHA_SITE_KEY.
// On localhost the debug token prints in the console; register that UUID under App Check.
const recaptchaSiteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY
if (recaptchaSiteKey) {
  if (import.meta.env.DEV) {
    const debugToken = import.meta.env.VITE_APPCHECK_DEBUG_TOKEN
    globalThis.FIREBASE_APPCHECK_DEBUG_TOKEN =
      debugToken && debugToken !== 'true' ? debugToken : true
  }
  initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider(recaptchaSiteKey),
    isTokenAutoRefreshEnabled: true,
  })
}

export const db = getFirestore(app)
// Anonymous-only auth — skip popup/redirect resolver so Auth does not load gapi.
export const auth = initializeAuth(app, {
  persistence: [indexedDBLocalPersistence, browserLocalPersistence, browserSessionPersistence],
})
export const rtdb = getDatabase(app)
