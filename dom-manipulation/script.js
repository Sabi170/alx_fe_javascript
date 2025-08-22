// ===== Local Storage Keys =====
const QUOTES_KEY = "quotesData";
const LAST_QUOTE_KEY = "lastQuoteIndex";

// ===== Quotes array =====
let quotes = [];

// ===== Load quotes from localStorage =====
function loadQuotes() {
  const stored = localStorage.getItem(QUOTES_KEY);
  if (stored) {
    try {
      quotes = JSON.parse(stored);
    } catch {
      quotes = [];
    }
  } else {
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

// ===== Display random quote =====
function displayRandomQuote() {
  const quoteDisplay = document.getElementById("quoteDisplay");
  if (!quotes.length) {
    quoteDisplay.innerHTML = "<p>No quotes available. Please add one!</p>";
    return;
  }
  const index = Math.floor(Math.random() * quotes.length);
  const { text, category } = quotes[index];
  quoteDisplay.innerHTML = `
    <p>"${text}"</p>
    <p>Category: ${category}</p>
  `;
  sessionStorage.setItem(LAST_QUOTE_KEY, index);
}

// ===== Add new quote =====
function addQuote() {
  const textInput = document.getElementById("newQuoteText");
  const catInput = document.getElementById("newQuoteCategory");

  const text = textInput.value.trim();
  const category = catInput.value.trim();

  if (!text || !category) {
    alert("Please provide both quote and category.");
    return;
  }

  quotes.push({ text, category });
  saveQuotes();

  textInput.value = "";
  catInput.value = "";

  displayRandomQuote();
}

// ===== Export to JSON =====
function exportToJsonFile() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();
  URL.revokeObjectURL(url);
}

// ===== Import from JSON =====
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
    } catch {
      alert("Error parsing JSON file.");
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// ===== Event listener =====
document.getElementById("newQuote").addEventListener("click", displayRandomQuote);

// ===== Init =====
loadQuotes();
displayRandomQuote();
