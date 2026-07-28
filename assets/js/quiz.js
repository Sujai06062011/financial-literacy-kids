// =====================================================================
// Quiz page — one template, driven by ?slug=<lesson slug>
// =====================================================================

let mqProfile = null;
let mqLesson = null;
let mqQuestions = [];
let mqCurrent = 0;
let mqAnswers = {}; // { questionId: 'a' | 'b' | 'c' | 'd' }
let mqTimerInterval = null;
let mqSecondsLeft = 0;

const OPTION_KEYS = ["a", "b", "c", "d"];

(async function initQuiz() {
  mqProfile = await getCurrentProfile();
  if (!mqProfile) return;
  renderNavbar(mqProfile);

  const slug = new URLSearchParams(window.location.search).get("slug");
  const card = document.getElementById("quizCard");
  if (!slug) {
    card.innerHTML = `<p class="text-danger">No quiz specified.</p>`;
    return;
  }

  const { data: lesson, error: lessonError } = await supabaseClient
    .from("lessons")
    .select("*")
    .eq("slug", slug)
    .single();

  if (lessonError || !lesson) {
    card.innerHTML = `<p class="text-danger">Lesson not found.</p>`;
    return;
  }
  mqLesson = lesson;

  const { data: questions, error: qError } = await supabaseClient
    .from("quizzes")
    .select("*")
    .eq("lesson_id", lesson.id)
    .order("order_index", { ascending: true });

  if (qError || !questions || questions.length === 0) {
    card.innerHTML = `<p class="text-mq-ink-soft">No quiz questions yet for this lesson.</p>
      <a href="dashboard.html" class="btn btn-mq btn-mq-primary btn-sm">Back to Dashboard</a>`;
    return;
  }

  mqQuestions = questions;
  mqSecondsLeft = questions.length * 30; // 30s per question
  startTimer();
  renderQuestion();
})();

function startTimer() {
  updateTimerDisplay();
  mqTimerInterval = setInterval(() => {
    mqSecondsLeft--;
    updateTimerDisplay();
    if (mqSecondsLeft <= 0) {
      clearInterval(mqTimerInterval);
      submitQuiz();
    }
  }, 1000);
}

function updateTimerDisplay() {
  const el = document.getElementById("quizTimer");
  if (!el) return;
  const m = Math.floor(mqSecondsLeft / 60);
  const s = mqSecondsLeft % 60;
  el.textContent = `⏱ ${m}:${s.toString().padStart(2, "0")}`;
  el.classList.toggle("text-danger", mqSecondsLeft <= 15);
}

function renderQuestion() {
  const q = mqQuestions[mqCurrent];
  const card = document.getElementById("quizCard");
  const total = mqQuestions.length;
  const selected = mqAnswers[q.id];

  card.innerHTML = `
    <div class="d-flex justify-content-between align-items-center mb-2">
      <span class="fw-semibold text-mq-purple">${escapeHtml(mqLesson.title)} Quiz</span>
      <span id="quizTimer" class="fw-bold"></span>
    </div>
    <div class="mq-progress mb-3"><div class="mq-progress-fill" style="width:${((mqCurrent + 1) / total) * 100}%"></div></div>
    <p class="small text-mq-ink-soft mb-1">Question ${mqCurrent + 1} of ${total}</p>
    <h4 class="mb-3">${escapeHtml(q.question)}</h4>
    <div id="optionsWrap">
      ${OPTION_KEYS.map(
        (key) => `
        <button type="button" class="quiz-option ${selected === key ? "selected" : ""}" data-key="${key}">
          ${escapeHtml(q[`option_${key}`])}
        </button>`
      ).join("")}
    </div>
    <div class="d-flex justify-content-between mt-4">
      <button id="prevBtn" class="btn btn-mq btn-mq-outline" ${mqCurrent === 0 ? "disabled" : ""}>← Back</button>
      ${
        mqCurrent === total - 1
          ? `<button id="submitBtn" class="btn btn-mq btn-mq-primary">Submit Quiz ✅</button>`
          : `<button id="nextBtn" class="btn btn-mq btn-mq-primary">Next →</button>`
      }
    </div>
  `;

  updateTimerDisplay();

  document.querySelectorAll(".quiz-option").forEach((btn) => {
    btn.addEventListener("click", () => {
      mqAnswers[q.id] = btn.dataset.key;
      renderQuestion();
    });
  });

  document.getElementById("prevBtn")?.addEventListener("click", () => {
    mqCurrent = Math.max(0, mqCurrent - 1);
    renderQuestion();
  });
  document.getElementById("nextBtn")?.addEventListener("click", () => {
    mqCurrent = Math.min(total - 1, mqCurrent + 1);
    renderQuestion();
  });
  document.getElementById("submitBtn")?.addEventListener("click", submitQuiz);
}

async function submitQuiz() {
  clearInterval(mqTimerInterval);

  let score = 0;
  mqQuestions.forEach((q) => {
    if (mqAnswers[q.id] === q.correct_option) score++;
  });
  const total = mqQuestions.length;
  const percentage = Math.round((score / total) * 100);

  await supabaseClient.from("quiz_results").insert({
    user_id: mqProfile.id,
    lesson_id: mqLesson.id,
    score,
    total_questions: total,
    percentage,
  });

  const coinsEarned = percentage >= 80 ? 30 : 5;
  const { newBadges } = await addCoins(mqProfile.id, coinsEarned);

  renderResults(score, total, percentage, coinsEarned);
  celebrateBadges(newBadges);
}

function renderResults(score, total, percentage, coinsEarned) {
  const card = document.getElementById("quizCard");
  const passed = percentage >= 80;

  const reviewRows = mqQuestions
    .map((q, i) => {
      const chosen = mqAnswers[q.id];
      const isCorrect = chosen === q.correct_option;
      return `
        <div class="mb-3 pb-3 ${i < mqQuestions.length - 1 ? "border-bottom" : ""}">
          <p class="fw-semibold mb-1">${i + 1}. ${escapeHtml(q.question)}</p>
          <p class="small mb-0 ${isCorrect ? "text-mq-teal" : "text-danger"}">
            Your answer: ${chosen ? escapeHtml(q[`option_${chosen}`]) : "(no answer)"} ${isCorrect ? "✅" : "❌"}
          </p>
          ${!isCorrect ? `<p class="small text-mq-ink-soft mb-0">Correct answer: ${escapeHtml(q[`option_${q.correct_option}`])}</p>` : ""}
        </div>
      `;
    })
    .join("");

  card.innerHTML = `
    <div class="text-center mb-4">
      <div class="mq-emoji-lg">${passed ? "🎉" : "💪"}</div>
      <h2>${passed ? "Great job!" : "Nice try!"}</h2>
      <p class="fs-4 fw-bold text-mq-purple mb-0">${score} / ${total} correct (${percentage}%)</p>
      <p class="text-mq-ink-soft">+${coinsEarned} coins earned 🪙</p>
    </div>
    <div class="d-flex flex-column flex-sm-row gap-2 justify-content-center mb-4">
      <a href="dashboard.html" class="btn btn-mq btn-mq-primary">Back to Dashboard</a>
      <button id="retakeBtn" class="btn btn-mq btn-mq-outline">Retake Quiz</button>
    </div>
    <hr />
    <h5 class="mb-3">Review Answers</h5>
    ${reviewRows}
  `;

  document.getElementById("retakeBtn").addEventListener("click", () => window.location.reload());
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str ?? "";
  return div.innerHTML;
}
