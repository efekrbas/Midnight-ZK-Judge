/**
 * Midnight ZK-Judge — app.js
 * Vanilla JS simulation of the ZK proof generation & verification flow.
 */

'use strict';

/* ── Scoring formula (mirrors conceptual_contract_outline.ts) ── */
// Score = (credit * 5) + (income * 3) - (debt * 4)
const SCORE_MAX = 1500; // theoretical max for bar display
const THRESHOLD = 700;

/* ── Utilities ─────────────────────────────────────────────── */

function $(id) { return document.getElementById(id); }

function randomHex(len = 8) {
  return Array.from({ length: len }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join('');
}

function mockCommitment()  { return `0x${randomHex(8)}_${randomHex(4)}`; }
function mockNullifier()   { return `0x${randomHex(8)}_${randomHex(4)}`; }
function mockBlockNumber() { return `#${Math.floor(4_800_000 + Math.random() * 50_000).toLocaleString()}`; }

function now() {
  return new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

/* ── Logger ─────────────────────────────────────────────────── */
function log(msg, type = '') {
  const entries = $('log-entries');
  const e = document.createElement('div');
  e.className = 'log-entry fade-in';
  e.innerHTML = `<span class="log-ts">${now()}</span><span class="log-msg ${type}">${msg}</span>`;
  entries.appendChild(e);
  $('log-console').scrollTop = 9999;
}

/* ── Toast ──────────────────────────────────────────────────── */
function toast(msg, type = 'purple') {
  const icons = { teal: '#ico-check', red: '#ico-x', purple: '#ico-shield' };
  const container = $('toast-container');
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.innerHTML = `<svg width="12" height="12"><use href="${icons[type] || '#ico-alert'}"/></svg>${msg}`;
  container.appendChild(t);
  setTimeout(() => {
    t.style.transition = 'opacity 0.3s';
    t.style.opacity = '0';
    setTimeout(() => t.remove(), 320);
  }, 3000);
}

/* ── Stepper ────────────────────────────────────────────────── */
function setStep(active) {
  for (let i = 1; i <= 4; i++) {
    const el   = $(`step-${i}`);
    const num  = $(`step-num-${i}`);
    el.classList.remove('active', 'done', 'waiting');

    if (i < active) {
      el.classList.add('done');
      num.innerHTML = `<svg width="12" height="12"><use href="#ico-check"/></svg>`;
    } else if (i === active) {
      el.classList.add('active');
      num.textContent = i;
    } else {
      el.classList.add('waiting');
      num.textContent = i;
    }
  }
}

function resetAllSteps() {
  for (let i = 1; i <= 4; i++) {
    const el  = $(`step-${i}`);
    const num = $(`step-num-${i}`);
    el.classList.remove('active', 'done', 'waiting');
    el.classList.add('waiting');
    num.textContent = i;
  }
}

/* ── Network Nodes ──────────────────────────────────────────── */
function resetNetwork() {
  ['net-local', 'net-proof', 'net-chain'].forEach(id => {
    const el = $(id);
    el.classList.remove('active-teal', 'active-purple');
  });
  ['net-conn-1', 'net-conn-2'].forEach(id => {
    $(id).classList.remove('active');
  });
}

function activateNetwork(stage) {
  // stage 1: local active
  // stage 2: proof active + conn-1
  // stage 3: chain active + conn-2
  if (stage >= 1) $('net-local').classList.add('active-teal');
  if (stage >= 2) { $('net-proof').classList.add('active-purple'); $('net-conn-1').classList.add('active'); }
  if (stage >= 3) { $('net-chain').classList.add('active-teal'); $('net-conn-2').classList.add('active'); }
}

/* ── Proof Output ───────────────────────────────────────────── */
function showProofOutput(commitment, nullifier) {
  const placeholder = $('proof-placeholder');
  const lines       = $('proof-lines');
  placeholder.style.display = 'none';
  lines.style.display = 'block';
  lines.innerHTML = `
    <div class="proof-line fade-in">
      <span class="proof-line-key">commitment</span>
      <span class="proof-line-val">${commitment}</span>
      <span class="badge badge-purple" style="margin-left:auto;flex-shrink:0;">commitment</span>
    </div>
    <div class="proof-line fade-in" style="animation-delay:0.1s">
      <span class="proof-line-key">nullifier</span>
      <span class="proof-line-val">${nullifier}</span>
      <span class="badge badge-purple" style="margin-left:auto;flex-shrink:0;">nullifier</span>
    </div>
    <div class="proof-line fade-in" style="animation-delay:0.2s">
      <span class="proof-line-key">witness:</span>
      <span class="proof-line-tag">[REDACTED]</span>
    </div>
  `;
}

function clearProofOutput() {
  $('proof-placeholder').style.display = 'flex';
  $('proof-lines').style.display = 'none';
  $('proof-lines').innerHTML = '';
}

/* ── Score Bar ──────────────────────────────────────────────── */
function renderScoreBar(score, approved) {
  const section = $('score-bar-section');
  section.style.display = 'block';

  const fill   = $('score-bar-fill');
  const thr    = $('score-bar-thr');
  const valLbl = $('score-val-lbl');

  const pct    = Math.min(100, (score / SCORE_MAX) * 100);
  const thrPct = (THRESHOLD / SCORE_MAX) * 100;

  fill.style.width = pct + '%';
  fill.className = 'score-bar-fill' + (approved ? '' : ' failed');
  fill.style.background = approved ? 'var(--teal)' : 'var(--red)';
  thr.style.left = thrPct + '%';
  valLbl.textContent = score;
  valLbl.style.color = approved ? 'var(--teal)' : 'var(--red)';
}

/* ── Verdict Card ───────────────────────────────────────────── */
function showVerdict(score, threshold, approved, blockNum) {
  const card = $('verdict-card');
  card.className = 'verdict-card ' + (approved ? 'approved' : 'rejected');

  $('verdict-placeholder').style.display = 'none';
  $('verdict-content').style.display     = 'block';

  // Badge
  const badge = $('verdict-badge');
  if (approved) {
    badge.className = 'badge badge-teal';
    badge.innerHTML = `<svg width="10" height="10"><use href="#ico-check"/></svg>verified`;
  } else {
    badge.className = 'badge badge-red';
    badge.innerHTML = `<svg width="10" height="10"><use href="#ico-x"/></svg>rejected`;
  }

  $('verdict-block').textContent = blockNum;

  const dot  = $('verdict-dot');
  const word = $('verdict-word');
  dot.className  = 'verdict-dot ' + (approved ? 'teal' : 'red');
  word.className = 'verdict-word ' + (approved ? 'teal' : 'red');
  word.textContent = approved ? 'APPROVED' : 'REJECTED';

  // Normalize score display to 0–1 scale for familiar look
  const normScore = (score / 1000).toFixed(2);
  const normThr   = (threshold / 1000).toFixed(2);
  $('verdict-score').textContent     = normScore;
  $('verdict-threshold').textContent = normThr;

  const proofStatus = $('verdict-proof-status');
  if (approved) {
    proofStatus.innerHTML = `<svg width="11" height="11"><use href="#ico-check"/></svg>on-chain`;
    proofStatus.style.color = 'var(--teal)';
  } else {
    proofStatus.innerHTML = `<svg width="11" height="11"><use href="#ico-x"/></svg>rejected`;
    proofStatus.style.color = 'var(--red)';
  }
}

function clearVerdict() {
  $('verdict-card').className = 'verdict-card';
  $('verdict-placeholder').style.display = 'flex';
  $('verdict-content').style.display     = 'none';
}

/* ── History ────────────────────────────────────────────────── */
const evaluationHistory = [];

function addHistory(credit, income, debt, score, approved, commitment, blockNum) {
  evaluationHistory.unshift({ credit, income, debt, score, approved, commitment, blockNum, ts: now() });

  const empty = $('history-empty');
  const list  = $('history-list');
  empty.style.display = 'none';
  list.style.display  = 'flex';

  // Rebuild list (max 5 shown)
  list.innerHTML = '';
  evaluationHistory.slice(0, 5).forEach(h => {
    const item = document.createElement('div');
    item.className = 'history-item fade-in';
    item.innerHTML = `
      <div class="history-left">
        <div class="history-key">
          cr:${h.credit} · inc:${h.income} · dbt:${h.debt}
        </div>
        <div class="history-hash">${h.commitment}</div>
      </div>
      <div>
        <span class="badge ${h.approved ? 'badge-teal' : 'badge-red'}" style="margin-bottom:4px;display:flex;">
          ${h.approved ? 'APPROVED' : 'REJECTED'}
        </span>
        <div class="history-time">${h.ts}</div>
      </div>
    `;
    list.appendChild(item);
  });
}

/* ── Badges sync ────────────────────────────────────────────── */
function updateBadges(state) {
  // state: 'idle' | 'pending' | 'verified' | 'rejected'
  const badgeVerified = $('badge-verified');
  const badgePending  = $('badge-pending');

  if (state === 'pending') {
    badgePending.className  = 'badge badge-amber';
    badgeVerified.className = 'badge badge-gray';
  } else if (state === 'verified') {
    badgePending.className  = 'badge badge-gray';
    badgeVerified.className = 'badge badge-teal';
  } else if (state === 'rejected') {
    badgePending.className  = 'badge badge-gray';
    badgeVerified.className = 'badge badge-red';
    badgeVerified.innerHTML = `<svg width="10" height="10"><use href="#ico-x"/></svg>rejected`;
  } else {
    // idle
    badgePending.className  = 'badge badge-amber';
    badgeVerified.className = 'badge badge-teal';
    badgeVerified.innerHTML = `<svg width="10" height="10"><use href="#ico-check"/></svg>verified`;
  }
}

/* ── Main Flow ──────────────────────────────────────────────── */
let isRunning = false;

async function runProofFlow() {
  if (isRunning) return;

  // Read inputs
  const credit = parseFloat($('input-credit').value) || 0;
  const income = parseFloat($('input-income').value) || 0;
  const debt   = parseFloat($('input-debt').value)   || 0;

  isRunning = true;
  const btn = $('btn-generate');
  btn.disabled = true;
  btn.innerHTML = `<span class="btn-spinner"></span>Proving…`;
  btn.classList.add('btn-loading');

  // Reset UI
  clearProofOutput();
  clearVerdict();
  $('score-bar-section').style.display = 'none';
  resetAllSteps();
  resetNetwork();
  updateBadges('pending');

  // ── Step 1: Witness Prepared ──
  setStep(1);
  activateNetwork(1);
  log('1. Private witness loaded into local memory.', 'info');
  log(`   attr: credit=${credit}, income=${income}, debt=${debt}`);
  await sleep(700);

  // ── Step 2: AI Scoring (local) ──
  setStep(2);
  const score = (credit * 5) + (income * 3) - (debt * 4);
  log('2. Local AI inference complete.', 'info');
  log(`   computed score: ${score} (formula: credit×5 + income×3 - debt×4)`);
  await sleep(800);

  // ── Step 3: ZK Proof ──
  setStep(3);
  activateNetwork(2);
  log('3. Invoking ZK-SNARK prover...', 'info');
  await sleep(1000);

  const commitment = mockCommitment();
  const nullifier  = mockNullifier();
  showProofOutput(commitment, nullifier);
  log(`   commitment: ${commitment}`);
  log(`   nullifier : ${nullifier}`);
  log(`   witness   : [REDACTED — never leaves device]`);
  await sleep(600);

  // ── Step 4: On-Chain Verify ──
  setStep(4);
  activateNetwork(3);
  log('4. Broadcasting proof to Midnight Network...', 'info');
  await sleep(900);

  const approved   = score > THRESHOLD;
  const blockNum   = mockBlockNumber();

  renderScoreBar(score, approved);
  showVerdict(score, THRESHOLD, approved, blockNum);
  addHistory(credit, income, debt, score, approved, commitment, blockNum);
  updateBadges(approved ? 'verified' : 'rejected');

  if (approved) {
    log(`   ✓ ZK proof verified on-chain. Decision: APPROVED`, 'ok');
    log(`   block: ${blockNum}`, '');
    toast('Proof verified on-chain · APPROVED', 'teal');
  } else {
    log(`   ✗ Score ${score} < threshold ${THRESHOLD}. Decision: REJECTED`, 'err');
    log(`   block: ${blockNum}`, '');
    toast(`Score ${score} below threshold · REJECTED`, 'red');
  }

  // Finalize step 4 as done
  const step4 = $('step-4');
  const num4  = $('step-num-4');
  step4.classList.remove('active');
  step4.classList.add('done');
  num4.innerHTML = `<svg width="12" height="12"><use href="#ico-check"/></svg>`;
  $(`step-4`).querySelector('.step-desc').textContent = `block ${blockNum}`;

  isRunning = false;
  btn.disabled = false;
  btn.innerHTML = `<svg width="13" height="13"><use href="#ico-zap"/></svg>Generate Proof`;
  btn.classList.remove('btn-loading');
}

/* ── Reset ──────────────────────────────────────────────────── */
function resetAll() {
  if (isRunning) return;
  clearProofOutput();
  clearVerdict();
  resetAllSteps();
  resetNetwork();
  updateBadges('idle');
  $('score-bar-section').style.display = 'none';
  $('log-entries').innerHTML = `
    <div class="log-entry">
      <span class="log-ts">${now()}</span>
      <span class="log-msg info">system reset · awaiting proof generation</span>
    </div>
  `;
  toast('Interface reset', 'purple');
}

/* ── History Modal (simple panel toggle) ────────────────────── */
function viewHistory() {
  const list  = $('history-list');
  const empty = $('history-empty');
  if (evaluationHistory.length === 0) {
    toast('No evaluations yet — run a proof first', 'purple');
    return;
  }
  // Scroll to the history section
  list.scrollIntoView({ behavior: 'smooth', block: 'center' });
  list.style.outline = '0.5px solid var(--purple)';
  setTimeout(() => list.style.outline = '', 1500);
}

/* ── Event Listeners ────────────────────────────────────────── */
$('btn-generate').addEventListener('click', runProofFlow);
$('btn-reset').addEventListener('click', resetAll);
$('btn-history').addEventListener('click', viewHistory);

// Live threshold display (static for now, but wired for extensibility)
$('threshold-display').textContent = THRESHOLD;

// Set initial timestamp in console
$('log-init-ts').textContent = now();

// Input validation: clamp to reasonable ranges on blur
['input-credit', 'input-income', 'input-debt'].forEach(id => {
  $(id).addEventListener('blur', e => {
    const v = parseFloat(e.target.value);
    if (isNaN(v) || v < 0) e.target.value = 0;
    if (v > 500) e.target.value = 500;
  });
});
