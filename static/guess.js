var ws = new WebSocket('ws://localhost:8080')
var myCanvas = document.getElementById('my-canvas')
var ctx = myCanvas.getContext('2d')

ws.onmessage = (msg) => {
  switch (true) {
    case Boolean(msg.data.match(/^startdraw:/)):
      var pathObj = JSON.parse(msg.data.slice(10))

      startDraw(ctx, pathObj)
      break
    case Boolean(msg.data.match(/^drawing:/)):
      var pathObj = JSON.parse(msg.data.slice(8))

      drawing(ctx, pathObj)
      break
    case Boolean(msg.data.match(/^enddraw/)):
      ctx.closePath()
      break
  }
}