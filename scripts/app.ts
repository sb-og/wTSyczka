// tsc scripts/app.ts
console.log('app.ts loaded');

// Funkcja ładowania zawartości HTML do strony
function loadPage(url: string): void {
    console.log('Loading page with URL:', url);
    fetch(url)
        .then(response => response.text())
        .then(data => {
            console.log('Page content fetched');
            const appElement = document.getElementById('app');
            if (appElement) {
                appElement.innerHTML = data;
            }
            addEventListeners(); // Dodaj nasłuchiwacze zdarzeń po załadowaniu zawartości
        })
        .catch(error => console.error('Error loading page:', error));
}

// Funkcja dodająca nasłuchiwacze zdarzeń do elementów interfejsu
function addEventListeners(): void {
    console.log('Adding event listeners');

    // Definiowanie zmiennych dla elementów
    const linkInput = document.getElementById('link') as HTMLInputElement | null;
    const timerDisplay = document.getElementById('timerDisplay') as HTMLElement | null;
    const openSettingsButton = document.getElementById('openSettings') as HTMLButtonElement | null;
    const backButton = document.getElementById('backButton') as HTMLButtonElement | null;
    const clearButton = document.getElementById('clearButton') as HTMLButtonElement | null;
    const startButton = document.getElementById('start') as HTMLButtonElement | null;

    const darkModeCheckbox = document.getElementById('darkModeCheckbox') as HTMLInputElement | null;
    const timerCheckbox = document.getElementById('timerCheckbox') as HTMLInputElement | null;
    const usernameInput = document.getElementById('usernameInput') as HTMLInputElement | null;
    const passwordInput = document.getElementById('passwordInput') as HTMLInputElement | null;
    const saveButton = document.getElementById('saveButton') as HTMLButtonElement | null;

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
            if (linkInput) {
                linkInput.value = result.savedLink;
            }
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
            // Ustawienie wartości 'savedLink' i 'startDate' na puste
            chrome.storage.local.set({
                'savedLink': '',
                'startDate': '',
            }, () => {
                console.log('Start time cleared');
                manageTimerUpdate();
            });

            // Czyszczenie pola linku, jeśli istnieje
            if (linkInput) linkInput.value = '';

            // Wyczyść 'isTabOpen', 'savedLink', i 'startDate'
            chrome.storage.local.remove(['isTabOpen', 'savedLink', 'startDate'], function () {
                console.log('isTabOpen, savedLink, and startDate cleared');
            });
        });
    }

    if (startButton) {
        startButton.addEventListener('click', (event: Event) => {
            event.preventDefault(); // Zapobieganie domyślnej akcji (przesyłanie formularza)
    
            const link = linkInput?.value || '';
            if (link) {
                console.log('Link is valid, sending message to background script');
                // Wyślij wiadomość do background.js, aby otworzył nową kartę
                chrome.runtime.sendMessage({ action: 'openNewTab', url: link }, (response) => {
                    if (response && response.status === 'success') {
                        console.log('Background script is handling the link.');
                        manageTimerUpdate(); // Przenieś tutaj aktualizację timera po otrzymaniu potwierdzenia
                    }
                });
            } else {
                console.log('Link is empty, showing alert');
                // Wstrzyknij prosty alert do aktywnej karty
                chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                    const activeTab = tabs[0];
                    if (activeTab.id !== undefined) { // Sprawdzanie, czy tabId nie jest undefined
                        chrome.scripting.executeScript({
                            target: { tabId: activeTab.id },
                            func: function () {
                                alert('Proszę wprowadzić link');
                            }
                        });
                    } else {
                        console.error('Nie można odnaleźć aktywnej karty.');
                    }
                });
            }
        });
    }

    // Obsługa checkboxa Dark mode
    if (darkModeCheckbox) {
        darkModeCheckbox.addEventListener('change', () => toggleMode());
    }

    // Funkcja przełączania trybu ciemnego
    function toggleMode(isDarkMode: boolean | null = null): void {
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
    function manageTimerUpdate(): void {
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
    let timerIntervalId: number | null = null;

    function startTimerUpdate(savedStartTime: number): void {
        if (!timerIntervalId) {  // Sprawdź, czy interwał nie jest już ustawiony
            timerIntervalId = window.setInterval(function () {
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

                if (timerDisplay) {
                    timerDisplay.textContent = formattedTime; // Aktualizowanie wyświetlacza timera
                }

            }, 300);
            console.log('Timer updater initiated');
        }
    }

    // Funkcja zatrzymania aktualizacji timera
    function stopTimerUpdate(): void {
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
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded and parsed');
    loadPage('mainpage.html');
});
