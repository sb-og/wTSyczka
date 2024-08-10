// Dodaj element menu kontekstowego
chrome.contextMenus.create({
    id: "menu-open-link",
    title: "Track test session",
    contexts: ["link"]  // Menu kontekstowe będzie dostępne tylko dla linków
});

// Obsłuż kliknięcie w menu kontekstowe
chrome.contextMenus.onClicked.addListener((item, tab) => {
    if (item.menuItemId === "menu-open-link") {
        console.log('Menu item clicked:', item);

        // Sprawdź, czy kliknięto na link
        if (item.linkUrl) {
            console.log('Link URL:', item.linkUrl);
            // Otwórz nową kartę i uruchom timer
            openNewTab(item.linkUrl);
        }
    }
});

// Funkcja otwierająca nową kartę i zapisująca zmienną isTabOpen
function openNewTab(url) {
    chrome.storage.local.get('isTabOpen', function (result) {
        let tabOpen = result.isTabOpen;
        if (!tabOpen) {
            chrome.tabs.create({ url: url }, function (tab) {
                console.log('New tab opened:', tab);
                // Zapisz link w chrome.storage
                chrome.storage.local.set({ 'savedLink': url }, function () {
                    console.log('Link saved in chrome.storage');
                });
                // Zapisz informację o otwarciu karty
                chrome.storage.local.set({ 'isTabOpen': true }, function () {
                    console.log('isTabOpen set to true');
                });
                // Uruchom timer po otwarciu karty
                startTimer();

                // Monitoruj zamknięcie karty
                chrome.tabs.onRemoved.addListener(function closedTabListener(tabId, removeInfo) {
                    if (tabId === tab.id) {
                        console.log('Tab closed:', tab);

                        // Wyczyść isTabOpen, savedLink, i startDate, gdy karta jest zamknięta
                        chrome.storage.local.remove(['isTabOpen', 'savedLink', 'startDate'], function () {
                            console.log('isTabOpen, savedLink, and startDate cleared');
                        });

                        // Usuń listener, aby nie nasłuchiwać ponownie dla innych kart
                        chrome.tabs.onRemoved.removeListener(closedTabListener);
                    }
                });

            });
        } else {
            // Wstrzyknij prosty alert do aktywnej karty
            chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                chrome.scripting.executeScript({
                    target: { tabId: tabs[0].id },
                    func: function () {
                        alert('Sesja jest już rozpoczęta');
                    }
                });
            });
        }
    });
}

// Timer functionality
function startTimer() {
    console.log('startTimer called');
    const startTime = new Date().getTime();
    // Zapisz startTime do chrome.storage.local
    chrome.storage.local.set({ 'startDate': startTime }, () => {
        console.log('Start time saved:', startTime);
    });
    // Powiadom app.js, że timer został uruchomiony
    chrome.runtime.sendMessage({ action: 'timerStarted' });
}


// Nasłuchiwanie wiadomości od app.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Received message:', request);
    if (request.action === 'startTimer') {
        startTimer();
        sendResponse({ status: 'success' });
    } else if (request.action === 'openNewTab') {
        openNewTab(request.url, sendResponse);
        // Aby asynchronicznie wysłać odpowiedź, musimy zwrócić true w listenerze
        return true;
    }
});
