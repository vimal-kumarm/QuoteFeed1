// =============================================
//  QuoteFeed — Day 6 JS fetch() API Project
//  Concepts: fetch, async/await, try/catch,
//  DOM manipulation, localStorage, Arrays
// =============================================

// ---- History array (stored in localStorage) ----
let history = JSON.parse(localStorage.getItem("quotefeed_history")) || [];

// ---- Load history on page start ----
window.onload = function () {
  renderHistory();
};

// ============================================
//  FETCH FUNCTIONS — one for each button
// ============================================

// 1. Get a Random Quote
async function getQuote() {
  showLoading("📡 API: quotable.io", "quote");
  try {
    const response = await fetch("https://api.quotable.io/random");

    // Check if response is OK (status 200)
    if (!response.ok) {
      throw new Error("API error: " + response.status);
    }

    const data = await response.json();

    // data has: data.content, data.author, data.tags
    displayResult(
      data.content,
      "— " + data.author,
      "💬 Quote",
      "💬"
    );

    addToHistory(data.content, data.author, "💬");

  } catch (error) {
    showError("Could not fetch quote. Check your internet! Error: " + error.message);
  }
}

// 2. Get a Random Joke
async function getJoke() {
  showLoading("📡 API: official-joke-api", "joke");
  try {
    const response = await fetch("https://official-joke-api.appspot.com/random_joke");

    if (!response.ok) throw new Error("API error: " + response.status);

    const data = await response.json();

    // data has: data.setup, data.punchline, data.type
    displayResult(
      data.setup + " 😄 " + data.punchline,
      "— Random Joke API",
      "😂 Joke",
      "😂"
    );

    addToHistory(data.setup + " " + data.punchline, "Joke API", "😂");

  } catch (error) {
    showError("Could not fetch joke. Error: " + error.message);
  }
}

// 3. Get a Dog Fact
async function getDogFact() {
  showLoading("📡 API: dogapi.dog", "dog");
  try {
    const response = await fetch("https://dogapi.dog/api/v2/facts?limit=1");

    if (!response.ok) throw new Error("API error: " + response.status);

    const data = await response.json();

    // data.data[0].attributes.body
    const fact = data.data[0].attributes.body;

    displayResult(
      fact,
      "— Dog Facts API",
      "🐶 Dog Fact",
      "🐶"
    );

    addToHistory(fact, "Dog Facts API", "🐶");

  } catch (error) {
    showError("Could not fetch dog fact. Error: " + error.message);
  }
}

// 4. Get a Cat Fact
async function getCatFact() {
  showLoading("📡 API: catfact.ninja", "cat");
  try {
    const response = await fetch("https://catfact.ninja/fact");

    if (!response.ok) throw new Error("API error: " + response.status);

    const data = await response.json();

    // data has: data.fact, data.length
    displayResult(
      data.fact,
      "— Cat Facts API",
      "🐱 Cat Fact",
      "🐱"
    );

    addToHistory(data.fact, "Cat Facts API", "🐱");

  } catch (error) {
    showError("Could not fetch cat fact. Error: " + error.message);
  }
}

// ============================================
//  HELPER FUNCTIONS
// ============================================

// Show loading state while fetching
function showLoading(apiName, type) {
  const card = document.getElementById("mainCard");
  const text = document.getElementById("quoteText");
  const author = document.getElementById("quoteAuthor");
  const spinner = document.getElementById("spinner");
  const badge = document.getElementById("apiBadge");

  // Fade out text
  text.classList.add("fade");
  author.classList.add("fade");

  // Show spinner
  spinner.classList.add("show");

  // Update badge
  badge.textContent = apiName;

  // Add loading border
  card.classList.add("loading");
}

// Display the fetched result on screen
function displayResult(content, author, tag, emoji) {
  const text = document.getElementById("quoteText");
  const authorEl = document.getElementById("quoteAuthor");
  const tagEl = document.getElementById("categoryTag");
  const card = document.getElementById("mainCard");
  const spinner = document.getElementById("spinner");

  // Hide spinner
  spinner.classList.remove("show");
  card.classList.remove("loading");

  // Set content with smooth fade in
  setTimeout(() => {
    text.textContent = content;
    authorEl.textContent = author;
    tagEl.textContent = tag;

    text.classList.remove("fade");
    authorEl.classList.remove("fade");
  }, 150);
}

// Show error message
function showError(message) {
  const spinner = document.getElementById("spinner");
  const card = document.getElementById("mainCard");
  const text = document.getElementById("quoteText");
  const author = document.getElementById("quoteAuthor");

  spinner.classList.remove("show");
  card.classList.remove("loading");

  text.textContent = "⚠️ " + message;
  text.classList.remove("fade");
  author.textContent = "";
  author.classList.remove("fade");

  showToast("❌ Error! Check console for details.");
  console.error(message);
}

// Add item to history list
function addToHistory(content, source, emoji) {
  const item = {
    content: content,
    source: source,
    emoji: emoji,
    time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
  };

  // Add to start of array
  history.unshift(item);

  // Keep only last 10 items
  if (history.length > 10) {
    history = history.slice(0, 10);
  }

  // Save to localStorage
  localStorage.setItem("quotefeed_history", JSON.stringify(history));

  // Re-render history
  renderHistory();
}

// Render history section
function renderHistory() {
  const list = document.getElementById("historyList");

  if (history.length === 0) {
    list.innerHTML = '<p class="history-empty">Your fetched items will appear here...</p>';
    return;
  }

  list.innerHTML = history.map(item => `
    <div class="history-item">
      <span class="history-emoji">${item.emoji}</span>
      <div class="history-content">
        <div class="history-text">${escapeHTML(item.content)}</div>
        <div class="history-meta">${item.source} · ${item.time}</div>
      </div>
    </div>
  `).join("");
}

// Clear history
function clearHistory() {
  history = [];
  localStorage.removeItem("quotefeed_history");
  renderHistory();
  showToast("🧹 History cleared!");
}

// Copy current quote to clipboard
async function copyToClipboard() {
  const text = document.getElementById("quoteText").textContent;
  const author = document.getElementById("quoteAuthor").textContent;

  try {
    await navigator.clipboard.writeText(text + " " + author);
    showToast("📋 Copied to clipboard!");
  } catch {
    showToast("❌ Copy failed — try manually.");
  }
}

// Show toast notification
function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 2500);
}

// Escape HTML to prevent XSS
function escapeHTML(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
