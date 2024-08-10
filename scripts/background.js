// Dodaj element menu kontekstowego
chrome.contextMenus.create({
    id: "menu-open-link",
    title: "Otwórz w sesji testowej",
    contexts: ["link"]  // Menu kontekstowe będzie dostępne tylko dla linków
});

// Obsłuż kliknięcie w menu kontekstowe
chrome.contextMenus.onClicked.addListener((item, tab) => {
    if (item.menuItemId === "menu-open-link") {
        console.log('Menu item clicked:', item);

        // Sprawdź, czy kliknięto na link
        if (item.linkUrl) {
            console.log('Link URL:', item.linkUrl);

            // Zapisz link w chrome.storage
            chrome.storage.local.set({ 'savedLink': item.linkUrl }, function () {
                console.log('Link saved in chrome.storage');
            });
            chrome.tabs.create({ url: item.linkUrl });
            startTimer();
        }
    }
});

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
    }
});
