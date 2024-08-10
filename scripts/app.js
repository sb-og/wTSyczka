console.log('app.js loaded');

// Funkcja ładowania zawartości HTML do strony
function loadPage(url) {
    console.log('Loading page with URL:', url);
    fetch(url)
        .then(response => response.text())
        .then(data => {
            console.log('Page content fetched');
            document.getElementById('app').innerHTML = data;
            addEventListeners();  // Dodaj nasłuchiwacze zdarzeń po załadowaniu zawartości
        })
        .catch(error => console.error('Error loading page:', error));
}

// Funkcja dodająca nasłuchiwacze zdarzeń do elementów interfejsu
function addEventListeners() {
    console.log('Adding event listeners');

    // Definiowanie zmiennych dla elementów
    const linkInput = document.getElementById('link');
    const timerDisplay = document.getElementById('timerDisplay');
    const openSettingsButton = document.getElementById('openSettings');
    const backButton = document.getElementById('backButton');
    const clearButton = document.getElementById('clearButton');
    const startButton = document.getElementById('start');

    const darkModeCheckbox = document.getElementById('darkModeCheckbox');
    const timerCheckbox = document.getElementById('timerCheckbox');
    const usernameInput = document.getElementById('usernameInput');
    const passwordInput = document.getElementById('passwordInput');
    const saveButton = document.getElementById('saveButton');

    // Obsługa przycisku otwierającego ustawienia
    if (openSettingsButton) {
        openSettingsButton.addEventListener('click', () => {
            console.log('Open Settings button clicked');
            loadPage('settings.html');
        });
    }

    // Obsługa przycisku powrotu do strony głównej
    if (backButton) {
        backButton.addEventListener('click', () => {
            console.log('Back button clicked');
            loadPage('mainpage.html');
        });
    }

    // Obsługa menu kontekstowego
    chrome.storage.local.get('savedLink', function (result) {
        if (result.savedLink) {
            console.log('Link loaded from chrome.storage:', result.savedLink);
            linkInput.value = result.savedLink;
            manageTimerUpdate();
        } else {
            console.log('No link found in chrome.storage');
        }
    });

    // Ładowanie danych z chrome.storage.local
    chrome.storage.local.get(['savedLink', 'startDate', 'timer', 'darkMode', 'username', 'password'], function (result) {
        const savedLink = result.savedLink || '';
        const darkMode = result.darkMode === true;
        const timer = result.timer === true;
        const username = result.username || '';
        const password = result.password || '';

        if (linkInput) {
            linkInput.value = savedLink;
            console.log('Link loaded from chrome.storage:', savedLink);
        }

        if (darkModeCheckbox) darkModeCheckbox.checked = darkMode;
        if (timerCheckbox) timerCheckbox.checked = timer;
        if (usernameInput) usernameInput.value = username;
        if (passwordInput) passwordInput.value = password;

        toggleMode(darkMode);
    });

    // Przycisk czyszczenia
    if (clearButton) {
        clearButton.addEventListener('click', () => {
            chrome.storage.local.set({
                'savedLink': '',
                'startDate': '',
            }, () => {
                console.log('Start time cleared');
                manageTimerUpdate();
            });

            if (linkInput) linkInput.value = '';
        });
    }

    // Obsługa przycisku "Start"
    if (startButton) {
        startButton.addEventListener('click', (event) => {
            chrome.runtime.sendMessage({ action: 'startTimer' }, (response) => {
                if (response && response.status === 'success') {
                    console.log('Timer start time updated');
                    manageTimerUpdate(); // Przenieś tutaj aktualizację timera po otrzymaniu potwierdzenia
                }
            });

            event.preventDefault(); // Zapobieganie domyślnej akcji (przesyłanie formularza)

            const link = linkInput?.value || '';
            if (link) {
                console.log('Link is valid, saving and opening it');
                chrome.storage.local.set({ 'savedLink': link }, () => {
                    window.open(link, '_blank');
                });
            } else {
                console.log('Link is empty, showing alert');
                alert('Proszę podać link.');
            }
        });
    }

    // Obsługa checkboxa Dark mode
    if (darkModeCheckbox) {
        darkModeCheckbox.addEventListener('change', () => toggleMode());
    }

    // Funkcja przełączania trybu ciemnego
    function toggleMode(isDarkMode = null) {
        const rootElement = document.documentElement;
        const isDarkModeEnabled = isDarkMode !== null ? isDarkMode : darkModeCheckbox?.checked;

        if (isDarkModeEnabled) {
            rootElement.classList.add('dark-mode');
        } else {
            rootElement.classList.remove('dark-mode');
        }
    }

    // Przycisk zapisu
    if (saveButton) {
        saveButton.addEventListener('click', () => {
            const darkMode = darkModeCheckbox?.checked ?? false;
            const timer = timerCheckbox?.checked ?? false;
            const username = usernameInput?.value ?? '';
            const password = passwordInput?.value ?? '';
            chrome.storage.local.set({
                'darkMode': darkMode,
                'timer': timer,
                'username': username,
                'password': password
            }, () => {
                console.log('Settings saved:', { darkMode, timer, username, password });
                toggleMode(darkMode); // Zastosuj tryb ciemny na podstawie zapisanych ustawień
            });
        });
    }

    // Funkcja aktualizacji timera
    function manageTimerUpdate() {
        chrome.storage.local.get(['startDate', 'timer', 'savedLink'], function (result) {
            const savedStartTime = result.startDate;
            const timerEnabled = result.timer === true;
            const savedLink = result.savedLink;

            if (timerEnabled && savedStartTime && savedLink) {
                startTimerUpdate(savedStartTime);
            } else {
                stopTimerUpdate();
            }
        });
    }

    // Funkcja rozpoczęcia aktualizacji timera
    let timerIntervalId = null;

    function startTimerUpdate(savedStartTime) {
        if (!timerIntervalId) {  // Sprawdź, czy interwał nie jest już ustawiony
            timerIntervalId = setInterval(function () {
                const currentTime = new Date().getTime();
                const timeElapsed = currentTime - savedStartTime;
    
                const hours = Math.floor(timeElapsed / (1000 * 60 * 60));
                const minutes = Math.floor((timeElapsed % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((timeElapsed % (1000 * 60)) / 1000);
    
                // Formatowanie w stylu hh:mm:ss
                const formattedTime = 
                    String(hours).padStart(2, '0') + ':' + 
                    String(minutes).padStart(2, '0') + ':' + 
                    String(seconds).padStart(2, '0');
                
                timerDisplay.textContent = formattedTime; // Aktualizowanie wyświetlacza timera
    
            }, 1000);
            console.log('Timer updater initiated');
        }
    }

    // Funkcja zatrzymania aktualizacji timera
    function stopTimerUpdate() {
        if (timerIntervalId) {
            clearInterval(timerIntervalId);
            timerIntervalId = null;
            timerDisplay.textContent = ''; // Zresetuj wyświetlacz po zatrzymaniu timera
            console.log('Timer updater stopped');
        }
    }

    console.log('Event listeners added');
}

// Inicjalizacja aplikacji
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded and parsed');
    loadPage('mainpage.html');
});
