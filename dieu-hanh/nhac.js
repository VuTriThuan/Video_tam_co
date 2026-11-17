// Nhạc nền + âm báo cho Phòng điều hành.
// Nhạc tạo bằng Web Audio ngay trên trình duyệt (không file ngoài, không bản quyền, không lặp y hệt).
// Âm báo dùng assets/sfx (cũng tự tổng hợp bằng pipeline/sfx.py).
(() => {
"use strict";
const ls = (k, d) => { try { const v = localStorage.getItem(k); return v === null ? d : v; } catch { return d; } };
const luu = (k, v) => { try { localStorage.setItem(k, v); } catch {} };
const ST = { bai: ls('nhac_bai', 'dem'), am: +ls('nhac_am', '0.5'), bat: ls('nhac_bat', '0') === '1', bao: ls('nhac_bao', '1') === '1' };

let ac, chinh, busNhac, locNhac, busBao, vang, nhieu, henLap = 0, buoc = 0, tGio = 0, bai = null, nen = [], dangChay = false, dipBao = 0;
const xem = new Set();
const hz = m => 440 * 2 ** ((m - 69) / 12);
const ngau = a => a[Math.random() * a.length | 0];
const co = p => Math.random() < p;

function khoi() {
  if (ac) return;
  ac = new (window.AudioContext || window.webkitAudioContext)();
  const nen = ac.createDynamicsCompressor(); nen.threshold.value = -16; nen.ratio.value = 3; nen.connect(ac.destination);
  chinh = ac.createGain(); chinh.connect(nen);
  locNhac = ac.createBiquadFilter(); locNhac.type = 'lowpass'; locNhac.frequency.value = 5000; locNhac.connect(chinh);
  busNhac = ac.createGain(); busNhac.gain.value = 0; busNhac.connect(locNhac);
  busBao = ac.createGain(); busBao.gain.value = 0.6; busBao.connect(chinh);
  // phòng vang: nhiễu tắt dần
  const n = ac.sampleRate * 2.6 | 0, b = ac.createBuffer(2, n, ac.sampleRate);
  for (let c = 0; c < 2; c++) { const d = b.getChannelData(c); for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n) ** 3; }
  vang = ac.createConvolver(); vang.buffer = b; const vg = ac.createGain(); vg.gain.value = 0.4; vang.connect(vg); vg.connect(busNhac);
  nhieu = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate);
  { const d = nhieu.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; }
}

/* ---------- nhạc cụ ---------- */
function ra(node, uot = 0.3) {
  node.connect(busNhac);
  if (uot) { const g = ac.createGain(); g.gain.value = uot; node.connect(g); g.connect(vang); }
}
const daoDong = (loai, f, t, het, lech = 0) => { const o = ac.createOscillator(); o.type = loai; o.frequency.value = f; o.detune.value = lech; o.start(t); o.stop(het); return o; };

// phím điện kiểu Rhodes, hơi lệch cao độ như băng cũ
function phim(t, m, v = 0.12, dai = 1.8, uot = 0.35, sang = 2200) {
  const f = hz(m), lech = (Math.random() - 0.5) * 12, g = ac.createGain(), g2 = ac.createGain(), lp = ac.createBiquadFilter();
  lp.type = 'lowpass'; lp.frequency.value = sang;
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + 0.008);
  g.gain.exponentialRampToValueAtTime(v * 0.35, t + 0.35); g.gain.exponentialRampToValueAtTime(0.0005, t + dai);
  g2.gain.setValueAtTime(v * 0.6, t); g2.gain.exponentialRampToValueAtTime(0.0005, t + 0.45);
  daoDong('sine', f, t, t + dai + 0.05, lech).connect(g);
  daoDong('triangle', f, t, t + dai + 0.05, lech + 5).connect(g);
  daoDong('sine', f * 2, t, t + 0.5, lech).connect(g2); g2.connect(g);
  g.connect(lp); ra(lp, uot);
}
function hopAm(t, ms, v, dai, raI = 0.025, uot, sang) { ms.forEach((m, i) => phim(t + i * raI + Math.random() * 0.008, m, v * (0.85 + Math.random() * 0.3), dai, uot, sang)); }

// nền đệm: hai sóng răng cưa lệch nhau, lọc mềm
function dem(t, ms, dai, v = 0.03, cat = 900) {
  const g = ac.createGain(), lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = cat; lp.Q.value = 0.4;
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + dai * 0.3); g.gain.setValueAtTime(v, t + dai * 0.75); g.gain.linearRampToValueAtTime(0, t + dai + 0.8);
  for (const m of ms) for (const d of [-9, 9]) daoDong('sawtooth', hz(m), t, t + dai + 0.9, d).connect(g);
  g.connect(lp); ra(lp, 0.6);
}
function tram(t, m, v = 0.22, dai = 0.6, cat = 520) {
  const g = ac.createGain(), lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = cat;
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0008, t + dai);
  daoDong('triangle', hz(m), t, t + dai + 0.05).connect(lp); daoDong('sine', hz(m), t, t + dai + 0.05).connect(lp);
  lp.connect(g); ra(g, 0.04);
}
function chuong(t, m, v = 0.06, dai = 3, uot = 0.7, ra2) {
  for (const [r, a] of [[1, 1], [2.01, 0.3], [3.99, 0.1]]) {
    const g = ac.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v * a, t + 0.004); g.gain.exponentialRampToValueAtTime(0.0004, t + dai / r);
    daoDong('sine', hz(m) * r, t, t + dai / r + 0.05).connect(g);
    if (ra2) g.connect(ra2); else ra(g, uot);
  }
}
function trongCai(t, v = 0.45) {
  const o = ac.createOscillator(), g = ac.createGain();
  o.frequency.setValueAtTime(120, t); o.frequency.exponentialRampToValueAtTime(44, t + 0.13);
  g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.0008, t + 0.38);
  o.connect(g); ra(g, 0); o.start(t); o.stop(t + 0.42);
}
function on(t, { v = 0.08, dai = 0.05, loai = 'highpass', f = 7500, q = 0.7, uot = 0.08, len = 0.002 } = {}) {
  const s = ac.createBufferSource(), b = ac.createBiquadFilter(), g = ac.createGain();
  s.buffer = nhieu; b.type = loai; b.frequency.value = f; b.Q.value = q;
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + len); g.gain.exponentialRampToValueAtTime(0.0008, t + dai);
  s.connect(b); b.connect(g); ra(g, uot); s.start(t, Math.random() * 1.5); s.stop(t + dai + 0.03);
}

// âm nền chạy liên tục: tiếng đĩa than, tiếng mưa
function vongNen(taoBuf, loc, v) {
  const s = ac.createBufferSource(); s.buffer = taoBuf(); s.loop = true;
  const g = ac.createGain(); g.gain.setValueAtTime(0, ac.currentTime); g.gain.linearRampToValueAtTime(v, ac.currentTime + 2);
  let dau = s; for (const [loai, f] of loc) { const b = ac.createBiquadFilter(); b.type = loai; b.frequency.value = f; dau.connect(b); dau = b; }
  dau.connect(g); g.connect(busNhac); s.start(); nen.push(s);
}
const dia = () => { const n = ac.sampleRate * 5, b = ac.createBuffer(1, n, ac.sampleRate), d = b.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * 0.05 + (Math.random() < 0.00035 ? (Math.random() * 2 - 1) * 0.9 : 0); return b; };
const mua = () => { const n = ac.sampleRate * 6, b = ac.createBuffer(2, n, ac.sampleRate);
  for (let c = 0; c < 2; c++) { const d = b.getChannelData(c); let p = 0; for (let i = 0; i < n; i++) { p = p * 0.97 + (Math.random() * 2 - 1) * 0.03; d[i] = p * 6 + (Math.random() < 0.0012 ? (Math.random() * 2 - 1) * 0.5 : 0); } } return b; };

/* ---------- ba bài ---------- */
// mỗi bài: nhịp, độ lắc, bộ lọc chung, vòng hợp âm, hàm gọi cho từng nốt móc kép (16 bước/ô nhịp)
const BAI = {
  dem: {
    ten: 'Đêm suy ngẫm', ta: 'Lo-fi piano chậm, trống nhẹ, tiếng đĩa than. Hợp lúc đọc kịch bản.',
    bpm: 72, lac: s => s % 2 ? 0.22 : 0, loc: 3800,
    vong: [[45, [57, 60, 64, 67, 71]], [41, [57, 60, 64, 67]], [48, [55, 59, 64, 67]], [43, [55, 59, 62, 64]]],
    ganh: [69, 72, 74, 76, 79, 81], nen() { vongNen(dia, [['bandpass', 2500]], 0.35); },
    buoc(s, o, t, d) {
      const [goc, ms] = this.vong[o % 4];
      if (s === 0) { hopAm(t, ms, 0.075, d * 18); tram(t, goc, 0.24, d * 7); this.giai = this.giai ?? 2; }
      if (s === 10 && co(0.55)) hopAm(t, ms.slice(1), 0.05, d * 6, 0.02);
      if (s === 10 && co(0.6)) tram(t, goc + ngau([0, 7, 12]), 0.18, d * 4);
      if ([0, 7, 10].includes(s) && (s !== 7 || co(0.5))) trongCai(t, s === 0 ? 0.42 : 0.3);
      if (s === 4 || s === 12) { on(t, { v: 0.09, dai: 0.18, loai: 'bandpass', f: 1800, q: 0.9, uot: 0.2 }); trongCai(t, 0.06); }
      if (s % 2 === 0 && co(0.85)) on(t, { v: s % 4 ? 0.022 : 0.035, dai: 0.04 });
      if (s % 2 === 0 && s && co(0.2)) { this.giai = Math.max(0, Math.min(5, this.giai + ngau([-2, -1, 1, 1, 2]))); phim(t, this.ganh[this.giai], 0.06, d * 10, 0.5, 2600); }
    }
  },
  'tham-tu': {
    ten: 'Thám tử', ta: 'Jazz đêm: bass đi bộ, chổi trống, hợp âm thứ bí ẩn. Hợp chủ đề "vạch chiêu".',
    bpm: 84, lac: s => s % 4 === 2 ? 0.34 : 0, loc: 4200,
    vong: [[38, [53, 57, 61, 64]], [38, [53, 57, 59, 62]], [43, [53, 58, 62, 65]], [45, [55, 58, 61, 64]]],
    ganh: [62, 64, 65, 67, 69, 70, 73, 74, 77],
    nen() { vongNen(dia, [['bandpass', 2200]], 0.18); },
    buoc(s, o, t, d) {
      const [goc, ms] = this.vong[o % 4], sau = this.vong[(o + 1) % 4][0];
      if (s % 4 === 0) { // bass đi bộ bốn phách
        const p = s / 4, n = p === 0 ? goc : p === 3 ? sau + ngau([1, -1]) : goc + ngau(p === 1 ? [3, 7, 12] : [7, 10, 12]);
        tram(t, n, 0.26, d * 3.6, 700);
        on(t, { v: 0.03, dai: d * 3, loai: 'bandpass', f: 3500, q: 0.5, len: d * 1.2, uot: 0.1 }); // chổi quét
      }
      if ([0, 4, 6, 8, 12, 14].includes(s)) on(t, { v: s % 4 === 2 ? 0.018 : 0.03, dai: 0.28, f: 6500, uot: 0.15 }); // ride
      if ((s === 4 || s === 12) && co(0.7)) on(t, { v: 0.035, dai: 0.06, loai: 'bandpass', f: 2200, q: 1.2 });
      if ([6, 10, 14].includes(s) && co(0.3)) hopAm(t, ms, 0.06, d * 3, 0.012, 0.4, 1800);
      if (s === 0 && co(0.4)) hopAm(t, ms, 0.05, d * 10, 0.03, 0.5, 1600);
      if (s % 2 === 0 && co(0.13)) { this.giai = Math.max(0, Math.min(8, (this.giai ?? 4) + ngau([-2, -1, 1, 2]))); chuong(t, this.ganh[this.giai], 0.045, 2.2, 0.6); }
    }
  },
  mua: {
    ten: 'Mưa ngoài cửa', ta: 'Không trống, nền êm, chuông lác đác, tiếng mưa. Hợp lúc cần tập trung.',
    bpm: 60, lac: () => 0, loc: 6000,
    vong: [[36, [60, 64, 67, 71, 74]], [33, [57, 60, 64, 67, 71]], [29, [57, 60, 64, 65, 69]], [31, [55, 60, 62, 67]]],
    ganh: [72, 74, 76, 79, 81, 84, 86, 88],
    nen() { vongNen(mua, [['highpass', 350], ['lowpass', 2600]], 0.22); },
    buoc(s, o, t, d) {
      const [goc, ms] = this.vong[(o >> 1) % 4];
      if (s === 0 && o % 2 === 0) { dem(t, ms, d * 32, 0.022, 1100); tram(t, goc + 12, 0.12, d * 24, 300); }
      if (s % 2 === 0 && co(0.09)) chuong(t, ngau(this.ganh), 0.04, 4, 0.85);
      if (s === 8 && co(0.25)) hopAm(t, ms.slice(-3), 0.03, d * 14, 0.12, 0.7, 1500);
    }
  }
};

/* ---------- điều khiển ---------- */
const dangXem = () => { for (const v of xem) if (!v.isConnected || v.paused || v.muted) xem.delete(v); return xem.size > 0; };
function capAm() {
  if (!ac) return;
  const muc = dangChay ? ST.am ** 1.6 * 0.9 * (dangXem() ? 0.1 : 1) * (Date.now() < dipBao ? 0.4 : 1) : 0;
  busNhac.gain.cancelScheduledValues(ac.currentTime); busNhac.gain.setTargetAtTime(muc, ac.currentTime, dangChay ? 0.35 : 0.25);
}
function lap() {
  const truoc = document.hidden ? 1.6 : 0.3, d = 60 / bai.bpm / 4;
  if (tGio < ac.currentTime) { tGio = ac.currentTime + 0.05; } // lỡ nhịp (máy bận) thì bắt lại, không dồn nốt
  while (tGio < ac.currentTime + truoc) { const s = buoc % 16; bai.buoc(s, buoc >> 4, tGio + bai.lac(s) * d, d); buoc++; tGio += d; }
}
function chay() {
  khoi(); ac.resume();
  if (dangChay) return;
  bai = BAI[ST.bai] || BAI.dem; bai.giai = undefined;
  locNhac.frequency.setValueAtTime(bai.loc, ac.currentTime);
  buoc = 0; tGio = ac.currentTime + 0.15; dangChay = true;
  bai.nen(); lap(); henLap = setInterval(lap, 60); capAm(); ve();
}
function dung(roi) {
  if (!dangChay) return;
  dangChay = false; clearInterval(henLap); capAm();
  const cu = nen; nen = [];
  setTimeout(() => { cu.forEach(s => { try { s.stop(); } catch {} }); roi?.(); }, 1100);
  ve();
}
const batTat = () => { ST.bat = !dangChay; luu('nhac_bat', ST.bat ? '1' : '0'); ST.bat ? chay() : dung(); };
function chonBai(id) {
  ST.bai = id; luu('nhac_bai', id); ST.bat = true; luu('nhac_bat', '1');
  if (dangChay) dung(chay); else chay();
  ve();
}

/* ---------- âm báo ---------- */
const sfx = {};
const napSfx = ten => sfx[ten] ??= fetch(`/tep/assets/sfx/${ten}.wav`).then(r => r.arrayBuffer()).then(b => ac.decodeAudioData(b)).catch(() => null);
async function phatSfx(ten, t, toc = 1, v = 1) {
  const b = await napSfx(ten); if (!b) return;
  const s = ac.createBufferSource(), g = ac.createGain(); s.buffer = b; s.playbackRate.value = toc; g.gain.value = v;
  s.connect(g); g.connect(busBao); s.start(Math.max(t, ac.currentTime));
}
const BAO = {
  duyet: { ten: 'Có việc chờ duyệt', phat(t) { phatSfx('ding', t, 1, 0.9); phatSfx('ding', t + 0.28, 1.26, 0.9); } },
  hai: { ten: 'Anh Hải trả lời xong', phat(t) { phatSfx('tin-nhan', t, 1, 0.9); } },
  dung: { ten: 'Máy dựng xong video', phat(t) { [60, 64, 67, 72].forEach((m, i) => chuong(t + i * 0.12, m + 12, 0.16, 1.8, 0, busBao)); phatSfx('pop', t + 0.5, 1, 0.6); } }
};
function bao(loai, thu) {
  if (!BAO[loai] || (!ST.bao && !thu) || !ac || ac.state !== 'running') return;
  dipBao = Date.now() + 1800; capAm(); setTimeout(capAm, 1900);
  BAO[loai].phat(ac.currentTime + 0.05);
}

// trình duyệt chỉ cho phát tiếng sau khi người dùng bấm: lần bấm đầu tiên mở âm thanh, đang bật nhạc từ trước thì phát tiếp
const moKhoa = () => {
  khoi(); ac.resume().then(() => { ['ding', 'tin-nhan', 'pop'].forEach(napSfx); });
  if (ST.bat) chay();
  removeEventListener('pointerdown', moKhoa, true); removeEventListener('keydown', moKhoa, true);
};
addEventListener('pointerdown', moKhoa, true); addEventListener('keydown', moKhoa, true);

// xem video thì nhạc tự nhỏ lại
for (const ev of ['play', 'pause', 'ended', 'emptied', 'volumechange']) document.addEventListener(ev, e => {
  if (e.target instanceof HTMLMediaElement) { if (!e.target.paused && !e.target.muted) xem.add(e.target); capAm(); }
}, true);
setInterval(() => { if (xem.size) capAm(); }, 2000);

/* ---------- giao diện ---------- */
const css = document.createElement('style');
css.textContent = `
#nhac-o{position:relative}
.ray.nhac-mo{position:relative;z-index:80}
#nhac-nut{width:100%}
#nhac-nut .song{display:inline-flex;gap:2px;align-items:flex-end;height:14px;margin-left:auto}
#nhac-nut .song i{width:3px;height:4px;background:currentColor;border-radius:1px}
#nhac-nut.dang{color:var(--ray-chu);border-color:rgba(255,255,255,.3)}
#nhac-nut.dang .song i{animation:nhacSong .9s ease-in-out infinite alternate}
#nhac-nut.dang .song i:nth-child(2){animation-delay:.3s}#nhac-nut.dang .song i:nth-child(3){animation-delay:.6s}
@keyframes nhacSong{to{height:14px}}
#nhac-hop{position:absolute;left:0;bottom:calc(100% + 8px);width:300px;background:var(--mat);color:var(--muc);border:1px solid var(--vien2);border-radius:14px;box-shadow:var(--bong),0 18px 40px -16px rgba(0,0,0,.45);padding:14px;z-index:60;font-size:13.5px}
#nhac-hop h3{font-size:14px;display:flex;align-items:center;justify-content:space-between;margin-bottom:8px}
#nhac-hop .bai{display:block;width:100%;text-align:left;background:var(--mat2);border:1px solid transparent;border-radius:10px;padding:8px 10px;margin-bottom:6px}
#nhac-hop .bai b{display:flex;align-items:center;gap:6px;font-weight:600}
#nhac-hop .bai span{display:block;color:var(--phu);font-size:12.5px;line-height:1.4;margin-top:2px}
#nhac-hop .bai.on{border-color:var(--do);background:var(--do-nhat)}
#nhac-hop .bai.on b::after{content:"đang chọn";margin-left:auto;font-size:11px;font-weight:500;color:var(--do)}
#nhac-hop .hang{display:flex;align-items:center;gap:10px;margin:10px 0 4px}
#nhac-hop input[type=range]{flex:1;accent-color:var(--do)}
#nhac-hop .cong{appearance:none;width:34px;height:20px;border-radius:20px;background:var(--vien2);position:relative;cursor:pointer;flex:none;transition:background .2s}
#nhac-hop .cong::after{content:"";position:absolute;top:2px;left:2px;width:16px;height:16px;border-radius:50%;background:#fff;transition:transform .2s}
#nhac-hop .cong:checked{background:var(--xanh)}#nhac-hop .cong:checked::after{transform:translateX(14px)}
#nhac-hop .ds-bao{list-style:none;margin-top:4px}
#nhac-hop .ds-bao li{display:flex;align-items:center;justify-content:space-between;padding:4px 0;color:var(--phu)}
#nhac-hop .ds-bao button{background:none;border:1px solid var(--vien2);border-radius:8px;padding:2px 9px;font-size:12px}
#nhac-hop .chu{color:var(--phu);font-size:11.5px;margin-top:10px;line-height:1.4;border-top:1px solid var(--vien);padding-top:8px}
`;
document.head.appendChild(css);

const o = document.getElementById('nhac-o');
const ICON = '<svg class="ic" viewBox="0 0 24 24"><path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/></svg>';
function ve() {
  if (!o) return;
  const b = BAI[ST.bai] || BAI.dem;
  o.querySelector('#nhac-nut').className = 'nho' + (dangChay ? ' dang' : '');
  o.querySelector('#nhac-nut .nhan').textContent = dangChay ? b.ten : 'Bật nhạc';
  const h = o.querySelector('#nhac-hop'); if (h.hidden) return;
  h.querySelector('#nhac-bat').checked = dangChay;
  h.querySelectorAll('.bai').forEach(x => x.classList.toggle('on', x.dataset.bai === ST.bai));
}
if (o) {
  o.innerHTML = `<button class="nho" id="nhac-nut" title="Nhạc nền và âm báo">${ICON}<span class="nhan"></span><span class="song"><i></i><i></i><i></i></span></button>
  <div id="nhac-hop" hidden>
    <h3>Nhạc nền <input type="checkbox" class="cong" id="nhac-bat" aria-label="Bật nhạc nền"></h3>
    ${Object.entries(BAI).map(([k, b]) => `<button class="bai" data-bai="${k}"><b>${b.ten}</b><span>${b.ta}</span></button>`).join('')}
    <div class="hang"><span>Âm lượng</span><input type="range" id="nhac-am" min="0" max="1" step="0.05" value="${ST.am}" aria-label="Âm lượng nhạc"></div>
    <div class="hang" style="justify-content:space-between;margin-top:14px"><b>Âm báo</b><input type="checkbox" class="cong" id="nhac-bao" aria-label="Bật âm báo" ${ST.bao ? 'checked' : ''}></div>
    <ul class="ds-bao">${Object.entries(BAO).map(([k, x]) => `<li>${x.ten}<button data-thu="${k}">Nghe</button></li>`).join('')}</ul>
    <p class="chu">Nhạc tạo bằng code ngay trên máy, không bản quyền, mỗi lần nghe một khác. Mở video thì nhạc tự nhỏ lại.</p>
  </div>`;
  const hop = o.querySelector('#nhac-hop'), ray = o.closest('.ray');
  const moHop = m => { hop.hidden = !m; ray?.classList.toggle('nhac-mo', m); };
  o.querySelector('#nhac-nut').onclick = () => { moHop(hop.hidden); ve(); };
  hop.querySelector('#nhac-bat').onchange = batTat;
  hop.onclick = e => {
    const b = e.target.closest('[data-bai]'); if (b) return chonBai(b.dataset.bai);
    const t = e.target.closest('[data-thu]'); if (t) { khoi(); ac.resume().then(() => bao(t.dataset.thu, 1)); }
  };
  hop.querySelector('#nhac-am').oninput = e => { ST.am = +e.target.value; luu('nhac_am', ST.am); capAm(); };
  hop.querySelector('#nhac-bao').onchange = e => { ST.bao = e.target.checked; luu('nhac_bao', ST.bao ? '1' : '0'); };
  document.addEventListener('pointerdown', e => { if (!hop.hidden && !o.contains(e.target)) moHop(false); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') moHop(false); });
  ve();
}

window.NHAC = { bao, baoBat: () => ST.bao };
})();
