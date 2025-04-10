// Game state variables
let board = Array(9).fill(null); // 3x3 board represented as a 1D array
let player1Score = 0; // Score for Player 1 (X)
let player2Score = 0; // Score for Player 2 or AI (O)
let currentPlayer = "X"; // Current player, X starts
let gameActive = false; // Flag to indicate if the game is active
let isMultiplayer = false; // Flag for multiplayer mode
let difficulty = "easy"; // AI difficulty level (easy, medium, hard)
const player1Name = localStorage.getItem("player1Name") || "Cyber Warrior"; // Player 1 name from localStorage or default
let player2Name = localStorage.getItem("player2Name") || "Neon Striker"; // Player 2 name, default if not set
const winningCombos = [ // Array of winning combinations (indices)
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6] // Diagonals
];

// Initialize page when DOM is fully loaded
function initPage() {
    const portalOverlay = document.getElementById("portal-overlay"); // Portal overlay element
    const playerSelection = document.getElementById("player-selection"); // Mode selection overlay
    const mainContent = document.getElementById("main-content"); // Main game content
    // Show player selection after portal animation
    setTimeout(() => {
        portalOverlay.style.display = "none"; // Hide portal
        playerSelection.style.display = "flex"; // Show mode selection
        mainContent.style.display = "none"; // Hide game content
        document.body.style.overflow = "auto"; // Enable scrolling
    }, 2000);

    // Add event listeners for mode selection buttons
    document.getElementById("singlePlayer").addEventListener("click", () => startGame(false));
    document.getElementById("multiPlayer").addEventListener("click", promptPlayer2Name);
    document.getElementById("confirmPlayer2Name").addEventListener("click", confirmPlayer2Name);
}

// Prompt for Player 2 name in multiplayer mode
function promptPlayer2Name() {
    const playerSelection = document.getElementById("player-selection"); // Mode selection overlay
    const player2NameOverlay = document.getElementById("player2-name"); // Player 2 name overlay
    playerSelection.style.display = "none"; // Hide mode selection
    player2NameOverlay.style.display = "flex"; // Show name input overlay
}

// Confirm Player 2 name and start multiplayer game
function confirmPlayer2Name() {
    const player2NameInput = document.getElementById("player2NameInput"); // Player 2 name input field
    const player2NameError = document.getElementById("player2NameError"); // Error message element
    let name = player2NameInput.value.trim(); // Trimmed input value
    const nameRegex = /^[a-zA-Z0-9\s]+$/; // Regex for alphanumeric and spaces

    // Validate Player 2 name
    if (name.length === 0 || name.length > 20 || !nameRegex.test(name)) {
        name = "Neon Striker"; // Default name if invalid
        player2NameInput.value = name; // Set input to default
        player2NameError.textContent = "Invalid name! Only alphanumeric characters and spaces allowed.";
        player2NameError.style.display = "block"; // Show error
        setTimeout(() => player2NameError.style.display = "none", 3000); // Hide error after 3 seconds
    } else {
        player2NameError.style.display = "none"; // Hide error if valid
    }

    player2Name = name; // Set Player 2 name
    localStorage.setItem("player2Name", player2Name); // Store in localStorage
    document.getElementById("player2-name").style.display = "none"; // Hide name input overlay
    startGame(true); // Start multiplayer game
}

// Start a new game (single or multiplayer)
function startGame(multiplayer) {
    isMultiplayer = multiplayer; // Set game mode
    gameActive = true; // Activate game
    board = Array(9).fill(null); // Reset board to empty
    currentPlayer = "X"; // X always starts
    if (!isMultiplayer) difficulty = document.querySelector('input[name="difficulty"]:checked')?.value || "easy"; // Set AI difficulty
    document.getElementById("main-content").style.display = "block"; // Show game content
    updateDisplay(); // Update UI with scores and turn
    createBoard(); // Create the game board
    cycleColors("result"); // Start result text color cycling
    setupOverrideMode(); // Setup override mode functionality
}

// Update the game display (scores and turn)
function updateDisplay() {
    document.getElementById("player1Score").textContent = `${player1Name} (X): ${player1Score}`; // Display Player 1 score
    document.getElementById("player2Score").textContent = `${isMultiplayer ? player2Name : "AI"} (O): ${player2Score}`; // Display Player 2 or AI score
    document.getElementById("turn").textContent = `Turn: ${currentPlayer === "X" ? player1Name + " (X)" : (isMultiplayer ? player2Name + " (O)" : "AI (O)")}`; // Display current turn
}

// Create the game board with clickable cells
function createBoard() {
    const boardElement = document.getElementById("board"); // Board container element
    boardElement.innerHTML = ""; // Clear any existing cells
    for (let i = 0; i < 9; i++) {
        const cell = document.createElement("div"); // Create new cell
        cell.className = "cell"; // Apply cell styling
        cell.setAttribute("data-index", i); // Set index attribute for click handling
        cell.addEventListener("click", () => handleCellClick(i)); // Add click event listener
        boardElement.appendChild(cell); // Add cell to board
    }
    updateBoard(); // Update board visuals after creation
}

// Setup override mode functionality
function setupOverrideMode() {
    const overrideCheckbox = document.getElementById("overrideMode"); // Override mode checkbox
    overrideCheckbox.checked = false; // Ensure unchecked at start
    overrideCheckbox.addEventListener("change", (e) => {
        if (e.target.checked) {
            playSound("overrideSound"); // Play override sound when enabled
            if (!isMultiplayer && currentPlayer === "O") {
                currentPlayer = "X"; // Switch back to player if AI's turn
                updateDisplay(); // Update UI immediately
            }
        } else if (!isMultiplayer && currentPlayer === "O") {
            setTimeout(aiMove, 500); // AI moves if override is disabled during its turn
        }
    });
}

// Handle cell click by player
function handleCellClick(index) {
    const overrideMode = document.getElementById("overrideMode").checked; // Check if override mode is active
    // Prevent click if game is inactive, cell is taken (unless override), or AI's turn without override
    if (!gameActive || (!overrideMode && board[index] !== null) || (!isMultiplayer && currentPlayer === "O" && !overrideMode)) return;
    playSound("actionSound"); // Play action sound on click
    board[index] = currentPlayer; // Set cell to current player's symbol
    updateBoard(); // Update board visuals
    const winner = checkWinner(); // Check for a winner
    if (winner) {
        endGame(winner); // End game if there's a winner
    } else if (!board.includes(null)) {
        endGame("tie"); // End game if board is full (tie)
    } else {
        currentPlayer = currentPlayer === "X" ? "O" : "X"; // Switch player
        updateDisplay(); // Update UI with new turn
        if (!isMultiplayer && currentPlayer === "O" && !overrideMode) {
            setTimeout(aiMove, 500); // Trigger AI move if not overridden
        }
    }
}

// Update the visual board based on game state
function updateBoard() {
    const cells = document.querySelectorAll(".cell"); // Get all cell elements
    cells.forEach((cell, index) => {
        cell.textContent = board[index] || ""; // Set cell content (X, O, or empty)
        cell.classList.toggle("x", board[index] === "X"); // Apply X styling
        cell.classList.toggle("o", board[index] === "O"); // Apply O styling
        cell.classList.toggle("disabled", board[index] !== null); // Disable filled cells
    });
}

// Check for a winner based on winning combinations
function checkWinner() {
    for (const combo of winningCombos) {
        const [a, b, c] = combo; // Destructure winning combo indices
        if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a]; // Return winner (X or O)
    }
    return null; // No winner found
}

// AI move logic based on difficulty
function aiMove() {
    if (!gameActive || document.getElementById("overrideMode").checked) return; // Exit if game inactive or override is on
    let move;
    if (difficulty === "easy") {
        move = getRandomMove(); // Random move for easy mode
    } else if (difficulty === "medium") {
        move = getWinningMove("O") || getWinningMove("X") || getRandomMove(); // Win, block, or random for medium
    } else { // Hard mode
        move = minimax(board, "O").index; // Optimal move using minimax
    }
    if (move !== undefined) {
        board[move] = "O"; // Place AI's O
        updateBoard(); // Update board visuals
        const winner = checkWinner(); // Check for winner
        if (winner) {
            endGame(winner); // End game if AI wins
        } else if (!board.includes(null)) {
            endGame("tie"); // End game if tie
        } else {
            currentPlayer = "X"; // Switch back to player
            updateDisplay(); // Update UI
        }
    }
}

// Get a random available move for AI
function getRandomMove() {
    const available = board.map((val, idx) => val === null ? idx : null).filter(val => val !== null); // Array of empty cell indices
    return available[Math.floor(Math.random() * available.length)]; // Return random available index
}

// Check for a winning or blocking move for given player
function getWinningMove(player) {
    for (const combo of winningCombos) {
        const [a, b, c] = combo; // Destructure combo
        if (board[a] === player && board[b] === player && !board[c]) return c; // Win/block at c
        if (board[a] === player && !board[b] && board[c] === player) return b; // Win/block at b
        if (!board[a] && board[b] === player && board[c] === player) return a; // Win/block at a
    }
    return null; // No winning/blocking move
}

// Minimax algorithm for hard AI to find optimal move
function minimax(newBoard, player) {
    const available = newBoard.map((val, idx) => val === null ? idx : null).filter(val => val !== null); // Available spots
    const winner = checkWinner(); // Check current board state
    if (winner === "O") return { score: 10 }; // AI wins
    if (winner === "X") return { score: -10 }; // Player wins
    if (available.length === 0) return { score: 0 }; // Tie

    const moves = []; // Array to store possible moves
    for (const index of available) {
        const move = {}; // Move object
        move.index = index; // Store move index
        newBoard[index] = player; // Simulate move
        if (player === "O") {
            move.score = minimax(newBoard, "X").score; // Maximize AI score
        } else {
            move.score = minimax(newBoard, "O").score; // Minimize player score
        }
        newBoard[index] = null; // Undo move
        moves.push(move); // Add move to list
    }

    let bestMove; // Best move object
    if (player === "O") { // AI's turn
        let bestScore = -Infinity; // Start with worst score
        for (const move of moves) {
            if (move.score > bestScore) { // Find highest score
                bestScore = move.score;
                bestMove = move;
            }
        }
    } else { // Player's turn
        let bestScore = Infinity; // Start with worst score
        for (const move of moves) {
            if (move.score < bestScore) { // Find lowest score
                bestScore = move.score;
                bestMove = move;
            }
        }
    }
    return bestMove; // Return best move with score and index
}

// End the game with result (winner or tie)
function endGame(result) {
    gameActive = false; // Deactivate game
    const resultElement = document.getElementById("result"); // Result display element
    if (result === "X") {
        player1Score++; // Increment Player 1 score
        resultElement.textContent = `${player1Name} (X) Secures the Grid!`; // Win message
        playSound("winSound"); // Play win sound
    } else if (result === "O") {
        player2Score++; // Increment Player 2/AI score
        resultElement.textContent = `${isMultiplayer ? player2Name : "AI"} (O) Secures the Grid!`; // Win message
        playSound("loseSound"); // Play lose sound
    } else {
        resultElement.textContent = "Grid Locked - Tie!"; // Tie message
        playSound("loseSound"); // Play tie sound
    }
    updateDisplay(); // Update scores in UI
}

// Reset game to mode selection screen
function resetGame() {
    playSound("clickSound"); // Play click sound
    const portalOverlay = document.getElementById("portal-overlay"); // Portal overlay
    const playerSelection = document.getElementById("player-selection"); // Mode selection overlay
    const mainContent = document.getElementById("main-content"); // Main game content
    mainContent.style.display = "none"; // Hide game content
    portalOverlay.style.display = "flex"; // Show portal animation
    setTimeout(() => {
        gameActive = false; // Reset game state
        playerSelection.style.display = "flex"; // Show mode selection
        portalOverlay.style.display = "none"; // Hide portal
        document.getElementById("result").textContent = ""; // Clear result message
    }, 2000); // 2-second delay for portal effect
}

// Play audio sound with error handling
function playSound(soundId) {
    const sound = document.getElementById(soundId); // Get audio element by ID
    if (sound) {
        sound.currentTime = 0; // Reset sound to start
        sound.play().catch(error => console.log("Sound play error:", error)); // Play sound, log errors
    }
}

// Cycle colors for result text for visual effect
function cycleColors(elementId) {
    const element = document.getElementById(elementId); // Target element for color cycling
    const colors = ["#00ccff", "#ff00ff", "#00ff00", "#ffff00", "#ff6600"]; // Array of neon colors
    let index = 0; // Current color index
    setInterval(() => {
        element.style.color = colors[index]; // Set text color
        element.style.textShadow = `0 0 5px ${colors[index]}, 0 0 10px ${colors[index]}, 0 0 20px ${colors[index]}`; // Set glow effect
        index = (index + 1) % colors.length; // Cycle to next color
    }, 700); // Change color every 700ms
}

// Handle portal transition to another page
function portalTransition(url) {
    const portalOverlay = document.getElementById("portal-overlay"); // Portal overlay
    const mainContent = document.getElementById("main-content"); // Main game content
    playSound("clickSound"); // Play click sound
    mainContent.style.display = "none"; // Hide current content
    portalOverlay.style.display = "flex"; // Show portal animation
    setTimeout(() => window.location.href = url, 2000); // Redirect to new URL after 2 seconds
}

// Add event listener for DOM content loaded to initialize page
document.addEventListener("DOMContentLoaded", initPage);