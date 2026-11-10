import { submitContact } from './contact.js'
import { SITE_GUIDE } from './chat-guide.js'

const CHAT_MODEL = 'gemini-3.5-flash-lite'
const ASK_LIMIT = 500
const ASK_COOLDOWN_MS = 3_000
const HISTORY_LIMIT = 8
const HELP_ERROR = 'I could not answer that just now. Email contact@kaleblink.com.'

const bubbleIcon = `
  <svg class="chat__icon" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="none" stroke="currentColor" stroke-width="1.75" stroke-linejoin="round"
      d="M6.2 16.8 4.5 20.2c-.3.6.4 1.2 1 .8l3.4-2.1A8.2 8.2 0 1 0 6.2 16.8Z"/>
  </svg>
`

const closeIcon = `
  <svg class="chat__icon" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"
      d="M6 6l12 12M18 6 6 18"/>
  </svg>
`

const lastItem = (list) => list[list.length - 1]

const priorContents = (messages) => {
  const turns = messages.filter(
    (message) =>
      message.text &&
      (message.role === 'user' || message.role === 'model'),
  )
  const prior = turns.slice(0, -1).slice(-HISTORY_LIMIT)
  const contents = []
  for (const message of prior) {
    const previous = lastItem(contents)
    if (message.role === 'user') {
      if (previous?.role === 'user') contents.pop()
      contents.push({ role: 'user', parts: [{ text: message.text }] })
    } else if (previous?.role === 'user') {
      contents.push({ role: 'model', parts: [{ text: message.text }] })
    }
  }
  if (lastItem(contents)?.role === 'user') contents.pop()
  return contents
}

// ask() is the only model boundary. A later realtime window can keep this panel
// and swap ask() for a conversation listener. Messages stay
// { id, role, text, createdAt } in memory for now.
async function ask(history, onDelta) {
  if (!import.meta.env.VITE_RECAPTCHA_SITE_KEY) {
    throw new Error('App Check is not configured')
  }
  const [{ getAI, getGenerativeModel, GoogleAIBackend }, { app }] = await Promise.all([
    import('firebase/ai'),
    import('./firebase.js'),
  ])
  const model = getGenerativeModel(getAI(app, { backend: new GoogleAIBackend() }), {
    model: CHAT_MODEL,
    systemInstruction: SITE_GUIDE,
    generationConfig: { maxOutputTokens: 320, temperature: 0.4 },
  })
  const chat = model.startChat({ history: priorContents(history) })
  const latest = lastItem(history)
  const result = await chat.sendMessageStream(latest.text)
  let full = ''
  for await (const chunk of result.stream) {
    let piece = ''
    try {
      piece = chunk.text()
    } catch {
      piece = ''
    }
    if (!piece) continue
    full += piece
    onDelta(full)
  }
  return full.trim()
}

const lastUserText = (messages) => {
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    if (messages[i].role === 'user' && messages[i].text) return messages[i].text
  }
  return ''
}

export function mountChat(root, { onNavigate } = {}) {
  const host = document.createElement('div')
  host.className = 'chat'
  host.innerHTML = `
    <button type="button" class="chat__launcher" aria-expanded="false" aria-controls="chat-panel">
      ${bubbleIcon}
      <span class="visually-hidden">Open help</span>
    </button>
    <section id="chat-panel" class="chat__panel" role="dialog" aria-labelledby="chat-title" hidden>
      <header class="chat__bar">
        <h2 id="chat-title" class="chat__title">Help</h2>
        <button type="button" class="chat__close" aria-label="Close help">${closeIcon}</button>
      </header>
      <div class="chat__log" role="log" aria-live="polite" aria-relevant="additions"></div>
      <div class="chat__chips">
        <button type="button" class="chat__chip" data-ask="How do I move around?">How do I move around?</button>
        <button type="button" class="chat__chip" data-ask="What kind of work do you do?">What kind of work do you do?</button>
        <button type="button" class="chat__chip" data-human>Talk to Kaleb</button>
      </div>
      <form class="chat__composer">
        <label class="visually-hidden" for="chat-ask">Ask about the site</label>
        <textarea id="chat-ask" class="chat__input" rows="1" maxlength="${ASK_LIMIT}" placeholder="Ask about the site"></textarea>
        <button type="submit" class="chat__send">Send</button>
      </form>
      <form class="chat__human" hidden>
        <input type="checkbox" name="botcheck" class="chat__honeypot" tabindex="-1" autocomplete="off" aria-hidden="true" />
        <div class="chat__field">
          <label for="chat-name">Name</label>
          <input id="chat-name" name="name" type="text" required maxlength="100" autocomplete="name" />
        </div>
        <div class="chat__field">
          <label for="chat-email">Email</label>
          <input id="chat-email" name="email" type="email" required maxlength="254" autocomplete="email" inputmode="email" />
        </div>
        <div class="chat__field">
          <label for="chat-message">Message</label>
          <textarea id="chat-message" name="message" rows="3" required maxlength="2000"></textarea>
        </div>
        <div class="chat__human-actions">
          <button type="submit" class="chat__send">Send to Kaleb</button>
          <button type="button" class="chat__link" data-contact>Open contact page</button>
        </div>
        <p class="chat__status" role="status" aria-live="polite" hidden></p>
      </form>
    </section>
  `
  root.append(host)

  const launcher = host.querySelector('.chat__launcher')
  const launcherLabel = host.querySelector('.chat__launcher .visually-hidden')
  const panel = host.querySelector('.chat__panel')
  const log = host.querySelector('.chat__log')
  const composer = host.querySelector('.chat__composer')
  const askField = host.querySelector('#chat-ask')
  const sendBtn = composer.querySelector('.chat__send')
  const humanForm = host.querySelector('.chat__human')
  const humanStatus = host.querySelector('.chat__status')
  const humanMessage = host.querySelector('#chat-message')
  const messages = []
  let seq = 0
  let open = false
  let busy = false
  let lastAskAt = 0

  const pushMessage = (role, text) => {
    const message = { id: `m${++seq}`, role, text, createdAt: Date.now() }
    messages.push(message)
    const el = document.createElement('p')
    el.className = `chat__msg chat__msg--${role === 'user' ? 'user' : 'bot'}`
    el.dataset.id = message.id
    el.textContent = text
    log.append(el)
    log.scrollTop = log.scrollHeight
    return message
  }

  const setMessageText = (message, text) => {
    message.text = text
    const el = log.querySelector(`[data-id="${message.id}"]`)
    if (el) el.textContent = text
    log.scrollTop = log.scrollHeight
  }

  pushMessage('note', 'Hi, I can help you find your way around this site.')

  const setHumanStatus = (text) => {
    humanStatus.hidden = !text
    humanStatus.textContent = text || ''
  }

  const showHuman = (show) => {
    humanForm.hidden = !show
    composer.hidden = show
    host.querySelector('.chat__chips').hidden = show
    if (show) {
      humanMessage.value = lastUserText(messages).slice(0, 2000)
      setHumanStatus('')
      host.querySelector('#chat-name').focus()
    }
  }

  const close = () => {
    if (!open) return
    open = false
    panel.hidden = true
    launcher.setAttribute('aria-expanded', 'false')
    launcherLabel.textContent = 'Open help'
    if (host.contains(document.activeElement)) launcher.focus()
  }

  const openPanel = () => {
    if (root.dataset.screen === 'play') return
    open = true
    panel.hidden = false
    launcher.setAttribute('aria-expanded', 'true')
    launcherLabel.textContent = 'Close help'
    if (humanForm.hidden) askField.focus()
    else host.querySelector('#chat-name').focus()
  }

  const toggle = () => {
    if (open) close()
    else openPanel()
  }

  const askQuestion = async (raw) => {
    const text = raw.trim().slice(0, ASK_LIMIT)
    if (!text || busy) return
    const wait = lastAskAt + ASK_COOLDOWN_MS - Date.now()
    if (wait > 0) {
      pushMessage('note', `Please wait ${Math.ceil(wait / 1000)}s before another question.`)
      return
    }
    lastAskAt = Date.now()
    pushMessage('user', text)
    const reply = pushMessage('model', '…')
    busy = true
    askField.disabled = true
    sendBtn.disabled = true
    try {
      const history = messages.filter(
        (message) =>
          message !== reply &&
          (message.role === 'user' || message.role === 'model'),
      )
      const answer = await ask(history, (partial) => setMessageText(reply, partial))
      setMessageText(reply, answer || HELP_ERROR)
      if (!answer) reply.role = 'note'
    } catch {
      reply.role = 'note'
      setMessageText(reply, HELP_ERROR)
    } finally {
      busy = false
      askField.disabled = false
      sendBtn.disabled = false
      if (open && humanForm.hidden) askField.focus()
    }
  }

  launcher.addEventListener('click', toggle)
  host.querySelector('.chat__close').addEventListener('click', close)

  host.querySelector('.chat__chips').addEventListener('click', (event) => {
    const chip = event.target.closest('button')
    if (!chip) return
    if (chip.hasAttribute('data-human')) {
      showHuman(true)
      return
    }
    const prompt = chip.dataset.ask
    if (prompt) askQuestion(prompt)
  })

  composer.addEventListener('submit', (event) => {
    event.preventDefault()
    const text = askField.value
    askField.value = ''
    askQuestion(text)
  })

  askField.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      composer.requestSubmit()
    }
  })

  humanForm.addEventListener('submit', async (event) => {
    event.preventDefault()
    if (!humanForm.checkValidity()) {
      humanForm.reportValidity()
      return
    }
    const data = new FormData(humanForm)
    const submit = humanForm.querySelector('.chat__send')
    submit.disabled = true
    const result = await submitContact(
      {
        name: data.get('name'),
        email: data.get('email'),
        message: data.get('message'),
        subject: 'Portfolio chat',
        botcheck: data.get('botcheck'),
      },
      { source: 'chat', onSending: () => setHumanStatus('Sending…') },
    )
    submit.disabled = false
    if (result.ignored) {
      setHumanStatus('')
      return
    }
    if (!result.ok) {
      setHumanStatus(result.error)
      pushMessage('note', result.error)
      return
    }
    humanForm.reset()
    setHumanStatus('')
    showHuman(false)
    pushMessage('note', 'Thanks, your message is on the way.')
  })

  host.querySelector('[data-contact]').addEventListener('click', () => {
    close()
    onNavigate?.('contact')
  })

  panel.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      event.stopPropagation()
      close()
    }
  })

  document.addEventListener('pointerdown', (event) => {
    if (!open || host.contains(event.target)) return
    close()
  })

  const watch = new MutationObserver(() => {
    if (root.dataset.screen === 'play' || root.dataset.stageMap === 'open') close()
  })
  watch.observe(root, { attributes: true, attributeFilter: ['data-screen', 'data-stage-map'] })

  return { close }
}
