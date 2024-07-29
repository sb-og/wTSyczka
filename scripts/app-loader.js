// scripts/app-loader.js

document.addEventListener('DOMContentLoaded', function() {
    // Funkcja do załadowania zawartości HTML
    function loadPage(url) {
        fetch(url)
            .then(response => response.text())
            .then(data => {
                document.getElementById('app').innerHTML = data;
                
                // Po załadowaniu nowej zawartości, dodaj zdarzenia do przycisków
                addEventListeners();
            })
            .catch(error => console.error('Error loading page:', error));
    }

    // Funkcja do dodawania zdarzeń do przycisków
    function addEventListeners() {
        const openSettingsButton = document.getElementById('openSettings');
        if (openSettingsButton) {
            openSettingsButton.addEventListener('click', function() {
                loadPage('settings.html');
            });
        }

        const backButton = document.getElementById('backButton');
        if (backButton) {
            backButton.addEventListener('click', function() {
                loadPage('mainpage.html');
            });
        }
    }

    // Załaduj domyślną stronę (mainpage.html)
    loadPage('mainpage.html');
});
