console.log('Combined script - app.js loaded');

// Utility function to load HTML content and optionally load a script
function loadPage(url, scriptToLoad = null) {
    console.log('Loading page with URL:', url);
    fetch(url)
        .then(response => response.text())
        .then(data => {
            console.log('Page content fetched');
            document.getElementById('app').innerHTML = data;

            // Attach event listeners after content is loaded
            addEventListeners();

            // Load the specified script if provided
            if (scriptToLoad) {
                console.log('Loading script:', scriptToLoad);
                loadScript(scriptToLoad);
            }
        })
        .catch(error => console.error('Error loading page:', error));
}

// Function to dynamically load a script
function loadScript(src) {
    console.log('Loading script with src:', src);
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => console.log('Script loaded:', src);
    document.body.appendChild(script);
}

// Function to attach event listeners
function addEventListeners() {
    console.log('Adding event listeners');

    // Event listener for openSettings button
    const openSettingsButton = document.getElementById('openSettings');
    if (openSettingsButton) {
        openSettingsButton.addEventListener('click', () => {
            console.log('Open Settings button clicked');
            loadPage('settings.html');
        });
    }

    // Event listener for backButton
    const backButton = document.getElementById('backButton');
    if (backButton) {
        backButton.addEventListener('click', () => {
            console.log('Back button clicked');
            loadPage('mainpage.html', 'scripts/form-handler.js');
        });
    }

    // Form handling on the initial page load
    const linkInput = document.getElementById('link');
    const startButton = document.getElementById('start');

    // Load data from localStorage
    const savedLink = localStorage.getItem('savedLink');
    if (savedLink && linkInput) {
        console.log('Link loaded from localStorage:', savedLink);
        linkInput.value = savedLink;
    }

    // Add click listener for the start button
    if (startButton) {
        startButton.addEventListener('click', (event) => {
            event.preventDefault(); // Prevent default form submission
            const link = linkInput?.value || '';
            if (link) {
                console.log('Link is valid, saving and opening it');
                localStorage.setItem('savedLink', link);
                window.open(link, '_blank');
            } else {
                console.log('Link is empty, showing alert');
                alert('Proszę podać link.');
            }
        });
    }

    // Settings handling on the settings page
    const darkModeCheckbox = document.querySelector('input[value="dark-mode"]');
    const usernameInput = document.getElementById('username');
    const saveButton = document.getElementById('saveButton');

    if (chrome?.storage?.sync) {
        chrome.storage.sync.get(['darkMode', 'username'], (result) => {
            console.log('Loaded settings from storage:', result);
            if (darkModeCheckbox) darkModeCheckbox.checked = result.darkMode ?? false;
            if (usernameInput) usernameInput.value = result.username ?? '';
        });

        // Save settings when the save button is clicked
        if (saveButton) {
            saveButton.addEventListener('click', () => {
                const darkMode = darkModeCheckbox?.checked ?? false;
                const username = usernameInput?.value ?? '';
                chrome.storage.sync.set({ darkMode, username }, () => {
                    console.log('Settings saved:', { darkMode, username });
                });
            });
        }
    } else {
        console.warn('Chrome storage API not available');
    }

    console.log('Event listeners added');
}

// Initialize by loading the default page and its script
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded and parsed');
    loadPage('mainpage.html', 'scripts/form-handler.js');
});
