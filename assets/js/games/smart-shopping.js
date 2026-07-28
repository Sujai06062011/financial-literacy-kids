// =====================================================================
// Smart Shopping mini-game — pure client-side, no database tables
// needed beyond awarding coins through the shared gamification engine.
// =====================================================================

const BUDGET = 500;

const SHOP_ITEMS = [
  { id: "rice", name: "Bag of Rice", emoji: "🍚", price: 120, type: "need" },
  { id: "notebook", name: "School Notebook", emoji: "📒", price: 60, type: "need" },
  { id: "toothpaste", name: "Toothpaste", emoji: "🪥", price: 45, type: "need" },
  { id: "umbrella", name: "Umbrella", emoji: "☂️", price: 150, type: "need" },
  { id: "toy", name: "Toy Car", emoji: "🚗", price: 250, type: "want" },
  { id: "chocolate", name: "Chocolate Bar", emoji: "🍫", price: 40, type: "want" },
  { id: "game", name: "Video Game", emoji: "🎮", price: 400, type: "want" },
  { id: "sneakers", name: "Fancy Sneakers", emoji: "👟", price: 350, type: "want" },
];

let mqShopProfile = null;
const cart = new Set();

(async function initGame() {
  mqShopProfile = await getCurrentProfile();
  if (!mqShopProfile) return;
  renderNavbar(mqShopProfile);

  document.getElementById("budgetLabel").textContent = `₹${BUDGET}`;
  renderItems();
  updateCartSummary();

  document.getElementById("checkoutBtn").addEventListener("click", checkout);
})();

function renderItems() {
  const grid = document.getElementById("itemsGrid");
  grid.innerHTML = SHOP_ITEMS.map(
    (item) => `
    <div class="col-6 col-md-3">
      <button type="button" class="module-card mq-hover w-100 border-0 item-btn" data-id="${item.id}">
        <span class="module-icon">${item.emoji}</span>
        <div class="fw-semibold">${item.name}</div>
        <div class="small text-mq-ink-soft">₹${item.price} · ${item.type === "need" ? "Need" : "Want"}</div>
      </button>
    </div>
  `
  ).join("");

  document.querySelectorAll(".item-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      if (cart.has(id)) cart.delete(id);
      else cart.add(id);
      btn.classList.toggle("completed", cart.has(id));
      updateCartSummary();
    });
  });
}

function updateCartSummary() {
  const total = [...cart].reduce((sum, id) => sum + SHOP_ITEMS.find((i) => i.id === id).price, 0);
  document.getElementById("cartTotal").textContent = total;
  const remaining = BUDGET - total;
  const pill = document.getElementById("remainingPill");
  pill.textContent = `Remaining: ₹${remaining}`;
  pill.className = `mq-pill ${remaining < 0 ? "mq-pill-streak" : "mq-pill-level"}`;
}

async function checkout() {
  const total = [...cart].reduce((sum, id) => sum + SHOP_ITEMS.find((i) => i.id === id).price, 0);
  const needs = SHOP_ITEMS.filter((i) => i.type === "need");
  const boughtNeeds = needs.filter((i) => cart.has(i.id));
  const overBudget = total > BUDGET;

  const box = document.getElementById("resultBox");
  let coinsEarned = 0;
  let message = "";

  if (overBudget) {
    message = `😬 You went over budget by ₹${total - BUDGET}. Try removing a "want" item.`;
  } else if (boughtNeeds.length < needs.length) {
    message = `🤔 You stayed on budget, but missed ${needs.length - boughtNeeds.length} need(s). Needs come first!`;
    coinsEarned = 10;
  } else {
    message = `🎉 Great shopping! You covered all your needs and stayed within budget.`;
    coinsEarned = 25;
  }

  let badgeHtml = "";
  if (coinsEarned > 0 && mqShopProfile) {
    const { newBadges } = await addCoins(mqShopProfile.id, coinsEarned);
    celebrateBadges(newBadges);
  }

  box.innerHTML = `
    <div class="alert ${overBudget ? "alert-danger" : "alert-success"} mq-fade-in">
      <p class="mb-1">${message}</p>
      ${coinsEarned ? `<p class="mb-0 fw-semibold">+${coinsEarned} coins earned 🪙</p>` : ""}
    </div>
    <div class="text-center">
      <button class="btn btn-mq btn-mq-outline" onclick="window.location.reload()">Play Again</button>
    </div>
  `;
}
