var myCanvas = document.getElementById('my-canvas')
var ctx = myCanvas.getContext('2d')
var lineWidth = 10
var isMouseDown = false

var ws = new WebSocket('ws://localhost:8080')

myCanvas.addEventListener('mousedown', function(e) {
  var x = e.offsetX
  var y = e.offsetY
  isMouseDown = true
  var pathObj = {
    x,
    y,
    lineWidth,
    color: '#000'
  }
  startDraw(ctx, pathObj)
  ws.send('startdraw:' + JSON.stringify(pathObj))
})

myCanvas.addEventListener('mousemove', function(e) {
  if (isMouseDown) {
    var x = e.offsetX
    var y = e.offsetY
    var pathObj = {
      x,
      y,
      lineWidth,
      color: '#000'
    }
    drawing(ctx, pathObj)
    ws.send('drawing:' + JSON.stringify(pathObj))
  }
})

myCanvas.addEventListener('mouseup', function endDraw(e) {
  isMouseDown = false
  ws.send('enddraw')
  ctx.closePath()
})