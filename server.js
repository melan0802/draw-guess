const path = require('path')
const express = require('express')
const app = express()
const ws = require('ws')
var bodyParser = require('body-parser')
var cookieSession = require('cookie-session')
const wss = new ws.Server({
  port: 8090
})

app.use(cookieSession({
  keys: ['key1']
}))

app.use(bodyParser.json())

wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    if (message.match(/^startdraw:/) || message.match(/^drawing:/) || message.match(/^enddraw/)) {
      wss.clients.forEach((client) => {
        client.send(message)
      })
    }
  })
})

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.post('/api/login', (req, res) => {
  req.session.username = req.body.username

  res.send({success: true})
})

app.post('/api/message', (req, res) => {
  
  wss.clients.forEach((client) => {
    client.send('msg:' + JSON.stringify({
      message: req.body.message,
      username: req.session.username
    }))
  })

  res.end()
})

app.get('/api/username', (req, res) => {
  res.send(req.session.username)
})

app.use(express.static(path.join(__dirname, './static')))

app.listen(3000)