const {
  default: makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  DisconnectReason
} = require('@whiskeysockets/baileys')

const pino = require('pino')

async function startBot () {
  const { state, saveCreds } =
    await useMultiFileAuthState('./session')

  const { version } = await fetchLatestBaileysVersion()

  console.log(`📦 WhatsApp Web version: ${version.join('.')}`)

  const sock = makeWASocket({
    auth: state,
    logger: pino({ level: 'silent' }),
    version,
    browser: ['ZENX-MD', 'Render', '1.0.0']
  })

  sock.ev.on('creds.update', saveCreds)

  // 🔑 Pair code (first run only)
  if (!state.creds.registered) {
    const number = process.env.PAIR_NUMBER

    if (!number) {
      console.log('❌ PAIR_NUMBER not set')
      process.exit(1)
    }

    setTimeout(async () => {
      try {
        const code = await sock.requestPairingCode(number)
        console.log('\n🔑 PAIR CODE:', code)
        console.log('👉 WhatsApp > Linked Devices > Link with phone number\n')
      } catch (err) {
        console.log('❌ Pairing failed:', err.message)
      }
    }, 4000)
  }

  sock.ev.on('connection.update', ({ connection, lastDisconnect }) => {
    if (connection === 'open') {
      console.log('🤖 ZENX-MD CONNECTED')
    }

    if (connection === 'close') {
      if (
        lastDisconnect?.error?.output?.statusCode !==
        DisconnectReason.loggedOut
      ) {
        console.log('🔄 Reconnecting...')
        startBot()
      } else {
        console.log('❌ Logged out')
      }
    }
  })

  return sock
}

module.exports = startBot
