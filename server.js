const path = require('path')
const express = require('express')
const app = express()
const ws = require('ws')
const wss = new ws.Server({
  port: 8080
})

wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    if (message.match(/^startdraw:/) || message.match(/^drawing:/) || message.match(/^enddraw/)) {
      wss.clients.forEach((client) => {
        client.send(message)
      })
    }
  })
})

app.use(express.static(path.join(__dirname, './static')))

app.listen(3000)