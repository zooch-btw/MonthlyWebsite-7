// Game state variables
let player1Score = 0; // Score for Player 1
let player2Score = 0; // Score for Player 2 or AI
let currentPlayer = 1; // Current player (1 or 2)
let player1Choice = null; // Player 1's choice (rock, paper, scissors)
let player2Choice = null; // Player 2's choice (rock, paper, scissors)
let currentRound = 1; // Current round number
const maxRounds = 5; // Maximum number of rounds
let gameActive = false; // Flag to track if the game is active
let isMultiplayer = false; // Flag to track if the game is in multiplayer mode
let difficulty = "easy"; // AI difficulty (easy, medium, hard)
const userName = localStorage.getItem("userName") || "Cyber Warrior"; // Username from localStorage
const choices = ["rock", "paper", "scissors"]; // Possible choices in RPS

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
    player1Score = 0;
    player2Score = 0;
    currentRound = 1;
    currentPlayer = 1;
    player1Choice = null;
    player2Choice = null;

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

    // Update the initial display (scores, round info, turn)
    updateDisplay();
    // Add event listeners to the choice buttons
    setupChoiceButtons();
    // Start color cycling for the result text
    cycleColors("result");
}

// Update the display (scores, round info, turn)
function updateDisplay() {
    // Get the DOM elements for scores, round info, and turn
    const player1ScoreElement = document.getElementById("player1Score");
    const player2ScoreElement = document.getElementById("player2Score");
    const roundInfoElement = document.getElementById("roundInfo");
    const turnElement = document.getElementById("turn");

    // Update the elements with current game state
    if (player1ScoreElement && player2ScoreElement && roundInfoElement && turnElement) {
        player1ScoreElement.textContent = `${userName} (Player 1): ${player1Score}`;
        player2ScoreElement.textContent = `${isMultiplayer ? "Player 2" : "AI"}: ${player2Score}`;
        roundInfoElement.textContent = `Round ${currentRound} of ${maxRounds}`;
        turnElement.textContent = `Turn: ${currentPlayer === 1 ? userName + " (Player 1)" : (isMultiplayer ? "Player 2" : "AI")}`;
    }

    // Enable or disable choice buttons based on the current player and game state
    const buttons = document.querySelectorAll(".neon-btn[id='rock'], .neon-btn[id='paper'], .neon-btn[id='scissors']");
    buttons.forEach(btn => {
        btn.disabled = !gameActive || (currentPlayer === 2 && !isMultiplayer); // Disable for AI turn
    });
}

// Set up event listeners for the choice buttons
function setupChoiceButtons() {
    // Get the choice buttons
    const rockBtn = document.getElementById("rock");
    const paperBtn = document.getElementById("paper");
    const scissorsBtn = document.getElementById("scissors");

    // Add event listeners to each button
    if (rockBtn) rockBtn.addEventListener("click", () => handleChoice("rock"));
    if (paperBtn) paperBtn.addEventListener("click", () => handleChoice("paper"));
    if (scissorsBtn) scissorsBtn.addEventListener("click", () => handleChoice("scissors"));
}

// Handle a player's choice
function handleChoice(choice) {
    // Ignore if the game is not active
    if (!gameActive) return;

    // Play action sound
    playSound("actionSound");

    // Set the choice for the current player
    if (currentPlayer === 1) {
        player1Choice = choice;
        currentPlayer = 2; // Switch to Player 2 or AI
        updateDisplay();

        // If single-player mode, trigger AI turn
        if (!isMultiplayer) {
            setTimeout(aiMove, 500); // Delay AI move for better UX
        }
    } else {
        player2Choice = choice;
        currentPlayer = 1; // Switch back to Player 1
        determineWinner(); // Determine the winner of the round
    }

    updateDisplay();
}

// AI move logic based on difficulty
function aiMove() {
    // Ignore if the game is not active
    if (!gameActive) return;

    let aiChoice;

    // Easy difficulty: Random choice
    if (difficulty === "easy") {
        aiChoice = choices[Math.floor(Math.random() * 3)];
    }
    // Medium difficulty: Rule-based choice
    else if (difficulty === "medium") {
        // Try to counter the player's last choice if available
        if (player1Choice === "rock") {
            aiChoice = "paper"; // Paper beats rock
        } else if (player1Choice === "paper") {
            aiChoice = "scissors"; // Scissors beats paper
        } else if (player1Choice === "scissors") {
            aiChoice = "rock"; // Rock beats scissors
        } else {
            aiChoice = choices[Math.floor(Math.random() * 3)]; // Random if no previous choice
        }
    }
    // Hard difficulty: Strategic choice
    else if (difficulty === "hard") {
        // Predict player's choice based on patterns (simplified: counter most likely choice)
        if (player1Choice === "rock") {
            aiChoice = "paper"; // Counter rock
        } else if (player1Choice === "paper") {
            aiChoice = "scissors"; // Counter paper
        } else if (player1Choice === "scissors") {
            aiChoice = "rock"; // Counter scissors
        } else {
            // If no pattern, use a weighted random choice
            const weights = { rock: 0.4, paper: 0.3, scissors: 0.3 }; // Bias towards rock
            const rand = Math.random();
            if (rand < weights.rock) aiChoice = "rock";
            else if (rand < weights.rock + weights.paper) aiChoice = "paper";
            else aiChoice = "scissors";
        }
    }

    // Set the AI's choice and determine the winner
    player2Choice = aiChoice;
    currentPlayer = 1; // Switch back to Player 1
    determineWinner();
}

// Determine the winner of the current round
function determineWinner() {
    // Get the result element
    const resultElement = document.getElementById("result");
    let result = "";

    // Compare choices to determine the winner
    if (player1Choice === player2Choice) {
        result = "Grid Locked!"; // Tie
        playSound("loseSound");
    } else if (
        (player1Choice === "rock" && player2Choice === "scissors") ||
        (player1Choice === "paper" && player2Choice === "rock") ||
        (player1Choice === "scissors" && player2Choice === "paper")
    ) {
        result = `${userName} Wins!`;
        player1Score++;
        playSound("winSound");
    } else {
        result = `${isMultiplayer ? "Player 2" : "AI"} Wins!`;
        player2Score++;
        playSound("loseSound");
    }

    // Update the result display
    if (resultElement) {
        resultElement.textContent = `${userName} chose ${player1Choice}, ${isMultiplayer ? "Player 2" : "AI"} chose ${player2Choice}. ${result}`;
    }

    // Increment the round and check if the game is over
    currentRound++;
    if (currentRound > maxRounds) {
        endGame();
    } else {
        // Reset choices for the next round
        player1Choice = null;
        player2Choice = null;
        updateDisplay();
    }
}

// End the game after the maximum rounds
function endGame() {
    gameActive = false; // Disable further actions
    const resultElement = document.getElementById("result");
    // Determine the overall winner
    const finalMessage = player1Score > player2Score ? `${userName} Wins the Duel!` : player1Score < player2Score ? `${isMultiplayer ? "Player 2" : "AI"} Wins the Duel!` : "Duel Ends in a Tie!";
    if (resultElement) {
        resultElement.textContent = finalMessage;
    }
    updateDisplay(); // Update to disable buttons
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
            player1Score = 0;
            player2Score = 0;
            currentRound = 1;
            player1Choice = null;
            player2Choice = null;
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
