// Game state variables
let board = Array(9).fill(null); // 3x3 board as a 1D array
let player1Score = 0; // Player 1 (X) score, per session
let player2Score = 0; // Player 2 or AI (O) score, per session
let player1Wins = parseInt(localStorage.getItem("tttPlayer1Wins")) || 0; // Persistent Player 1 wins
let player2Wins = parseInt(localStorage.getItem("tttPlayer2Wins")) || 0; // Persistent Player 2/AI wins
let currentPlayer = "X"; // Current player, X starts
let gameActive = false; // Indicates if game is active
let isMultiplayer = false; // Tracks multiplayer mode
let difficulty = "easy"; // AI difficulty (easy, medium, hard)
let overrideMode = false; // Tracks override mode state
const player1Name = localStorage.getItem("player1Name") || "Cyber Warrior"; // Player 1 name
let player2Name = localStorage.getItem("player2Name") || "Neon Striker"; // Player 2 name
const winningCombos = [ // Winning combinations
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6] // Diagonals
];

// Update win/loss counter display
function updateWinLossCounter() {
    document.getElementById("tttPlayer1Wins").textContent = `Player X Wins: ${player1Wins}`;
    document.getElementById("tttPlayer2Wins").textContent = `Player O Wins: ${player2Wins}`;
}

// Initialize page on DOM load
function initPage() {
    const portalOverlay = document.getElementById("portal-overlay");
    const playerSelection = document.getElementById("player-selection");
    // Show player selection after portal animation
    setTimeout(() => {
        portalOverlay.style.display = "none"; // Hide portal
        playerSelection.style.display = "flex"; // Show mode selection
        document.body.style.overflow = "auto"; // Enable scrolling
    }, 2000);

    // Event listeners for mode selection
    document.getElementById("singlePlayer").addEventListener("click", () => {
        isMultiplayer = false;
        startGame();
    });
    document.getElementById("multiPlayer").addEventListener("click", promptPlayer2Name);
    document.getElementById("confirmPlayer2Name").addEventListener("click", confirmPlayer2Name);
    // Event listener for override mode toggle
    document.getElementById("overrideMode").addEventListener("change", () => {
        overrideMode = document.getElementById("overrideMode").checked;
        playSound("clickSound");
        updateBoard(); // Update board visuals to reflect override mode
    });
    updateWinLossCounter(); // Initialize win/loss display
}

// Prompt for Player 2 name in multiplayer mode
function promptPlayer2Name() {
    const playerSelection = document.getElementById("player-selection");
    const player2NameOverlay = document.getElementById("player2-name");
    playSound("clickSound");
    playerSelection.style.display = "none"; // Hide mode selection
    player2NameOverlay.style.display = "flex"; // Show name input
}

// Confirm Player 2 name and start multiplayer
function confirmPlayer2Name() {
    const player2NameInput = document.getElementById("player2NameInput");
    const player2NameError = document.getElementById("player2NameError");
    let name = player2NameInput.value.trim();
    const nameRegex = /^[a-zA-Z0-9\s]+$/;

    // Validate name
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
    isMultiplayer = true;
    playSound("clickSound");
    startGame();
}

// Start a new game
function startGame() {
    gameActive = true;
    board = Array(9).fill(null);
    currentPlayer = "X";
    overrideMode = false; // Reset override mode
    document.getElementById("overrideMode").checked = false; // Reset checkbox
    if (!isMultiplayer) {
        difficulty = document.querySelector('input[name="difficulty"]:checked').value || "easy";
    }
    document.getElementById("player-selection").style.display = "none";
    document.getElementById("main-content").style.display = "block";
    document.getElementById("VictoryTxt").style.display = "none";
    document.getElementById("LossTxt").style.display = "none";
    updateDisplay();
    createBoard();
    cycleColors("result");
    updateWinLossCounter(); // Update win/loss display on game start
}

// Update game display
function updateDisplay() {
    document.getElementById("player1Score").textContent = `${player1Name} (X): ${player1Score}`;
    document.getElementById("player2Score").textContent = `${isMultiplayer ? player2Name : "AI"} (O): ${player2Score}`;
    document.getElementById("turn").textContent = `Turn: ${currentPlayer === "X" ? player1Name + " (X)" : (isMultiplayer ? player2Name + " (O)" : "AI (O)")}`;
}

// Create game board
function createBoard() {
    const boardElement = document.getElementById("board");
    boardElement.innerHTML = "";
    for (let i = 0; i < 9; i++) {
        const cell = document.createElement("div");
        cell.className = "cell";
        cell.setAttribute("data-index", i);
        cell.addEventListener("click", () => handleCellClick(i));
        boardElement.appendChild(cell);
    }
    updateBoard();
}

// Handle cell click
function handleCellClick(index) {
    if (!gameActive) return;
    if (!overrideMode && board[index] !== null) return; // Prevent overwriting unless override mode is on
    if (!isMultiplayer && currentPlayer === "O") return; // Prevent player clicking during AI turn
    playSound("actionSound");
    board[index] = currentPlayer;
    updateBoard();
    const winner = checkWinner();
    if (winner) {
        endGame(winner);
    } else if (isMultiplayer && board.every(cell => cell !== null)) {
        // Check for tie in multiplayer mode
        endGame(null); // Null indicates a tie
    } else {
        currentPlayer = currentPlayer === "X" ? "O" : "X";
        updateDisplay();
        if (!isMultiplayer && currentPlayer === "O") {
            setTimeout(aiMove, 500);
        }
    }
}

// Update board visuals
function updateBoard() {
    const cells = document.querySelectorAll(".cell");
    cells.forEach((cell, index) => {
        cell.textContent = board[index] || "";
        cell.classList.toggle("x", board[index] === "X");
        cell.classList.toggle("o", board[index] === "O");
        cell.classList.toggle("disabled", board[index] !== null && !overrideMode); // Disable only if override mode is off
    });
}

// Check for winner
function checkWinner() {
    for (const combo of winningCombos) {
        const [a, b, c] = combo;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return board[a];
        }
    }
    return null;
}

// AI move logic
function aiMove() {
    if (!gameActive) return;
    let move;
    if (overrideMode) {
        // In override mode, AI can choose any cell
        if (difficulty === "easy") {
            move = Math.floor(Math.random() * 9); // Random cell
        } else if (difficulty === "medium") {
            move = getWinningMove("O") || getWinningMove("X") || Math.floor(Math.random() * 9);
        } else {
            move = minimax(board, "O").index;
        }
    } else {
        // Normal mode, choose empty cells
        if (difficulty === "easy") {
            move = getRandomMove();
        } else if (difficulty === "medium") {
            move = getWinningMove("O") || getWinningMove("X") || getRandomMove();
        } else {
            move = minimax(board, "O").index;
        }
    }
    if (move !== undefined) {
        board[move] = "O";
        updateBoard();
        const winner = checkWinner();
        if (winner) {
            endGame(winner);
        } else {
            currentPlayer = "X";
            updateDisplay();
        }
    }
}

// Get random move (for normal mode)
function getRandomMove() {
    const available = board.map((val, idx) => val === null ? idx : null).filter(val => val !== null);
    return available[Math.floor(Math.random() * available.length)];
}

// Check for winning/blocking move
function getWinningMove(player) {
    for (const combo of winningCombos) {
        const [a, b, c] = combo;
        if (board[a] === player && board[b] === player && (overrideMode || !board[c])) return c;
        if (board[a] === player && (overrideMode || !board[b]) && board[c] === player) return b;
        if ((overrideMode || !board[a]) && board[b] === player && board[c] === player) return a;
    }
    return null;
}

// Minimax algorithm (adapted for override mode)
function minimax(newBoard, player) {
    const available = overrideMode
        ? Array.from({ length: 9 }, (_, i) => i) // All cells available
        : newBoard.map((val, idx) => val === null ? idx : null).filter(val => val !== null);
    const winner = checkWinner();
    if (winner === "O") return { score: 10 };
    if (winner === "X") return { score: -10 };
    if (available.length === 0) return { score: 0 }; // Shouldn't occur as game continues

    const moves = [];
    for (const index of available) {
        const move = {};
        move.index = index;
        const original = newBoard[index];
        newBoard[index] = player;
        if (player === "O") {
            move.score = minimax(newBoard, "X").score;
        } else {
            move.score = minimax(newBoard, "O").score;
        }
        newBoard[index] = original; // Undo move
        moves.push(move);
    }

    let bestMove;
    if (player === "O") {
        let bestScore = -Infinity;
        for (const move of moves) {
            if (move.score > bestScore) {
                bestScore = move.score;
                bestMove = move;
            }
        }
    } else {
        let bestScore = Infinity;
        for (const move of moves) {
            if (move.score < bestScore) {
                bestScore = move.score;
                bestMove = move;
            }
        }
    }
    return bestMove;
}

// End game
function endGame(winner) {
    gameActive = false;
    const victoryElement = document.getElementById("VictoryTxt");
    const lossElement = document.getElementById("LossTxt");
    if (winner === "X") {
        player1Score++;
        player1Wins++;
        localStorage.setItem("tttPlayer1Wins", player1Wins);
        victoryElement.textContent = `${player1Name} (X) Secures the Grid!`;
        victoryElement.style.display = "inline";
        lossElement.style.display = "none";
        playSound("winSound");
    } else if (winner === "O") {
        player2Score++;
        player2Wins++;
        localStorage.setItem("tttPlayer2Wins", player2Wins);
        lossElement.textContent = `${isMultiplayer ? player2Name : "AI"} (O) Secures the Grid!`;
        lossElement.style.display = "inline";
        victoryElement.style.display = "none";
        playSound("loseSound");
    } else if (isMultiplayer) {
        // Tie condition for multiplayer mode
        victoryElement.textContent = "Gridlock: It's a Tie!";
        victoryElement.style.display = "inline";
        lossElement.style.display = "none";
        playSound("loseSound"); // Using lose sound for tie
    }
    updateDisplay();
    updateWinLossCounter(); // Update win/loss display after game ends
}

// Reset game
function resetGame() {
    playSound("clickSound");
    const portalOverlay = document.getElementById("portal-overlay");
    const playerSelection = document.getElementById("player-selection");
    const mainContent = document.getElementById("main-content");
    mainContent.style.display = "none";
    portalOverlay.style.display = "flex";
    setTimeout(() => {
        gameActive = false;
        board = Array(9).fill(null);
        currentPlayer = "X";
        overrideMode = false;
        document.getElementById("overrideMode").checked = false;
        document.getElementById("VictoryTxt").textContent = "";
        document.getElementById("LossTxt").textContent = "";
        playerSelection.style.display = "flex";
        portalOverlay.style.display = "none";
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

// Cycle colors for result text
function cycleColors(elementId) {
    const element = document.getElementById(elementId);
    const colors = ["#00ccff", "#ff00ff", "#00ff00", "#ffff00", "#ff6600"];
    let index = 0;
    setInterval(() => {
        element.style.color = colors[index];
        element.style.textShadow = `0 0 5px ${colors[index]}, 0 0 10px ${colors[index]}, 0 0 20px ${colors[index]}`;
        index = (index + 1) % colors.length;
    }, 700);
}

// Portal transition
function portalTransition(url) {
    playSound("clickSound");
    const portalOverlay = document.getElementById("portal-overlay");
    const mainContent = document.getElementById("main-content");
    mainContent.style.display = "none";
    portalOverlay.style.display = "flex";
    setTimeout(() => window.location.href = url, 2000);
}

// Initialize on DOM load
document.addEventListener("DOMContentLoaded", initPage);