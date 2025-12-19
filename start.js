const startBot = require('./index')
const main = require('./main')

async function start() {
    const sock = await startBot()
    await main(sock)
    console.log('🤖 Bot Started')
}

start()
