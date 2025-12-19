const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason
} = require('@whiskeysockets/baileys')
const pino = require('pino')
const readline = require('readline')

async function startBot() {
    const { state, saveCreds } =
        await useMultiFileAuthState('./session')

    const sock = makeWASocket({
        logger: pino({ level: 'silent' }),
        auth: state,
        printQRInTerminal: true // ✅ QR ENABLE
    })

    sock.ev.on('creds.update', saveCreds)

    // 🔑 PAIRING CODE (if not registered)
    if (!state.creds.registered) {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        })

        rl.question(
            '\n📱 Enter WhatsApp number (with country code): ',
            async (number) => {
                try {
                    const code = await sock.requestPairingCode(number.trim())
                    console.log(`\n🔑 PAIRING CODE: ${code}\n`)
                    console.log('👉 WhatsApp > Linked Devices > Link with phone number\n')
                } catch (err) {
                    console.log('❌ Pairing failed:', err)
                }
                rl.close()
            }
        )
    }

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update

        if (connection === 'open') {
            console.log('🤖 ZENX-MD CONNECTED SUCCESSFULLY')
        }

        if (connection === 'close') {
            const shouldReconnect =
                lastDisconnect?.error?.output?.statusCode !==
                DisconnectReason.loggedOut

            if (shouldReconnect) {
                console.log('🔄 Reconnecting ZENX-MD...')
                startBot()
            } else {
                console.log('❌ Logged out. Delete session and restart.')
            }
        }
    })

    return sock
}

module.exports = startBot
