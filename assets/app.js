/* =========================
File: assets/app.js (behavior + flourishes)
========================= */
'use strict';

// Fingerprinting gag (uses *some* real values for verisimilitude)
(function fakeFP(){
  const el = document.getElementById('fp-lines');
  if(!el) return;
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const lines = [
    'OLCM Compliance Terminal v1.4.2',
    'Establishing secure channel… OK',
    `User Agent: ${navigator.userAgent}`,
    `Viewport: ${window.innerWidth}x${window.innerHeight} @${window.devicePixelRatio}x`,
    `Language: ${navigator.language}`,
    `Time Zone: ${tz}`,
    'MAC: 00:1C:xx:xx:xx:xx (hash match) — OK',
    'IP: 10.0.•••.•• (tunneled) — Logged',
    'Cookie Jar: present — Indexed',
    'Behavioral Model: LOW‑RISK (subject to change)',
    '— — —',
    'Note: By reading this page you consent to digital fingerprinting for internal compliance.',
  ];
  let i=0;
  const tick = ()=>{
    el.textContent += `\n${lines[i++]}`;
    el.classList.add('caret');
    if(i < lines.length) setTimeout(tick, 320);
    else el.classList.remove('caret');
  };
  el.textContent = lines[0];
  setTimeout(tick, 500);
})();

// Gate logic
(function gate(){
  const cb = document.getElementById('accept');
  const go = document.getElementById('proceed');
  const name = document.getElementById('xname');
  const hint = document.getElementById('xname-hint');
  if(!cb||!go) return;

  function flagsOK(v){
    // heuristic: contains at least two emoji that are flags and not 🇺🇸
    const flags = Array.from(v).filter(ch => /\p{RI}/u.test(ch));
    const hasUSA = v.includes('🇺🇸');
    return flags.length >= 2 && !hasUSA;
  }
  function update(){
    const ok = cb.checked;
    go.disabled = !ok;
    if(name && name.value){
      if(flagsOK(name.value)){
        hint.textContent = 'Emoji compliance: PASS (non‑🇺🇸 flags detected).';
        hint.style.color = 'var(--ok)';
      } else {
        hint.textContent = 'Emoji compliance: pending — add two non‑🇺🇸 flag emojis to your username.';
        hint.style.color = 'var(--muted)';
      }
    } else { hint.textContent=''; }
  }
  cb.addEventListener('change', update);
  name && name.addEventListener('input', update);

  document.getElementById('attest').addEventListener('submit', (e)=>{
    e.preventDefault();
    if(!cb.checked) return;

    // Random extra screening chance (2%)
    if(Math.random() < 0.02){
      sessionStorage.removeItem('taiaa_ok');
      location.href = '/denied.html?code=418';
      return;
    }

    sessionStorage.setItem('taiaa_ok','1');

    // Optional: pass a secret URL via hash/param baked into the domain (edit later)
    const params = new URLSearchParams(location.search);
    const u = params.get('u');
    const target = u ? `/granted.html?u=${encodeURIComponent(u)}` : '/granted.html';
    location.href = target;
  });

  // Anti-bypass: if they try to jump away without accepting, boomerang them to denied
  document.addEventListener('keydown', (ev)=>{
    if((ev.ctrlKey||ev.metaKey) && ev.key.toLowerCase()==='p'){
      ev.preventDefault();
      alert('Printing disabled during active compliance review.');
    }
  });
})();
