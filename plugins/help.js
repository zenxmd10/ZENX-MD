module.exports = {
    command: ['help', 'menu'],
    desc: 'Command list',
    async run({ sock, m, plugins }) {
        let text = '📜 *Bot Commands*\n\n'
        plugins.forEach(p => {
            text += `• ${p.command.join(', ')} - ${p.desc}\n`
        })
        await sock.sendMessage(m.chat, { text })
    }
}
