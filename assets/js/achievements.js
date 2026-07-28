// =====================================================================
// Achievements page — badges grid + certificate generation (PDF)
// =====================================================================

let mqAchProfile = null;

(async function initAchievements() {
  mqAchProfile = await getCurrentProfile();
  if (!mqAchProfile) return;
  renderNavbar(mqAchProfile);

  await renderBadges(mqAchProfile.id);
  await renderCertificate(mqAchProfile.id);
})();

async function renderBadges(userId) {
  const grid = document.getElementById("badgesGrid");

  const [{ data: allBadges }, { data: earned }] = await Promise.all([
    supabaseClient.from("badges").select("*"),
    supabaseClient.from("user_badges").select("badge_id, earned_at").eq("user_id", userId),
  ]);

  const earnedMap = new Map((earned || []).map((e) => [e.badge_id, e.earned_at]));

  if (!allBadges || allBadges.length === 0) {
    grid.innerHTML = `<div class="col-12 text-mq-ink-soft">No badges configured yet.</div>`;
    return;
  }

  grid.innerHTML = allBadges
    .map((badge) => {
      const isEarned = earnedMap.has(badge.id);
      return `
        <div class="col-6 col-md-4 col-lg-2">
          <div class="badge-tile ${isEarned ? "earned" : ""}" title="${escapeHtml(badge.description || "")}">
            <span class="badge-icon">${badge.icon || "🏅"}</span>
            <div class="fw-semibold small">${escapeHtml(badge.name)}</div>
            <div class="small text-mq-ink-soft">${isEarned ? "Earned!" : "Locked"}</div>
          </div>
        </div>
      `;
    })
    .join("");
}

async function renderCertificate(userId) {
  const card = document.getElementById("certificateCard");

  const [{ data: lessons }, { data: progress }, { data: results }, { data: existingCert }] = await Promise.all([
    supabaseClient.from("lessons").select("id"),
    supabaseClient.from("lesson_progress").select("lesson_id,completed").eq("user_id", userId).eq("completed", true),
    supabaseClient.from("quiz_results").select("percentage").eq("user_id", userId),
    supabaseClient.from("certificates").select("*").eq("user_id", userId).maybeSingle(),
  ]);

  const totalLessons = lessons?.length || 0;
  const completedLessons = progress?.length || 0;
  const allDone = totalLessons > 0 && completedLessons >= totalLessons;

  const avgScore = results && results.length
    ? Math.round(results.reduce((sum, r) => sum + Number(r.percentage), 0) / results.length)
    : 0;

  if (!allDone) {
    card.innerHTML = `
      <p class="mb-2">Complete all <strong>${totalLessons}</strong> lessons to unlock your certificate.</p>
      <div class="mq-progress mb-2"><div class="mq-progress-fill" style="width:${totalLessons ? (completedLessons / totalLessons) * 100 : 0}%"></div></div>
      <p class="small text-mq-ink-soft mb-0">${completedLessons} / ${totalLessons} lessons completed</p>
    `;
    return;
  }

  let cert = existingCert;
  if (!cert) {
    const certNo = `MQK-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const { data: created } = await supabaseClient
      .from("certificates")
      .insert({ user_id: userId, certificate_no: certNo, score: avgScore })
      .select()
      .single();
    cert = created;
  }

  card.innerHTML = `
    <div class="text-center">
      <div class="mq-emoji-lg">🎓</div>
      <h4>Congratulations, ${escapeHtml(mqAchProfile.name)}!</h4>
      <p class="text-mq-ink-soft">Certificate No. ${cert?.certificate_no || ""} · Average Score ${avgScore}%</p>
      <button id="downloadCertBtn" class="btn btn-mq btn-mq-primary mt-2">Download PDF 📄</button>
    </div>
  `;

  document.getElementById("downloadCertBtn").addEventListener("click", () => {
    generateCertificatePdf(mqAchProfile, cert, avgScore);
  });
}

function generateCertificatePdf(profile, cert, avgScore) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });

  const w = doc.internal.pageSize.getWidth();
  const h = doc.internal.pageSize.getHeight();

  doc.setFillColor(246, 244, 255);
  doc.rect(0, 0, w, h, "F");

  doc.setDrawColor(124, 77, 255);
  doc.setLineWidth(6);
  doc.rect(24, 24, w - 48, h - 48);

  doc.setTextColor(94, 53, 177);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(34);
  doc.text("MoneyQuest Kids", w / 2, 100, { align: "center" });

  doc.setFontSize(18);
  doc.setTextColor(107, 103, 144);
  doc.text("Certificate of Completion", w / 2, 135, { align: "center" });

  doc.setTextColor(45, 42, 74);
  doc.setFontSize(14);
  doc.text("This certifies that", w / 2, 190, { align: "center" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(30);
  doc.setTextColor(0, 191, 166);
  doc.text(profile.name || "Student", w / 2, 230, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(14);
  doc.setTextColor(45, 42, 74);
  doc.text(
    "has successfully completed all 9 MoneyQuest Kids financial literacy modules",
    w / 2,
    270,
    { align: "center" }
  );
  doc.text(`with an average quiz score of ${avgScore}%`, w / 2, 292, { align: "center" });

  doc.setFontSize(11);
  doc.setTextColor(107, 103, 144);
  doc.text(`Certificate No: ${cert?.certificate_no || ""}`, w / 2, 340, { align: "center" });
  doc.text(`Issued on: ${new Date().toLocaleDateString("en-IN")}`, w / 2, 358, { align: "center" });

  doc.save(`MoneyQuestKids-Certificate-${profile.name || "student"}.pdf`);
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str ?? "";
  return div.innerHTML;
}
