// Game state variables
let player1Score = 0; // Tracks Player 1's score
let player2Score = 0; // Tracks Player 2's score
let currentPlayer = 1; // Tracks current player (1 or 2)
let player1Choice = null; // Stores Player 1's choice
let player2Choice = null; // Stores Player 2's choice
let currentRound = 1; // Tracks current round
const maxRounds = 5; // Maximum number of rounds
let gameActive = false; // Indicates if game is active
let isMultiplayer = false; // Indicates multiplayer mode
let difficulty = "easy"; // AI difficulty level
const player1Name = localStorage.getItem("player1Name") || "Cyber Warrior"; // Player 1 name, default if not set
let player2Name = localStorage.getItem("player2Name") || "Neon Striker"; // Player 2 name, default if not set
const choices = ["rock", "paper", "scissors"]; // Possible game choices
let colorCycleInterval = null; // NEW: Tracks color cycling interval

// Initialize page on DOM load
function initPage() {
    // Get DOM elements
    const portalOverlay = document.getElementById("portal-overlay");
    const playerSelection = document.getElementById("player-selection");
    const mainContent = document.getElementById("main-content");
    const player2NameOverlay = document.getElementById("player2-name");

    // Ensure initial states
    portalOverlay.style.display = "flex";
    playerSelection.style.display = "none";
    mainContent.style.display = "none";
    player2NameOverlay.style.display = "none";
    document.body.style.overflow = "hidden";

    // Transition to player selection after portal animation
    setTimeout(() => {
        portalOverlay.style.display = "none";
        playerSelection.style.display = "flex";
        document.body.style.overflow = "auto";
    }, 2000);

    // Add event listeners for mode selection
    document.getElementById("singlePlayer").addEventListener("click", () => startGame(false));
    document.getElementById("multiPlayer").addEventListener("click", promptPlayer2Name);
    document.getElementById("confirmPlayer2Name").addEventListener("click", confirmPlayer2Name);
}

// Prompt for Player 2 name in multiplayer mode
function promptPlayer2Name() {
    const playerSelection = document.getElementById("player-selection");
    const player2NameOverlay = document.getElementById("player2-name");
    playerSelection.style.display = "none";
    player2NameOverlay.style.display = "flex";
}

// Confirm Player 2 name and start multiplayer game
function confirmPlayer2Name() {
    const player2NameInput = document.getElementById("player2NameInput");
    const player2NameError = document.getElementById("player2NameError");
    let name = player2NameInput.value.trim();
    const nameRegex = /^[a-zA-Z0-9\s]+$/; // Allow alphanumeric and spaces

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
    startGame(true);
}

// Start a new game
function startGame(multiplayer) {
    // Reset game state
    isMultiplayer = multiplayer;
    gameActive = true;
    player1Score = 0;
    player2Score = 0;
    currentRound = 1;
    currentPlayer = 1;
    player1Choice = null;
    player2Choice = null;
    if (!isMultiplayer) {
        difficulty = document.querySelector('input[name="difficulty"]:checked')?.value || "easy";
    }

    // Show main content
    document.getElementById("player-selection").style.display = "none";
    document.getElementById("main-content").style.display = "block";

    // Clear any existing color cycling
    stopColorCycle();

    // Update display and setup buttons
    updateDisplay();
    setupChoiceButtons();
}

// Update game display
function updateDisplay() {
    // Update scores
    document.getElementById("player1Score").textContent = `${player1Name}: ${player1Score}`;
    document.getElementById("player2Score").textContent = `${isMultiplayer ? player2Name : "AI"}: ${player2Score}`;
    // Update round info
    document.getElementById("roundInfo").textContent = `Round ${currentRound} of ${maxRounds}`;
    // Update turn indicator
    document.getElementById("turn").textContent = `Turn: ${currentPlayer === 1 ? player1Name : (isMultiplayer ? player2Name : "AI")}`;
    // Enable/disable choice buttons
    const buttons = document.querySelectorAll(".neon-btn[id='rock'], .neon-btn[id='paper'], .neon-btn[id='scissors']");
    buttons.forEach(btn => {
        btn.disabled = !gameActive || (!isMultiplayer && currentPlayer === 2);
    });
}

// Setup choice button event listeners
function setupChoiceButtons() {
    document.getElementById("rock").onclick = () => handleChoice("rock");
    document.getElementById("paper").onclick = () => handleChoice("paper");
    document.getElementById("scissors").onclick = () => handleChoice("scissors");
}

// Handle player choice
function handleChoice(choice) {
    if (!gameActive) return;
    playSound("actionSound");
    if (currentPlayer === 1) {
        player1Choice = choice;
        currentPlayer = 2;
        updateDisplay();
        if (!isMultiplayer) {
            setTimeout(aiMove, 500);
        }
    } else if (isMultiplayer) {
        player2Choice = choice;
        currentPlayer = 1;
        determineWinner();
    }
}

// AI move logic
function aiMove() {
    if (!gameActive) return;
    let aiChoice;
    if (difficulty === "easy") {
        aiChoice = choices[Math.floor(Math.random() * 3)];
    } else if (difficulty === "medium") {
        // 50% chance to counter, 50% random
        aiChoice = Math.random() > 0.5
            ? (player1Choice === "rock" ? "paper" : player1Choice === "paper" ? "scissors" : "rock")
            : choices[Math.floor(Math.random() * 3)];
    } else {
        // Hard: always counter
        aiChoice = player1Choice === "rock" ? "paper" : player1Choice === "paper" ? "scissors" : "rock";
    }
    player2Choice = aiChoice;
    currentPlayer = 1;
    determineWinner();
}

// Determine round winner
function determineWinner() {
    const resultElement = document.getElementById("result");
    let result;
    let glowClass = "";

    // Reset any existing glow classes and color cycling
    resultElement.classList.remove("glowVictory", "glowLoss");
    stopColorCycle();

    if (player1Choice === player2Choice) {
        result = "Grid Locked!";
        // NEW: Start color cycling for ties
        cycleColors("result");
        playSound("loseSound"); // Tie sound
    } else if (
        (player1Choice === "rock" && player2Choice === "scissors") ||
        (player1Choice === "paper" && player2Choice === "rock") ||
        (player1Choice === "scissors" && player2Choice === "paper")
    ) {
        result = `${player1Name} Wins!`;
        player1Score++;
        glowClass = "glowVictory";
        playSound("winSound");
    } else {
        result = `${isMultiplayer ? player2Name : "AI"} Wins!`;
        player2Score++;
        glowClass = "glowLoss";
        playSound("loseSound");
    }

    // Apply result text and glow effect
    resultElement.textContent = `${player1Name} chose ${player1Choice}, ${isMultiplayer ? player2Name : "AI"} chose ${player2Choice}. ${result}`;
    if (glowClass) {
        resultElement.classList.add(glowClass);
    }

    // Proceed to next round or end game
    currentRound++;
    if (currentRound > maxRounds) {
        endGame();
    } else {
        player1Choice = null;
        player2Choice = null;
        updateDisplay();
    }
}

// End the game
function endGame() {
    gameActive = false;
    const resultElement = document.getElementById("result");
    let result;
    let glowClass = "";

    // Reset color cycling
    stopColorCycle();

    // Determine final winner
    if (player1Score > player2Score) {
        result = `${player1Name} Wins the Duel!`;
        glowClass = "glowVictory";
        playSound("winSound");
    } else if (player1Score < player2Score) {
        result = `${isMultiplayer ? player2Name : "AI"} Wins the Duel!`;
        glowClass = "glowLoss";
        playSound("loseSound");
    } else {
        result = "Duel Ends in a Tie!";
        // NEW: Start color cycling for final tie
        cycleColors("result");
        playSound("loseSound");
    }

    // Apply final result and glow effect
    resultElement.classList.remove("glowVictory", "glowLoss");
    resultElement.textContent = result;
    if (glowClass) {
        resultElement.classList.add(glowClass);
    }

    updateDisplay();
}

// Reset game to mode selection
function resetGame() {
    playSound("clickSound");
    const portalOverlay = document.getElementById("portal-overlay");
    const playerSelection = document.getElementById("player-selection");
    const mainContent = document.getElementById("main-content");
    const resultElement = document.getElementById("result");

    // Reset glow classes and color cycling
    resultElement.classList.remove("glowVictory", "glowLoss");
    stopColorCycle();

    // Show portal and transition
    mainContent.style.display = "none";
    portalOverlay.style.display = "flex";
    setTimeout(() => {
        gameActive = false;
        playerSelection.style.display = "flex";
        portalOverlay.style.display = "none";
        resultElement.textContent = "";
    }, 2000);
}

// Play audio sound
function playSound(soundId) {
    const sound = document.getElementById(soundId);
    if (sound) {
        sound.currentTime = 0;
        sound.play().catch(error => console.log("Sound play error:", error));
    }
}

// NEW: Cycle colors for an element
function cycleColors(elementId) {
    const element = document.getElementById(elementId);
    const colors = ["#00ccff", "#ff00ff", "#00ff00", "#ffff00", "#ff6600"]; // Neon theme colors
    let index = 0;

    // Clear any existing interval
    stopColorCycle();

    // Start new color cycling
    colorCycleInterval = setInterval(() => {
        element.style.color = colors[index];
        element.style.textShadow = `0 0 5px ${colors[index]}, 0 0 10px ${colors[index]}, 0 0 20px ${colors[index]}`;
        index = (index + 1) % colors.length;
    }, 700); // Change every 700ms
}

// NEW: Stop color cycling
function stopColorCycle() {
    if (colorCycleInterval) {
        clearInterval(colorCycleInterval);
        colorCycleInterval = null;
        const resultElement = document.getElementById("result");
        // Reset to default neon-text style
        resultElement.style.color = "#00ccff";
        resultElement.style.textShadow = "0 0 5px #00ccff, 0 0 10px #00ccff, 0 0 20px #00ccff";
    }
}

// Handle portal transition
function portalTransition(url) {
    const portalOverlay = document.getElementById("portal-overlay");
    const mainContent = document.getElementById("main-content");
    playSound("clickSound");
    mainContent.style.display = "none";
    portalOverlay.style.display = "flex";
    setTimeout(() => window.location.href = url, 2000);
}

// Initialize page on DOM content loaded
document.addEventListener("DOMContentLoaded", initPage);