// Quay từng khung hình bằng Chrome (Playwright) → ffmpeg. Mỗi cảnh một file mp4.
// Dùng:
//   node render/quay.mjs <phong-cach> --ds c01,c02 [--ra ten] [--tu c01 --den c06]
//   node render/quay.mjs <phong-cach> --xem c01:0.5,c04:1.2,...   (contact sheet, không quay)
//   node render/quay.mjs <phong-cach> --bia [--phan n]              (ảnh bìa PNG; chuỗi: bìa phần n)
//   node render/quay.mjs <phong-cach> --ra <ten> --ds c05,c09 --sua (/sua: chỉ quay lại các cảnh nêu, giữ file cảnh khác,
//                                                                   quay.json vẫn đủ toàn bộ cảnh để ghép lại)
//   Thêm --luong N (hoặc biến TC_LUONG) để quay N cảnh cùng lúc, mỗi luồng một Chrome riêng; mặc định 3 (TC_CHROME_RIENG=0 để dùng chung).
//   Mỗi khung chỉ phụ thuộc (cảnh, t) nên quay song song ra đúng từng khung như quay lần lượt.
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const GOC = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const args = process.argv.slice(2);
const pc = args[0];
const lay = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const co = k => args.includes(k);

const canh = JSON.parse(fs.readFileSync(path.join(GOC, 'canh.json'), 'utf8'));
const thoiLuong = JSON.parse(fs.readFileSync(path.join(GOC, 'thoi-luong.json'), 'utf8'));
const bienDo = JSON.parse(fs.readFileSync(path.join(GOC, 'bien-do.json'), 'utf8'));
const tl = Object.fromEntries(thoiLuong.canh.map(x => [x.id, x]));
const video = fs.existsSync(path.join(GOC, 'video.json')) ? JSON.parse(fs.readFileSync(path.join(GOC, 'video.json'), 'utf8')) : {};
// chuỗi: --phan n → ảnh bìa dùng chữ riêng của phần n (video.chuoi.bia_phan), ghi vào <ra>/phan-n/
const phanBia = +(process.argv.includes('--phan') ? process.argv[process.argv.indexOf('--phan') + 1] : 0);
if (phanBia && video.chuoi?.bia_phan?.[phanBia - 1]) video.bia = video.chuoi.bia_phan[phanBia - 1];

let ds = (lay('--ds', '') || '').split(',').filter(Boolean);
if (!ds.length) {
  const tu = lay('--tu', canh[0].id), den = lay('--den', canh.at(-1).id);
  const i0 = canh.findIndex(c => c.id === tu), i1 = canh.findIndex(c => c.id === den);
  ds = canh.slice(i0, i1 + 1).map(c => c.id);
}
const sua = co('--sua');
const quayLai = new Set(ds);
if (sua) ds = canh.map(c => c.id);
const ten = lay('--ra', pc);
const OUT = path.join(GOC, 'ra', ten);
fs.mkdirSync(path.join(OUT, 'canh'), { recursive: true });

const browser = await chromium.launch({ channel: 'chrome', args: ['--disable-gpu-vsync', '--force-color-profile=srgb'] });
// mỗi luồng một tab riêng, nạp cùng dữ liệu và cùng phiên (để kiểu chuyển cảnh giống hệt nhau)
// mỗi luồng một Chrome riêng: chung một Chrome thì các tab tranh nhau chụp, chỉ nhanh ~1,15 lần; riêng thì ~1,7 lần (đo trên máy 4 nhân)
const CHROME_RIENG = process.env.TC_CHROME_RIENG !== '0';
async function moTrang(k = 0) {
  const br = CHROME_RIENG && k > 0 ? await chromium.launch({ channel: 'chrome', args: ['--disable-gpu-vsync', '--force-color-profile=srgb'] }) : browser;
  const p = await br.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  p.on('pageerror', e => { console.error('LỖI TRANG:', e.message); process.exitCode = 1; });
  await p.goto('file://' + path.join(GOC, 'render', pc, 'video.html'));
  await p.evaluate(() => window.sanSang);
  await p.evaluate(d => { TC.khoiTao(d); }, { canh, thoiLuong, bienDo, video });
  await p.evaluate(ds => TC.datPhien(ds), ds);
  return p;
}
const page = await moTrang();

const chup = (p = page) => p.screenshot({ type: 'jpeg', quality: 92 });

if (co('--xem')) {
  // contact sheet: các mốc id:t
  const moc = lay('--xem').split(',').map(s => s.split(':'));
  const tmp = path.join(OUT, 'xem'); fs.mkdirSync(tmp, { recursive: true });
  let k = 0;
  for (const [id, t] of moc) {
    await page.evaluate(([id, t]) => renderAt(id, +t), [id, t]);
    fs.writeFileSync(path.join(tmp, `${String(k++).padStart(2, '0')}.jpg`), await chup());
  }
  const cot = Math.min(6, moc.length), hang = Math.ceil(moc.length / cot);
  await new Promise((ok, loi) => spawn('ffmpeg', ['-y', '-loglevel', 'error', '-i', path.join(tmp, '%02d.jpg'), '-vf', `scale=300:-1,tile=${cot}x${hang}:padding=6:color=white`, '-frames:v', '1', '-q:v', '4', path.join(OUT, 'contact.jpg')], { stdio: 'inherit' }).on('exit', c => (c ? loi(new Error('ffmpeg ' + c)) : ok())));
  console.log('contact sheet →', path.relative(GOC, path.join(OUT, 'contact.jpg')));
  await browser.close(); process.exit();
}

if (co('--bia')) {
  await page.evaluate(() => (window.PHONG_CACH.bia ? window.PHONG_CACH.bia() : TC.bia()));
  const dBia = phanBia ? path.join(OUT, `phan-${phanBia}`) : OUT; fs.mkdirSync(dBia, { recursive: true });
  await page.screenshot({ path: path.join(dBia, 'anh-bia.png'), type: 'png' });
  console.log('ảnh bìa →', path.relative(GOC, path.join(dBia, 'anh-bia.png')));
  await browser.close(); process.exit();
}

// tiến độ cho Phòng điều hành (ghi thẳng vào dieu-hanh/su-kien.jsonl, 0 token). Nhãn: --nhan hoặc biến TC_NHAN.
const LOG_DH = path.join(GOC, 'dieu-hanh', 'su-kien.jsonl');
const slugDH = (() => { try { return JSON.parse(fs.readFileSync(path.join(GOC, 'du-an', 'hien-tai.json'), 'utf8')).slug; } catch { return 'chung'; } })();
const nhanDH = lay('--nhan', process.env.TC_NHAN || `Quay ${ten}`);
let ptCu = -1;
const baoDH = pt => { pt = Math.round(pt); if (pt === ptCu || (pt < 100 && pt - ptCu < 3)) return; ptCu = pt;
  try { fs.appendFileSync(LOG_DH, JSON.stringify({ ts: Date.now() / 1000, slug: slugDH, loai: 'tien-do', id: 'may-dung', phan_tram: pt, viec: nhanDH }) + '\n'); } catch {} };

// quay: khung bắt đầu/kết thúc tính theo trục thời gian cộng dồn để âm thanh khớp từng khung
const FPS = 30, moc = {};
let tong = 0;
for (const id of ds) {
  const D = tl[id].thoi_luong, f0 = Math.round(tong * FPS), f1 = Math.round((tong + D) * FPS);
  moc[id] = { f0, n: f1 - f0 }; tong += D;
}
const fileCanh = id => path.join(OUT, 'canh', `${id}.mp4`);
// --sua: cảnh không nêu mà đã có file thì giữ nguyên
const canQuay = ds.filter(id => !(sua && !quayLai.has(id) && fs.existsSync(fileCanh(id))));
const tongKhung = canQuay.reduce((a, id) => a + moc[id].n, 0);
const soLuong = parseInt(lay('--luong', process.env.TC_LUONG || ''), 10);
const LUONG = Math.max(1, Math.min(canQuay.length || 1, soLuong > 0 ? soLuong : 3));
let daQuay = 0;
const giayMay = {};
baoDH(0);
const tBatDau = Date.now();

async function quayCanh(p, id) {
  const { n } = moc[id], cuoi = fileCanh(id), tam = cuoi.replace(/\.mp4$/, '.tmp.mp4');
  const t0 = Date.now();
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
    '-vf', 'scale=in_range=pc:out_range=tv,format=yuv420p', '-color_range', 'tv', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '18', '-pix_fmt', 'yuv420p', '-r', String(FPS), '-profile:v', 'high', tam], { stdio: ['pipe', 'inherit', 'inherit'] });
  const xong = new Promise(ok => ff.on('exit', ok));
  for (let f = 0; f < n; f++) {
    await p.evaluate(([id, t]) => renderAt(id, t), [id, f / FPS]);
    const buf = await chup(p);
    if (++daQuay % 15 === 0) baoDH(daQuay / tongKhung * 99);
    if (!ff.stdin.write(buf)) await new Promise(ok => ff.stdin.once('drain', ok));
  }
  ff.stdin.end();
  const ma = await xong;
  if (ma !== 0) { console.error('ffmpeg lỗi ở', id); process.exit(1); }
  fs.renameSync(tam, cuoi);
  giayMay[id] = +((Date.now() - t0) / 1000).toFixed(1);
  console.log(`${id}: ${n} khung, ${giayMay[id]}s (${((Date.now() - t0) / n).toFixed(0)} ms/khung)`);
}

// cảnh dài quay trước để các luồng xong gần cùng lúc
const hang = [...canQuay].sort((a, b) => moc[b].n - moc[a].n);
const trang = [page, ...(await Promise.all(Array.from({ length: LUONG - 1 }, (_, k) => moTrang(k + 1))))];
await Promise.all(trang.map(async p => { for (let id = hang.shift(); id !== undefined; id = hang.shift()) await quayCanh(p, id); }));
baoDH(100);

// ghi quay.json theo đúng thứ tự cảnh, dù cảnh nào quay xong trước
const nhat = [], sfx = [];
for (const id of ds) {
  const { f0, n } = moc[id];
  const s = await page.evaluate(id => TC.sfxCanh(id), id);
  sfx.push(...s.map(e => ({ ...e, t: +(f0 / FPS + e.t).toFixed(3) })));
  nhat.push({ id, bat_dau: +(f0 / FPS).toFixed(4), so_khung: n, giay_may: giayMay[id] ?? 0 });
}
fs.writeFileSync(path.join(OUT, 'quay.json'), JSON.stringify({ phong_cach: pc, ds: nhat, sfx, tong_khung: Math.round(tong * FPS), luong: LUONG, giay_may: +((Date.now() - tBatDau) / 1000).toFixed(1) }, null, 1));
if (CHROME_RIENG) await Promise.all(trang.slice(1).map(p => p.context().browser().close()));
console.log(`XONG ${ten}: ${(Math.round(tong * FPS) / FPS).toFixed(2)}s video, ${((Date.now() - tBatDau) / 1000).toFixed(0)}s máy, ${LUONG} luồng`);
await browser.close();
