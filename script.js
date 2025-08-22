// ===== Quotes data (array of objects with text & category) =====
const quotes = [
  { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { text: "In the middle of difficulty lies opportunity.", category: "Inspiration" },
  { text: "Your time is limited, so don’t waste it living someone else’s life.", category: "Life" },
  { text: "Whether you think you can or you think you can’t, you’re right.", category: "Mindset" }
];

// ===== DOM references =====
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn  = document.getElementById("newQuote");

// ===== Display a random quote and update the DOM =====
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
}

// ===== Add a new quote to the array and update the DOM =====
function addQuote() {
  const textInput = document.getElementById("newQuoteText");
  const catInput  = document.getElementById("newQuoteCategory");

  const text = textInput.value.trim();
  const category = catInput.value.trim();

  if (!text || !category) {
    alert("Please provide both a quote and a category.");
    return;
  }

  quotes.push({ text, category });   // update data model
  textInput.value = "";
  catInput.value = "";

  displayRandomQuote();              // reflect change in the DOM
}

// ===== Event listeners =====
newQuoteBtn.addEventListener("click", displayRandomQuote);

// Initial render
displayRandomQuote();
