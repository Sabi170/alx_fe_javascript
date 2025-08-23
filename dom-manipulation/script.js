// This event listener ensures that the script runs only after the entire HTML document has been loaded.
document.addEventListener('DOMContentLoaded', () => {
    // Load any saved quotes from local storage first.
    loadQuotes();
    // Populate the category dropdown with existing categories.
    populateCategories();
    // Display an initial quote based on the last selected filter (or 'all').
    filterQuotes();
    
    // --- SERVER SYNC (PART 3) ---
    // Perform an initial sync with the server as soon as the page loads.
    syncQuotesWithServer();
    // Set up a recurring sync with the server every 30 seconds (30000 milliseconds).
    setInterval(syncQuotesWithServer, 30000);
});

// --- STATE AND CONSTANTS ---

// The main array holding all quote objects. It starts with a few default quotes.
let quotes = [
    { text: "The only way to do great work is to love what you do.", category: "Inspiration" },
    { text: "Innovation distinguishes between a leader and a follower.", category: "Technology" },
    { text: "Your time is limited, so don’t waste it living someone else’s life.", category: "Life" }
];

// The URL for the mock server API.
const serverUrl = 'https://jsonplaceholder.typicode.com/posts';

// --- DOM ELEMENTS ---

// References to the HTML elements we will interact with.
const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteButton = document.getElementById('newQuote');
const newQuoteText = document.getElementById('newQuoteText');
const newQuoteCategory = document.getElementById('newQuoteCategory');
const categoryFilter = document.getElementById('categoryFilter');
const syncStatus = document.getElementById('syncStatus'); // For UI notifications

// --- CORE DISPLAY AND INTERACTION FUNCTIONS (Parts 0 & 2) ---

/**
 * Displays a random quote from a given array of quotes.
 * @param {Array} quotesToShow - The array of quotes to choose from.
 */
function displayRandomQuote(quotesToShow) {
    if (!quotesToShow || quotesToShow.length === 0) {
        quoteDisplay.innerHTML = '<p>No quotes available for this category. Add one!</p>';
        return;
    }
    const randomIndex = Math.floor(Math.random() * quotesToShow.length);
    const randomQuote = quotesToShow[randomIndex];
    quoteDisplay.innerHTML = `<p>"${randomQuote.text}"</p><em>- ${randomQuote.category}</em>`;
}

/**
 * Adds a new quote from the input fields to the local 'quotes' array.
 */
function addQuote() {
    const text = newQuoteText.value.trim();
    const category = newQuoteCategory.value.trim();

    if (text && category) {
        const newQuote = { text, category };
        quotes.push(newQuote);
        
        // Update everything: save to local storage, repopulate categories, update the display, and send to server.
        saveQuotes();
        populateCategories();
        filterQuotes();
        postQuoteToServer(newQuote);

        // Clear the input fields.
        newQuoteText.value = '';
        newQuoteCategory.value = '';
    } else {
        alert('Please enter both a quote and a category.');
    }
}

/**
 * Populates the category filter dropdown with unique categories from the 'quotes' array.
 */
function populateCategories() {
    const currentFilter = categoryFilter.value;
    const categories = ['all', ...new Set(quotes.map(quote => quote.category))];
    
    categoryFilter.innerHTML = ''; // Clear old options
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category.charAt(0).toUpperCase() + category.slice(1);
        categoryFilter.appendChild(option);
    });

    // Restore the previously selected filter if it still exists.
    categoryFilter.value = categories.includes(currentFilter) ? currentFilter : 'all';
}

/**
 * Filters the quotes based on the selected category and displays a random one.
 */
function filterQuotes() {
    const selectedCategory = categoryFilter.value;
    localStorage.setItem('lastFilter', selectedCategory); // Save the user's choice.
    
    const filtered = selectedCategory === 'all'
        ? quotes
        : quotes.filter(quote => quote.category === selectedCategory);
        
    displayRandomQuote(filtered);
}

// --- WEB STORAGE & JSON FUNCTIONS (Part 1) ---

/**
 * Saves the current 'quotes' array to the browser's local storage.
 */
function saveQuotes() {
    localStorage.setItem('quotes', JSON.stringify(quotes));
}

/**
 * Loads quotes from local storage into the 'quotes' array.
 */
function loadQuotes() {
    const storedQuotes = localStorage.getItem('quotes');
    if (storedQuotes) {
        quotes = JSON.parse(storedQuotes);
    }
}

/**
 * Exports the current quotes array as a downloadable JSON file.
 */
function exportToJsonFile() {
    const jsonString = JSON.stringify(quotes, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'quotes.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

/**
 * Imports quotes from a user-selected JSON file.
 */
function importFromJsonFile(event) {
    const fileReader = new FileReader();
    fileReader.onload = function(e) {
        try {
            const importedQuotes = JSON.parse(e.target.result);
            // Add only new quotes to avoid duplicates.
            importedQuotes.forEach(importedQuote => {
                if (!quotes.some(q => q.text === importedQuote.text)) {
                    quotes.push(importedQuote);
                }
            });
            saveQuotes();
            populateCategories();
            filterQuotes();
            alert('Quotes imported successfully!');
        } catch (error) {
            alert('Error reading or parsing the JSON file.');
        }
    };
    fileReader.readAsText(event.target.files[0]);
}

// --- SERVER SYNC & CONFLICT RESOLUTION (Part 3) ---

/**
 * Fetches quotes from the server and syncs them with the local data.
 */
async function syncQuotesWithServer() {
    try {
        updateSyncStatus('Syncing with server...');
        const response = await fetch(serverUrl);
        const serverData = await response.json();

        // Format server data into our quote structure (using a slice for demo purposes).
        const serverQuotes = serverData.slice(0, 10).map(post => ({
            text: post.title,
            category: 'Server'
        }));

        // Conflict Resolution: Add server quotes only if they don't already exist locally.
        let newQuotesAdded = 0;
        serverQuotes.forEach(serverQuote => {
            const isDuplicate = quotes.some(localQuote => localQuote.text === serverQuote.text);
            if (!isDuplicate) {
                quotes.push(serverQuote);
                newQuotesAdded++;
            }
        });

        if (newQuotesAdded > 0) {
            updateSyncStatus(`${newQuotesAdded} new quotes synced from the server.`, true);
            saveQuotes();
            populateCategories();
            filterQuotes();
        } else {
            updateSyncStatus('Local data is up to date.', true);
        }

    } catch (error) {
        updateSyncStatus('Failed to sync with server.', true, true);
        console.error('Sync error:', error);
    }
}

/**
 * Posts a new quote to the server.
 * @param {Object} quote - The quote object to post.
 */
async function postQuoteToServer(quote) {
    try {
        await fetch(serverUrl, {
            method: 'POST',
            body: JSON.stringify({ title: quote.text, body: quote.category, userId: 1 }),
            headers: { 'Content-type': 'application/json; charset=UTF-8' },
        });
        updateSyncStatus(`Quote sent to server.`, true);
    } catch (error) {
        updateSyncStatus(`Failed to send quote to server.`, true, true);
        console.error('Post error:', error);
    }
}

/**
 * Updates the UI notification element with a status message.
 * @param {String} message - The message to display.
 * @param {Boolean} autoClear - Whether the message should disappear after a few seconds.
 * @param {Boolean} isError - Whether to style the message as an error.
 */
function updateSyncStatus(message, autoClear = false, isError = false) {
    syncStatus.textContent = message;
    syncStatus.style.color = isError ? 'red' : 'green';
    syncStatus.style.display = 'block';

    if (autoClear) {
        setTimeout(() => {
            syncStatus.style.display = 'none';
        }, 3000); // Hide message after 3 seconds.
    }
}

// --- EVENT LISTENERS ---

// The "Show New Quote" button should filter and display a quote.
newQuoteButton.addEventListener('click', filterQuotes);

// Note: The onchange/onclick events for other elements are defined directly in the HTML.