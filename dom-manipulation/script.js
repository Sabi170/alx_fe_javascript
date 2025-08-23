// Initial array of quotes
let quotes = [
    { text: "The only way to do great work is to love what you do.", category: "Inspiration"},
    { text: "Innovation distinguishes between a leader and a follower.", category: "Technology"},
    { text: "Strive not to be a success, but rather to be a value.", category: "Life"},
    { text: "Accept challenges because they not only make you stronger but wiser.", category: "Motivation"}
];

const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteButton = document.getElementById('newQuote');
const newQuoteText = document.getElementById('newQuoteText');
const newQuoteCategory = document.getElementById('newQuoteCategory');

// Function to display a random quote
function showRandomQuote() {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    const randomQuote = quotes[randomIndex];
    quoteDisplay.innerHTML = `<p>"${randomQuote.text}"</p><em>- ${randomQuote.category}</em>`;
}

// Function to add a new quote
function addQuote() {
    const text = newQuoteText.value.trim();
    const category = newQuoteCategory.value.trim();

    if (text && category) {
        quotes.push({ text, category });
        newQuoteText.value = '';
        newQuoteCategory.value = '';
        alert('New quote added successfully!');
    } else {
        alert('Please enter both a quote and a category.');
    }
}

// Function to dynamically create the add quote form
function createAddQuoteForm() {
    const formContainer = document.createElement('div');
    formContainer.innerHTML = `
    <input id="newQuoteText" type="text" placeholder="Enter a new quote" />
    <input id="newQuoteCategory" type="text" placeholder="Enter quote category" />
    <button onclick="addQuote()">Add Quote</button>
    `;
    document.body.appendChild(formContainer);
}
 // Function to save quotes to local storage
 function saveQuotes() {
    localStorage.setItem('quotes', JSON.stringify(quotes));
 }

 // Function to load quotes from local storage
 function loadQuotes() {
    const storedQuotes = localStorage.getItem('quotes');
    if (storedQuotes) {
        quotes = JSON.parse(storedQuotes);
    }
 }

 // Update the addQuote function to save afer adding
 function addQuote() {
    const text = newQuoteText.value.trim();
    const category = newQuoteCategory.value.trim();

    if (text && category) {
        quotes.push({ text, category });
        saveQuotes(); // Save to local storage
        newQuoteText.value = '';
        newQuoteCategory.value = '';
        alert('New quote added successfully!');
    } else {
        alert('Please enter both a quote and a category.');
    }
 }

 // Function to export quotes to a JSON file
 function exportToJsonFile() {
    const jsonString = JSON.stringify(quotes, null, 2);
const blob = new Blob([jsonString], { type: 'application/json' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a'); 
a.href = url;
a.download = 'quotes.json';
document.body,appendChild(a);
a.click();
document.body.removeChild(a);
}

// Function to import quotes from a JSON file
function importFromJsonFile(event) {
    const fileReader = new FileReader();
    FileReader.onload = function(event) {
        try {
            const importedQuotes = JSON.parse(event.target.result);
            quotes.push(...importedQuotes);
            saveQuotes();
            alert('Quotes imported successfully!');
        } catch (error) {
            alert('Error reading or parsing the JSON file');
        }
    };
    fileReader.readAsText(event.target.files[0]);

// Load quotes when the application starts
document.addEventListener('DOMContentLoaded', () => {
    loadQuotes();
    showRandomQuote();
});
}

const categoryFilter = document.getElementById('categoryFilter');

// Function to populate the category filter dropdown
function populateCategories() {
    const categories = ['all', ...new Set(quotes.map(quote => quote.category))];
    categoryFilter.innerHTML = ''; // Clear existing options
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category.charAt(0).toUpperCase() + category.slice(1);
        categoryFilter.appendChild(option);
    });

// Restore last selected filter
const lastFilter = localStorage.getItem('lastFilter');
if (lastFilter) {
    categoryFilter.value = lastFilter;
}
}

// Function to filter quotes based on the selected category
function filterQuotes() {
    const selectedCategory = categoryFilter.value;
    localStorage.setItem('lastFilter', selectedCategory); 

    const filteredQuotes = selectedCategory === 'all'
    ? quotes
    : quotes.filter(quote => quote.category === selectedCategory);

    if (filteredQuotes.length > 0) {
        const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
        const randomQuote = filteredQuotes[randomIndex];
        quoteDisplay.innerHTML =`<p>"${randomQuote.text}"</p><em>- ${randomQuote.category}</em>`;
    } else {
        quoteDisplay.innerHTML = '<p>No quotes available for this category.</p>';
    }
}

// Update the addQuote function to repopulate categories
function addQuote() {
    const text = newQuoteText.value.trim();
    const category = newQuoteCategory.value.trim();

    if (text && category) {
        quotes.push({ text, category });
        saveQuotes();
        populateCategories(); // Update categories dropdown
        newQuoteText.value = '';
        newQuoteCategory.value = '';
        alert('New quote added successfully!');
    } else {
        alert('Please enter both a quote and a category.');
    }

// Initial load
document.addEventListener('DOMContentLoaded', () => {
    loadQuotes();
    populateCategories();
    filterQuotes(); // Display a quote based on the restored filter
});
}

newQuoteButton.addEventListener('click', filterQuotes);
newQuoteButton.addEventListener('click', showRandomQuote);

// Mock API
const serverUrl = 'https://jsonplaceholder.typicode.com/posts';

// Function to fetch quotes from the server
async function fetchQuotesFromServer() {
    try {
        const response = await fetch(serverUrl);
        const serverQuotes = await response.json();

        // Simple conflict resolution: server data takes precedence
        // A more robust solution would involve timestamps or versioning
        const serverQuotesFormatted = serverQuotes.map(post => ({
            text: post.title, // Using 'title' as quote text
            category: 'Server' // Assiging a default category
        }));

        // Basic merging strategy
        const localTexts = new Set(quotes.map(q => q.text));
        const newQuotes = serverQuotesFormatted.filter(sq => !localTexts.has(sq.text));

        if (newQuotes.length > 0) {
            quotes.push(...newQuotes);
            saveQuotes();
            populateCategories();
            alert(`${newQuotes.length} new quotes have been synced from the server.`);
        }
    } catch (error) {
        console.error('Error fetching quotes from server:', error);
    }
}

// Function to post a new quote to the server
async function postQuoteToServer(quote) {
    try {
        const response = await fetch(serverUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                title: quote.text,
                body: quote.category,
                userId: 1 // Mock user ID
            }),
        });
        const result = await response.json();
        console.log('Quote posted to server:', result);
    } catch (error) {
        console.error('Error posting quote to server:', error);
    }
}

// Update addQuote to also post to the server
function addQuote() {
    const text = newQuoteText.value.trim();
    const category = newQuoteCategory.value.trim();
    const newQuote = { text, category };

    if (text && category) {
        quotes.push(newQuote);
        saveQuotes();
        populateCategories();
        postQuoteToServer(newQuote);
        newQuoteText.value = '';
        newQuoteCategory.value = '';
        alert('New quote added and sent to server!');
    } else {
        alert('Please enter both a quote and a category.');
    }
}

// Periodically sync with the server
setInterval(fetchQuotesFromServer, 60000); // Sycn every 60 seconds

// Initial load
document.addEventListener('DOMContentLoaded', () => {
    loadQuotes();
    populateCategories();
    filterQuotes();
    fetchQuotesFromServer(); // Initial sync
});