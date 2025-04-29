// Game state variables
let board = Array(9).fill(null); // 3x3 board as a 1D array
let player1Score = parseInt(sessionStorage.getItem("tttPlayer1Score")) || 0; // Player 1 (X) score, persists in session
let player2Score = parseInt(sessionStorage.getItem("tttPlayer2Score")) || 0; // Player 2/AI (O) score, persists in session
let player1Wins = 0; // Player 1 wins, starts at 0 on page reload
let player2Wins = 0; // Player 2/AI wins, starts at 0 on page reload
let currentPlayer = "X"; // Current player, X starts
let gameActive = false; // Indicates if game is active
let isMultiplayer = false; // Tracks multiplayer mode
let difficulty = "easy"; // AI difficulty (easy, medium, hard)
let overrideMode = false; // Tracks override mode state (allows overwriting cells)
const player1Name = localStorage.getItem("player1Name") || "Cyber Warrior"; // Player 1 name
let player2Name = localStorage.getItem("player2Name") || "Neon Striker"; // Player 2 name
const winningCombos = [ // Winning combinations
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6] // Diagonals
];

// Updates win/loss counter display
function updateWinLossCounter() {
    const player1WinsElement = document.getElementById("tttPlayer1Wins");
    const player2WinsElement = document.getElementById("tttPlayer2Wins");
    if (player1WinsElement) player1WinsElement.textContent = `Player X Wins: ${player1Wins}`; // Update Player 1 wins
    if (player2WinsElement) player2WinsElement.textContent = `Player O Wins: ${player2Wins}`; // Update Player 2/AI wins
}

// Initializes page on DOM load
function initPage() {
    const portalOverlay = document.getElementById("portal-overlay");
    const playerSelection = document.getElementById("player-selection");
    if (!portalOverlay || !playerSelection) {
        console.error("Required DOM elements missing: portal-overlay or player-selection.");
        return;
    }

    // Set initial display states
    portalOverlay.style.display = "flex"; // Show portal overlay
    playerSelection.style.display = "none"; // Hide mode selection
    document.body.style.overflow = "hidden"; // Prevent scrolling

    // Show player selection after portal animation (2 seconds)
    setTimeout(() => {
        portalOverlay.style.display = "none"; // Hide portal
        playerSelection.style.display = "flex"; // Show mode selection
        document.body.style.overflow = "auto"; // Enable scrolling
    }, 2000);

    // Event listeners for mode selection
    const singlePlayerBtn = document.getElementById("singlePlayer");
    const multiPlayerBtn = document.getElementById("multiPlayer");
    const confirmNameBtn = document.getElementById("confirmPlayer2Name");
    if (singlePlayerBtn) singlePlayerBtn.addEventListener("click", () => {
        isMultiplayer = false;
        startGame();
    }); // Start single-player mode
    if (multiPlayerBtn) multiPlayerBtn.addEventListener("click", promptPlayer2Name); // Prompt for Player 2 name
    if (confirmNameBtn) confirmNameBtn.addEventListener("click", confirmPlayer2Name); // Confirm Player 2 name

    // Event listener for override mode toggle
    const overrideModeCheckbox = document.getElementById("overrideMode");
    if (overrideModeCheckbox) {
        overrideModeCheckbox.addEventListener("change", () => {
            overrideMode = overrideModeCheckbox.checked; // Update override mode
            playSound("actionSound"); // Play action sound
            updateBoard(); // Update board visuals
        });
    }

    // Preload audio files to ensure readiness
    preloadAudio();

    updateWinLossCounter(); // Initialize win/loss display
}

// Preloads audio files to ensure they’re ready for playback
function preloadAudio() {
    const soundIds = ["actionSound", "winSound", "loseSound"];
    soundIds.forEach(soundId => {
        const sound = document.getElementById(soundId);
        if (sound) {
            sound.load(); // Force load the audio
            console.log(`Audio '${soundId}' preloaded successfully from ${sound.src}.`);
        } else {
            console.warn(`Audio element with ID '${soundId}' not found. Ensure <audio id="${soundId}" src="${soundId === 'actionSound' ? 'action' : soundId === 'winSound' ? 'win' : 'lose'}.wav" preload="auto"></audio> is in HTML.`);
        }
    });
}

// Prompts for Player 2 name in multiplayer mode
function promptPlayer2Name() {
    const playerSelection = document.getElementById("player-selection");
    const player2NameOverlay = document.getElementById("player2-name");
    if (!playerSelection || !player2NameOverlay) return;
    playSound("actionSound"); // Play action sound
    playerSelection.style.display = "none"; // Hide mode selection
    player2NameOverlay.style.display = "flex"; // Show name input
}

// Confirms Player 2 name and starts multiplayer
function confirmPlayer2Name() {
    const player2NameInput = document.getElementById("player2NameInput");
    const player2NameError = document.getElementById("player2NameError");
    if (!player2NameInput || !player2NameError) return;

    let name = player2NameInput.value.trim(); // Trim input
    const nameRegex = /^[a-zA-Z0-9\s]+$/; // Alphanumeric and spaces

    // Validate name
    if (name.length === 0 || name.length > 20 || !nameRegex.test(name)) {
        name = "Neon Striker"; // Default name
        player2NameInput.value = name; // Update input field
        player2NameError.textContent = "Invalid name! Only alphanumeric characters and spaces allowed."; // Show error
        player2NameError.style.display = "block"; // Display error
        setTimeout(() => player2NameError.style.display = "none", 3000); // Hide error after 3s
    } else {
        player2NameError.style.display = "none"; // Hide error
    }

    player2Name = name; // Set Player 2 name
    localStorage.setItem("player2Name", player2Name); // Save to localStorage
    document.getElementById("player2-name").style.display = "none"; // Hide name input
    isMultiplayer = true; // Enable multiplayer
    playSound("actionSound"); // Play action sound
    startGame(); // Start game
}

// Starts a new game
function startGame() {
    gameActive = true; // Enable gameplay
    board = Array(9).fill(null); // Reset board
    currentPlayer = "X"; // X starts
    overrideMode = false; // Reset override mode
    const overrideModeCheckbox = document.getElementById("overrideMode");
    if (overrideModeCheckbox) overrideModeCheckbox.checked = false; // Reset checkbox
    if (!isMultiplayer) {
        difficulty = document.querySelector('input[name="difficulty"]:checked')?.value || "easy"; // Set AI difficulty
    }

    const playerSelection = document.getElementById("player-selection");
    const mainContent = document.getElementById("main-content");
    if (playerSelection && mainContent) {
        playerSelection.style.display = "none"; // Hide mode selection
        mainContent.style.display = "block"; // Show game content
    }

    const victoryElement = document.getElementById("VictoryTxt");
    const lossElement = document.getElementById("LossTxt");
    if (victoryElement) victoryElement.style.display = "none"; // Hide victory message
    if (lossElement) lossElement.style.display = "none"; // Hide loss message

    updateDisplay(); // Update scores and turn
    createBoard(); // Build game board
    updateWinLossCounter(); // Update win/loss display
}

// Updates game display (scores, turn)
function updateDisplay() {
    const player1ScoreElement = document.getElementById("player1Score");
    const player2ScoreElement = document.getElementById("player2Score");
    if (player1ScoreElement) {
        player1ScoreElement.textContent = `${player1Name} (X): ${player1Score}`; // Update Player 1 score
        sessionStorage.setItem("tttPlayer1Score", player1Score); // Persist in session
    }
    if (player2ScoreElement) {
        player2ScoreElement.textContent = `${isMultiplayer ? player2Name : "AI"} (O): ${player2Score}`; // Update Player 2/AI score
        sessionStorage.setItem("tttPlayer2Score", player2Score); // Persist in session
    }

    const turnElement = document.getElementById("turn");
    if (turnElement) {
        turnElement.textContent = `Turn: ${currentPlayer === "X" ? player1Name + " (X)" : (isMultiplayer ? player2Name + " (O)" : "AI (O)")}`; // Update turn
    }
}

// Creates the game board
function createBoard() {
    const boardElement = document.getElementById("board");
    if (!boardElement) return;

    boardElement.innerHTML = ""; // Clear existing board
    for (let i = 0; i < 9; i++) {
        const cell = document.createElement("div");
        cell.className = "cell"; // Apply cell styling
        cell.setAttribute("data-index", i); // Set index for click handling
        cell.addEventListener("click", () => handleCellClick(i)); // Bind click handler
        boardElement.appendChild(cell); // Add to board
    }
    updateBoard(); // Update visuals
}

// Handles cell click
function handleCellClick(index) {
    playSound("actionSound"); // Play action sound on every click
    if (!gameActive) return; // Ignore invalid moves if game inactive
    if (!overrideMode && board[index] !== null) return; // Prevent overwriting unless override mode
    if (!isMultiplayer && currentPlayer === "O") return; // Prevent clicking during AI turn
    board[index] = currentPlayer; // Set cell
    updateBoard(); // Update visuals
    const winner = checkWinner(); // Check for winner
    if (winner) {
        endGame(winner); // End with winner
    } else if (isMultiplayer && board.every(cell => cell !== null)) {
        endGame(null); // End with tie in multiplayer
    } else {
        currentPlayer = currentPlayer === "X" ? "O" : "X"; // Switch player
        updateDisplay(); // Update turn
        if (!isMultiplayer && currentPlayer === "O") {
            setTimeout(aiMove, 500); // AI move after delay
        }
    }
}

// Updates board visuals
function updateBoard() {
    const cells = document.querySelectorAll(".cell");
    cells.forEach((cell, index) => {
        cell.textContent = board[index] || ""; // Set X, O, or empty
        cell.classList.toggle("x", board[index] === "X"); // Apply X style
        cell.classList.toggle("o", board[index] === "O"); // Apply O style
        cell.classList.toggle("disabled", board[index] !== null && !overrideMode); // Disable unless override mode
    });
}

// Checks for winner
function checkWinner() {
    for (const combo of winningCombos) {
        const [a, b, c] = combo;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return board[a]; // Return X or O
        }
    }
    return null; // No winner
}

// Handles AI move logic
function aiMove() {
    if (!gameActive) return; // Ignore if game inactive
    let move;
    if (overrideMode) {
        // In override mode, AI can choose any cell
        if (difficulty === "easy") {
            move = Math.floor(Math.random() * 9); // Random cell
        } else if (difficulty === "medium") {
            move = getWinningMove("O") || getWinningMove("X") || Math.floor(Math.random() * 9); // Block or win
        } else {
            move = minimax(board, "O").index; // Optimal move
        }
    } else {
        // Normal mode, choose empty cells
        if (difficulty === "easy") {
            move = getRandomMove(); // Random empty cell
        } else if (difficulty === "medium") {
            move = getWinningMove("O") || getWinningMove("X") || getRandomMove(); // Block or win
        } else {
            move = minimax(board, "O").index; // Optimal move
        }
    }
    if (move !== undefined) {
        board[move] = "O"; // Set AI move
        updateBoard(); // Update visuals
        const winner = checkWinner(); // Check for winner
        if (winner) {
            endGame(winner); // End with winner
        } else {
            currentPlayer = "X"; // Switch to player
            updateDisplay(); // Update turn
        }
    }
}

// Gets random empty cell (for normal mode)
function getRandomMove() {
    const available = board.map((val, idx) => val === null ? idx : null).filter(val => val !== null);
    return available[Math.floor(Math.random() * available.length)]; // Random available cell
}

// Checks for winning/blocking move
function getWinningMove(player) {
    for (const combo of winningCombos) {
        const [a, b, c] = combo;
        if (board[a] === player && board[b] === player && (overrideMode || !board[c])) return c;
        if (board[a] === player && (overrideMode || !board[b]) && board[c] === player) return b;
        if ((overrideMode || !board[a]) && board[b] === player && board[c] === player) return a;
    }
    return null; // No winning move
}

// Minimax algorithm for optimal AI moves (adapted for override mode)
function minimax(newBoard, player) {
    const available = overrideMode
        ? Array.from({ length: 9 }, (_, i) => i) // All cells available
        : newBoard.map((val, idx) => val === null ? idx : null).filter(val => val !== null);
    const winner = checkWinner();
    if (winner === "O") return { score: 10 }; // AI wins
    if (winner === "X") return { score: -10 }; // Player wins
    if (available.length === 0) return { score: 0 }; // Tie or continue

    const moves = [];
    for (const index of available) {
        const move = {};
        move.index = index;
        const original = newBoard[index];
        newBoard[index] = player;
        if (player === "O") {
            move.score = minimax(newBoard, "X").score; // Check player's response
        } else {
            move.score = minimax(newBoard, "O").score; // Check AI's response
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

// Ends the game
function endGame(winner) {
    gameActive = false; // Disable gameplay
    const victoryElement = document.getElementById("VictoryTxt");
    const lossElement = document.getElementById("LossTxt");
    if (!victoryElement || !lossElement) return;

    if (winner === "X") {
        player1Score++; // Increment Player 1 score
        player1Wins++; // Increment wins
        sessionStorage.setItem("tttPlayer1Wins", player1Wins); // Save wins in session
        victoryElement.textContent = `${player1Name} (X) Secures the Grid!`; // Show victory message
        victoryElement.style.display = "inline"; // Display victory
        lossElement.style.display = "none"; // Hide loss
        playSound("winSound"); // Play win sound
    } else if (winner === "O") {
        player2Score++; // Increment Player 2/AI score
        player2Wins++; // Increment wins
        sessionStorage.setItem("tttPlayer2Wins", player2Wins); // Save wins in session
        lossElement.textContent = `${isMultiplayer ? player2Name : "AI"} (O) Secures the Grid!`; // Show loss message
        lossElement.style.display = "inline"; // Display loss
        victoryElement.style.display = "none"; // Hide victory
        playSound("loseSound"); // Play loss sound
    } else if (isMultiplayer) {
        // Tie condition for multiplayer mode
        victoryElement.textContent = "Gridlock: It's a Tie!"; // Show tie message
        victoryElement.style.display = "inline"; // Display tie
        lossElement.style.display = "none"; // Hide loss
        playSound("loseSound"); // Play tie sound
    }
    updateDisplay(); // Update scores
    updateWinLossCounter(); // Update win/loss display
}

// Resets game to mode selection without resetting scores or wins/losses
function resetGame() {
    playSound("actionSound"); // Play action sound
    const portalOverlay = document.getElementById("portal-overlay");
    const playerSelection = document.getElementById("player-selection");
    const mainContent = document.getElementById("main-content");
    if (!portalOverlay || !playerSelection || !mainContent) return;

    mainContent.style.display = "none"; // Hide game content
    portalOverlay.style.display = "flex"; // Show portal
    setTimeout(() => {
        gameActive = false; // Disable gameplay
        board = Array(9).fill(null); // Reset board
        currentPlayer = "X"; // Reset to X
        overrideMode = false; // Reset override mode
        const overrideModeCheckbox = document.getElementById("overrideMode");
        if (overrideModeCheckbox) overrideModeCheckbox.checked = false; // Reset checkbox
        const victoryElement = document.getElementById("VictoryTxt");
        const lossElement = document.getElementById("LossTxt");
        if (victoryElement) victoryElement.textContent = ""; // Clear victory
        if (lossElement) lossElement.textContent = ""; // Clear loss
        playerSelection.style.display = "flex"; // Show mode selection
        portalOverlay.style.display = "none"; // Hide portal
    }, 2000); // Match portal animation duration
}

// Plays sound with enhanced error handling and debugging
function playSound(soundId) {
    const sound = document.getElementById(soundId); // Get audio element
    if (!sound) {
        console.warn(`Audio element with ID '${soundId}' not found. Ensure <audio id="${soundId}" src="${soundId === 'actionSound' ? 'action' : soundId === 'winSound' ? 'win' : 'lose'}.wav" preload="auto"></audio> is in HTML.`);
        return;
    }
    sound.currentTime = 0; // Reset to start
    sound.play().catch(error => {
        console.error(`Error playing sound '${soundId}' from ${sound.src}: ${error.message}`); // Log detailed error
        if (error.name === "NotAllowedError") {
            console.warn("Autoplay blocked. Ensure sound is triggered after user interaction (e.g., click).");
        } else if (error.name === "NotSupportedError") {
            console.warn("Audio format (.wav) not supported by browser or file is corrupted. Verify PCM encoding (16-bit, 44.1kHz/48kHz).");
        }
    });
}

// Cycles colors for result text
function cycleColors(elementId) {
    const element = document.getElementById(elementId);
    if (!element) return;
    const colors = ["#00ccff", "#ff00ff", "#00ff00", "#ffff00", "#ff6600"]; // Neon colors
    let index = 0; // Current color index
    setInterval(() => {
        element.style.color = colors[index]; // Set color
        element.style.textShadow = `0 0 5px ${colors[index]}, 0 0 10px ${colors[index]}, 0 0 20px ${colors[index]}`; // Set glow
        index = (index + 1) % colors.length; // Next color
    }, 700); // Change every 700ms
}

// Handles portal transition to another page
function portalTransition(url) {
    const portalOverlay = document.getElementById("portal-overlay");
    const mainContent = document.getElementById("main-content");
    if (!portalOverlay || !mainContent) return;
    playSound("actionSound"); // Play transition sound
    mainContent.style.display = "none"; // Hide game content
    portalOverlay.style.display = "flex"; // Show portal
    setTimeout(() => window.location.href = url, 2000); // Navigate after 2s
}

// Initializes on DOM load
document.addEventListener("DOMContentLoaded", initPage);