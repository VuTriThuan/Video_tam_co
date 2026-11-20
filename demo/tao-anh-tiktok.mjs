// Sinh 4 ảnh thống kê TikTok MẪU (24 giờ đầu) để quay demo. Số liệu lấy từ file cấu hình JSON.
// Chạy: node demo/tao-anh-tiktok.mjs demo/so-lieu/<slug>.json demo/so-lieu-tiktok-<slug>
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const GOC = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const C = JSON.parse(readFileSync(process.argv[2], 'utf8'));
const RA = resolve(process.argv[3]);
mkdirSync(RA, { recursive: true });

const so = (x, tp = 1) => Number(x).toLocaleString('vi-VN', { minimumFractionDigits: tp, maximumFractionDigits: tp });
const nghin = x => Number(x).toLocaleString('vi-VN');
const gioPhut = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
const font = w => `url(file://${GOC}/fonts/BeVietnamPro-${w}.ttf)`;
const bia = C.anh_bia && existsSync(resolve(GOC, C.anh_bia)) ? `file://${resolve(GOC, C.anh_bia)}` : null;

const CSS = `
@font-face{font-family:BV;src:${font('Regular')};font-weight:400}
@font-face{font-family:BV;src:${font('Medium')};font-weight:500}
@font-face{font-family:BV;src:${font('Bold')};font-weight:700}
*{box-sizing:border-box;margin:0;padding:0}
body{width:1080px;height:2340px;background:#000;color:#fff;font-family:BV,sans-serif;overflow:hidden}
.sb{display:flex;justify-content:space-between;padding:44px 60px 0;font-size:38px;font-weight:500}
.sb b{font-weight:700}
.top{display:flex;align-items:center;gap:40px;padding:70px 60px 0}
.top i{font-style:normal;font-size:60px;line-height:1}
.top h1{font-size:52px;font-weight:700}
.tabs{display:flex;gap:56px;padding:56px 60px 0;font-size:38px;color:#8a8a8a;border-bottom:1px solid #222}
.tabs span{padding-bottom:26px}
.tabs .on{color:#fff;font-weight:700;border-bottom:5px solid #fff}
.vd{display:flex;gap:34px;padding:48px 60px 0}
.th{flex:none;width:170px;height:300px;border-radius:20px;overflow:hidden;background:#333}
.th img{width:100%;height:100%;object-fit:cover;display:block}
.vd h2{font-size:40px;font-weight:700;line-height:1.3}
.vd p{font-size:32px;color:#9a9a9a;margin-top:14px}
.vd .do{color:#fe2c55;font-weight:700}
.wrap{padding:0 60px}
.sec{font-size:42px;font-weight:700;margin:64px 0 26px;display:flex;justify-content:space-between;align-items:baseline}
.sec small{font-size:30px;color:#8a8a8a;font-weight:400}
.luoi{display:grid;grid-template-columns:1fr 1fr;gap:22px}
.o{background:#1c1c1c;border-radius:26px;padding:30px 32px}
.o .n{font-size:31px;color:#a3a3a3}
.o .s{font-size:64px;font-weight:700;margin-top:10px;letter-spacing:-1px}
.o .t{font-size:28px;margin-top:6px;color:#25c16f}
.o .t.xuong{color:#fe2c55}
.bang{background:#1c1c1c;border-radius:26px;padding:12px 36px}
.d{display:flex;justify-content:space-between;align-items:center;padding:30px 0;font-size:36px;border-top:1px solid #2a2a2a}
.d:first-child{border-top:0}
.d span{color:#b5b5b5}
.d b{font-weight:700}
.d small{color:#8a8a8a;font-weight:400;font-size:28px}
.thanh{height:16px;border-radius:8px;background:#2e2e2e;margin-top:14px;overflow:hidden}
.thanh i{display:block;height:100%;background:#fe2c55;border-radius:8px}
.thanh.xanh i{background:#20d5ec}
.dt{padding:24px 0;border-top:1px solid #2a2a2a}
.dt:first-child{border-top:0}
.dt .h{display:flex;justify-content:space-between;font-size:34px}
.dt .h span{color:#b5b5b5}
.ghi{font-size:30px;color:#8a8a8a;line-height:1.5;margin-top:22px}
.chip{display:inline-block;background:#262626;border-radius:40px;padding:16px 30px;font-size:32px;margin:0 14px 18px 0}
.chip b{color:#fe2c55;margin-left:10px}
`;

const dau = tab => `
<div class="sb"><b>9:41</b><span>5G&nbsp;&nbsp;${C.pin || 82}%</span></div>
<div class="top"><i>‹</i><h1>Phân tích video</h1></div>
<div class="tabs">${['Tổng quan', 'Người xem', 'Tương tác'].map(t => `<span class="${t === tab ? 'on' : ''}">${t}</span>`).join('')}</div>
<div class="vd"><div class="th">${bia ? `<img src="${bia}">` : ''}</div>
 <div><h2>${C.tieu_de}</h2>
 <p>Đăng: ${C.ngay_dang} · ${C.gio_dang} · ${gioPhut(C.thoi_luong)}</p><p class="do">Số liệu 24 giờ đầu</p></div></div>`;

function bieuDoGiu() {
  const T = C.thoi_luong, W = 900, H = 520, x = s => 110 + s / T * (W - 160), y = p => 24 + (100 - p) / 100 * (H - 84);
  const pts = C.giu_chan.map(([s, p]) => `${x(s).toFixed(1)},${y(p).toFixed(1)}`).join(' ');
  const luoi = [0, 25, 50, 75, 100].map(p => `<line x1="110" x2="${W - 40}" y1="${y(p)}" y2="${y(p)}" stroke="#2c2c2c" stroke-width="2"/><text x="96" y="${y(p) + 10}" fill="#8a8a8a" font-size="26" text-anchor="end">${p}%</text>`).join('');
  const truc = [0, .25, .5, .75, 1].map(k => `<text x="${x(T * k)}" y="${H - 18}" fill="#8a8a8a" font-size="26" text-anchor="middle">${gioPhut(T * k)}</text>`).join('');
  const r = C.diem_roi, rx = x(r.giay), ry = y(r.con), hopX = rx + 318 > W ? rx - 318 : rx + 18;
  return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" style="display:block;margin:0 auto">
  <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fe2c55" stop-opacity=".45"/><stop offset="1" stop-color="#fe2c55" stop-opacity="0"/></linearGradient></defs>
  ${luoi}${truc}
  <polygon points="${x(0)},${y(0)} ${pts} ${x(T)},${y(0)}" fill="url(#g)"/>
  <polyline points="${pts}" fill="none" stroke="#fe2c55" stroke-width="6" stroke-linejoin="round"/>
  <line x1="${rx}" x2="${rx}" y1="${y(100)}" y2="${y(0)}" stroke="#fff" stroke-width="2" stroke-dasharray="8 8" opacity=".6"/>
  <circle cx="${rx}" cy="${ry}" r="11" fill="#fff"/>
  <rect x="${hopX}" y="${ry - 110}" width="300" height="84" rx="14" fill="#2a2a2a"/>
  <text x="${hopX + 20}" y="${ry - 72}" fill="#fff" font-size="28" font-weight="700">${gioPhut(r.giay)} · còn ${so(r.con, 0)}%</text>
  <text x="${hopX + 20}" y="${ry - 40}" fill="#b5b5b5" font-size="24">${r.ghi}</text>
  </svg>`;
}

function cot(v, nhan, noiBat, mau, H, soTren) {
  const W = 900, mx = Math.max(...v), bw = (W - 40) / v.length;
  return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" style="display:block;margin:0 auto">
  ${v.map((n, i) => { const h = n / mx * (H - 100); return `<rect x="${20 + i * bw + 4}" y="${H - 44 - h}" width="${bw - 8}" height="${h}" rx="6" fill="${i === noiBat ? '#fe2c55' : mau}"/>`; }).join('')}
  ${nhan.map(([i, t]) => `<text x="${20 + i * bw + bw / 2}" y="${H - 8}" fill="#8a8a8a" font-size="24" text-anchor="middle">${t}</text>`).join('')}
  ${soTren ? `<text x="${20 + noiBat * bw + bw / 2}" y="${H - 44 - (H - 100) - 14}" fill="#fff" font-size="26" font-weight="700" text-anchor="middle">${nghin(v[noiBat])}</text>` : ''}
  </svg>`;
}

const thanh = (ten, pt, lop = '') => `<div class="dt"><div class="h"><span>${ten}</span><b>${so(pt)}%</b></div><div class="thanh ${lop}"><i style="width:${pt}%"></i></div></div>`;
const oSo = (ten, s, t) => `<div class="o"><div class="n">${ten}</div><div class="s">${s}</div>${t ? `<div class="t${t.startsWith('▼') ? ' xuong' : ''}">${t}</div>` : ''}</div>`;
const chip = ds => ds.map(([t, n]) => `<span class="chip">${t}<b>${n}</b></span>`).join('');

const K = C.chi_so, LX = C.luot_xem_theo_gio, gioDau = parseInt(C.gio_dang);
const nhanGio = [0, 6, 12, 18, 23].map(i => [i, `${(gioDau + i) % 24}h`]);
const dinhGio = LX.indexOf(Math.max(...LX));
const tt = C.tuong_tac, pt = n => so(n / K.luot_xem * 100, n / K.luot_xem >= .1 ? 1 : 2);

const TRANG = {
  '1-tong-quan': `${dau('Tổng quan')}<div class="wrap">
   <div class="sec">Chỉ số chính <small>so với video trước</small></div>
   <div class="luoi">
    ${oSo('Lượt xem video', so(K.luot_xem / 1000) + 'K', K.tang.luot_xem)}
    ${oSo('Tổng thời gian xem', so(K.luot_xem * K.tg_xem_tb / 3600) + ' giờ', K.tang.tong_gio)}
    ${oSo('Thời gian xem TB', so(K.tg_xem_tb) + ' giây', K.tang.tg_xem_tb)}
    ${oSo('Xem hết video', so(K.xem_het) + '%', K.tang.xem_het)}
    ${oSo('Người theo dõi mới', '+' + nghin(K.theo_doi_moi), K.tang.theo_doi_moi)}
    ${oSo('Lượt xem sau 3 giây', so(K.giu_3s) + '%', K.tang.giu_3s)}
   </div>
   <div class="sec">Tỉ lệ giữ chân người xem</div>
   <div class="o" style="padding:34px 10px 20px">${bieuDoGiu()}</div>
   <p class="ghi">${so(K.xem_het)}% người xem đã xem hết video. ${C.ghi_giu_chan}</p>
  </div>`,

  '2-luot-xem-nguon': `${dau('Tổng quan')}<div class="wrap">
   <div class="sec">Lượt xem theo giờ <small>24 giờ đầu</small></div>
   <div class="o" style="padding:30px 10px 20px">${cot(LX, nhanGio, dinhGio, '#20d5ec', 380, true)}</div>
   <p class="ghi">Đỉnh lượt xem: ${(gioDau + dinhGio) % 24}:00 – ${(gioDau + dinhGio + 1) % 24}:00, ${dinhGio} giờ sau khi đăng.</p>
   <div class="sec">Nguồn lưu lượng</div>
   <div class="bang" style="padding:6px 36px">${C.nguon.map(([t, p]) => thanh(t, p)).join('')}</div>
   <div class="sec">Từ khoá tìm kiếm</div>
   <div>${chip(C.tu_khoa.map(([t, p]) => [t, so(p, 0) + '%']))}</div>
  </div>`,

  '3-nguoi-xem': `${dau('Người xem')}<div class="wrap">
   <div class="sec">Giới tính</div>
   <div class="bang" style="padding:6px 36px">${thanh('Nữ', C.gioi_tinh[0])}${thanh('Nam', C.gioi_tinh[1], 'xanh')}</div>
   <div class="sec">Độ tuổi</div>
   <div class="bang" style="padding:6px 36px">${C.do_tuoi.map(([t, p]) => thanh(t, p)).join('')}</div>
   <div class="sec">Khu vực</div>
   <div class="bang" style="padding:6px 36px">${C.khu_vuc.map(([t, p]) => thanh(t, p, 'xanh')).join('')}</div>
  </div>`,

  '4-tuong-tac': `${dau('Tương tác')}<div class="wrap">
   <div class="sec">Tương tác <small>tỉ lệ / lượt xem</small></div>
   <div class="bang">
    ${[['Lượt thích', tt.thich], ['Bình luận', tt.binh_luan], ['Chia sẻ', tt.chia_se], ['Lượt lưu', tt.luu]].map(([t, n]) => `<div class="d"><span>${t}</span><b>${nghin(n)} <small>· ${pt(n)}%</small></b></div>`).join('')}
   </div>
   <div class="sec">Từ nổi bật trong bình luận</div>
   <div>${chip(C.tu_binh_luan.map(([t, n]) => [`"${t}"`, n]))}</div>
   <div class="sec">Người theo dõi hoạt động <small>giờ trong ngày</small></div>
   <div class="o" style="padding:30px 10px 20px">${cot(C.gio_hoat_dong, [[0, '0h'], [6, '6h'], [12, '12h'], [18, '18h'], [23, '23h']], C.gio_hoat_dong.indexOf(Math.max(...C.gio_hoat_dong)), '#3a3a3a', 300, false)}</div>
   <p class="ghi">Người theo dõi của bạn hoạt động nhiều nhất lúc ${C.gio_hoat_dong.indexOf(Math.max(...C.gio_hoat_dong))}:00 – ${C.gio_hoat_dong.indexOf(Math.max(...C.gio_hoat_dong)) + 1}:00.</p>
  </div>`,
};

const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({ viewport: { width: 1080, height: 2340 }, deviceScaleFactor: 1 });
for (const [ten, body] of Object.entries(TRANG)) {
  const f = `${RA}/.tam-${ten}.html`;
  writeFileSync(f, `<!doctype html><meta charset="utf-8"><style>${CSS}</style><body>${body}</body>`);
  await page.goto('file://' + f);
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: `${RA}/${ten}.png` });
  console.log('xong', ten);
}
await browser.close();
import('fs').then(fs => Object.keys(TRANG).forEach(t => fs.rmSync(`${RA}/.tam-${t}.html`, { force: true })));
