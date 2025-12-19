const config = require('./config')
const fs = require('fs')

// Load plugins
const plugins = []
if (fs.existsSync('./plugins')) {
  fs.readdirSync('./plugins').forEach(file => {
    if (file.endsWith('.js')) {
      plugins.push(require(`./plugins/${file}`))
    }
  })
}

module.exports = async (sock) => {
  sock.ev.on('messages.upsert', async ({ messages }) => {
    try {
      const m = messages[0]
      if (!m || !m.message) return

      const jid = m.key.remoteJid
      const sender =
        m.key.participant || m.key.remoteJid
      const senderNum = sender.split('@')[0]

      const text =
        m.message.conversation ||
        m.message.extendedTextMessage?.text ||
        ''

      if (!text) return

      const isOwner = config.owner.includes(senderNum)

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
              chat: jid,
              sender: senderNum,
              text
            },
            isOwner
          })
        }
      }
    } catch (err) {
      console.log('❌ main.js error:', err)
    }
  })
}
