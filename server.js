const path = require('path')
const express = require('express')
const app = express()
const ws = require('ws')
var bodyParser = require('body-parser')
var cookieSession = require('cookie-session')
var topics = require('./topics')
var currentTopic = {}
var users = []
var userScore = {}
var currentDrawer = ''
var tip1Timeout = null
var tip2Timeout = null
var gameInterval = null
var gameTime = 120
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
  res.header("Access-Control-Allow-Origin", "http://localhost:8080"); // update to match the domain you will make the request from
  res.header("Access-Control-Allow-Credentials", true)
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.post('/api/login', (req, res) => {
  userScore[req.body.username] = 0
  users.push(req.body.username)
  req.session.username = req.body.username

  res.send({success: true})
})

app.post('/api/start-game', (req, res) => {
  currentDrawer = req.body.username
  gameTime = 120
  clearTimeout(tip1Timeout)
  clearTimeout(tip2Timeout)
  clearInterval(gameInterval)
  currentTopic = topics.shift()
  wss.clients.forEach((client) => {
    client.send('startgame:'+ req.body.username)
  })
  tip1Timeout = setTimeout(() => {
    wss.clients.forEach((client) => {
      client.send('tip:'+ JSON.stringify({
        index: '1',
        tip: currentTopic.tip1
      }))
    })
  }, 15000)
  tip2Timeout = setTimeout(() => {
    wss.clients.forEach((client) => {
      client.send('tip:'+ JSON.stringify({
        index: '2',
        tip: currentTopic.tip2
      }))
    })
  }, 30000)
  gameInterval = setInterval(() => {
    if (gameTime > 0) {
      gameTime--
      wss.clients.forEach((client) => {
        client.send('timedown:' + gameTime)
      })
    } else {
      clearTimeout(tip1Timeout)
      clearTimeout(tip2Timeout)
      clearInterval(gameInterval)
      wss.clients.forEach((client) => {
        client.send('timeout:' + JSON.stringify({
          topic: currentTopic.topic
        }))
      })
      currentTopic = {}
    }
  }, 1000)
})

app.get('/api/topic', (req, res) => {
  res.send(currentTopic.topic)
})

app.get('/api/score', (req, res) => {
  var scoreList = []
  Object.keys(userScore).forEach(username => {
    scoreList.push({
      username,
      score: userScore[username]
    })
  })
  scoreList.sort((item1, item2) => {
    return item1.score - item2.score
  })
  res.send(scoreList)
})

app.post('/api/message', (req, res) => {
  if (req.session.username) {
    if (req.body.message && req.body.message == currentTopic.topic) {
      wss.clients.forEach((client) => {
        client.send('bingo:' + JSON.stringify({
          message: req.body.message,
          username: req.session.username
        }))
      })
      userScore[req.session.username] += gameTime
      userScore[currentDrawer] += gameTime
      currentTopic = {}
      clearTimeout(tip1Timeout)
      clearTimeout(tip2Timeout)
      clearInterval(gameInterval)
    } else {
      wss.clients.forEach((client) => {
        client.send('msg:' + JSON.stringify({
          message: req.body.message,
          username: req.session.username
        }))
      })
    }
  }

  res.end()
})

app.post('/api/random-user', (req, res) => {
  wss.clients.forEach((client) => {
    client.send('drawer:' + req.body.username)
  })
  res.end()
})

app.get('/api/usernames', (req, res) => {
  res.send(users)
})

app.get('/api/username', (req, res) => {
  res.send(req.session.username)
})

app.use(express.static(path.join(__dirname, './static')))

app.listen(3000)