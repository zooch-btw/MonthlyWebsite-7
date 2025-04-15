// Game state variables
let player1Score = 0; // Player 1 score
let player2Score = 0; // Player 2/AI score
let currentPlayer = 1; // Current player (1 or 2)
let player1Choice = null; // Player 1's choice
let player2Choice = null; // Player 2's choice
let currentRound = 1; // Current round
const maxRounds = 5; // Max rounds per game
let gameActive = false; // Game active status
let isMultiplayer = false; // Multiplayer mode flag
let difficulty = "easy"; // AI difficulty
const player1Name = localStorage.getItem("userName") || "Cyber Warrior"; // Player 1 name
let player2Name = localStorage.getItem("player2Name") || "Neon Striker"; // Player 2 name
const choices = ["rock", "paper", "scissors"]; // Game choices
let colorCycleInterval = null; // Color cycle interval

// Initialize page
function initPage() {
    const portalOverlay = document.getElementById("portal-overlay"); // Portal overlay
    const playerSelection = document.getElementById("player-selection"); // Mode selection
    const mainContent = document.getElementById("main-content"); // Main content
    const player2NameOverlay = document.getElementById("player2-name"); // Player 2 name input

    // Set initial visibility
    portalOverlay.style.display = "flex";
    playerSelection.style.display = "none";
    mainContent.style.display = "none";
    player2NameOverlay.style.display = "none";
    document.body.style.overflow = "hidden";

    // Show mode selection after portal
    setTimeout(() => {
        portalOverlay.style.display = "none";
        playerSelection.style.display = "flex";
        document.body.style.overflow = "auto";
    }, 2000);

    // Bind mode selection buttons
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
    player1Score = 0;
    player2Score = 0;
    currentRound = 1;
    currentPlayer = 1;
    player1Choice = null;
    player2Choice = null;
    if (!isMultiplayer) {
        difficulty = document.querySelector('input[name="difficulty"]:checked')?.value || "easy";
    }

    document.getElementById("player-selection").style.display = "none";
    document.getElementById("main-content").style.display = "block";
    document.getElementById("VictoryTxt").style.display = "none";
    document.getElementById("LossTxt").style.display = "none";
    stopColorCycle();
    updateDisplay();
    setupChoiceButtons();
}

// Update game display
function updateDisplay() {
    document.getElementById("player1Score").textContent = `${player1Name}: ${player1Score}`;
    document.getElementById("player2Score").textContent = `${isMultiplayer ? player2Name : "AI"}: ${player2Score}`;
    document.getElementById("roundInfo").textContent = `Round ${currentRound} of ${maxRounds}`;
    document.getElementById("turn").textContent = `Turn: ${currentPlayer === 1 ? player1Name : (isMultiplayer ? player2Name : "AI")}`;
    const buttons = document.querySelectorAll(".neon-btn[id='rock'], .neon-btn[id='paper'], .neon-btn[id='scissors']");
    buttons.forEach(btn => {
        btn.disabled = !gameActive || (!isMultiplayer && currentPlayer === 2);
    });
}

// Setup choice buttons
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
        aiChoice = Math.random() > 0.5
            ? (player1Choice === "rock" ? "paper" : player1Choice === "paper" ? "scissors" : "rock")
            : choices[Math.floor(Math.random() * 3)];
    } else {
        aiChoice = player1Choice === "rock" ? "paper" : player1Choice === "paper" ? "scissors" : "rock";
    }
    player2Choice = aiChoice;
    currentPlayer = 1;
    determineWinner();
}

// Determine round winner
function determineWinner() {
    const victoryElement = document.getElementById("VictoryTxt");
    const lossElement = document.getElementById("LossTxt");
    victoryElement.style.display = "none";
    lossElement.style.display = "none";
    stopColorCycle();

    let result;
    if (player1Choice === player2Choice) {
        result = "Grid Locked!";
        cycleColors("result");
        playSound("loseSound");
    } else if (
        (player1Choice === "rock" && player2Choice === "scissors") ||
        (player1Choice === "paper" && player2Choice === "rock") ||
        (player1Choice === "scissors" && player2Choice === "paper")
    ) {
        result = `${player1Name} Wins!`;
        player1Score++;
        victoryElement.textContent = result;
        victoryElement.style.display = "inline";
        playSound("winSound");
    } else {
        result = `${isMultiplayer ? player2Name : "AI"} Wins!`;
        player2Score++;
        lossElement.textContent = result;
        lossElement.style.display = "inline";
        playSound("loseSound");
    }

    currentRound++;
    if (currentRound > maxRounds) {
        endGame();
    } else {
        player1Choice = null;
        player2Choice = null;
        updateDisplay();
    }
}

// End game
function endGame() {
    gameActive = false;
    const victoryElement = document.getElementById("VictoryTxt");
    const lossElement = document.getElementById("LossTxt");
    victoryElement.style.display = "none";
    lossElement.style.display = "none";
    stopColorCycle();

    let result;
    if (player1Score > player2Score) {
        result = `${player1Name} Wins the Duel!`;
        victoryElement.textContent = result;
        victoryElement.style.display = "inline";
        playSound("winSound");
    } else if (player1Score < player2Score) {
        result = `${isMultiplayer ? player2Name : "AI"} Wins the Duel!`;
        lossElement.textContent = result;
        lossElement.style.display = "inline";
        playSound("loseSound");
    } else {
        result = "Duel Ends in a Tie!";
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
    document.getElementById("VictoryTxt").style.display = "none";
    document.getElementById("LossTxt").style.display = "none";
    stopColorCycle();
    mainContent.style.display = "none";
    portalOverlay.style.display = "flex";
    setTimeout(() => {
        gameActive = false;
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