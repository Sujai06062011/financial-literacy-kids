// =====================================================================
// Lesson page — ONE template that renders whichever lesson is requested
// via ?slug=... . This is the "one page, many lessons" pattern.
// =====================================================================

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

  const { data: existingProgress } = await supabaseClient
    .from("lesson_progress")
    .select("completed")
    .eq("user_id", profile.id)
    .eq("lesson_id", lesson.id)
    .maybeSingle();

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
    <hr />
    <div class="lesson-content">${paragraphs}</div>
    <hr />
    <div class="d-flex flex-column flex-sm-row gap-2 justify-content-center mt-3">
      ${
        alreadyCompleted
          ? `<span class="btn btn-mq btn-mq-outline disabled">✅ Lesson Completed</span>
             <a href="quiz.html?slug=${encodeURIComponent(lesson.slug)}" class="btn btn-mq btn-mq-primary">Retake Quiz</a>`
          : `<button id="completeBtn" class="btn btn-mq btn-mq-primary">I've Read This — Take the Quiz! (+20 🪙)</button>`
      }
    </div>
  `;

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

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str ?? "";
  return div.innerHTML;
}
