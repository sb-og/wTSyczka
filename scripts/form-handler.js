document.addEventListener('DOMContentLoaded', function() {
    const linkInput = document.getElementById('link');
    const startButton = document.getElementById('start');

    // Wczytaj dane z localStorage
    const savedLink = localStorage.getItem('savedLink');
    if (savedLink) {
        linkInput.value = savedLink;
    }

    // Dodaj nasłuchiwacz kliknięcia
    startButton.addEventListener('click', function(event) {
        event.preventDefault(); // Dodaj to, aby zapobiec domyślnemu zachowaniu formularza
        const link = linkInput.value;
        if (link) {
            // Zapisz dane do localStorage
            localStorage.setItem('savedLink', link);
            // Otwórz link w nowej karcie
            chrome.tabs.create({ url: link });
        } else {
            alert('Proszę podać link.');
        }
    });
});