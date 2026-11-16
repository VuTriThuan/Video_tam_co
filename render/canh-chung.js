/* Bộ ráp cảnh THUẦN DỮ LIỆU: đọc các trường của canh.json (bo_cuc, nhan_vat, xep, dao_cu, man_hinh, hieu_ung, so, nen)
 * rồi ghép khối từ thư viện (render/thu-vien/khoi.js) bằng bộ nét P của phong cách. Không có mã riêng cho từng cảnh.
 * Thời gian trong dữ liệu (t, het, t_den, t_thieu) là tỷ lệ của câu đọc (0..1).
 */
(function () {
  const { lerp, pha, E, bat, mo, chop, tho } = TC;
  const TV = window.TV;
  const MH = { x: 540, y: 930, w: 900, h: 660 }, IW = 860, IH = 620;
  const BASE_Y = { 'hook-chu-to': 1500, 'nhan-vat-ke': 1440, 'nhan-vat-va-dong-nghiep': 1440, 'dau-hieu-so': 1480, 'loi-khuyen': 1490, 'so-sanh': 1380, 'dien-thoai': 1720 };
  const AUTO_X = { 1: [540], 2: [300, 780], 3: [220, 540, 860], 4: [180, 400, 680, 900] };
  const AUTO_S = { 1: 0.84, 2: 0.74, 3: 0.64, 4: 0.52 };
  const NEN_MD = { 'hook-chu-to': 'burst', 'dien-thoai': 'man-hinh', 'dau-hieu-so': 'dau-hieu', 'so-sanh': 'chia-doi', 'loi-khuyen': 'loi-khuyen' };
  const SLOT_DC = ['tren-phai', 'tren-trai', 'tren-giua', 'giua-phai', 'giua-trai'];

  const giay = (ctx, f, md) => (f === undefined || f === null ? md : f * ctx.giong);
  const laSo = s => /^so-\d$/.test(s);
  const dsNV = c => (c.nhan_vat || []).map(n => (typeof n === 'string' ? { vai: n } : { ...n }));
  const dsDC = c => (c.dao_cu || []).map(d => (typeof d === 'string' ? { ten: d } : { ...d })).filter(d => !laSo(d.ten));
  const dsHU = c => (c.hieu_ung || []).map(h => (typeof h === 'string' ? { ten: h } : { ...h }));
  function soCua(c) {
    if (c.so) return c.so;
    const d = (c.dao_cu || []).map(x => (typeof x === 'string' ? x : x.ten)).find(laSo);
    return d ? +d.slice(3) : 0;
  }

  // ---------- xếp nhân vật ----------
  function xepNV(c) {
    const bo = c.bo_cuc, base = BASE_Y[bo] || 1440, ds = dsNV(c), xep = c.xep || 'hang-ngang';
    const ra = ds.map((n, k) => ({ n, k }));
    const iMinh = ds.findIndex(n => n.vai === 'minh');
    const khac = ra.filter(r => r.k !== iMinh);
    const dat = (r, x, y, s, them = {}) => Object.assign(r, { x, y, s, ...them });

    if (bo === 'dien-thoai') { ra.forEach((r, j) => dat(r, j === 0 ? 190 : 890, 1720, 0.53)); return ra; }
    if (xep === 'nhom-quay-lung') {
      if (iMinh >= 0) dat(ra[iMinh], 540, 1500, 0.86);
      khac.forEach((r, j) => dat(r, AUTO_X[4][j % 4], 1180, 0.5, { quayTu: 0.22 + j * 0.11, sau: true }));
      return ra;
    }
    if (xep === 'tach-nhom') {
      if (iMinh >= 0) dat(ra[iMinh], 170, 1480, 0.62, { vaoMd: 'tu-trai' });
      khac.forEach((r, j) => dat(r, 520 + j * 140, 1330, 0.52, { sau: true }));
      return ra;
    }
    if (xep === 'mot-minh-giua-dam-dong') {
      if (iMinh >= 0) dat(ra[iMinh], 540, 1480, 0.8);
      const vt = [[170, 1250], [380, 1180], [700, 1180], [910, 1250]];
      khac.forEach((r, j) => dat(r, vt[j % 4][0], vt[j % 4][1], 0.5, { quayTu: 0, sau: true }));
      return ra;
    }
    if (bo === 'so-sanh') {
      for (const ben of ['trai', 'phai']) {
        const nhom = ra.filter(r => (r.n.ben || (r.k % 2 ? 'phai' : 'trai')) === ben);
        const xs = nhom.length === 1 ? [ben === 'trai' ? 270 : 810] : (ben === 'trai' ? [160, 380] : [720, 940]);
        nhom.forEach((r, j) => dat(r, typeof r.n.vi_tri === 'number' ? r.n.vi_tri : (TV.VI_TRI[r.n.vi_tri] ?? xs[j % xs.length]), base, 0.55));
      }
      return ra;
    }
    const truoc = ra.filter(r => r.n.hang !== 'sau'), sau = ra.filter(r => r.n.hang === 'sau');
    const n = Math.min(4, Math.max(1, truoc.length));
    let xs = AUTO_X[n];
    if (bo === 'loi-khuyen' && n === 1) xs = [380];
    if (bo === 'loi-khuyen' && n === 2) xs = [380, 820];
    if (bo === 'dau-hieu-so' && n === 2) xs = [270, 800];
    truoc.forEach((r, j) => {
      const x = typeof r.n.vi_tri === 'number' ? r.n.vi_tri : (TV.VI_TRI[r.n.vi_tri] ?? xs[j % xs.length]);
      let s = AUTO_S[n];
      if (bo === 'hook-chu-to') s = r.n.vai === 'minh' ? 0.78 : 0.62;
      dat(r, x, base, s);
    });
    sau.forEach((r, j) => dat(r, typeof r.n.vi_tri === 'number' ? r.n.vi_tri : (TV.VI_TRI[r.n.vi_tri] ?? AUTO_X[Math.min(4, sau.length)][j % 4]), base - 260, 0.5, { sau: true }));
    if (xep === 'doi-dien' && truoc.length >= 2) truoc[truoc.length - 1].latMd = true;
    return ra;
  }
  function coNV(r) {
    const co = r.n.co;
    if (typeof co === 'number') return co;
    if (co === 'lon') return r.s + 0.1;
    if (co === 'nho') return r.s - 0.15;
    return r.s;
  }

  // ---------- nhân vật ----------
  function trangThai(n, ctx, t) {
    const tt0 = TV.TU_THE[n.tu_the || 'dung'] || TV.TU_THE.dung;
    let bieu = n.bieu_cam || 'binh-thuong', quay = !!(n.quay || tt0.quay), noiGia = !!n.noi_gia, mo_ = !!n.mo, co = { ...tt0 };
    const chuoi = [{ t: 0, p: tt0.tay }];
    for (const d of (n.doi || [])) {
      const td = giay(ctx, d.t, 0);
      if (d.tu_the) {
        const x = TV.TU_THE[d.tu_the] || TV.TU_THE.dung;
        chuoi.push({ t: td, p: x.tay });
        if (t >= td) { co = { ...x }; if (x.quay) quay = true; }
      }
      if (t >= td) {
        if (d.bieu_cam) bieu = d.bieu_cam;
        if (d.quay !== undefined) quay = d.quay;
        if (d.noi_gia !== undefined) noiGia = d.noi_gia;
        if (d.mo !== undefined) mo_ = d.mo;
      }
    }
    if (n.bien_the === 2) chuoi.forEach(x => { if (TC.TU_THE[x.p + '#2']) x.p = x.p + '#2'; });
    return { bieu, quay, noiGia, mo: mo_, tuthe: chuoi.length > 1 ? chuoi : chuoi[0].p, co, nghieng: n.bien_the === 2 ? 4 : 0 };
  }
  function veMot(P, t, ctx, vai, s, st, lat, noi, lech, ngoai) {
    const seed = { minh: 1, chi: 2, anh: 3, em: 4, sep: 5 }[vai] || 6;
    return P.nguoi({
      vai, s, bieu: st.bieu, tuthe: st.tuthe, quay: st.quay, mo: st.mo, lat, ngoai, nghieng: st.nghieng,
      chop: chop(t + (lech || 0), seed), tho: tho(t, seed),
      mieng: noi ? ctx.mieng(t) : (st.noiGia ? 0.25 + 0.25 * Math.sin(t * 17 + seed) * (Math.sin(t * 3 + seed) > 0 ? 1 : 0) : 0),
      tTheo: t,
    });
  }
  function veNV(P, c, t, ctx, r) {
    const n = r.n, vaiVe = (TV.VAI[n.vai] || TV.VAI['dong-nghiep-nu']).ve;
    const st = trangThai(n, ctx, t);
    if (r.quayTu !== undefined && !(n.doi || []).some(d => d.quay !== undefined)) st.quay = st.quay || t >= giay(ctx, r.quayTu, 0);
    const s = coNV(r), lat = n.lat ?? r.latMd ?? false;
    const noi = n.vai === 'minh' && n.noi !== false;
    let svg;
    if (vaiVe === 'nhom') {
      svg = [['chi', -140, true], ['anh', 0, false], ['em', 140, true]].map(([v, dx, l], j) => `<g transform="translate(${dx},0)">${veMot(P, t, ctx, v, 0.8, st, l, false, j, TV.ngoaiHinh(ctx.seed, ['dong-nghiep-nu', 'dong-nghiep-nam', 'dong-nghiep-nu-2'][j], 7))}</g>`).join('');
      svg = `<g transform="scale(${s})">${svg}</g>`;
    } else svg = veMot(P, t, ctx, vaiVe, s, st, lat, noi, r.k * 0.6, n.ngoai || TV.ngoaiHinh(ctx.seed, n.vai, 0));
    if (st.co.dienThoai && !st.quay) svg += `<g transform="translate(${(lat ? -1 : 1) * 10 * s},${-470 * s}) scale(${s * 0.75})">${P.icon('dien-thoai', { t })}</g>`;
    return svg;
  }
  function veDanhSachNV(P, c, t, ctx, ra, chiSau) {
    let s = '';
    for (const r of ra) {
      if (!!r.sau !== chiSau) continue;
      const n = r.n;
      const t0 = giay(ctx, n.t, c.bo_cuc === 'hook-chu-to' ? 1.15 + r.k * 0.18 : 0.06 + r.k * 0.12);
      const vao = n.vao || r.vaoMd || (c.bo_cuc === 'hook-chu-to' && n.vai === 'minh' ? 'tu-duoi' : 'nhay');
      let x = r.x;
      if (n.di) { const td = giay(ctx, n.di.t, 0.5 * ctx.giong); x = lerp(r.x, TV.VI_TRI[n.di.den] ?? n.di.den, E.io3(pha(t, td, 0.7))); }
      let hien = vao === 'co-san' ? 1 : bat(t, t0, c.bo_cuc === 'hook-chu-to' ? 0.5 : 0.45), tu;
      if (vao === 'tu-duoi') tu = 'duoi';
      else if (vao === 'tu-trai') tu = 'trai';
      else if (vao === 'tu-phai' || vao === 'di-vao') {
        const ben = vao === 'tu-phai' || x > 540 ? 1 : -1;
        x = lerp(x + ben * 620, x, E.out3(pha(t, t0, 0.9))); hien = t >= t0 ? 1 : 0;
      }
      r.xNow = x;
      s += P.dat(veNV(P, c, t, ctx, r), { x, y: r.y, hien, tu, lop: r.sau ? 0 : 1 });
      if ((TV.TU_THE[n.tu_the] || {}).ban) s += P.dat(P.ban({ w: 360 }), { x, y: r.y - 150, hien: 1, lop: 2 });
    }
    return s;
  }

  // ---------- đạo cụ ----------
  function viTri(v, ra, md) {
    if (Array.isArray(v)) return v;
    if (TV.VI_TRI_DAO_CU[v]) return TV.VI_TRI_DAO_CU[v];
    let m;
    if (v && (m = /^dau-(\d)$/.exec(v)) && ra[+m[1]]) { const r = ra[+m[1]]; return [r.xNow ?? r.x, r.y - 850 * coNV(r) - 70]; }
    if (v && (m = /^tay-(\d)$/.exec(v)) && ra[+m[1]]) { const r = ra[+m[1]]; return [(r.xNow ?? r.x) + (r.n.lat ? -1 : 1) * 160 * coNV(r), r.y - 470 * coNV(r)]; }
    if (v === 'ban') return [540, 1240];
    return md;
  }
  function veDaoCu(P, c, t, ctx, ra, lop) {
    let s = '', i = 0;
    const ds = dsDC(c);
    if (lop === 'noi-that') {
      for (const d of ds) if (d.ten === 'ban-lam-viec') { const [x, y] = viTri(d.vi_tri, ra, [540, 1300]); s += P.dat(P.ban({ w: d.w || 1000, mat: d.mat }), { x, y, hien: 1, lop: 3 }); }
      return s;
    }
    for (const d of ds) {
      if (d.ten === 'ban-lam-viec') continue;
      const ve = TV.DAO_CU[d.ten]; if (!ve) { i++; continue; }
      const md = d.ten === 'laptop' ? [540, 1240] : TV.VI_TRI_DAO_CU[SLOT_DC[i % SLOT_DC.length]];
      let [x, y] = viTri(d.vi_tri, ra, md);
      if (d.den !== undefined) {
        const [x2, y2] = viTri(d.den, ra, [x, y]), p = E.io3(pha(t, giay(ctx, d.t_den, 0.55 * ctx.giong), 0.6));
        x = lerp(x, x2, p); y = lerp(y, y2, p) - (d.cung ? 120 * Math.sin(Math.PI * p) : 0);
      }
      const t0 = giay(ctx, d.t, 0.38 + i * 0.17);
      const an = d.het !== undefined && t >= giay(ctx, d.het, 99);
      s += P.dat(ve(P, { ...d, t }), { x, y, hien: d.t === undefined && d.ten === 'laptop' ? 1 : bat(t, t0), an, lop: 3 });
      i++;
    }
    return s;
  }

  // ---------- màn hình ----------
  function tinNhom(P, m, t, ctx) {
    let s = '', y = 140;
    const ds = m.tin || [];
    ds.forEach((x, k) => {
      const t0 = giay(ctx, x.t, ctx.giong * (0.12 + k * 0.7 / Math.max(1, ds.length)));
      const h0 = bat(t, t0, 0.4); if (h0 <= 0) return;
      const toi = x.ai === 'minh';
      if (x.cam_xuc) { s += P.dat(P.camXuc({ t }), { x: 500, y: y + 10, hien: h0, lop: 3 }); y += 90; return; }
      if (!toi) s += P.dat(P.avatar({ r: 30, vai: x.ai || 'chi', mau: k }), { x: 50, y: y + 30, hien: h0, lop: 2 });
      if (x.anh) { s += P.dat(P.anhLau({ w: 420, h: 280, t }), { x: 330, y: y + 150, hien: h0, lop: 2 }); y += 300; if (!x.nd) return; }
      if (x.icon) { s += P.dat(`<rect x="-70" y="-50" width="140" height="100" rx="34" ${P.A('#F1F1F4', { dac: true, w: 4 })}/>` + P.icon(x.icon, { s: 0.55, t }), { x: toi ? IW - 110 : 170, y: y + 50, hien: h0, lop: 2 }); y += 120; return; }
      const b = P.bongChat({ nd: x.nd, toi });
      s += P.dat(b.svg, { x: toi ? IW - 30 : 100, y, hien: h0, lop: 2 });
      y += b.h + 22;
    });
    return s;
  }
  function veManHinh(P, m, t, ctx) {
    const L = m.loai || 'tai-lieu';
    if (L === 'nhom-chat' || L === 'tin-nhan-rieng') {
      let s = P.chatDau({ ten: m.ten || '', w: IW, t });
      if (m.thanh_vien) {
        const t0 = giay(ctx, m.t, 0.35), n = Math.min(12, m.thanh_vien);
        const dem = Math.min(m.thanh_vien, Math.floor(lerp(0, m.thanh_vien + 0.99, pha(t, t0, 2.0))));
        s += P.chu2(`${dem} thành viên`, { x: IW / 2, y: 150, co: 34 });
        for (let k = 0; k < n; k++) s += P.dat(P.avatar({ r: 46, vai: ['chi', 'anh', 'em', 'sep'][k % 4], mau: k }), { x: 130 + (k % 4) * 200, y: 230 + Math.floor(k / 4) * 110, hien: bat(t, t0 + k * 0.16, 0.35), lop: 2 });
        if (m.thieu) {
          const tt = giay(ctx, m.t_thieu, 0.6 * ctx.giong), rung = t > tt && t < tt + 0.35 ? Math.sin(t * 80) * 8 : 0;
          s += P.dat(P.choTrong({ r: 50, t, ten: m.thieu }), { x: IW / 2 + rung, y: 500, hien: bat(t, tt, 0.4), lop: 3 });
        }
      } else s += tinNhom(P, m, t, ctx);
      return s;
    }
    if (L === 'thong-bao') {
      const tb = giay(ctx, m.t, 0.25 * ctx.giong);
      return P.cuaSo({ w: IW, h: IH, t, tieu_de: m.nen_tieu_de }) +
        P.dat(P.thongBao({ tieuDe: m.ten || '', dong: m.dong || '', w: 520, t }), { x: IW - 290, y: 90 + 70 * (1 - E.back(pha(t, tb, 0.45))), hien: t >= tb ? 1 : 0, lop: 2, tu: 'truot-xuong' }) +
        P.dat(P.icon('con-tro', {}), { x: lerp(260, IW - 330, E.io3(pha(t, tb + 0.5, 0.9))), y: lerp(460, 100, E.io3(pha(t, tb + 0.5, 0.9))), hien: 1, lop: 3 });
    }
    if (L === 'email') return P.email({ w: IW, ...m });
    if (L === 'lich-hop') return P.lichHop({ w: IW, ...m, p: pha(t, giay(ctx, m.t, 0.4 * ctx.giong), 0.8) });
    return P.cuaSo({ w: IW, h: IH, t, tieu_de: m.tieu_de });
  }

  // ---------- hiệu ứng ----------
  function mucTieu(v, ra, dc) {
    if (v === 'man-hinh') return [MH.x, MH.y, 380];
    let m;
    if (v && (m = /^nv-(\d)$/.exec(v)) && ra[+m[1]]) { const r = ra[+m[1]], s = coNV(r); return [r.xNow ?? r.x, r.y - 720 * s, 170 * s]; }
    if (v && (m = /^dc-(\d)$/.exec(v)) && dc[+m[1]]) { const d = dc[+m[1]]; const p = viTri(d.vi_tri, ra, TV.VI_TRI_DAO_CU[SLOT_DC[+m[1] % 5]]); return [p[0], p[1], 100]; }
    const p = viTri(v, ra, [540, 1000]);
    return [p[0], p[1], 120];
  }
  function veHieuUng(P, c, t, ctx, ra) {
    let s = '';
    const dc = dsDC(c);
    for (const h of dsHU(c)) {
      const t0 = giay(ctx, h.t, 0.5 * ctx.giong);
      if (t < t0 || h.ten === 'rung' || h.ten === 'zoom-vao') continue;
      if (h.ten === 'mui-ten') { const [x1, y1] = mucTieu(h.tu, ra, dc), [x2, y2] = mucTieu(h.den, ra, dc); s += P.muiTen(x1, y1, x2, y2, E.out3(pha(t, t0, 0.5))); continue; }
      if (h.ten === 'so-thu-tu') { const [x, y] = viTri(h.vi_tri, ra, [880, 760]); s += P.dat(P.so(h.so || 1, { s: 0.4, t }), { x, y, hien: bat(t, t0), lop: 3 }); continue; }
      const [x, y, r] = mucTieu(h.muc_tieu || 'man-hinh', ra, dc);
      const p = E.out3(pha(t, t0, 0.5));
      if (h.ten === 'vong-tron-do') s += `<g transform="translate(${x},${y})">${P.icon('vong-tron-do', { r, p })}</g>`;
      if (h.ten === 'gach-cheo') s += `<g transform="translate(${x},${y}) scale(${(r / 70).toFixed(3)})">${P.icon('gach-cheo', { p })}</g>`;
      if (h.ten === 'tick') s += P.dat(P.icon('tick', {}), { x: x + r * 0.8, y: y - r * 0.6, hien: bat(t, t0), lop: 3 });
    }
    return s;
  }
  function bienHieuUng(c, t, ctx) {
    let dx = 0, dy = 0, z = 1;
    for (const h of dsHU(c)) {
      const t0 = giay(ctx, h.t, 0.5 * ctx.giong), d = t - t0;
      if (h.ten === 'rung' && d >= 0 && d < 0.35) { dx += Math.sin(d * 90) * 12 * (1 - d / 0.35); dy += Math.cos(d * 70) * 8 * (1 - d / 0.35); }
      if (h.ten === 'zoom-vao') z *= 1 + 0.14 * E.io3(pha(t, t0, 0.9));
    }
    return (dx || dy ? `translate(${dx.toFixed(1)},${dy.toFixed(1)}) ` : '') + (z !== 1 ? `translate(540,900) scale(${z.toFixed(4)}) translate(-540,-900)` : '');
  }

  // ---------- góc máy ----------
  function gocMay(P, c, t, ctx, ra, noiDung) {
    const g = c.goc_may || 'trung';
    if (g === 'trung' || c.bo_cuc === 'dien-thoai') return noiDung;
    const chinh = ra.find(r => r.n.vai === 'minh') || ra[0];
    if (g === 'can' && chinh) {
      const s = coNV(chinh), fx = chinh.xNow ?? chinh.x, fy = chinh.y - 700 * s, z = Math.min(2.1, 1.05 / s);
      return `<g transform="translate(540,1000) scale(${z.toFixed(3)}) translate(${-fx},${-fy})">${noiDung}</g>`;
    }
    if (g === 'toan') return `<g transform="translate(540,1420) scale(0.8) translate(-540,-1420)">${noiDung}</g>`;
    if (g === 'tu-tren') return `<g transform="translate(540,1500) scale(0.86,0.74) translate(-540,-1500) translate(0,-60)">${noiDung}</g>`;
    if (g === 'qua-vai') {
      const vai = (ra.find(r => r.n.vai !== 'minh') || {}).n || { vai: 'dong-nghiep-nam' };
      const st = { bieu: 'binh-thuong', tuthe: 'xuoi', quay: true, mo: false, nghieng: 0 };
      const v = (TV.VAI[vai.vai] || TV.VAI['dong-nghiep-nam']).ve;
      return `<g transform="translate(620,1360) scale(0.9) translate(-620,-1360)">${noiDung}</g>` + P.dat(veMot(P, t, ctx, v === 'nhom' ? 'anh' : v, 1.25, st, false, false, 0, TV.ngoaiHinh(ctx.seed, vai.vai, 0)), { x: 150, y: 2250, hien: 1, lop: 4 });
    }
    return noiDung;
  }

  // ---------- mốc thời gian (cho SFX và chung.lich) ----------
  function moc(c, D, giongDai) {
    const ctx = { giong: giongDai || D };
    const L = { vao: 0, chu: 0.12, nv: 0.08, daoCu: [], tin: [], so: 0.1 };
    if (c.bo_cuc === 'hook-chu-to') Object.assign(L, { chu: 0, nv: 1.15 });
    if (c.bo_cuc === 'dau-hieu-so') L.chu = 0.45;
    if (c.bo_cuc === 'ket') Object.assign(L, { chu: 0.15, logo: 0.35, moi: Math.max(0.9, D - 1.6) });
    dsDC(c).forEach((d, i) => { if (d.ten !== 'ban-lam-viec' && !(d.ten === 'laptop' && d.t === undefined)) L.daoCu.push(giay(ctx, d.t, 0.38 + i * 0.17)); });
    if (!L.daoCu.length) L.daoCu = dsNV(c).map((n, k) => giay(ctx, n.t, c.bo_cuc === 'hook-chu-to' ? 1.15 + k * 0.18 : 0.06 + k * 0.12));
    L.daoCu.sort((a, b) => a - b);
    const m = c.man_hinh;
    if (m) {
      if (m.loai === 'thong-bao') L.tin.push(giay(ctx, m.t, 0.25 * ctx.giong));
      else if (m.loai === 'lich-hop') L.tin.push(giay(ctx, m.t, 0.4 * ctx.giong));
      else if (m.thanh_vien) { L.tin.push(giay(ctx, m.t, 0.35)); if (m.thieu) { L.tin.push(giay(ctx, m.t_thieu, 0.6 * ctx.giong)); L.rung = L.tin[1]; } }
      else (m.tin || []).forEach((x, k, a) => L.tin.push(giay(ctx, x.t, ctx.giong * (0.12 + k * 0.7 / Math.max(1, a.length)))));
    }
    const r = dsHU(c).find(h => h.ten === 'rung');
    if (r) L.rung = giay(ctx, r.t, 0.5 * ctx.giong);
    return L;
  }

  // ---------- ráp ----------
  function dungCanh(P, c, t, ctx) {
    const bo = c.bo_cuc;
    if (bo === 'ket') {
      const nv = dsNV(c)[0] || { vai: 'minh', tu_the: 'dung', bieu_cam: 'cuoi', doi: [{ t: 0.15, tu_the: 'vay-tay' }] };
      return P.ket(c, t, ctx, veNV(P, c, t, ctx, { n: nv, k: 0, x: 170, y: 1770, s: 0.5 }));
    }
    const ra = xepNV(c);
    let s = P.nen(c.nen || NEN_MD[bo] || 'van-phong', t, ctx);
    if (c.xep === 'tach-nhom') s += P.dat(P.vong({ r: 300, t }), { x: 650, y: 1140, hien: mo(t, 0.4, 0.8), lop: 0 });
    const nenSvg = s; s = '';
    s += veDanhSachNV(P, c, t, ctx, ra, true);
    if (bo === 'dien-thoai' && c.man_hinh) s += P.dat(P.manHinh({ w: MH.w, h: MH.h, t }, veManHinh(P, c.man_hinh, t, ctx)), { x: MH.x, y: MH.y, hien: mo(t, 0, 0.4), lop: 1, tu: 'zoom' });
    s += veDanhSachNV(P, c, t, ctx, ra, false);
    s += veDaoCu(P, c, t, ctx, ra, 'noi-that');
    s += veDaoCu(P, c, t, ctx, ra, 'thuong');
    s += veHieuUng(P, c, t, ctx, ra);
    s = nenSvg + gocMay(P, c, t, ctx, ra, s);
    const so = soCua(c);
    if (bo === 'dau-hieu-so' && so) {
      s += P.dat(P.so(so, { s: 1, t }), { x: 280, y: 500, hien: bat(t, ctx.L.so, 0.5), lop: 3, tu: 'dap' });
      s += P.chu(c, t, ctx, { y: 330, x0: 400, maxW: 520, hien: mo(t, ctx.L.chu, 0.35), t0: ctx.L.chu, co: [92, 84, 76, 68, 60] });
    } else if (bo === 'loi-khuyen') {
      if (so) s += P.dat(P.so(so, { s: 0.5, nho: true, t }), { x: 250, y: 430, hien: bat(t, 0.1), lop: 3 });
      s += P.chu(c, t, ctx, { y: 330, x0: so ? 260 : 80, maxW: so ? 640 : 820, hien: mo(t, ctx.L.chu, 0.35), t0: ctx.L.chu, co: [96, 88, 80, 72, 64] });
    } else if (bo === 'hook-chu-to') {
      s += P.chu(c, t, ctx, { y: 330, hien: 1, t0: 0, kieu: 'dap', co: [150, 136, 124, 112] });
    } else if (c.chu) {
      s += P.chu(c, t, ctx, { y: 300, hien: mo(t, ctx.L.chu, 0.35), t0: ctx.L.chu, co: bo === 'dien-thoai' ? [104, 96, 88, 80, 72] : undefined });
    }
    const bien = bienHieuUng(c, t, ctx);
    return bien ? `<g transform="${bien}">${s}</g>` : s;
  }

  window.DUNG = { dungCanh, moc, xepNV };
})();
