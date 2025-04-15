// Initialize page when DOM is fully loaded
function initPage() {
    const portalOverlay = document.getElementById("portal-overlay"); // Portal overlay element
    const mainContent = document.getElementById("main-content"); // Main content element
    // Show main content after portal animation
    setTimeout(() => {
        portalOverlay.style.display = "none";
        mainContent.style.display = "block";
        document.body.style.overflow = "auto"; // Enable scrolling
    }, 2000);

    const enterBtn = document.getElementById("enterBtn"); // Enter button
    enterBtn.addEventListener("click", enterRealm); // Add click event
}

// Handle entering the realm
function enterRealm() {
    const userNameInput = document.getElementById("userName"); // Username input
    const userNameError = document.getElementById("usernameError"); // Error message
    let userName = userNameInput.value.trim(); // Trimmed username
    const userNameRegex = /^[a-zA-Z0-9\s]+$/; // Alphanumeric and spaces only

    // Validate username
    if (userName.length === 0 || userName.length > 20 || !userNameRegex.test(userName)) {
        userName = "Cyber Warrior"; // Default name
        userNameInput.value = userName; // Set default
        userNameError.textContent = "Invalid username! Only alphanumeric characters and spaces allowed.";
        userNameError.style.display = "block"; // Show error
        setTimeout(() => userNameError.style.display = "none", 3000); // Hide after 3s
    } else {
        userNameError.style.display = "none"; // Hide error
    }

    localStorage.setItem("userName", userName); // Store username
    playSound("clickSound"); // Play sound
    portalTransition("rps.html"); // Transition to RPS
}

// Play audio sound
function playSound(soundId) {
    const sound = document.getElementById(soundId); // Audio element
    if (sound) {
        sound.currentTime = 0; // Reset to start
        sound.play().catch(error => console.log("Sound play error:", error)); // Play with error handling
    }
}

// Handle portal transition to another page
function portalTransition(url) {
    const portalOverlay = document.getElementById("portal-overlay"); // Portal overlay
    const mainContent = document.getElementById("main-content"); // Main content
    playSound("clickSound"); // Play sound
    mainContent.style.display = "none"; // Hide content
    portalOverlay.style.display = "flex"; // Show portal
    setTimeout(() => window.location.href = url, 2000); // Redirect after 2s
}

// Event listener for DOM content loaded
document.addEventListener("DOMContentLoaded", initPage);