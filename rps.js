// Game state variables
let player1Score = 0; // Tracks Player  Wins for Player 1
let player2Score = 0; // Tracks Player 2/AI score
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
let colorCycleInterval = null; // Tracks color cycling interval for ties
let rpsWins = parseInt(localStorage.getItem("rpsWins")) || 0; // Tracks total wins, persisted in localStorage
let rpsLosses = parseInt(localStorage.getItem("rpsLosses")) || 0; // Tracks total losses, persisted in localStorage

// Initialize page on DOM load
function initPage() {
    // Get DOM elements for overlays and content
    const portalOverlay = document.getElementById("portal-overlay"); // Portal transition overlay
    const playerSelection = document.getElementById("player-selection"); // Mode selection overlay
    const mainContent = document.getElementById("main-content"); // Main game content
    const player2NameOverlay = document.getElementById("player2-name"); // Player 2 name input overlay

    // Set initial display states
    portalOverlay.style.display = "flex"; // Show portal overlay
    playerSelection.style.display = "none"; // Hide mode selection
    mainContent.style.display = "none"; // Hide game content
    player2NameOverlay.style.display = "none"; // Hide name input
    document.body.style.overflow = "hidden"; // Prevent scrolling during portal

    // Transition to player selection after portal animation (2 seconds)
    setTimeout(() => {
        portalOverlay.style.display = "none"; // Hide portal
        playerSelection.style.display = "flex"; // Show mode selection
        document.body.style.overflow = "auto"; // Restore scrolling
    }, 2000);

    // Add event listeners for mode selection buttons
    document.getElementById("singlePlayer").addEventListener("click", () => startGame(false)); // Start single-player
    document.getElementById("multiPlayer").addEventListener("click", promptPlayer2Name); // Prompt for Player 2 name
    document.getElementById("confirmPlayer2Name").addEventListener("click", confirmPlayer2Name); // Confirm Player 2 name

    // Initialize win/loss counter display
    updateWinLossCounter();
}

// Update win/loss counter display
function updateWinLossCounter() {
    // Update DOM with current win/loss counts
    document.getElementById("rpsWins").textContent = `Wins: ${rpsWins}`; // Display wins
    document.getElementById("rpsLosses").textContent = `Losses: ${rpsLosses}`; // Display losses
}

// Prompt for Player 2 name in multiplayer mode
function promptPlayer2Name() {
    // Get DOM elements for overlays
    const playerSelection = document.getElementById("player-selection"); // Mode selection overlay
    const player2NameOverlay = document.getElementById("player2-name"); // Name input overlay
    // Transition to name input
    playerSelection.style.display = "none"; // Hide mode selection
    player2NameOverlay.style.display = "flex"; // Show name input
}

// Confirm Player 2 name and start multiplayer game
function confirmPlayer2Name() {
    // Get DOM elements for input and error display
    const player2NameInput = document.getElementById("player2NameInput"); // Name input field
    const player2NameError = document.getElementById("player2NameError"); // Error message display
    let name = player2NameInput.value.trim(); // Trimmed input value
    const nameRegex = /^[a-zA-Z0-9\s]+$/; // Regex for alphanumeric and spaces

    // Validate name input
    if (name.length === 0 || name.length > 20 || !nameRegex.test(name)) {
        name = "Neon Striker"; // Set default name if invalid
        player2NameInput.value = name; // Update input field
        player2NameError.textContent = "Invalid name! Only alphanumeric characters and spaces allowed."; // Set error
        player2NameError.style.display = "block"; // Show error
        // Hide error after 3 seconds
        setTimeout(() => player2NameError.style.display = "none", 3000);
    } else {
        player2NameError.style.display = "none"; // Hide error if valid
    }

    // Store name and start game
    player2Name = name; // Update player2Name
    localStorage.setItem("player2Name", player2Name); // Save to localStorage
    document.getElementById("player2-name").style.display = "none"; // Hide name input
    startGame(true); // Start multiplayer game
}

// Start a new game
function startGame(multiplayer) {
    // Reset game state
    isMultiplayer = multiplayer; // Set multiplayer mode
    gameActive = true; // Enable gameplay
    player1Score = 0; // Reset Player 1 score
    player2Score = 0; // Reset Player 2/AI score
    currentRound = 1; // Reset to first round
    currentPlayer = 1; // Player 1 starts
    player1Choice = null; // Clear Player 1 choice
    player2Choice = null; // Clear Player 2 choice
    if (!isMultiplayer) {
        difficulty = document.querySelector('input[name="difficulty"]:checked')?.value || "easy"; // Set AI difficulty
    }

    // Transition to game content
    document.getElementById("player-selection").style.display = "none"; // Hide mode selection
    document.getElementById("main-content").style.display = "block"; // Show game content

    // Clear any existing color cycling
    stopColorCycle();

    // Update display and setup buttons
    updateDisplay(); // Refresh game visuals
    setupChoiceButtons(); // Bind choice button events
}

// Update game display
function updateDisplay() {
    // Update score displays
    document.getElementById("player1Score").textContent = `${player1Name}: ${player1Score}`; // Player 1 score
    document.getElementById("player2Score").textContent = `${isMultiplayer ? player2Name : "AI"}: ${player2Score}`; // Player 2/AI score
    // Update round information
    document.getElementById("roundInfo").textContent = `Round ${currentRound} of ${maxRounds}`; // Current round
    // Update turn indicator
    document.getElementById("turn").textContent = `Turn: ${currentPlayer === 1 ? player1Name : (isMultiplayer ? player2Name : "AI")}`; // Current player
    // Enable/disable choice buttons based on game state
    const buttons = document.querySelectorAll(".neon-btn[id='rock'], .neon-btn[id='paper'], .neon-btn[id='scissors']");
    buttons.forEach(btn => {
        btn.disabled = !gameActive || (!isMultiplayer && currentPlayer === 2); // Disable during AI turn or if game inactive
    });
}

// Setup choice button event listeners
function setupChoiceButtons() {
    // Bind click events to choice buttons
    document.getElementById("rock").onclick = () => handleChoice("rock"); // Rock button
    document.getElementById("paper").onclick = () => handleChoice("paper"); // Paper button
    document.getElementById("scissors").onclick = () => handleChoice("scissors"); // Scissors button
}

// Handle player choice
function handleChoice(choice) {
    if (!gameActive) return; // Ignore if game inactive
    playSound("actionSound"); // Play action sound
    if (currentPlayer === 1) {
        player1Choice = choice; // Store Player 1 choice
        currentPlayer = 2; // Switch to Player 2/AI
        updateDisplay(); // Update visuals
        if (!isMultiplayer) {
            setTimeout(aiMove, 500); // Trigger AI move after delay
        }
    } else if (isMultiplayer) {
        player2Choice = choice; // Store Player 2 choice
        currentPlayer = 1; // Switch back to Player 1
        determineWinner(); // Evaluate round
    }
}

// AI move logic
function aiMove() {
    if (!gameActive) return; // Ignore if game inactive
    let aiChoice;
    if (difficulty === "easy") {
        aiChoice = choices[Math.floor(Math.random() * 3)]; // Random choice
    } else if (difficulty === "medium") {
        // 50% chance to counter, 50% random
        aiChoice = Math.random() > 0.5
            ? (player1Choice === "rock" ? "paper" : player1Choice === "paper" ? "scissors" : "rock")
            : choices[Math.floor(Math.random() * 3)];
    } else {
        // Hard: always counter
        aiChoice = player1Choice === "rock" ? "paper" : player1Choice === "paper" ? "scissors" : "rock";
    }
    player2Choice = aiChoice; // Store AI choice
    currentPlayer = 1; // Switch back to Player 1
    determineWinner(); // Evaluate round
}

// Determine round winner
function determineWinner() {
    // Get DOM elements for result display
    const resultElement = document.getElementById("resultText"); // Result text
    const choiceImages = document.getElementById("choiceImages"); // Choice images container
    let result;
    let glowClass = "";

    // Clear existing glow classes and color cycling
    resultElement.classList.remove("glowVictory", "glowLoss");
    stopColorCycle();

    // Display player choices with images
    choiceImages.innerHTML = `
        <span>${player1Name} picked <img src="${player1Choice}.png" alt="${player1Choice}" class="result-choice-img"></span>
        <span>${isMultiplayer ? player2Name : "AI"} picked <img src="${player2Choice}.png" alt="${player2Choice}" class="result-choice-img"></span>
    `;

    // Determine round outcome
    if (player1Choice === player2Choice) {
        result = "Grid Locked!"; // Tie result
        cycleColors("resultText"); // Start color cycling for ties
        playSound("loseSound"); // Play tie sound
    } else if (
        (player1Choice === "rock" && player2Choice === "scissors") ||
        (player1Choice === "paper" && player2Choice === "rock") ||
        (player1Choice === "scissors" && player2Choice === "paper")
    ) {
        result = `${player1Name} Wins!`; // Player 1 wins
        player1Score++; // Increment Player 1 score
        glowClass = "glowVictory"; // Apply green glow
        playSound("winSound"); // Play win sound
    } else {
        result = `${isMultiplayer ? player2Name : "AI"} Wins!`; // Player 2/AI wins
        player2Score++; // Increment Player 2/AI score
        glowClass = "glowLoss"; // Apply red glow
        playSound("loseSound"); // Play loss sound
    }

    // Apply result text and glow effect
    resultElement.textContent = result; // Set result text
    if (glowClass) {
        resultElement.classList.add(glowClass); // Apply glow class
    }

    // Proceed to next round or end game
    currentRound++; // Increment round
    if (currentRound > maxRounds) {
        endGame(); // End game if max rounds reached
    } else {
        player1Choice = null; // Clear Player 1 choice
        player2Choice = null; // Clear Player 2 choice
        updateDisplay(); // Update visuals
    }
}

// End the game
function endGame() {
    gameActive = false; // Disable gameplay
    const resultElement = document.getElementById("resultText"); // Result text
    const choiceImages = document.getElementById("choiceImages"); // Choice images container
    let result;
    let glowClass = "";

    // Clear color cycling
    stopColorCycle();

    // Determine final winner
    if (player1Score > player2Score) {
        result = `${player1Name} Wins the Duel!`; // Player 1 wins
        glowClass = "glowVictory"; // Green glow
        rpsWins++; // Increment win counter
        localStorage.setItem("rpsWins", rpsWins); // Save to localStorage
        playSound("winSound"); // Play win sound
    } else if (player1Score < player2Score) {
        result = `${isMultiplayer ? player2Name : "AI"} Wins the Duel!`; // Player 2/AI wins
        glowClass = "glowLoss"; // Red glow
        rpsLosses++; // Increment loss counter
        localStorage.setItem("rpsLosses", rpsLosses); // Save to localStorage
        playSound("loseSound"); // Play loss sound
    } else {
        result = "Duel Ends in a Tie!"; // Tie result
        cycleColors("resultText"); // Start color cycling for ties
        playSound("loseSound"); // Play tie sound
    }

    // Clear choice images
    choiceImages.innerHTML = "";

    // Apply final result and glow effect
    resultElement.classList.remove("glowVictory", "glowLoss"); // Remove existing glows
    resultElement.textContent = result; // Set final result
    if (glowClass) {
        resultElement.classList.add(glowClass); // Apply glow
    }

    // Update display and counters
    updateDisplay(); // Refresh game visuals
    updateWinLossCounter(); // Update win/loss display
}

// Reset game to mode selection
function resetGame() {
    playSound("clickSound"); // Play click sound
    const portalOverlay = document.getElementById("portal-overlay"); // Portal overlay
    const playerSelection = document.getElementById("player-selection"); // Mode selection overlay
    const mainContent = document.getElementById("main-content"); // Game content
    const resultElement = document.getElementById("resultText"); // Result text
    const choiceImages = document.getElementById("choiceImages"); // Choice images container

    // Reset glow classes and color cycling
    resultElement.classList.remove("glowVictory", "glowLoss"); // Clear glows
    stopColorCycle(); // Stop color cycling
    choiceImages.innerHTML = ""; // Clear choice images
    resultElement.textContent = ""; // Clear result text

    // Transition to mode selection
    mainContent.style.display = "none"; // Hide game content
    portalOverlay.style.display = "flex"; // Show portal
    setTimeout(() => {
        gameActive = false; // Disable gameplay
        playerSelection.style.display = "flex"; // Show mode selection
        portalOverlay.style.display = "none"; // Hide portal
    }, 2000); // Match portal animation duration
}

// Play audio sound
function playSound(soundId) {
    const sound = document.getElementById(soundId); // Get audio element
    if (sound) {
        sound.currentTime = 0; // Reset to start
        sound.play().catch(error => console.log("Sound play error:", error)); // Play with error handling
    }
}

// Cycle colors for an element (used for ties)
function cycleColors(elementId) {
    const element = document.getElementById(elementId); // Get target element
    const colors = ["#00ccff", "#ff00ff", "#00ff00", "#ffff00", "#ff6600"]; // Neon theme colors
    let index = 0; // Current color index

    // Clear any existing interval
    stopColorCycle();

    // Start new color cycling
    colorCycleInterval = setInterval(() => {
        element.style.color = colors[index]; // Set text color
        element.style.textShadow = `0 0 5px ${colors[index]}, 0 0 10px ${colors[index]}, 0 0 20px ${colors[index]}`; // Set glow
        index = (index + 1) % colors.length; // Move to next color
    }, 700); // Change every 700ms
}

// Stop color cycling
function stopColorCycle() {
    if (colorCycleInterval) {
        clearInterval(colorCycleInterval); // Clear interval
        colorCycleInterval = null; // Reset tracker
        const resultElement = document.getElementById("resultText"); // Result text
        // Reset to default neon-text style
        resultElement.style.color = "#00ccff"; // Cyan color
        resultElement.style.textShadow = "0 0 5px #00ccff, 0 0 10px #00ccff, 0 0 20px #00ccff"; // Cyan glow
    }
}

// Handle portal transition to another page
function portalTransition(url) {
    const portalOverlay = document.getElementById("portal-overlay"); // Portal overlay
    const mainContent = document.getElementById("main-content"); // Game content
    playSound("clickSound"); // Play transition sound
    mainContent.style.display = "none"; // Hide game content
    portalOverlay.style.display = "flex"; // Show portal
    setTimeout(() => window.location.href = url, 2000); // Navigate after 2 seconds
}

// Initialize page on DOM content loaded
document.addEventListener("DOMContentLoaded", initPage);