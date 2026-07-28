// =====================================================================
// Savings goal page — create a goal, add money towards it, celebrate
// when the target is reached.
// =====================================================================

let mqSavingsProfile = null;

(async function initSavings() {
  mqSavingsProfile = await getCurrentProfile();
  if (!mqSavingsProfile) return;
  renderNavbar(mqSavingsProfile);
  await loadGoal();
})();

async function loadGoal() {
  const { data: goal } = await supabaseClient
    .from("savings_goals")
    .select("*")
    .eq("user_id", mqSavingsProfile.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!goal || goal.completed) {
    renderNewGoalForm(goal);
  } else {
    renderActiveGoal(goal);
  }
}

function renderNewGoalForm(previousGoal) {
  const card = document.getElementById("goalCard");
  card.innerHTML = `
    ${
      previousGoal
        ? `<div class="alert alert-success">🎉 You already reached your "${escapeHtml(previousGoal.goal_name)}" goal! Set a new one below.</div>`
        : ""
    }
    <h5 class="mb-3">Set a new savings goal</h5>
    <div id="goalAlert" class="alert d-none"></div>
    <form id="goalForm">
      <div class="row g-3">
        <div class="col-8">
          <label class="form-label fw-semibold">What are you saving for?</label>
          <input type="text" class="form-control" id="goalName" placeholder="Bicycle" required />
        </div>
        <div class="col-4">
          <label class="form-label fw-semibold">Emoji</label>
          <input type="text" class="form-control" id="goalEmoji" placeholder="🚲" maxlength="2" />
        </div>
        <div class="col-6">
          <label class="form-label fw-semibold">Target Amount (₹)</label>
          <input type="number" min="1" class="form-control" id="goalTarget" placeholder="6000" required />
        </div>
        <div class="col-6">
          <label class="form-label fw-semibold">Target Date (optional)</label>
          <input type="date" class="form-control" id="goalDate" />
        </div>
      </div>
      <button type="submit" class="btn btn-mq btn-mq-primary w-100 mt-4">Create Goal 🎯</button>
    </form>
  `;

  document.getElementById("goalForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const goal_name = document.getElementById("goalName").value.trim();
    const goal_emoji = document.getElementById("goalEmoji").value.trim() || "🎯";
    const target_amount = Number(document.getElementById("goalTarget").value);
    const target_date = document.getElementById("goalDate").value || null;

    const { error } = await supabaseClient.from("savings_goals").insert({
      user_id: mqSavingsProfile.id,
      goal_name,
      goal_emoji,
      target_amount,
      current_amount: 0,
      target_date,
    });

    if (error) {
      showAlert("goalAlert", error.message);
      return;
    }
    await loadGoal();
  });
}

function renderActiveGoal(goal) {
  const card = document.getElementById("goalCard");
  const pct = Math.min(100, Math.round((goal.current_amount / goal.target_amount) * 100));

  card.innerHTML = `
    <div class="text-center mb-3">
      <span class="mq-emoji-lg">${goal.goal_emoji || "🎯"}</span>
      <h4 class="mb-0">${escapeHtml(goal.goal_name)}</h4>
      <p class="text-mq-ink-soft mb-0">Target: ₹${Number(goal.target_amount).toLocaleString("en-IN")}${goal.target_date ? " by " + new Date(goal.target_date).toLocaleDateString("en-IN") : ""}</p>
    </div>
    <div class="mq-progress mb-2"><div class="mq-progress-fill" style="width:${pct}%"></div></div>
    <div class="d-flex justify-content-between small text-mq-ink-soft mb-4">
      <span>₹${Number(goal.current_amount).toLocaleString("en-IN")} saved</span>
      <span>${pct}%</span>
    </div>

    <div id="goalAlert" class="alert d-none"></div>
    <form id="addMoneyForm" class="d-flex gap-2">
      <input type="number" min="1" class="form-control" id="addAmount" placeholder="Add ₹ amount saved" required />
      <button type="submit" class="btn btn-mq btn-mq-teal">Add 💵</button>
    </form>
  `;

  document.getElementById("addMoneyForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const amount = Number(document.getElementById("addAmount").value);
    if (!amount || amount <= 0) return;

    const newAmount = Number(goal.current_amount) + amount;
    const justCompleted = newAmount >= Number(goal.target_amount);

    const { error } = await supabaseClient
      .from("savings_goals")
      .update({ current_amount: newAmount, completed: justCompleted })
      .eq("id", goal.id);

    if (error) {
      showAlert("goalAlert", error.message);
      return;
    }

    if (justCompleted) {
      const { newBadges } = await addCoins(mqSavingsProfile.id, 50);
      celebrateBadges(
        newBadges.length ? newBadges : []
      );
      alert(`🎉 Goal reached! You earned +50 bonus coins for "${goal.goal_name}"!`);
    }

    await loadGoal();
  });
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str ?? "";
  return div.innerHTML;
}
