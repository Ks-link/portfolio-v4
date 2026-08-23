import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyCz4YaG8GBsH4l6s8jxlGSMe8Sn_NT6png',
  authDomain: 'kaleblink-portfolio-v4.firebaseapp.com',
  projectId: 'kaleblink-portfolio-v4',
  storageBucket: 'kaleblink-portfolio-v4.firebasestorage.app',
  messagingSenderId: '85383932283',
  appId: '1:85383932283:web:bee07e7fd7fcbae22eb5de',
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
