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
    // data-kb: nhãn cho máy kiểm bố cục (render/kiem-bo-cuc.mjs), không ảnh hưởng hình
    return `<g data-kb="nv" data-vai="${vai}">` + P.nguoi({
      vai, s, bieu: st.bieu, tuthe: st.tuthe, quay: st.quay, mo: st.mo, lat, ngoai, nghieng: st.nghieng,
      chop: chop(t + (lech || 0), seed), tho: tho(t, seed),
      mieng: noi ? ctx.mieng(t) : (st.noiGia ? 0.25 + 0.25 * Math.sin(t * 17 + seed) * (Math.sin(t * 3 + seed) > 0 ? 1 : 0) : 0),
      tTheo: t,
    }) + '</g>';
  }
  const bocChu = s => (s ? `<g data-kb="chu">${s}</g>` : '');
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
      s += `<g data-kb="dc" data-ten="${d.ten}">` + P.dat(ve(P, { ...d, t }), { x, y, hien: d.t === undefined && d.ten === 'laptop' ? 1 : bat(t, t0), an, lop: 3 }) + '</g>';
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
  // đèn rọi: lớp tối phủ cả cảnh, khoét một vòng sáng mép mềm (trong suốt tới 52% bán kính, tối hẳn từ 88%)
  // tại mục tiêu "tu"; có "den" thì vòng sáng trượt sang "den". Tất định theo t, SVG thuần.
  function veDenRoi(P, c, t, ctx, ra, dc, h, i, t0) {
    const vung = v => { const [x, y, r] = mucTieu(v, ra, dc); const R = Math.max(230, r * 2.3); return [x, y + (/^nv-/.test(v) ? R * 0.45 : 0), R]; };
    const a = vung(h.tu || h.muc_tieu || 'man-hinh');
    const b = h.den ? vung(h.den) : a;
    const td = giay(ctx, h.t_den, t0 + 0.45), q = E.io3(pha(t, td, 0.5));
    const [x, y, R] = [0, 1, 2].map(k => lerp(a[k], b[k], q));
    const bang = P.cfg.che === 'net';
    const dim = (bang ? 0.22 : 0.55) * E.out3(pha(t, t0, 0.3));
    const mau = bang ? (P.M.muc || '#1A1A1A') : '#06080C';
    const id = 'denroi-' + String(c.id || 'c').replace(/[^\w-]/g, '') + '-' + i;
    return `<defs><radialGradient id="${id}" gradientUnits="userSpaceOnUse" cx="0" cy="0" r="${R.toFixed(1)}" gradientTransform="translate(${x.toFixed(1)},${y.toFixed(1)}) scale(1,1.45)">` +
      `<stop offset="0" stop-color="${mau}" stop-opacity="0"/><stop offset=".52" stop-color="${mau}" stop-opacity="0"/>` +
      `<stop offset=".88" stop-color="${mau}" stop-opacity="${dim.toFixed(3)}"/><stop offset="1" stop-color="${mau}" stop-opacity="${dim.toFixed(3)}"/></radialGradient></defs>` +
      `<rect x="-2000" y="-2000" width="5080" height="5920" fill="url(#${id})"/>`;
  }
  const clamp01 = x => Math.max(0, Math.min(1, x));

  function veHieuUng(P, c, t, ctx, ra) {
    let s = '', toi = '';
    const dc = dsDC(c);
    for (const [i, h] of dsHU(c).entries()) {
      const t0 = giay(ctx, h.t, 0.5 * ctx.giong);
      if (t < t0 || h.ten === 'rung' || h.ten === 'zoom-vao' || CHU_HU.includes(h.ten) || h.ten === 'dung-hinh') continue;
      if (h.ten === 'den-roi') { toi += veDenRoi(P, c, t, ctx, ra, dc, h, i, t0); continue; }
      if (h.ten === 'mui-ten') { const [x1, y1] = mucTieu(h.tu, ra, dc), [x2, y2] = mucTieu(h.den, ra, dc); s += P.muiTen(x1, y1, x2, y2, E.out3(pha(t, t0, 0.5))); continue; }
      if (h.ten === 'so-thu-tu') { const [x, y] = viTri(h.vi_tri, ra, [880, 760]); s += P.dat(P.so(h.so || 1, { s: 0.4, t }), { x, y, hien: bat(t, t0), lop: 3 }); continue; }
      const [x, y, r] = mucTieu(h.muc_tieu || 'man-hinh', ra, dc);
      const p = E.out3(pha(t, t0, 0.5));
      if (h.ten === 'vong-tron-do') s += `<g transform="translate(${x},${y})">${P.icon('vong-tron-do', { r, p })}</g>`;
      if (h.ten === 'gach-cheo') s += `<g transform="translate(${x},${y}) scale(${(r / 70).toFixed(3)})">${P.icon('gach-cheo', { p })}</g>`;
      if (h.ten === 'tick') s += P.dat(P.icon('tick', {}), { x: x + r * 0.8, y: y - r * 0.6, hien: bat(t, t0), lop: 3 });
    }
    return toi + s; // lớp tối nằm dưới các hiệu ứng khác (vòng đỏ, mũi tên vẫn sáng) và dưới chữ/số
  }
  function bienHieuUng(c, t, ctx, loai) {
    let dx = 0, dy = 0, z = 1;
    for (const h of dsHU(c)) {
      const t0 = giay(ctx, h.t, 0.5 * ctx.giong), d = t - t0;
      if (h.ten === 'rung' && d >= 0 && d < 0.35) { dx += Math.sin(d * 90) * 12 * (1 - d / 0.35); dy += Math.cos(d * 70) * 8 * (1 - d / 0.35); }
      if (h.ten === 'zoom-vao') z *= 1 + 0.14 * E.io3(pha(t, t0, 0.9));
    }
    // loai 'zoom' chỉ phóng cảnh (chữ và số đứng yên, không bị đẩy ra vùng TikTok che); 'rung' lắc cả khung
    if (loai === 'zoom') return z !== 1 ? `translate(540,900) scale(${z.toFixed(4)}) translate(-540,-900)` : '';
    return dx || dy ? `translate(${dx.toFixed(1)},${dy.toFixed(1)})` : '';
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

  // ---------- lớp chữ + hiệu ứng chữ (to-da-quang, gach-thay) ----------
  const CHU_HU = ['to-da-quang', 'gach-thay'];
  const sachTu = w => w.toLowerCase().replace(/[.,!?:;…"“”'()]/g, '');
  // gọi P.chu, gom cả phần phong cách giữ riêng ở P._chu (tranh-tinh-zoom)
  function goiChu(P, c, t, ctx, o) {
    const giu = P._chu; if (giu !== undefined) P._chu = '';
    let s = P.chu(c, t, ctx, o);
    if (giu !== undefined) { s += P._chu; P._chu = giu; }
    return s;
  }
  // đo các dòng chữ khi đã hiện xong → hộp tuyệt đối [{x0,x1,y0,y1}]
  function doChu(P, c, ctx, o) {
    const ds = [];
    goiChu(P, c, 99, ctx, { ...o, hien: 1, lop: (g, vi) => { if (vi === 'duoi') ds.push(g); return ''; } });
    return ds.map(g => { const ax = g.ox + g.cx, ay = g.oy + g.yb; return { x0: ax - g.w / 2 - g.dem, x1: ax + g.w / 2 + g.dem, y0: ay - g.co * 0.92, y1: ay + g.co * 0.3 }; });
  }
  const hopChung = ds => ds.reduce((a, b) => ({ x0: Math.min(a.x0, b.x0), x1: Math.max(a.x1, b.x1), y0: Math.min(a.y0, b.y0), y1: Math.max(a.y1, b.y1) }));

  // tô dạ quang: vệt bút nét tay (đầu nét đậm) quét trái → phải 0,4 s dưới đúng từ khoá "tu" (mặc định tu_khoa).
  // kieu "to" = vệt dày sau thân chữ; "gach-duoi" = nét gạch dưới chân chữ.
  function lopDaQuang(P, c, t, ctx, h) {
    const t0 = giay(ctx, h.t, 0.4 * ctx.giong);
    const tu = String(h.tu || c.tu_khoa || '').split(/\s+/).map(sachTu).filter(Boolean);
    if (!tu.length) return null;
    const che = P.cfg.che, gach = h.kieu === 'gach-duoi';
    const op = gach ? 0.9 : ({ net: 0.3, vien: 0.42, bong: 0.62 }[che] || 0.45);
    return (g, vi) => {
      if (vi !== 'duoi' || t < t0) return '';
      const tuDong = g.dong.map(l => l.split(/\s+/).filter(Boolean)), phang = tuDong.flat().map(sachTu);
      const i0 = phang.findIndex((_, i) => tu.every((w, j) => phang[i + j] === w));
      const danh = new Set();
      if (i0 >= 0) tu.forEach((_, j) => danh.add(i0 + j)); else phang.forEach((w, i) => { if (tu.includes(w)) danh.add(i); });
      // các đoạn liền nhau (không vắt dòng), theo thứ tự đọc
      const doan = [];
      let lech = 0;
      tuDong.forEach((d, k) => { d.forEach((_, j) => { if (!danh.has(lech + j)) return; const z = doan.at(-1); if (z && z.k === k && z.b === j - 1) z.b = j; else doan.push({ k, a: j, b: j }); }); lech += d.length; });
      const W = x => TC.doRong(x, g.font) + g.gian * [...x].length, tw = tuDong[g.k], du = 0.4 / Math.max(1, doan.length);
      let s = '';
      doan.forEach((z, j) => {
        if (z.k !== g.k) return;
        const p = E.out3(pha(t, t0 + j * du, du)); if (p <= 0) return;
        const truoc = tw.slice(0, z.a).join(' ') + (z.a ? ' ' : ''), cum = tw.slice(z.a, z.b + 1).join(' ');
        const xL = g.cx - g.w / 2 + W(truoc), xR = xL + W(cum) - g.gian;
        const sw = gach ? Math.max(7, g.co * 0.11) : g.co * 0.46, yc = gach ? g.yb + g.co * 0.14 : g.yb - g.co * 0.25;
        const x1 = xL + sw * (gach ? 0 : 0.3) - 6, x2 = xR - sw * (gach ? 0 : 0.3) + 6, dx = x2 - x1, e = g.co * 0.035;
        const d = `M${x1.toFixed(1)} ${(yc + e).toFixed(1)} C${(x1 + dx * 0.3).toFixed(1)} ${(yc - e).toFixed(1)} ${(x1 + dx * 0.7).toFixed(1)} ${(yc + e * 1.2).toFixed(1)} ${x2.toFixed(1)} ${(yc - e * 0.6).toFixed(1)}`;
        const net = `fill="none" stroke="${P.M.do}" stroke-linecap="round" pathLength="1"`;
        s += `<path d="${d}" ${net} stroke-width="${sw.toFixed(1)}" opacity="${op}" stroke-dasharray="1 2" stroke-dashoffset="${(1 - p).toFixed(3)}"/>`;
        s += `<path d="${d}" ${net} stroke-width="${(sw * 1.06).toFixed(1)}" opacity="${(op * 0.55).toFixed(2)}" stroke-dasharray="${Math.min(p, 0.1).toFixed(3)} 2"/>`;
      });
      return s;
    };
  }

  // gạch thay: chữ cũ "cu" bị gạch tay 2 lần, mờ + thu nhỏ + tụt, chữ thật "moi" bật lên sát bên (thay cho chu của cảnh)
  function boTriGachThay(P, c, ctx, o, h) {
    const tk = c.tu_khoa && h.moi.toLowerCase().includes(c.tu_khoa.toLowerCase()) ? c.tu_khoa : '';
    const cCu = { ...c, chu: h.cu, tu_khoa: '' }, cMoi = { ...c, chu: h.moi, tu_khoa: tk };
    const bCu = hopChung(doChu(P, cCu, ctx, o)), bMoi = hopChung(doChu(P, cMoi, ctx, o));
    const nho = 0.62, khe = 22, ax = (bCu.x0 + bCu.x1) / 2;
    let ay, dyCu, dyMoi;
    if (bCu.y0 < 960) { ay = bCu.y0; dyCu = 14; dyMoi = ay + (bCu.y1 - bCu.y0) * nho + dyCu + khe - bMoi.y0; } // chữ đặt từ trên xuống
    else { ay = bCu.y1; dyMoi = 0; dyCu = bMoi.y0 - khe - bCu.y1; }                                             // chữ neo đáy (phụ đề)
    const cuSau = { x0: ax + (bCu.x0 - ax) * nho, x1: ax + (bCu.x1 - ax) * nho, y0: ay + (bCu.y0 - ay) * nho + dyCu, y1: ay + (bCu.y1 - ay) * nho + dyCu };
    return { cCu, cMoi, nho, ax, ay, dyCu, dyMoi, vung: [bCu, cuSau, { ...bMoi, y0: bMoi.y0 + dyMoi, y1: bMoi.y1 + dyMoi }] };
  }
  function veGachThay(P, c, t, ctx, o, h) {
    const B = boTriGachThay(P, c, ctx, o, h), t0 = giay(ctx, h.t, 0.35 * ctx.giong);
    const g1 = pha(t, t0, 0.16), g2 = pha(t, t0 + 0.14, 0.18), q = E.io3(pha(t, t0 + 0.34, 0.36)), tm = t0 + 0.42;
    const lopGach = (g, vi) => {
      if (vi !== 'tren' || g1 <= 0) return '';
      const xa = g.cx - g.w / 2 - 12, xb = g.cx + g.w / 2 + 12, ym = g.yb - g.co * 0.3, d = g.co * 0.07, sw = Math.max(7, g.co * 0.09);
      const net = (x1, y1, x2, y2, p) => `<path d="M${x1.toFixed(1)} ${y1.toFixed(1)} Q${((x1 + x2) / 2).toFixed(1)} ${((y1 + y2) / 2 - d * 0.7).toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}" fill="none" stroke="${P.M.do}" stroke-width="${sw.toFixed(1)}" stroke-linecap="round" pathLength="1" stroke-dasharray="1 2" stroke-dashoffset="${(1 - E.out3(p)).toFixed(3)}"/>`;
      return net(xa, ym - d, xb, ym + d * 0.5, g1) + (g2 > 0 ? net(xb - 6, ym + d * 1.3, xa + 10, ym + d * 0.4, g2) : '');
    };
    const cu = goiChu(P, B.cCu, t, ctx, { ...o, lop: lopGach });
    let s = q > 0 ? `<g opacity="${lerp(1, 0.4, q).toFixed(3)}" transform="translate(0,${(B.dyCu * q).toFixed(1)}) translate(${B.ax.toFixed(1)},${B.ay.toFixed(1)}) scale(${lerp(1, B.nho, q).toFixed(4)}) translate(${(-B.ax).toFixed(1)},${(-B.ay).toFixed(1)})">${cu}</g>` : cu;
    if (t >= tm) s += `<g transform="translate(0,${B.dyMoi.toFixed(1)})">${goiChu(P, B.cMoi, t, ctx, { ...o, t0: tm, hien: mo(t, tm, 0.35) })}</g>`;
    return s;
  }
  const gachThayCua = c => dsHU(c).find(h => h.ten === 'gach-thay' && h.cu && h.moi);
  // vẽ lớp chữ của cảnh (kèm hiệu ứng chữ); phong cách giữ chữ riêng (P._chu) thì trả ''
  function veLopChu(P, c, t, ctx, o) {
    const gt = gachThayCua(c), tdq = !gt && dsHU(c).find(h => h.ten === 'to-da-quang');
    let s;
    if (gt) s = veGachThay(P, c, t, ctx, o, gt);
    else { const lop = tdq && lopDaQuang(P, c, t, ctx, tdq); s = goiChu(P, c, t, ctx, lop ? { ...o, lop } : o); }
    if (P._chu !== undefined) { P._chu = s; return ''; }
    return bocChu(s);
  }
  function vungChuCanh(P, c, ctx, o) {
    const gt = gachThayCua(c);
    return gt ? boTriGachThay(P, c, ctx, o, gt).vung : (c.chu ? doChu(P, c, ctx, o) : []);
  }
  // tham số lớp chữ theo bố cục
  function oChu(c, t, ctx) {
    const bo = c.bo_cuc, so = soCua(c), hien = mo(t, ctx.L.chu, 0.35), t0 = ctx.L.chu;
    if (bo === 'dau-hieu-so' && so) return { y: 330, x0: 400, maxW: 520, hien, t0, co: [92, 84, 76, 68, 60] };
    if (bo === 'loi-khuyen') return { y: 330, x0: so ? 265 : 80, maxW: so ? 635 : 820, hien, t0, co: [96, 88, 80, 72, 64] };
    if (bo === 'hook-chu-to') return { y: 330, hien: 1, t0: 0, kieu: 'dap', co: [150, 136, 124, 112] };
    return { y: 300, hien, t0, co: bo === 'dien-thoai' ? [104, 96, 88, 80, 72] : undefined };
  }

  // dừng hình: cảnh khựng tại mốc t (nội dung đã kẹp t), chớp sáng ≤0,12 s, co thành tấm ảnh viền giấy nghiêng,
  // 2 miếng băng dính ở góc trên, nhãn viết tay đặt ở góc không đè chữ. Khung/băng dính/nhãn chạy theo t thật.
  function khungAnh(P, c, t, ctx, h, tf, canh, nenSvg, vung) {
    const net = P.cfg.che === 'net', vien = P.cfg.che === 'vien', M = P.M;
    const p = E.out3(pha(t, tf + 0.03, 0.38));
    const W = { x: 60, y: 540, w: 960, h: 1060 }, cx = 540, cy = W.y + W.h / 2, m = 24, goc = (h.nghieng ?? -2) * p;
    // ảnh nằm dưới chữ (chữ đặt từ trên) và trên mép dưới 1555; co tối đa 0,84
    const T0 = Math.max(560, ...vung.filter(b => b.y0 < 960).map(b => b.y1 + 34)), B0 = 1555, HA = W.h + 2 * m;
    const SC = Math.min(0.84, (B0 - T0) / HA), cyA = T0 + (HA * SC) / 2, sc = lerp(1, SC, p), cyN = lerp(cy, cyA, p);
    const id = 'dh-' + String(c.id || 'c').replace(/[^\w-]/g, '');
    const giay = net ? M.giay : '#FBF8F1', muc = net ? M.muc : '#141414';
    let s = nenSvg + `<rect x="-60" y="-60" width="1200" height="2040" fill="${net ? giay : '#000'}" opacity="${((net ? 0.6 : 0.5) * p).toFixed(3)}"/>`;
    let a = '';
    if (!net) a += `<rect x="${W.x - m + 14}" y="${W.y - m + 18}" width="${W.w + 2 * m}" height="${W.h + 2 * m}" fill="#000" opacity="${(0.4 * p).toFixed(3)}"/>`;
    a += `<rect x="${W.x - m}" y="${W.y - m}" width="${W.w + 2 * m}" height="${W.h + 2 * m}" fill="${giay}"${net || vien ? ` stroke="${muc}" stroke-width="${net ? 6 : 8}"` : ''}/>`;
    a += `<defs><clipPath id="${id}"><rect x="${W.x}" y="${W.y}" width="${W.w}" height="${W.h}"/></clipPath></defs><g clip-path="url(#${id})">${canh}</g>`;
    a += `<rect x="${W.x}" y="${W.y}" width="${W.w}" height="${W.h}" fill="none" stroke="${muc}" stroke-opacity=".35" stroke-width="3"/>`;
    const bang = (x, y, r) => `<g transform="translate(${x},${y}) rotate(${r})"><path d="M-84 -24 L84 -24 L77 -14 L85 -5 L77 4 L85 13 L78 24 L-84 24 L-77 13 L-85 4 L-77 -5 L-85 -14 Z" fill="${net ? giay : '#F2E6B8'}" fill-opacity="${net ? 1 : 0.85}" stroke="${net ? muc : '#00000026'}" stroke-width="${net ? 4 : 2}"/>` +
      (net ? [-50, -20, 10, 40].map(x0 => `<path d="M${x0} 16 L${x0 + 22} -16" stroke="${muc}" stroke-width="3" opacity=".5"/>`).join('') : '') + '</g>';
    if (p > 0.15) a += bang(W.x + 26, W.y - 6, -34) + bang(W.x + W.w - 26, W.y - 6, 34);
    // nhãn: chọn góc trong ảnh không đè vùng chữ / vùng TikTok che
    if (h.nhan) {
      const font = net ? `400 54px ${P.cfg.hoChu || 'PH'}` : '800 42px BVP', lw = TC.doRong(h.nhan, font) + 44, lh = net ? 74 : 66;
      const ab = (x, y) => [cx + (x - cx) * SC, cyA + (y - cy) * SC];
      const o = [[W.x + 30, W.y + W.h - 40 - lh], [W.x + 30, W.y + 50], [W.x + W.w - 30 - lw, W.y + 50], [W.x + W.w - 30 - lw, W.y + W.h - 40 - lh]].find(([x, y]) => {
        const [x0, y0] = ab(x, y), [x1, y1] = ab(x + lw, y + lh);
        if (x1 > 920 && y1 > 760) return false;
        return !vung.some(b => x1 > b.x0 && x0 < b.x1 && y1 > b.y0 && y0 < b.y1);
      }) || [W.x + 30, W.y + W.h - 40 - lh];
      const hn = clamp01(pha(t, tf + 0.3, 0.25));
      if (hn > 0) a += `<g transform="translate(${o[0] + lw / 2},${o[1] + lh / 2}) rotate(${(-goc * 1.5).toFixed(2)}) scale(${lerp(1.3, 1, E.out3(hn)).toFixed(3)})" opacity="${hn.toFixed(3)}">` +
        `<rect x="${-lw / 2}" y="${-lh / 2}" width="${lw}" height="${lh}" rx="8" fill="${giay}" stroke="${net ? M.do : muc}" stroke-width="${net ? 5 : 4}"/>` +
        `<text y="${net ? 18 : 15}" text-anchor="middle" style="font:${font}" fill="${M.do}">${TC.thoat(h.nhan)}</text></g>`;
    }
    return s + `<g transform="translate(${cx},${cyN.toFixed(1)}) rotate(${goc.toFixed(2)}) scale(${sc.toFixed(4)}) translate(${-cx},${-cy})">${a}</g>`;
  }

  // ---------- ráp ----------
  function dungCanh(P, c, t, ctx) {
    const bo = c.bo_cuc;
    if (bo === 'ket') {
      const nv = dsNV(c)[0] || { vai: 'minh', tu_the: 'dung', bieu_cam: 'cuoi', doi: [{ t: 0.15, tu_the: 'vay-tay' }] };
      return P.ket(c, t, ctx, veNV(P, c, t, ctx, { n: nv, k: 0, x: 170, y: 1770, s: 0.5 }));
    }
    const hu = dsHU(c), dh = hu.find(h => h.ten === 'dung-hinh');
    // dung-hinh: sau mốc tf mọi chuyển động của nội dung giữ nguyên (tc = t đã kẹp); chữ, khung ảnh vẫn chạy theo t thật
    const tf = dh ? giay(ctx, dh.t, 0.5 * ctx.giong) : Infinity, tc = Math.min(t, tf);
    const giuT = P._t; if (giuT !== undefined) P._t = tc;
    const ra = xepNV(c);
    const oc = c.chu || gachThayCua(c) ? oChu(c, t, ctx) : null;
    const vung = oc && dh ? vungChuCanh(P, c, ctx, oc) : [];
    const nenSvg = P.nen(c.nen || NEN_MD[bo] || 'van-phong', tc, ctx);
    let s = '';
    if (c.xep === 'tach-nhom') s += P.dat(P.vong({ r: 300, t: tc }), { x: 650, y: 1140, hien: mo(tc, 0.4, 0.8), lop: 0 });
    const vong = s; s = '';
    s += veDanhSachNV(P, c, tc, ctx, ra, true);
    if (bo === 'dien-thoai' && c.man_hinh) s += P.dat(P.manHinh({ w: MH.w, h: MH.h, t: tc }, veManHinh(P, c.man_hinh, tc, ctx)), { x: MH.x, y: MH.y, hien: mo(tc, 0, 0.4), lop: 1, tu: 'zoom' });
    s += veDanhSachNV(P, c, tc, ctx, ra, false);
    s += veDaoCu(P, c, tc, ctx, ra, 'noi-that');
    s += veDaoCu(P, c, tc, ctx, ra, 'thuong');
    s += veHieuUng(P, c, tc, ctx, ra);
    s = nenSvg + vong + gocMay(P, c, tc, ctx, ra, s);
    const zoom = bienHieuUng(c, tc, ctx, 'zoom');
    if (zoom) s = `<g transform="${zoom}">${s}</g>`;
    if (giuT !== undefined) P._t = giuT;
    if (t >= tf) s = khungAnh(P, c, t, ctx, dh, tf, s, nenSvg, vung);
    const so = soCua(c);
    if (bo === 'dau-hieu-so' && so) s += P.dat(P.so(so, { s: 1, t }), { x: 280, y: 500, hien: bat(t, ctx.L.so, 0.5), lop: 3, tu: 'dap' });
    else if (bo === 'loi-khuyen' && so) s += P.dat(P.so(so, { s: 0.5, nho: true, t }), { x: 170, y: 430, hien: bat(t, 0.1), lop: 3 });
    if (oc) s += veLopChu(P, c, t, ctx, oc);
    if (t >= tf && t < tf + 0.12) s += `<rect x="-100" y="-100" width="1280" height="2120" fill="${P.cfg.che === 'net' ? P.M.giay : '#FFFFFF'}" opacity="${(0.9 * (1 - (t - tf) / 0.12)).toFixed(3)}"/>`;
    const bien = bienHieuUng(c, tc, ctx, 'rung');
    return bien ? `<g transform="${bien}">${s}</g>` : s;
  }

  window.DUNG = { dungCanh, moc, xepNV };
})();
