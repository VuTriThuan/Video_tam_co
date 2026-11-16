/* Phong cách 2 — Vẽ tay trên bảng trắng: giấy ngà, nét bút đen, người que có biểu cảm, chữ viết tay, 1 màu nhấn đỏ.
 * Nét vẽ hiện dần (stroke-dashoffset theo --p), chuyển cảnh lật giấy / xóa bảng. */
(function () {
  const { lerp, pha, E, clamp, ik, tuThe, nhieu1, thoat, vuaKhung, toTuKhoa } = TC;
  const MUC = '#1A1A1A', DO = '#E63946', GIAY = '#FBF8F1';
  const P = TaoP({
    che: 'net', hoChu: 'PH', hoSo: 'PH', damChu: 400,
    mau: { nen: GIAY, nen2: '#F1ECE2', muc: MUC, giay: GIAY, den: MUC, mieng: MUC, man: GIAY, chu: MUC },
    mauBan: GIAY, mauBan2: GIAY, mauChat: GIAY,
  });
  const nv = (w = 9) => `fill="none" stroke="${MUC}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" pathLength="1" class="v"`;
  const nvDac = (w = 9, f = GIAY) => `fill="${f}" stroke="${MUC}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" pathLength="1" class="v"`;

  // người que có biểu cảm
  P.nguoiQue = o => {
    const th = o.tho || 0, tt = tuThe(o.tuthe || 'xuoi', o.tTheo || 0);
    const vai = [0, -560 + th];
    const tP = ik(vai, [tt.P[0] * 0.8, -590 + tt.P[1]], 150, 140, -1), tT = ik(vai, [tt.T[0] * 0.8, -590 + tt.T[1]], 150, 140, 1);
    const tay = k => `<path d="M${vai[0]} ${vai[1]} L${k.khuyu[0].toFixed(1)} ${k.khuyu[1].toFixed(1)} L${k.tay[0].toFixed(1)} ${k.tay[1].toFixed(1)}" ${nv(10)}/><circle cx="${k.tay[0].toFixed(1)}" cy="${k.tay[1].toFixed(1)}" r="14" ${nvDac(7)}/>`;
    const dau = `translate(0,${(th * 0.6).toFixed(2)}) rotate(${(nhieu1((o.tTheo || 0) * 0.6, 3) * 3 + (o.mieng || 0) * 2).toFixed(2)} 0 -640)`;
    let s = `<path d="M0 -612 L0 -300 M0 -300 L-80 -14 M0 -300 L80 -14" ${nv(10)}/>` + tay(tT) + tay(tP);
    // phụ kiện theo vai
    if (o.vai === 'minh' && !o.quay) s += `<path d="M-30 -560 L0 -520 L30 -560 M0 -520 L0 -440" stroke="${DO}" stroke-width="8" fill="none" stroke-linecap="round" pathLength="1" class="v"/><rect x="-22" y="-450" width="44" height="54" rx="6" fill="${GIAY}" stroke="${DO}" stroke-width="6" pathLength="1" class="v"/>`;
    if (o.vai === 'sep') s += `<path d="M-14 -580 L14 -580 L20 -450 L0 -420 L-20 -450 Z" fill="none" stroke="${MUC}" stroke-width="7" pathLength="1" class="v"/>`;
    s += `<g transform="${dau}"><circle cx="0" cy="-720" r="104" ${nvDac(10)}/>`;
    // tóc theo vai
    const toc = {
      minh: 'M-96 -760 C-80 -830 40 -850 96 -770 M-60 -800 L-40 -760 M-20 -812 L0 -770 M20 -814 L36 -772',
      chi: 'M-100 -740 C-90 -830 90 -830 100 -740 M-100 -740 C-130 -640 -120 -560 -100 -520 M100 -740 C130 -640 120 -560 100 -520 M-30 -846 a30 30 0 1 0 60 0 a30 30 0 1 0 -60 0',
      anh: 'M-90 -780 L-70 -830 L-50 -790 L-30 -846 L-6 -796 L16 -850 L36 -796 L60 -836 L80 -780',
      em: 'M-104 -720 C-104 -840 104 -840 104 -720 L104 -640 M-104 -720 L-104 -640 M-70 -790 L-70 -760 M-30 -800 L-30 -764 M10 -800 L10 -764 M50 -796 L50 -762',
      sep: 'M-100 -720 C-108 -760 -96 -780 -80 -786 M100 -720 C108 -760 96 -780 80 -786',
    }[o.vai] || '';
    const TOC2 = {
      ngan: 'M-96 -760 C-80 -830 40 -850 96 -770 M-60 -800 L-40 -760 M-20 -812 L0 -770 M20 -814 L36 -772',
      dung: 'M-90 -780 L-70 -830 L-50 -790 L-30 -846 L-6 -796 L16 -850 L36 -796 L60 -836 L80 -780',
      'xoan-nam': 'M-90 -770 a22 22 0 0 1 40 -20 a22 22 0 0 1 40 -10 a22 22 0 0 1 40 0 a22 22 0 0 1 40 10 a22 22 0 0 1 30 30',
      'vuot-nguoc': 'M-100 -730 C-90 -840 90 -840 100 -730 M-60 -820 C-20 -790 20 -790 60 -820',
      'dai-bui': 'M-100 -740 C-90 -830 90 -830 100 -740 M-100 -740 C-130 -640 -120 -560 -100 -520 M100 -740 C130 -640 120 -560 100 -520 M-30 -846 a30 30 0 1 0 60 0 a30 30 0 1 0 -60 0',
      'dai-xoa': 'M-100 -740 C-90 -830 90 -830 100 -740 M-100 -740 C-130 -640 -124 -560 -96 -500 M100 -740 C130 -640 124 -560 96 -500 M-40 -820 C-60 -780 -80 -760 -100 -740',
      'xoan-nu': 'M-100 -740 a24 24 0 0 1 40 -50 a24 24 0 0 1 60 -20 a24 24 0 0 1 60 20 a24 24 0 0 1 40 50 M-110 -700 q-20 40 0 80 q-20 40 0 80 M110 -700 q20 40 0 80 q20 40 0 80',
      bob: 'M-104 -720 C-104 -840 104 -840 104 -720 L104 -640 M-104 -720 L-104 -640 M-70 -790 L-70 -760 M-30 -800 L-30 -764 M10 -800 L10 -764 M50 -796 L50 -762',
      'duoi-ngua': 'M-100 -740 C-90 -830 90 -830 100 -740 M90 -790 C160 -760 160 -640 120 -580',
      hoi: 'M-100 -720 C-108 -760 -96 -780 -80 -786 M100 -720 C108 -760 96 -780 80 -786',
    };
    const ng = o.ngoai || {};
    s += `<path d="${ng.toc && TOC2[ng.toc] ? TOC2[ng.toc] : toc}" ${nv(8)}/>`;
    if (o.quay) s += `<path d="M-80 -780 C-40 -700 40 -700 80 -780 M-90 -700 C-40 -640 40 -640 90 -700" ${nv(7)}/>`;
    else s += P.mat(o) + ((o.ngoai ? o.ngoai.kinh : (o.vai === 'anh' || o.vai === 'sep')) ? `<rect x="-62" y="-736" width="50" height="40" rx="12" ${nv(5)}/><rect x="12" y="-736" width="50" height="40" rx="12" ${nv(5)}/><path d="M-12 -720 L12 -720" ${nv(5)}/>` : '');
    s += '</g>';
    const dang = { gay: 0.88, vua: 1, dam: 1.16 }[ng.dang] || 1;
    return `<g transform="rotate(${(o.nghieng || 0) * (o.lat ? -1 : 1)}) scale(${(o.lat ? -o.s : o.s) * dang},${o.s})"${o.mo ? ' opacity=".5"' : ''}>${s}</g>`;
  };

  // đặt + vẽ hiện dần: --p chạy 0→1 chậm hơn độ nảy
  P.dat = (svg, o) => {
    const h = o.hien;
    if (h === undefined || h <= 0.001 || o.an) return '';
    let x = o.x, y = o.y;
    const p = clamp(Math.pow(clamp(h), 0.6));
    if (o.tu === 'trai') x -= (1 - Math.min(h, 1)) * 300;
    return `<g transform="translate(${x.toFixed(1)},${y.toFixed(1)})" style="--p:${p.toFixed(3)}">${svg}</g>`;
  };

  // chữ viết tay hiện dần từ trái sang phải + gạch chân đỏ
  let _id = 0;
  P.chu = (canh, t, ctx, o = {}) => {
    if (!canh.chu) return '';
    const x0 = o.x0 ?? 80, maxW = o.maxW ?? 820;
    const fit = vuaKhung(canh.chu, { ho: 'PH', dam: 400, maxW: maxW - 20, maxDong: 3, co: (o.co || [140, 128, 116, 104, 96, 88, 80]).map(c => Math.round(c * 1.12)) });
    const lh = fit.co * 1.1, cx = x0 + maxW / 2;
    const t0 = o.t0 || 0, tocDo = 0.42; // giây mỗi dòng
    let s = '';
    fit.lines.forEach((ln, k) => {
      const p = pha(t, t0 + k * tocDo, tocDo);
      if (p <= 0) return;
      const wl = TC.doRong(ln, fit.font), y = (o.y ?? 300) + lh * (k + 0.8);
      const id = 'ct' + (_id++);
      s += `<defs><clipPath id="${id}"><rect x="${cx - wl / 2 - 10}" y="${y - fit.co}" width="${(wl + 20) * E.out3(p)}" height="${fit.co * 1.4}"/></clipPath></defs>`;
      s += `<text x="${cx}" y="${y}" text-anchor="middle" font-family="PH" font-size="${fit.co}" clip-path="url(#${id})">${toTuKhoa(ln, canh.tu_khoa, MUC, DO)}</text>`;
    });
    const pg = pha(t, t0 + fit.lines.length * tocDo, 0.35);
    if (pg > 0) {
      const yl = (o.y ?? 300) + lh * (fit.lines.length - 1 + 0.8) + 24, wl = TC.doRong(fit.lines.at(-1), fit.font);
      s += `<path d="M${cx - wl / 2} ${yl} q${wl / 2} 14 ${wl} -4" stroke="${DO}" stroke-width="9" fill="none" stroke-linecap="round" pathLength="1" stroke-dasharray="1" stroke-dashoffset="${(1 - E.out3(pg)).toFixed(3)}"/>`;
    }
    return s;
  };
  P.so = (n, o) => {
    const s = o.s || 1, p = clamp(((o.t || 0) * 3));
    return `<g transform="scale(${s})"><circle r="140" fill="${GIAY}" stroke="${DO}" stroke-width="12" pathLength="1" class="v" transform="rotate(-80)"/><text y="78" text-anchor="middle" font-family="PH" font-size="250" fill="${DO}" class="vt">${n}</text></g>`;
  };

  // nền giấy + vài nét phác
  P.nen = (kieu, t, ctx) => {
    const T = P.tong(ctx), giay = T ? T.giay : GIAY;
    let s = `<rect width="1080" height="1920" fill="${giay}"/>`;
    for (let k = 0; k < 14; k++) { const y = (k * 151 + t * 6) % 1920; s += `<path d="M0 ${y} L1080 ${y + 30}" stroke="#E9E2D3" stroke-width="2"/>`; }
    if (kieu === 'burst') for (let k = 0; k < 16; k++) { const a = k * Math.PI / 8 + t * 0.1; s += `<path d="M${540 + 260 * Math.cos(a)} ${980 + 260 * Math.sin(a)} L${540 + 520 * Math.cos(a)} ${980 + 520 * Math.sin(a)}" stroke="${DO}" stroke-width="7" stroke-linecap="round" opacity=".35"/>`; }
    if (P.PHONG.includes(kieu)) s += `<g opacity=".5">${P.nenPhong(kieu, t, T).svg}</g>`;
    if (kieu === 'toi' || kieu === 'o-nha-toi') s += `<rect width="1080" height="1920" fill="#6B7280" opacity=".12"/>`;
    if (kieu === 'chia-doi') s += `<path d="M540 560 L540 1500" stroke="${DO}" stroke-width="8" stroke-dasharray="30 20"/>`;
    return s;
  };
  // cảnh kết: logo đỏ trên giấy
  P.ket = (c, t, ctx, nvSvg) => {
    const L = ctx.L, hl = E.back(pha(t, L.logo, 0.5)), nut = pha(t, L.chu, 0.5);
    return P.nen('ket', t, ctx) +
      (hl > 0 ? `<g transform="translate(540,760) scale(${(hl * 2.4).toFixed(3)})">${TC.QUAN_MA(DO, GIAY)}</g>` : '') +
      `<text x="540" y="1110" text-anchor="middle" font-family="PH" font-size="140" fill="${MUC}" opacity="${clamp(pha(t, L.logo + 0.15, 0.3))}">Tâm Cơ</text>` +
      `<text x="540" y="1190" text-anchor="middle" font-family="PH" font-size="56" fill="${MUC}" opacity="${clamp(pha(t, L.logo + 0.3, 0.3))}">Hiểu chiêu để không trúng chiêu.</text>` +
      (nut > 0 ? `<g transform="translate(560,1300)" style="--p:${nut.toFixed(3)}"><rect x="-290" y="-62" width="580" height="124" rx="62" fill="${GIAY}" stroke="${DO}" stroke-width="9" pathLength="1" class="v"/><text y="24" text-anchor="middle" font-family="PH" font-size="72" fill="${DO}" class="vt">+ Theo dõi Tâm Cơ</text></g>` : '') +
      P.dat(nvSvg, { x: 170, y: 1770, hien: TC.bat(t, 0.2) });
  };

  window.PHONG_CACH = {
    ten: 'Bảng trắng', ma: 'bang-trang',
    mau: { chuyen: GIAY, chuyen2: MUC, chop: GIAY },
    chuyen: ['lat', 'xoa', 'lat', 'xoa'],
    sfxDoi: { whoosh: 'lat-giay', 'swoosh-nhe': 'lat-giay', pop: 'but-sot-soat', tick: 'but-sot-soat' },
    // lật giấy: tờ mới trượt từ phải vào có mép cong + bóng; xóa: dải tẩy quét ngang
    veChuyen: (kieu, p, huong) => {
      const q = E.io3(p);
      if (kieu === 'lat') {
        const x = huong === 'ra' ? lerp(1080, 0, q) : lerp(0, -1180, q);
        return { bien: '', phu: `<rect x="${x - 30}" y="0" width="30" height="1920" fill="#000" opacity=".12"/><rect x="${x}" y="0" width="1200" height="1920" fill="${GIAY}"/><path d="M${x} 0 L${x} 1920" stroke="#D8CFBE" stroke-width="6"/>` };
      }
      const y = huong === 'ra' ? lerp(-200, 1920, q) : 1920;
      if (huong === 'ra') return { bien: '', phu: `<rect x="0" y="0" width="1080" height="${y}" fill="${GIAY}"/><rect x="380" y="${y - 120}" width="320" height="140" rx="20" fill="#5C677D"/><rect x="380" y="${y - 30}" width="320" height="50" rx="10" fill="#C9ADA7"/>` };
      return { bien: '', phu: `<rect x="0" y="0" width="1080" height="1920" fill="${GIAY}" opacity="${(1 - q).toFixed(3)}"/>` };
    },
    ve: (c, t, ctx) => DUNG.dungCanh(P, c, t, ctx),
  };
})();
