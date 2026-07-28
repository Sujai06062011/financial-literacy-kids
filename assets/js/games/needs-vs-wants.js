// =====================================================================
// Needs vs Wants — rapid-fire sorting game
// =====================================================================

const ROUND_ITEMS = [
  { name: "Drinking Water", emoji: "💧", type: "need" },
  { name: "Video Game Console", emoji: "🎮", type: "want" },
  { name: "School Uniform", emoji: "👕", type: "need" },
  { name: "Designer Sunglasses", emoji: "🕶️", type: "want" },
  { name: "Medicine", emoji: "💊", type: "need" },
  { name: "Candy", emoji: "🍬", type: "want" },
  { name: "Textbook", emoji: "📚", type: "need" },
  { name: "Latest Smartphone", emoji: "📱", type: "want" },
  { name: "Rent / House", emoji: "🏠", type: "need" },
  { name: "Movie Ticket", emoji: "🎬", type: "want" },
];

let mqNwProfile = null;
let currentIndex = 0;
let score = 0;

(async function initGame() {
  mqNwProfile = await getCurrentProfile();
  if (!mqNwProfile) return;
  renderNavbar(mqNwProfile);

  document.getElementById("needBtn").addEventListener("click", () => handleAnswer("need"));
  document.getElementById("wantBtn").addEventListener("click", () => handleAnswer("want"));

  showItem();
})();

function showItem() {
  const item = ROUND_ITEMS[currentIndex];
  document.getElementById("itemEmoji").textContent = item.emoji;
  document.getElementById("itemName").textContent = item.name;
  document.getElementById("progressLabel").textContent = `Item ${currentIndex + 1} of ${ROUND_ITEMS.length}`;
  document.getElementById("scoreLabel").textContent = `Score: ${score}`;
  document.getElementById("feedback").textContent = "";
}

function handleAnswer(choice) {
  const item = ROUND_ITEMS[currentIndex];
  const correct = choice === item.type;
  const feedback = document.getElementById("feedback");

  if (correct) {
    score++;
    feedback.textContent = "✅ Correct!";
    feedback.className = "mt-3 fw-semibold text-mq-teal";
  } else {
    feedback.textContent = `❌ Not quite — that's a ${item.type}.`;
    feedback.className = "mt-3 fw-semibold text-danger";
  }

  currentIndex++;
  if (currentIndex >= ROUND_ITEMS.length) {
    setTimeout(finishGame, 600);
  } else {
    setTimeout(showItem, 600);
  }
}

async function finishGame() {
  document.getElementById("gameArea").classList.add("d-none");
  document.querySelector(".d-flex.gap-3").classList.add("d-none");
  document.getElementById("feedback").textContent = "";

  const percentage = Math.round((score / ROUND_ITEMS.length) * 100);
  const coinsEarned = percentage >= 80 ? 25 : percentage >= 50 ? 15 : 5;

  const { newBadges } = await addCoins(mqNwProfile.id, coinsEarned);
  celebrateBadges(newBadges);

  document.getElementById("resultBox").innerHTML = `
    <div class="mq-emoji-lg">${percentage >= 80 ? "🎉" : "💪"}</div>
    <h3>${score} / ${ROUND_ITEMS.length} correct (${percentage}%)</h3>
    <p class="text-mq-ink-soft">+${coinsEarned} coins earned 🪙</p>
    <button class="btn btn-mq btn-mq-primary" onclick="window.location.reload()">Play Again</button>
  `;
}
