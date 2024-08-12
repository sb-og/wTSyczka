console.log('app.ts loaded');
// Funkcja ładowania zawartości HTML do strony
function loadPage(url) {
    console.log('Loading page with URL:', url);
    fetch(url)
        .then(function (response) { return response.text(); })
        .then(function (data) {
        console.log('Page content fetched');
        var appElement = document.getElementById('app');
        if (appElement) {
            appElement.innerHTML = data;
        }
        addEventListeners(); // Dodaj nasłuchiwacze zdarzeń po załadowaniu zawartości
    })
        .catch(function (error) { return console.error('Error loading page:', error); });
}
// Funkcja dodająca nasłuchiwacze zdarzeń do elementów interfejsu
function addEventListeners() {
    console.log('Adding event listeners');
    // Definiowanie zmiennych dla elementów
    var linkInput = document.getElementById('link');
    var timerDisplay = document.getElementById('timerDisplay');
    var openSettingsButton = document.getElementById('openSettings');
    var backButton = document.getElementById('backButton');
    var clearButton = document.getElementById('clearButton');
    var startButton = document.getElementById('start');
    var darkModeCheckbox = document.getElementById('darkModeCheckbox');
    var timerCheckbox = document.getElementById('timerCheckbox');
    var usernameInput = document.getElementById('usernameInput');
    var passwordInput = document.getElementById('passwordInput');
    var saveButton = document.getElementById('saveButton');
    // Obsługa przycisku otwierającego ustawienia
    if (openSettingsButton) {
        openSettingsButton.addEventListener('click', function () {
            console.log('Open Settings button clicked');
            loadPage('settings.html');
        });
    }
    // Obsługa przycisku powrotu do strony głównej
    if (backButton) {
        backButton.addEventListener('click', function () {
            console.log('Back button clicked');
            loadPage('mainpage.html');
        });
    }
    // Obsługa menu kontekstowego
    chrome.storage.local.get('savedLink', function (result) {
        if (result.savedLink) {
            console.log('Link loaded from chrome.storage:', result.savedLink);
            if (linkInput) {
                linkInput.value = result.savedLink;
            }
            manageTimerUpdate();
        }
        else {
            console.log('No link found in chrome.storage');
        }
    });
    // Ładowanie danych z chrome.storage.local
    chrome.storage.local.get(['savedLink', 'startDate', 'timer', 'darkMode', 'username', 'password'], function (result) {
        var savedLink = result.savedLink || '';
        var darkMode = result.darkMode === true;
        var timer = result.timer === true;
        var username = result.username || '';
        var password = result.password || '';
        if (linkInput) {
            linkInput.value = savedLink;
            console.log('Link loaded from chrome.storage:', savedLink);
        }
        if (darkModeCheckbox)
            darkModeCheckbox.checked = darkMode;
        if (timerCheckbox)
            timerCheckbox.checked = timer;
        if (usernameInput)
            usernameInput.value = username;
        if (passwordInput)
            passwordInput.value = password;
        toggleMode(darkMode);
    });
    // Przycisk czyszczenia
    if (clearButton) {
        clearButton.addEventListener('click', function () {
            // Ustawienie wartości 'savedLink' i 'startDate' na puste
            chrome.storage.local.set({
                'savedLink': '',
                'startDate': '',
            }, function () {
                console.log('Start time cleared');
                manageTimerUpdate();
            });
            // Czyszczenie pola linku, jeśli istnieje
            if (linkInput)
                linkInput.value = '';
            // Wyczyść 'isTabOpen', 'savedLink', i 'startDate'
            chrome.storage.local.remove(['isTabOpen', 'savedLink', 'startDate'], function () {
                console.log('isTabOpen, savedLink, and startDate cleared');
            });
        });
    }
    if (startButton) {
        startButton.addEventListener('click', function (event) {
            event.preventDefault(); // Zapobieganie domyślnej akcji (przesyłanie formularza)
            var link = (linkInput === null || linkInput === void 0 ? void 0 : linkInput.value) || '';
            if (link) {
                console.log('Link is valid, sending message to background script');
                // Wyślij wiadomość do background.js, aby otworzył nową kartę
                chrome.runtime.sendMessage({ action: 'openNewTab', url: link }, function (response) {
                    if (response && response.status === 'success') {
                        console.log('Background script is handling the link.');
                        manageTimerUpdate(); // Przenieś tutaj aktualizację timera po otrzymaniu potwierdzenia
                    }
                });
            }
            else {
                console.log('Link is empty, showing alert');
                // Wstrzyknij prosty alert do aktywnej karty
                chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                    var activeTab = tabs[0];
                    if (activeTab.id !== undefined) { // Sprawdzanie, czy tabId nie jest undefined
                        chrome.scripting.executeScript({
                            target: { tabId: activeTab.id },
                            func: function () {
                                alert('Proszę wprowadzić link');
                            }
                        });
                    }
                    else {
                        console.error('Nie można odnaleźć aktywnej karty.');
                    }
                });
            }
        });
    }
    // Obsługa checkboxa Dark mode
    if (darkModeCheckbox) {
        darkModeCheckbox.addEventListener('change', function () { return toggleMode(); });
    }
    // Funkcja przełączania trybu ciemnego
    function toggleMode(isDarkMode) {
        if (isDarkMode === void 0) { isDarkMode = null; }
        var rootElement = document.documentElement;
        var isDarkModeEnabled = isDarkMode !== null ? isDarkMode : darkModeCheckbox === null || darkModeCheckbox === void 0 ? void 0 : darkModeCheckbox.checked;
        if (isDarkModeEnabled) {
            rootElement.classList.add('dark-mode');
        }
        else {
            rootElement.classList.remove('dark-mode');
        }
    }
    // Przycisk zapisu
    if (saveButton) {
        saveButton.addEventListener('click', function () {
            var _a, _b, _c, _d;
            var darkMode = (_a = darkModeCheckbox === null || darkModeCheckbox === void 0 ? void 0 : darkModeCheckbox.checked) !== null && _a !== void 0 ? _a : false;
            var timer = (_b = timerCheckbox === null || timerCheckbox === void 0 ? void 0 : timerCheckbox.checked) !== null && _b !== void 0 ? _b : false;
            var username = (_c = usernameInput === null || usernameInput === void 0 ? void 0 : usernameInput.value) !== null && _c !== void 0 ? _c : '';
            var password = (_d = passwordInput === null || passwordInput === void 0 ? void 0 : passwordInput.value) !== null && _d !== void 0 ? _d : '';
            chrome.storage.local.set({
                'darkMode': darkMode,
                'timer': timer,
                'username': username,
                'password': password
            }, function () {
                console.log('Settings saved:', { darkMode: darkMode, timer: timer, username: username, password: password });
                toggleMode(darkMode); // Zastosuj tryb ciemny na podstawie zapisanych ustawień
            });
        });
    }
    // Funkcja aktualizacji timera
    function manageTimerUpdate() {
        chrome.storage.local.get(['startDate', 'timer', 'savedLink'], function (result) {
            var savedStartTime = result.startDate;
            var timerEnabled = result.timer === true;
            var savedLink = result.savedLink;
            if (timerEnabled && savedStartTime && savedLink) {
                startTimerUpdate(savedStartTime);
            }
            else {
                stopTimerUpdate();
            }
        });
    }
    // Funkcja rozpoczęcia aktualizacji timera
    var timerIntervalId = null;
    function startTimerUpdate(savedStartTime) {
        if (!timerIntervalId) { // Sprawdź, czy interwał nie jest już ustawiony
            timerIntervalId = window.setInterval(function () {
                var currentTime = new Date().getTime();
                var timeElapsed = currentTime - savedStartTime;
                var hours = Math.floor(timeElapsed / (1000 * 60 * 60));
                var minutes = Math.floor((timeElapsed % (1000 * 60 * 60)) / (1000 * 60));
                var seconds = Math.floor((timeElapsed % (1000 * 60)) / 1000);
                // Formatowanie w stylu hh:mm:ss
                var formattedTime = String(hours).padStart(2, '0') + ':' +
                    String(minutes).padStart(2, '0') + ':' +
                    String(seconds).padStart(2, '0');
                if (timerDisplay) {
                    timerDisplay.textContent = formattedTime; // Aktualizowanie wyświetlacza timera
                }
            }, 300);
            console.log('Timer updater initiated');
        }
    }
    // Funkcja zatrzymania aktualizacji timera
    function stopTimerUpdate() {
        if (timerIntervalId) {
            clearInterval(timerIntervalId);
            timerIntervalId = null;
            if (timerDisplay) {
                timerDisplay.textContent = ''; // Zresetuj wyświetlacz po zatrzymaniu timera
            }
            console.log('Timer updater stopped');
        }
    }
    console.log('Event listeners added');
}
// Inicjalizacja aplikacji
document.addEventListener('DOMContentLoaded', function () {
    console.log('DOM fully loaded and parsed');
    loadPage('mainpage.html');
});
