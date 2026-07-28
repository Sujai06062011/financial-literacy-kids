// =====================================================================
// Lesson page — ONE template that renders whichever lesson is requested
// via ?slug=... . This is the "one page, many lessons" pattern.
// =====================================================================

let mqFlashcards = [];
let mqFcIndex = 0;
let mqFcFlipped = false;

(async function initLesson() {
  const profile = await getCurrentProfile();
  if (!profile) return;
  renderNavbar(profile);

  const slug = new URLSearchParams(window.location.search).get("slug");
  const card = document.getElementById("lessonCard");

  if (!slug) {
    card.innerHTML = `<p class="text-danger">No lesson specified.</p>`;
    return;
  }

  const { data: lesson, error } = await supabaseClient
    .from("lessons")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !lesson) {
    card.innerHTML = `<p class="text-danger">Lesson not found.</p>`;
    return;
  }

  const [{ data: existingProgress }, { data: flashcards }] = await Promise.all([
    supabaseClient
      .from("lesson_progress")
      .select("completed")
      .eq("user_id", profile.id)
      .eq("lesson_id", lesson.id)
      .maybeSingle(),
    supabaseClient
      .from("flashcards")
      .select("*")
      .eq("lesson_id", lesson.id)
      .order("order_index", { ascending: true }),
  ]);

  mqFlashcards = flashcards || [];
  mqFcIndex = 0;
  mqFcFlipped = false;

  const alreadyCompleted = !!existingProgress?.completed;

  const paragraphs = (lesson.content || "")
    .split(/\n\s*\n/)
    .map((p) => `<p>${escapeHtml(p.trim())}</p>`)
    .join("");

  card.innerHTML = `
    <div class="text-center mb-3">
      <span class="mq-emoji-lg">${lesson.icon || "📘"}</span>
      <h2 class="mb-1">${escapeHtml(lesson.title)}</h2>
      <p class="text-mq-ink-soft">${escapeHtml(lesson.description || "")}</p>
    </div>

    ${mqFlashcards.length > 0 ? renderFlashcardSectionHtml() : ""}

    <div class="text-center mb-3 mt-2">
      <button class="btn btn-mq btn-mq-outline btn-sm" type="button" data-bs-toggle="collapse" data-bs-target="#fullLessonText">
        📖 ${mqFlashcards.length > 0 ? "Read the Full Lesson" : "Lesson Text"}
      </button>
    </div>
    <div class="collapse ${mqFlashcards.length > 0 ? "" : "show"}" id="fullLessonText">
      <div class="lesson-content bg-mq-soft rounded-4 p-3 p-md-4 mb-3">${paragraphs}</div>
    </div>

    <hr />
    <div class="d-flex flex-column flex-sm-row gap-2 justify-content-center mt-3">
      ${
        alreadyCompleted
          ? `<span class="btn btn-mq btn-mq-outline disabled">✅ Lesson Completed</span>
             <a href="quiz.html?slug=${encodeURIComponent(lesson.slug)}" class="btn btn-mq btn-mq-primary">Retake Quiz</a>`
          : `<button id="completeBtn" class="btn btn-mq btn-mq-primary">I've Learned This — Take the Quiz! (+20 🪙)</button>`
      }
    </div>
  `;

  if (mqFlashcards.length > 0) {
    setupFlashcardEvents();
    renderFlashcard();
  }

  document.getElementById("completeBtn")?.addEventListener("click", async (e) => {
    e.target.disabled = true;
    e.target.textContent = "Saving...";

    await supabaseClient.from("lesson_progress").upsert(
      {
        user_id: profile.id,
        lesson_id: lesson.id,
        completed: true,
        completed_at: new Date().toISOString(),
      },
      { onConflict: "user_id,lesson_id" }
    );

    const { newBadges } = await addCoins(profile.id, 20);
    celebrateBadges(newBadges);

    setTimeout(() => {
      window.location.href = `quiz.html?slug=${encodeURIComponent(lesson.slug)}`;
    }, newBadges.length ? 1200 : 0);
  });
})();

function renderFlashcardSectionHtml() {
  return `
    <div class="mb-2">
      <h5 class="mb-3 text-center">📇 Quick Flashcards</h5>
      <div class="flashcard-scene">
        <div class="flashcard" id="flashcardEl">
          <div class="flashcard-face flashcard-front">
            <span class="flashcard-icon" id="fcIconFront">💡</span>
            <div class="flashcard-label">Question</div>
            <div class="flashcard-text" id="fcFrontText"></div>
            <div class="flashcard-hint">Tap the card to flip 👆</div>
          </div>
          <div class="flashcard-face flashcard-back">
            <span class="flashcard-icon" id="fcIconBack">💡</span>
            <div class="flashcard-label">Answer</div>
            <div class="flashcard-text" id="fcBackText"></div>
          </div>
        </div>
      </div>
      <div class="d-flex justify-content-between align-items-center mt-3 mx-auto" style="max-width:460px;">
        <button id="fcPrevBtn" class="btn btn-mq btn-mq-outline btn-sm">← Prev</button>
        <div class="flashcard-dots" id="fcDots"></div>
        <button id="fcNextBtn" class="btn btn-mq btn-mq-outline btn-sm">Next →</button>
      </div>
    </div>
  `;
}

function setupFlashcardEvents() {
  document.getElementById("flashcardEl").addEventListener("click", () => {
    mqFcFlipped = !mqFcFlipped;
    document.getElementById("flashcardEl").classList.toggle("flipped", mqFcFlipped);
  });

  document.getElementById("fcPrevBtn").addEventListener("click", (e) => {
    e.stopPropagation();
    mqFcIndex = (mqFcIndex - 1 + mqFlashcards.length) % mqFlashcards.length;
    mqFcFlipped = false;
    renderFlashcard();
  });

  document.getElementById("fcNextBtn").addEventListener("click", (e) => {
    e.stopPropagation();
    mqFcIndex = (mqFcIndex + 1) % mqFlashcards.length;
    mqFcFlipped = false;
    renderFlashcard();
  });
}

function renderFlashcard() {
  const fc = mqFlashcards[mqFcIndex];
  document.getElementById("fcIconFront").textContent = fc.icon || "💡";
  document.getElementById("fcIconBack").textContent = fc.icon || "💡";
  document.getElementById("fcFrontText").textContent = fc.front;
  document.getElementById("fcBackText").textContent = fc.back;
  document.getElementById("flashcardEl").classList.toggle("flipped", mqFcFlipped);

  document.getElementById("fcDots").innerHTML = mqFlashcards
    .map((_, i) => `<span class="flashcard-dot ${i === mqFcIndex ? "active" : ""}"></span>`)
    .join("");
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str ?? "";
  return div.innerHTML;
}
