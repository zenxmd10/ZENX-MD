require('dotenv').config()

const {
    default: makeWASocket,
    useMultiFileAuthState,
    fetchLatestBaileysVersion,
    DisconnectReason
} = require('@whiskeysockets/baileys')

const pino = require('pino')

async function startBot() {
    const { state, saveCreds } =
        await useMultiFileAuthState('./session')

    const { version } = await fetchLatestBaileysVersion()

    const sock = makeWASocket({
        auth: state,
        logger: pino({ level: 'silent' }),
        version,
        browser: [
            process.env.BOT_NAME || 'ZENX-MD',
            'Universal',
            '1.0.0'
        ],
        keepAliveIntervalMs: 30_000
    })

    sock.ev.on('creds.update', saveCreds)

    // 🔑 PAIR CODE (ONLY IF NOT REGISTERED)
    if (!state.creds.registered) {
        const number = process.env.PAIR_NUMBER

        if (!number) {
            console.log('❌ PAIR_NUMBER not set')
            process.exit(1)
        }

        setTimeout(async () => {
            try {
                const code =
                    await sock.requestPairingCode(number)
                console.log(`\n🔑 PAIR CODE: ${code}\n`)
                console.log(
                    '👉 WhatsApp > Linked Devices > Link with phone number'
                )
            } catch (e) {
                console.log('❌ Pairing failed:', e.message)
            }
        }, 4000)
    }

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update

        if (connection === 'open') {
            console.log(
                `🤖 ${process.env.BOT_NAME || 'ZENX-MD'} CONNECTED`
            )
        }

        if (connection === 'close') {
            const code =
                lastDisconnect?.error?.output?.statusCode

            if (code !== DisconnectReason.loggedOut) {
                console.log('🔄 Reconnecting...')
                startBot()
            } else {
                console.log('❌ Logged out')
            }
        }
    })

    return sock
}

module.exports = startBot            console.log(
                '\n📷 Scan this QR (WhatsApp > Linked Devices)\n'
            )
            qrcode.generate(qr, { small: true })
        }

        if (connection === 'open') {
            console.log('🤖 ZENX-MD CONNECTED SUCCESSFULLY')
        }

        if (connection === 'close') {
            const reason =
                lastDisconnect?.error?.output?.statusCode

            console.log('❌ Connection closed. Code:', reason)

            if (reason !== DisconnectReason.loggedOut) {
                console.log('🔄 Restarting socket...')
                startBot()
            }
        }
    })

    // 🔥 KEEP PROCESS ALIVE (VERY IMPORTANT)
    setInterval(() => {}, 1000)
}

module.exports = startBot                }
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
