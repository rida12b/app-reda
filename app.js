// === Service Worker Registration ===
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js');
}

// === DOM References ===
const form = document.getElementById('prospection-form');
const btnPdf = document.getElementById('btn-pdf');
const btnReset = document.getElementById('btn-reset');

// === Set default date to today ===
document.getElementById('date-prospection').valueAsDate = new Date();

// === Helpers ===

/** Get value of a named input */
function val(name) {
  const el = form.elements[name];
  return el ? el.value.trim() : '';
}

/** Get selected radio value, resolving "autre" with its text field */
function radio(name) {
  const checked = form.querySelector(`input[name="${name}"]:checked`);
  if (!checked) return '';
  if (checked.value === 'autre') {
    const extra = val(name + 'Autre');
    return extra || 'Autre';
  }
  return checked.value;
}

/** Collect all form data into a structured object */
function collectData() {
  return {
    dateProspection: val('dateProspection'),
    modeProspection: radio('modeProspection'),
    zoneSecteur: val('zoneSecteur'),
    nomPrenom: val('nomPrenom'),
    qualite: radio('qualite'),
    adresse: val('adresse'),
    telephone: val('telephone'),
    email: val('email'),
    autreContact: val('autreContact'),
    typeBien: radio('typeBien'),
    urgence: radio('urgence'),
    commentaires: val('commentaires'),
    decision: radio('decision'),
    moyenContact: radio('moyenContact'),
    plagesHoraires: val('plagesHoraires'),
    observations: val('observations'),
  };
}

// === Validation ===

function validate() {
  let valid = true;

  // Clear previous errors
  form.querySelectorAll('.error').forEach((el) => el.classList.remove('error'));
  form.querySelectorAll('.error-msg').forEach((el) => el.remove());

  const dateEl = document.getElementById('date-prospection');
  if (!dateEl.value) {
    showError(dateEl, 'Date obligatoire');
    valid = false;
  }

  const nomEl = document.getElementById('nom-prenom');
  if (!nomEl.value.trim()) {
    showError(nomEl, 'Nom obligatoire');
    valid = false;
  }

  return valid;
}

function showError(el, msg) {
  el.classList.add('error');
  const span = document.createElement('span');
  span.className = 'error-msg';
  span.textContent = msg;
  el.parentNode.insertBefore(span, el.nextSibling);
}

// === PDF Generation ===

function generatePDF(data) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF('p', 'mm', 'a4');
  const W = 210;
  const marginL = 20;
  const marginR = 20;
  const contentW = W - marginL - marginR;
  let y = 20;

  // --- Helpers ---
  function checkPage(needed) {
    if (y + needed > 275) {
      doc.addPage();
      y = 20;
    }
  }

  function title(text) {
    checkPage(14);
    doc.setFillColor(26, 86, 50);
    doc.rect(marginL, y, contentW, 9, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(text, marginL + 4, y + 6.5);
    doc.setTextColor(0, 0, 0);
    y += 13;
  }

  function field(label, value) {
    checkPage(12);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    const labelText = label + ' : ';
    doc.text(labelText, marginL, y);
    const labelW = doc.getTextWidth(labelText) + 2;
    doc.setFont('helvetica', 'normal');
    const displayValue = value || '(non renseigne)';
    const valueW = doc.getTextWidth(displayValue);

    // If label + value would overflow, put value on next line
    if (labelW + valueW > contentW) {
      y += 5;
      const lines = doc.splitTextToSize(displayValue, contentW - 8);
      lines.forEach((line) => {
        checkPage(5);
        doc.text(line, marginL + 4, y);
        y += 5;
      });
      y += 1;
    } else {
      doc.text(displayValue, marginL + labelW, y);
      y += 6;
    }
  }

  // --- Header ---
  doc.setFontSize(9);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(120, 120, 120);
  doc.text('INSTITUT ÉNERGÉTIQUE DU PATRIMOINE', W / 2, y, { align: 'center' });
  y += 6;
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(26, 86, 50);
  doc.text('ANNEXE N°1 — FICHE DE PROSPECTION TYPE', W / 2, y, { align: 'center' });
  doc.setTextColor(0, 0, 0);
  y += 4;
  doc.setDrawColor(26, 86, 50);
  doc.setLineWidth(0.5);
  doc.line(marginL, y, W - marginR, y);
  y += 10;

  // --- Section 1 ---
  title('1 — IDENTIFICATION DE L\'APPORTEUR');
  field('Date de prospection', data.dateProspection);
  field('Mode de prospection', data.modeProspection);
  field('Zone / Secteur', data.zoneSecteur);

  // --- Section 2 ---
  title('2 — IDENTIFICATION DU PROSPECT');
  field('Nom / Prénom', data.nomPrenom);
  field('Qualité', data.qualite);
  field('Adresse du bien', data.adresse);
  field('Téléphone', data.telephone);
  field('Email', data.email);
  field('Autre contact', data.autreContact);

  // --- Section 3 ---
  title('3 — BESOINS DE TRAVAUX');
  field('Type de bien', data.typeBien);

  field('Urgence', data.urgence);
  field('Commentaires', data.commentaires);

  // --- Section 4 ---
  title('4 — ACCORD DU PROSPECT');
  field('Décision', data.decision);
  field('Moyen de contact privilégié', data.moyenContact);
  field('Plages horaires préférées', data.plagesHoraires);

  // --- Section 5 ---
  title('5 — OBSERVATIONS');

  checkPage(20);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  if (data.observations) {
    const lines = doc.splitTextToSize(data.observations, contentW - 8);
    lines.forEach((line) => {
      checkPage(5);
      doc.text(line, marginL + 4, y);
      y += 5;
    });
  } else {
    doc.text('—', marginL + 4, y);
    y += 5;
  }

  // --- Footer ---
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Fiche de prospection — Institut Énergétique du Patrimoine — Page ${i}/${pageCount}`,
      W / 2,
      290,
      { align: 'center' }
    );
    doc.setTextColor(0, 0, 0);
  }

  // --- Save via Blob for reliable download on all browsers (especially Android) ---
  const nom = data.nomPrenom.replace(/[^a-zA-Z0-9]/g, '_') || 'inconnu';
  const filename = `fiche_prospection_${nom}_${data.dateProspection || 'sd'}.pdf`;
  const blob = doc.output('blob');
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.type = 'application/pdf';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// === Event Listeners ===

btnPdf.addEventListener('click', () => {
  if (!validate()) {
    // Scroll to first error
    const firstError = form.querySelector('.error');
    if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }
  const data = collectData();
  generatePDF(data);
});

btnReset.addEventListener('click', () => {
  if (confirm('Effacer tous les champs ?')) {
    form.reset();
    document.getElementById('date-prospection').valueAsDate = new Date();
    form.querySelectorAll('.error').forEach((el) => el.classList.remove('error'));
    form.querySelectorAll('.error-msg').forEach((el) => el.remove());
  }
});
