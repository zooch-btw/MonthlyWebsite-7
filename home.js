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

    // Add event listener to the "Enter the Realm" button
    const enterBtn = document.getElementById("enterBtn");
    if (enterBtn) {
        enterBtn.addEventListener("click", enterRealm);
    }
}

// Handle the "Enter the Realm" button click
function enterRealm() {
    // Get the username input element and its value
    const userNameInput = document.getElementById("userName");
    const userNameError = document.getElementById("usernameError");
    let userName = userNameInput.value.trim();

    // Validate the username: alphanumeric and spaces only, max length 20
    const userNameRegex = /^[a-zA-Z0-9\s]+$/;
    if (userName.length === 0 || userName.length > 20 || !userNameRegex.test(userName)) {
        // If invalid, use default username and show error message
        userName = "Cyber Warrior";
        userNameInput.value = userName; // Reset input to default
        if (userNameError) {
            userNameError.textContent = "Invalid username! Only alphanumeric characters and spaces allowed.";
            userNameError.style.display = "block";
        }
        setTimeout(() => {
            if (userNameError) userNameError.style.display = "none"; // Hide error after 3 seconds
        }, 3000);
    } else {
        // If valid, clear any error message
        if (userNameError) userNameError.style.display = "none";
    }

    // Save the username to localStorage for use across pages
    localStorage.setItem("userName", userName);
    playSound("clickSound"); // Play click sound effect
    portalTransition("rps.html"); // Navigate to RPS with portal animation
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

// Handle navigation to another page with a portal transition animation
function portalTransition(url) {
    // Get the portal overlay and main content elements
    const portalOverlay = document.getElementById("portal-overlay");
    const mainContent = document.getElementById("main-content");
    if (portalOverlay && mainContent) {
        playSound("clickSound"); // Play click sound
        mainContent.style.display = "none"; // Hide the main content
        portalOverlay.style.display = "flex"; // Show the portal animation
        setTimeout(() => {
            window.location.href = url; // Navigate to the new page after 2 seconds
        }, 2000);
    }
}

// Add event listener to initialize the page when the DOM is loaded
document.addEventListener("DOMContentLoaded", initPage);
