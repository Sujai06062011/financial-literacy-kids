// =====================================================================
// Dashboard page logic
// =====================================================================

(async function initDashboard() {
  let profile = await getCurrentProfile();
  if (!profile) return;

  // Bump the login streak for today, then re-read the (possibly updated) profile.
  await updateStreak(profile.id);
  profile = await getCurrentProfile();

  renderNavbar(profile);
  renderWelcome(profile);
  await renderSavingsGoal(profile.id);
  await renderModulesAndContinue(profile.id);
})();

function renderWelcome(profile) {
  document.getElementById("welcomeMsg").textContent = `Welcome ${profile.name || "Explorer"} 👋`;

  const info = getLevelInfo(profile.coins || 0);
  document.getElementById("levelName").textContent = `Level ${info.level} · ${info.name}`;
  document.getElementById("levelProgressFill").style.width = `${info.progress}%`;
  document.getElementById("coinsStat").textContent = profile.coins ?? 0;
  document.getElementById("streakStat").textContent = profile.streak_days ?? 0;

  const progressText = info.next
    ? `${profile.coins} / ${info.next.min} coins to reach Level ${info.next.level} (${info.next.name})`
    : `Max level reached — you're a true Money Master! 👑`;
  document.getElementById("levelProgressText").textContent = progressText;
}

async function renderSavingsGoal(userId) {
  const el = document.getElementById("savingsGoalContent");
  const { data: goal } = await supabaseClient
    .from("savings_goals")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!goal) {
    el.innerHTML = `
      <p class="text-mq-ink-soft">You haven't set a savings goal yet.</p>
      <a href="savings-goal.html" class="btn btn-mq btn-mq-teal btn-sm">Create a Goal 🎯</a>
    `;
    return;
  }

  const pct = Math.min(100, Math.round((goal.current_amount / goal.target_amount) * 100));
  el.innerHTML = `
    <div class="d-flex align-items-center gap-2 mb-2">
      <span class="fs-2">${goal.goal_emoji || "🎯"}</span>
      <div>
        <div class="fw-semibold">${escapeHtml(goal.goal_name)}</div>
        <div class="small text-mq-ink-soft">Target: ₹${Number(goal.target_amount).toLocaleString("en-IN")}</div>
      </div>
      ${goal.completed ? '<span class="badge bg-success ms-auto">Achieved! 🎉</span>' : ""}
    </div>
    <div class="mq-progress mb-1">
      <div class="mq-progress-fill" style="width:${pct}%"></div>
    </div>
    <div class="d-flex justify-content-between small text-mq-ink-soft">
      <span>₹${Number(goal.current_amount).toLocaleString("en-IN")} saved</span>
      <span>${pct}%</span>
    </div>
    <a href="savings-goal.html" class="btn btn-mq btn-mq-outline btn-sm mt-2">Update Goal</a>
  `;
}

async function renderModulesAndContinue(userId) {
  const { data: lessons } = await supabaseClient
    .from("lessons")
    .select("*")
    .order("order_index", { ascending: true });

  const { data: progress } = await supabaseClient
    .from("lesson_progress")
    .select("lesson_id,completed")
    .eq("user_id", userId);

  const completedIds = new Set((progress || []).filter((p) => p.completed).map((p) => p.lesson_id));

  // Continue learning card
  const continueEl = document.getElementById("continueContent");
  const nextLesson = (lessons || []).find((l) => !completedIds.has(l.id));

  if (!nextLesson) {
    continueEl.innerHTML = `
      <p class="mb-2">🎉 You've completed every lesson!</p>
      <a href="achievements.html" class="btn btn-mq btn-mq-primary btn-sm">Get Your Certificate</a>
    `;
  } else {
    continueEl.innerHTML = `
      <div class="d-flex align-items-center gap-3 mb-3">
        <span class="fs-1">${nextLesson.icon || "📘"}</span>
        <div>
          <div class="fw-semibold">${escapeHtml(nextLesson.title)}</div>
          <div class="small text-mq-ink-soft">${escapeHtml(nextLesson.description || "")}</div>
        </div>
      </div>
      <a href="lesson.html?slug=${encodeURIComponent(nextLesson.slug)}" class="btn btn-mq btn-mq-primary btn-sm">
        Continue Learning →
      </a>
    `;
  }

  // Modules grid
  const grid = document.getElementById("modulesGrid");
  if (!lessons || lessons.length === 0) {
    grid.innerHTML = `<div class="col-12 text-mq-ink-soft">No lessons yet — ask an adult to run supabase/seed.sql.</div>`;
    return;
  }

  grid.innerHTML = lessons
    .map((lesson) => {
      const isDone = completedIds.has(lesson.id);
      return `
        <div class="col-6 col-md-3">
          <a href="lesson.html?slug=${encodeURIComponent(lesson.slug)}" class="module-card mq-hover ${isDone ? "completed" : ""}">
            ${isDone ? '<span class="module-check">✅</span>' : ""}
            <span class="module-icon">${lesson.icon || "📘"}</span>
            <div class="fw-semibold">${escapeHtml(lesson.title)}</div>
          </a>
        </div>
      `;
    })
    .join("");
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str ?? "";
  return div.innerHTML;
}
