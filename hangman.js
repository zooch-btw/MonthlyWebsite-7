// Periodic table elements with their atomic numbers for layout
const elements = [
    { name: "hydrogen", number: 1 }, { name: "helium", number: 2 },
    { name: "lithium", number: 3 }, { name: "beryllium", number: 4 }, { name: "boron", number: 5 },
    { name: "carbon", number: 6 }, { name: "nitrogen", number: 7 }, { name: "oxygen", number: 8 },
    { name: "fluorine", number: 9 }, { name: "neon", number: 10 },
    { name: "sodium", number: 11 }, { name: "magnesium", number: 12 }, { name: "aluminum", number: 13 },
    { name: "silicon", number: 14 }, { name: "phosphorus", number: 15 }, { name: "sulfur", number: 16 },
    { name: "chlorine", number: 17 }, { name: "argon", number: 18 },
    { name: "potassium", number: 19 }, { name: "calcium", number: 20 }, { name: "scandium", number: 21 },
    { name: "titanium", number: 22 }, { name: "vanadium", number: 23 }, { name: "chromium", number: 24 },
    { name: "manganese", number: 25 }, { name: "iron", number: 26 }, { name: "cobalt", number: 27 },
    { name: "nickel", number: 28 }, { name: "copper", number: 29 }, { name: "zinc", number: 30 },
    { name: "gallium", number: 31 }, { name: "germanium", number: 32 }, { name: "arsenic", number: 33 },
    { name: "selenium", number: 34 }, { name: "bromine", number: 35 }, { name: "krypton", number: 36 },
    { name: "rubidium", number: 37 }, { name: "strontium", number: 38 }, { name: "yttrium", number: 39 },
    { name: "zirconium", number: 40 }, { name: "niobium", number: 41 }, { name: "molybdenum", number: 42 },
    { name: "technetium", number: 43 }, { name: "ruthenium", number: 44 }, { name: "rhodium", number: 45 },
    { name: "palladium", number: 46 }, { name: "silver", number: 47 }, { name: "cadmium", number: 48 },
    { name: "indium", number: 49 }, { name: "tin", number: 50 }, { name: "antimony", number: 51 },
    { name: "tellurium", number: 52 }, { name: "iodine", number: 53 }, { name: "xenon", number: 54 },
    { name: "cesium", number: 55 }, { name: "barium", number: 56 }, { name: "lanthanum", number: 57 },
    { name: "cerium", number: 58 }, { name: "praseodymium", number: 59 }, { name: "neodymium", number: 60 },
    { name: "promethium", number: 61 }, { name: "samarium", number: 62 }, { name: "europium", number: 63 },
    { name: "gadolinium", number: 64 }, { name: "terbium", number: 65 }, { name: "dysprosium", number: 66 },
    { name: "holmium", number: 67 }, { name: "erbium", number: 68 }, { name: "thulium", number: 69 },
    { name: "ytterbium", number: 70 }, { name: "lutetium", number: 71 }, { name: "hafnium", number: 72 },
    { name: "tantalum", number: 73 }, { name: "tungsten", number: 74 }, { name: "rhenium", number: 75 },
    { name: "osmium", number: 76 }, { name: "iridium", number: 77 }, { name: "platinum", number: 78 },
    { name: "gold", number: 79 }, { name: "mercury", number: 80 }, { name: "thallium", number: 81 },
    { name: "lead", number: 82 }, { name: "bismuth", number: 83 }, { name: "polonium", number: 84 },
    { name: "astatine", number: 85 }, { name: "radon", number: 86 }, { name: "francium", number: 87 },
    { name: "radium", number: 88 }, { name: "actinium", number: 89 }, { name: "thorium", number: 90 },
    { name: "protactinium", number: 91 }, { name: "uranium", number: 92 }, { name: "neptunium", number: 93 },
    { name: "plutonium", number: 94 }, { name: "americium", number: 95 }, { name: "curium", number: 96 },
    { name: "berkelium", number: 97 }, { name: "californium", number: 98 }, { name: "einsteinium", number: 99 },
    { name: "fermium", number: 100 }, { name: "mendelevium", number: 101 }, { name: "nobelium", number: 102 },
    { name: "lawrencium", number: 103 }, { name: "rutherfordium", number: 104 }, { name: "dubnium", number: 105 },
    { name: "seaborgium", number: 106 }, { name: "bohrium", number: 107 }, { name: "hassium", number: 108 },
    { name: "meitnerium", number: 109 }, { name: "darmstadtium", number: 110 }, { name: "roentgenium", number: 111 },
    { name: "copernicium", number: 112 }, { name: "nihonium", number: 113 }, { name: "flerovium", number: 114 },
    { name: "moscovium", number: 115 }, { name: "livermorium", number: 116 }, { name: "tennessine", number: 117 },
    { name: "oganesson", number: 118 }
];

// Game state variables
let currentWord = "";
let guessedLetters = [];
let wrongGuesses = 0;
let score = 0;
const maxGuesses = 6;
let guessedElements = new Map(); // Tracks guessed elements and correctness

// Initialize page with portal effect
function initPage() {
    const portalOverlay = document.getElementById("portal-overlay");
    const mainContent = document.getElementById("main-content");
    setTimeout(() => {
        portalOverlay.style.display = "none";
        mainContent.style.display = "flex";
        document.body.style.overflow = "auto";
        startGame();
    }, 2000);
}

// Start a new game round
function startGame() {
    // Pick a random un-guessed element
    let availableElements = elements.filter(el => !guessedElements.has(el.name));
    if (availableElements.length === 0) {
        guessedElements.clear();
        availableElements = elements;
    }
    currentWord = availableElements[Math.floor(Math.random() * availableElements.length)].name.toLowerCase();
    guessedLetters = [];
    wrongGuesses = 0;
    updateDisplay();
    createKeyboard();
    createPeriodicTable();
    cycleColors("result");
}

// Update game display
function updateDisplay() {
    document.getElementById("score").textContent = `Score: ${score}`;
    const wordDisplay = currentWord.split("").map(letter =>
        guessedLetters.includes(letter) ? letter : "_").join(" ");
    document.getElementById("word").textContent = wordDisplay;
    const resultElement = document.getElementById("result");
    if (wrongGuesses >= maxGuesses) {
        resultElement.textContent = `Game Over! Element: ${currentWord}`;
        playSound("loseSound");
        guessedElements.set(currentWord, false);
        updatePeriodicTable(currentWord, false);
        disableKeyboard();
        setTimeout(startGame, 2000);
    } else if (!wordDisplay.includes("_")) {
        score++;
        resultElement.textContent = "Element Decoded!";
        playSound("winSound");
        guessedElements.set(currentWord, true);
        updatePeriodicTable(currentWord, true);
        disableKeyboard();
        setTimeout(startGame, 2000);
    } else {
        resultElement.textContent = "";
    }
}

// Create virtual keyboard
function createKeyboard() {
    const keyboard = document.getElementById("keyboard");
    keyboard.innerHTML = "";
    for (let i = 97; i <= 122; i++) {
        const letter = String.fromCharCode(i);
        const key = document.createElement("button");
        key.className = "key";
        key.textContent = letter;
        key.addEventListener("click", () => handleGuess(letter));
        keyboard.appendChild(key);
    }
}

// Handle letter guess
function handleGuess(letter) {
    if (guessedLetters.includes(letter) || wrongGuesses >= maxGuesses ||
        !document.getElementById("word").textContent.includes("_")) return;
    playSound("actionSound");
    guessedLetters.push(letter);
    if (!currentWord.includes(letter)) wrongGuesses++;
    updateDisplay();
    const keyButton = Array.from(document.querySelectorAll(".key")).find(
        btn => btn.textContent.toLowerCase() === letter
    );
    if (keyButton) keyButton.disabled = true;
}

// Draw hangman with ASCII art
function drawHangman(guesses) {
    const parts = [
        "  O   ",
        " /|\\   ",
        " /|\\  ",
        "  |   ",
        "  |  ",
        " / \\  "
    ];
    let figure = guesses > 0 ? parts.slice(0, guesses).join("\n") : "";
    // Pad to maintain consistent height
    while (figure.split("\n").length < 6) figure += "\n";
    return figure;
}

// Disable keyboard
function disableKeyboard() {
    document.querySelectorAll(".key").forEach(key => key.disabled = true);
}

// Create periodic table in standard layout
function createPeriodicTable() {
    const table = document.getElementById("periodic-table");
    table.innerHTML = "";
    const grid = document.createElement("div");
    grid.className = "periodic-grid";

    // Create 7 rows x 18 columns grid
    for (let row = 1; row <= 7; row++) {
        for (let col = 1; col <= 18; col++) {
            const cell = document.createElement("div");
            cell.className = "element-cell";
            const element = elements.find(el => getElementPosition(el.number) === `${row},${col}`);
            if (element) {
                const btn = document.createElement("button");
                btn.className = "element-btn";
                btn.dataset.name = element.name;
                btn.innerHTML = `<span class="element-number">${element.number}</span><span class="element-name">${element.name}</span>`;
                if (guessedElements.has(element.name)) {
                    btn.classList.add(guessedElements.get(element.name) ? "correct" : "incorrect");
                }
                cell.appendChild(btn);
            } else if ((row === 6 && col === 3) || (row === 7 && col === 3)) {
                // Placeholder for lanthanides/actinides
                cell.className = "element-cell placeholder";
                cell.textContent = row === 6 ? "57-71" : "89-103";
            }
            grid.appendChild(cell);
        }
    }

    // Add lanthanides and actinides
    const fBlock = document.createElement("div");
    fBlock.className = "f-block";
    const lanthanides = elements.filter(el => el.number >= 57 && el.number <= 71);
    const actinides = elements.filter(el => el.number >= 89 && el.number <= 103);

    [lanthanides, actinides].forEach(series => {
        const row = document.createElement("div");
        row.className = "f-block-row";
        series.forEach(element => {
            const cell = document.createElement("div");
            cell.className = "element-cell";
            const btn = document.createElement("button");
            btn.className = "element-btn";
            btn.dataset.name = element.name;
            btn.innerHTML = `<span class="element-number">${element.number}</span><span class="element-name">${element.name}</span>`;
            if (guessedElements.has(element.name)) {
                btn.classList.add(guessedElements.get(element.name) ? "correct" : "incorrect");
            }
            cell.appendChild(btn);
            row.appendChild(cell);
        });
        fBlock.appendChild(row);
    });

    grid.appendChild(fBlock);
    table.appendChild(grid);
}

// Map atomic number to periodic table position (row,col)
function getElementPosition(number) {
    if (number === 1) return "1,1";
    if (number === 2) return "1,18";
    if (number >= 3 && number <= 4) return "2," + (number - 2);
    if (number >= 5 && number <= 10) return "2," + (number + 8);
    if (number >= 11 && number <= 12) return "3," + (number - 10);
    if (number >= 13 && number <= 18) return "3," + (number);
    if (number >= 19 && number <= 20) return "4," + (number - 18);
    if (number >= 21 && number <= 30) return "4," + (number - 18);
    if (number >= 31 && number <= 36) return "4," + (number - 12);
    if (number >= 37 && number <= 38) return "5," + (number - 36);
    if (number >= 39 && number <= 48) return "5," + (number - 36);
    if (number >= 49 && number <= 54) return "5," + (number - 30);
    if (number >= 55 && number <= 56) return "6," + (number - 54);
    if (number >= 72 && number <= 80) return "6," + (number - 69);
    if (number >= 81 && number <= 86) return "6," + (number - 63);
    if (number >= 87 && number <= 88) return "7," + (number - 86);
    if (number >= 104 && number <= 112) return "7," + (number - 101);
    if (number >= 113 && number <= 118) return "7," + (number - 95);
    return null; // Lanthanides/Actinides handled separately
}

// Update periodic table colors
function updatePeriodicTable(element, isCorrect) {
    const btn = document.querySelector(`.element-btn[data-name="${element}"]`);
    if (btn) {
        btn.classList.add(isCorrect ? "correct" : "incorrect");
    }
}

// Reset game
function resetGame() {
    playSound("clickSound");
    const portalOverlay = document.getElementById("portal-overlay");
    const mainContent = document.getElementById("main-content");
    mainContent.style.display = "none";
    portalOverlay.style.display = "flex";
    setTimeout(() => {
        portalOverlay.style.display = "none";
        mainContent.style.display = "flex";
        score = 0;
        guessedElements.clear();
        startGame();
    }, 2000);
}

// Play sound effect
function playSound(soundId) {
    const sound = document.getElementById(soundId);
    if (sound) sound.play().catch(error => console.log("Sound play error:", error));
}

// Cycle colors for result text
function cycleColors(elementId) {
    const element = document.getElementById(elementId);
    const colors = ["#00ccff", "#ff00ff", "#00ff00", "#ffff00", "#ff6600"];
    let index = 0;
    setInterval(() => {
        element.style.color = colors[index];
        element.style.textShadow = `0 0 5px ${colors[index]}, 0 0 10px ${colors[index]}, 0 0 20px ${colors[index]}`;
        index = (index + 1) % colors.length;
    }, 700);
}

// Initialize on load
document.addEventListener("DOMContentLoaded", initPage);