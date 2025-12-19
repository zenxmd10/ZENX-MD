const startBot = require('./index')
const main = require('./main')

console.log('🤖 ZENX-MD Starting...')

startBot()
  .then(sock => {
    main(sock)
  })
  .catch(err => {
    console.log('❌ Failed to start bot:', err)
  })
