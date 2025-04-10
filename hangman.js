// Game state variables
let word = ""; // The word to guess
let guessedLetters = new Set(); // Set of letters already guessed
let guessesLeft = 6; // Number of incorrect guesses remaining
let gameActive = true; // Flag to track if the game is active
let currentElementIndex = 0; // Index of the current element in the periodic table
const userName = localStorage.getItem("userName") || "Cyber Warrior"; // Username from localStorage

// List of words to guess (chemical elements for thematic consistency)
const words = [
    "hydrogen", "helium", "lithium", "beryllium", "boron", "carbon", "nitrogen",
    "oxygen", "fluorine", "neon", "sodium", "magnesium", "aluminum", "silicon",
    "phosphorus", "sulfur", "chlorine", "argon", "potassium", "calcium", "scandium",
    "titanium", "vanadium", "chromium", "manganese", "iron", "cobalt", "nickel",
    "copper", "zinc", "gallium", "germanium", "arsenic", "selenium", "bromine",
    "krypton", "rubidium", "strontium", "yttrium", "zirconium", "niobium",
    "molybdenum", "technetium", "ruthenium", "rhodium", "palladium", "silver",
    "cadmium", "indium", "tin", "antimony", "tellurium", "iodine", "xenon",
    "cesium", "barium", "lanthanum", "cerium", "praseodymium", "neodymium",
    "promethium", "samarium", "europium", "gadolinium", "terbium", "dysprosium",
    "holmium", "erbium", "thulium", "ytterbium", "lutetium", "hafnium", "tantalum",
    "tungsten", "rhenium", "osmium", "iridium", "platinum", "gold", "mercury",
    "thallium", "lead", "bismuth", "polonium", "astatine", "radon", "francium",
    "radium", "actinium", "thorium", "protactinium", "uranium", "neptunium",
    "plutonium", "americium", "curium", "berkelium", "californium", "einsteinium",
    "fermium", "mendelevium", "nobelium", "lawrencium", "rutherfordium",
    "dubnium", "seaborgium", "bohrium", "hassium", "meitnerium", "darmstadtium",
    "roentgenium", "copernicium", "nihonium", "flerovium", "moscovium",
    "livermorium", "tennessine", "oganesson"
];

// List of element symbols for the periodic table 
const elementSymbols = [
    "H", "He", "Li", "Be", "B", "C", "N", "O", "F", "Ne",
    "Na", "Mg", "Al", "Si", "P", "S", "Cl", "Ar", "K", "Ca",
    "Sc", "Ti", "V", "Cr", "Mn", "Fe", "Co", "Ni", "Cu", "Zn",
    "Ga", "Ge", "As", "Se", "Br", "Kr", "Rb", "Sr", "Y", "Zr",
    "Nb", "Mo", "Tc", "Ru", "Rh", "Pd", "Ag", "Cd", "In", "Sn",
    "Sb", "Te", "I", "Xe", "Cs", "Ba", "La", "Ce", "Pr", "Nd",
    "Pm", "Sm", "Eu", "Gd", "Tb", "Dy", "Ho", "Er", "Tm", "Yb",
    "Lu", "Hf", "Ta", "W", "Re", "Os", "Ir", "Pt", "Au", "Hg",
    "Tl", "Pb", "Bi", "Po", "At", "Rn", "Fr", "Ra", "Ac", "Th",
    "Pa", "U", "Np", "Pu", "Am", "Cm", "Bk", "Cf", "Es", "Fm",
    "Md", "No", "Lr", "Rf", "Db", "Sg", "Bh", "Hs", "Mt", "Ds",
    "Rg", "Cn", "Nh", "Fl", "Mc", "Lv", "Ts", "Og"
];

// Initialize the page when the DOM is fully loaded
function initPage() {
    // Get the portal overlay and main content elements
    const portalOverlay = document.getElementById("portal-overlay");
    const mainContent = document.getElementById("main-content");

    // After 2 seconds, hide the portal overlay and show the main content
    setTimeout(() => {
        if (portalOverlay && mainContent) {
            portalOverlay.style.display = "none"; // Hide the loading animation
            mainContent.style.display = "block"; // Show the main content
            document.body.style.overflow = "auto"; // Re-enable scrolling
        }
    }, 2000);

    // Initialize the game
    initGame();
    // Start color cycling for the result text
    cycleColors("result");
}

// Initialize a new game
function initGame() {
    // Reset game state
    guessesLeft = 6;
    guessedLetters.clear();
    gameActive = true;

    // Select a random word from the list
    word = words[currentElementIndex].toUpperCase();
    updateWordDisplay();
    updateGuessesLeft();
    createKeyboard();
    createPeriodicTable();
    updateResult("");
}

// Update the word display with underscores for unguessed letters
function updateWordDisplay() {
    const wordDisplay = document.getElementById("wordDisplay");
    if (wordDisplay) {
        // Show letters that have been guessed, underscores for others
        const display = word.split("").map(letter =>
            guessedLetters.has(letter) ? letter : "_"
        ).join(" ");
        wordDisplay.textContent = display;
    }
}

// Update the number of guesses left
function updateGuessesLeft() {
    const guessesLeftElement = document.getElementById("guessesLeft");
    if (guessesLeftElement) {
        guessesLeftElement.textContent = `Guesses Left: ${guessesLeft}`;
    }
}

// Create the on-screen keyboard for letter guesses
function createKeyboard() {
    const keyboard = document.getElementById("keyboard");
    if (keyboard) {
        keyboard.innerHTML = ""; // Clear any existing buttons
        // Create a button for each letter (A-Z)
        for (let i = 65; i <= 90; i++) {
            const letter = String.fromCharCode(i);
            const button = document.createElement("button");
            button.className = "key-btn";
            button.textContent = letter;
            button.addEventListener("click", () => handleGuess(letter));
            keyboard.appendChild(button);
        }
    }
}

// Create the periodic table for tracking wins/losses
function createPeriodicTable() {
    const periodicTable = document.getElementById("periodic-table");
    if (periodicTable) {
        periodicTable.innerHTML = ""; // Clear any existing elements
        // Create an element for each of the first 18 elements
        for (let i = 0; i < elementSymbols.length; i++) {
            const element = document.createElement("div");
            element.className = "element";
            element.setAttribute("data-index", i);
            element.textContent = elementSymbols[i];
            // Load previous game results from localStorage
            const state = localStorage.getItem(`hangman-element-${i}`);
            if (state === "correct") {
                element.classList.add("correct");
            } else if (state === "incorrect") {
                element.classList.add("incorrect");
            }
            periodicTable.appendChild(element);
        }
    }
}

// Handle a letter guess
function handleGuess(letter) {
    // Ignore if the game is not active or letter already guessed
    if (!gameActive || guessedLetters.has(letter)) return;

    // Play action sound
    playSound("actionSound");

    // Add the letter to the guessed set
    guessedLetters.add(letter);
    // Disable the button for this letter
    const buttons = document.querySelectorAll(".key-btn");
    buttons.forEach(btn => {
        if (btn.textContent === letter) {
            btn.classList.add("disabled");
            btn.disabled = true;
        }
    });

    // Check if the letter is in the word
    if (word.includes(letter)) {
        updateWordDisplay();
        // Check if the player has won
        const allLettersGuessed = word.split("").every(l => guessedLetters.has(l));
        if (allLettersGuessed) {
            endGame(true);
        }
    } else {
        // Incorrect guess, reduce guesses left
        guessesLeft--;
        updateGuessesLeft();
        if (guessesLeft === 0) {
            endGame(false);
        }
    }
}

// End the game (win or lose)
function endGame(won) {
    gameActive = false;
    const resultElement = document.getElementById("result");
    // Update the result message
    if (resultElement) {
        resultElement.textContent = won ? `${userName} Wins! Element Discovered: ${word}` : `Game Over! The Element was: ${word}`;
    }
    // Play appropriate sound
    playSound(won ? "winSound" : "loseSound");

    // Update the periodic table
    const element = document.querySelector(`.element[data-index="${currentElementIndex}"]`);
    if (element) {
        element.classList.add(won ? "correct" : "incorrect");
        // Save the result to localStorage
        localStorage.setItem(`hangman-element-${currentElementIndex}`, won ? "correct" : "incorrect");
    }

    // Move to the next element (if available)
    currentElementIndex = (currentElementIndex + 1) % words.length;
}

// Reset the game
function resetGame() {
    playSound("clickSound");
    initGame();
}

// Update the result message
function updateResult(message) {
    const resultElement = document.getElementById("result");
    if (resultElement) {
        resultElement.textContent = message;
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
