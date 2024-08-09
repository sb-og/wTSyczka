console.log('Combined script - app.js loaded');

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

    // Ładowanie danych z localStorage
    const savedLink = localStorage.getItem('savedLink');
    if (savedLink && linkInput) {
        console.log('Link loaded from localStorage:', savedLink);
        linkInput.value = savedLink;
    }

    // Przycisk czyszczenia
    if (clearButton) {
        clearButton.addEventListener('click', () => {
            localStorage.setItem('savedLink', '');
            if (linkInput) linkInput.value = '';
            // Ustawienie startDate na null w localStorage
            localStorage.setItem('startDate', '');
            console.log('Start time cleared');
            manageTimerInterval();
        });
    }

    // Obsługa przycisku "Start"
    if (startButton) {
        startButton.addEventListener('click', (event) => {
            startTimer();
            event.preventDefault(); // Zapobieganie domyślnej akcji (przesyłanie formularza)
            manageTimerInterval();
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

    // Obsługa timerDisplay
    let startTime = null;
    let timerIntervalId = null;

    function startTimer() {
        console.log('startTimer called');
        startTime = new Date();
        // Zapisz startTime do localStorage
        localStorage.setItem('startDate', startTime.getTime());
        console.log('Start time saved:', startTime);
    }

    function getElapsedTime(callback) {
        const savedStartTime = localStorage.getItem('startDate');
        const timerEnabled = localStorage.getItem('timer') === 'true';
        // Sprawdź, czy timer jest ustawiony na true
        if (timerEnabled) {
            if (!savedStartTime) {
                callback("Timer not started");
                return;
            }

            const currentTime = new Date();
            const elapsedTime = currentTime.getTime() - parseInt(savedStartTime, 10); // Czas w milisekundach

            // Przekształcanie czasu na godziny, minuty i sekundy
            const seconds = Math.floor((elapsedTime / 1000) % 60);
            const minutes = Math.floor((elapsedTime / (1000 * 60)) % 60);
            const hours = Math.floor((elapsedTime / (1000 * 60 * 60)) % 24);

            callback(hours + 'h ' + minutes + 'm ' + seconds + 's');
        } else {
            callback("Timer not running");
        }
    }

    function manageTimerInterval() {
        const savedLink = localStorage.getItem('savedLink');
        const timerEnabled = localStorage.getItem('timer') === 'true';

        if (savedLink && timerEnabled) {
            if (!timerIntervalId) {  // Sprawdź, czy interwał nie jest już ustawiony
                timerIntervalId = setInterval(function () {
                    getElapsedTime(function (elapsedTimeText) {
                        if (timerDisplay) {
                            timerDisplay.textContent = elapsedTimeText;
                        }
                    });
                }, 1000);
            }
        } else {
            if (timerIntervalId) {  // Sprawdź, czy interwał jest ustawiony
                clearInterval(timerIntervalId);
                timerIntervalId = null;
                // Czyść wyświetlanie timera, gdy jest wyłączony
                if (timerDisplay) {
                    timerDisplay.textContent = '';
                }
            }
            console.log('Link is not present in localStorage or timer is not enabled');
        }
    }

    // Wywołanie funkcji zarządzającej timerem
    manageTimerInterval();

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

    // Wczytanie zapisanych ustawień
    const darkMode = localStorage.getItem('darkMode') === 'true';
    const timer = localStorage.getItem('timer') === 'true';
    const username = localStorage.getItem('username') || '';
    const password = localStorage.getItem('password') || '';

    if (darkModeCheckbox) darkModeCheckbox.checked = darkMode;
    if (timerCheckbox) timerCheckbox.checked = timer;
    if (usernameInput) usernameInput.value = username;
    if (passwordInput) passwordInput.value = password;

    toggleMode(darkMode);

    // Przycisk zapisu
    if (saveButton) {
        saveButton.addEventListener('click', () => {
            const darkMode = darkModeCheckbox?.checked ?? false;
            const timer = timerCheckbox?.checked ?? false;
            const username = usernameInput?.value ?? '';
            const password = passwordInput?.value ?? '';
            localStorage.setItem('darkMode', darkMode);
            localStorage.setItem('timer', timer);
            localStorage.setItem('username', username);
            localStorage.setItem('password', password);
            console.log('Settings saved:', { darkMode, timer, username, password });
            toggleMode(darkMode); // Zastosuj tryb ciemny na podstawie zapisanych ustawień
        });
    }

    console.log('Event listeners added');
}

// Inicjalizacja aplikacji
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded and parsed');
    loadPage('mainpage.html');
});
