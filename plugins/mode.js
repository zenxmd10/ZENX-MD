const config = require('../config')
const fs = require('fs')

module.exports = {
    command: ['mode'],
    desc: 'Change bot mode (owner only)',
    async run({ sock, m, isOwner }) {
        if (!isOwner) return

        const args = m.text.split(' ')
        if (!args[1])
            return sock.sendMessage(m.chat, {
                text: `Mode : ${config.mode}\nUse: .mode public/private/self`
            })

        const mode = args[1].toLowerCase()
        if (!['public', 'private', 'self'].includes(mode))
            return sock.sendMessage(m.chat, {
                text: '❌ Invalid mode'
            })

        // 🔁 Save mode permanently
        const cfg = require('../config')
        cfg.mode = mode

        fs.writeFileSync(
            './config.js',
            `module.exports = ${JSON.stringify(cfg, null, 4)}`
        )

        await sock.sendMessage(m.chat, {
            text: `✅ ZENX-MD mode changed to *${mode}*`
        })
    }
}
