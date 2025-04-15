
// Game state variables
let score = 0; // Player's score
let word = ''; // Current element name
let guessedLetters = new Set(); // Guessed letters
let mistakes = 0; // Incorrect guesses
const maxMistakes = 6; // Max mistakes allowed
let gameActive = false; // Game active status
let colorCycleInterval = null; // Color cycle interval
let guessedElements = new Map(); // Tracks element guesses

// Periodic table data
const elements = [
    { symbol: 'H', name: 'Hydrogen', row: 1, col: 1 },
    // ... (other elements as in original)
    { symbol: 'Og', name: 'Oganesson', row: 7, col: 18 }
];

// Hangman ASCII stages
const hangmanStages = [
    `
      ------
      |    |
           |
           |
           |
           |
    =========`,
    // ... (other stages as in original)
    `
      ------
      |    |
      O    |
     /|\\   |
     / \\   |
           |
    =========`
];

// Initialize page
function initPage() {
    const portalOverlay = document.getElementById("portal-overlay");
    const mainContent = document.getElementById("main-content");

    portalOverlay.style.display = "flex";
    mainContent.style.display = "none";
    document.body.style.overflow = "hidden";

    setTimeout(() => {
        portalOverlay.style.display = "none";
        mainContent.style.display = "block";
        document.body.style.overflow = "auto";
        startGame();
    }, 2000);

    const hangmanButton = document.querySelector("button[onclick=\"portalTransition('hangman.html')\"]");
    if (hangmanButton) hangmanButton.disabled = true;
}

// Start new game
function startGame() {
    gameActive = true;
    mistakes = 0;
    guessedLetters.clear();
    guessedElements.clear();
    word = elements[Math.floor(Math.random() * elements.length)].name.toUpperCase();
    stopColorCycle();
    document.getElementById("VictoryTxt").style.display = "none";
    document.getElementById("LossTxt").style.display = "none";
    updateDisplay();
    setupKeyboard();
    setupPeriodicTable();
    document.getElementById("hint").onclick = getHint;
}

// Update display
function updateDisplay() {
    document.getElementById("score").textContent = `Score: ${score}`;
    document.getElementById("hangman").textContent = hangmanStages[mistakes];
    const wordDisplay = word
        .split('')
        .map(letter => (guessedLetters.has(letter) ? letter : '_'))
        .join(' ');
    document.getElementById("word").textContent = wordDisplay;

    document.querySelectorAll(".keyboard button").forEach(btn => {
        const letter = btn.textContent;
        btn.disabled = guessedLetters.has(letter);
    });

    document.querySelectorAll(".element:not(.empty)").forEach(el => {
        const name = el.dataset.name.toUpperCase();
        if (guessedElements.has(name)) {
            el.classList.add(guessedElements.get(name).correct ? "correct" : "incorrect");
            el.classList.add("disabled");
        } else {
            el.classList.remove("correct", "incorrect", "disabled");
        }
    });

    if (mistakes >= maxMistakes) {
        endGame(false);
    } else if (word.split('').every(letter => guessedLetters.has(letter))) {
        endGame(true);
    }
}

// Setup keyboard
function setupKeyboard() {
    const keyboard = document.getElementById("keyboard");
    keyboard.innerHTML = '';
    for (let i = 65; i <= 90; i++) {
        const letter = String.fromCharCode(i);
        const button = document.createElement("button");
        button.className = "btn neon-btn";
        button.textContent = letter;
        button.onclick = () => handleGuess(letter);
        keyboard.appendChild(button);
    }
}

// Setup periodic table
function setupPeriodicTable() {
    const table = document.getElementById("periodic-table");
    table.innerHTML = '';
    const grid = document.createElement("div");
    grid.className = "periodic-table-grid";

    const positions = new Array(10).fill().map(() => new Array(19).fill(null));
    elements.forEach(element => {
        positions[element.row][element.col] = element;
    });

    for (let row = 1; row <= 9; row++) {
        for (let col = 1; col <= 18; col++) {
            const cell = document.createElement("div");
            cell.style.gridRow = row;
            cell.style.gridColumn = col;
            if (positions[row][col]) {
                const element = positions[row][col];
                cell.className = "element";
                cell.textContent = element.symbol;
                cell.dataset.name = element.name;
                cell.onclick = () => guessElement(element.name.toUpperCase());
            } else {
                cell.className = "element empty";
            }
            grid.appendChild(cell);
        }
    }

    table.appendChild(grid);
}

// Guess element name
function guessElement(name) {
    if (!gameActive) return;
    playSound("actionSound");
    guessedElements.set(name, { correct: name === word });
    if (name === word) {
        word.split('').forEach(letter => guessedLetters.add(letter)); // Reveal all letters
        score += 10; // Award points for correct guess
        playSound("winSound");
    } else {
        mistakes++;
        score = Math.max(0, score - 5); // Deduct points for incorrect guess
        playSound("loseSound");
    }
    updateDisplay();
}

// End game
function endGame(won) {
    gameActive = false;
    const victoryElement = document.getElementById("VictoryTxt");
    const lossElement = document.getElementById("LossTxt");
    victoryElement.style.display = "none";
    lossElement.style.display = "none";
    stopColorCycle();

    if (won) {
        victoryElement.textContent = "Element Decoded!";
        victoryElement.style.display = "inline";
        score += 20; // Bonus for winning
        playSound("winSound");
    } else {
        lossElement.textContent = `Core Meltdown! Element: ${word}`;
        lossElement.style.display = "inline";
        playSound("loseSound");
    }

    document.getElementById("score").textContent = `Score: ${score}`;
    document.querySelectorAll(".keyboard button").forEach(btn => btn.disabled = true);
    document.querySelectorAll(".element:not(.empty)").forEach(el => el.classList.add("disabled"));
}

// Get hint
function getHint() {
    if (!gameActive) return;
    playSound("clickSound");
    const unguessedLetters = word.split('').filter(letter => !guessedLetters.has(letter));
    if (unguessedLetters.length === 0) return;
    const hintLetter = unguessedLetters[Math.floor(Math.random() * unguessedLetters.length)];
    guessedLetters.add(hintLetter);
    score = Math.max(0, score - 5); // Deduct points for hint
    updateDisplay();
}

// Reset game
function resetGame() {
    playSound("clickSound");
    const portalOverlay = document.getElementById("portal-overlay");
    const mainContent = document.getElementById("main-content");
    mainContent.style.display = "none";
    portalOverlay.style.display = "flex";
    document.getElementById("VictoryTxt").style.display = "none";
    document.getElementById("LossTxt").style.display = "none";
    stopColorCycle();
    setTimeout(() => {
        portalOverlay.style.display = "none";
        mainContent.style.display = "block";
        startGame();
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