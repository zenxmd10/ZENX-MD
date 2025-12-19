const {
    default: makeWASocket,
    useMultiFileAuthState,
    fetchLatestBaileysVersion,
    DisconnectReason
} = require('@whiskeysockets/baileys')

const pino = require('pino')
const qrcode = require('qrcode-terminal')

let sock

async function startBot() {
    const { state, saveCreds } =
        await useMultiFileAuthState('./session')

    const { version } = await fetchLatestBaileysVersion()

    console.log(
        `📦 WhatsApp Web version: ${version.join('.')}`
    )

    sock = makeWASocket({
        auth: state,
        logger: pino({ level: 'silent' }),
        version,
        browser: ['ZENX-MD', 'Ubuntu', '1.0.0'],
        keepAliveIntervalMs: 30_000 // 🔥 IMPORTANT
    })

    sock.ev.on('creds.update', saveCreds)

    sock.ev.on('connection.update', (update) => {
        const { connection, qr, lastDisconnect } = update

        if (qr) {
            console.log(
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
