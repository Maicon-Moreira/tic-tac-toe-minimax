const ws = innerWidth
const hudHeight = innerHeight - ws
const gridSize = 3
const maxDepth = 100
const sequenceToWin = 3
const quadSize = ws / gridSize
const buttonSize = [ws / 10 * 3, hudHeight / 10 * 2]
const player1ChangeButtonPos = [ws / 10, ws + hudHeight / 10 * 3]
const player1ChangeTextPos = [ws / 10 + ws / 10 * 3 / 2, ws + 4 * hudHeight / 10]
const player2ChangeButtonPos = [ws / 10 * 6, ws + hudHeight / 10 * 3]
const player2ChangeTextPos = [ws / 10 * 6 + ws / 10 * 3 / 2, ws + 4 * hudHeight / 10]
const restartChangeButtonPos = [ws / 10 * 3.5, ws + hudHeight / 10 * 6]
const restartChangeTextPos = [ws / 2, ws + 7 * hudHeight / 10]
let grid = newGrid(gridSize)
let numCalculations = 0
let currentPlayer = 1
let winner = null
let scenariosCalculated = ''
let player1Auto = false
let player2Auto = false
let mouseDelay = 10

function setup() {
  createCanvas(ws, innerHeight);
  noFill()
  textAlign(CENTER, CENTER)
}

function draw() {
  mouseDelay--

  // draw everything
  background(153, 208, 255);

  noStroke()
  fill(0)
  textSize(20)
  text(scenariosCalculated, ws / 2, ws + hudHeight / 10 * 9)

  textSize(30)
  if (winner === null) text('SEM GANHADOR', ws / 2, ws + hudHeight / 10)
  else if (winner === 0) text('EMPATE', ws / 2, ws + hudHeight / 10)
  else if (winner === 1) text('JOGADOR 1 GANHOU', ws / 2, ws + hudHeight / 10)
  else if (winner === -1) text('JOGADOR 2 GANHOU', ws / 2, ws + hudHeight / 10)

  textSize(25)
  if (player1Auto) {
    fill(0, 100, 100)
    rect(...player1ChangeButtonPos, ...buttonSize)
    fill(0)
    text('IA', ...player1ChangeTextPos)
  }
  else {
    fill(100, 0, 100)
    rect(...player1ChangeButtonPos, ...buttonSize)
    fill(0)
    text('MANUAL', ...player1ChangeTextPos)
  }
  if (player2Auto) {
    fill(0, 100, 100)
    rect(...player2ChangeButtonPos, ...buttonSize)
    fill(0)
    text('IA', ...player2ChangeTextPos)
  }
  else {
    fill(100, 0, 100)
    rect(...player2ChangeButtonPos, ...buttonSize)
    fill(0)
    text('MANUAL', ...player2ChangeTextPos)
  }

  textSize(15)
  fill(100, 0, 100)
  rect(...restartChangeButtonPos, ...buttonSize)
  fill(0)
  text('RECOMECAR', ...restartChangeTextPos)

  noFill()
  for (let x = 0; x < gridSize; x++) {

    stroke(0)
    strokeWeight(2)

    line(x * quadSize, 0, x * quadSize, ws)
    line(0, x * quadSize, ws, x * quadSize)
    line((x + 1) * quadSize, 0, (x + 1) * quadSize, ws)
    line(0, (x + 1) * quadSize, ws, (x + 1) * quadSize)

    for (let y = 0; y < gridSize; y++) {
      if (grid[x][y] == -1) {

        stroke(255, 0, 0)
        strokeWeight(10)

        circle(x * quadSize + quadSize / 2, y * quadSize + quadSize / 2, quadSize * 0.6)

      } else if (grid[x][y] == 1) {

        stroke(0, 255, 0)
        strokeWeight(10)

        line(x * quadSize + quadSize / 4,
          y * quadSize + quadSize / 4,
          x * quadSize + quadSize * 3 / 4,
          y * quadSize + quadSize * 3 / 4)

        line(x * quadSize + quadSize / 4,
          y * quadSize + quadSize * 3 / 4,
          x * quadSize + quadSize * 3 / 4,
          y * quadSize + quadSize / 4)
      }
    }
  }

  AIPlay()
}

function mousePressed() {
  if (mouseDelay < 0) {
    mouseDelay = 10

    if (dist(...player1ChangeTextPos, mouseX, mouseY) < hudHeight / 10) {
      player1Auto = !player1Auto
    }

    if (dist(...player2ChangeTextPos, mouseX, mouseY) < hudHeight / 10) {
      player2Auto = !player2Auto
    }

    if (dist(...restartChangeTextPos, mouseX, mouseY) < hudHeight / 10) {
      grid = newGrid(gridSize)
      currentPlayer = 1
    }

    if (currentPlayer == 1 && !player1Auto) {
      const x = floor(mouseX / quadSize)
      const y = floor(mouseY / quadSize)

      if (x >= 0 && x < gridSize && y >= 0 && y < gridSize && grid[x][y] == 0) {
        grid[x][y] = 1
        currentPlayer = 2
      }
    }
    else if (currentPlayer == 2 && !player2Auto) {
      const x = floor(mouseX / quadSize)
      const y = floor(mouseY / quadSize)

      if (x >= 0 && x < gridSize && y >= 0 && y < gridSize && grid[x][y] == 0) {
        grid[x][y] = -1
        currentPlayer = 1
      }
    }

    winner = checkWinner(grid)
    if (winner == 0) {
      currentPlayer = null
    }
  }
}

function AIPlay(player) {
  // se for a vez da IA
  if (currentPlayer == 1 && player1Auto) {
    console.log('--------------------------------------------')

    const moves = createMoves(grid, 1)
    const movesIndex = []

    let bestScore = -Infinity

    for (const move of moves) {
      const score = minimax(move, 0, false)

      movesIndex.push([score, move])

      if (score > bestScore) {
        bestScore = score
      }

      logGrid(move)
      console.log(score)
    }

    let selectedMove = null
    while (!selectedMove) {
      const randomI = floor(random(movesIndex.length))
      if (movesIndex[randomI][0] == bestScore) selectedMove = movesIndex[randomI][1]
    }

    grid = selectedMove
    scenariosCalculated = numCalculations + ' cenários futuros calculados'
    numCalculations = 0
    currentPlayer = 2
    winner = checkWinner(grid)
    if (winner == 0) {
      currentPlayer = null
    }
  }

  else if (currentPlayer == 2 && player2Auto) {
    console.log('--------------------------------------------')

    const moves = createMoves(grid, -1)
    const movesIndex = []

    let bestScore = Infinity

    for (const move of moves) {
      const score = minimax(move, 0, true)

      movesIndex.push([score, move])

      if (score < bestScore) {
        bestScore = score
      }

      logGrid(move)
      console.log(score)
    }

    let selectedMove = null
    while (!selectedMove) {
      const randomI = floor(random(movesIndex.length))
      if (movesIndex[randomI][0] == bestScore) selectedMove = movesIndex[randomI][1]
    }

    grid = selectedMove
    scenariosCalculated = numCalculations + ' cenários futuros calculados'
    numCalculations = 0
    currentPlayer = 1
    winner = checkWinner(grid)
    if (winner == 0) {
      currentPlayer = null
    }
  }
}

function newGrid(size) {
  const grid = []
  for (let x = 0; x < size; x++) {
    grid[x] = []
    for (let y = 0; y < size; y++) {
      grid[x][y] = 0
    }
  }
  return grid
}

function createMoves(g, player) {
  const moves = []

  for (const x in g) {
    for (const y in g[0]) {
      if (g[x][y] == 0) {
        const newMove = copyGrid(g)
        newMove[x][y] = player
        moves.push(newMove)
      }
    }
  }

  return moves
}

function copyGrid(g) {
  const newGrid = []
  for (const a in g) {
    newGrid[a] = []
    for (const b in g) {
      newGrid[a][b] = grid[a][b]
    }
  }
  return newGrid
}

function checkWinner(g) {
  let counter = 0

  for (let x = 0; x < gridSize; x++) {
    for (let y = 0; y < gridSize; y++) {
      const initialPlayer = g[x][y]

      if (initialPlayer !== 0) {
        counter++


        for (let vX = -1; vX <= 1; vX++) {
          for (let vY = -1; vY <= 1; vY++) {
            if (!(vX == 0 && vY == 0)) {

              for (let d = 1; d <= sequenceToWin; d++) {

                if (d == sequenceToWin) {
                  return initialPlayer
                } else if (
                  x + vX * d >= gridSize ||
                  y + vY * d >= gridSize ||
                  x + vX * d < 0 ||
                  x + vX * d < 0 ||
                  g[x + vX * d][y + vY * d] != initialPlayer) {

                  break

                }
              }
            }
          }
        }
      }
    }
  }

  if (counter == gridSize ** 2) return 0

  return null
}

// console.log(checkWinner([
//   [1, -1, 1],
//   [1, -1, 0],
//   [-1, 1, -1]
// ]))



function minimax(node, depth, maximizer) {
  numCalculations++

  const winner = checkWinner(node)
  if (winner !== null || depth == maxDepth) return winner

  if (!maximizer) {
    let alpha = Infinity

    for (let x = 0; x < gridSize; x++) {
      for (let y = 0; y < gridSize; y++) {
        if (node[x][y] == 0) {
          node[x][y] = -1
          const newAlpha = minimax(node, depth + 1, true)
          node[x][y] = 0
          if (newAlpha < alpha) alpha = newAlpha
          if (alpha < 0) return -1
        }
      }
    }
    return alpha
  }
  else {
    let alpha = -Infinity

    for (let x = 0; x < gridSize; x++) {
      for (let y = 0; y < gridSize; y++) {
        if (node[x][y] == 0) {

          node[x][y] = 1
          const newAlpha = minimax(node, depth + 1, false)
          node[x][y] = 0
          if (newAlpha > alpha) alpha = newAlpha
          if (alpha > 0) return 1

        }
      }
    }
    return alpha
  }
}

function logGrid(grid) {
  let text = ''
  for (let x = 0; x < gridSize; x++) {
    for (let y = 0; y < gridSize; y++) {
      text += ' ' + grid[y][x] + ' '
    }
    text += '\n'
  }
  console.log(text)
}