export const DEFAULT_ACCENT = '#ee7330'

export const AI_COLORS = [
  '#5c8f76',
  '#c45c5c',
  '#5c7ec4',
  '#a56bb8',
  '#c49a4a',
  '#4aa3b5',
  '#c46b8a',
  '#7d9a4a',
  '#8f6b5c',
  '#6a7d9e',
  '#b85c8a',
  '#7a6bc4',
  '#c4784a',
  '#4a8f8a',
  '#8b5ea8',
]

export const FOOD_PALETTE = [DEFAULT_ACCENT, ...AI_COLORS]

/** Accent picker: default orange + first eight enemy colours. */
export const ACCENT_PALETTE = FOOD_PALETTE.slice(0, 9)
