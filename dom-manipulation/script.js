// ===== Local Storage Keys =====
const QUOTES_KEY = "quotesData";
const LAST_QUOTE_KEY = "lastQuoteIndex"; // for session storage demo

// ===== Quotes data (array of objects with text & category) =====
let quotes = [];

// ===== DOM references =====
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn  = document.getElementById("newQuote");

// ===== Load quotes from localStorage on init =====
function loadQuotes() {
  const stored = localStorage.getItem(QUOTES_KEY);
  if (stored) {
    try {
      quotes = JSON.parse(stored);
    } catch {
      quotes = [];
    }
  } else {
    // Default sample quotes
    quotes = [
      { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
      { text: "In the middle of difficulty lies opportunity.", category: "Inspiration" },
      { text: "Your time is limited, so don’t waste it living someone else’s life.", category: "Life" }
    ];
  }
}

// ===== Save quotes to localStorage =====
function saveQuotes() {
  localStorage.setItem(QUOTES_KEY, JSON.stringify(quotes));
}

// ===== Display a random quote =====
function displayRandomQuote() {
  if (!quotes.length) {
    quoteDisplay.innerHTML = "<p>No quotes available. Please add one!</p>";
    return;
  }
  const index = Math.floor(Math.random() * quotes.length);
  const { text, category } = quotes[index];

  quoteDisplay.innerHTML = `
    <p class="quote">"${text}"</p>
    <p class="category">Category: ${category}</p>
  `;

  // Store last viewed quote index in sessionStorage
  sessionStorage.setItem(LAST_QUOTE_KEY, index);
}

// ===== Add a new quote =====
function addQuote() {
  const textInput = document.getElementById("newQuoteText");
  const catInput  = document.getElementById("newQuoteCategory");

  const text = textInput.value.trim();
  const category = catInput.value.trim();

  if (!text || !category) {
    alert("Please provide both a quote and a category.");
    return;
  }

  quotes.push({ text, category });
  saveQuotes(); // persist in localStorage

  textInput.value = "";
  catInput.value = "";

  displayRandomQuote();
}

// ===== Export quotes to JSON file =====
function exportToJsonFile() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ===== Import quotes from JSON file =====
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function(e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      if (Array.isArray(importedQuotes)) {
        quotes.push(...importedQuotes);
        saveQuotes();
        alert("Quotes imported successfully!");
        displayRandomQuote();
      } else {
        alert("Invalid JSON format.");
      }
    } catch (err) {
      alert("Error parsing JSON file.");
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// ===== Event listeners =====
newQuoteBtn.addEventListener("click", displayRandomQuote);

// ===== Initialize App =====
loadQuotes();
displayRandomQuote();
