const express = require('express')
const app = express()
const path = require('path')
require('dotenv').config({
  path: path.join(__dirname, 'config.env'),
})

app.use(express.json({ limit: '52428800' }))
const cors = require('cors')
const router = require('./routers/testRouter')
app.use(cors())
app.use('/api', router)

app.listen(9090, () => {
  console.log('Server is running on port 9090')
})
module.exports = app
