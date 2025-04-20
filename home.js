// Initialize page when DOM is fully loaded
function initPage() {
    // Get DOM elements for overlay and content
    const portalOverlay = document.getElementById("portal-overlay"); // Portal animation overlay
    const mainContent = document.getElementById("main-content"); // Main content area
    // Set initial display states
    portalOverlay.style.display = "flex"; // Show portal overlay
    mainContent.style.display = "none"; // Hide main content
    document.body.style.overflow = "hidden"; // Prevent scrolling during animation
    // Transition to main content after portal animation (2 seconds)
    setTimeout(() => {
        portalOverlay.style.display = "none"; // Hide overlay
        mainContent.style.display = "block"; // Show content
        document.body.style.overflow = "auto"; // Restore scrolling
    }, 2000);
    // Bind enter button click event
    const enterBtn = document.getElementById("enterBtn"); // Enter realm button
    enterBtn.addEventListener("click", enterRealm); // Attach click handler
}

// Handle entering the realm with username validation
function enterRealm() {
    // Get input and error elements
    const userNameInput = document.getElementById("userName"); // Username input field
    const userNameError = document.getElementById("usernameError"); // Error message display
    let userName = userNameInput.value.trim(); // Trimmed username value
    const userNameRegex = /^[a-zA-Z0-9\s]+$/; // Regex for alphanumeric and spaces
    // Validate username
    if (userName.length === 0 || userName.length > 20 || !userNameRegex.test(userName)) {
        userName = "Cyber Warrior"; // Set default name
        userNameInput.value = userName; // Update input field
        userNameError.textContent = "Invalid username! Only alphanumeric characters and spaces allowed."; // Set error
        userNameError.style.display = "block"; // Show error
        // Hide error after 3 seconds
        setTimeout(() => userNameError.style.display = "none", 3000);
    } else {
        userNameError.style.display = "none"; // Hide error if valid
    }
    // Store username and transition
    localStorage.setItem("player1Name", userName); // Save to localStorage
    playSound("clickSound"); // Play click sound
    portalTransition("rps.html"); // Navigate to Rock Paper Scissors
}

// Play audio sound by ID
function playSound(soundId) {
    const sound = document.getElementById(soundId); // Audio element
    if (sound) {
        sound.currentTime = 0; // Reset sound to start
        sound.play().catch(error => console.log("Sound play error:", error)); // Play with error handling
    }
}

// Handle portal transition to another page
function portalTransition(url) {
    // Get overlay and content elements
    const portalOverlay = document.getElementById("portal-overlay"); // Portal animation overlay
    const mainContent = document.getElementById("main-content"); // Main content area
    playSound("clickSound"); // Play transition sound
    mainContent.style.display = "none"; // Hide content
    portalOverlay.style.display = "flex"; // Show portal animation
    // Navigate to new page after animation (2 seconds)
    setTimeout(() => window.location.href = url, 2000);
}

// Bind initPage to DOM content loaded event
document.addEventListener("DOMContentLoaded", initPage);