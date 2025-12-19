const fs = require('fs')
const config = require('./config')

const plugins = []
fs.readdirSync('./plugins').forEach(file => {
    plugins.push(require(`./plugins/${file}`))
})

module.exports = async (sock) => {
    sock.ev.on('messages.upsert', async ({ messages }) => {
        const m = messages[0]
        if (!m.message || !m.key.remoteJid) return

        const sender =
            m.key.participant || m.key.remoteJid
        const senderNum = sender.split('@')[0]

        const isOwner = config.owner.includes(senderNum)

        const text =
            m.message.conversation ||
            m.message.extendedTextMessage?.text ||
            ''

        if (!text.startsWith(config.prefix)) return

        // 🔐 MODE CHECK
        if (config.mode === 'private' && !isOwner) return
        if (config.mode === 'self' && !isOwner) return

        const cmd = text
            .slice(config.prefix.length)
            .trim()
            .split(' ')[0]
            .toLowerCase()

        for (const plugin of plugins) {
            if (plugin.command.includes(cmd)) {
                await plugin.run({
                    sock,
                    m: {
                        chat: m.key.remoteJid,
                        sender: senderNum,
                        text
                    },
                    isOwner,
                    plugins
                })
            }
        }
    })
}            }
        }
    })
                      }
