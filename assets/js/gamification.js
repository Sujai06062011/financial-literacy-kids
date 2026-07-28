// =====================================================================
// The "game engine" — every rule about coins, levels, streaks and
// badges lives in this ONE file so it never has to be copy-pasted.
// =====================================================================

const MQ_LEVELS = [
  { level: 1, name: "Coin Collector", min: 0 },
  { level: 2, name: "Budget Beginner", min: 100 },
  { level: 3, name: "Money Explorer", min: 250 },
  { level: 4, name: "Smart Saver", min: 450 },
  { level: 5, name: "Money Master", min: 700 },
];

/** Given a coin total, returns { level, name, min, next, progress(0-100) }. */
function getLevelInfo(coins) {
  let current = MQ_LEVELS[0];
  for (const l of MQ_LEVELS) {
    if (coins >= l.min) current = l;
  }
  const idx = MQ_LEVELS.indexOf(current);
  const next = MQ_LEVELS[idx + 1] || null;
  const progress = next
    ? Math.min(100, Math.round(((coins - current.min) / (next.min - current.min)) * 100))
    : 100;
  return { ...current, next, progress };
}

/** Adds (or subtracts, if negative) coins, updates level, and checks for new badges. */
async function addCoins(userId, amount) {
  const { data: profile, error } = await supabaseClient
    .from("profiles")
    .select("coins")
    .eq("id", userId)
    .single();
  if (error) {
    console.error("addCoins: could not read profile", error);
    return { coins: 0, level: 1, newBadges: [] };
  }

  const newCoins = Math.max(0, (profile.coins || 0) + amount);
  const level = getLevelInfo(newCoins).level;

  await supabaseClient.from("profiles").update({ coins: newCoins, level }).eq("id", userId);

  const newBadges = await checkAndAwardBadges(userId);
  return { coins: newCoins, level, newBadges };
}

/**
 * Call once per session (e.g. right after login / on dashboard load).
 * Bumps the streak by 1 if the student is back the day after their last
 * visit, resets to 1 if they skipped a day, and leaves it alone if they
 * already visited today.
 */
async function updateStreak(userId) {
  const { data: profile, error } = await supabaseClient
    .from("profiles")
    .select("streak_days,last_active_date")
    .eq("id", userId)
    .single();
  if (error) return 0;

  const today = new Date().toISOString().slice(0, 10);
  if (profile.last_active_date === today) {
    return profile.streak_days || 0;
  }

  let streak = 1;
  if (profile.last_active_date) {
    const last = new Date(profile.last_active_date + "T00:00:00");
    const diffDays = Math.round((new Date(today + "T00:00:00") - last) / 86400000);
    streak = diffDays === 1 ? (profile.streak_days || 0) + 1 : 1;
  }

  await supabaseClient
    .from("profiles")
    .update({ streak_days: streak, last_active_date: today })
    .eq("id", userId);

  await checkAndAwardBadges(userId);
  return streak;
}

/**
 * Looks at every badge the student hasn't earned yet, checks whether they
 * now qualify, and inserts a user_badges row for any newly-earned ones.
 * Returns the array of badges just earned (so the UI can celebrate them).
 */
async function checkAndAwardBadges(userId) {
  const [{ data: badges }, { data: earned }, { data: profile }] = await Promise.all([
    supabaseClient.from("badges").select("*"),
    supabaseClient.from("user_badges").select("badge_id").eq("user_id", userId),
    supabaseClient.from("profiles").select("streak_days").eq("id", userId).single(),
  ]);

  const earnedIds = new Set((earned || []).map((e) => e.badge_id));

  const [{ count: lessonsCompleted }, { count: perfectQuizzes }, { count: goalsCompleted }] =
    await Promise.all([
      supabaseClient
        .from("lesson_progress")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("completed", true),
      supabaseClient
        .from("quiz_results")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("percentage", 100),
      supabaseClient
        .from("savings_goals")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("completed", true),
    ]);

  const stats = {
    lessons_completed: lessonsCompleted || 0,
    perfect_quiz: perfectQuizzes || 0,
    streak: profile?.streak_days || 0,
    savings_goal: goalsCompleted || 0,
  };

  const newlyEarned = [];
  for (const badge of badges || []) {
    if (earnedIds.has(badge.id)) continue;
    const value = stats[badge.criteria_type];
    if (value !== undefined && value >= badge.criteria_value) {
      const { error } = await supabaseClient
        .from("user_badges")
        .insert({ user_id: userId, badge_id: badge.id });
      if (!error) newlyEarned.push(badge);
    }
  }
  return newlyEarned;
}

/** Simple celebratory popup for newly-earned badges. Call after any action that might earn one. */
function celebrateBadges(newBadges) {
  if (!newBadges || newBadges.length === 0) return;
  const names = newBadges.map((b) => `${b.icon} ${b.name}`).join(", ");
  const toastEl = document.createElement("div");
  toastEl.className = "position-fixed top-0 start-50 translate-middle-x mt-3 mq-fade-in";
  toastEl.style.zIndex = 2000;
  toastEl.innerHTML = `
    <div class="mq-card mq-card-body text-center" style="background:#fff8e1;">
      <div class="mq-emoji-lg">🎉</div>
      <div class="fw-bold mb-1">New badge unlocked!</div>
      <div>${names}</div>
    </div>
  `;
  document.body.appendChild(toastEl);
  setTimeout(() => toastEl.remove(), 3500);
}
