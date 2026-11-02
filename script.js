/* ============ EDIT ME: ALL PLACEHOLDER CONTENT LIVES HERE ============ */
const CONFIG = {
  // Paste your Google Apps Script Web App URL here (see README). Until then, RSVPs CANNOT be saved.
  APPS_SCRIPT_URL: 'PASTE_YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE',

  // Bitmoji images live in assets/. 'height' scales a host relative to the other (1 = same height).
  // Intro text is shown exactly as written (line breaks kept).
  hosts: [
    { name: 'Devansh', image: 'devansh.png', height: 1,
      intro: `Namaste sabhi ko! 🙌 I'm Devansh, your favourite Diwali party host! I absolutely love hosting house parties, and don't worry, drinks are my department! A responsible drinker and officially in charge of your drinks. Not the most photogenic person, but definitely the one who'll be bombing all your pictures! Also, I'm the guy who makes sure everyone arrives as early as possible and leaves as late as possible.` },
    { name: 'Ishika', image: 'ishika.png', height: 0.96,
      intro: `Namaste ji🙏🏼, I’m Ishika, your other half of the Diwali party management team! Decor aur food meri zimmedari hai. But you can also reach out to me for three very important things: chatpate gaane, chatpati gossip aur chatpate dance moves. Teeno departments mein I’m always available.

Main thodi ‘apni favourite hoon’ jaisi insaan hoon. Toh thoda bahut judge bhi kar leti hoon. I know, buri aadat hai, isiliye pehle se hi maafi maang leti hoon. Thoda seh lena, guys. 😘

BUT, tumhe saath dena ho toh, it’ll just be sone pe suhaga.` }
  ]
};
/* ===================================================================== */

const $ = s => document.querySelector(s);
const wait = ms => new Promise(r => setTimeout(r, ms));
const PREVIEW = location.search.includes('preview'); // ?preview lets you click through without a backend (nothing is saved)
const STORE = 'diwaliRsvp.v1';

/* ---------- Screens ---------- */
function show(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.toggle('active', s.id === id));
  window.scrollTo(0, 0);
  document.querySelectorAll(`#${id} .reveal`).forEach(el => io.observe(el));
}
const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .15 });

/* ---------- Art ---------- */
function diya() {
  return `<svg class="diya" viewBox="0 0 60 56"><path class="flame" d="M30 26C21 15 28 9 30 0c2 9 9 15 0 26z" fill="#ffb347"/><path d="M4 26q26 34 52 0z" fill="#e2b84a"/><path d="M4 26h52" stroke="#b8862b" stroke-width="3"/></svg>`;
}
function fillDiyas() { ['#heroDiyas', '#finalDiyas', '#doorDiyas'].forEach(s => $(s).innerHTML = diya().repeat(s === '#doorDiyas' ? 5 : 3)); }

// Original Bitmoji image. If assets/<file> is missing it falls back to <file> in the site root.
function character(h) {
  const alt = h.image.split('/').pop();
  return `<img src="${h.image}" alt="${h.name}" onerror="this.onerror=null;this.src='${alt}'">`;
}

/* ---------- Particles ---------- */
const cv = $('#fx'), cx = cv.getContext('2d'); let W, H; const P = [];
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
function size() { W = cv.width = innerWidth; H = cv.height = innerHeight; }
addEventListener('resize', size); size();
function burst() {
  if (reduce) return;
  for (let i = 0; i < 140; i++) { const a = Math.random() * 6.283, s = 2 + Math.random() * 7;
    P.push({ x: W / 2, y: H / 2, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 2, r: 1.5 + Math.random() * 3, a: 1, b: 1, h: 38 + Math.random() * 14 }); }
}
(function loop() {
  cx.clearRect(0, 0, W, H);
  if (!reduce && P.filter(p => !p.b).length < 35 && Math.random() < .15)
    P.push({ x: Math.random() * W, y: H + 8, vx: (Math.random() - .5) * .4, vy: -.4 - Math.random() * .7, r: 1 + Math.random() * 2.2, a: .2 + Math.random() * .5, h: 28 + Math.random() * 20 });
  for (let i = P.length - 1; i >= 0; i--) { const p = P[i];
    p.x += p.vx; p.y += p.vy; if (p.b) { p.vy += .09; p.vx *= .985; p.a -= .011; }
    if (p.a <= 0 || p.y < -10) { P.splice(i, 1); continue; }
    cx.globalAlpha = p.a; cx.fillStyle = `hsl(${p.h},95%,62%)`; cx.beginPath(); cx.arc(p.x, p.y, p.r, 0, 6.283); cx.fill(); }
  requestAnimationFrame(loop);
})();

/* ---------- Screen 1: hosts ---------- */
function renderHosts() {
  $('#hostGrid').innerHTML = CONFIG.hosts.map((h, i) =>
    `<button class="host" data-i="${i}" style="--k:${h.height || 1}" aria-label="Meet ${h.name}">${character(h)}<span class="host-name">${h.name}</span></button>`).join('');
  document.querySelectorAll('.host').forEach(b => b.onclick = () => openHost(+b.dataset.i));
}
function openHost(i) {
  const h = CONFIG.hosts[i];
  $('#detailAvatar').innerHTML = character(h);
  $('#detailName').textContent = h.name; $('#detailIntro').textContent = h.intro;
  $('#hostPick').hidden = true; $('#hostDetail').hidden = false; window.scrollTo(0, 0);
}
$('#backBtn').onclick = () => { $('#hostDetail').hidden = true; $('#hostPick').hidden = false; window.scrollTo(0, 0); };

/* ---------- Screen 2: invitation + door transition ---------- */
async function enterInvite() {
  const d = $('#doors'); d.className = 'on'; await wait(40);
  d.classList.add('closed'); await wait(1000);
  d.classList.add('lit'); await wait(1300);
  show('invite'); d.classList.add('open'); burst(); setTimeout(burst, 1100); await wait(1300);
  d.className = '';
}
$('#skipBtn').onclick = enterInvite;
$('#toRsvp').onclick = () => show('rsvp');
$('#rsvpBack').onclick = () => show('invite');

/* ---------- Screen 3: RSVP ---------- */
const form = $('#rsvpForm'); let attending = null, busy = false;
const saved = () => { try { return JSON.parse(localStorage.getItem(STORE)); } catch { return null; } };
const uid = () => (crypto.randomUUID ? crypto.randomUUID() : Date.now() + '-' + Math.random().toString(16).slice(2));
let submissionId = (saved() || {}).id || uid();

function choose(yes) {
  attending = yes; form.hidden = false;
  $('#yesBtn').setAttribute('aria-pressed', yes); $('#noBtn').setAttribute('aria-pressed', !yes);
  document.querySelector('.yesOnly').hidden = !yes; document.querySelector('.noOnly').hidden = yes;
  clearErrors(); $('#formBanner').hidden = true;
}
$('#yesBtn').onclick = () => choose(true); $('#noBtn').onclick = () => choose(false);

function initRsvpState() {
  const s = saved();
  if (s && !PREVIEW) {
    $('#dupNotice').hidden = false; $('#rsvpBody').hidden = true;
    $('#dupText').textContent = `You've already responded as ${s.name} (${s.attending ? 'attending' : 'not attending'}).`;
  }
}
$('#updateBtn').onclick = () => { $('#dupNotice').hidden = true; $('#rsvpBody').hidden = false; };

function setErr(k, m) { const el = document.querySelector(`.err[data-for="${k}"]`); if (el) { el.textContent = m; el.closest('.field').classList.add('bad'); } }
function clearErrors() { document.querySelectorAll('.err').forEach(e => { e.textContent = ''; e.closest('.field').classList.remove('bad'); }); }

function validate() {
  clearErrors(); let ok = true; const bad = (k, m) => { setErr(k, m); ok = false; };
  const name = form.name.value.trim().replace(/\s+/g, ' ');
  if (name.length < 2 || !/\p{L}/u.test(name)) bad('name', 'Enter your full name.');
  if (attending) {
    const g = Number(form.guests.value);
    if (!Number.isInteger(g) || g < 1 || g > 20) bad('guests', 'Enter a whole number from 1 to 20.');
    if (!form.overnight.value) bad('overnight', 'Choose Yes or No.');
    if (!form.diet.value) bad('diet', 'Select a dietary preference.');
  }
  return ok;
}

async function send(p) {
  const url = CONFIG.APPS_SCRIPT_URL;
  if (url.startsWith('PASTE_')) {
    if (PREVIEW) return;
    throw new Error('RSVP saving is not set up yet: the Google Apps Script URL has not been added.');
  }
  const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), 20000);
  try {
    // text/plain avoids a CORS preflight, which Apps Script does not support.
    const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(p), signal: ctl.signal });
    const j = await r.json();
    if (!j.ok) throw new Error(j.error || 'The server rejected the RSVP.');
  } catch (e) {
    throw new Error(e.name === 'AbortError' ? 'The request timed out. Check your connection and try again.' : e.message || 'Could not reach the server.');
  } finally { clearTimeout(t); }
}

form.onsubmit = async ev => {
  ev.preventDefault(); if (busy || attending === null || !validate()) return;
  const name = form.name.value.trim().replace(/\s+/g, ' ');
  const payload = attending
    ? { id: submissionId, name, attending: 'Yes', guests: Number(form.guests.value), overnight: form.overnight.value, diet: form.diet.value, comments: form.comments.value.trim(), submittedAt: new Date().toISOString() }
    : { id: submissionId, name, attending: 'No', guests: 0, overnight: '', diet: '', comments: form.message.value.trim(), submittedAt: new Date().toISOString() };
  busy = true; $('#submitBtn').disabled = true; $('#submitBtn').textContent = 'SENDING…'; $('#formBanner').hidden = true;
  try {
    await send(payload);               // success is shown ONLY after the backend confirms
    if (!PREVIEW) localStorage.setItem(STORE, JSON.stringify({ id: submissionId, name, attending }));
    finish(name, attending); 
  } catch (e) {
    $('#formBanner').textContent = `Your RSVP was not sent. ${e.message}`; $('#formBanner').hidden = false;
  } finally { busy = false; $('#submitBtn').disabled = false; $('#submitBtn').textContent = 'SEND MY RSVP'; }
};

/* ---------- Screens 4 & 5 ---------- */
function finish(name, yes) {
  $('#previewNote').hidden = !(PREVIEW && CONFIG.APPS_SCRIPT_URL.startsWith('PASTE_'));
  if (yes) {
    $('#finalHead').textContent = `Thank you, ${name}!`;
    $('#finalText').textContent = "You're officially on the guest list. See you at the Diwali party!";
    show('mission');
  } else {
    $('#finalHead').textContent = `We'll miss you, ${name}`;
    $('#finalText').textContent = 'Thank you for letting us know. Wishing you a bright, sweet and joyful Diwali. Save us some mithai!';
    show('final');
  }
}
$('#envelope').onclick = function () {
  this.classList.remove('shake'); void this.offsetWidth; this.classList.add('shake'); burst();
  $('#missionHint').textContent = 'Sealed until the party. Your mission will be revealed soon.';
};
$('#toFinal').onclick = () => show('final');
$('#viewAgain').onclick = () => show('invite');

/* ---------- Init ---------- */
fillDiyas(); renderHosts(); initRsvpState();
