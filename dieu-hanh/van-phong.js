// Văn phòng 3D của Tâm Cơ: một bàn cờ nổi giữa trời, tượng quân mã đỏ ở giữa, mỗi nhân viên ngồi một ô.
// WebGL (Three.js). Nhẹ cho máy đồ hoạ tích hợp: vật liệu Lambert, bóng đổ tĩnh, 30 khung/giây, tự nghỉ khi khuất.
// Trang chính gọi: taoVanPhong({doi, bia, toi, chon}) → {el, trangThai, bayThu, chuDe, chay, xoayVe, giaiDoan, tienDo}
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const O = 1.9;                                   // cạnh một ô cờ
const COT = 9, HANG = 7;                         // bàn cờ 9 × 7 ô
const MAU_TT = { lam: 0x35b874, cho: 0xe8a23a, loi: 0xe0434e, onl: 0xffffff };
// kiểu tóc, màu da, kính, màu tóc: khớp với chân dung 2D ở trang chính
const DANG = { 'dai-ca': ['vuot', '#f0c9a0', 0, '#1f1b1a'], 'truong-nhom': ['ngan', '#eec39a', 1, '#1f1b1a'], 'len-chu-de': ['dai', '#f3d0ad', 0, '#2a1d1a'],
  'bien-kich': ['roi', '#e9bb8f', 1, '#1f1b1a'], 'kiem-duyet': ['bui', '#f1cba6', 1, '#5a3a32'], 'hoa-si': ['mu', '#e6b78a', 0, '#1f1b1a'],
  'dong-goi': ['bob', '#f4d3b3', 0, '#3b2a22'], 'phan-tich': ['dinh', '#e3b081', 0, '#1f1b1a'] };
// vị trí theo ô (cột, hàng tính từ tâm bàn cờ)
const VT = { 'dai-ca': [-3, -2], 'truong-nhom': [0, -1], 'len-chu-de': [-4, 1], 'bien-kich': [-2, 1], 'kiem-duyet': [0, 1],
  'hoa-si': [2, -1], 'may-dung': [4, -2], 'dong-goi': [2, 2], 'phan-tich': [4, 2] };
const KHU = [['BAN LÃNH ĐẠO', -3, -2.62], ['ĐIỀU PHỐI', 0, -1.62], ['NỘI DUNG', -2, 0.38], ['HÌNH ẢNH & DỰNG', 3, -2.62], ['XUẤT BẢN & SỐ LIỆU', 3, 1.38]];
const BUOC = ['Kịch bản', 'Giọng', 'Mẫu', 'Dựng', 'Gói đăng', 'Nháp'];

export async function taoVanPhong({ doi, bia = [], toi = false, chon = () => {} }) {
  try { await Promise.all([document.fonts.load('800 80px BVP'), document.fonts.load('700 40px BVP'), document.fonts.load('40px Tay')]); } catch {}

  const el = document.createElement('div'); el.className = 'vp3d';
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap; renderer.shadowMap.autoUpdate = false;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  el.append(renderer.domElement);
  const lop = document.createElement('div'); lop.className = 'vp3d-nhan'; el.append(lop);

  const scene = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera(24, 16 / 9, 1, 200);
  const dao = new THREE.Group(); scene.add(dao);          // cả hòn đảo (để nhấp nhô nhẹ)

  /* ---------- vật liệu, khối cơ bản ---------- */
  const khoVL = new Map();
  const M = (mau, o) => { if (o) return new THREE.MeshLambertMaterial({ color: mau, ...o }); let m = khoVL.get(mau); if (!m) khoVL.set(mau, m = new THREE.MeshLambertMaterial({ color: mau })); return m; };
  const bong = (m, do_ = true, nhan = true) => { m.castShadow = do_; m.receiveShadow = nhan; return m; };
  const hop = (w, h, d, mau, r = 0.04) => bong(new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 3, Math.max(0.004, Math.min(r, w / 2.01, h / 2.01, d / 2.01))), typeof mau === 'object' ? mau : M(mau)));
  const tru = (rt, rb, h, mau, seg = 20) => bong(new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), typeof mau === 'object' ? mau : M(mau)));
  const cau = (r, mau, ws = 20, hs = 14) => bong(new THREE.Mesh(new THREE.SphereGeometry(r, ws, hs), typeof mau === 'object' ? mau : M(mau)));
  const vien = (r, len, mau) => bong(new THREE.Mesh(new THREE.CapsuleGeometry(r, len, 6, 14), M(mau)));
  const dat = (m, x, y, z, cha = dao) => { m.position.set(x, y, z); cha.add(m); return m; };
  const veTex = (w, h, ve) => { const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); ve(g, w, h);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; t.userData = { c, g }; return t; };
  const tam = (w, h, tex, o = {}) => new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false, ...o }));
  let hat = 11; const ngau = () => (hat = (hat * 16807) % 2147483647) / 2147483647;
  const oX = c => c * O, oZ = r => r * O;

  /* ---------- hòn đảo bàn cờ ---------- */
  const W = COT * O, D = HANG * O;
  dat(hop(W + 0.7, 0.55, D + 0.7, '#6b4a33', 0.14), 0, -0.3, 0);                       // khung gỗ sẫm
  const da = new THREE.Mesh(new THREE.CylinderGeometry(1, 0.22, 5.2, 7, 3), new THREE.MeshLambertMaterial({ color: '#8b7460', flatShading: true }));
  da.scale.set(W * 0.55, 1, D * 0.55); dat(da, 0, -3.15, 0);                           // khối đá treo bên dưới
  const da2 = new THREE.Mesh(new THREE.CylinderGeometry(1, 0.3, 2.2, 6, 2), new THREE.MeshLambertMaterial({ color: '#a08a72', flatShading: true }));
  da2.scale.set(W * 0.5, 1, D * 0.5); da2.rotation.y = 0.5; dat(da2, 0.4, -1.5, 0.2);
  const oSang = M('#f1e6d2'), oToi = M('#c59a6b');
  const hinhO = new RoundedBoxGeometry(O - 0.05, 0.12, O - 0.05, 2, 0.035);
  for (let c = 0; c < COT; c++) for (let r = 0; r < HANG; r++) {
    const m = new THREE.Mesh(hinhO, (c + r) % 2 ? oToi : oSang); m.receiveShadow = true;
    dat(m, (c - (COT - 1) / 2) * O, -0.06, (r - (HANG - 1) / 2) * O);
  }
  // tên bộ phận in trên mặt bàn cờ
  for (const [chu, c, r] of KHU) {
    const t = veTex(512, 64, (g, w, h) => { g.font = '800 34px BVP, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = 'rgba(60,40,25,.55)'; try { g.letterSpacing = '5px'; } catch {} g.fillText(chu, w / 2, h / 2 + 2); });
    const p = tam(3.4, 0.425, t, { transparent: true, depthWrite: false }); p.rotation.x = -Math.PI / 2; dat(p, oX(c), 0.012, oZ(r));
  }

  /* ---------- tượng quân mã (đúng logo kênh, đùn thành khối) ---------- */
  const ma = new THREE.Group();
  {
    const s = new THREE.Shape(), Y = y => 168 - y;
    s.moveTo(72, Y(152)); s.bezierCurveTo(70, Y(132), 72, Y(118), 80, Y(102)); s.bezierCurveTo(74, Y(100), 68, Y(101), 62, Y(104)); s.lineTo(52, Y(106));
    s.bezierCurveTo(45, Y(107), 41, Y(100), 44, Y(93)); s.lineTo(52, Y(78)); s.bezierCurveTo(56, Y(62), 66, Y(50), 78, Y(44)); s.lineTo(84, Y(32)); s.lineTo(92, Y(44));
    s.bezierCurveTo(112, Y(46), 128, Y(60), 134, Y(80)); s.bezierCurveTo(142, Y(104), 136, Y(126), 136, Y(152)); s.closePath();
    const mat = new THREE.Path(); mat.absarc(86, Y(66), 5.5, 0, Math.PI * 2, true); s.holes.push(mat);
    const g = new THREE.ExtrudeGeometry(s, { depth: 26, bevelEnabled: true, bevelThickness: 5, bevelSize: 4, bevelSegments: 4, curveSegments: 20 });
    g.translate(-100, 0, -13);
    const vl = new THREE.MeshLambertMaterial({ color: '#d5303d', emissive: '#5a0a10', emissiveIntensity: 0.25 });
    const than = bong(new THREE.Mesh(g, vl)); than.scale.setScalar(0.021); than.position.y = 0.16; ma.add(than);
    ma.userData.vl = vl;
    dat(tru(1.05, 1.15, 0.28, '#d5303d', 40), 0, 0.3, 0, ma);                           // đế đỏ như logo
    dat(tru(1.22, 1.3, 0.2, '#3a2a20', 40), 0, 0.1, 0, ma);
    dat(tru(1.07, 1.07, 0.05, '#e8c36a', 40), 0, 0.455, 0, ma);                         // viền vàng
    ma.rotation.y = 0.35; ma.scale.setScalar(1.45); dat(ma, 0.4, 0, -4.85);
  }

  /* ---------- quân tốt (khối tiện tròn) làm đồ trang trí ---------- */
  const hinhTot = new THREE.LatheGeometry([[0, 0], [0.33, 0], [0.35, 0.07], [0.27, 0.13], [0.17, 0.22], [0.12, 0.46], [0.21, 0.5], [0.21, 0.56], [0.11, 0.6], [0.17, 0.7], [0.19, 0.8], [0.15, 0.9], [0.07, 0.96], [0, 0.97]].map(p => new THREE.Vector2(p[0], p[1])), 24);
  const tot = (mau, x, y, z, s = 1, cha = dao) => { const m = bong(new THREE.Mesh(hinhTot, M(mau))); m.scale.setScalar(s); return dat(m, x, y, z, cha); };
  tot('#f4ecdc', oX(-1) - 0.5, 0, oZ(-3) + 0.3, 1.5); tot('#3a2a20', oX(-2) + 0.3, 0, oZ(-1) - 0.2, 1.5); tot('#f4ecdc', oX(4), 0, oZ(3) + 0.2, 1.5); tot('#3a2a20', oX(-1), 0, oZ(3) + 0.2, 1.6); tot('#d5303d', oX(4), 0, oZ(0), 1.5);
  // mảnh bàn cờ và quân tốt lơ lửng quanh đảo
  const troi = [];
  const noi = (m, bien = 0.25, toc = 0.6, xoay = false) => { troi.push({ m, y: m.position.y, bien, toc, xoay, pha: ngau() * 6.28 }); return m; };
  [[-10.6, -1.2, -3.5, 0], [-11.2, 0.9, 2.2, 1], [10.8, -0.4, -1.5, 1], [11.6, 1.3, 3.4, 0], [9.9, 2.2, -6.2, 0], [-9.6, 2.6, -6.4, 1], [3, -1.8, 8.6, 1], [-5, -1.4, 8.4, 0]].forEach(([x, y, z, sang], i) => {
    const m = hop(1.2, 0.35, 1.2, sang ? '#f1e6d2' : '#c59a6b', 0.06); m.rotation.set(ngau() * 0.3, ngau() * 3, ngau() * 0.3); noi(dat(m, x, y, z, scene), 0.3, 0.45, true);
    if (i % 3 === 0) noi(tot(i % 2 ? '#3a2a20' : '#d5303d', x + 0.05, y + 0.2, z, 0.9, scene), 0.3, 0.45).userData.theo = m;
  });

  /* ---------- cây, ghế nghỉ ---------- */
  const cay = (x, z, cao = 1) => { const g = new THREE.Group(); dat(tru(0.2, 0.15, 0.32, '#f4ecdc'), 0, 0.16, 0, g); dat(tru(0.03, 0.03, 0.5 * cao, '#6b4a33', 6), 0, 0.5, 0, g);
    for (let i = 0; i < 6; i++) { const l = cau(0.2 + ngau() * 0.1, i % 2 ? '#3f9a68' : '#57b07c', 8, 6); l.scale.y = 1.25; dat(l, (ngau() - 0.5) * 0.4, 0.55 + cao * 0.35 + ngau() * 0.45 * cao, (ngau() - 0.5) * 0.4, g); }
    g.scale.setScalar(1.35); return dat(g, x, 0, z); };
  cay(oX(-4) - 0.3, oZ(-1) + 0.2, 1.3); cay(oX(1), oZ(3) + 0.3, 0.9); cay(oX(2) + 0.3, oZ(-3), 1.1); cay(oX(-4) - 0.2, oZ(2) - 0.6, 1);
  { const g = new THREE.Group(), do_ = '#c9463f';                                           // ghế sô-pha góc nghỉ
    dat(hop(2.3, 0.36, 0.95, do_, 0.12), 0, 0.3, 0, g); dat(hop(2.3, 0.75, 0.26, do_, 0.12), 0, 0.62, -0.38, g);
    dat(hop(0.26, 0.55, 0.95, do_, 0.1), -1.1, 0.42, 0, g); dat(hop(0.26, 0.55, 0.95, do_, 0.1), 1.1, 0.42, 0, g);
    dat(hop(0.5, 0.4, 0.14, '#f4ecdc', 0.07), -0.5, 0.66, -0.2, g).rotation.x = -0.25; dat(hop(0.5, 0.4, 0.14, '#e8c36a', 0.07), 0.45, 0.66, -0.2, g).rotation.x = -0.25;
    dat(tru(0.5, 0.5, 0.06, '#e7cfa9', 28), 0.1, 0.4, 1.05, g); dat(tru(0.06, 0.2, 0.38, '#3a2a20', 12), 0.1, 0.19, 1.05, g);
    dat(tru(0.07, 0.06, 0.12, '#ffffff', 12), -0.05, 0.49, 1.0, g); dat(tru(0.07, 0.06, 0.12, '#d5303d', 12), 0.3, 0.49, 1.15, g);
    g.rotation.y = 0.5; g.scale.setScalar(1.3); dat(g, oX(-3) - 0.2, 0, oZ(3) - 0.75); }
  // đèn cây: ban đêm là nguồn sáng ấm
  const den = [];
  const denCay = (x, z) => { const g = new THREE.Group(); dat(tru(0.2, 0.22, 0.05, '#3a2a20', 16), 0, 0.03, 0, g); dat(tru(0.025, 0.025, 1.7, '#3a2a20', 8), 0, 0.88, 0, g);
    const chup = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.3, 0.36, 18, 1, true), new THREE.MeshLambertMaterial({ color: '#fff3d6', emissive: '#ffcf7a', emissiveIntensity: 0, side: THREE.DoubleSide }));
    dat(chup, 0, 1.78, 0, g); const pl = new THREE.PointLight('#ffc874', 0, 9, 1.6); dat(pl, 0, 1.7, 0, g); den.push({ chup, pl }); g.scale.setScalar(1.35); return dat(g, x, 0, z); };
  denCay(oX(-4) - 0.4, oZ(3) + 0.3); denCay(oX(1) - 0.2, oZ(-2) - 0.3); denCay(oX(3), oZ(1) - 0.9);

  /* ---------- bảng tiến độ (sau lưng anh Hải) và màn hình dựng ---------- */
  let buocNay = -1;
  const texBang = veTex(768, 360, () => {});
  function veBang() { const { g, c } = texBang.userData, w = c.width, h = c.height; g.fillStyle = '#fffdf8'; g.fillRect(0, 0, w, h);
    const cw = w / 6; hat = 5;
    BUOC.forEach((t, i) => { const x = i * cw; if (i === buocNay) { g.fillStyle = '#fde4e2'; g.fillRect(x + 4, 4, cw - 8, h - 8); }
      g.fillStyle = i === buocNay ? '#d5303d' : '#6e6860'; g.font = '700 23px BVP, sans-serif'; g.textAlign = 'center'; g.fillText(t, x + cw / 2, 40);
      g.strokeStyle = 'rgba(0,0,0,.1)'; g.lineWidth = 2; g.beginPath(); g.moveTo(x + cw, 12); g.lineTo(x + cw, h - 12); g.stroke();
      const n = buocNay < 0 ? 1 + (i % 3) : i < buocNay ? 3 : i === buocNay ? 2 : 0;
      for (let k = 0; k < n; k++) { g.fillStyle = i < buocNay ? '#bfe6cf' : ['#ffe08a', '#ffc2bd', '#bfdcff'][(i + k) % 3]; g.fillRect(x + 22 + ngau() * 8, 66 + k * 88 + ngau() * 6, cw - 46, 70); } });
    texBang.needsUpdate = true; }
  veBang();
  { const g = new THREE.Group(); dat(hop(3.5, 1.75, 0.1, '#3a2a20', 0.05), 0, 1.75, 0, g); const p = tam(3.3, 1.55, texBang); dat(p, 0, 1.75, 0.056, g);
    dat(hop(0.08, 0.95, 0.08, '#3a2a20', 0.02), -1.3, 0.47, 0, g); dat(hop(0.08, 0.95, 0.08, '#3a2a20', 0.02), 1.3, 0.47, 0, g);
    dat(hop(0.7, 0.05, 0.5, '#3a2a20', 0.02), -1.3, 0.03, 0, g); dat(hop(0.7, 0.05, 0.5, '#3a2a20', 0.02), 1.3, 0.03, 0, g);
    g.rotation.y = 0.3; g.scale.setScalar(1.3); dat(g, oX(-3) - 0.2, 0, oZ(-3) - 0.25); }
  const texDung = veTex(640, 360, () => {});
  function veDung(pt, viec) { const { g, c } = texDung.userData, w = c.width, h = c.height; g.fillStyle = '#14171c'; g.fillRect(0, 0, w, h);
    const co = pt != null && pt < 100;
    ['#35b874', '#e8a23a', '#6aa8f0', '#e0434e'].forEach((m, i) => { g.fillStyle = m; g.globalAlpha = co ? 0.9 : 0.35; let x = 24; hat = 31 + i;
      while (x < w - 60) { const l = 40 + ngau() * 110; g.fillRect(x, 150 + i * 44, l, 30); x += l + 8 + ngau() * 30; } });
    g.globalAlpha = 1; g.fillStyle = '#ece8e1'; g.font = '700 30px BVP, sans-serif'; g.textAlign = 'left';
    g.fillText(co ? String(viec || 'Đang dựng').slice(0, 30) : 'Máy dựng sẵn sàng', 24, 52);
    g.fillStyle = '#2a2f37'; g.fillRect(24, 84, w - 48, 22); if (co) { g.fillStyle = '#35b874'; g.fillRect(24, 84, (w - 48) * pt / 100, 22); g.fillStyle = '#ece8e1'; g.font = '700 24px BVP'; g.textAlign = 'right'; g.fillText(Math.round(pt) + '%', w - 24, 52); }
    texDung.needsUpdate = true; }
  veDung(null);
  const tu = new THREE.Group(), denTu = [];
  { dat(hop(1.0, 2.1, 0.8, '#2b2f36', 0.06), 0, 1.05, 0, tu);
    for (let r = 0; r < 7; r++) for (let k = 0; k < 4; k++) { const l = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.05, 0.02), new THREE.MeshBasicMaterial({ color: 0x35b874 })); dat(l, -0.3 + k * 0.2, 0.4 + r * 0.24, 0.41, tu); denTu.push(l); }
    tu.rotation.y = -0.3; tu.scale.setScalar(1.25); dat(tu, oX(4) + 0.35, 0, oZ(-3) + 0.05);
    const g = new THREE.Group(); dat(hop(2.5, 1.5, 0.1, '#23262b', 0.06), 0, 1.6, 0, g); dat(tam(2.34, 1.32, texDung), 0, 1.6, 0.056, g);
    dat(hop(0.1, 0.9, 0.1, '#23262b', 0.03), 0, 0.45, 0, g); dat(tru(0.5, 0.55, 0.06, '#23262b', 24), 0, 0.03, 0, g);
    g.rotation.y = -0.12; g.scale.setScalar(1.3); dat(g, oX(3) - 0.5, 0, oZ(-3) + 0.1); }

  /* ---------- phòng tranh: ảnh bìa các video đã làm, treo lơ lửng ---------- */
  const taiAnh = new THREE.TextureLoader();
  bia.slice(0, 4).forEach((u, i) => { const g = new THREE.Group(); dat(hop(1.02, 1.76, 0.07, '#2a1c14', 0.03), 0, 0, 0, g);
    const t = taiAnh.load(u, () => { canVe = 3; }); t.colorSpace = THREE.SRGBColorSpace; dat(tam(0.92, 1.635, t), 0, 0, 0.04, g);
    g.rotation.y = 0.62; g.scale.setScalar(1.55); noi(dat(g, -10.2 + i * 0.1, 2.6 - (i % 2) * 0.7, -6.0 + i * 2.3, scene), 0.12, 0.5); });

  /* ---------- nhân viên ---------- */
  const tram = {};
  const vom = (tl, k = 1.07) => new THREE.SphereGeometry(0.25 * k, 22, 12, 0, Math.PI * 2, 0, tl);
  function toc(kieu, mau) { const g = new THREE.Group(), v = (tl, k) => { const m = bong(new THREE.Mesh(vom(tl, k), M(mau))); m.rotation.x = -0.42; g.add(m); return m; };
    if (kieu === 'ngan') v(1.45); else if (kieu === 'dinh') v(1.22, 1.05);
    else if (kieu === 'vuot') { v(1.42); const q = cau(0.12, mau, 12, 8); q.scale.set(1.5, 0.75, 1.1); dat(q, 0.03, 0.2, 0.13, g); }
    else if (kieu === 'roi') { v(1.5); [[-0.1, 0.24, 0.06], [0.08, 0.26, 0.02], [0, 0.25, -0.1], [0.14, 0.2, 0.1], [-0.15, 0.2, -0.04]].forEach(p => dat(cau(0.075, mau, 8, 6), ...p, g)); }
    else if (kieu === 'bui') { v(1.5); dat(cau(0.115, mau, 12, 8), 0, 0.31, -0.07, g); }
    else if (kieu === 'mu') { v(1.4); const b = cau(0.27, '#d5303d', 16, 10); b.scale.set(1.1, 0.36, 1.1); b.rotation.z = 0.22; dat(b, 0.03, 0.21, 0, g); dat(cau(0.035, '#d5303d', 8, 6), -0.02, 0.32, 0, g); }
    else if (kieu === 'dai') { v(1.6); dat(hop(0.46, 0.52, 0.16, mau, 0.08), 0, -0.2, -0.17, g); dat(vien(0.075, 0.3, mau), -0.22, -0.16, -0.03, g); dat(vien(0.075, 0.3, mau), 0.22, -0.16, -0.03, g); }
    else if (kieu === 'bob') { v(1.6); const b = cau(0.275, mau, 16, 10); b.scale.set(1, 0.92, 0.7); dat(b, 0, -0.07, -0.1, g); dat(vien(0.07, 0.12, mau), -0.225, -0.1, 0, g); dat(vien(0.07, 0.12, mau), 0.225, -0.1, 0, g); }
    return g; }
  function taoNguoi(id, mau) { const [kieu, da_, kinh, mauToc] = DANG[id] || DANG['truong-nhom'], g = new THREE.Group();
    const than = dat(vien(0.24, 0.34, mau), 0, 0.88, 0, g);
    if (id === 'truong-nhom' || id === 'dai-ca') { dat(hop(0.2, 0.2, 0.04, '#ffffff', 0.02), 0, 1.06, 0.215, g).rotation.x = -0.2; dat(hop(0.06, 0.26, 0.03, '#1c1a18', 0.01), 0, 0.95, 0.24, g).rotation.x = -0.1; }
    const dau = new THREE.Group(); dat(dau, 0, 1.44, 0, g);
    dau.add(cau(0.25, da_)); dau.add(toc(kieu, mauToc));
    const den_ = new THREE.MeshBasicMaterial({ color: 0x1c1a18 });
    for (const x of [-0.088, 0.088]) dat(new THREE.Mesh(new THREE.SphereGeometry(0.028, 10, 8), den_), x, 0.01, 0.233, dau);
    const mieng = new THREE.Mesh(new THREE.TorusGeometry(0.055, 0.011, 6, 14, Math.PI), den_); mieng.rotation.z = Math.PI; dat(mieng, 0, -0.065, 0.236, dau);
    for (const x of [-0.13, 0.13]) dat(cau(0.035, '#f2a8a0', 8, 6), x, -0.05, 0.2, dau).scale.z = 0.4;      // má hồng
    if (kinh) { for (const x of [-0.088, 0.088]) dat(new THREE.Mesh(new THREE.TorusGeometry(0.062, 0.011, 6, 20), den_), x, 0.01, 0.246, dau); dat(new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.012, 0.012), den_), 0, 0.012, 0.25, dau); }
    const tay = [-1, 1].map(s => { const t = new THREE.Group(); dat(t, s * 0.27, 0.98, 0.05, g); const c = vien(0.07, 0.26, mau); c.position.y = -0.17; t.add(c); dat(cau(0.07, da_, 10, 8), 0, -0.36, 0, t); t.rotation.x = -1.15; t.rotation.z = s * 0.12; return t; });
    return { g, than, dau, tay }; }
  function taoMay(mau) { const g = new THREE.Group();
    dat(tru(0.24, 0.32, 0.28, '#3a3f47', 18), 0, 0.14, 0, g); const than = dat(hop(0.52, 0.55, 0.42, '#d7dde6', 0.1), 0, 0.72, 0, g);
    dat(hop(0.2, 0.12, 0.02, mau, 0.02), 0, 0.74, 0.215, g);
    const dau = new THREE.Group(); dat(dau, 0, 1.3, 0, g); dau.add(hop(0.6, 0.42, 0.44, '#d7dde6', 0.12)); dat(hop(0.46, 0.25, 0.03, '#23262b', 0.05), 0, 0, 0.215, dau);
    const mat = new THREE.MeshBasicMaterial({ color: 0x6fe0a0 }); for (const x of [-0.1, 0.1]) dat(new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 8), mat), x, 0.01, 0.228, dau);
    dat(tru(0.015, 0.015, 0.2, '#8b95a5', 6), 0, 0.3, 0, dau); dat(cau(0.05, '#d5303d', 10, 8), 0, 0.42, 0, dau);
    const tay = [-1, 1].map(s => { const t = new THREE.Group(); dat(t, s * 0.33, 0.9, 0.05, g); const c = hop(0.1, 0.36, 0.1, '#aab3c0', 0.04); c.position.y = -0.16; t.add(c); t.rotation.x = -1.0; return t; });
    return { g, than, dau, tay, mat }; }

  for (const m of doi) { const v = VT[m.id]; if (!v) continue;
    const g = new THREE.Group(), sep = m.id === 'dai-ca', may = m.id === 'may-dung', TL = 1.32, x = oX(v[0]), z = oZ(v[1]) - 0.45;
    // ô sáng dưới chân: màu riêng của người đó, đổi theo trạng thái
    const o = new THREE.Mesh(new RoundedBoxGeometry(O - 0.16, 0.05, O - 0.16, 2, 0.02), new THREE.MeshLambertMaterial({ color: m.mau, emissive: m.mau, emissiveIntensity: 0.15, transparent: true, opacity: 0.55 }));
    o.receiveShadow = true; dat(o, x, 0.012, oZ(v[1]));
    // ghế
    const ghe = new THREE.Group(), mauGhe = sep ? '#8c2f2a' : '#3a3f47';
    if (!may) { dat(hop(0.52, 0.09, 0.5, mauGhe, 0.04), 0, 0.47, 0, ghe); dat(hop(0.52, sep ? 0.95 : 0.62, 0.09, mauGhe, 0.04), 0, sep ? 0.98 : 0.83, -0.27, ghe); dat(tru(0.04, 0.04, 0.4, '#23262b', 8), 0, 0.24, 0, ghe); dat(tru(0.27, 0.3, 0.05, '#23262b', 16), 0, 0.03, 0, ghe); g.add(ghe); }
    // bàn
    const rong = sep ? 1.75 : 1.5, mauBan = sep ? '#7a5236' : '#ead4b0', mauChan = sep ? '#4a2f20' : '#fbf7ef';
    dat(hop(rong, 0.07, 0.74, mauBan, 0.03), 0, 0.745, 0.74, g);
    dat(hop(0.06, 0.71, 0.64, mauChan, 0.02), -rong / 2 + 0.07, 0.355, 0.74, g); dat(hop(0.06, 0.71, 0.64, mauChan, 0.02), rong / 2 - 0.07, 0.355, 0.74, g);
    dat(hop(rong - 0.14, 0.42, 0.035, mauChan, 0.015), 0, 0.5, 1.05, g); dat(hop(0.34, 0.09, 0.02, m.mau, 0.02), -rong / 2 + 0.32, 0.62, 1.072, g);
    // máy tính xách tay: nắp quay về phía máy quay, chấm tròn sáng khi đang làm
    dat(hop(0.44, 0.026, 0.3, '#c9ced6', 0.012), 0, 0.794, 0.68, g);
    const nap = new THREE.Group(); dat(nap, 0, 0.805, 0.83, g); const mNap = hop(0.44, 0.3, 0.02, '#c9ced6', 0.01); mNap.position.y = 0.15; nap.add(mNap);
    const cham = new THREE.Mesh(new THREE.CircleGeometry(0.05, 20), new THREE.MeshBasicMaterial({ color: 0x8b95a5 })); dat(cham, 0, 0.16, 0.0115, nap); nap.rotation.x = 0.28;
    dat(tru(0.06, 0.05, 0.11, sep ? '#e8c36a' : '#ffffff', 12), rong / 2 - 0.28, 0.835, 0.6, g);                       // cốc
    // đồ nghề riêng theo vị trí công việc
    const giay = (px, n) => { for (let i = 0; i < n; i++) dat(hop(0.3, 0.012, 0.4, i % 2 ? '#ffffff' : '#f4ecdc', 0.004), px + ngau() * 0.02, 0.787 + i * 0.013, 0.72, g).rotation.y = (ngau() - 0.5) * 0.3; };
    if (m.id === 'bien-kich') giay(-0.48, 7);
    if (m.id === 'kiem-duyet') { giay(-0.48, 4); const but = tru(0.012, 0.012, 0.24, '#d5303d', 6); but.rotation.z = Math.PI / 2; but.rotation.y = 0.5; dat(but, -0.46, 0.85, 0.72, g); }
    if (m.id === 'len-chu-de') { dat(tru(0.07, 0.09, 0.04, '#3a2a20', 12), -0.52, 0.8, 0.6, g); dat(tru(0.012, 0.012, 0.3, '#3a2a20', 6), -0.52, 0.95, 0.6, g);
      const bd = new THREE.Mesh(new THREE.SphereGeometry(0.085, 14, 10), new THREE.MeshBasicMaterial({ color: 0xffd766 })); dat(bd, -0.52, 1.16, 0.6, g); }   // "bóng đèn ý tưởng"
    if (m.id === 'truong-nhom') { dat(tru(0.012, 0.012, 0.32, '#8b95a5', 6), -0.5, 0.94, 0.62, g); dat(hop(0.2, 0.13, 0.01, '#d5303d', 0.004), -0.4, 1.03, 0.62, g); }      // cờ nhỏ
    if (sep) { dat(tru(0.09, 0.11, 0.04, '#3a2a20', 14), -0.55, 0.8, 0.62, g); dat(tru(0.03, 0.05, 0.14, '#e8c36a', 10), -0.55, 0.89, 0.62, g); dat(cau(0.075, '#e8c36a', 12, 10), -0.55, 1.01, 0.62, g); }   // cúp vàng
    if (m.id === 'hoa-si') { const gv = new THREE.Group(); for (const [a, b] of [[-0.3, 0.12], [0.3, 0.12], [0, -0.3]]) { const c = tru(0.02, 0.02, 1.5, '#6b4a33', 6); c.position.set(a * 0.6, 0.72, b * 0.6); c.rotation.z = -a * 0.35; c.rotation.x = b * 0.6; gv.add(c); }
      const tex = veTex(256, 320, (c2, w, h) => { c2.fillStyle = '#fffdf8'; c2.fillRect(0, 0, w, h); hat = 3; for (let i = 0; i < 9; i++) { c2.strokeStyle = ['#d5303d', '#e8a23a', '#3f9a68', '#3d5a80'][i % 4]; c2.lineWidth = 14 + ngau() * 16; c2.lineCap = 'round'; c2.beginPath(); c2.moveTo(ngau() * w, ngau() * h); c2.quadraticCurveTo(ngau() * w, ngau() * h, ngau() * w, ngau() * h); c2.stroke(); } });
      dat(hop(0.74, 0.92, 0.04, '#f4ecdc', 0.01), 0, 1.15, 0.1, gv).rotation.x = -0.14; const tr = tam(0.68, 0.86, tex); tr.rotation.x = -0.14; dat(tr, 0, 1.15, 0.125, gv); gv.rotation.y = -0.35; dat(gv, 1.3, 0, 0.5, g); }
    if (m.id === 'dong-goi') { dat(hop(0.52, 0.42, 0.52, '#cfa670', 0.02), -1.2, 0.21, 0.75, g); dat(hop(0.44, 0.34, 0.44, '#d9b47f', 0.02), -1.16, 0.59, 0.73, g).rotation.y = 0.4; dat(hop(0.36, 0.3, 0.36, '#cfa670', 0.02), -1.25, 0.15, 1.3, g).rotation.y = -0.3; }
    if (m.id === 'phan-tich') { const tex = veTex(320, 240, (c2, w, h) => { c2.fillStyle = '#fffdf8'; c2.fillRect(0, 0, w, h); [0.35, 0.5, 0.42, 0.7, 0.62, 0.9].forEach((v2, i) => { c2.fillStyle = i === 5 ? '#d5303d' : '#3d5a80'; c2.fillRect(28 + i * 46, h - 24 - v2 * 180, 30, v2 * 180); }); });
      const gv = new THREE.Group(); dat(hop(0.95, 0.72, 0.05, '#2a1c14', 0.02), 0, 1.3, 0, gv); dat(tam(0.87, 0.64, tex), 0, 1.3, 0.03, gv); dat(hop(0.06, 0.95, 0.06, '#2a1c14', 0.02), 0, 0.48, 0, gv); dat(tru(0.3, 0.33, 0.05, '#2a1c14', 16), 0, 0.03, 0, gv); gv.rotation.y = -0.45; dat(gv, 1.25, 0, 0.3, g); }
    // người (hoặc robot)
    const n = may ? taoMay(m.mau) : taoNguoi(m.id, m.mau); if (sep) n.g.scale.setScalar(1.06); g.add(n.g);
    // vùng bấm
    const bam = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.9, 1.7), new THREE.MeshBasicMaterial({ visible: false })); bam.userData.id = m.id; dat(bam, 0, 0.95, 0.4, g);
    g.scale.setScalar(TL); dat(g, x, 0, z);
    // nhãn tên + vị trí công việc (HTML, luôn nét)
    const nhan = document.createElement('button'); nhan.className = 'nhan3d'; nhan.dataset.id = m.id; nhan.dataset.tt = 'off';
    nhan.innerHTML = `<span class="bong"></span><span class="ten"><b></b><i></i></span>`; nhan.querySelector('b').textContent = m.ten; nhan.querySelector('i').textContent = m.chuc_danh;
    nhan.onclick = () => chon(m.id); lop.append(nhan);
    tram[m.id] = { id: m.id, g, o, n, nap, cham, ghe, bam, nhan, tt: '', pha: ngau() * 6.28, dinh: new THREE.Vector3(x, (may ? 1.92 : sep ? 1.98 : 1.86) * TL, z), mau: new THREE.Color(m.mau) };
  }

  /* ---------- sợi dây điều phối: nối anh Hải với người đang làm ---------- */
  const day = {};
  function capNhatDay() { const h = tram['truong-nhom']; if (!h) return;
    for (const t of Object.values(tram)) { const can = t.tt === 'lam' && t.id !== 'truong-nhom' && t.id !== 'dai-ca';
      if (can && !day[t.id]) { const a = h.dinh.clone().setY(2.1), b = t.dinh.clone().setY(2.1), giua = a.clone().lerp(b, 0.5).setY(4.4 + a.distanceTo(b) * 0.14);
        const m = new THREE.Mesh(new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(a, giua, b), 40, 0.03, 6), new THREE.MeshBasicMaterial({ color: 0x35b874, transparent: true, opacity: 0.8 })); dao.add(m); day[t.id] = m; }
      else if (!can && day[t.id]) { dao.remove(day[t.id]); day[t.id].geometry.dispose(); delete day[t.id]; } } }

  /* ---------- ánh sáng, bụi sáng ---------- */
  const hemi = new THREE.HemisphereLight(0xfff4e0, 0xcdb89c, 1); scene.add(hemi);
  const nang = new THREE.DirectionalLight(0xfff0dc, 1); nang.position.set(9, 16, 11); nang.castShadow = true; nang.shadow.mapSize.set(2048, 2048);
  Object.assign(nang.shadow.camera, { left: -13, right: 13, top: 11, bottom: -11, near: 2, far: 45 }); nang.shadow.bias = -0.0004; nang.shadow.normalBias = 0.03; nang.shadow.radius = 5; scene.add(nang);
  const N = 150, viTri = new Float32Array(N * 3); for (let i = 0; i < N; i++) { viTri[i * 3] = (ngau() - 0.5) * 34; viTri[i * 3 + 1] = -3 + ngau() * 11; viTri[i * 3 + 2] = (ngau() - 0.5) * 26; }
  const hinhBui = new THREE.BufferGeometry(); hinhBui.setAttribute('position', new THREE.BufferAttribute(viTri, 3));
  const vlBui = new THREE.PointsMaterial({ color: 0xffffff, size: 0.09, transparent: true, opacity: 0.7, depthWrite: false, sizeAttenuation: true });
  const bui = new THREE.Points(hinhBui, vlBui); scene.add(bui);

  function chuDe(dem) { toi = !!dem; el.classList.toggle('dem', toi);
    if (toi) { hemi.color.set(0x7f95c4); hemi.groundColor.set(0x241f24); hemi.intensity = 1.05; nang.color.set(0xa9bdf0); nang.intensity = 1.25; renderer.toneMappingExposure = 0.95; vlBui.color.set(0xffe9a8); vlBui.opacity = 0.95; vlBui.size = 0.12; }
    else { hemi.color.set(0xfff4e0); hemi.groundColor.set(0xcdb89c); hemi.intensity = 1.55; nang.color.set(0xfff0dc); nang.intensity = 3.1; renderer.toneMappingExposure = 1.0; vlBui.color.set(0xffffff); vlBui.opacity = 0.55; vlBui.size = 0.08; }
    for (const d of den) { d.chup.material.emissiveIntensity = toi ? 1.6 : 0.1; d.pl.intensity = toi ? 26 : 0; }
    ma.userData.vl.emissiveIntensity = toi ? 0.7 : 0.25;
    for (const t of Object.values(tram)) datTT(t, t.tt, true);
    renderer.shadowMap.needsUpdate = true; canVe = 3; }

  /* ---------- trạng thái ---------- */
  function datTT(t, tt, ep) { if (t.tt === tt && !ep) return; t.tt = tt; const vang = tt === 'off';
    t.n.g.visible = !vang; t.nap.rotation.x = vang ? -Math.PI / 2 + 0.02 : 0.28; if (t.ghe) t.ghe.rotation.y = vang ? 0.7 : 0;
    const mauO = tt === 'lam' ? new THREE.Color(MAU_TT.lam) : tt === 'cho' ? new THREE.Color(MAU_TT.cho) : tt === 'loi' ? new THREE.Color(MAU_TT.loi) : t.mau;
    t.o.material.color.copy(mauO); t.o.material.emissive.copy(mauO); t.o.material.opacity = vang ? 0.18 : tt === 'onl' ? 0.5 : 0.9;
    t.o.material.emissiveIntensity = vang ? 0 : tt === 'onl' ? (toi ? 0.35 : 0.12) : (toi ? 1.3 : 0.55);
    t.cham.material.color.set(tt === 'lam' ? 0x35b874 : tt === 'cho' ? 0xe8a23a : tt === 'loi' ? 0xe0434e : 0x8b95a5);
    if (t.n.mat) t.n.mat.color.set(tt === 'lam' ? 0x6fe0a0 : tt === 'loi' ? 0xe0434e : 0x9fb0c4);
    t.nhan.dataset.tt = tt; capNhatDay(); renderer.shadowMap.needsUpdate = true; }
  function trangThai(id, tt, viec) { const t = tram[id]; if (!t) return; datTT(t, tt); const b = t.nhan.firstChild; if (b.textContent !== (viec || '')) b.textContent = viec || ''; }

  /* ---------- thư bay giữa hai người ---------- */
  const thu = [];
  function bayThu(a, b) { const A = tram[a], B = tram[b]; if (!A || !B || !dangChay) return;
    const g = new THREE.Group(); g.add(hop(0.42, 0.28, 0.03, '#ffffff', 0.012)); const niem = new THREE.Mesh(new THREE.CircleGeometry(0.06, 14), new THREE.MeshBasicMaterial({ color: 0xd5303d })); niem.position.z = 0.017; g.add(niem);
    scene.add(g); thu.push({ g, a: A.dinh.clone(), b: B.dinh.clone(), t: 0 }); }

  /* ---------- máy quay: kéo để xoay, tự trở về ---------- */
  const TAM = new THREE.Vector3(-0.2, 1.0, -0.4), GOC0 = { az: 0.5, el: 0.56 };
  let az = GOC0.az, el_ = GOC0.el, azM = az, elM = el_, kc = 30, w = 0, h = 0, canVe = 3, dangChay = false, hienThi = true, raf = 0, luc = 0, T = 0;
  function datMay() { const c = Math.cos(el_); cam.position.set(TAM.x + kc * Math.sin(az) * c, TAM.y + kc * Math.sin(el_), TAM.z + kc * Math.cos(az) * c); cam.lookAt(TAM); canVe = Math.max(canVe, 1); }
  function kichThuoc() { w = el.clientWidth; h = el.clientHeight; if (!w || !h) return; renderer.setSize(w, h, false); cam.aspect = w / h;
    const tanN = Math.tan(cam.fov * Math.PI / 360), rong = cam.aspect < 1.2 ? 19.5 : 22.4, cao = 11.6; kc = Math.max(rong / (2 * tanN * cam.aspect), cao / (2 * tanN)); cam.updateProjectionMatrix(); datMay(); veNgay(); }
  new ResizeObserver(kichThuoc).observe(el);
  let keo = null, daKeo = false;
  const cv = renderer.domElement, tia = new THREE.Raycaster(), chuot = new THREE.Vector2(), vungBam = Object.values(tram).map(t => t.bam);
  const trung = e => { const r = cv.getBoundingClientRect(); chuot.set((e.clientX - r.left) / r.width * 2 - 1, -(e.clientY - r.top) / r.height * 2 + 1); tia.setFromCamera(chuot, cam); return tia.intersectObjects(vungBam, false)[0]?.object.userData.id; };
  cv.addEventListener('pointerdown', e => { keo = { x: e.clientX, y: e.clientY, az: azM, el: elM }; daKeo = false; cv.setPointerCapture(e.pointerId); });
  cv.addEventListener('pointermove', e => { if (keo) { const dx = e.clientX - keo.x, dy = e.clientY - keo.y; if (Math.abs(dx) + Math.abs(dy) > 5) daKeo = true;
      azM = Math.min(1.5, Math.max(-0.6, keo.az - dx * 0.004)); elM = Math.min(1.15, Math.max(0.3, keo.el + dy * 0.004)); el.classList.add('keo'); }
    else { const id = trung(e); cv.style.cursor = id ? 'pointer' : ''; for (const t of Object.values(tram)) t.nhan.classList.toggle('ro', t.id === id); } });
  const tha = e => { if (keo && !daKeo) { const id = trung(e); if (id) chon(id); } keo = null; el.classList.remove('keo'); };
  cv.addEventListener('pointerup', tha); cv.addEventListener('pointercancel', () => { keo = null; el.classList.remove('keo'); });
  function xoayVe() { azM = GOC0.az; elM = GOC0.el; }

  /* ---------- vòng vẽ ---------- */
  const v3 = new THREE.Vector3();
  function chieuNhan() { for (const t of Object.values(tram)) { v3.copy(t.dinh).project(cam); const x = (v3.x * 0.5 + 0.5) * w, y = (-v3.y * 0.5 + 0.5) * h; t.nhan.style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px) translate(-50%,-100%)`; t.nhan.style.zIndex = String(1000 - Math.round(v3.z * 1000) + (t.tt === 'lam' ? 50 : 0)); } }
  function ve(now) { raf = requestAnimationFrame(ve); if (now - luc < 31) return; const dt = Math.min(0.1, (now - luc) / 1000); luc = now; T += dt;
    // máy quay trôi về góc đích, kèm đung đưa rất nhẹ cho cảnh có hồn
    const dich = azM + (keo ? 0 : Math.sin(T * 0.25) * 0.035); if (Math.abs(dich - az) + Math.abs(elM - el_) > 0.0004) { az += (dich - az) * Math.min(1, dt * 7); el_ += (elM - el_) * Math.min(1, dt * 7); datMay(); }
    dao.position.y = Math.sin(T * 0.5) * 0.06;
    for (const f of troi) { f.m.position.y = f.y + Math.sin(T * f.toc + f.pha) * f.bien; if (f.xoay) f.m.rotation.y += dt * 0.08; }
    bui.rotation.y = T * 0.012;
    for (const t of Object.values(tram)) { if (t.tt === 'off') continue; const n = t.n, p = t.pha;
      if (t.tt === 'lam') { n.tay[0].rotation.x = -1.15 + Math.sin(T * 15 + p) * 0.1; n.tay[1].rotation.x = -1.15 + Math.sin(T * 15 + p + 2) * 0.1; n.dau.rotation.x = 0.1 + Math.sin(T * 2 + p) * 0.03; n.dau.rotation.y = Math.sin(T * 0.8 + p) * 0.08;
        t.o.material.opacity = 0.75 + Math.sin(T * 4 + p) * 0.2; }
      else { n.tay[0].rotation.x = n.tay[1].rotation.x = -1.15; n.dau.rotation.x = Math.sin(T * 0.9 + p) * 0.04; n.dau.rotation.y = Math.sin(T * 0.45 + p) * 0.35;
        if (t.tt === 'cho') t.o.material.opacity = 0.65 + Math.sin(T * 2.5) * 0.25; }
      n.than.scale.y = 1 + Math.sin(T * 1.6 + p) * 0.012; if (n.mat) n.g.position.y = 0.06 + Math.sin(T * 1.8) * 0.04; }
    const mayLam = tram['may-dung']?.tt === 'lam'; denTu.forEach((l, i) => { l.visible = mayLam ? Math.sin(T * (3 + (i % 5)) + i) > -0.2 : i % 4 === 0; });
    for (const k in day) day[k].material.opacity = 0.55 + Math.sin(T * 5) * 0.3;
    for (let i = thu.length - 1; i >= 0; i--) { const u = thu[i]; u.t += dt / 1.3; if (u.t >= 1) { scene.remove(u.g); thu.splice(i, 1); continue; }
      const e = u.t * u.t * (3 - 2 * u.t); u.g.position.lerpVectors(u.a, u.b, e); u.g.position.y += 0.4 + Math.sin(Math.PI * e) * 1.6; u.g.quaternion.copy(cam.quaternion); u.g.scale.setScalar(Math.min(1, Math.sin(Math.PI * u.t) * 4)); }
    if (canVe > 0) { chieuNhan(); canVe--; }
    renderer.render(scene, cam); }
  function veNgay() { if (!w || !h) return; chieuNhan(); renderer.shadowMap.needsUpdate = true; renderer.render(scene, cam); }
  function chay(b) { dangChay = !!b; const nen = dangChay && hienThi && !document.hidden; if (nen && !raf) { luc = performance.now() - 40; canVe = 3; veNgay(); raf = requestAnimationFrame(ve); } else if (!nen && raf) { cancelAnimationFrame(raf); raf = 0; } }
  new IntersectionObserver(es => { hienThi = es[0].isIntersecting; chay(dangChay); }).observe(el);
  document.addEventListener('visibilitychange', () => chay(dangChay));

  chuDe(toi);
  return { el, trangThai, bayThu, chuDe, chay, xoayVe,
    giaiDoan(i) { if (i !== buocNay) { buocNay = i; veBang(); } },
    tienDo(pt, viec) { veDung(pt, viec); } };
}
