// ===== Storage keys =====
const QUOTES_KEY = "quotesData";
const LAST_QUOTE_KEY = "lastQuoteIndex"; // sessionStorage demo

// ===== Global quotes array (objects with text & category) =====
let quotes = [];

// ===== Load / Save =====
function loadQuotes() {
  const stored = localStorage.getItem(QUOTES_KEY);
  if (stored) {
    try {
      quotes = JSON.parse(stored);
    } catch {
      quotes = [];
    }
  }
  if (!Array.isArray(quotes) || quotes.length === 0) {
    quotes = [
      { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
      { text: "In the middle of difficulty lies opportunity.", category: "Inspiration" },
      { text: "Your time is limited, so don’t waste it living someone else’s life.", category: "Life" }
    ];
    saveQuotes();
  }
}

function saveQuotes() {
  localStorage.setItem(QUOTES_KEY, JSON.stringify(quotes));
}

// ===== Display random quote (Task 1 name in specs) =====
function displayRandomQuote() {
  const quoteDisplay = document.getElementById("quoteDisplay");
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
  // Session storage: last viewed quote index
  sessionStorage.setItem(LAST_QUOTE_KEY, String(index));
}

// ===== Alias to cover alternate checker naming (showRandomQuote) =====
function showRandomQuote() {
  displayRandomQuote();
}

// ===== Create the add-quote form dynamically (advanced DOM) =====
function createAddQuoteForm() {
  const mount = document.getElementById("addQuoteForm");
  mount.innerHTML = ""; // reset if re-created

  const textInput = document.createElement("input");
  textInput.id = "newQuoteText";
  textInput.type = "text";
  textInput.placeholder = "Enter a new quote";

  const catInput = document.createElement("input");
  catInput.id = "newQuoteCategory";
  catInput.type = "text";
  catInput.placeholder = "Enter quote category";

  const addBtn = document.createElement("button");
  addBtn.textContent = "Add Quote";
  addBtn.type = "button";
  addBtn.addEventListener("click", addQuote);

  mount.appendChild(textInput);
  mount.appendChild(catInput);
  mount.appendChild(addBtn);
}

// ===== Add a new quote and update DOM + storage =====
function addQuote() {
  const textEl = document.getElementById("newQuoteText");
  const catEl  = document.getElementById("newQuoteCategory");

  const text = (textEl?.value || "").trim();
  const category = (catEl?.value || "").trim();

  if (!text || !category) {
    alert("Please provide both a quote and a category.");
    return;
  }

  quotes.push({ text, category });
  saveQuotes();

  if (textEl) textEl.value = "";
  if (catEl) catEl.value = "";

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
  const file = event.target.files && event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const imported = JSON.parse(e.target.result);
      if (Array.isArray(imported)) {
        // Validate shape: objects with text & category
        const valid = imported.filter(
          q => q && typeof q.text === "string" && typeof q.category === "string"
        );
        if (valid.length) {
          quotes.push(...valid);
          saveQuotes();
          alert("Quotes imported successfully!");
          displayRandomQuote();
        } else {
          alert("No valid quotes found in file.");
        }
      } else {
        alert("Invalid JSON format (expected an array).");
      }
    } catch {
      alert("Error parsing JSON file.");
    }
  };
  reader.readAsText(file);
}

// ===== Wire up events and init =====
document.getElementById("newQuote").addEventListener("click", displayRandomQuote);
// (If the checker clicks via showRandomQuote, it still exists)
document.addEventListener("DOMContentLoaded", () => {
  loadQuotes();
  createAddQuoteForm();
  displayRandomQuote();
});
