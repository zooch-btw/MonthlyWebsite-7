// Game state variables
let score = 0; // Tracks player's score
let word = ''; // Current element name (uppercase)
let guessedLetters = new Set(); // Tracks guessed letters
let mistakes = 0; // Tracks incorrect letter guesses
const maxMistakes = 6; // Maximum allowed mistakes before loss
let gameActive = false; // Indicates if game is active
let colorCycleInterval = null; // Tracks color cycling interval for hints
let guessedElements = new Map(); // Tracks element guesses: name -> { correct: boolean }
let hintsUsed = 0; // Tracks number of hints used in current game
const maxHints = 3; // Maximum allowed hints per game

// Full periodic table data (118 elements with symbol, name, and position)
const elements = [
    { symbol: 'H', name: 'Hydrogen', row: 1, col: 1 },
    { symbol: 'He', name: 'Helium', row: 1, col: 18 },
    { symbol: 'Li', name: 'Lithium', row: 2, col: 1 },
    { symbol: 'Be', name: 'Beryllium', row: 2, col: 2 },
    { symbol: 'B', name: 'Boron', row: 2, col: 13 },
    { symbol: 'C', name: 'Carbon', row: 2, col: 14 },
    { symbol: 'N', name: 'Nitrogen', row: 2, col: 15 },
    { symbol: 'O', name: 'Oxygen', row: 2, col: 16 },
    { symbol: 'F', name: 'Fluorine', row: 2, col: 17 },
    { symbol: 'Ne', name: 'Neon', row: 2, col: 18 },
    { symbol: 'Na', name: 'Sodium', row: 3, col: 1 },
    { symbol: 'Mg', name: 'Magnesium', row: 3, col: 2 },
    { symbol: 'Al', name: 'Aluminium', row: 3, col: 13 },
    { symbol: 'Si', name: 'Silicon', row: 3, col: 14 },
    { symbol: 'P', name: 'Phosphorus', row: 3, col: 15 },
    { symbol: 'S', name: 'Sulfur', row: 3, col: 16 },
    { symbol: 'Cl', name: 'Chlorine', row: 3, col: 17 },
    { symbol: 'Ar', name: 'Argon', row: 3, col: 18 },
    { symbol: 'K', name: 'Potassium', row: 4, col: 1 },
    { symbol: 'Ca', name: 'Calcium', row: 4, col: 2 },
    { symbol: 'Sc', name: 'Scandium', row: 4, col: 3 },
    { symbol: 'Ti', name: 'Titanium', row: 4, col: 4 },
    { symbol: 'V', name: 'Vanadium', row: 4, col: 5 },
    { symbol: 'Cr', name: 'Chromium', row: 4, col: 6 },
    { symbol: 'Mn', name: 'Manganese', row: 4, col: 7 },
    { symbol: 'Fe', name: 'Iron', row: 4, col: 8 },
    { symbol: 'Co', name: 'Cobalt', row: 4, col: 9 },
    { symbol: 'Ni', name: 'Nickel', row: 4, col: 10 },
    { symbol: 'Cu', name: 'Copper', row: 4, col: 11 },
    { symbol: 'Zn', name: 'Zinc', row: 4, col: 12 },
    { symbol: 'Ga', name: 'Gallium', row: 4, col: 13 },
    { symbol: 'Ge', name: 'Germanium', row: 4, col: 14 },
    { symbol: 'As', name: 'Arsenic', row: 4, col: 15 },
    { symbol: 'Se', name: 'Selenium', row: 4, col: 16 },
    { symbol: 'Br', name: 'Bromine', row: 4, col: 17 },
    { symbol: 'Kr', name: 'Krypton', row: 4, col: 18 },
    { symbol: 'Rb', name: 'Rubidium', row: 5, col: 1 },
    { symbol: 'Sr', name: 'Strontium', row: 5, col: 2 },
    { symbol: 'Y', name: 'Yttrium', row: 5, col: 3 },
    { symbol: 'Zr', name: 'Zirconium', row: 5, col: 4 },
    { symbol: 'Nb', name: 'Niobium', row: 5, col: 5 },
    { symbol: 'Mo', name: 'Molybdenum', row: 5, col: 6 },
    { symbol: 'Tc', name: 'Technetium', row: 5, col: 7 },
    { symbol: 'Ru', name: 'Ruthenium', row: 5, col: 8 },
    { symbol: 'Rh', name: 'Rhodium', row: 5, col: 9 },
    { symbol: 'Pd', name: 'Palladium', row: 5, col: 10 },
    { symbol: 'Ag', name: 'Silver', row: 5, col: 11 },
    { symbol: 'Cd', name: 'Cadmium', row: 5, col: 12 },
    { symbol: 'In', name: 'Indium', row: 5, col: 13 },
    { symbol: 'Sn', name: 'Tin', row: 5, col: 14 },
    { symbol: 'Sb', name: 'Antimony', row: 5, col: 15 },
    { symbol: 'Te', name: 'Tellurium', row: 5, col: 16 },
    { symbol: 'I', name: 'Iodine', row: 5, col: 17 },
    { symbol: 'Xe', name: 'Xenon', row: 5, col: 18 },
    { symbol: 'Cs', name: 'Caesium', row: 6, col: 1 },
    { symbol: 'Ba', name: 'Barium', row: 6, col: 2 },
    { symbol: 'La', name: 'Lanthanum', row: 6, col: 3 },
    { symbol: 'Ce', name: 'Cerium', row: 8, col: 4 },
    { symbol: 'Pr', name: 'Praseodymium', row: 8, col: 5 },
    { symbol: 'Nd', name: 'Neodymium', row: 8, col: 6 },
    { symbol: 'Pm', name: 'Promethium', row: 8, col: 7 },
    { symbol: 'Sm', name: 'Samarium', row: 8, col: 8 },
    { symbol: 'Eu', name: 'Europium', row: 8, col: 9 },
    { symbol: 'Gd', name: 'Gadolinium', row: 8, col: 10 },
    { symbol: 'Tb', name: 'Terbium', row: 8, col: 11 },
    { symbol: 'Dy', name: 'Dysprosium', row: 8, col: 12 },
    { symbol: 'Ho', name: 'Holmium', row: 8, col: 13 },
    { symbol: 'Er', name: 'Erbium', row: 8, col: 14 },
    { symbol: 'Tm', name: 'Thulium', row: 8, col: 15 },
    { symbol: 'Yb', name: 'Ytterbium', row: 8, col: 16 },
    { symbol: 'Lu', name: 'Lutetium', row: 8, col: 17 },
    { symbol: 'Hf', name: 'Hafnium', row: 6, col: 4 },
    { symbol: 'Ta', name: 'Tantalum', row: 6, col: 5 },
    { symbol: 'W', name: 'Tungsten', row: 6, col: 6 },
    { symbol: 'Re', name: 'Rhenium', row: 6, col: 7 },
    { symbol: 'Os', name: 'Osmium', row: 6, col: 8 },
    { symbol: 'Ir', name: 'Iridium', row: 6, col: 9 },
    { symbol: 'Pt', name: 'Platinum', row: 6, col: 10 },
    { symbol: 'Au', name: 'Gold', row: 6, col: 11 },
    { symbol: 'Hg', name: 'Mercury', row: 6, col: 12 },
    { symbol: 'Tl', name: 'Thallium', row: 6, col: 13 },
    { symbol: 'Pb', name: 'Lead', row: 6, col: 14 },
    { symbol: 'Bi', name: 'Bismuth', row: 6, col: 15 },
    { symbol: 'Po', name: 'Polonium', row: 6, col: 16 },
    { symbol: 'At', name: 'Astatine', row: 6, col: 17 },
    { symbol: 'Rn', name: 'Radon', row: 6, col: 18 },
    { symbol: 'Fr', name: 'Francium', row: 7, col: 1 },
    { symbol: 'Ra', name: 'Radium', row: 7, col: 2 },
    { symbol: 'Ac', name: 'Actinium', row: 7, col: 3 },
    { symbol: 'Th', name: 'Thorium', row: 9, col: 4 },
    { symbol: 'Pa', name: 'Protactinium', row: 9, col: 5 },
    { symbol: 'U', name: 'Uranium', row: 9, col: 6 },
    { symbol: 'Np', name: 'Neptunium', row: 9, col: 7 },
    { symbol: 'Pu', name: 'Plutonium', row: 9, col: 8 },
    { symbol: 'Am', name: 'Americium', row: 9, col: 9 },
    { symbol: 'Cm', name: 'Curium', row: 9, col: 10 },
    { symbol: 'Bk', name: 'Berkelium', row: 9, col: 11 },
    { symbol: 'Cf', name: 'Californium', row: 9, col: 12 },
    { symbol: 'Es', name: 'Einsteinium', row: 9, col: 13 },
    { symbol: 'Fm', name: 'Fermium', row: 9, col: 14 },
    { symbol: 'Md', name: 'Mendelevium', row: 9, col: 15 },
    { symbol: 'No', name: 'Nobelium', row: 9, col: 16 },
    { symbol: 'Lr', name: 'Lawrencium', row: 9, col: 17 },
    { symbol: 'Rf', name: 'Rutherfordium', row: 7, col: 4 },
    { symbol: 'Db', name: 'Dubnium', row: 7, col: 5 },
    { symbol: 'Sg', name: 'Seaborgium', row: 7, col: 6 },
    { symbol: 'Bh', name: 'Bohrium', row: 7, col: 7 },
    { symbol: 'Hs', name: 'Hassium', row: 7, col: 8 },
    { symbol: 'Mt', name: 'Meitnerium', row: 7, col: 9 },
    { symbol: 'Ds', name: 'Darmstadtium', row: 7, col: 10 },
    { symbol: 'Rg', name: 'Roentgenium', row: 7, col: 11 },
    { symbol: 'Cn', name: 'Copernicium', row: 7, col: 12 },
    { symbol: 'Nh', name: 'Nihonium', row: 7, col: 13 },
    { symbol: 'Fl', name: 'Flerovium', row: 7, col: 14 },
    { symbol: 'Mc', name: 'Moscovium', row: 7, col: 15 },
    { symbol: 'Lv', name: 'Livermorium', row: 7, col: 16 },
    { symbol: 'Ts', name: 'Tennessine', row: 7, col: 17 },
    { symbol: 'Og', name: 'Oganesson', row: 7, col: 18 }
];

// Hangman stages (ASCII art for visual progress)
const hangmanStages = [
    `
      ------
      |    |
           |
           |
           |
           |
    =========`, // Empty stage
    `
      ------
      |    |
      O    |
           |
           |
           |
    =========`, // Head added
    `
      ------
      |    |
      O    |
      |    |
           |
           |
    =========`, // Torso added
    `
      ------
      |    |
      O    |
     /|    |
           |
           |
    =========`, // Left arm added
    `
      ------
      |    |
      O    |
     /|\\   |
           |
           |
    =========`, // Right arm added
    `
      ------
      |    |
      O    |
     /|\\   |
     /     |
           |
    =========`, // Left leg added
    `
      ------
      |    |
      O    |
     /|\\   |
     / \\   |
           |
    =========` // Right leg added (game over)
];

// Initialize page when DOM is fully loaded
function initPage() {
    // Get key DOM elements
    const portalOverlay = document.getElementById("portal-overlay");
    const mainContent = document.getElementById("main-content");

    // Set initial visibility states
    portalOverlay.style.display = "flex"; // Show portal overlay
    mainContent.style.display = "none"; // Hide main content
    document.body.style.overflow = "hidden"; // Prevent scrolling during portal

    // Transition to game after portal animation (2 seconds)
    setTimeout(() => {
        portalOverlay.style.display = "none"; // Hide portal
        mainContent.style.display = "block"; // Show game
        document.body.style.overflow = "auto"; // Restore scrolling
        startGame(); // Begin game
    }, 2000);

    // Disable Hangman button to indicate current page
    const hangmanButton = document.querySelector("button[onclick=\"portalTransition('hangman.html')\"]");
    if (hangmanButton) hangmanButton.disabled = true;
}

// Start a new game
function startGame() {
    // Reset game state
    gameActive = true; // Enable gameplay
    mistakes = 0; // Reset mistakes
    guessedLetters.clear(); // Clear guessed letters
    guessedElements.clear(); // Clear element guesses
    hintsUsed = 0; // Reset hints used
    word = elements[Math.floor(Math.random() * elements.length)].name.toUpperCase(); // Pick random element name
    stopColorCycle(); // Clear any color cycling

    // Update display and setup UI
    updateDisplay(); // Refresh game visuals
    setupKeyboard(); // Create letter buttons
    setupPeriodicTable(); // Build periodic table
    document.getElementById("hint").onclick = getHint; // Bind hint button
    document.getElementById("hint").disabled = false; // Enable hint button at start
}

// Update game visuals
function updateDisplay() {
    // Update score display
    document.getElementById("score").textContent = `Score: ${score}`;

    // Update hangman figure based on mistakes
    document.getElementById("hangman").textContent = hangmanStages[mistakes];

    // Update word display with guessed/unguessed letters
    const wordDisplay = word
        .split('')
        .map(letter => (guessedLetters.has(letter) ? letter : '_'))
        .join(' ');
    document.getElementById("word").textContent = wordDisplay;

    // Update keyboard button states
    document.querySelectorAll(".keyboard button").forEach(btn => {
        const letter = btn.textContent;
        btn.disabled = guessedLetters.has(letter); // Disable guessed letters
    });

    // Update periodic table highlights
    document.querySelectorAll(".element:not(.empty)").forEach(el => {
        const name = el.dataset.name.toUpperCase();
        if (guessedElements.has(name)) {
            el.classList.add(guessedElements.get(name).correct ? "correct" : "incorrect"); // Apply highlight
            el.classList.add("disabled"); // Disable guessed elements
        } else {
            el.classList.remove("correct", "incorrect", "disabled"); // Reset un-guessed elements
        }
    });

    // Update hint button state
    document.getElementById("hint").disabled = hintsUsed >= maxHints || !gameActive; // Disable if max hints reached or game inactive

    // Check win/loss conditions
    if (mistakes >= maxMistakes) {
        endGame(false); // Game over if max mistakes reached
    } else if (word.split('').every(letter => guessedLetters.has(letter))) {
        endGame(true); // Win if all letters guessed
    }
}

// Setup keyboard with letter buttons
function setupKeyboard() {
    const keyboard = document.getElementById("keyboard");
    keyboard.innerHTML = ''; // Clear existing buttons
    for (let i = 65; i <= 90; i++) { // Loop through A-Z
        const letter = String.fromCharCode(i);
        const button = document.createElement("button");
        button.className = "btn neon-btn"; // Neon style
        button.textContent = letter; // Set letter
        button.onclick = () => handleGuess(letter); // Bind click handler
        keyboard.appendChild(button); // Add to keyboard
    }
}

// Setup scrollable periodic table
function setupPeriodicTable() {
    const table = document.getElementById("periodic-table");
    table.innerHTML = ''; // Clear existing content
    const grid = document.createElement("div");
    grid.className = "periodic-table-grid"; // Grid container

    // Create a map for positioning elements
    const positions = new Array(10).fill().map(() => new Array(19).fill(null)); // 10 rows, 19 cols (1-based indexing)

    // Place elements in their correct grid positions
    elements.forEach(element => {
        positions[element.row][element.col] = element;
    });

    // Generate grid cells
    for (let row = 1; row <= 9; row++) {
        for (let col = 1; col <= 18; col++) {
            const cell = document.createElement("div");
            cell.style.gridRow = row; // Set row position
            cell.style.gridColumn = col; // Set column position
            if (positions[row][col]) {
                const element = positions[row][col];
                cell.className = "element"; // Element styling
                cell.textContent = element.symbol; // Display symbol
                cell.dataset.name = element.name; // Store name for guessing
                cell.onclick = () => guessElement(element.name.toUpperCase()); // Bind click handler
            } else {
                cell.className = "element empty"; // Empty cell for gaps
            }
            grid.appendChild(cell); // Add to grid
        }
    }

    table.appendChild(grid); // Add grid to table container
}

// Handle letter guess via keyboard
function handleGuess(letter) {
    if (!gameActive || guessedLetters.has(letter)) return; // Ignore if inactive or already guessed
    playSound("actionSound"); // Play action sound
    guessedLetters.add(letter); // Record guess

    if (!word.includes(letter)) {
        mistakes++; // Increment mistakes for incorrect guess
        playSound("loseSound"); // Play error sound
    } else {
        playSound("clickSound"); // Play success sound
    }

    updateDisplay(); // Refresh visuals
}

// Guess an entire element name via periodic table
function guessElement(name) {
    if (!gameActive) return; // Ignore if game inactive
    playSound("actionSound"); // Play action sound
    guessedElements.set(name, { correct: name === word }); // Record guess with correctness
    if (name === word) {
        // Correct guess: reveal all letters
        word.split('').forEach(letter => guessedLetters.add(letter));
        playSound("winSound"); // Play win sound
    } else {
        // Incorrect guess: end game
        mistakes = maxMistakes;
        playSound("loseSound"); // Play error sound
    }
    updateDisplay(); // Refresh visuals
}

// Provide a hint by revealing a random unguessed letter
function getHint() {
    if (!gameActive || hintsUsed >= maxHints) return; // Ignore if game inactive or max hints reached
    playSound("clickSound"); // Play click sound
    hintsUsed++; // Increment hints used
    const unguessed = word.split('').filter(letter => !guessedLetters.has(letter));
    if (unguessed.length > 0) {
        const letter = unguessed[Math.floor(Math.random() * unguessed.length)]; // Pick random letter
        guessedLetters.add(letter); // Reveal letter
        updateDisplay(); // Refresh visuals
        const resultElement = document.getElementById("result");
        resultElement.textContent = `Hint: Revealed '${letter}' (${hintsUsed}/${maxHints})`; // Show hint message with count
        stopColorCycle(); // Clear existing color cycle
        cycleColors("result"); // Start color cycling for hint
    }
}

// End the game (win or loss)
function endGame(won) {
    gameActive = false; // Disable gameplay
    const resultElement = document.getElementById("result");
    stopColorCycle(); // Clear color cycling
    resultElement.classList.remove("glowVictory", "glowLoss"); // Remove glow classes

    if (won) {
        score += 10; // Award points for win
        resultElement.textContent = `Success! Element: ${word}`; // Show win message
        resultElement.classList.add("glowVictory"); // Apply green glow
        playSound("winSound"); // Play win sound
        // Ensure correct element is highlighted
        guessedElements.set(word, { correct: true });
    } else {
        resultElement.textContent = `Game Over! Element was: ${word}`; // Show loss message
        resultElement.classList.add("glowLoss"); // Apply red glow
        playSound("loseSound"); // Play error sound
    }

    updateDisplay(); // Update highlights

    // Start new game after 3 seconds
    setTimeout(startGame, 3000);
}

// Reset game state
function resetGame() {
    playSound("clickSound"); // Play click sound
    const portalOverlay = document.getElementById("portal-overlay");
    const mainContent = document.getElementById("main-content");
    const resultElement = document.getElementById("result");

    // Reset all state
    score = 0; // Clear score
    hintsUsed = 0; // Reset hints used
    resultElement.classList.remove("glowVictory", "glowLoss"); // Remove glows
    stopColorCycle(); // Clear color cycling
    resultElement.textContent = ""; // Clear result text

    // Show portal and restart
    mainContent.style.display = "none"; // Hide game
    portalOverlay.style.display = "flex"; // Show portal
    setTimeout(() => {
        portalOverlay.style.display = "none"; // Hide portal
        mainContent.style.display = "block"; // Show game
        startGame(); // Begin new game
    }, 2000); // Match portal animation duration
}

// Play audio sound with error handling
function playSound(soundId) {
    const sound = document.getElementById(soundId);
    if (sound) {
        sound.currentTime = 0; // Reset to start
        sound.play().catch(error => console.log("Sound play error:", error)); // Play with error logging
    }
}

// Cycle colors for hint messages
function cycleColors(elementId) {
    const element = document.getElementById(elementId);
    const colors = ["#00ccff", "#ff00ff", "#00ff00", "#ffff00", "#ff6600"]; // Neon color palette
    let index = 0; // Current color index

    // Clear existing interval
    stopColorCycle();

    // Start color cycling every 700ms
    colorCycleInterval = setInterval(() => {
        element.style.color = colors[index]; // Set text color
        element.style.textShadow = `0 0 5px ${colors[index]}, 0 0 10px ${colors[index]}, 0 0 20px ${colors[index]}`; // Set glow
        index = (index + 1) % colors.length; // Move to next color
    }, 700);
}

// Stop color cycling and reset style
function stopColorCycle() {
    if (colorCycleInterval) {
        clearInterval(colorCycleInterval); // Clear interval
        colorCycleInterval = null; // Reset tracker
        const resultElement = document.getElementById("result");
        resultElement.style.color = "#00ccff"; // Reset to cyan
        resultElement.style.textShadow = "0 0 5px #00ccff, 0 0 10px #00ccff, 0 0 20px #00ccff"; // Reset glow
    }
}

// Handle navigation to other pages
function portalTransition(url) {
    const portalOverlay = document.getElementById("portal-overlay");
    const mainContent = document.getElementById("main-content");
    playSound("clickSound"); // Play click sound
    mainContent.style.display = "none"; // Hide game
    portalOverlay.style.display = "flex"; // Show portal
    setTimeout(() => window.location.href = url, 2000); // Redirect after 2s
}

// Initialize page on DOM load
document.addEventListener("DOMContentLoaded", initPage);