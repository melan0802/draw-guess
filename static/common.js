function startDraw(ctx, pathObj) {
  ctx.beginPath()
  ctx.arc(pathObj.x, pathObj.y, pathObj.lineWidth / 2, 0, 2 * Math.PI)
  ctx.fill()
  ctx.beginPath()
  ctx.moveTo(pathObj.x, pathObj.y)
}

function drawing(ctx, pathObj) {
  ctx.lineWidth = pathObj.lineWidth
  ctx.lineTo(pathObj.x, pathObj.y)
  ctx.stroke()
  ctx.closePath()
  ctx.arc(pathObj.x, pathObj.y, pathObj.lineWidth / 2, 0, 2 * Math.PI)
  ctx.fill()
  ctx.beginPath()
  ctx.moveTo(pathObj.x, pathObj.y)
}