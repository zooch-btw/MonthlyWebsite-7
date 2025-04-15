// Game state variables
let board = ['', '', '', '', '', '', '', '', '']; // Game board
let currentPlayer = 'X'; // Current player
let gameActive = false; // Game active status
let player1Score = 0; // Player 1 score
let player2Score = 0; // Player 2/AI score
let isMultiplayer = false; // Multiplayer mode flag
let difficulty = "easy"; // AI difficulty
const player1Name = localStorage.getItem("userName") || "Cyber Warrior"; // Player 1 name
let player2Name = localStorage.getItem("player2Name") || "Neon Striker"; // Player 2 name
let colorCycleInterval = null; // Color cycle interval
const winningCombinations = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6] // Diagonals
];

// Initialize page
function initPage() {
    const portalOverlay = document.getElementById("portal-overlay");
    const playerSelection = document.getElementById("player-selection");
    const mainContent = document.getElementById("main-content");
    const player2NameOverlay = document.getElementById("player2-name");

    portalOverlay.style.display = "flex";
    playerSelection.style.display = "none";
    mainContent.style.display = "none";
    player2NameOverlay.style.display = "none";
    document.body.style.overflow = "hidden";

    setTimeout(() => {
        portalOverlay.style.display = "none";
        playerSelection.style.display = "flex";
        document.body.style.overflow = "auto";
    }, 2000);

    document.getElementById("singlePlayer").addEventListener("click", () => startGame(false));
    document.getElementById("multiPlayer").addEventListener("click", promptPlayer2Name);
    document.getElementById("confirmPlayer2Name").addEventListener("click", confirmPlayer2Name);
}

// Prompt for Player 2 name
function promptPlayer2Name() {
    const playerSelection = document.getElementById("player-selection");
    const player2NameOverlay = document.getElementById("player2-name");
    playerSelection.style.display = "none";
    player2NameOverlay.style.display = "flex";
}

// Confirm Player 2 name
function confirmPlayer2Name() {
    const player2NameInput = document.getElementById("player2NameInput");
    const player2NameError = document.getElementById("player2NameError");
    let name = player2NameInput.value.trim();
    const nameRegex = /^[a-zA-Z0-9\s]+$/;

    if (name.length === 0 || name.length > 20 || !nameRegex.test(name)) {
        name = "Neon Striker";
        player2NameInput.value = name;
        player2NameError.textContent = "Invalid name! Only alphanumeric characters and spaces allowed.";
        player2NameError.style.display = "block";
        setTimeout(() => player2NameError.style.display = "none", 3000);
    } else {
        player2NameError.style.display = "none";
    }

    player2Name = name;
    localStorage.setItem("player2Name", player2Name);
    document.getElementById("player2-name").style.display = "none";
    startGame(true);
}

// Start new game
function startGame(multiplayer) {
    isMultiplayer = multiplayer;
    gameActive = true;
    board = ['', '', '', '', '', '', '', '', ''];
    currentPlayer = 'X';
    document.getElementById("VictoryTxt").style.display = "none";
    document.getElementById("LossTxt").style.display = "none";
    stopColorCycle();
    if (!isMultiplayer) {
        difficulty = document.querySelector('input[name="difficulty"]:checked')?.value || "easy";
    }

    document.getElementById("player-selection").style.display = "none";
    document.getElementById("main-content").style.display = "block";
    updateDisplay();
    setupBoard();
}

// Update display
function updateDisplay() {
    document.getElementById("player1Score").textContent = `${player1Name}: ${player1Score}`;
    document.getElementById("player2Score").textContent = `${isMultiplayer ? player2Name : "AI"}: ${player2Score}`;
    document.getElementById("turn").textContent = `Turn: ${currentPlayer === 'X' ? player1Name : (isMultiplayer ? player2Name : "AI")}`;
    document.querySelectorAll(".cell").forEach((cell, index) => {
        cell.textContent = board[index];
        cell.className = `cell ${board[index].toLowerCase()}`;
        cell.classList.toggle("disabled", !!board[index] || !gameActive);
    });
}

// Setup game board
function setupBoard() {
    const boardElement = document.getElementById("board");
    boardElement.innerHTML = '';
    for (let i = 0; i < 9; i++) {
        const cell = document.createElement("div");
        cell.className = "cell";
        cell.onclick = () => handleMove(i);
        boardElement.appendChild(cell);
    }
    updateDisplay();
}

// Handle player move
function handleMove(index) {
    if (!gameActive || board[index]) return;
    playSound("actionSound");
    board[index] = currentPlayer;
    if (checkWin()) {
        endGame(currentPlayer);
    } else if (board.every(cell => cell)) {
        endGame(null);
    } else {
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        updateDisplay();
        if (!isMultiplayer && currentPlayer === 'O') {
            setTimeout(aiMove, 500);
        }
    }
}

// AI move logic
function aiMove() {
    if (!gameActive) return;
    let move;
    if (difficulty === "easy") {
        move = getRandomMove();
    } else if (difficulty === "medium") {
        move = Math.random() > 0.5 ? getBestMove() : getRandomMove();
    } else {
        move = getBestMove();
    }
    if (move !== null) {
        board[move] = 'O';
        if (checkWin()) {
            endGame('O');
        } else if (board.every(cell => cell)) {
            endGame(null);
        } else {
            currentPlayer = 'X';
            updateDisplay();
        }
    }
}

// Get random move
function getRandomMove() {
    const emptyCells = board.map((cell, index) => cell === '' ? index : null).filter(i => i !== null);
    return emptyCells.length ? emptyCells[Math.floor(Math.random() * emptyCells.length)] : null;
}

// Get best move using minimax
function getBestMove() {
    let bestScore = -Infinity;
    let move = null;
    for (let i = 0; i < 9; i++) {
        if (!board[i]) {
            board[i] = 'O';
            let score = minimax(board, 0, false);
            board[i] = '';
            if (score > bestScore) {
                bestScore = score;
                move = i;
            }
        }
    }
    return move;
}

// Minimax algorithm
function minimax(board, depth, isMaximizing) {
    const result = checkWin();
    if (result) {
        return result === 'O' ? 10 - depth : -10 + depth;
    }
    if (board.every(cell => cell)) {
        return 0;
    }

    if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < 9; i++) {
            if (!board[i]) {
                board[i] = 'O';
                let score = minimax(board, depth + 1, false);
                board[i] = '';
                bestScore = Math.max(score, bestScore);
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < 9; i++) {
            if (!board[i]) {
                board[i] = 'X';
                let score = minimax(board, depth + 1, true);
                board[i] = '';
                bestScore = Math.min(score, bestScore);
            }
        }
        return bestScore;
    }
}

// Check for win
function checkWin() {
    for (let combo of winningCombinations) {
        if (board[combo[0]] && board[combo[0]] === board[combo[1]] && board[combo[1]] === board[combo[2]]) {
            return board[combo[0]];
        }
    }
    return null;
}

// End game
function endGame(winner) {
    gameActive = false;
    const victoryElement = document.getElementById("VictoryTxt");
    const lossElement = document.getElementById("LossTxt");
    victoryElement.style.display = "none";
    lossElement.style.display = "none";
    stopColorCycle();

    let result;
    if (winner) {
        if (winner === 'X') {
            player1Score++;
            result = `${player1Name} Wins!`;
            victoryElement.textContent = result;
            victoryElement.style.display = "inline";
            playSound("winSound");
        } else {
            player2Score++;
            result = `${isMultiplayer ? player2Name : "AI"} Wins!`;
            lossElement.textContent = result;
            lossElement.style.display = "inline";
            playSound("loseSound");
        }
    } else {
        result = "Grid Locked!";
        cycleColors("result");
        playSound("loseSound");
    }

    updateDisplay();
}

// Reset game
function resetGame() {
    playSound("clickSound");
    const portalOverlay = document.getElementById("portal-overlay");
    const playerSelection = document.getElementById("player-selection");
    const mainContent = document.getElementById("main-content");
    mainContent.style.display = "none";
    portalOverlay.style.display = "flex";
    document.getElementById("VictoryTxt").style.display = "none";
    document.getElementById("LossTxt").style.display = "none";
    stopColorCycle();
    setTimeout(() => {
        portalOverlay.style.display = "none";
        playerSelection.style.display = "flex";
        gameActive = false;
    }, 2000);
}

// Play sound
function playSound(soundId) {
    const sound = document.getElementById(soundId);
    if (sound) {
        sound.currentTime = 0;
        sound.play().catch(error => console.log("Sound play error:", error));
    }
}

// Cycle colors for result
function cycleColors(elementId) {
    const element = document.getElementById(elementId);
    const colors = ["#00ccff", "#ff00ff", "#00ff00", "#ffff00", "#ff6600"];
    let index = 0;
    stopColorCycle();
    colorCycleInterval = setInterval(() => {
        element.style.color = colors[index];
        element.style.textShadow = `0 0 5px ${colors[index]}, 0 0 10px ${colors[index]}, 0 0 20px ${colors[index]}`;
        index = (index + 1) % colors.length;
    }, 700);
}

// Stop color cycling
function stopColorCycle() {
    if (colorCycleInterval) {
        clearInterval(colorCycleInterval);
        colorCycleInterval = null;
        const resultElement = document.getElementById("result");
        resultElement.style.color = "#00ccff";
        resultElement.style.textShadow = "0 0 5px #00ccff, 0 0 10px #00ccff, 0 0 20px #00ccff";
    }
}

// Portal transition
function portalTransition(url) {
    const portalOverlay = document.getElementById("portal-overlay");
    const mainContent = document.getElementById("main-content");
    playSound("clickSound");
    mainContent.style.display = "none";
    portalOverlay.style.display = "flex";
    setTimeout(() => window.location.href = url, 2000);
}

// Initialize page
document.addEventListener("DOMContentLoaded", initPage);