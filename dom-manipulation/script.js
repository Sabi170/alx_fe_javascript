// This is the single, combined script for the entire project.

// --- INITIAL STATE & CONSTANTS ---
let quotes = [
    { text: "The only way to do great work is to love what you do.", category: "Inspiration"},
    { text: "Innovation distinguishes between a leader and a follower.", category: "Technology"},
    { text: "Strive not to be a success, but rather to be a value.", category: "Life"},
    { text: "Accept challenges because they not only make you stronger but wiser.", category: "Motivation"}
];

const serverUrl = 'https://jsonplaceholder.typicode.com/posts'; // Mock API

// --- DOM ELEMENT REFERENCES ---
const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteButton = document.getElementById('newQuote');
const newQuoteText = document.getElementById('newQuoteText');
const newQuoteCategory = document.getElementById('newQuoteCategory');
const categoryFilter = document.getElementById('categoryFilter');
const syncStatus = document.getElementById('syncStatus'); // For UI notifications

// --- SINGLE DOMContentLoaded LISTENER ---
// This runs once after the HTML is fully loaded. It's the starting point of the app.
document.addEventListener('DOMContentLoaded', () => {
    loadQuotes();
    populateCategories();
    filterQuotes(); // Display initial quote
    syncQuotesWithServer(); // Initial sync with the server
    setInterval(syncQuotesWithServer, 60000); // Periodically sync every 60 seconds
});


// --- FUNCTION DEFINITIONS ---

/**
 * Displays a random quote from a given array.
 * @param {Array} quotesToShow The array of quotes to display from.
 */
function displayRandomQuote(quotesToShow) {
    if (!quotesToShow || quotesToShow.length === 0) {
        quoteDisplay.innerHTML = '<p>No quotes available for this category.</p>';
        return;
    }
    const randomIndex = Math.floor(Math.random() * quotesToShow.length);
    const randomQuote = quotesToShow[randomIndex];
    quoteDisplay.innerHTML = `<p>"${randomQuote.text}"</p><em>- ${randomQuote.category}</em>`;
}

/**
 * The single, complete addQuote function that handles everything.
 */
function addQuote() {
    const text = newQuoteText.value.trim();
    const category = newQuoteCategory.value.trim();

    if (text && category) {
        const newQuote = { text, category };
        quotes.push(newQuote);

        // Perform all necessary actions
        saveQuotes();         // Save to local storage
        populateCategories(); // Update the dropdown with new categories
        postQuoteToServer(newQuote); // Send to the server
        filterQuotes();       // Update the displayed quote

        // Clear input fields
        newQuoteText.value = '';
        newQuoteCategory.value = '';

        updateSyncStatus('Quote added and sent to server.', true);
    } else {
        alert('Please enter both a quote and a category.');
    }
}

/**
 * Saves the current 'quotes' array to local storage.
 */
function saveQuotes() {
    localStorage.setItem('quotes', JSON.stringify(quotes));
}

/**
 * Loads quotes from local storage when the app starts.
 */
function loadQuotes() {
    const storedQuotes = localStorage.getItem('quotes');
    if (storedQuotes) {
        quotes = JSON.parse(storedQuotes);
    }
}

/**
 * Exports quotes to a downloadable JSON file.
 */
function exportToJsonFile() {
    const jsonString = JSON.stringify(quotes, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'quotes.json';
    document.body.appendChild(a); // Corrected: dot instead of comma
    a.click();
    document.body.removeChild(a);
}

/**
 * Imports quotes from a selected JSON file.
 */
function importFromJsonFile(event) {
    const file = event.target.files[0];
    if (!file) return;

    const fileReader = new FileReader();
    // Corrected: use the instance 'fileReader', not the class 'FileReader'
    fileReader.onload = function(e) {
        try {
            const importedQuotes = JSON.parse(e.target.result);
            quotes.push(...importedQuotes);
            saveQuotes();
            populateCategories(); // Re-populate categories after import
            alert('Quotes imported successfully!');
        } catch (error) {
            alert('Error reading or parsing the JSON file.');
        }
    };
    fileReader.readAsText(file);
}

/**
 * Populates the category filter dropdown from the quotes array.
 */
function populateCategories() {
    const categories = ['all', ...new Set(quotes.map(quote => quote.category))];
    categoryFilter.innerHTML = ''; // Clear existing options
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category.charAt(0).toUpperCase() + category.slice(1);
        categoryFilter.appendChild(option);
    });

    const lastFilter = localStorage.getItem('lastFilter');
    if (lastFilter && categories.includes(lastFilter)) {
        categoryFilter.value = lastFilter;
    }
}

/**
 * Filters quotes based on the selected category and displays one.
 */
function filterQuotes() {
    const selectedCategory = categoryFilter.value;
    localStorage.setItem('lastFilter', selectedCategory);

    const filteredQuotes = selectedCategory === 'all'
        ? quotes
        : quotes.filter(quote => quote.category === selectedCategory);

    displayRandomQuote(filteredQuotes);
}

/**
 * Fetches quotes from the server and resolves conflicts.
 */
async function syncQuotesWithServer() {
    try {
        updateSyncStatus('Syncing with server...');
        const response = await fetch(serverUrl);
        const serverData = await response.json();

        const serverQuotes = serverData.slice(0, 10).map(post => ({
            text: post.title,
            category: 'Server'
        }));

        // Conflict Resolution: Add server quotes if they are not already present locally.
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
            updateSyncStatus(`${newQuotesAdded} new quotes synced from the server.`, true);
        } else {
            updateSyncStatus('Your quotes are up to date.', true);
        }
    } catch (error) {
        console.error('Error fetching quotes from server:', error);
        updateSyncStatus('Failed to sync with server.', true, true);
    }
}

/**
 * Posts a newly added quote to the server.
 * @param {object} quote The quote object to post.
 */
async function postQuoteToServer(quote) {
    try {
        await fetch(serverUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: quote.text, body: quote.category, userId: 1 }),
        });
        console.log('Quote posted to server:', quote);
    } catch (error) {
        console.error('Error posting quote to server:', error);
        updateSyncStatus('Failed to post new quote to server.', true, true);
    }
}

/**
 * Displays a message in the sync status UI element.
 */
function updateSyncStatus(message, autoClear = false, isError = false) {
    syncStatus.textContent = message;
    syncStatus.style.color = isError ? 'red' : 'green';
    syncStatus.style.display = 'block';

    if (autoClear) {
        setTimeout(() => {
            syncStatus.style.display = 'none';
        }, 4000);
    }
}

// --- EVENT LISTENERS ---
// The "Show New Quote" button should always respect the current filter.
newQuoteButton.addEventListener('click', filterQuotes);
