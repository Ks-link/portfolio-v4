import {
  addDoc,
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from './firebase.js'

export const LEADERBOARD_SIZE = 10
export const NAME_MAX = 9
export const NAME_PATTERN = /^[A-Za-z0-9]{1,9}$/
export const SCORE_MAX = 999999

const scoresRef = collection(db, 'scores')
const topQuery = query(scoresRef, orderBy('score', 'desc'), limit(LEADERBOARD_SIZE))

const toEntry = (snap) => {
  const data = snap.data()
  const score = Math.round(Number(data.score) || 0)
  const name = typeof data.name === 'string' ? data.name : ''
  return { id: snap.id, name, score }
}

export const scoreQualifies = (score, entries) => {
  const value = Math.round(Number(score) || 0)
  if (value <= 0 || value > SCORE_MAX) return false
  if (!Array.isArray(entries) || entries.length < LEADERBOARD_SIZE) return true
  return value > entries[entries.length - 1].score
}

export const sanitizeName = (value) =>
  String(value || '')
    .replace(/[^A-Za-z0-9]/g, '')
    .slice(0, NAME_MAX)

export const subscribeTop10 = (onEntries, onError) =>
  onSnapshot(
    topQuery,
    (snap) => {
      onEntries(snap.docs.map(toEntry))
    },
    (err) => {
      onError?.(err)
    },
  )

export const submitScore = async (name, score) => {
  const cleanName = sanitizeName(name)
  const value = Math.round(Number(score) || 0)
  if (!NAME_PATTERN.test(cleanName)) throw new Error('Invalid name')
  if (value <= 0 || value > SCORE_MAX) throw new Error('Invalid score')
  await addDoc(scoresRef, {
    name: cleanName,
    score: value,
    createdAt: serverTimestamp(),
  })
}
