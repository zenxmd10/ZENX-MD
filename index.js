const {
    default: makeWASocket,
    useMultiFileAuthState
} = require('@whiskeysockets/baileys')
const pino = require('pino')

const startBot = async () => {
    const { state, saveCreds } =
        await useMultiFileAuthState('./session')

    const sock = makeWASocket({
        logger: pino({ level: 'silent' }),
        auth: state
    })

    sock.ev.on('creds.update', saveCreds)

    return sock
}

module.exports = startBot
