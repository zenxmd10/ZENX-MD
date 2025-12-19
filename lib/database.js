const fs = require('fs')

const DB_FILE = './lib/database.json'

if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify({ users: {} }, null, 2))
}

const loadDB = () => JSON.parse(fs.readFileSync(DB_FILE))
const saveDB = (data) =>
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2))

module.exports = { loadDB, saveDB }
