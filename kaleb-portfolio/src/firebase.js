import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getDatabase } from 'firebase/database'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyCz4YaG8GBsH4l6s8jxlGSMe8Sn_NT6png',
  authDomain: 'kaleblink-portfolio-v4.firebaseapp.com',
  projectId: 'kaleblink-portfolio-v4',
  storageBucket: 'kaleblink-portfolio-v4.firebasestorage.app',
  messagingSenderId: '85383932283',
  appId: '1:85383932283:web:bee07e7fd7fcbae22eb5de',
  databaseURL: 'https://kaleblink-portfolio-v4-default-rtdb.firebaseio.com',
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
export const auth = getAuth(app)
export const rtdb = getDatabase(app)
