// =====================================================================
// Budget Builder mini-game — split a monthly allowance across
// Needs / Wants / Savings and get feedback against the 50/30/20 rule.
// =====================================================================

const ALLOWANCE = 1000;

let mqBudgetProfile = null;

const needsSlider = () => document.getElementById("needsSlider");
const wantsSlider = () => document.getElementById("wantsSlider");

(async function initGame() {
  mqBudgetProfile = await getCurrentProfile();
  if (!mqBudgetProfile) return;
  renderNavbar(mqBudgetProfile);

  document.getElementById("allowanceLabel").textContent = `₹${ALLOWANCE}`;

  needsSlider().addEventListener("input", () => updateSliders("needs"));
  wantsSlider().addEventListener("input", () => updateSliders("wants"));
  document.getElementById("submitBudgetBtn").addEventListener("click", submitBudget);

  updateSliders();
})();

function updateSliders(changed) {
  let needs = Number(needsSlider().value);
  let wants = Number(wantsSlider().value);

  if (needs + wants > 100) {
    if (changed === "wants") {
      needs = 100 - wants;
      needsSlider().value = needs;
    } else {
      wants = 100 - needs;
      wantsSlider().value = wants;
    }
  }

  const savings = 100 - needs - wants;
  document.getElementById("savingsSlider").value = savings;

  document.getElementById("needsPct").textContent = `${needs}%`;
  document.getElementById("wantsPct").textContent = `${wants}%`;
  document.getElementById("savingsPct").textContent = `${savings}%`;

  document.getElementById("needsAmount").textContent = `₹${Math.round((needs / 100) * ALLOWANCE)}`;
  document.getElementById("wantsAmount").textContent = `₹${Math.round((wants / 100) * ALLOWANCE)}`;
  document.getElementById("savingsAmount").textContent = `₹${Math.round((savings / 100) * ALLOWANCE)}`;
}

async function submitBudget() {
  const needs = Number(needsSlider().value);
  const wants = Number(wantsSlider().value);
  const savings = 100 - needs - wants;

  const deviation = Math.abs(needs - 50) + Math.abs(wants - 30) + Math.abs(savings - 20);

  let tier, coinsEarned, tone;
  if (deviation <= 10) {
    tier = "Excellent! Very close to the healthy 50/30/20 balance.";
    coinsEarned = 30;
    tone = "success";
  } else if (deviation <= 25) {
    tier = "Good effort! A reasonably balanced budget.";
    coinsEarned = 15;
    tone = "warning";
  } else {
    tier = "This budget is quite unbalanced — try moving closer to 50% needs, 30% wants, 20% savings.";
    coinsEarned = 5;
    tone = "danger";
  }

  const { newBadges } = await addCoins(mqBudgetProfile.id, coinsEarned);
  celebrateBadges(newBadges);

  document.getElementById("resultBox").innerHTML = `
    <div class="alert alert-${tone} mq-fade-in">
      <p class="mb-1">${tier}</p>
      <p class="mb-1">Your split: ${needs}% Needs / ${wants}% Wants / ${savings}% Savings</p>
      <p class="mb-0 fw-semibold">+${coinsEarned} coins earned 🪙</p>
    </div>
    <div class="text-center">
      <button class="btn btn-mq btn-mq-outline" onclick="window.location.reload()">Try Again</button>
    </div>
  `;
}
