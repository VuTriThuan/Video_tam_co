// Sân thử khối: dựng các cảnh giả lập (không cần giọng) để xem bối cảnh / tông màu / góc máy / ngoại hình theo seed.
// Dùng: node render/thu-khoi.mjs <phong-cach> <file-canh-thu.json> <ra.jpg>
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
const GOC = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const [pc, fileCanh, ra] = process.argv.slice(2);
const thu = JSON.parse(fs.readFileSync(fileCanh, 'utf8'));
const b = await chromium.launch({ channel: 'chrome' });
const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
p.on('pageerror', e => console.error('LỖI TRANG:', e.message));
await p.goto('file://' + path.join(GOC, 'render', pc, 'video.html'));
await p.evaluate(() => window.sanSang);
const tmp = fs.mkdtempSync('/tmp/thukhoi-');
let k = 0;
for (const x of thu.canh) {
  const canh = [x], giong = 3, tl = { tong: 3.3, canh: [{ id: x.id, bat_dau: 0, giong, thoi_luong: 3.3 }] };
  await p.evaluate(d => { TC.S.canh = {}; TC.S.thuTu = []; TC.S.tl = {}; TC.khoiTao(d); TC.datPhien([d.canh[0].id]); },
    { canh, thoiLuong: tl, bienDo: { canh: { [x.id]: Array(100).fill(0.4) } }, video: { tong_mau: x.tong_mau || thu.tong_mau, seed: x.seed ?? thu.seed } });
  await p.evaluate(id => renderAt(id, 2.4), x.id);
  fs.writeFileSync(path.join(tmp, String(k++).padStart(2, '0') + '.jpg'), await p.screenshot({ type: 'jpeg', quality: 80 }));
}
await b.close();
const cot = Math.min(6, k), hang = Math.ceil(k / cot);
await new Promise(ok => spawn('ffmpeg', ['-y', '-loglevel', 'error', '-i', path.join(tmp, '%02d.jpg'), '-vf', `scale=270:-1,tile=${cot}x${hang}:padding=6:color=white`, '-frames:v', '1', '-q:v', '4', ra], { stdio: 'inherit' }).on('exit', ok));
console.log('→', ra);
