// All 118 elements of the periodic table
const elements = [
    "hydrogen", "helium", "lithium", "beryllium", "boron", "carbon", "nitrogen", "oxygen", "fluorine", "neon",
    "sodium", "magnesium", "aluminum", "silicon", "phosphorus", "sulfur", "chlorine", "argon", "potassium", "calcium",
    "scandium", "titanium", "vanadium", "chromium", "manganese", "iron", "cobalt", "nickel", "copper", "zinc",
    "gallium", "germanium", "arsenic", "selenium", "bromine", "krypton", "rubidium", "strontium", "yttrium", "zirconium",
    "niobium", "molybdenum", "technetium", "ruthenium", "rhodium", "palladium", "silver", "cadmium", "indium", "tin",
    "antimony", "tellurium", "iodine", "xenon", "cesium", "barium", "lanthanum", "cerium", "praseodymium", "neodymium",
    "promethium", "samarium", "europium", "gadolinium", "terbium", "dysprosium", "holmium", "erbium", "thulium", "ytterbium",
    "lutetium", "hafnium", "tantalum", "tungsten", "rhenium", "osmium", "iridium", "platinum", "gold", "mercury",
    "thallium", "lead", "bismuth", "polonium", "astatine", "radon", "francium", "radium", "actinium", "thorium",
    "protactinium", "uranium", "neptunium", "plutonium", "americium", "curium", "berkelium", "californium", "einsteinium",
    "fermium", "mendelevium", "nobelium", "lawrencium", "rutherfordium", "dubnium", "seaborgium", "bohrium", "hassium",
    "meitnerium", "darmstadtium", "roentgenium", "copernicium", "nihonium", "flerovium", "moscovium", "livermorium",
    "tennessine", "oganesson"
];

let currentWord = "";
let guessedLetters = [];
let wrongGuesses = 0;
let score = 0;
const maxGuesses = 6;

function initPage() {
    const portalOverlay = document.getElementById("portal-overlay");
    const mainContent = document.getElementById("main-content");
    setTimeout(() => {
        portalOverlay.style.display = "none";
        mainContent.style.display = "block";
        document.body.style.overflow = "auto";
        startGame();
    }, 2000);
}

function startGame() {
    currentWord = elements[Math.floor(Math.random() * elements.length)].toLowerCase();
    guessedLetters = [];
    wrongGuesses = 0;
    updateDisplay();
    createKeyboard();
    cycleColors("result");
}

function updateDisplay() {
    document.getElementById("score").textContent = `Score: ${score}`;
    const wordDisplay = currentWord.split("").map(letter => guessedLetters.includes(letter) ? letter : "_").join(" ");
    document.getElementById("word").textContent = wordDisplay;
    const resultElement = document.getElementById("result");
    if (wrongGuesses >= maxGuesses) {
        resultElement.textContent = `Grid Overload! Element: ${currentWord}`;
        playSound("loseSound");
        disableKeyboard();
    } else if (!wordDisplay.includes("_")) {
        score++;
        resultElement.textContent = "Element Decoded!";
        playSound("winSound");
        disableKeyboard();
        setTimeout(startGame, 2000);
    } else {
        resultElement.textContent = "";
    }
}

function createKeyboard() {
    const keyboard = document.getElementById("keyboard");
    keyboard.innerHTML = "";
    for (let i = 97; i <= 122; i++) { // a-z
        const letter = String.fromCharCode(i);
        const key = document.createElement("button");
        key.className = "key";
        key.textContent = letter;
        key.addEventListener("click", () => handleGuess(letter));
        keyboard.appendChild(key);
    }
}

function handleGuess(letter) {
    if (guessedLetters.includes(letter) || wrongGuesses >= maxGuesses || !document.getElementById("word").textContent.includes("_")) return;
    playSound("actionSound");
    guessedLetters.push(letter);
    if (!currentWord.includes(letter)) wrongGuesses++;
    updateDisplay();
    document.querySelector(`.key:contains('${letter}')`).disabled = true;
}


function disableKeyboard() {
    document.querySelectorAll(".key").forEach(key => key.disabled = true);
}

function resetGame() {
    playSound("clickSound");
    const portalOverlay = document.getElementById("portal-overlay");
    const mainContent = document.getElementById("main-content");
    mainContent.style.display = "none";
    portalOverlay.style.display = "flex";
    setTimeout(() => {
        portalOverlay.style.display = "none";
        mainContent.style.display = "block";
        score = 0;
        startGame();
    }, 2000);
}

function playSound(soundId) {
    const sound = document.getElementById(soundId);
    if (sound) sound.play().catch(error => console.log("Sound play error:", error));
}

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

function portalTransition(url) {
    playSound("clickSound");
    const portalOverlay = document.getElementById("portal-overlay");
    const mainContent = document.getElementById("main-content");
    mainContent.style.display = "none";
    portalOverlay.style.display = "flex";
    setTimeout(() => window.location.href = url, 2000);
}

document.addEventListener("DOMContentLoaded", initPage);