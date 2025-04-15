// Initialize page when DOM is fully loaded
function initPage() {
    const portalOverlay = document.getElementById("portal-overlay"); // Portal overlay element
    const mainContent = document.getElementById("main-content"); // Main content element
    // Show main content after 2s portal animation
    setTimeout(() => {
        portalOverlay.style.display = "none"; // Hide portal
        mainContent.style.display = "block"; // Show content
        document.body.style.overflow = "auto"; // Enable scrolling
    }, 2000);

    const enterBtn = document.getElementById("enterBtn"); // Enter button
    enterBtn.addEventListener("click", enterRealm); // Bind click event
}

// Handle entering the realm with username validation
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
    playSound("clickSound"); // Play click sound
    portalTransition("rps.html"); // Transition to RPS
}

// Play audio sound with error handling
function playSound(soundId) {
    const sound = document.getElementById(soundId); // Audio element
    if (sound) {
        sound.currentTime = 0; // Reset to start
        sound.play().catch(error => console.log("Sound play error:", error)); // Play sound
    }
}

// Handle portal transition to another page
function portalTransition(url) {
    const portalOverlay = document.getElementById("portal-overlay"); // Portal overlay
    const mainContent = document.getElementById("main-content"); // Main content
    playSound("clickSound"); // Play click sound
    mainContent.style.display = "none"; // Hide content
    portalOverlay.style.display = "flex"; // Show portal
    setTimeout(() => window.location.href = url, 2000); // Redirect after 2s
}

// Bind initPage to DOM content loaded event
document.addEventListener("DOMContentLoaded", initPage);