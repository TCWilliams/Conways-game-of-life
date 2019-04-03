const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')

const sideLength = 100
const squareSize = 7
const grid = []
const grey = '#A6A6A6'
const blue = '#334EA6'
const yellow = '#DED821'
const white = '#FFFFFF' // unused
let running  = null // running interval 

// preset patterns (hardcoded to 100 x 100 grid)
const oscillators = [201,202,203,607,707,608,909,910,801,141,142,161,184,203,204]
const movers = [201,302,303,401,402]
function createRandom() { // returns array of random live squares
	return Array.from({length: ((sideLength * sideLength) / 2)}, () => Math.floor(Math.random() * (sideLength * sideLength)))
}

// create grid array
for (let i = 0; i < sideLength; i++) {
  for (let j = 0; j < sideLength; j++) {
    grid.push({
      index: j + (i * sideLength),
      x: j,
      y: i,
      aliveNow: false, // alive status this generation
      aliveNextGen: false, // alive status next generation
      width: squareSize,
      height: squareSize,
      top: i * squareSize,
      left: j * squareSize
    })
  }
}

// click handler to grid
canvas.addEventListener('click', (event) => {
  const clickedSquare = {
    x: Math.floor(event.layerX / squareSize),
    y: Math.floor(event.layerY / squareSize),
    index: Math.floor(event.layerX / squareSize) + (Math.floor(event.layerY / squareSize) * sideLength)
  }
  setAlive(clickedSquare)
})

drawGrid()
getNeighbours()

// Render grid. square by square
function drawGrid() {
  for (const square of grid) {
    drawSquare(square)
  }
}
// draw each square, grey for dead, blue for alive
function drawSquare(square) {
  if (square.aliveNextGen && square.aliveNow) { // yellow if surviving >1 generation
  ctx.strokeStyle = yellow
  ctx.fillStyle = yellow
  } else {
  	ctx.strokeStyle = square.aliveNextGen ? blue : grey
  	ctx.fillStyle = square.aliveNextGen ? blue : grey
  }
  ctx.fillRect(square.left, square.top, square.width, square.height)
  ctx.strokeRect(square.left, square.top, square.width, square.height)
  square.aliveNow = square.aliveNextGen
}

// add array of neighbours to each square
function getNeighbours() {
	//const edgeSqu
  const edgeSquares = grid.filter(e => e.x === 0 || e.y === 0 || e.x === sideLength -1 || e.y === sideLength - 1)
  for (const square of grid) { 
    square.neighbours = grid.filter(e => {
    	if (e !== square) return (Math.abs(square.x - e.x) <= 1 && Math.abs(square.y - e.y) <= 1)
    })
    if (square.neighbours.length === 8) continue // not an edge square, go to next square
    //else go on to get opposite side neighbours for edges
    const oppositeNeighbours = edgeSquares.filter(e => 
      (Math.abs(square.x - e.x) === (sideLength -1)) && Math.abs(square.y - e.y) <= 1 || 
      (Math.abs(square.y - e.y) === (sideLength - 1)) && Math.abs(square.x - e.x) <= 1)
    square.neighbours = [...square.neighbours, ...oppositeNeighbours] 
  }      
}
// toggle live status of clicked square
function setAlive(square) {
  const clicked = grid.find(e => e.index === square.index)
  clicked.aliveNextGen = !clicked.aliveNextGen
  drawSquare(clicked)
}

// runs game
function go() {
	if (running) {
	  return //already running
  }
  running = setInterval(() => {
  	let stateChanged = false // to stop game if no change in next gen
    for (const square of grid) {
      const aliveNeighbours = square.neighbours.filter(e => e.aliveNow).length // number of alive neighbours

      if (!square.aliveNow) { // square dead
        if (aliveNeighbours === 3) { // set next generation states based on neighbour current states
          square.aliveNextGen = true
          stateChanged = true
        } else {
          square.aliveNextGen = false
        }
      } else { // square is alive
        if (aliveNeighbours < 2 || aliveNeighbours > 3) {
          square.aliveNextGen = false
          stateChanged = true
        } else {
          square.aliveNextGen = true
        }
      }
    }
    drawGrid()
    if (!stateChanged) { // everyone is dead or stabilised 
	   	stop()
    }
  }, 250) // run every 250ms
}

function reset() {
  stop()
  for (const square of grid) {
    square.aliveNextGen = false
  }
  drawGrid()
}

function stop() {
  if (running) {
    clearInterval(running)
  }
  running = null
}  
// premade patterns
function setPattern(squares) {
	reset()
	for (const square of squares) {
	  grid.find(e => e.index === square).aliveNextGen = true
  }
	drawGrid()
}
