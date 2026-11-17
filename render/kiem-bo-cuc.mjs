// Máy kiểm bố cục (0 token): dựng vài khung mỗi cảnh, đo vị trí thật của khung chữ và nhân vật, báo:
//   ✗ chữ đè đầu/tay nhân vật · ✗ chữ che đạo cụ nổi · ✗ chữ đè chữ khác · ✗ chữ ra ngoài vùng an toàn (TikTok/Reels che)
//   ⚠ chữ hiện quá ngắn, không kịp đọc (dưới 0,5 giây + 0,3 giây mỗi từ)
// Cần: canh.json, thoi-luong.json, bien-do.json, video.json (sau bước đọc giọng).
// Dùng: node render/kiem-bo-cuc.mjs <phong-cach|tat-ca> [--ds c01,c05] [--ra <ten>]
//   Ảnh các khung lỗi (khung đỏ = chữ, xanh = nhân vật) ghi vào ra/<ten>/bo-cuc/. Có lỗi ✗ thì thoát mã 1.
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const GOC = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const args = process.argv.slice(2);
const lay = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const docJ = f => JSON.parse(fs.readFileSync(path.join(GOC, f), 'utf8'));
const PCS = ['bang-trang', 'truyen-tranh', 'tranh-tinh-zoom'];
const dsPC = args[0] === 'tat-ca' || !args[0] ? PCS : [args[0]];
if (dsPC.some(p => !PCS.includes(p))) { console.error('Phong cách không hợp lệ:', args[0]); process.exit(2); }

const canh = docJ('canh.json'), thoiLuong = docJ('thoi-luong.json'), bienDo = docJ('bien-do.json'), video = docJ('video.json');
const tl = Object.fromEntries(thoiLuong.canh.map(x => [x.id, x]));
const chon = (lay('--ds', '') || '').split(',').filter(Boolean);
const ds = canh.map(c => c.id).filter(id => tl[id] && (!chon.length || chon.includes(id)));
const ten = lay('--ra', video.chu_de || 'kiem');
const OUT = path.join(GOC, 'ra', ten, 'bo-cuc');

// ngưỡng (px, khung 1080×1920)
const AT = { tren: 250, duoi: 1500, trai: 72, phai: 920, du: 14, cotPhai: [760, 1500] };   // vùng an toàn như render/chung.js, cho lệch 14px
const DAU = 0.32;          // vùng "đầu + tay giơ" = 32% trên cùng khung nhân vật
const DE_DAU = { s: 1200, h: 18 };  // chữ đè vùng đầu: diện tích ≥1200px² và cao ≥18px → lỗi
const DE_CHU = 0.12;       // chữ đè chữ khác ≥12% diện tích chữ nhỏ hơn → lỗi
const DE_DC = 0.25;        // chữ che ≥25% một đạo cụ nổi → lỗi

// chạy trong trang: đo khung chữ, nhân vật, các chữ khác
function doKhung() {
  const r = e => { const b = e.getBoundingClientRect(); return { x: b.left, y: b.top, w: b.width, h: b.height }; };
  const k = document.getElementById('khung');
  const chu = [...k.querySelectorAll('[data-kb="chu"]')].map(r).filter(b => b.w > 4 && b.h > 4);
  const nv = [...k.querySelectorAll('[data-kb="nv"]')].map(e => ({ ...r(e), vai: e.dataset.vai })).filter(b => b.w > 4 && b.h > 4);
  // đạo cụ nổi (bong bóng thoại, dấu !, đồng hồ…), bỏ bàn/laptop vì là nền
  const dc = [...k.querySelectorAll('[data-kb="dc"]')].filter(e => !['ban-hop', 'ban-lam-viec', 'laptop'].includes(e.dataset.ten))
    .map(e => ({ ...r(e), ten: e.dataset.ten })).filter(b => b.w > 4 && b.h > 4);
  const khac = [...k.querySelectorAll('text')].filter(e => !e.closest('[data-kb]') && +getComputedStyle(e).opacity !== 0)
    .map(e => ({ ...r(e), chu: e.textContent.slice(0, 24) })).filter(b => b.w > 4 && b.h > 4);
  return { chu, nv, dc, khac };
}
const giao = (a, b) => { const w = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x), h = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y); return w > 0 && h > 0 ? { w, h, s: w * h } : null; };
const soTu = s => String(s || '').trim().split(/\s+/).filter(Boolean).length;

const browser = await chromium.launch({ channel: 'chrome', args: ['--force-color-profile=srgb'] });
let soLoi = 0, soCB = 0;
const baoCao = {};
for (const pc of dsPC) {
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  page.on('pageerror', e => { console.error('LỖI TRANG:', e.message); process.exitCode = 2; });
  await page.goto('file://' + path.join(GOC, 'render', pc, 'video.html'));
  await page.evaluate(() => window.sanSang);
  await page.evaluate(d => { TC.khoiTao(d); TC.datPhien(d.ds); }, { canh, thoiLuong, bienDo, video, ds });
  const kq = baoCao[pc] = [];
  for (const id of ds) {
    const c = canh.find(x => x.id === id), D = tl[id].thoi_luong;
    if (!c.chu || c.bo_cuc === 'ket') continue;
    const tChu = c.bo_cuc === 'hook-chu-to' ? 0 : await page.evaluate(([id, D]) => TC.lich(TC.S.canh[id], D).chu, [id, D]);
    // chữ hiện đủ lâu để đọc không
    const can = 0.5 + 0.3 * soTu(c.chu), hien = D - tChu - 0.15;
    if (hien < can) kq.push({ id, muc: 'cb', loai: 'chu-ngan', noi: `chữ "${c.chu}" (${soTu(c.chu)} từ) chỉ hiện ${hien.toFixed(1)}s, nên ≥ ${can.toFixed(1)}s` });
    // 3 mốc: chữ vừa ổn định, giữa, gần cuối (trước chuyển cảnh)
    const t1 = Math.min(D - 0.2, tChu + 0.8), t3 = D - 0.2, moc = [...new Set([t1, (t1 + t3) / 2, t3].map(x => +Math.max(0, x).toFixed(2)))];
    const daBao = new Set();
    for (const t of moc) {
      await page.evaluate(([id, t]) => renderAt(id, t), [id, t]);
      const m = await page.evaluate(doKhung);
      const loiKhung = [];
      for (const b of m.chu) {
        const ra = [];
        if (b.y < AT.tren - AT.du) ra.push('trên');
        if (b.y + b.h > AT.duoi + AT.du) ra.push('dưới');
        if (b.x < AT.trai - AT.du) ra.push('trái');
        // cột nút bên phải (tim, bình luận, chia sẻ) chỉ nằm khoảng y 760–1500
        if (b.x + b.w > AT.phai + AT.du && b.y + b.h > AT.cotPhai[0] && b.y < AT.cotPhai[1]) ra.push('phải');
        if (ra.length) loiKhung.push({ loai: 'ngoai-vung', noi: `chữ lấn vùng bị che (${ra.join(', ')})`, hop: [b] });
        for (const n of m.nv) {
          const dau = { x: n.x, y: n.y, w: n.w, h: n.h * DAU }, g = giao(b, dau);
          if (g && g.s >= DE_DAU.s && g.h >= DE_DAU.h) loiKhung.push({ loai: 'de-nv', noi: `chữ đè đầu/tay nhân vật ${n.vai} (${Math.round(g.w)}×${Math.round(g.h)}px)`, hop: [b, n] });
        }
        for (const o of m.dc) {
          const g = giao(b, o);
          if (g && g.s >= DE_DC * o.w * o.h) loiKhung.push({ loai: 'de-dc', noi: `chữ che đạo cụ ${o.ten} (${Math.round(100 * g.s / (o.w * o.h))}%)`, hop: [b, o] });
        }
        for (const o of m.khac) {
          const g = giao(b, o);
          if (g && g.s >= DE_CHU * Math.min(b.w * b.h, o.w * o.h)) loiKhung.push({ loai: 'de-chu', noi: `chữ đè chữ "${o.chu}"`, hop: [b, o] });
        }
      }
      const moi = loiKhung.filter(l => !daBao.has(l.noi.replace(/\(\d+×\d+px\)/, '')));
      if (!moi.length) continue;
      fs.mkdirSync(OUT, { recursive: true });
      const anh = path.join(OUT, `${pc}-${id}-${t.toFixed(1)}s.jpg`);
      await page.evaluate(hops => {
        const svg = document.querySelector('#khung svg');
        svg.insertAdjacentHTML('beforeend', hops.map(([h, mau]) => `<rect x="${h.x}" y="${h.y}" width="${h.w}" height="${h.h}" fill="none" stroke="${mau}" stroke-width="6" stroke-dasharray="18 10"/>`).join(''));
      }, moi.flatMap(l => l.hop.map((h, i) => [h, i === 0 ? '#ff0033' : '#0066ff'])));
      await page.screenshot({ path: anh, type: 'jpeg', quality: 70 });
      for (const l of moi) { daBao.add(l.noi.replace(/\(\d+×\d+px\)/, '')); kq.push({ id, t, muc: 'loi', loai: l.loai, noi: l.noi, anh: path.relative(GOC, anh) }); }
    }
  }
  await page.close();
  const L = kq.filter(x => x.muc === 'loi'), C = kq.filter(x => x.muc === 'cb');
  soLoi += L.length; soCB += C.length;
  console.log(`${pc}: ${L.length ? `✗ ${L.length} lỗi` : '✓ không lỗi'}${C.length ? `, ⚠ ${C.length} cảnh báo` : ''}`);
  for (const x of kq) console.log(`  ${x.muc === 'loi' ? '✗' : '⚠'} ${x.id}${x.t !== undefined ? ` (${x.t}s)` : ''}: ${x.noi}${x.anh ? ` → ${x.anh}` : ''}`);
}
await browser.close();
fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, 'bao-cao.json'), JSON.stringify({ ds, loi: soLoi, canh_bao: soCB, phong_cach: baoCao }, null, 1));
console.log(soLoi ? `BỐ CỤC CHƯA ĐẠT: ${soLoi} lỗi, ${soCB} cảnh báo` : `BỐ CỤC ĐẠT${soCB ? ` (${soCB} cảnh báo)` : ''}`);
process.exit(process.exitCode || (soLoi ? 1 : 0));
