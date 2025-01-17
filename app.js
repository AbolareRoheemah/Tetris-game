document.addEventListener('DOMContentLoaded', () => {
    const grid = document.querySelector('.grid');
    const squares = Array.from(document.querySelectorAll('.grid div'));
    const scoreDisplay = document.querySelector('#score');
    const startBtn = document.querySelector('#start-button');
    const width = 10;
    let score = 0;
    let timerId;
    let nextRandom = 0
    const colors = ['orange', 'blue', 'purple', 'red', 'green']

    // the shapes
    const lTetromino = [
        [1, width+1, width*2+1, 2],
        [width, width+1, width+2, width*2+2],
        [1, width+1, width*2+1, width*2],
        [width, width*2, width*2+1, width*2+2]
    ];
    const zTetromino = [
        [0, width, width+1, width*2+1],
        [width+1, width+2, width*2, width*2+1],
        [0, width, width+1, width*2+1],
        [width+1, width+2, width*2, width*2+1]
    ];
    const tTetromino = [
        [1, width, width+1, width+2],
        [1, width+1, width+2, width*2+1],
        [width, width+1, width+2, width*2+1],
        [1, width, width+1, width*2+1]
    ];
    const oTetromino = [
        [0, 1, width, width+1],
        [0, 1, width, width+1],
        [0, 1, width, width+1],
        [0, 1, width, width+1]
    ];
    const iTetromino = [
        [1, width+1, width*2+1, width*3+1],
        [width, width+1, width+2, width+3],
        [1, width+1, width*2+1, width*3+1],
        [width, width+1, width+2, width+3]
    ];

    const theTetrominos = [lTetromino, zTetromino, tTetromino, iTetromino, oTetromino] 

    let currentPosition = 4;
    let currentRotation = 0;
    let random = Math.floor(Math.random()*theTetrominos.length)
    let current = theTetrominos[random][currentRotation];

    // color/draw the shapes
    function draw() {
        current.forEach(index => {
            squares[currentPosition + index].classList.add('tetromino')
            squares[currentPosition + index].style.backgroundColor = colors[random]
        })
    }

    // clean/remove the shapes
    function undraw() {
        current.forEach(index => {
            squares[currentPosition + index].classList.remove('tetromino')
            squares[currentPosition + index].style.backgroundColor = ''
        })
    }

    function control(e) {
        if (e.keyCode === 37) {
            moveLeft()
        } else if (e.keyCode === 38) {
            // rotate
            rotate()
        } else if (e.keyCode === 39) {
            // move right
            moveRight()
        } else if (e.keyCode === 40) {
            moveDown()
        }
    }
    document.addEventListener('keyup', control)

    // move shapes down every sec
    function moveDown() {
        undraw();
        currentPosition += width;
        draw();
        freeze();
    }
    // timerId = setInterval(moveDown, 500)

    function freeze() {
        if (current.some(index => squares[currentPosition + index + width].classList.contains('taken')) || 
            current.some(index => currentPosition + index === squares.length - width)) {
            current.forEach(index => squares[currentPosition + index].classList.add('taken'));
    
            random = nextRandom
            nextRandom = Math.floor(Math.random() * theTetrominos.length);
            current = theTetrominos[random][currentRotation];
            currentPosition = 4;
            draw();
            displayShape()
            addScore()
            gameOver()
        }
    }
    

    function moveLeft() {
        undraw()
        const isAtLeftEdge = current.some(index => (currentPosition + index) % width === 0)

        if (!isAtLeftEdge) {
            currentPosition -= 1
        }
        if (current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
            currentPosition += 1
        }
        draw()
    }

    function moveRight() {
        undraw()
        const isAtRightEdge = current.some(index => (currentPosition + index) % width === width-1)

        if(!isAtRightEdge) currentPosition += 1

        if (current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
            currentPosition -= 1
        }
        draw();
    }
    
    function rotate() {
    undraw();
    currentRotation++;
    if (currentRotation === current.length) { // if the current rotation gets to 4, make it go back to 0
        currentRotation = 0;
    }
    current = theTetrominos[random][currentRotation];
    draw();
}

// show next shape preview
const displaySquares = document.querySelectorAll('.mini-grid div')
const displayWidth = 4
let displayIndex = 0

// the first/default rotation of each shape
const upNextTetrominoes = [
    [1, displayWidth+1, displayWidth*2+1, 2],
    [0, displayWidth, displayWidth+1, displayWidth*2+1],
    [1, displayWidth, displayWidth+1, displayWidth+2],
    [0, 1, displayWidth, displayWidth+1],
    [1, displayWidth+1, displayWidth*2+1, displayWidth*3+1]
]

// function to display the shapes
function displayShape() {
    // first remove any special (filled) color if any
    displaySquares.forEach(square => {
        square.classList.remove('tetromino')
        square.style.backgroundColor = ''
    })
    upNextTetrominoes[nextRandom].forEach(index => {
        displaySquares[displayIndex + index].classList.add('tetromino')
        displaySquares[displayIndex + index].style.backgroundColor = colors[nextRandom]
    })
}

// start and stop
startBtn.addEventListener('click', () => {
    if (timerId) {
        clearInterval(timerId)
        timerId = null
    } else {
        draw()
        timerId = setInterval(moveDown, 500)
        nextRandom = Math.floor(Math.random() * theTetrominos.length)
        displayShape()
    }
})

// handle scoring
function addScore() {
    for (let i = 0; i < 199; i += width) {
        const row = [i, i + 1, i + 2, i + 3, i + 4, i + 5, i + 6, i + 7, i + 8, i + 9];
        if (row.every(index => squares[index].classList.contains('taken'))) {
            score += 10;
            scoreDisplay.innerHTML = score;

            // Remove the filled row from the DOM
            row.forEach(index => {
                squares[index].classList.remove('taken');
                squares[index].classList.remove('tetromino');
                squares[index].style.backgroundColor = ''
                grid.removeChild(squares[index]);
            });

            // Add a new empty row at the top
            for (let j = 0; j < width; j++) {
                const newSquare = document.createElement('div');
                grid.insertBefore(newSquare, grid.firstChild);
                squares.unshift(newSquare);
            }

            // Update the squares array
            squares.splice(i + width, width);
        }
    }
}

// game over
function gameOver() {
    if (current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
        scoreDisplay.innerHTML = ' Game Over'
        clearInterval(timerId)
        timerId = null
        // Stop the next tetromino from changing
        nextRandom = 0;
        // Stop the topmost shape from changing
        current = theTetrominos[0][0];
        draw();
        // Stop the next tetromino from changing
        displayShape()
    }
}

})