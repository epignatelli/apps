'use strict';

const STORE = 'vb-scoreboard-v1';

// ── State ─────────────────────────────────────────────────────────────────────

let _state = {
  nameA:   'Team A',
  nameB:   'Team B',
  bestOf:  5,          // 3 or 5
  pointsA: 0,
  pointsB: 0,
  serving: 'a',
  sets:    [],         // [{a, b}] completed sets, in order
};

let _history = [];     // undo stack: array of _state snapshots

// ── Persistence ───────────────────────────────────────────────────────────────

function _save() {
  try { localStorage.setItem(STORE, JSON.stringify(_state)); } catch(e) {}
}

function _load() {
  try {
    const s = JSON.parse(localStorage.getItem(STORE));
    if (s && typeof s === 'object') _state = { ..._state, ...s };
  } catch(e) {}
}

function _copy(s) { return JSON.parse(JSON.stringify(s)); }

// ── Volleyball rules ──────────────────────────────────────────────────────────

function _setTarget() {
  // 5th set (index 4) plays to 15; all others to 25
  return _state.sets.length >= 4 ? 15 : 25;
}

function _isSetWon() {
  const { pointsA: a, pointsB: b } = _state;
  const t = _setTarget();
  return (a >= t || b >= t) && Math.abs(a - b) >= 2;
}

function _setsWon(team) {
  return _state.sets.filter(s => team === 'a' ? s.a > s.b : s.b > s.a).length;
}

function _toWin() { return Math.ceil(_state.bestOf / 2); }

function _matchOver() {
  return _setsWon('a') >= _toWin() || _setsWon('b') >= _toWin();
}

// ── Actions ───────────────────────────────────────────────────────────────────

function score(team) {
  if (_matchOver()) return;
  _history.push(_copy(_state));
  if (team === 'a') _state.pointsA++;
  else              _state.pointsB++;
  _state.serving = team;
  _save();
  render();
  if (_isSetWon()) _showSetWon();
}

function unscore(e, team) {
  e.stopPropagation();
  const pts = team === 'a' ? _state.pointsA : _state.pointsB;
  if (pts <= 0) return;
  _history.push(_copy(_state));
  if (team === 'a') _state.pointsA--;
  else              _state.pointsB--;
  _save();
  render();
}

function undo() {
  if (!_history.length) return;
  _state = _history.pop();
  _save();
  _hideOverlays();
  render();
}

function setServe(e, team) {
  e.stopPropagation();
  _state.serving = team;
  _save();
  render();
}

function nextSet() {
  const { pointsA: a, pointsB: b } = _state;
  _state.sets.push({ a, b });
  _state.pointsA = 0;
  _state.pointsB = 0;
  // winner of previous set serves first in the next set
  _state.serving = a > b ? 'a' : 'b';
  _hideOverlays();
  _save();
  render();
  if (_matchOver()) _showMatchWon();
}

function confirmNewMatch() {
  const hasProgress = _state.pointsA > 0 || _state.pointsB > 0 || _state.sets.length > 0;
  if (hasProgress && !confirm('Start a new match? Current score will be lost.')) return;
  _history = [];
  _state.sets    = [];
  _state.pointsA = 0;
  _state.pointsB = 0;
  _state.serving = 'a';
  _save();
  _hideOverlays();
  render();
}

function editName(e, team) {
  e.stopPropagation();
  const key = team === 'a' ? 'nameA' : 'nameB';
  const el  = document.getElementById(`name-${team}`);
  const old = _state[key];

  const input = document.createElement('input');
  input.type      = 'text';
  input.value     = old;
  input.className = 'name-input';
  input.maxLength = 20;
  el.replaceWith(input);
  input.focus();
  input.select();

  const commit = () => {
    _state[key] = input.value.trim() || old;
    _save();
    render();
  };
  input.addEventListener('blur', commit);
  input.addEventListener('keydown', ev => {
    if (ev.key === 'Enter') { ev.preventDefault(); input.blur(); }
    if (ev.key === 'Escape') { input.value = old; input.blur(); }
  });
}

// ── Overlays ──────────────────────────────────────────────────────────────────

function _hideOverlays() {
  document.querySelectorAll('.overlay').forEach(o => o.classList.add('hidden'));
}

function _showSetWon() {
  const { pointsA: a, pointsB: b, nameA, nameB } = _state;
  const winner  = a > b ? nameA : nameB;
  const setNum  = _state.sets.length + 1;
  const sA = _setsWon('a'), sB = _setsWon('b');

  document.getElementById('set-eyebrow').textContent  = `Set ${setNum} finished`;
  document.getElementById('set-headline').textContent = winner;
  document.getElementById('set-score-disp').textContent = `${a} – ${b}`;

  // Update sets-won counts immediately so the overlay reflects current tally
  // (sets not pushed yet — show what it will be after nextSet())
  document.getElementById('set-overlay').classList.remove('hidden');
}

function _showMatchWon() {
  const sA = _setsWon('a'), sB = _setsWon('b');
  const winner = sA > sB ? _state.nameA : _state.nameB;
  document.getElementById('match-headline').textContent  = winner;
  document.getElementById('match-score-disp').textContent = `${sA} – ${sB}`;
  document.getElementById('match-overlay').classList.remove('hidden');
}

// ── Render ────────────────────────────────────────────────────────────────────

function render() {
  const { nameA, nameB, pointsA, pointsB, serving, sets, bestOf } = _state;
  const sA = _setsWon('a'), sB = _setsWon('b');
  const setNum = sets.length + 1;
  const target = _setTarget();

  // Scores — add dim leading zero class when score < 10
  const scoreA = document.getElementById('score-a');
  const scoreB = document.getElementById('score-b');
  scoreA.textContent = pointsA;
  scoreB.textContent = pointsB;
  scoreA.classList.toggle('single', pointsA < 10);
  scoreB.classList.toggle('single', pointsB < 10);

  // Names (only update if not currently being edited)
  const nameElA = document.getElementById('name-a');
  const nameElB = document.getElementById('name-b');
  if (nameElA) nameElA.textContent = nameA;
  if (nameElB) nameElB.textContent = nameB;

  // Set wins
  document.getElementById('sets-a').textContent = sA;
  document.getElementById('sets-b').textContent = sB;

  // Serve dots
  document.getElementById('serve-a').classList.toggle('active', serving === 'a');
  document.getElementById('serve-b').classList.toggle('active', serving === 'b');

  // Topbar set label
  const setLabel = setNum <= bestOf
    ? `Set ${setNum} · Bo${bestOf}`
    : `Bo${bestOf}`;
  document.getElementById('set-label').textContent = setLabel;

  // Footer — set history
  const hist = document.getElementById('set-history');
  if (sets.length) {
    hist.innerHTML = sets.map(s => {
      const cls = s.a > s.b ? 'won-a' : 'won-b';
      return `<span class="set-hist-item ${cls}">${s.a}–${s.b}</span>`;
    }).join('<span class="set-hist-label"> · </span>');
  } else {
    hist.innerHTML = '';
  }

  // Footer — target info
  document.getElementById('target-label').textContent = `first to ${target}`;

  // Undo button
  document.getElementById('undo-btn').disabled = _history.length === 0;

  // Dim panels when match is over
  const done = _matchOver();
  document.getElementById('panel-a').classList.toggle('match-done', done);
  document.getElementById('panel-b').classList.toggle('match-done', done);
}

// ── Boot ──────────────────────────────────────────────────────────────────────

_load();
render();

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js').catch(() => {});
}
