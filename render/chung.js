/* Thư viện dùng chung cho 5 phong cách — Tâm Cơ.
 * Mỗi trang phong cách nạp file này, rồi định nghĩa window.PHONG_CACH = { ten, mau, ve(canh, t, ctx), sfxDoi, chuyen, nenChuyen }.
 * renderAt(id, t) vẽ đúng khung hình tại giây t (thời gian của cảnh), không phụ thuộc đồng hồ thật.
 */
(function () {
  const W = 1080, H = 1920, FPS = 30;
  // Vùng an toàn: trên ≥250, dưới ≥420, phải ≥160
  const AT = { tren: 250, duoi: H - 420, phai: W - 160, trai: 72 };
  const THUONG_HIEU = { den: '#141414', do: '#E63946', xam: '#F3EFEF', trang: '#FFFFFF' };

  // ---------- toán ----------
  const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
  const lerp = (a, b, p) => a + (b - a) * p;
  const pha = (t, t0, d) => clamp((t - t0) / d);
  const E = {
    out3: p => 1 - Math.pow(1 - p, 3),
    in3: p => p * p * p,
    io3: p => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2),
    back: (p, s = 1.9) => 1 + (s + 1) * Math.pow(p - 1, 3) + s * Math.pow(p - 1, 2),
    elastic: p => (p === 0 || p === 1 ? p : Math.pow(2, -10 * p) * Math.sin((p * 10 - 0.75) * (2 * Math.PI / 3)) + 1),
  };
  // bật vào có nảy: 0 → 1 (vượt rồi về)
  const bat = (t, t0, d = 0.45) => (t < t0 ? 0 : E.back(pha(t, t0, d)));
  const mo = (t, t0, d = 0.3) => E.out3(pha(t, t0, d));
  // nhiễu tất định
  const hash = n => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
  const nhieu1 = (x, seed = 0) => { const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return lerp(hash(i + seed * 57), hash(i + 1 + seed * 57), u) * 2 - 1; };

  // ---------- sống động ----------
  // chớp mắt mỗi 2–4 giây (tất định theo seed), trả 0 (mở) .. 1 (nhắm)
  function chop(t, seed = 1) {
    let k = 0.4 + hash(seed) * 1.2;
    let i = 0;
    while (k < t + 0.2 && i < 200) {
      const d = t - k;
      if (d >= 0 && d < 0.16) return Math.sin((d / 0.16) * Math.PI);
      k += 2 + hash(seed * 13 + i) * 2; i++;
    }
    return 0;
  }
  const tho = (t, seed = 0) => Math.sin((t + seed) * 2 * Math.PI / 3.1) * 1.6; // nhún 1–2px

  let BIEN_DO = {};
  function mieng(id, t) {
    const a = BIEN_DO[id]; if (!a) return 0;
    const f = t * FPS, i = Math.floor(f), r = f - i;
    const v0 = a[clamp(i, 0, a.length - 1)] || 0, v1 = a[clamp(i + 1, 0, a.length - 1)] || 0;
    return i >= a.length ? 0 : lerp(v0, v1, r);
  }

  // ---------- chữ ----------
  const _cv = document.createElement('canvas').getContext('2d');
  function doRong(text, font) { _cv.font = font; return _cv.measureText(text).width; }
  // ngắt dòng theo từ; trả về mảng dòng
  function ngatDong(text, font, maxW) {
    const words = text.split(/\s+/); const lines = []; let cur = '';
    for (const w of words) {
      const thu = cur ? cur + ' ' + w : w;
      if (doRong(thu, font) <= maxW || !cur) cur = thu; else { lines.push(cur); cur = w; }
    }
    if (cur) lines.push(cur);
    return lines;
  }
  // chọn cỡ chữ lớn nhất vừa khung
  function vuaKhung(text, { ho = 'BVP', dam = 800, maxW = 820, maxDong = 3, co = [124, 112, 100, 92, 84, 76, 68, 60] } = {}) {
    for (const c of co) {
      const font = `${dam} ${c}px ${ho}`;
      const lines = ngatDong(text, font, maxW);
      if (lines.length <= maxDong && lines.every(l => doRong(l, font) <= maxW)) return { co: c, font, lines };
    }
    const c = co[co.length - 1], font = `${dam} ${c}px ${ho}`;
    return { co: c, font, lines: ngatDong(text, font, maxW) };
  }
  const thoat = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  // tô từ khóa: trả về chuỗi <tspan>
  function toTuKhoa(line, tuKhoa, mauThuong, mauNhan) {
    if (!tuKhoa) return `<tspan fill="${mauThuong}">${thoat(line)}</tspan>`;
    const lw = line.toLowerCase(), k = tuKhoa.toLowerCase();
    // khớp theo từng từ của từ khóa
    const kw = new Set(k.split(/\s+/));
    return line.split(/(\s+)/).map(w => {
      if (/^\s+$/.test(w)) return w;
      const sach = w.toLowerCase().replace(/[.,!?]/g, '');
      const nhan = kw.has(sach);
      return `<tspan fill="${nhan ? mauNhan : mauThuong}">${thoat(w)}</tspan>`;
    }).join('');
  }

  // ---------- hình học ----------
  // IK 2 khớp: vai S, đích T, độ dài a,b, uốn khuỷu theo dau (+1/-1)
  function ik(S, T, a, b, dau = 1) {
    let dx = T[0] - S[0], dy = T[1] - S[1];
    let d = Math.hypot(dx, dy);
    const dmax = a + b - 0.5;
    if (d > dmax) { dx *= dmax / d; dy *= dmax / d; d = dmax; }
    const goc = Math.atan2(dy, dx);
    const cosA = clamp((a * a + d * d - b * b) / (2 * a * d), -1, 1);
    const A = goc - dau * Math.acos(cosA);
    const E1 = [S[0] + a * Math.cos(A), S[1] + a * Math.sin(A)];
    return { khuyu: E1, tay: [S[0] + dx, S[1] + dy] };
  }
  const tg = (x, y, s = 1, r = 0) => `translate(${x.toFixed(1)},${y.toFixed(1)}) rotate(${r.toFixed(2)}) scale(${s.toFixed(4)})`;

  // ---------- tư thế tay (đích bàn tay so với vai, tọa độ nhân vật) ----------
  const TU_THE = {
    xuoi: { P: [128, 300], T: [-128, 300] },
    giang: { P: [250, 170], T: [-250, 170] },
    chi: { P: [300, -160], T: [-128, 300] },          // tay phải chỉ lên
    'chi-trai': { P: [128, 300], T: [-300, -120] },
    dem: { P: [150, -60], T: [-128, 300] },           // giơ tay đếm
    'om-dau': { P: [118, -170], T: [-118, -170] },
    'cam-dt': { P: [60, 150], T: [-60, 150] },
    'chong-cam': { P: [40, -55], T: [-60, 170] },
    'chong-hong': { P: [150, 210], T: [-150, 210] },
    'vay': { P: [260, -200], T: [-128, 300] },
    'khoanh': { P: [-70, 150], T: [70, 150] },
    'nhun-vai': { P: [200, 80], T: [-200, 80] },
    'thi-tham': { P: [60, -80], T: [-128, 300] },
  };
  // biến thể 2 của mỗi tư thế: tay hạ/khép khác đi (dùng kèm nghiêng người)
  for (const k of Object.keys(TU_THE)) { const v = TU_THE[k]; TU_THE[k + '#2'] = { P: [v.P[0] * 0.86 + 12, v.P[1] + 26], T: [v.T[0] * 0.86 - 12, v.T[1] + 26] }; }
  // nội suy chuỗi tư thế theo thời gian: [{t:0,p:'xuoi'},{t:1.2,p:'chi'}]
  function tuThe(chuoi, t) {
    if (typeof chuoi === 'string') return TU_THE[chuoi];
    let a = chuoi[0], b = null;
    for (const k of chuoi) { if (k.t <= t) a = k; else { b = k; break; } }
    if (!b) return TU_THE[a.p];
    const p = E.io3(pha(t, b.t - 0.35, 0.35));
    const A = TU_THE[a.p], B = TU_THE[b.p];
    return { P: [lerp(A.P[0], B.P[0], p), lerp(A.P[1], B.P[1], p)], T: [lerp(A.T[0], B.T[0], p), lerp(A.T[1], B.T[1], p)] };
  }

  // ---------- nhịp chuyển động của từng cảnh (dùng chung 5 phong cách) ----------
  // trả về mốc thời gian (giây, tính từ đầu cảnh) các thứ bật vào; SFX lấy từ đây.
  function lich(canh, D) {
    const tl = S.tl[canh.id];
    if (window.DUNG && DUNG.moc) return DUNG.moc(canh, D, tl ? tl.giong : D);
    return { vao: 0, chu: 0.12, nv: 0.08, daoCu: [0.38, 0.55, 0.72, 0.9], so: 0.12, tin: [] };
  }
  // ánh xạ token sfx của canh.json → thời điểm
  function suKienSfx(canh, D, i) {
    const L = lich(canh, D), out = [], tl = S.tl[canh.id], g = tl ? tl.giong : D;
    for (const x of (canh.sfx || []).slice(0, 2)) {
      const s = typeof x === 'string' ? x : x.ten;
      let t = 0;
      if (typeof x === 'object' && x.t !== undefined) t = x.t * g;
      else if (s === 'whoosh' || s === 'swoosh-nhe') t = 0;
      else if (s === 'pop') t = L.daoCu[0] ?? L.nv;
      else if (s === 'thud') t = L.rung ?? (canh.bo_cuc === 'hook-chu-to' ? 0.05 : (L.tin[1] ?? L.so ?? L.chu));
      else if (s === 'ding') t = canh.bo_cuc === 'dau-hieu-so' ? L.chu : (canh.bo_cuc === 'ket' ? (L.logo ?? L.chu) : L.chu + 0.05);
      else if (s === 'tick') t = L.tin[0] ?? L.chu;
      else if (s === 'tin-nhan') t = L.tin[0] ?? L.daoCu[0] ?? 0.3;
      out.push({ ten: s, t: +t.toFixed(3) });
    }
    return out;
  }

  // ---------- chuyển cảnh: 0,15 s che cuối cảnh + 0,15 s mở đầu cảnh sau ----------
  const TD = 0.15;
  const KIEU = ['truot', 'tron', 'day-len', 'phong'];
  // kiểu vào của một cảnh theo vị trí; không kiểu nào lặp quá 3 lần liên tiếp (xoay vòng 4 kiểu)
  const kieuVao = (stt, ds = KIEU) => ds[(stt + 3) % ds.length];
  function chuyenCanh(pc, t, D, vao, ra) {
    // trả {bien: transform cho nội dung, phu: svg phủ}
    const mau = (pc.mau && pc.mau.chuyen) || THUONG_HIEU.do;
    const mau2 = (pc.mau && pc.mau.chuyen2) || THUONG_HIEU.den;
    let bien = '', phu = '';
    const ve = (kieu, p, huong) => { // huong: 'ra' (che, p 0→1) | 'vao' (mở, p 0→1)
      if (pc.veChuyen) { const r = pc.veChuyen(kieu, p, huong); if (r) return r; }
      const q = E.io3(p);
      if (kieu === 'truot') {
        const x = huong === 'ra' ? lerp(W, 0, q) : lerp(0, -W, q);
        return { bien: `translate(${huong === 'ra' ? -80 * q : 80 * (1 - q)},0)`, phu: `<rect x="${x - 40}" y="0" width="${W + 80}" height="${H}" fill="${mau}"/><rect x="${x - 40}" y="0" width="26" height="${H}" fill="${mau2}"/>` };
      }
      if (kieu === 'day-len') {
        const y = huong === 'ra' ? lerp(H, 0, q) : lerp(0, -H, q);
        return { bien: `translate(0,${huong === 'ra' ? -90 * q : 90 * (1 - q)})`, phu: `<rect x="0" y="${y - 30}" width="${W}" height="${H + 60}" fill="${mau2}"/><rect x="0" y="${y - 30}" width="${W}" height="22" fill="${mau}"/>` };
      }
      if (kieu === 'tron') {
        const R = 1150;
        if (huong === 'ra') return { bien: '', phu: `<circle cx="540" cy="900" r="${R * q}" fill="${mau}"/>` };
        return { bien: `translate(540,900) scale(${1.08 - 0.08 * q}) translate(-540,-900)`, phu: `<defs><mask id="mtron"><rect width="${W}" height="${H}" fill="#fff"/><circle cx="540" cy="900" r="${R * q}" fill="#000"/></mask></defs><rect width="${W}" height="${H}" fill="${mau}" mask="url(#mtron)"/>` };
      }
      // phong: phóng + chớp sáng
      const s = huong === 'ra' ? 1 + 0.25 * q : 1.25 - 0.25 * q;
      const op = huong === 'ra' ? q : 1 - q;
      return { bien: `translate(540,960) scale(${s}) translate(-540,-960)`, phu: `<rect width="${W}" height="${H}" fill="${(pc.mau && pc.mau.chop) || THUONG_HIEU.xam}" opacity="${op}"/>` };
    };
    if (vao && t < TD) { const r = ve(vao, t / TD, 'vao'); bien += r.bien; phu += r.phu; }
    if (ra && t > D - TD) { const r = ve(ra, (t - (D - TD)) / TD, 'ra'); bien += r.bien; phu += r.phu; }
    return { bien, phu };
  }

  // ---------- trạng thái & render ----------
  const S = { canh: {}, thuTu: [], tl: {}, phien: {}, video: {} };
  function khoiTao(du) {
    BIEN_DO = du.bienDo.canh;
    S.video = du.video || {};
    du.canh.forEach((c, i) => { S.canh[c.id] = c; S.thuTu.push(c.id); });
    du.thoiLuong.canh.forEach(x => (S.tl[x.id] = x));
  }
  // phiên quay: danh sách id theo thứ tự xuất hiện trong video này (để chọn kiểu chuyển cảnh)
  function datPhien(ds) {
    S.phien = {};
    ds.forEach((id, k) => {
      S.phien[id] = { stt: k, vao: k === 0 ? null : kieuVao(k, window.PHONG_CACH.chuyen), ra: k === ds.length - 1 ? null : kieuVao(k + 1, window.PHONG_CACH.chuyen) };
    });
  }
  function ctxCanh(id, t) {
    const canh = S.canh[id], D = S.tl[id].thoi_luong, i = S.thuTu.indexOf(id);
    return {
      id, D, i, t, L: lich(canh, D), giong: S.tl[id].giong, tong: S.video.tong_mau, seed: S.video.seed,
      mieng: tt => mieng(id, tt), stt: (S.phien[id] || {}).stt ?? i,
    };
  }
  function renderAt(id, t) {
    const pc = window.PHONG_CACH, canh = S.canh[id], ctx = ctxCanh(id, t);
    const ph = S.phien[id] || { vao: null, ra: null };
    const cam = 1 + 0.04 * E.io3(pha(t, 0, ctx.D));
    const ch = chuyenCanh(pc, t, ctx.D, ph.vao, ph.ra);
    const noiDung = pc.ve(canh, t, ctx);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
      <g transform="${ch.bien}"><g transform="translate(540,960) scale(${cam.toFixed(5)}) translate(-540,-960)">${noiDung}</g></g>
      ${pc.lopTren ? pc.lopTren(canh, t, ctx) : ''}${ch.phu}</svg>`;
    document.getElementById('khung').innerHTML = svg;
    return true;
  }
  // ảnh bìa: dựng từ template cảnh hook, chữ to 3–6 từ, mọi thứ đã bật xong (t = 3 s)
  function bia() {
    const goc = S.canh.c01, ph = S.phien.c01;
    const b = S.video.bia || { chu: (goc.chu || '').toUpperCase(), tu_khoa: (goc.tu_khoa || '').toUpperCase() };
    S.canh.c01 = { ...goc, chu: b.chu, tu_khoa: b.tu_khoa };
    S.phien.c01 = { stt: 0, vao: null, ra: null };
    renderAt('c01', 3.0);
    S.canh.c01 = goc; S.phien.c01 = ph;
  }
  function sfxCanh(id) {
    const canh = S.canh[id], D = S.tl[id].thoi_luong;
    const doi = window.PHONG_CACH.sfxDoi || {};
    return suKienSfx(canh, D, S.thuTu.indexOf(id)).map(e => ({ ...e, ten: doi[e.ten] || e.ten }));
  }

  // biểu tượng quân mã (logo) dùng trong cảnh kết
  const QUAN_MA = (mau, mat) => `<g transform="translate(-92,-100)"><path d="M72 152 C70 132 72 118 80 102 C74 100 68 101 62 104 L52 106 C45 107 41 100 44 93 L52 78 C56 62 66 50 78 44 L84 32 L92 44 C112 46 128 60 134 80 C142 104 136 126 136 152 Z" fill="${mau}"/><circle cx="86" cy="66" r="5.5" fill="${mat}"/><rect x="60" y="152" width="88" height="16" rx="4" fill="${mau}"/></g>`;

  window.TC = { W, H, FPS, AT, THUONG_HIEU, clamp, lerp, pha, E, bat, mo, hash, nhieu1, chop, tho, mieng, doRong, ngatDong, vuaKhung, thoat, toTuKhoa, ik, tg, TU_THE, tuThe, lich, KIEU, khoiTao, datPhien, renderAt, sfxCanh, bia, QUAN_MA, S };
  window.renderAt = renderAt;
})();
