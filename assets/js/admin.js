// =====================================================================
// Admin dashboard — one page, a handful of stat cards and two charts.
// Only visible to the profile row with is_admin = true.
// =====================================================================

(async function initAdmin() {
  const profile = await requireAdmin();
  if (!profile) return;
  renderNavbar(profile);

  const [
    { data: profiles },
    { data: lessons },
    { data: progress },
    { data: quizResults },
    { data: goals },
    { data: certificates },
  ] = await Promise.all([
    supabaseClient.from("profiles").select("id"),
    supabaseClient.from("lessons").select("id,title,order_index").order("order_index"),
    supabaseClient.from("lesson_progress").select("user_id,lesson_id,completed").eq("completed", true),
    supabaseClient.from("quiz_results").select("percentage"),
    supabaseClient.from("savings_goals").select("id,completed"),
    supabaseClient.from("certificates").select("id"),
  ]);

  const totalStudents = profiles?.length || 0;
  const totalLessons = lessons?.length || 0;

  // Completed lessons per student
  const completedByUser = {};
  (progress || []).forEach((p) => {
    completedByUser[p.user_id] = (completedByUser[p.user_id] || 0) + 1;
  });

  let completedStudents = 0;
  let inProgressStudents = 0;
  (profiles || []).forEach((p) => {
    const count = completedByUser[p.id] || 0;
    if (totalLessons > 0 && count >= totalLessons) completedStudents++;
    else if (count > 0) inProgressStudents++;
  });
  const notStartedStudents = totalStudents - completedStudents - inProgressStudents;

  const avgScore = quizResults && quizResults.length
    ? Math.round(quizResults.reduce((sum, r) => sum + Number(r.percentage), 0) / quizResults.length)
    : 0;

  const goalsCreated = goals?.length || 0;
  const goalsAchieved = (goals || []).filter((g) => g.completed).length;
  const certificatesIssued = certificates?.length || 0;

  renderStats({
    totalStudents,
    completedStudents,
    inProgressStudents,
    avgScore,
    goalsCreated,
    goalsAchieved,
    certificatesIssued,
  });

  renderCompletionChart(completedStudents, inProgressStudents, notStartedStudents);
  renderModuleChart(lessons || [], progress || []);
})();

function renderStats(s) {
  const grid = document.getElementById("statsGrid");
  const cards = [
    ["👥", s.totalStudents, "Students Registered"],
    ["✅", s.completedStudents, "Completed All Lessons"],
    ["📖", s.inProgressStudents, "In Progress"],
    ["🎯", `${s.avgScore}%`, "Average Quiz Score"],
    ["🐷", s.goalsCreated, "Savings Goals Created"],
    ["🏆", s.goalsAchieved, "Goals Achieved"],
    ["📜", s.certificatesIssued, "Certificates Issued"],
  ];

  grid.innerHTML = cards
    .map(
      ([icon, value, label]) => `
      <div class="col-6 col-md-3">
        <div class="mq-card mq-card-body text-center">
          <div class="fs-2">${icon}</div>
          <div class="fw-bold fs-3">${value}</div>
          <div class="small text-mq-ink-soft">${label}</div>
        </div>
      </div>
    `
    )
    .join("");
}

function renderCompletionChart(completed, inProgress, notStarted) {
  new Chart(document.getElementById("completionChart"), {
    type: "doughnut",
    data: {
      labels: ["Completed", "In Progress", "Not Started"],
      datasets: [
        {
          data: [completed, inProgress, notStarted],
          backgroundColor: ["#00bfa6", "#ffb300", "#e5e0ff"],
          borderWidth: 0,
        },
      ],
    },
    options: {
      plugins: { legend: { position: "bottom" } },
    },
  });
}

function renderModuleChart(lessons, progressRows) {
  const countByLesson = {};
  progressRows.forEach((p) => {
    countByLesson[p.lesson_id] = (countByLesson[p.lesson_id] || 0) + 1;
  });

  new Chart(document.getElementById("moduleChart"), {
    type: "bar",
    data: {
      labels: lessons.map((l) => l.title),
      datasets: [
        {
          label: "Students Completed",
          data: lessons.map((l) => countByLesson[l.id] || 0),
          backgroundColor: "#7c4dff",
          borderRadius: 6,
        },
      ],
    },
    options: {
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
    },
  });
}
