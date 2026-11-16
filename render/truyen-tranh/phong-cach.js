/* Phong cách 3 — Truyện tranh: khung tranh viền đen dày, chấm halftone, bong bóng thoại, đường tốc độ,
 * chữ tượng thanh; khung rung khi "bụp"; camera trượt từ khung này sang khung khác. */
(function () {
  const { lerp, pha, E, clamp } = TC;
  const DEN = '#141414', DO = '#E63946', KEM = '#FFF6E5', VANG = '#FFE08A';
  const P = TaoP({
    che: 'vien', vienW: 13,
    mau: { nen: '#F6E7D0', nen2: '#EBD6B8', chuNen: VANG, chu: DEN, man: '#FFFFFF', chuNenDap: VANG, chuDap: DEN, nhanDap: DO },
    mauBan: '#E4C9A8', mauBan2: '#C9A27E',
  });
  const KHUNG = { x: 40, y: 230, w: 1000, h: 1340 };

  // nền: đường tốc độ cho cảnh hook
  const nenGoc = P.nen;
  P.nen = (kieu, t, ctx) => {
    let s = nenGoc(kieu === 'burst' ? 'trung' : kieu, t, ctx);
    if (kieu === 'burst') {
      s = `<rect width="1080" height="1920" fill="${DO}"/>`;
      for (let k = 0; k < 40; k++) {
        const a = k * Math.PI / 20 + Math.sin(k * 7) * 0.05, r0 = 330 + 60 * Math.sin(t * 9 + k * 3);
        s += `<path d="M${540 + r0 * Math.cos(a)} ${980 + r0 * Math.sin(a)} L${540 + 1500 * Math.cos(a + 0.02)} ${980 + 1500 * Math.sin(a + 0.02)} L${540 + 1500 * Math.cos(a - 0.02)} ${980 + 1500 * Math.sin(a - 0.02)} Z" fill="#FFFFFF" opacity=".55"/>`;
      }
    }
    return s;
  };

  // chữ tượng thanh theo sự kiện SFX
  const TUONG_THANH = { bup: 'BỤP!', thud: 'BỤP!', 'tin-nhan': 'TING!', ding: 'TING!' };
  function tuongThanh(id, t) {
    let s = '';
    for (const e of TC.sfxCanh(id)) {
      const chu = TUONG_THANH[e.ten]; if (!chu) continue;
      const d = t - e.t; if (d < 0 || d > 0.7) continue;
      const sc = E.back(clamp(d / 0.25), 2.5), op = clamp((0.7 - d) / 0.2);
      const x = e.ten === 'tin-nhan' || e.ten === 'ding' ? 820 : 800, y = e.ten === 'tin-nhan' || e.ten === 'ding' ? 1380 : 1180;
      s += `<g transform="translate(${x},${y}) rotate(-12) scale(${sc.toFixed(3)})" opacity="${op.toFixed(3)}"><text text-anchor="middle" font-family="BVP" font-weight="800" font-size="120" fill="${VANG}" stroke="${DEN}" stroke-width="14" paint-order="stroke" letter-spacing="4">${chu}</text></g>`;
    }
    return s;
  }
  function rung(id, t) {
    for (const e of TC.sfxCanh(id)) if (e.ten === 'bup' || e.ten === 'thud') { const d = t - e.t; if (d >= 0 && d < 0.3) return [Math.sin(d * 90) * 12 * (1 - d / 0.3), Math.cos(d * 70) * 8 * (1 - d / 0.3)]; }
    return [0, 0];
  }

  const HALFTONE = `<pattern id="ht" width="18" height="18" patternUnits="userSpaceOnUse" patternTransform="rotate(30)"><circle cx="9" cy="9" r="3.4" fill="${DEN}"/></pattern>
    <linearGradient id="htg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".55" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff" stop-opacity=".9"/></linearGradient>
    <mask id="htm"><rect x="${KHUNG.x}" y="${KHUNG.y}" width="${KHUNG.w}" height="${KHUNG.h}" fill="url(#htg)"/></mask>
    <clipPath id="kc"><rect x="${KHUNG.x}" y="${KHUNG.y}" width="${KHUNG.w}" height="${KHUNG.h}"/></clipPath>`;

  window.PHONG_CACH = {
    ten: 'Truyện tranh', ma: 'truyen-tranh',
    mau: { chuyen: KEM, chuyen2: DEN, chop: '#FFFFFF' },
    chuyen: ['truot', 'lat', 'truot', 'phong'],
    sfxDoi: { thud: 'bup', 'swoosh-nhe': 'lat-giay' },
    veChuyen: (kieu, p, huong) => {
      const q = E.io3(p);
      const trang = `<rect width="1080" height="1920" fill="${KEM}"/>`;
      if (kieu === 'truot') {
        // camera trượt: khung cũ đi sang trái, khung mới vào từ phải, lộ rãnh giấy giữa hai khung
        if (huong === 'ra') return { bien: `translate(${-620 * q},0) rotate(${-2 * q} 540 960)`, phu: `<rect x="${1080 - 620 * q}" y="0" width="${620 * q + 10}" height="1920" fill="${KEM}"/>` };
        return { bien: `translate(${620 * (1 - q)},0) rotate(${2 * (1 - q)} 540 960)`, phu: `<rect x="0" y="0" width="${620 * (1 - q)}" height="1920" fill="${KEM}"/>` };
      }
      if (kieu === 'lat') {
        const x = huong === 'ra' ? lerp(1080, 0, q) : lerp(0, -1180, q);
        return { bien: '', phu: `<rect x="${x - 40}" y="0" width="40" height="1920" fill="#000" opacity=".25"/><rect x="${x}" y="0" width="1200" height="1920" fill="${KEM}"/><rect x="${x}" y="0" width="1200" height="1920" fill="url(#ht)" opacity=".08"/>` };
      }
      return null;
    },
    ve: (c, t, ctx) => {
      const [rx, ry] = rung(c.id, t);
      const vao = E.back(pha(t, 0, 0.35), 1.4), xoay = (1 - clamp(vao)) * -3;
      return `<defs>${HALFTONE}</defs><rect width="1080" height="1920" fill="${KEM}"/><rect width="1080" height="1920" fill="url(#ht)" opacity=".07"/>` +
        `<g transform="translate(${rx},${ry}) rotate(${xoay.toFixed(2)} 540 900)">` +
        `<rect x="${KHUNG.x + 14}" y="${KHUNG.y + 16}" width="${KHUNG.w}" height="${KHUNG.h}" fill="${DEN}"/>` +
        `<g clip-path="url(#kc)">${DUNG.dungCanh(P, c, t, ctx)}<rect x="${KHUNG.x}" y="${KHUNG.y}" width="${KHUNG.w}" height="${KHUNG.h}" fill="url(#ht)" mask="url(#htm)" opacity=".5"/></g>` +
        `<rect x="${KHUNG.x}" y="${KHUNG.y}" width="${KHUNG.w}" height="${KHUNG.h}" fill="none" stroke="${DEN}" stroke-width="12"/>` +
        tuongThanh(c.id, t) + `</g>`;
    },
  };
})();
