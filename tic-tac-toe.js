// Game state variables
let board = Array(9).fill(null); // 3x3 board represented as a 1D array
let currentPlayer = "X"; // Current player (X or O)
let player1Score = 0; // Score for Player 1
let player2Score = 0; // Score for Player 2 or AI
let gameActive = false; // Flag to track if the game is active
let isMultiplayer = false; // Flag to track if the game is in multiplayer mode
let difficulty = "easy"; // AI difficulty (easy, medium, hard)
let overrideMode = false; // Flag for Override Mode
const userName = localStorage.getItem("userName") || "Cyber Warrior"; // Username from localStorage
const winningCombinations = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6] // Diagonals
];

// Initialize the page when the DOM is fully loaded
function initPage() {
    // Get the portal overlay, player selection, and main content elements
    const portalOverlay = document.getElementById("portal-overlay");
    const playerSelection = document.getElementById("player-selection");
    const mainContent = document.getElementById("main-content");

    // After 2 seconds, hide the portal overlay and show the player selection overlay
    setTimeout(() => {
        if (portalOverlay && playerSelection && mainContent) {
            portalOverlay.style.display = "none"; // Hide loading animation
            playerSelection.style.display = "flex"; // Show mode selection
            mainContent.style.display = "none"; // Keep main content hidden
            document.body.style.overflow = "auto"; // Re-enable scrolling
        }
    }, 2000);

    // Add event listeners for mode selection buttons
    const singlePlayerBtn = document.getElementById("singlePlayer");
    const multiPlayerBtn = document.getElementById("multiPlayer");
    if (singlePlayerBtn) {
        singlePlayerBtn.addEventListener("click", () => startGame(false));
    }
    if (multiPlayerBtn) {
        multiPlayerBtn.addEventListener("click", () => startGame(true));
    }
}

// Start a new game based on the selected mode
function startGame(multiplayer) {
    // Set game mode (multiplayer or single-player)
    isMultiplayer = multiplayer;
    gameActive = true;
    board = Array(9).fill(null);
    currentPlayer = "X";

    // If single-player, get the selected AI difficulty
    if (!isMultiplayer) {
        difficulty = document.querySelector('input[name="difficulty"]:checked')?.value || "easy";
    }

    // Hide the player selection overlay and show the main content
    const playerSelection = document.getElementById("player-selection");
    const mainContent = document.getElementById("main-content");
    if (playerSelection && mainContent) {
        playerSelection.style.display = "none";
        mainContent.style.display = "block";
    }

    // Set up the override mode toggle
    const overrideToggle = document.getElementById("overrideMode");
    if (overrideToggle) {
        overrideToggle.addEventListener("change", () => {
            overrideMode = overrideToggle.checked;
            if (overrideMode) playSound("overrideSound");
        });
    }

    // Update the initial display (scores, turn)
    updateDisplay();
    // Create the game board
    createBoard();
    // Start color cycling for the result text
    cycleColors("result");
}

// Update the display (scores, turn)
function updateDisplay() {
    // Get the DOM elements for scores and turn
    const player1ScoreElement = document.getElementById("player1Score");
    const player2ScoreElement = document.getElementById("player2Score");
    const turnElement = document.getElementById("turn");

    // Update the elements with current game state
    if (player1ScoreElement && player2ScoreElement && turnElement) {
        player1ScoreElement.textContent = `${userName} (X): ${player1Score}`;
        player2ScoreElement.textContent = `${isMultiplayer ? "Player 2" : "AI"} (O): ${player2Score}`;
        turnElement.textContent = `Turn: ${currentPlayer === "X" ? userName + " (X)" : (isMultiplayer ? "Player 2 (O)" : "AI (O)")}`;
    }

    // Enable or disable cells based on the current player and game state
    const cells = document.querySelectorAll(".cell");
    cells.forEach(cell => {
        cell.classList.toggle("disabled", !gameActive || (currentPlayer === "O" && !isMultiplayer));
    });
}

// Create the 3x3 game board
function createBoard() {
    const boardElement = document.getElementById("board");
    if (boardElement) {
        boardElement.innerHTML = ""; // Clear any existing cells
        // Create 9 cells for the 3x3 grid
        for (let i = 0; i < 9; i++) {
            const cell = document.createElement("div");
            cell.className = "cell";
            cell.setAttribute("data-index", i);
            cell.addEventListener("click", () => handleCellClick(i));
            boardElement.appendChild(cell);
        }
    }
}

// Handle a cell click
function handleCellClick(index) {
    // Ignore if the game is not active, cell is already taken, or it's the AI's turn
    if (!gameActive || board[index] || (currentPlayer === "O" && !isMultiplayer)) return;

    // Play action sound
    playSound("actionSound");

    // Handle the move
    makeMove(index, currentPlayer);
    // Check for a winner or tie
    const winner = checkWinner();
    if (winner) {
        endGame(winner);
        return;
    }
    if (board.every(cell => cell)) {
        endGame("tie");
        return;
    }

    // Switch players
    currentPlayer = currentPlayer === "X" ? "O" : "X";
    updateDisplay();

    // If single-player mode and it's the AI's turn, trigger AI move
    if (!isMultiplayer && currentPlayer === "O") {
        setTimeout(aiMove, 500); // Delay AI move for better UX
    }
}

// Make a move on the board
function makeMove(index, player) {
    // If override mode is on and the cell is already taken by the opponent, allow override
    if (overrideMode && board[index] && board[index] !== player) {
        playSound("overrideSound");
    } else if (board[index]) {
        return; // Cell is already taken and override mode is off
    }

    // Update the board and display
    board[index] = player;
    const cell = document.querySelector(`.cell[data-index="${index}"]`);
    if (cell) {
        cell.textContent = player;
        cell.classList.add(player.toLowerCase());
        cell.classList.add("disabled");
    }
}

// AI move logic based on difficulty
function aiMove() {
    // Ignore if the game is not active
    if (!gameActive) return;

    let move;

    // Easy difficulty: Random move
    if (difficulty === "easy") {
        const available = board.map((val, idx) => val === null ? idx : null).filter(val => val !== null);
        move = available[Math.floor(Math.random() * available.length)];
    }
    // Medium difficulty: Block or win if possible, otherwise random
    else if (difficulty === "medium") {
        // Check for winning move
        move = findBestMove("O");
        if (move === null) {
            // Check for blocking move
            move = findBestMove("X");
        }
        if (move === null) {
            // Random move
            const available = board.map((val, idx) => val === null ? idx : null).filter(val => val !== null);
            move = available[Math.floor(Math.random() * available.length)];
        }
    }
    // Hard difficulty: Use Minimax algorithm
    else if (difficulty === "hard") {
        move = minimax(board, "O").index;
    }

    // Make the AI's move
    if (move !== undefined && move !== null) {
        makeMove(move, "O");
        // Check for a winner or tie
        const winner = checkWinner();
        if (winner) {
            endGame(winner);
            return;
        }
        if (board.every(cell => cell)) {
            endGame("tie");
            return;
        }
        // Switch back to player
        currentPlayer = "X";
        updateDisplay();
    }
}

// Find a move that wins or blocks the opponent
function findBestMove(player) {
    for (let combo of winningCombinations) {
        const [a, b, c] = combo;
        // Check for two cells with the player's mark and one empty
        if (board[a] === player && board[b] === player && !board[c]) return c;
        if (board[a] === player && !board[b] && board[c] === player) return b;
        if (!board[a] && board[b] === player && board[c] === player) return a;
    }
    return null;
}

// Minimax algorithm for hard difficulty
function minimax(newBoard, player) {
    // Get available spots
    const available = newBoard.map((val, idx) => val === null ? idx : null).filter(val => val !== null);

    // Base cases: check for terminal states
    const winner = checkWinner();
    if (winner === "O") return { score: 10 };
    if (winner === "X") return { score: -10 };
    if (available.length === 0) return { score: 0 };

    // Initialize variables to track the best move
    let bestMove;
    if (player === "O") {
        let bestScore = -Infinity;
        for (let i of available) {
            // Simulate the move
            newBoard[i] = "O";
            const result = minimax(newBoard, "X");
            newBoard[i] = null; // Undo the move
            if (result.score > bestScore) {
                bestScore = result.score;
                bestMove = { index: i, score: bestScore };
            }
        }
    } else {
        let bestScore = Infinity;
        for (let i of available) {
            // Simulate the move
            newBoard[i] = "X";
            const result = minimax(newBoard, "O");
            newBoard[i] = null; // Undo the move
            if (result.score < bestScore) {
                bestScore = result.score;
                bestMove = { index: i, score: bestScore };
            }
        }
    }
    return bestMove;
}

// Check for a winner
function checkWinner() {
    for (let combo of winningCombinations) {
        const [a, b, c] = combo;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return board[a];
        }
    }
    return null;
}

// End the game (win, lose, or tie)
function endGame(result) {
    gameActive = false;
    const resultElement = document.getElementById("result");
    let message = "";
    if (result === "tie") {
        message = "Grid Locked!";
        playSound("loseSound");
    } else {
        if (result === "X") {
            message = `${userName} Wins!`;
            player1Score++;
            playSound("winSound");
        } else {
            message = `${isMultiplayer ? "Player 2" : "AI"} Wins!`;
            player2Score++;
            playSound("loseSound");
        }
    }
    if (resultElement) {
        resultElement.textContent = message;
    }
    updateDisplay();
}

// Reset the game to the mode selection screen
function resetGame() {
    // Play click sound
    playSound("clickSound");
    // Get the necessary DOM elements
    const portalOverlay = document.getElementById("portal-overlay");
    const playerSelection = document.getElementById("player-selection");
    const mainContent = document.getElementById("main-content");

    // Show portal animation and transition to mode selection
    if (portalOverlay && playerSelection && mainContent) {
        mainContent.style.display = "none";
        portalOverlay.style.display = "flex";
        setTimeout(() => {
            gameActive = false;
            board = Array(9).fill(null);
            currentPlayer = "X";
            player1Score = 0;
            player2Score = 0;
            overrideMode = false;
            const overrideToggle = document.getElementById("overrideMode");
            if (overrideToggle) overrideToggle.checked = false;
            playerSelection.style.display = "flex";
            portalOverlay.style.display = "none";
        }, 2000);
    }
}

// Play a sound effect by ID
function playSound(soundId) {
    const sound = document.getElementById(soundId);
    if (sound) {
        sound.currentTime = 0; // Reset sound to the beginning
        sound.play().catch(error => console.log("Sound play error:", error)); // Play sound, log errors
    } else {
        console.log(`Sound element with ID ${soundId} not found.`); // Log if sound element is missing
    }
}

// Cycle colors for the result text to create a neon effect
function cycleColors(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        const colors = ["#00ccff", "#ff00ff", "#00ff00", "#ffff00", "#ff6600"]; // Array of neon colors
        let index = 0;
        setInterval(() => {
            element.style.color = colors[index]; // Change text color
            element.style.textShadow = `0 0 5px ${colors[index]}, 0 0 10px ${colors[index]}, 0 0 20px ${colors[index]}`; // Change glow
            index = (index + 1) % colors.length; // Cycle through colors
        }, 700); // Change color every 700ms
    }
}

// Handle navigation to another page with a portal transition animation
function portalTransition(url) {
    const portalOverlay = document.getElementById("portal-overlay");
    const mainContent = document.getElementById("main-content");
    if (portalOverlay && mainContent) {
        playSound("clickSound"); // Play click sound
        mainContent.style.display = "none"; // Hide main content
        portalOverlay.style.display = "flex"; // Show portal animation
        setTimeout(() => {
            window.location.href = url; // Navigate to the new page after 2 seconds
        }, 2000);
    }
}

// Add event listener to initialize the page when the DOM is loaded
document.addEventListener("DOMContentLoaded", initPage);
