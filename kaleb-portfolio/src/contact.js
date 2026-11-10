const CONTACT_LIMITS = { name: 100, email: 254, message: 2000 }
const CONTACT_COOLDOWN_MS = 30_000
// Per form, and only in this document. Another tab has its own module instance.
const lastSubmitAt = new Map()

const emailOk = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

/**
 * Sends a message through Web3Forms. Shared by the contact screen and the chat handoff.
 * @returns {Promise<{ ok: true } | { ok: false, ignored: true } | { ok: false, error: string }>}
 */
export async function submitContact(
  { name, email, message, subject = 'Portfolio contact', botcheck } = {},
  { onSending, source = 'contact' } = {},
) {
  if (botcheck) return { ok: false, ignored: true }

  const cooldownLeft = (lastSubmitAt.get(source) ?? 0) + CONTACT_COOLDOWN_MS - Date.now()
  if (cooldownLeft > 0) {
    const seconds = Math.ceil(cooldownLeft / 1000)
    return {
      ok: false,
      error: `Please wait ${seconds}s before sending another message.`,
    }
  }

  const accessKey = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY
  if (!accessKey) return { ok: false, error: 'Contact form is not configured yet.' }

  name = String(name || '').trim()
  email = String(email || '').trim()
  message = String(message || '').trim()

  if (!name || !email || !message) return { ok: false, error: 'Please fill out all fields.' }
  if (
    name.length > CONTACT_LIMITS.name ||
    email.length > CONTACT_LIMITS.email ||
    message.length > CONTACT_LIMITS.message
  ) {
    return { ok: false, error: 'One or more fields are too long.' }
  }
  if (!emailOk(email)) return { ok: false, error: 'Please enter a valid email address.' }

  onSending?.()

  const payload = new FormData()
  payload.append('access_key', accessKey)
  payload.append('name', name)
  payload.append('email', email)
  payload.append('message', message)
  payload.append('subject', subject)
  payload.append('botcheck', '')

  try {
    const res = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      body: payload,
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok || data.success === false) {
      throw new Error(data.message || 'Request failed')
    }
    lastSubmitAt.set(source, Date.now())
    return { ok: true }
  } catch {
    return {
      ok: false,
      error: 'Something went wrong. Please try again or email me at contact@kaleblink.com.',
    }
  }
}
