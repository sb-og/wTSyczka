document.addEventListener('DOMContentLoaded', () => {
    const darkModeCheckbox = document.querySelector('input[value="dark-mode"]');
    const usernameInput = document.getElementById('username');
    const saveButton = document.getElementById('saveButton');

    // Log to indicate that the script has started
    console.log('Script started: Adding event listeners and loading settings');

    // Load the current settings from storage
    chrome.storage.sync.get(['darkMode', 'username'], (result) => {
        console.log('Loaded settings from storage:', result);
        if (result.darkMode !== undefined) {
            darkModeCheckbox.checked = result.darkMode;
            console.log('Dark mode set to:', result.darkMode);
        } else {
            console.log('Dark mode setting not found');
        }

        if (result.username !== undefined) {
            usernameInput.value = result.username;
            console.log('Username set to:', result.username);
        } else {
            console.log('Username setting not found');
        }
    });

    // Save settings when the save button is clicked
    saveButton.addEventListener('click', () => {
        const darkMode = darkModeCheckbox.checked;
        const username = usernameInput.value;

        console.log('Saving settings:', { darkMode, username });
        chrome.storage.sync.set({ darkMode: darkMode, username: username }, () => {
            console.log('Settings successfully saved:', { darkMode, username });
        });
    });

    // Log to indicate that event listeners were added successfully
    console.log('Event listeners added');
});
