// =====================================================================
// Shared authentication helpers used by every page.
// =====================================================================

/** Redirects to the login page if nobody is signed in. Returns the auth user. */
async function requireAuth() {
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (!session) {
    window.location.href = "index.html";
    return null;
  }
  return session.user;
}

/** Loads the full profile row (name, coins, level, streak, is_admin, ...) for the signed-in user. */
async function getCurrentProfile() {
  const user = await requireAuth();
  if (!user) return null;

  const { data: profile, error } = await supabaseClient
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) {
    console.error("Could not load profile:", error);
    return null;
  }
  return profile;
}

/** Redirects non-admins away from admin.html. */
async function requireAdmin() {
  const profile = await getCurrentProfile();
  if (!profile || !profile.is_admin) {
    window.location.href = "dashboard.html";
    return null;
  }
  return profile;
}

async function logout() {
  await supabaseClient.auth.signOut();
  window.location.href = "index.html";
}

/**
 * Fills in the shared top navbar (id="mqNavbar") with the student's name,
 * coins, level, and streak. Call this on every logged-in page.
 */
function renderNavbar(profile) {
  const nav = document.getElementById("mqNavbar");
  if (!nav || !profile) return;

  const levelInfo = getLevelInfo(profile.coins || 0);

  nav.innerHTML = `
    <div class="container-fluid px-3 px-md-4">
      <a class="navbar-brand mq-brand" href="dashboard.html">
        <span>💰</span> MoneyQuest Kids
      </a>
      <div class="d-flex align-items-center gap-2 flex-wrap justify-content-end">
        <span class="mq-pill mq-pill-level d-none d-sm-inline-flex">🏆 Lvl ${levelInfo.level}</span>
        <span class="mq-pill mq-pill-coins">🪙 ${profile.coins ?? 0}</span>
        <span class="mq-pill mq-pill-streak">🔥 ${profile.streak_days ?? 0}d</span>
        ${profile.is_admin ? '<a href="admin.html" class="btn btn-mq btn-mq-outline btn-sm">Admin</a>' : ""}
        <button id="mqLogoutBtn" class="btn btn-mq btn-mq-outline btn-sm">Logout</button>
      </div>
    </div>
  `;

  document.getElementById("mqLogoutBtn")?.addEventListener("click", logout);
}

/** Small reusable "toast" style alert box. Pass an existing element id. */
function showAlert(elId, message, type = "danger") {
  const el = document.getElementById(elId);
  if (!el) return;
  el.className = `alert alert-${type} mq-fade-in`;
  el.textContent = message;
  el.classList.remove("d-none");
}

function hideAlert(elId) {
  document.getElementById(elId)?.classList.add("d-none");
}
