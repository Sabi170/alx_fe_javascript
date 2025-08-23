// --- Wait for the entire HTML page to load before running any script ---
document.addEventListener('DOMContentLoaded', () => {

    // --- STATE MANAGEMENT ---
    let quotes = [
        { text: "The only way to do great work is to love what you do.", category: "Inspiration" },
        { text: "Innovation distinguishes between a leader and a follower.", category: "Technology" }
    ];
    const serverUrl = 'https://jsonplaceholder.typicode.com/posts';

    // --- DOM ELEMENT REFERENCES ---
    // Get references to all the HTML elements we need to interact with.
    const quoteDisplay = document.getElementById('quoteDisplay');
    const newQuoteButton = document.getElementById('newQuoteButton');
    const addQuoteButton = document.getElementById('addQuoteButton');
    const newQuoteText = document.getElementById('newQuoteText');
    const newQuoteCategory = document.getElementById('newQuoteCategory');
    const categoryFilter = document.getElementById('categoryFilter');
    const syncStatus = document.getElementById('syncStatus');
    const exportButton = document.getElementById('exportButton');
    const importButton = document.getElementById('importButton');
    const importFile = document.getElementById('importFile');

    // --- FUNCTIONS ---

    const displayRandomQuote = (quotesToShow) => {
        if (!quotesToShow || quotesToShow.length === 0) {
            quoteDisplay.innerHTML = '<p>No quotes found for this category.</p>';
            return;
        }
        const randomIndex = Math.floor(Math.random() * quotesToShow.length);
        const { text, category } = quotesToShow[randomIndex];
        quoteDisplay.innerHTML = `<p>"${text}"</p><em>- ${category}</em>`;
    };

    const filterQuotes = () => {
        const selectedCategory = categoryFilter.value;
        localStorage.setItem('lastFilter', selectedCategory);
        const filtered = selectedCategory === 'all' ? quotes : quotes.filter(q => q.category === selectedCategory);
        displayRandomQuote(filtered);
    };

    const saveQuotes = () => {
        localStorage.setItem('quotes', JSON.stringify(quotes));
    };

    const populateCategories = () => {
        const uniqueCategories = ['all', ...new Set(quotes.map(q => q.category))];
        categoryFilter.innerHTML = '';
        uniqueCategories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categoryFilter.appendChild(option);
        });
        const lastFilter = localStorage.getItem('lastFilter');
        if (lastFilter && uniqueCategories.includes(lastFilter)) {
            categoryFilter.value = lastFilter;
        }
    };

    const addQuote = () => {
        const text = newQuoteText.value.trim();
        const category = newQuoteCategory.value.trim();
        if (text && category) {
            quotes.push({ text, category });
            saveQuotes();
            populateCategories();
            postQuoteToServer({ text, category });
            newQuoteText.value = '';
            newQuoteCategory.value = '';
            updateSyncStatus('Quote added successfully!', true);
            filterQuotes();
        } else {
            alert('Please fill in both fields.');
        }
    };

    const updateSyncStatus = (message, isSuccess) => {
        syncStatus.textContent = message;
        syncStatus.style.backgroundColor = isSuccess ? '#28a745' : '#dc3545';
        syncStatus.style.color = 'white';
        syncStatus.style.display = 'block';
        setTimeout(() => { syncStatus.style.display = 'none'; }, 3000);
    };

    // --- PART 3: SERVER SYNC FUNCTIONS ---
    const syncQuotesWithServer = async () => {
        try {
            const response = await fetch(serverUrl);
            const serverData = await response.json();
            const serverQuotes = serverData.slice(0, 10).map(p => ({ text: p.title, category: 'Server' }));

            let newQuotesAdded = 0;
            serverQuotes.forEach(serverQuote => {
                if (!quotes.some(localQuote => localQuote.text === serverQuote.text)) {
                    quotes.push(serverQuote);
                    newQuotesAdded++;
                }
            });

            if (newQuotesAdded > 0) {
                saveQuotes();
                populateCategories();
                filterQuotes();
                updateSyncStatus(`${newQuotesAdded} new quotes synced from server.`, true);
            }
        } catch (error) {
            updateSyncStatus('Failed to sync with server.', false);
        }
    };

    const postQuoteToServer = async (quote) => {
        try {
            await fetch(serverUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: quote.text, body: quote.category, userId: 1 }),
            });
        } catch (error) {
            console.error('Failed to post quote:', error);
        }
    };

    // --- PART 1: IMPORT/EXPORT FUNCTIONS ---
    const exportToJsonFile = () => {
        const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'quotes.json';
        a.click();
        URL.revokeObjectURL(url);
    };

    const importFromJsonFile = (event) => {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedQuotes = JSON.parse(e.target.result);
                quotes.push(...importedQuotes);
                saveQuotes();
                populateCategories();
                filterQuotes();
                alert('Quotes imported successfully!');
            } catch (error) {
                alert('Invalid JSON file.');
            }
        };
        reader.readAsText(file);
    };

    // --- EVENT LISTENERS ---
    newQuoteButton.addEventListener('click', filterQuotes);
    addQuoteButton.addEventListener('click', addQuote);
    exportButton.addEventListener('click', exportToJsonFile);
    importButton.addEventListener('click', () => importFile.click());
    importFile.addEventListener('change', importFromJsonFile);

    // --- INITIALIZATION ---
    // This is the code that runs when the application starts.
    const storedQuotes = localStorage.getItem('quotes');
    if (storedQuotes) {
        quotes = JSON.parse(storedQuotes);
    }
    populateCategories();
    filterQuotes();
    syncQuotesWithServer(); // Initial sync
    setInterval(syncQuotesWithServer, 60000); // Periodic sync every minute
});