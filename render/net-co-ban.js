/* Bộ nét vẽ cơ sở — một bộ hình, nhiều "chất liệu":
 *  che: 'phang' (mảng màu) | 'vien' (viền đen dày, truyện tranh) | 'bong' (bóng đổ điện ảnh) | 'net' (nét bút, vẽ hiện dần)
 * TaoP(cfg) trả về bộ P dùng cho canh-chung.js. Phong cách có thể ghi đè từng hàm.
 */
(function () {
  const { lerp, pha, E, clamp, thoat, vuaKhung, toTuKhoa, ik, tuThe, nhieu1, hash } = TC;

  const VAI_MAC_DINH = {
    minh: { ao: '#E63946', co: '#FFFFFF', quan: '#2B2D42', toc: '#2A1F1A', da: '#F2C29B' },
    chi: { ao: '#8D99AE', co: '#E9ECEF', quan: '#3D405B', toc: '#3B2A22', da: '#F5CDA7' },
    anh: { ao: '#5C677D', co: '#DDE1E7', quan: '#22223B', toc: '#1E1A18', da: '#E3AE86' },
    em: { ao: '#C9ADA7', co: '#F2E9E4', quan: '#4A4E69', toc: '#4B3426', da: '#F7D3B5' },
    sep: { ao: '#2B2D42', co: '#FFFFFF', quan: '#1B1B2A', toc: '#9A9A9A', da: '#EBBE98', cavat: '#E63946' },
  };

  // ---------------- nền "soi-day" (Sợi Dây Vô Hình) ----------------
  // Trường dòng chảy + 3 điểm hút ẩn. Vẽ MỘT lần vào canvas ẩn (tất định theo seed), cache dataURL, mỗi khung chỉ zoom nhẹ.
  // o: { sang: true → nền giấy, sợi đậm hơn nền }, màu lấy theo tong_mau.
  const SOI_DAY_CACHE = {};
  const hex3 = h => { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
  const tron = (a, b, p) => a.map((v, i) => Math.round(v + (b[i] - v) * p));
  function rngSeed(s) { let a = (s * 2654435761) >>> 0 || 1; return () => { a = (a + 0x6D2B79F5) >>> 0; let x = a; x = Math.imul(x ^ (x >>> 15), x | 1); x ^= x + Math.imul(x ^ (x >>> 7), x | 61); return ((x ^ (x >>> 14)) >>> 0) / 4294967296; }; }
  function taoNhieu(rnd) { // Perlin 2D 4 quãng, ra ~0..1
    const p = new Uint8Array(512), g = new Float32Array(512);
    const b = [...Array(256).keys()];
    for (let i = 255; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; }
    for (let i = 0; i < 512; i++) { p[i] = b[i & 255]; g[i] = rnd() * Math.PI * 2; }
    const gx = g.map(Math.cos), gy = g.map(Math.sin);
    const f = t => t * t * t * (t * (t * 6 - 15) + 10);
    const mot = (x, y) => {
      const X = Math.floor(x), Y = Math.floor(y), xf = x - X, yf = y - Y, xi = X & 255, yi = Y & 255;
      const d = (i, j, dx, dy) => { const h = p[p[xi + i] + yi + j]; return gx[h] * dx + gy[h] * dy; };
      const u = f(xf), v = f(yf);
      const a = d(0, 0, xf, yf) + u * (d(1, 0, xf - 1, yf) - d(0, 0, xf, yf));
      const c = d(0, 1, xf, yf - 1) + u * (d(1, 1, xf - 1, yf - 1) - d(0, 1, xf, yf - 1));
      return a + v * (c - a);
    };
    return (x, y) => { let s = 0, a = 0.5, k = 1; for (let o = 0; o < 4; o++) { s += a * mot(x * k, y * k); a *= 0.5; k *= 2; } return 0.5 + s * 0.9; };
  }
  function veSoiDay(seed, o) {
    const W = 1080, H = 1920, T = o.T, sang = !!o.sang;
    const nenM = sang ? (T ? T.giay : '#FBF8F1') : (T ? T.troi[0] : '#141414');
    const nenRgb = hex3(nenM);
    const dong = sang ? hex3(T ? T.troi[1] : '#8E6A50') : (T ? tron(hex3(T.troi[2]), hex3(T.troi[3]), 0.5) : [200, 135, 90]);
    const doM = [230, 57, 70], sangM = sang ? hex3(T ? T.troi[0] : '#1A1A1A') : [243, 239, 239];
    const kAlpha = sang ? 1.7 : 1.6;
    const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
    const g = cv.getContext('2d');
    g.fillStyle = nenM; g.fillRect(0, 0, W, H);
    const rnd = rngSeed(seed), noise = taoNhieu(rnd), noise2 = taoNhieu(rngSeed(seed + 7));
    const R = (a, b) => a + rnd() * (b - a);
    const SO_HAT = 3000, SO_BUOC = 320, BAT = 190, LUC = 1.35, TN = 0.0018, THOAT = 0.28;
    // điểm hút: giữa khung, tránh dải chữ trên cùng
    const dk = []; let thu = 0;
    while (dk.length < 3 && thu++ < 500) { const x = R(W * 0.18, W * 0.82), y = R(H * 0.34, H * 0.72); if (dk.every(q => Math.hypot(q[0] - x, q[1] - y) > 360)) dk.push([x, y]); }
    // quầng tối/nhạt rất nhẹ quanh điểm hút
    for (const [x, y] of dk) { const rg = g.createRadialGradient(x, y, 0, x, y, 300); rg.addColorStop(0, sang ? 'rgba(120,100,90,.10)' : 'rgba(0,0,0,.35)'); rg.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = rg; g.fillRect(0, 0, W, H); }
    g.lineCap = 'round'; g.lineJoin = 'round';
    const CHUNK = 16;
    for (let i = 0; i < SO_HAT; i++) {
      let px = R(-40, W + 40), py = R(H * 0.15, H + 60), vx = 0, vy = -1.6;
      let biBat = false, thoat = false, buocBat = 0, trang = 0, dem = 0;
      const seThoat = rnd() < THOAT, day = rnd() < 0.08 ? 2.2 : R(0.55, 1.15);
      const net = (s) => {
        const mo = (15 - 12 * s / SO_BUOC) / 255 * kAlpha;
        const [m, a, w] = trang === 2 ? [sangM, mo * 1.3, day] : trang === 1 ? [doM, mo * 1.6, day * 0.8] : [dong, mo, day];
        g.strokeStyle = `rgba(${m[0]},${m[1]},${m[2]},${Math.min(1, a).toFixed(4)})`; g.lineWidth = w; g.stroke();
      };
      g.beginPath(); g.moveTo(px, py);
      for (let s = 0; s < SO_BUOC; s++) {
        const n = noise(px * TN, py * TN), n2 = noise2(px * TN * 3.1, py * TN * 3.1);
        const goc = -Math.PI / 2 + (n - 0.5) * 2.4 + (n2 - 0.5) * 0.7;
        let fx = Math.cos(goc) * 0.22, fy = Math.sin(goc) * 0.22;
        let gan = dk[0], kc = 1e9;
        for (const q of dk) { const d = Math.hypot(q[0] - px, q[1] - py); if (d < kc) { kc = d; gan = q; } }
        if (!thoat) {
          const m = LUC * 160 / (kc + 160) / (kc || 1), kx = (gan[0] - px) * m, ky = (gan[1] - py) * m;
          const xo = kc < BAT * 1.6 ? 1.1 : 0.15;
          fx += kx * 0.35 - ky * xo * 0.3; fy += ky * 0.35 + kx * xo * 0.3;
        }
        if (!biBat && kc < BAT) { biBat = true; buocBat = s; }
        if (biBat && !thoat && seThoat && s - buocBat > 70) { thoat = true; const d = kc || 1; vx += (px - gan[0]) / d * 2.4; vy += (py - gan[1]) / d * 2.4; }
        vx += fx; vy += fy;
        const v = Math.hypot(vx, vy); if (v > 2.6) { vx *= 2.6 / v; vy *= 2.6 / v; }
        px += vx; py += vy;
        const tt = thoat ? 2 : biBat ? 1 : 0;
        g.lineTo(px, py);
        if (tt !== trang || ++dem >= CHUNK) { net(s); trang = tt; dem = 0; g.beginPath(); g.moveTo(px, py); }
        if (py < -60 || px < -80 || px > W + 80) break;
      }
      net(SO_BUOC - 1);
    }
    // giữ chữ & nhân vật đọc rõ: dải trên (chữ) và vùng giữa–dưới (nhân vật) phủ màu nền
    const c = (a) => `rgba(${nenRgb[0]},${nenRgb[1]},${nenRgb[2]},${a})`;
    let lg = g.createLinearGradient(0, 0, 0, 980);
    lg.addColorStop(0, c(0.3)); lg.addColorStop(0.18, c(0.5)); lg.addColorStop(0.62, c(0.42)); lg.addColorStop(1, c(0));
    g.fillStyle = lg; g.fillRect(0, 0, W, 980);
    const rg = g.createRadialGradient(540, 1450, 60, 540, 1450, 620);
    rg.addColorStop(0, c(sang ? 0.45 : 0.3)); rg.addColorStop(1, c(0));
    g.fillStyle = rg; g.fillRect(0, 0, W, H);
    if (!sang) { const vg = g.createRadialGradient(540, 960, 600, 540, 960, 1250); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.3)'); g.fillStyle = vg; g.fillRect(0, 0, W, H); }
    // hạt mịn
    const im = g.getImageData(0, 0, W, H), px = im.data;
    for (let k = 0; k < px.length; k += 4) { const d = (rnd() - 0.5) * 10; px[k] += d; px[k + 1] += d; px[k + 2] += d; }
    g.putImageData(im, 0, 0);
    const url = cv.toDataURL('image/jpeg', 0.9);
    const anh = new Image(); anh.src = url; // giữ ảnh đã giải mã trong bộ nhớ đệm
    return { url, anh };
  }
  // trả SVG: <image> từ cache, zoom 1,00 → 1,05 theo t (tâm hơi cao để cảm giác trôi lên)
  function soiDay(t, ctx, o = {}) {
    const seed = ((ctx && ctx.seed) || 0) + 19, T = o.T || null;
    const khoa = `${seed}|${o.sang ? 1 : 0}|${(ctx && ctx.tong) || ''}`;
    if (!SOI_DAY_CACHE[khoa]) { const t0 = performance.now(); SOI_DAY_CACHE[khoa] = veSoiDay(seed, o); SOI_DAY_CACHE[khoa].ms = performance.now() - t0; window.SOI_DAY_MS = SOI_DAY_CACHE[khoa].ms; }
    const D = (ctx && ctx.D) || 6, z = 1 + 0.05 * clamp(t / D);
    return `<g transform="translate(540,880) scale(${z.toFixed(5)}) translate(-540,-880)"><image href="${SOI_DAY_CACHE[khoa].url}" x="0" y="0" width="1080" height="1920" preserveAspectRatio="none"/></g>`;
  }
  window.SOI_DAY = { soiDay, cache: SOI_DAY_CACHE };

  function TaoP(cfg) {
    const che = cfg.che || 'phang';
    const M = Object.assign({
      nen: '#F3EFEF', nen2: '#E7DEDB', den: '#141414', do: '#E63946', trang: '#FFFFFF', phu: '#2B2D42',
      vien: '#141414', bong: '#0F0F12', muc: '#1A1A1A', giay: '#FBF8F1', nhanNhat: 'rgba(230,57,70,.18)',
      chu: '#141414', chuNen: '#FFFFFF', man: '#FFFFFF', mieng: '#5A1E22',
    }, cfg.mau || {});
    const VAI = JSON.parse(JSON.stringify(VAI_MAC_DINH));
    for (const k in (cfg.vai || {})) Object.assign(VAI[k], cfg.vai[k]);
    const VW = cfg.vienW || 7;
    const NET = che === 'net', BONG = che === 'bong', VIEN = che === 'vien';

    // thuộc tính hình theo chất liệu. o: {w, nhan, dac, giu, khongVien}
    const A = (fill, o = {}) => {
      if (NET) {
        const st = o.nhan ? M.do : M.muc;
        const f = o.rong ? 'none' : (o.nhan && o.dac ? M.nhanNhat : (o.mauDac || M.giay));
        return `fill="${f}" stroke="${st}" stroke-width="${o.w || 6}" stroke-linecap="round" stroke-linejoin="round" pathLength="1" class="v"`;
      }
      if (BONG && !o.giu) return `fill="${o.bongMau || M.bong}"` + (cfg.vienBong ? ` stroke="${cfg.vienBong}" stroke-width="3" stroke-opacity=".55"` : '');
      if (VIEN && !o.khongVien) return `fill="${fill}" stroke="${M.vien}" stroke-width="${o.w || VW}" stroke-linejoin="round" stroke-linecap="round"`;
      return `fill="${fill}"`;
    };
    const AN = !BONG; // có vẽ chi tiết mặt không

    // ---------------- nhân vật ----------------
    const TOC_MD = { minh: 'ngan', anh: 'dung', chi: 'dai-bui', em: 'bob', sep: 'hoi' };
    function toc(v, sau, kieu, mauToc) {
      const k = kieu || TOC_MD[v] || 'ngan', c = mauToc || (VAI[v] || VAI.chi).toc;
      if (sau) {
        if (k === 'dai-bui' || k === 'dai-xoa') return `<path d="M-112 -730 C-130 -640 -128 -560 -100 -500 L100 -500 C128 -560 130 -640 112 -730 Z" ${A(c)}/>`;
        if (k === 'xoan-nu') return `<path d="M-120 -740 C-150 -640 -140 -540 -100 -500 L100 -500 C140 -540 150 -640 120 -740 Z" ${A(c)}/>` + [-120, -96, 96, 120].map((x, n) => `<circle cx="${x}" cy="${-640 + (n % 2) * 60}" r="34" ${A(c)}/>`).join('');
        if (k === 'bob') return `<path d="M-114 -740 C-124 -680 -118 -640 -104 -615 L104 -615 C118 -640 124 -680 114 -740 Z" ${A(c)}/>`;
        if (k === 'duoi-ngua') return `<path d="M60 -800 C170 -780 170 -640 120 -560 C110 -620 100 -700 60 -760 Z" ${A(c)}/>`;
        return '';
      }
      switch (k) {
        case 'ngan': return `<path d="M-106 -712 C-114 -800 -62 -846 4 -842 C74 -840 116 -796 106 -708 C98 -748 74 -770 36 -774 C6 -760 -34 -764 -66 -772 C-88 -762 -100 -742 -106 -712 Z" ${A(c)}/>`;
        case 'dung': return `<path d="M-104 -716 C-110 -790 -80 -830 -40 -836 L-30 -856 L-6 -836 L12 -860 L30 -834 L52 -852 L62 -826 C100 -812 114 -770 104 -714 C92 -752 50 -770 0 -770 C-50 -770 -92 -752 -104 -716 Z" ${A(c)}/>`;
        case 'xoan-nam': return [[-80, -780], [-40, -815], [0, -828], [40, -815], [80, -780], [-98, -735], [98, -735]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="36" ${A(c)}/>`).join('');
        case 'vuot-nguoc': return `<path d="M-104 -706 C-112 -810 -40 -846 10 -842 C80 -838 114 -800 104 -706 C96 -770 50 -800 0 -800 C-50 -800 -96 -770 -104 -706 Z" ${A(c)}/><path d="M-60 -812 Q0 -830 60 -812" stroke="${NET ? M.muc : '#00000033'}" stroke-width="5" fill="none"/>`;
        case 'dai-bui': return `<path d="M-108 -700 C-116 -800 -56 -842 6 -838 C74 -834 118 -790 108 -700 C96 -760 40 -790 -20 -770 C-60 -756 -92 -736 -108 -700 Z" ${A(c)}/><circle cx="0" cy="-850" r="34" ${A(c)}/>`;
        case 'dai-xoa': return `<path d="M-108 -690 C-118 -800 -56 -846 6 -842 C74 -838 120 -792 108 -690 C100 -750 70 -780 30 -786 C-10 -770 -70 -760 -108 -690 Z" ${A(c)}/>`;
        case 'xoan-nu': return [[-84, -770], [-44, -808], [0, -822], [44, -808], [84, -770]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="38" ${A(c)}/>`).join('');
        case 'bob': return `<path d="M-110 -706 C-118 -804 -58 -844 2 -842 C64 -842 118 -804 110 -706 L110 -742 L-110 -742 Z" ${A(c)}/>`;
        case 'duoi-ngua': return `<path d="M-106 -712 C-112 -806 -50 -846 6 -842 C70 -838 114 -800 106 -712 C90 -770 40 -790 -10 -786 C-60 -782 -94 -752 -106 -712 Z" ${A(c)}/>`;
        case 'hoi': return `<path d="M-106 -690 C-112 -740 -104 -770 -84 -780 C-90 -740 -92 -716 -96 -690 Z M106 -690 C112 -740 104 -770 84 -780 C90 -740 92 -716 96 -690 Z" ${A(c)}/>`;
      }
      return '';
    }
    function mat(o) {
      if (!AN) return '';
      const b = o.bieu, m = o.mieng || 0, ch = o.chop || 0;
      const d = M.den;
      const nhin = b === 'suy-nghi' ? [8, -6] : [0, 0];
      let s = '';
      // lông mày
      const may = {
        'binh-thuong': [[-58, -764, -20, -766], [20, -766, 58, -764]],
        cuoi: [[-58, -774, -20, -778], [20, -778, 58, -774]],
        buon: [[-60, -760, -20, -776], [20, -776, 60, -760]],
        'ngac-nhien': [[-60, -786, -20, -792], [20, -792, 60, -786]],
        'suy-nghi': [[-58, -764, -20, -764], [20, -780, 58, -786]],
        'lo-lang': [[-62, -758, -20, -780], [20, -780, 62, -758]],
      }[b] || [[-58, -764, -20, -766], [20, -766, 58, -764]];
      for (const [x1, y1, x2, y2] of may) s += `<path d="M${x1} ${y1} L${x2} ${y2}" stroke="${d}" stroke-width="9" stroke-linecap="round" fill="none"/>`;
      // mắt
      if (b === 'cuoi' && m < 0.05) {
        s += `<path d="M-52 -712 Q-36 -732 -20 -712 M20 -712 Q36 -732 52 -712" stroke="${d}" stroke-width="8" fill="none" stroke-linecap="round"/>`;
      } else {
        const ry = (b === 'ngac-nhien' ? 19 : 15) * (1 - 0.92 * ch);
        const rx = b === 'ngac-nhien' ? 15 : 12;
        s += `<ellipse cx="${-36 + nhin[0]}" cy="${-714 + nhin[1]}" rx="${rx}" ry="${ry.toFixed(1)}" fill="${d}"/><ellipse cx="${36 + nhin[0]}" cy="${-714 + nhin[1]}" rx="${rx}" ry="${ry.toFixed(1)}" fill="${d}"/>`;
        if (ch < 0.5) s += `<circle cx="${-32 + nhin[0]}" cy="${-720 + nhin[1]}" r="4" fill="#fff"/><circle cx="${40 + nhin[0]}" cy="${-720 + nhin[1]}" r="4" fill="#fff"/>`;
      }
      // mũi
      s += `<path d="M-4 -690 Q2 -682 -6 -676" stroke="${d}" stroke-width="5" fill="none" stroke-linecap="round" opacity=".55"/>`;
      // miệng
      if (m > 0.06 || b === 'ngac-nhien') {
        const mm = Math.max(m, b === 'ngac-nhien' ? 0.45 : 0);
        const rx = b === 'ngac-nhien' && m < 0.06 ? 13 : 22 - 5 * mm, ry = 4 + 22 * mm;
        const lech = b === 'buon' || b === 'lo-lang' ? 3 : 0;
        s += `<ellipse cx="0" cy="${-654 + lech}" rx="${rx.toFixed(1)}" ry="${ry.toFixed(1)}" fill="${M.mieng}"/>`;
        if (mm > 0.35) s += `<ellipse cx="0" cy="${(-654 + lech + ry * 0.55).toFixed(1)}" rx="${(rx * 0.6).toFixed(1)}" ry="${(ry * 0.32).toFixed(1)}" fill="#E07A7A"/>`;
      } else {
        const p = {
          'binh-thuong': 'M-24 -660 Q0 -646 24 -660', cuoi: 'M-30 -664 Q0 -634 30 -664',
          buon: 'M-24 -646 Q0 -664 24 -646', 'suy-nghi': 'M-12 -656 L22 -660', 'lo-lang': 'M-28 -652 q9 -9 18 0 t18 0 t18 0',
        }[b] || 'M-24 -660 Q0 -646 24 -660';
        s += `<path d="${p}" stroke="${M.mieng}" stroke-width="8" fill="none" stroke-linecap="round"/>`;
      }
      if (b === 'cuoi') s += `<ellipse cx="-62" cy="-680" rx="18" ry="10" fill="#F28B82" opacity=".55"/><ellipse cx="62" cy="-680" rx="18" ry="10" fill="#F28B82" opacity=".55"/>`;
      if (b === 'lo-lang') s += `<path d="M96 -800 q14 26 0 36 q-14 -10 0 -36 Z" fill="#7EC8E3"/>`;
      if (b === 'buon' && o.vai === 'minh') s += `<path d="M-40 -700 q8 18 0 26 q-8 -8 0 -26 Z" fill="#7EC8E3" opacity="${clamp((o.tTheo || 0) - 1)}"/>`;
      return s;
    }
    function kinh(v, co) {
      if (!AN && !NET) return '';
      if (co === false || (co === undefined && v !== 'anh' && v !== 'sep')) return '';
      const st = NET ? A('none', { w: 5 }) : `fill="none" stroke="${M.den}" stroke-width="6"`;
      return `<rect x="-62" y="-736" width="50" height="40" rx="12" ${st}/><rect x="12" y="-736" width="50" height="40" rx="12" ${st}/><path d="M-12 -720 L12 -720" ${st}/>`;
    }

    function nguoi(o) {
      if (NET && P.nguoiQue) return P.nguoiQue(o);
      const ng = o.ngoai || {};
      const V = { ...(VAI[o.vai] || VAI.minh), ...(ng.ao ? { ao: ng.ao } : {}), ...(ng.mauToc ? { toc: ng.mauToc } : {}) };
      const dang = ng.dang ? ({ gay: 0.88, vua: 1, dam: 1.16 }[ng.dang] || 1) : 1;
      const th = o.tho || 0;
      const tt = tuThe(o.tuthe || 'xuoi', o.tTheo || 0);
      const O = [0, -590];
      const vaiP = [108, -548 + th], vaiT = [-108, -548 + th];
      const tayP = ik(vaiP, [O[0] + tt.P[0], O[1] + tt.P[1]], 140, 132, -1);
      const tayT = ik(vaiT, [O[0] + tt.T[0], O[1] + tt.T[1]], 140, 132, 1);
      const canhTay = (v, k) => `<path d="M${v[0]} ${v[1]} L${k.khuyu[0].toFixed(1)} ${k.khuyu[1].toFixed(1)} L${k.tay[0].toFixed(1)} ${k.tay[1].toFixed(1)}" fill="none" stroke="${BONG ? M.bong : V.ao}" stroke-width="46" stroke-linecap="round" stroke-linejoin="round"/>` +
        (VIEN ? `<path d="M${v[0]} ${v[1]} L${k.khuyu[0].toFixed(1)} ${k.khuyu[1].toFixed(1)} L${k.tay[0].toFixed(1)} ${k.tay[1].toFixed(1)}" fill="none" stroke="${M.vien}" stroke-width="${46 + VW * 2}" stroke-linecap="round" stroke-linejoin="round"/><path d="M${v[0]} ${v[1]} L${k.khuyu[0].toFixed(1)} ${k.khuyu[1].toFixed(1)} L${k.tay[0].toFixed(1)} ${k.tay[1].toFixed(1)}" fill="none" stroke="${V.ao}" stroke-width="46" stroke-linecap="round" stroke-linejoin="round"/>` : '') +
        `<circle cx="${k.tay[0].toFixed(1)}" cy="${k.tay[1].toFixed(1)}" r="25" ${A(V.da)}/>`;
      const dau = `translate(0,${(th * 0.6).toFixed(2)}) rotate(${(nhieu1((o.tTheo || 0) * 0.6, 3) * 2.5 + (o.mieng || 0) * 2).toFixed(2)} 0 -640)`;
      let s = '';
      // chân
      s += `<rect x="-74" y="-280" width="60" height="268" rx="26" ${A(V.quan)}/><rect x="14" y="-280" width="60" height="268" rx="26" ${A(V.quan)}/>`;
      s += `<ellipse cx="-50" cy="-14" rx="50" ry="22" ${A(M.den)}/><ellipse cx="50" cy="-14" rx="50" ry="22" ${A(M.den)}/>`;
      // thân
      const keo = 1 + th * 0.004;
      s += `<g transform="translate(0,-250) scale(1,${keo.toFixed(4)}) translate(0,250)"><path d="M-112 ${-560 + th} Q-126 ${-556 + th} -126 ${-530 + th} L-104 -262 Q-102 -246 -86 -246 L86 -246 Q102 -246 104 -262 L126 ${-530 + th} Q126 ${-556 + th} 112 ${-560 + th} Z" ${A(V.ao)}/>`;
      if (AN && !o.quay) {
        s += `<path d="M-36 ${-560 + th} L0 ${-500 + th} L36 ${-560 + th} Z" ${A(V.co, { w: 4 })}/>`;
        if (V.cavat) s += `<path d="M-12 ${-520 + th} L12 ${-520 + th} L18 ${-380 + th} L0 ${-356 + th} L-18 ${-380 + th} Z" ${A(V.cavat, { w: 4 })}/>`;
        if (o.vai === 'minh') s += `<rect x="-26" y="${-430 + th}" width="52" height="64" rx="8" ${A('#FFFFFF', { w: 4 })}/><rect x="-16" y="${-418 + th}" width="32" height="8" rx="4" fill="${M.do}"/>`;
      }
      // bóng đổ: nhân vật chính đeo khăn quàng đỏ để phân biệt với các bóng khác
      if (BONG && o.vai === 'minh') {
        const KD = cfg.khanDo || '#E63946';
        s += `<path d="M-74 ${-568 + th} Q0 ${-528 + th} 74 ${-568 + th} L70 ${-536 + th} Q0 ${-494 + th} -70 ${-536 + th} Z" fill="${KD}"/>`;
        if (!o.quay) s += `<path d="M18 ${-516 + th} L48 ${-410 + th} L22 ${-418 + th} L6 ${-404 + th} L-4 ${-512 + th} Z" fill="${KD}"/>`;
      }
      s += '</g>';
      s += canhTay(vaiT, tayT) + canhTay(vaiP, tayP);
      if (dang !== 1) s = `<g transform="scale(${dang},1)">${s}</g>`;
      // cổ + đầu
      s += `<g transform="${dau}">`;
      s += toc(o.vai, true, ng.toc, V.toc);
      s += `<rect x="-26" y="-626" width="52" height="70" rx="14" ${A(V.da)}/>`;
      if (o.quay) {
        s += `<ellipse cx="0" cy="-720" rx="104" ry="112" ${A(V.toc)}/><circle cx="-102" cy="-712" r="20" ${A(V.da)}/><circle cx="102" cy="-712" r="20" ${A(V.da)}/>`;
      } else {
        s += `<circle cx="-100" cy="-712" r="21" ${A(V.da)}/><circle cx="100" cy="-712" r="21" ${A(V.da)}/>`;
        s += `<ellipse cx="0" cy="-720" rx="102" ry="110" ${A(V.da)}/>`;
        s += toc(o.vai, false, ng.toc, V.toc) + mat(o) + kinh(o.vai, ng.kinh);
        if (o.vai === 'sep' && AN) s += `<path d="M-30 -676 Q0 -690 30 -676 Q0 -668 -30 -676 Z" fill="${V.toc}"/>`;
      }
      s += '</g>';
      const mo_ = o.mo ? ' opacity=".55"' : '';
      return `<g transform="rotate(${(o.nghieng || 0) * (o.lat ? -1 : 1)}) scale(${o.lat ? -o.s : o.s},${o.s})"${mo_}>${s}</g>`;
    }

    // ---------------- đạo cụ ----------------
    function ban(o) {
      const w = o.w || 900;
      if (o.mat) return `<rect x="${-w / 2}" y="26" width="${w}" height="240" rx="6" ${A(cfg.mauBan2 || '#C9BDB4')}/>`;
      return `<rect x="${-w / 2 - 20}" y="0" width="${w + 40}" height="30" rx="10" ${A(cfg.mauBan || '#DCD1C9')}/><rect x="${-w / 2}" y="26" width="${w}" height="260" rx="6" ${A(cfg.mauBan2 || '#C9BDB4')}/>`;
    }
    function manNoiDung(kieu, w, h, t) {
      if (kieu === 'trong') return `<rect width="${w}" height="${h}" ${A('#2B2D42', { w: 4 })}/>`;
      if (kieu === 'bieu-do') {
        let s = `<rect width="${w}" height="${h}" ${A(M.man, { w: 4 })}/>`;
        [0.35, 0.5, 0.7, 0.95].forEach((v, k) => { const hh = (h - 40) * v * clamp((t || 0) * 0.8 - k * 0.15); s += `<rect x="${24 + k * (w - 48) / 4}" y="${h - 20 - hh}" width="${(w - 48) / 4 - 12}" height="${hh}" ${A(k === 3 ? M.do : '#8D99AE', { w: 4, nhan: k === 3, dac: true })}/>`; });
        return s;
      }
      let s = `<rect width="${w}" height="${h}" ${A(M.man, { w: 4 })}/>`;
      for (let k = 0; k < 5; k++) s += `<rect x="20" y="${22 + k * (h - 40) / 5}" width="${(w - 40) * (k % 2 ? 0.7 : 0.9)}" height="10" rx="5" ${A('#C8CCD4', { w: 3 })}/>`;
      return s;
    }
    function laptop(o) {
      const s = o.s || 1, w = 300, h = 190;
      return `<g transform="scale(${s})"><rect x="${-w / 2 - 14}" y="${-h - 24}" width="${w + 28}" height="${h + 24}" rx="14" ${A('#2E2E36')}/>
        <g transform="translate(${-w / 2},${-h - 12})">${manNoiDung(o.man, w, h, o.t)}</g>
        <path d="M${-w / 2 - 40} 0 L${w / 2 + 40} 0 L${w / 2 + 24} 16 L${-w / 2 - 24} 16 Z" ${A('#BFC3CB')}/></g>`;
    }
    let _clip = 0;
    function manHinh(o, nd) {
      const w = o.w, h = o.h, id = 'mh' + (_clip++);
      return `<rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="30" ${A('#1E1E24')}/>
        <defs><clipPath id="${id}"><rect x="${-w / 2 + 20}" y="${-h / 2 + 20}" width="${w - 40}" height="${h - 40}" rx="14"/></clipPath></defs>
        <g clip-path="url(#${id})"><rect x="${-w / 2 + 20}" y="${-h / 2 + 20}" width="${w - 40}" height="${h - 40}" ${A(M.man, { w: 4 })}/><g transform="translate(${-w / 2 + 20},${-h / 2 + 20})">${nd}</g></g>
        <rect x="-60" y="${h / 2}" width="120" height="70" ${A('#2E2E36')}/><rect x="-170" y="${h / 2 + 64}" width="340" height="22" rx="11" ${A('#2E2E36')}/>`;
    }
    const chu2 = (text, o = {}) => `<text x="${o.x || 0}" y="${o.y || 0}" font-family="${o.ho || cfg.hoChu || 'BVP'}" font-weight="${o.dam || 600}" font-size="${o.co || 32}" text-anchor="${o.neo || 'middle'}" fill="${o.mau || (NET ? M.muc : '#3A3A44')}" ${NET ? 'class="vt"' : ''}>${thoat(text)}</text>`;
    function cuaSo(o) {
      let s = `<rect width="${o.w}" height="64" ${A('#EDEEF2', { w: 4 })}/>`;
      ['#E06C75', '#E5C07B', '#98C379'].forEach((c, k) => (s += `<circle cx="${32 + k * 30}" cy="32" r="10" ${A(c, { w: 3 })}/>`));
      s += chu2(o.tieu_de || 'Tài liệu gửi khách', { x: 140, y: 43, neo: 'start', co: 28, dam: 600 });
      for (let k = 0; k < 8; k++) s += `<rect x="60" y="${110 + k * 58}" width="${(o.w - 120) * (k % 3 === 2 ? 0.55 : 0.92)}" height="16" rx="8" ${A('#D5D8DE', { w: 3 })}/>`;
      return s;
    }
    function nhomAvatar(r) {
      return `<circle r="${r}" ${A('#8D99AE')}/><circle cx="${-r * 0.35}" cy="${-r * 0.1}" r="${r * 0.3}" ${A('#F3EFEF', { w: 3 })}/><circle cx="${r * 0.35}" cy="${-r * 0.1}" r="${r * 0.3}" ${A('#F3EFEF', { w: 3 })}/><path d="M${-r * 0.75} ${r * 0.55} Q0 ${r * 0.1} ${r * 0.75} ${r * 0.55}" ${A('#F3EFEF', { w: 3 })}/>`;
    }
    function thongBao(o) {
      const w = o.w || 520;
      return `<rect x="${-w / 2}" y="-66" width="${w}" height="132" rx="22" ${A('#FFFFFF')}/><rect x="${-w / 2}" y="-66" width="${w}" height="132" rx="22" fill="none" stroke="#00000022" stroke-width="2"/>
        <g transform="translate(${-w / 2 + 64},0)">${nhomAvatar(40)}</g>
        ${chu2(o.tieuDe, { x: -w / 2 + 124, y: -8, neo: 'start', co: 34, dam: 800, mau: NET ? M.do : M.den })}
        ${chu2(o.dong, { x: -w / 2 + 124, y: 38, neo: 'start', co: 28, dam: 500 })}
        <circle cx="${w / 2 - 34}" cy="-30" r="12" ${A(M.do, { nhan: true, dac: true })}/>`;
    }
    function chatDau(o) {
      return `<rect width="${o.w}" height="110" ${A(cfg.mauChat || '#2B2D42', { w: 4 })}/><path d="M34 55 L52 37 M34 55 L52 73" stroke="${NET ? M.muc : '#fff'}" stroke-width="6" stroke-linecap="round"/>
        <g transform="translate(110,55)">${nhomAvatar(34)}</g>${chu2(o.ten, { x: 162, y: 66, neo: 'start', co: 36, dam: 800, mau: NET ? M.muc : '#FFFFFF' })}`;
    }
    const MAU_AVATAR = ['#FFD6A5', '#CAFFBF', '#9BF6FF', '#BDB2FF', '#FFC6FF', '#FDFFB6'];
    function avatar(o) {
      const r = o.r, v = VAI[o.vai] || VAI.chi;
      const id = 'av' + (_clip++);
      return `<defs><clipPath id="${id}"><circle r="${r}"/></clipPath></defs><circle r="${r}" ${A(MAU_AVATAR[(o.mau || 0) % MAU_AVATAR.length], { w: 4 })}/>
        <g clip-path="url(#${id})"><g transform="translate(0,${r * 1.55}) scale(${r / 240})">${NET ? `<circle cx="0" cy="-720" r="105" ${A('none', { w: 14 })}/><path d="M-130 -470 Q0 -600 130 -470" ${A('none', { w: 14 })}/>` :
          `<path d="M-130 -420 Q-130 -560 0 -566 Q130 -560 130 -420 Z" ${A(v.ao, { w: 10 })}/>${toc(o.vai, true)}<ellipse cx="0" cy="-720" rx="102" ry="110" ${A(v.da, { w: 10 })}/>${toc(o.vai, false)}`}</g></g>`;
    }
    function choTrong(o) {
      const r = o.r;
      return `<circle r="${r}" fill="${NET ? 'none' : '#FDECEE'}" stroke="${M.do}" stroke-width="6" stroke-dasharray="14 10" ${NET ? '' : ''}/>
        <path d="M-20 -20 L20 20 M20 -20 L-20 20" stroke="${M.do}" stroke-width="9" stroke-linecap="round"/>
        ${chu2(o.ten || 'Mình', { y: r + 46, co: 34, dam: 800, mau: M.do })}`;
    }
    function anhLau(o) {
      const w = o.w, h = o.h, t = o.t || 0;
      let s = `<rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="18" ${A('#3D2B25')}/>`;
      s += `<ellipse cx="0" cy="20" rx="${w * 0.36}" ry="${h * 0.3}" ${A('#6B6B73')}/><ellipse cx="0" cy="14" rx="${w * 0.3}" ry="${h * 0.24}" ${A('#C8402F', { nhan: true, dac: true })}/>`;
      [[-0.12, 0], [0.1, -0.06], [0.02, 0.1], [-0.05, -0.1]].forEach(([a, b]) => (s += `<circle cx="${a * w}" cy="${14 + b * h}" r="16" ${A('#F4E3B5', { w: 3 })}/>`));
      [[-0.42, -0.32], [0.42, -0.32], [-0.42, 0.34], [0.42, 0.34]].forEach(([a, b]) => (s += `<circle cx="${a * w}" cy="${b * h}" r="30" ${A('#EDE6DF')}/>`));
      for (let k = 0; k < 3; k++) { const y0 = -40 - ((t * 60 + k * 30) % 90); s += `<path d="M${-40 + k * 40} ${y0 + 40} q-12 -20 0 -40 q12 -20 0 -40" stroke="${NET ? M.muc : '#FFFFFF'}" stroke-width="6" fill="none" stroke-linecap="round" opacity="${(0.7 - ((t * 60 + k * 30) % 90) / 130).toFixed(2)}"/>`; }
      return s;
    }
    function camXuc(o) {
      return `<rect x="-110" y="-34" width="220" height="68" rx="34" ${A('#FFFFFF')}/>` +
        [-62, 0, 62].map((x, k) => `<circle cx="${x}" cy="0" r="22" ${A(['#FFC83D', '#E63946', '#FFC83D'][k], { nhan: k === 1, dac: true, w: 4 })}/>`).join('');
    }

    // ---------------- số, biểu tượng, bong bóng ----------------
    function so(n, o) {
      const s = o.s || 1;
      return `<g transform="scale(${s})"><circle r="150" ${A(M.do, { nhan: true, dac: true, w: 10 })}/>
        <text y="70" text-anchor="middle" font-family="${cfg.hoSo || 'BVP'}" font-weight="800" font-size="210" fill="${NET ? M.do : M.trang}">${n}</text></g>`;
    }
    function tim(s) { return `<path d="M0 30 C-60 -10 -50 -60 -20 -60 C-5 -60 0 -45 0 -40 C0 -45 5 -60 20 -60 C50 -60 60 -10 0 30 Z" transform="scale(${s})" ${A(M.do, { nhan: true, dac: true, w: 5 })}/>`; }
    function sao(s) {
      let d = ''; for (let k = 0; k < 10; k++) { const r = k % 2 ? 26 : 62, a = -Math.PI / 2 + k * Math.PI / 5; d += (k ? 'L' : 'M') + (r * Math.cos(a)).toFixed(1) + ' ' + (r * Math.sin(a)).toFixed(1); }
      return `<path d="${d}Z" transform="scale(${s})" ${A('#FFC83D', { dac: true, w: 5 })}/>`;
    }
    function icon(ten, o = {}) {
      const s = o.s || 1, t = o.t || 0, lac = Math.sin(t * 5) * 4;
      let g = '';
      ten = { 'dau-than': 'cham-than', 'ngoi-sao': 'sao', 'coc-ca-phe': 'ca-phe', 'cham-lung': 'cham' }[ten] || ten;
      switch (ten) {
        case 'dau-hoi': g = `<g transform="rotate(${lac})"><circle r="70" ${A(M.do, { nhan: true, dac: true })}/><text y="40" text-anchor="middle" font-family="BVP" font-weight="800" font-size="120" fill="${NET ? M.do : '#fff'}">?</text></g>`; break;
        case 'cham-than': g = `<g transform="rotate(${lac})"><circle r="60" ${A('#FFC83D', { dac: true })}/><text y="36" text-anchor="middle" font-family="BVP" font-weight="800" font-size="100" fill="${NET ? M.muc : M.den}">!</text></g>`; break;
        case 'tim': g = `<g transform="translate(0,${(Math.sin(t * 4) * 6).toFixed(1)})">${tim(1)}</g>`; break;
        case 'sao': g = `<g transform="rotate(${(t * 20) % 360})">${sao(1)}</g>`; break;
        case 'con-tro': g = `<path d="M0 0 L0 64 L16 50 L28 76 L40 70 L28 46 L48 46 Z" ${A('#FFFFFF', { w: 4 })} stroke="${M.den}" stroke-width="4"/>`; break;
        case 'nghen': g = [0, 1, 2].map(k => `<path d="M${-30 + k * 30} ${-10 * Math.sin(t * 6 + k)} q8 -14 16 0" stroke="${NET ? M.muc : '#8D99AE'}" stroke-width="6" fill="none" stroke-linecap="round"/>`).join('') + `<path d="M-50 30 q25 -16 50 0 t50 0" stroke="${NET ? M.muc : '#5C677D'}" stroke-width="7" fill="none" stroke-linecap="round"/>`; break;
        case 'cham': g = `<rect x="-90" y="-50" width="180" height="100" rx="40" ${A('#FFFFFF')}/>` + [-40, 0, 40].map(x => `<circle cx="${x}" cy="0" r="11" fill="${NET ? M.muc : '#9AA0A6'}"/>`).join(''); break;
        case 'chuong': g = `<g transform="rotate(${Math.sin(t * 14) * 14} 0 -50)"><path d="M-40 20 Q-40 -50 0 -54 Q40 -50 40 20 L52 34 L-52 34 Z" ${A('#FFC83D', { dac: true })}/><circle cy="46" r="10" ${A('#FFC83D', { dac: true })}/></g>`; break;
        case 'dong-ho': { const a1 = (o.quay ? t * 360 : t * 40), a2 = (o.quay ? t * 30 : t * 4); g = `<circle r="62" ${A('#FFFFFF', { w: 7 })} stroke="${NET ? M.muc : M.den}" stroke-width="7"/><path d="M0 0 L0 -44" stroke="${M.do}" stroke-width="6" stroke-linecap="round" transform="rotate(${a1 % 360})"/><path d="M0 0 L0 -30" stroke="${NET ? M.muc : M.den}" stroke-width="8" stroke-linecap="round" transform="rotate(${a2 % 360})"/>`; break; }
        case 'mat-trang': g = `<path d="M20 -60 A62 62 0 1 0 60 30 A50 50 0 1 1 20 -60 Z" ${A('#F4E3B5', { dac: true })}/>` + [[-80, -40], [70, -70], [-40, 70]].map(([x, y], k) => `<circle cx="${x}" cy="${y}" r="${4 + 3 * Math.abs(Math.sin(t * 3 + k))}" fill="#F4E3B5"/>`).join(''); break;
        case 'kinh-lup': g = `<g transform="rotate(${lac * 2})"><circle cx="-14" cy="-14" r="54" fill="${NET ? 'none' : '#E3F2FD'}" stroke="${NET ? M.muc : M.den}" stroke-width="12"/><path d="M26 26 L76 76" stroke="${NET ? M.muc : M.den}" stroke-width="20" stroke-linecap="round"/></g>`; break;
        case 'ca-phe': g = `<path d="M-40 -30 L40 -30 L32 50 L-32 50 Z" ${A('#FFFFFF')}/><rect x="-44" y="-44" width="88" height="18" rx="6" ${A('#6F4E37')}/><rect x="-36" y="-2" width="72" height="22" ${A(M.do, { nhan: true, dac: true, w: 3 })}/>` + [0, 1].map(k => `<path d="M${-12 + k * 24} ${-56 - ((t * 30 + k * 20) % 40)} q-10 -14 0 -28" stroke="${NET ? M.muc : '#9AA0A6'}" stroke-width="5" fill="none" stroke-linecap="round"/>`).join(''); break;
        case 'bieu-do': g = `<path d="M-70 60 L-70 -70 M-70 60 L80 60" stroke="${NET ? M.muc : M.den}" stroke-width="8" stroke-linecap="round" fill="none"/>` + `<path d="M-60 40 L-20 10 L10 24 L60 -50" stroke="${M.do}" stroke-width="10" fill="none" stroke-linecap="round" stroke-linejoin="round" pathLength="1" stroke-dasharray="1" stroke-dashoffset="${(1 - clamp(t / 1.5)).toFixed(3)}"/><path d="M44 -52 L62 -52 L62 -34" stroke="${M.do}" stroke-width="10" fill="none" stroke-linecap="round" opacity="${clamp(t / 1.5 - 0.8) * 5}"/>`; break;
        case 'dien-thoai': g = `<rect x="-40" y="-72" width="80" height="144" rx="16" ${A('#2E2E36')}/><rect x="-32" y="-58" width="64" height="112" rx="6" ${A('#DDE7F5', { w: 3 })}/><circle cy="62" r="5" fill="${NET ? M.muc : '#888'}"/>` + (Math.sin(t * 9) > 0.3 ? `<circle cx="34" cy="-64" r="12" ${A(M.do, { nhan: true, dac: true, w: 3 })}/>` : ''); break;
        case 'phong-bi': g = `<rect x="-70" y="-46" width="140" height="92" rx="8" ${A('#FFFFFF')}/><path d="M-70 -46 L0 10 L70 -46" ${A('none', { rong: true, w: 5 })} fill="none" stroke="${NET ? M.muc : '#9AA0A6'}" stroke-width="5"/><circle cx="58" cy="-40" r="14" ${A(M.do, { nhan: true, dac: true, w: 3 })}/>`; break;
        case 'cua': g = `<rect x="-80" y="-170" width="160" height="340" rx="6" ${A('#B08968')}/><rect x="-62" y="-150" width="124" height="130" rx="4" ${A('#C9A27E', { w: 3 })}/><circle cx="52" cy="10" r="10" ${A('#FFC83D', { dac: true, w: 3 })}/>`; break;
        case 'lich': g = `<rect x="-70" y="-64" width="140" height="128" rx="14" ${A('#FFFFFF')}/><rect x="-70" y="-64" width="140" height="38" rx="14" ${A(M.do, { nhan: true, dac: true, w: 3 })}/><path d="M-40 -76 L-40 -52 M40 -76 L40 -52" stroke="${NET ? M.muc : M.den}" stroke-width="8" stroke-linecap="round"/>` + [0, 1, 2].map(r => [0, 1, 2, 3].map(c => `<rect x="${-52 + c * 28}" y="${-12 + r * 24}" width="18" height="14" rx="3" fill="${r === 1 && c === 2 ? M.do : (NET ? 'none' : '#D5D8DE')}" ${NET ? `stroke="${M.muc}" stroke-width="2"` : ''}/>`).join('')).join(''); break;
        case 'tai-lieu': g = `<rect x="-50" y="-66" width="100" height="132" rx="8" ${A('#FFFFFF')}/>` + [0, 1, 2, 3].map(k => `<rect x="-32" y="${-40 + k * 24}" width="${k === 3 ? 40 : 64}" height="9" rx="4" fill="${NET ? M.muc : '#9AA0A6'}"/>`).join(''); break;
        case 'ban-hop': g = `<ellipse cx="0" cy="0" rx="260" ry="70" ${A('#B8ADA5')}/>` + [-170, -60, 60, 170].map(x => `<rect x="${x - 34}" y="-120" width="68" height="60" rx="14" ${A('#8D99AE')}/>`).join(''); break;
        case 'gach-cheo': g = `<path d="M-60 -60 L60 60 M60 -60 L-60 60" stroke="${M.do}" stroke-width="20" stroke-linecap="round" pathLength="1" stroke-dasharray="1" stroke-dashoffset="${(1 - clamp((o.p ?? 1))).toFixed(3)}"/>`; break;
        case 'tick': g = `<circle r="56" ${A('#2A9D8F', { dac: true, mauDac: '#2A9D8F' })}/><path d="M-26 2 L-6 22 L28 -20" stroke="#FFFFFF" stroke-width="14" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`; break;
        case 'vong-tron-do': { const r = o.r || 120; g = `<ellipse rx="${r}" ry="${r * 0.82}" fill="none" stroke="${M.do}" stroke-width="12" stroke-linecap="round" transform="rotate(-8)" pathLength="1" stroke-dasharray="1" stroke-dashoffset="${(1 - clamp(o.p ?? 1)).toFixed(3)}"/>`; break; }
      }
      return `<g transform="scale(${s})">${g}</g>`;
    }
    function bong(o) {
      const w = o.w, h = o.h, ben = o.ben === 'phai' ? 1 : -1, t = o.t || 0;
      let s = `<rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="${h * 0.4}" ${A('#FFFFFF')}/>`;
      s += `<path d="M${ben * 20} ${h / 2 - 6} L${ben * 6} ${h / 2 + 46} L${ben * 56} ${h / 2 - 6} Z" ${A('#FFFFFF')}/>`;
      if (VIEN) s += `<rect x="${-w / 2 + 8}" y="${h / 2 - 16}" width="${w - 16}" height="12" fill="#FFFFFF"/>`;
      const nd = {
        giay: `<rect x="-34" y="-44" width="68" height="88" rx="6" ${A('#EDF2FB', { w: 4 })} stroke="#5C677D" stroke-width="4"/>` + [0, 1, 2].map(k => `<rect x="-20" y="${-24 + k * 20}" width="40" height="7" rx="3" fill="#5C677D"/>`).join(''),
        khoa: `<path d="M-50 0 Q0 22 50 0 Q0 -14 -50 0 Z" ${A('#E07A7A', { nhan: true, dac: true, w: 4 })}/>` + [-30, -15, 0, 15, 30].map(x => `<path d="M${x} -10 L${x} 14" stroke="${NET ? M.muc : M.den}" stroke-width="5"/>`).join(''),
        'cuoi-tuan': `<circle cx="-20" cy="-6" r="26" ${A('#FFC83D', { dac: true })}/>` + [0, 1, 2, 3, 4, 5].map(k => `<path d="M${-20 + 38 * Math.cos(k * 1.047 + t)} ${-6 + 38 * Math.sin(k * 1.047 + t)} L${-20 + 50 * Math.cos(k * 1.047 + t)} ${-6 + 50 * Math.sin(k * 1.047 + t)}" stroke="#FFC83D" stroke-width="6" stroke-linecap="round"/>`).join('') + `<path d="M30 30 L30 -30 M0 -24 Q30 -50 60 -24 Z" ${A('#4CC9F0', { w: 4 })} stroke="${NET ? M.muc : '#2B2D42'}" stroke-width="5"/>`,
        haha: [-36, 0, 36].map((x, k) => `<circle cx="${x}" cy="${(Math.sin(t * 10 + k) * 8).toFixed(1)}" r="12" fill="${NET ? M.muc : '#FFB703'}"/>`).join(''),
        sao: sao(0.7),
        cham: [-36, 0, 36].map((x, k) => `<circle cx="${x}" cy="${(Math.sin(t * 8 + k) * 5).toFixed(1)}" r="12" fill="${NET ? M.muc : '#9AA0A6'}"/>`).join(''),
      }[o.noiDung] || '';
      return s + nd;
    }
    function vong(o) {
      return `<circle r="${o.r}" fill="${NET ? 'none' : 'rgba(230,57,70,.06)'}" stroke="${M.do}" stroke-width="8" stroke-dasharray="26 18" transform="rotate(${((o.t || 0) * 12) % 360})"/>`;
    }

    // ---------------- chữ nhấn ----------------
    function chu(canh, t, ctx, o = {}) {
      if (!canh.chu || (o.hien !== undefined && o.hien <= 0 && o.kieu !== 'dap')) return '';
      const x0 = o.x0 ?? 80, maxW = o.maxW ?? 820, ho = cfg.hoChu || 'BVP';
      const fit = vuaKhung(canh.chu, { ho, dam: cfg.damChu || 800, maxW: maxW - 48, maxDong: 3, co: o.co });
      const lh = fit.co * 1.22, cx = x0 + maxW / 2;
      let s = '';
      fit.lines.forEach((ln, k) => {
        const t0 = (o.t0 || 0) + k * (o.kieu === 'dap' ? 0.14 : 0.1);
        const p = o.kieu === 'dap' ? pha(t, t0, 0.32) : pha(t, t0, 0.4);
        if (p <= 0) return;
        const sc = o.kieu === 'dap' ? lerp(2.4, 1, E.out3(p)) + (p >= 1 ? 0 : 0) : E.back(p, 2.2) * 0.4 + 0.6;
        const rung = o.kieu === 'dap' && p >= 1 && t - t0 < 0.55 ? Math.sin((t - t0) * 70) * 6 * (1 - (t - t0) / 0.55) : 0;
        const y = (o.y ?? 300) + lh * (k + 0.5);
        const wl = TC.doRong(ln, fit.font) + 48;
        const goc = (k % 2 ? 1.2 : -1.2) + Math.sin(t * 1.3 + k) * 0.4;
        s += `<g transform="translate(${cx + rung},${y}) rotate(${goc.toFixed(2)}) scale(${sc.toFixed(4)})" opacity="${clamp(p * 3).toFixed(3)}">`;
        if (cfg.nenChu !== false) s += `<rect x="${-wl / 2}" y="${-lh / 2}" width="${wl}" height="${lh}" rx="18" ${o.kieu === 'dap' ? `fill="${M.chuNenDap || M.den}"` : A(M.chuNen, { w: 5 })}/>`;
        // o.lop(g, 'duoi'|'tren'): hiệu ứng chữ (to-da-quang, gach-thay) vẽ dưới/trên dòng chữ, toạ độ cục bộ của dòng
        const g = o.lop && { k, dong: fit.lines, line: ln, font: fit.font, co: fit.co, cx: 0, yb: fit.co * 0.36, w: wl - 48, gian: 0, ox: cx, oy: y, dem: 24 };
        if (g) s += o.lop(g, 'duoi');
        s += `<text y="${fit.co * 0.36}" text-anchor="middle" font-family="${ho}" font-weight="${cfg.damChu || 800}" font-size="${fit.co}">${toTuKhoa(ln, canh.tu_khoa, o.kieu === 'dap' ? (M.chuDap || '#FFFFFF') : M.chu, o.kieu === 'dap' ? (M.nhanDap || M.do) : M.do)}</text>`;
        if (g) s += o.lop(g, 'tren');
        s += '</g>';
      });
      return s;
    }

    // ---------------- nền ----------------
    function chamNen(t, mau, op = 0.5, buoc = 90) {
      let s = '';
      const dx = (t * 14) % buoc, dy = (t * 8) % buoc;
      for (let y = -buoc; y < 1920 + buoc; y += buoc) for (let x = -buoc; x < 1080 + buoc; x += buoc) s += `<circle cx="${x + dx + ((y / buoc) % 2) * buoc / 2}" cy="${y + dy}" r="5" fill="${mau}" opacity="${op}"/>`;
      return s;
    }
    const tong = ctx => (ctx && ctx.tong && window.TV && TV.TONG_MAU[ctx.tong]) || null;
    // bối cảnh phòng: trả {svg, cua:[[x,y,w,h]...]} — nét vẽ theo chất liệu, cửa sổ để phong cách khác khoét lỗ
    function nenPhong(kieu, t, T) {
      const kinh = T ? T.kinh : '#DCE8F0', tuong = T ? T.tuong : M.nen, san = T ? T.nen2 : M.nen2;
      const cua = [];
      const cuaSo = (x, y, w, h, chia = 2) => {
        cua.push([x, y, w, h]);
        let g = BONG ? '' : `<rect x="${x}" y="${y}" width="${w}" height="${h}" ${NET ? A('none', { rong: true, w: 5 }) : `fill="${kinh}"`}/>`;
        const vien = NET ? M.muc : (BONG ? M.bong : '#CBBFB6');
        g += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="${vien}" stroke-width="${BONG ? 18 : 12}"/>`;
        for (let k = 1; k < chia; k++) g += `<path d="M${x + w * k / chia} ${y} L${x + w * k / chia} ${y + h}" stroke="${vien}" stroke-width="${BONG ? 12 : 8}"/>`;
        return g + `<path d="M${x} ${y + h * 0.48} L${x + w} ${y + h * 0.48}" stroke="${vien}" stroke-width="${BONG ? 12 : 8}"/>`;
      };
      const den = (x, y) => `<path d="M${x} 0 L${x} ${y - 40}" stroke="${NET ? M.muc : '#6B6B73'}" stroke-width="4"/><path d="M${x - 50} ${y} L${x - 26} ${y - 44} L${x + 26} ${y - 44} L${x + 50} ${y} Z" ${A('#2E2E36')}/>` + (BONG || NET ? '' : `<ellipse cx="${x}" cy="${y + 30}" rx="90" ry="40" fill="#FFE7A6" opacity="${0.35 + 0.08 * Math.sin(t * 2 + x)}"/>`);
      let g = BONG ? '' : `<rect width="1080" height="1320" fill="${tuong}"/>`;
      switch (kieu) {
        case 'phong-hop':
          g += `<rect x="110" y="630" width="470" height="300" rx="10" ${A('#FFFFFF')}/>` + [0, 1, 2].map(k => `<path d="M150 ${700 + k * 60} q90 -20 180 0 t140 0" stroke="${k === 1 ? M.do : (NET ? M.muc : '#5C677D')}" stroke-width="7" fill="none"/>`).join('');
          g += `<rect x="690" y="650" width="300" height="180" rx="10" ${A('#2E2E36')}/><rect x="706" y="666" width="268" height="148" ${A(BONG ? M.bong : '#3D5A80', { w: 3 })}/>`;
          g += [150, 330, 750, 930].map(x => `<rect x="${x - 50}" y="1130" width="100" height="150" rx="20" ${A('#B8ADA5')}/>`).join('');
          break;
        case 'pantry':
          g += `<rect x="70" y="610" width="600" height="170" rx="8" ${A('#E9DCCB')}/>` + [0, 1, 2].map(k => `<rect x="${70 + k * 200}" y="610" width="200" height="170" fill="none" stroke="${NET ? M.muc : '#CBB9A4'}" stroke-width="5"/><rect x="${158 + k * 200}" y="700" width="24" height="8" rx="4" fill="${NET ? M.muc : '#8D7B68'}"/>`).join('');
          g += `<rect x="70" y="1070" width="620" height="250" ${A('#D8C3A5')}/><rect x="60" y="1050" width="640" height="30" rx="8" ${A('#BFA88A')}/>`;
          g += `<rect x="170" y="930" width="130" height="120" rx="12" ${A('#3A3A44')}/><rect x="200" y="960" width="70" height="40" rx="6" ${A('#9AA0A6', { w: 3 })}/>` + [380, 450, 520].map(x => `<path d="M${x} 1000 L${x + 40} 1000 L${x + 34} 1050 L${x + 6} 1050 Z" ${A(x === 450 ? M.do : '#FFFFFF', { nhan: x === 450, dac: true, w: 3 })}/>`).join('');
          g += `<rect x="770" y="690" width="230" height="630" rx="18" ${A('#E6E8EC')}/><path d="M770 930 L1000 930" stroke="${NET ? M.muc : '#C7CBD1'}" stroke-width="6"/><rect x="800" y="760" width="12" height="120" rx="6" ${A('#9AA0A6', { w: 3 })}/>`;
          break;
        case 'thang-may':
          g += BONG ? '' : `<rect x="0" y="0" width="1080" height="1320" fill="${tuong}"/><rect x="170" y="560" width="580" height="760" fill="${san}" opacity=".5"/>`;
          g += `<rect x="200" y="620" width="520" height="700" ${A('#AEB4BE')}/><rect x="208" y="628" width="248" height="692" ${A('#C9CED6', { w: 3 })}/><rect x="464" y="628" width="248" height="692" ${A('#C9CED6', { w: 3 })}/>`;
          g += `<rect x="380" y="540" width="160" height="56" rx="10" ${A('#2E2E36')}/><path d="M410 580 L425 556 L440 580 Z" fill="${M.do}"/><text x="490" y="582" text-anchor="middle" font-family="BVP" font-weight="800" font-size="36" fill="${M.do}">${((Math.floor(t * 0.8)) % 9) + 1}</text>`;
          g += `<rect x="790" y="880" width="70" height="160" rx="12" ${A('#2E2E36')}/><circle cx="825" cy="930" r="16" ${A('#9AA0A6', { w: 3 })}/><circle cx="825" cy="990" r="16" ${A(M.do, { nhan: true, dac: true, w: 3 })}/>`;
          g += `<rect x="930" y="1160" width="80" height="160" rx="10" ${A('#8D6B4F')}/><circle cx="970" cy="1110" r="70" ${A('#7FAE86')}/>`;
          break;
        case 'phong-sep':
          g += cuaSo(60, 560, 600, 560, 3);
          if (!BONG && !NET) g += [80, 160, 250, 330, 420, 500, 580].map((x, k) => `<rect x="${x}" y="${900 - (k % 3) * 70 - 60}" width="60" height="${(k % 3) * 70 + 220}" fill="#9FB3C8" opacity=".55"/>`).join('');
          g += `<rect x="730" y="600" width="300" height="720" ${A('#8B6B4F')}/>` + [0, 1, 2, 3].map(r => `<path d="M730 ${760 + r * 150} L1030 ${760 + r * 150}" stroke="${NET ? M.muc : '#6B4F3A'}" stroke-width="10"/>` + [0, 1, 2, 3, 4, 5].map(b => `<rect x="${750 + b * 44}" y="${680 + r * 150}" width="32" height="${70 + (b * 13 % 20)}" ${A(['#E63946', '#F3EFEF', '#5C677D', '#D4A373', '#6B8F71', '#2B2D42'][(b + r) % 6], { w: 2, nhan: (b + r) % 6 === 0, dac: true })}/>`).join('')).join('');
          g += `<rect x="250" y="1160" width="520" height="160" rx="8" ${A('#6B4F3A')}/><rect x="440" y="1130" width="140" height="34" rx="6" ${A('#D4A373', { w: 3 })}/>`;
          break;
        case 'quan-ca-phe':
          g += cuaSo(640, 620, 380, 300, 2) + `<path d="M630 620 L1030 620 L1010 560 L650 560 Z" ${A(M.do, { nhan: true, dac: true })}/>` + [0, 1, 2, 3, 4].map(k => `<path d="M${650 + k * 80} 560 L${640 + k * 80} 620" stroke="#FFFFFF" stroke-width="20" opacity="${BONG || NET ? 0 : 0.8}"/>`).join('');
          g += `<rect x="90" y="620" width="400" height="250" rx="12" ${A('#2E3A33')}/>` + [0, 1, 2, 3].map(k => `<path d="M130 ${680 + k * 46} L${300 + (k % 2) * 120} ${680 + k * 46}" stroke="${NET ? M.muc : '#E8E2D0'}" stroke-width="6" stroke-linecap="round"/>`).join('');
          g += `<rect x="60" y="1020" width="560" height="300" ${A('#8B6B4F')}/><rect x="50" y="1000" width="580" height="30" rx="8" ${A('#6B4F3A')}/>` + den(240, 520) + den(470, 480) + den(820, 470);
          g += `<ellipse cx="840" cy="1180" rx="120" ry="24" ${A('#6B4F3A')}/><rect x="832" y="1180" width="16" height="140" ${A('#4A3A2C')}/>`;
          break;
        case 'o-nha-toi':
          g += BONG ? '' : `<rect width="1080" height="1320" fill="#2B2D42" opacity=".35"/>`;
          g += cuaSo(620, 600, 360, 420, 2) + (BONG ? '' : `<circle cx="${880 - t * 2}" cy="700" r="40" fill="#F4E3B5"/>` + [[680, 660], [760, 760], [930, 820]].map(([x, y], k) => `<circle cx="${x}" cy="${y}" r="${3 + 2 * Math.abs(Math.sin(t * 2 + k))}" fill="#F4E3B5"/>`).join(''));
          g += `<rect x="70" y="1040" width="560" height="280" rx="40" ${A('#6B7FA6')}/><rect x="70" y="960" width="560" height="140" rx="40" ${A('#7E92B8')}/><rect x="40" y="1060" width="80" height="260" rx="30" ${A('#5A6C92')}/><rect x="580" y="1060" width="80" height="260" rx="30" ${A('#5A6C92')}/>`;
          g += `<path d="M780 1320 L780 820" stroke="${NET ? M.muc : (BONG ? M.bong : '#3A3A44')}" stroke-width="10"/><path d="M720 820 L740 750 L820 750 L840 820 Z" ${A('#F4E3B5')}/>` + (BONG || NET ? '' : `<circle cx="780" cy="860" r="${180 + 10 * Math.sin(t * 1.5)}" fill="#FFE7A6" opacity=".22"/>`);
          g += `<rect x="150" y="640" width="200" height="150" rx="6" ${A('#F3EFEF')}/><rect x="166" y="656" width="168" height="118" ${A('#C9ADA7', { w: 3 })}/>`;
          break;
        default: // van-phong-mo (và 'van-phong', 'toi')
          g += cuaSo(90, 700, 300, 360, 2);
          g += `<rect x="690" y="760" width="300" height="20" ${A('#CBBFB6')}/><rect x="710" y="700" width="40" height="60" ${A('#8D99AE', { w: 3 })}/><rect x="760" y="680" width="30" height="80" ${A(M.do, { nhan: true, dac: true, w: 3 })}/><circle cx="880" cy="725" r="34" ${A('#9CC5A1', { w: 3 })}/>`;
          g += [[560, 1170], [820, 1200]].map(([x, y]) => `<rect x="${x - 110}" y="${y}" width="220" height="18" ${A('#CBBFB6', { w: 3 })}/><rect x="${x - 45}" y="${y - 80}" width="90" height="66" rx="6" ${A('#3A3A44', { w: 3 })}/>`).join('');
          g += den(300, 560) + den(780, 600);
      }
      g += `<rect x="0" y="1320" width="1080" height="600" ${BONG ? `fill="${M.bong}"` : (NET ? A('none', { rong: true, w: 4 }) : `fill="${san}"`)}/>`;
      if (kieu === 'toi') g += `<rect width="1080" height="1920" fill="#2B2D42" opacity=".38"/>`;
      return { svg: g, cua };
    }
    const PHONG = ['van-phong-mo', 'van-phong', 'toi', 'phong-hop', 'pantry', 'thang-may', 'phong-sep', 'quan-ca-phe', 'o-nha-toi'];
    function nen(kieu, t, ctx) {
      const W = 1080, H = 1920, T = tong(ctx);
      const N1 = T ? T.nen : M.nen, N2 = T ? T.nen2 : M.nen2;
      if (kieu === 'burst') {
        let s = `<rect width="${W}" height="${H}" fill="${M.do}"/>`;
        for (let k = 0; k < 18; k++) s += `<path d="M540 900 L${540 + 2400 * Math.cos(k * Math.PI / 9 + t * 0.25)} ${900 + 2400 * Math.sin(k * Math.PI / 9 + t * 0.25)} L${540 + 2400 * Math.cos(k * Math.PI / 9 + 0.17 + t * 0.25)} ${900 + 2400 * Math.sin(k * Math.PI / 9 + 0.17 + t * 0.25)} Z" fill="#D62F3D"/>`;
        return s + chamNen(t, '#141414', 0.12);
      }
      if (kieu === 'soi-day') return SOI_DAY.soiDay(t, ctx, { T, sang: !!cfg.nenSoiSang });
      if (kieu === 'man-hinh' || kieu === 'ket') return `<rect width="${W}" height="${H}" fill="${M.den}"/>` + chamNen(t, '#FFFFFF', 0.06);
      if (kieu === 'chia-doi') return `<rect width="${W}" height="${H}" fill="${N1}"/><rect width="540" height="${H}" fill="${M.phu}"/>` + `<rect x="534" y="0" width="12" height="${H}" fill="${M.do}"/>` + `<rect x="0" y="1380" width="${W}" height="540" fill="${N2}"/>`;
      let s = `<rect width="${W}" height="${H}" fill="${N1}"/>` + chamNen(t, '#C9BDB8', 0.35);
      if (PHONG.includes(kieu)) return s + nenPhong(kieu, t, T).svg + chamNen(t, '#FFFFFF', 0.08, 140);
      if (kieu === 'trung' || kieu === 'loi-khuyen') s += `<circle cx="${880 + Math.sin(t) * 20}" cy="${1250 + Math.cos(t * 0.8) * 20}" r="260" fill="${N2}"/><circle cx="${180 + Math.cos(t * 0.7) * 20}" cy="${780}" r="150" fill="${N2}"/><rect x="0" y="1480" width="${W}" height="440" fill="${N2}"/>`;
      if (kieu === 'dau-hieu') s += `<path d="M0 0 L520 0 L0 900 Z" fill="${N2}"/><rect x="0" y="1480" width="${W}" height="440" fill="${N2}"/>`;
      return s;
    }

    // ---------------- đặt + xuất hiện ----------------
    function dat(svg, o) {
      const h = o.hien;
      if (h === undefined || h <= 0.001 || o.an) return '';
      let x = o.x, y = o.y, sc = 1, op = 1;
      if (o.tu === 'duoi') y += (1 - Math.min(h, 1)) * 500;
      else if (o.tu === 'trai') x -= (1 - Math.min(h, 1)) * 500;
      else if (o.tu === 'zoom') { sc = 0.85 + 0.15 * h; op = h; }
      else if (o.tu === 'dap') { sc = 1 + (1 - h) * 1.6; op = clamp(h * 2); }
      else if (o.tu === 'truot-xuong') { op = h; }
      else sc = h;
      return `<g transform="translate(${x.toFixed(1)},${y.toFixed(1)}) scale(${sc.toFixed(4)})"${op < 1 ? ` opacity="${op.toFixed(3)}"` : ''}>${svg}</g>`;
    }

    // ---------------- cảnh kết ----------------
    function ket(c, t, ctx, nvSvg) {
      const L = ctx.L;
      const hl = E.back(pha(t, L.logo, 0.5));
      const nut = E.back(pha(t, L.chu, 0.45)), nhip = 1 + 0.04 * Math.sin(t * 7);
      return nen('ket', t, ctx) +
        (hl > 0 ? `<g transform="translate(540,760) scale(${(hl * 2.4).toFixed(3)})">${TC.QUAN_MA(M.do, M.den)}</g>` : '') +
        `<text x="540" y="1110" text-anchor="middle" font-family="BVP" font-weight="800" font-size="120" fill="#FFFFFF" opacity="${clamp(pha(t, L.logo + 0.15, 0.3))}">Tâm Cơ</text>` +
        `<text x="540" y="1190" text-anchor="middle" font-family="BVP" font-weight="500" font-size="44" fill="#F3EFEF" opacity="${clamp(pha(t, L.logo + 0.3, 0.3))}">Hiểu chiêu để không trúng chiêu.</text>` +
        (nut > 0 ? `<g transform="translate(560,1300) scale(${(nut * nhip).toFixed(4)})"><rect x="-300" y="-62" width="600" height="124" rx="62" fill="${M.do}"/><text y="20" text-anchor="middle" font-family="BVP" font-weight="800" font-size="56" fill="#FFFFFF">+ Theo dõi Tâm Cơ</text></g>` : '') +
        dat(nvSvg, { x: 170, y: 1770, hien: TC.bat(t, 0.2), lop: 2 });
    }

    // bong bóng chat có chữ (trong màn hình). Gốc: góc trên của bong bóng.
    function bongChat(o) {
      const font = '500 32px BVP', dong = TC.ngatDong(o.nd || '', font, o.maxW || 470);
      const w = Math.max(...dong.map(d => TC.doRong(d, font))) + 44, h = dong.length * 42 + 30;
      const toi = o.toi, x = toi ? -w : 0;
      return { w, h, svg: `<rect x="${x}" y="0" width="${w}" height="${h}" rx="22" ${A(toi ? M.do : '#F1F1F4', { nhan: toi, dac: true, w: 4 })}/>` +
        dong.map((d, k) => `<text x="${x + 22}" y="${44 + k * 42}" font-family="${cfg.hoChu === 'PH' ? 'PH' : 'BVP'}" font-weight="500" font-size="${cfg.hoChu === 'PH' ? 38 : 32}" fill="${toi && !NET ? '#FFFFFF' : (NET ? M.muc : '#141414')}">${thoat(d)}</text>`).join('') };
    }
    function email(o) {
      let s = `<rect width="${o.w}" height="80" ${A('#2B2D42', { w: 4 })}/>` + chu2('Hộp thư đến', { x: 30, y: 52, neo: 'start', co: 34, dam: 800, mau: NET ? M.muc : '#FFFFFF' });
      s += `<circle cx="70" cy="150" r="36" ${A('#8D99AE')}/>` + chu2(o.tu || '', { x: 124, y: 140, neo: 'start', co: 30, dam: 700, mau: NET ? M.muc : '#141414' }) + chu2('đến: cả phòng', { x: 124, y: 176, neo: 'start', co: 24 });
      s += chu2(o.tieu_de || '', { x: 34, y: 260, neo: 'start', co: 38, dam: 800, mau: NET ? M.muc : '#141414' });
      for (let k = 0; k < 6; k++) s += `<rect x="34" y="${300 + k * 46}" width="${(o.w - 68) * (k % 3 === 2 ? 0.6 : 0.95)}" height="14" rx="7" ${A('#D5D8DE', { w: 3 })}/>`;
      return s;
    }
    function lichHop(o) {
      const p = o.p ?? 1;
      let s = `<rect x="${o.w / 2 - 300}" y="90" width="600" height="440" rx="26" ${A('#FFFFFF')}/><rect x="${o.w / 2 - 300}" y="90" width="600" height="96" rx="26" ${A(M.do, { nhan: true, dac: true })}/>`;
      s += chu2(o.tieu_de || 'Lịch họp', { x: o.w / 2, y: 152, co: 40, dam: 800, mau: NET ? M.do : '#FFFFFF' });
      s += chu2(o.gio_cu || '', { x: o.w / 2, y: 300, co: 72, dam: 800, mau: '#9AA0A6' });
      if (p > 0) s += `<path d="M${o.w / 2 - 130} 278 L${o.w / 2 - 130 + 260 * Math.min(1, p * 2)} 278" stroke="${M.do}" stroke-width="10" stroke-linecap="round"/>`;
      if (p > 0.5) s += chu2(o.gio_moi || '', { x: o.w / 2, y: 440, co: 86, dam: 800, mau: M.do });
      return s;
    }
    function muiTen(x1, y1, x2, y2, p = 1) {
      const mx = (x1 + x2) / 2, my = Math.min(y1, y2) - 120;
      const goc = Math.atan2(y2 - my, x2 - mx);
      return `<path d="M${x1} ${y1} Q${mx} ${my} ${x2} ${y2}" fill="none" stroke="${M.do}" stroke-width="12" stroke-linecap="round" pathLength="1" stroke-dasharray="1" stroke-dashoffset="${(1 - clamp(p)).toFixed(3)}"/>` +
        (p > 0.95 ? `<path d="M0 0 L-34 -18 L-34 18 Z" fill="${M.do}" transform="translate(${x2},${y2}) rotate(${goc * 180 / Math.PI})"/>` : '');
    }
    const soiDay = (t, ctx, o = {}) => SOI_DAY.soiDay(t, ctx, { T: tong(ctx), ...o });
    const P = { soiDay, nenPhong, tong, PHONG, bongChat, email, lichHop, muiTen, cfg, M, VAI, A, nguoi, ban, laptop, manHinh, cuaSo, thongBao, chatDau, chu2, avatar, choTrong, anhLau, camXuc, so, icon, bong, vong, chu, nen, dat, ket, chamNen, tim, sao, toc, mat };
    return P;
  }
  window.TaoP = TaoP;
})();
