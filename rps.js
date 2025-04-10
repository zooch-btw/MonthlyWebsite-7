// Game state variables
let player1Score = 0; // Player 1 score
let player2Score = 0; // Player 2 score
let currentPlayer = 1; // Current player (1 or 2)
let player1Choice = null; // Player 1's choice
let player2Choice = null; // Player 2's choice
let currentRound = 1; // Current round
const maxRounds = 5; // Maximum rounds
let gameActive = false; // Game activity flag
let isMultiplayer = false; // Multiplayer mode flag
let difficulty = "easy"; // AI difficulty
const player1Name = localStorage.getItem("player1Name") || "Cyber Warrior"; // Player 1 name from localStorage
let player2Name = localStorage.getItem("player2Name") || "Neon Striker"; // Player 2 name, default if not set
const choices = ["rock", "paper", "scissors"]; // Possible choices

// Initialize page on DOM load
function initPage() {
    const portalOverlay = document.getElementById("portal-overlay"); // Portal overlay
    const playerSelection = document.getElementById("player-selection"); // Mode selection overlay
    const mainContent = document.getElementById("main-content"); // Main game content
    setTimeout(() => { // Show mode selection after portal animation
        portalOverlay.style.display = "none";
        playerSelection.style.display = "flex";
        mainContent.style.display = "none";
        document.body.style.overflow = "auto";
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
    player2NameOverlay.style.display = "flex"; // Show Player 2 name input
}

// Confirm Player 2 name and start multiplayer game
function confirmPlayer2Name() {
    const player2NameInput = document.getElementById("player2NameInput"); // Player 2 name input
    const player2NameError = document.getElementById("player2NameError"); // Error message
    let name = player2NameInput.value.trim(); // Trimmed name
    const nameRegex = /^[a-zA-Z0-9\s]+$/; // Alphanumeric and spaces only

    if (name.length === 0 || name.length > 20 || !nameRegex.test(name)) { // Validation
        name = "Neon Striker"; // Default name
        player2NameInput.value = name; // Set default
        player2NameError.textContent = "Invalid name! Only alphanumeric characters and spaces allowed.";
        player2NameError.style.display = "block"; // Show error
        setTimeout(() => player2NameError.style.display = "none", 3000); // Hide after 3s
    } else {
        player2NameError.style.display = "none"; // Hide error
    }

    player2Name = name; // Set Player 2 name
    localStorage.setItem("player2Name", player2Name); // Store in localStorage
    document.getElementById("player2-name").style.display = "none"; // Hide name input
    startGame(true); // Start multiplayer game
}

// Start a new game
function startGame(multiplayer) {
    isMultiplayer = multiplayer; // Set game mode
    gameActive = true; // Enable game
    player1Score = 0; // Reset scores
    player2Score = 0;
    currentRound = 1; // Reset round
    currentPlayer = 1; // Start with Player 1
    player1Choice = null; // Reset choices
    player2Choice = null;
    if (!isMultiplayer) difficulty = document.querySelector('input[name="difficulty"]:checked')?.value || "easy"; // Set AI difficulty

    document.getElementById("main-content").style.display = "block"; // Show game content
    updateDisplay(); // Update UI
    setupChoiceButtons(); // Setup choice button events
    cycleColors("result"); // Animate result text
}

// Update game display
function updateDisplay() {
    document.getElementById("player1Score").textContent = `${player1Name}: ${player1Score}`; // Player 1 score
    document.getElementById("player2Score").textContent = `${isMultiplayer ? player2Name : "AI"}: ${player2Score}`; // Player 2/AI score
    document.getElementById("roundInfo").textContent = `Round ${currentRound} of ${maxRounds}`; // Round info
    document.getElementById("turn").textContent = `Turn: ${currentPlayer === 1 ? player1Name : (isMultiplayer ? player2Name : "AI")}`; // Current turn
    const buttons = document.querySelectorAll(".neon-btn[id='rock'], .neon-btn[id='paper'], .neon-btn[id='scissors']"); // Choice buttons
    buttons.forEach(btn => btn.disabled = !gameActive || (!isMultiplayer && currentPlayer === 2)); // Enable/disable buttons
}

// Setup choice button event listeners
function setupChoiceButtons() {
    document.getElementById("rock").onclick = () => handleChoice("rock"); // Rock button
    document.getElementById("paper").onclick = () => handleChoice("paper"); // Paper button
    document.getElementById("scissors").onclick = () => handleChoice("scissors"); // Scissors button
}

// Handle player choice
function handleChoice(choice) {
    if (!gameActive) return; // Exit if game inactive
    playSound("actionSound"); // Play action sound
    if (currentPlayer === 1) {
        player1Choice = choice; // Set Player 1 choice
        currentPlayer = 2; // Switch to Player 2
        updateDisplay(); // Update UI
        if (!isMultiplayer) setTimeout(aiMove, 500); // AI move with delay
    } else if (isMultiplayer) {
        player2Choice = choice; // Set Player 2 choice
        currentPlayer = 1; // Switch back to Player 1
        determineWinner(); // Determine round winner
    }
}

// AI move logic
function aiMove() {
    if (!gameActive) return; // Exit if game inactive
    let aiChoice;
    if (difficulty === "easy") {
        aiChoice = choices[Math.floor(Math.random() * 3)]; // Random choice
    } else if (difficulty === "medium") {
        aiChoice = player1Choice === "rock" ? "paper" : player1Choice === "paper" ? "scissors" : "rock"; // Counter choice
    } else { // Hard
        aiChoice = player1Choice === "rock" ? "paper" : player1Choice === "paper" ? "scissors" : "rock"; // Always win
    }
    player2Choice = aiChoice; // Set AI choice
    currentPlayer = 1; // Switch back to Player 1
    determineWinner(); // Determine round winner
}

// Determine round winner
function determineWinner() {
    const resultElement = document.getElementById("result"); // Result display
    let result;
    if (player1Choice === player2Choice) {
        result = "Grid Locked!"; // Tie
    } else if (
        (player1Choice === "rock" && player2Choice === "scissors") ||
        (player1Choice === "paper" && player2Choice === "rock") ||
        (player1Choice === "scissors" && player2Choice === "paper")
    ) {
        result = `${player1Name} Wins!`; // Player 1 wins
        player1Score++; // Increment score
    } else {
        result = `${isMultiplayer ? player2Name : "AI"} Wins!`; // Player 2/AI wins
        player2Score++; // Increment score
    }
    resultElement.textContent = `${player1Name} chose ${player1Choice}, ${isMultiplayer ? player2Name : "AI"} chose ${player2Choice}. ${result}`; // Display result
    playSound(result.includes("Wins") ? (result.includes(player1Name) ? "winSound" : "loseSound") : "loseSound"); // Play sound
    currentRound++; // Next round
    if (currentRound > maxRounds) {
        endGame(); // End game if max rounds reached
    } else {
        player1Choice = null; // Reset choices
        player2Choice = null;
        updateDisplay(); // Update UI
    }
}

// End the game
function endGame() {
    gameActive = false; // Disable game
    const resultElement = document.getElementById("result"); // Result display
    resultElement.textContent = player1Score > player2Score ? `${player1Name} Wins the Duel!` : player1Score < player2Score ? `${isMultiplayer ? player2Name : "AI"} Wins the Duel!` : "Duel Ends in a Tie!"; // Final result
    updateDisplay(); // Update UI
}

// Reset game to mode selection
function resetGame() {
    playSound("clickSound"); // Play sound
    const portalOverlay = document.getElementById("portal-overlay"); // Portal overlay
    const playerSelection = document.getElementById("player-selection"); // Mode selection
    const mainContent = document.getElementById("main-content"); // Main content
    mainContent.style.display = "none"; // Hide game
    portalOverlay.style.display = "flex"; // Show portal
    setTimeout(() => {
        gameActive = false; // Reset game state
        playerSelection.style.display = "flex"; // Show mode selection
        portalOverlay.style.display = "none"; // Hide portal
        document.getElementById("result").textContent = ""; // Clear result
    }, 2000);
}

// Play audio sound
function playSound(soundId) {
    const sound = document.getElementById(soundId); // Audio element
    if (sound) {
        sound.currentTime = 0; // Reset to start
        sound.play().catch(error => console.log("Sound play error:", error)); // Play with error handling
    }
}

// Cycle colors for result text
function cycleColors(elementId) {
    const element = document.getElementById(elementId); // Target element
    const colors = ["#00ccff", "#ff00ff", "#00ff00", "#ffff00", "#ff6600"]; // Color array
    let index = 0; // Color index
    setInterval(() => {
        element.style.color = colors[index]; // Set color
        element.style.textShadow = `0 0 5px ${colors[index]}, 0 0 10px ${colors[index]}, 0 0 20px ${colors[index]}`; // Set glow
        index = (index + 1) % colors.length; // Cycle index
    }, 700); // Change every 700ms
}

// Handle portal transition
function portalTransition(url) {
    const portalOverlay = document.getElementById("portal-overlay"); // Portal overlay
    const mainContent = document.getElementById("main-content"); // Main content
    playSound("clickSound"); // Play sound
    mainContent.style.display = "none"; // Hide content
    portalOverlay.style.display = "flex"; // Show portal
    setTimeout(() => window.location.href = url, 2000); // Redirect after 2s
}

// Add event listener for DOM content loaded
document.addEventListener("DOMContentLoaded", initPage);