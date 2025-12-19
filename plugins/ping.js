module.exports = {
    command: ['ping'],
    desc: 'Bot response test',
    async run({ sock, m }) {
        await sock.sendMessage(m.chat, { text: 'Pong 🏓' })
    }
}
