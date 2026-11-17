/* Phong cách 5 — Tranh minh họa điện ảnh: bóng đổ (silhouette) tông chiều tà, ánh cửa sổ, vignette, hạt bụi bay.
 * Parallax nhiều lớp (hậu cảnh / nhân vật / tiền cảnh trượt lệch tốc độ), zoom chậm, chữ nhấn kiểu phụ đề phim. */
(function () {
  const { lerp, pha, E, clamp, hash, vuaKhung, toTuKhoa, doRong } = TC;
  const DO = '#E63946', BONG = '#120E14', VANG = '#F4A261';
  const P = TaoP({ che: 'bong', vienBong: VANG, mau: { bong: BONG, nen: '#2B1B2E', nen2: '#1A121C' } });
  const P2 = TaoP({ che: 'phang' }); // màn hình / biểu tượng phát sáng giữ màu thật
  for (const k of ['cuaSo', 'thongBao', 'chatDau', 'avatar', 'choTrong', 'anhLau', 'camXuc', 'icon', 'so', 'bong', 'chu2', 'laptop', 'email', 'lichHop', 'bongChat', 'muiTen']) P[k] = P2[k];
  P.manHinh = (o, nd) => `<ellipse cx="0" cy="0" rx="${o.w * 0.75}" ry="${o.h * 0.8}" fill="url(#sangMH)"/>` + P2.manHinh(o, nd);

  // trời chiều + cửa sổ + tia nắng + bụi
  function troi(t, kieu) {
    const dem = kieu === 'toi' || kieu === 'man-hinh' || kieu === 'burst';
    let s = `<rect width="1080" height="1920" fill="url(#${dem ? 'troiDem' : 'troi'})"/>`;
    s += `<circle cx="${700 - t * 4}" cy="${980}" r="${dem ? 0 : 260}" fill="url(#mat)"/>`;
    // khung cửa sổ lớn (lớp hậu cảnh)
    s += `<g fill="${BONG}" opacity=".92"><rect x="0" y="0" width="1080" height="420"/><rect x="0" y="1300" width="1080" height="620"/>` +
      [-20, 340, 700, 1060].map(x => `<rect x="${x}" y="400" width="44" height="920"/>`).join('') + `<rect x="0" y="830" width="1080" height="26"/></g>`;
    // thành phố xa
    s += `<path d="M0 1300 L0 1170 L80 1170 L80 1120 L150 1120 L150 1200 L230 1200 L230 1060 L300 1060 L300 1180 L420 1180 L420 1100 L470 1100 L470 1210 L600 1210 L600 1130 L690 1130 L690 1190 L800 1190 L800 1080 L860 1080 L860 1200 L1080 1200 L1080 1300 Z" fill="#3A1F2B" opacity=".85"/>`;
    // tia nắng
    if (!dem) for (let k = 0; k < 4; k++) { const x = 200 + k * 230 + Math.sin(t * 0.3 + k) * 30; s += `<path d="M${x} 400 L${x + 120} 400 L${x + 520} 1920 L${x + 220} 1920 Z" fill="#FFD9A0" opacity="${0.06 + 0.03 * Math.sin(t * 0.8 + k)}"/>`; }
    return s;
  }
  function bui(t) {
    let s = '';
    for (let k = 0; k < 36; k++) {
      const x = (hash(k) * 1080 + t * (8 + hash(k + 9) * 18)) % 1080, y = (hash(k + 3) * 1700 + 200 - t * (6 + hash(k + 5) * 10) + 1920) % 1920;
      s += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(1.5 + hash(k + 7) * 3).toFixed(1)}" fill="#FFE8C2" opacity="${(0.25 + 0.35 * Math.abs(Math.sin(t * 1.3 + k))).toFixed(2)}"/>`;
    }
    return s;
  }
  const PHONG_RIENG = ['phong-hop', 'pantry', 'thang-may', 'phong-sep', 'quan-ca-phe', 'o-nha-toi'];
  P.nen = (kieu, t, ctx) => {
    if (kieu === 'ket') return `<rect width="1080" height="1920" fill="#0B0A0D"/>`;
    if (kieu === 'soi-day') return P.soiDay(t, ctx) + bui(t);
    if (PHONG_RIENG.includes(kieu)) {
      // trời theo tông, tường tối khoét ô cửa, đồ đạc thành bóng có viền sáng
      const T = P.tong(ctx), ph = P.nenPhong(kieu, t, T);
      const lo = ph.cua.map(([x, y, w, h]) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#000"/>`).join('');
      return `<g transform="translate(${(-6 * t).toFixed(1)},0) scale(1.03)"><rect width="1080" height="1920" fill="url(#troi)"/><circle cx="${760 - t * 4}" cy="900" r="220" fill="url(#mat)"/></g>` +
        `<defs><mask id="tuong"><rect width="1080" height="1920" fill="#fff"/>${lo}</mask></defs><rect width="1080" height="1920" fill="#1A121C" mask="url(#tuong)"/>` +
        `<rect width="1080" height="1920" fill="url(#troi)" opacity=".18" mask="url(#tuong)"/>` + ph.svg;
    }
    let s = `<g transform="translate(${(-6 * t).toFixed(1)},0) scale(1.03)">${troi(t, kieu)}</g>`;
    if (kieu === 'burst') s += `<rect width="1080" height="1920" fill="${DO}" opacity="${(0.25 + 0.12 * Math.sin(t * 9)).toFixed(3)}"/>`;
    if (kieu === 'chia-doi') s += `<rect width="540" height="1920" fill="#0E1630" opacity=".75"/><rect x="536" y="0" width="8" height="1920" fill="${DO}" opacity=".8"/>`;
    if (kieu === 'man-hinh' || kieu === 'toi') s += `<rect width="1080" height="1920" fill="#06070C" opacity=".25"/>`;
    return s;
  };
  // parallax: lớp càng gần trôi càng nhanh
  const datGoc = P.dat;
  P.dat = (svg, o) => datGoc(svg, { ...o, x: o.x - (o.lop || 0) * 9 * (P._t || 0) + 20 * (o.lop || 0) });

  // chữ nhấn kiểu phụ đề phim (dưới, trong vùng an toàn)
  P.chu = (canh, t, ctx, o = {}) => { P._chu = veChu(canh, t, ctx, o); return ''; };
  function veChu(canh, t, ctx, o = {}) {
    if (!canh.chu) return '';
    const dap = o.kieu === 'dap';
    const fit = vuaKhung(canh.chu, { dam: dap ? 800 : 700, maxW: 860, maxDong: dap ? 3 : 2, co: dap ? [128, 116, 104] : [72, 66, 60, 54] });
    const t0 = o.t0 || 0, p = E.out3(pha(t, t0, dap ? 0.6 : 0.5));
    if (p <= 0) return '';
    const lh = fit.co * 1.25, y0 = dap ? 330 : 1460 - lh * fit.lines.length;
    const gian = dap ? lerp(30, 4, p) : lerp(14, 3, p);
    let s = `<g opacity="${p.toFixed(3)}" transform="translate(0,${((1 - p) * 20).toFixed(1)})">`;
    if (!dap) s += `<rect x="${540 - 60}" y="${y0 - 40}" width="120" height="6" fill="${DO}"/>`;
    fit.lines.forEach((l, k) => {
      const yb = y0 + lh * (k + 0.8);
      const g = o.lop && { k, dong: fit.lines, line: l, font: fit.font, co: fit.co, cx: 540, yb, w: doRong(l, fit.font) + gian * [...l].length, gian, ox: 0, oy: (1 - p) * 20, dem: 10 };
      if (g) s += o.lop(g, 'duoi');
      s += `<text x="540" y="${yb}" text-anchor="middle" font-family="BVP" font-weight="${dap ? 800 : 700}" font-size="${fit.co}" letter-spacing="${gian.toFixed(1)}" style="paint-order:stroke" stroke="#000" stroke-opacity=".55" stroke-width="10">${toTuKhoa(l, canh.tu_khoa, '#FFFFFF', '#FF6B6B')}</text>`;
      if (g) s += o.lop(g, 'tren');
    });
    return s + '</g>';
  }
  P.ket = (c, t, ctx, nvSvg) => {
    const L = ctx.L, hl = E.out3(pha(t, L.logo, 0.7)), nut = E.out3(pha(t, L.chu, 0.5));
    return P.nen('ket', t, ctx) + `<circle cx="540" cy="900" r="${500 + 30 * Math.sin(t)}" fill="url(#mat)" opacity=".35"/>` + bui(t) +
      `<g transform="translate(540,760) scale(${(2.2 + 0.2 * hl).toFixed(3)})" opacity="${hl.toFixed(3)}">${TC.QUAN_MA(DO, '#0B0A0D')}</g>` +
      `<text x="540" y="1110" text-anchor="middle" font-family="BVP" font-weight="800" font-size="120" letter-spacing="${lerp(30, 6, hl).toFixed(1)}" fill="#FFFFFF" opacity="${clamp(pha(t, L.logo + 0.2, 0.4))}">Tâm Cơ</text>` +
      `<text x="540" y="1190" text-anchor="middle" font-family="BVP" font-weight="500" font-size="44" fill="#F3EFEF" opacity="${clamp(pha(t, L.logo + 0.4, 0.4))}">Hiểu chiêu để không trúng chiêu.</text>` +
      (nut > 0 ? `<g opacity="${nut}"><rect x="260" y="1238" width="600" height="110" rx="55" fill="none" stroke="${DO}" stroke-width="5"/><text x="560" y="1310" text-anchor="middle" font-family="BVP" font-weight="700" font-size="52" fill="#FFFFFF">+ Theo dõi Tâm Cơ</text></g>` : '');
  };

  const DEFS0 = `<defs>
    <linearGradient id="troi" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="@0"/><stop offset=".45" stop-color="@1"/><stop offset=".62" stop-color="@2"/><stop offset=".72" stop-color="@3"/><stop offset="1" stop-color="@0"/></linearGradient>
    <linearGradient id="troiDem" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0B0E1E"/><stop offset=".6" stop-color="#1D2346"/><stop offset="1" stop-color="#0B0E1E"/></linearGradient>
    <radialGradient id="mat"><stop offset="0" stop-color="#FFE3B0" stop-opacity=".95"/><stop offset=".35" stop-color="#F4A261" stop-opacity=".6"/><stop offset="1" stop-color="#E76F51" stop-opacity="0"/></radialGradient>
    <radialGradient id="sangMH"><stop offset="0" stop-color="#BFD7FF" stop-opacity=".45"/><stop offset="1" stop-color="#BFD7FF" stop-opacity="0"/></radialGradient>
    <radialGradient id="vig" cx=".5" cy=".48" r=".75"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".8"/></radialGradient></defs>`;

  window.PHONG_CACH = {
    ten: 'Tranh điện ảnh', ma: 'tranh-tinh-zoom',
    mau: { chuyen: '#3A1A22', chuyen2: '#E63946', chop: '#FFE3B0' },
    chuyen: ['den', 'phong', 'den', 'truot'],
    sfxDoi: { whoosh: 'whoosh-tram', 'swoosh-nhe': 'whoosh-tram', pop: 'swoosh-nhe', tick: 'tick' },
    veChuyen: (kieu, p, huong) => {
      if (kieu !== 'den') return null;
      const q = E.io3(p), op = huong === 'ra' ? q : 1 - q;
      return { bien: `translate(540,960) scale(${huong === 'ra' ? 1 + 0.06 * q : 1.06 - 0.06 * q}) translate(-540,-960)`, phu: `<rect width="1080" height="1920" fill="#3A1A22" opacity="${(0.78 * op).toFixed(3)}"/>` };
    },
    ve: (c, t, ctx) => {
      P._t = t; P._chu = '';
      // zoom chậm thêm (ngoài đẩy camera chung)
      const z = 1 + 0.05 * E.io3(pha(t, 0, ctx.D));
      const T = P.tong(ctx), tr = T ? T.troi : ['#2A1636', '#8E2C3E', '#E76F51', '#F4A261'];
      const DEFS = DEFS0.replace(/@(\d)/g, (_, k) => tr[+k]);
      return DEFS + `<g transform="translate(540,900) scale(${z.toFixed(4)}) translate(-540,-900)">${DUNG.dungCanh(P, c, t, ctx)}</g>` + bui(t) + P._chu;
    },
    lopTren: () => `<rect width="1080" height="1920" fill="url(#vig)"/>`,
  };
})();
