// Sinh 4 ảnh thống kê TikTok mẫu (24 giờ) cho video DARVO, dùng để quay demo.
import { chromium } from '/Users/trithuan/Desktop/video_tam_co/node_modules/playwright/index.mjs';
import { mkdirSync, writeFileSync } from 'fs';

const GOC = '/Users/trithuan/Desktop/video_tam_co';
const RA = process.argv[2];
mkdirSync(RA, { recursive: true });

const font = w => `url(file://${GOC}/fonts/BeVietnamPro-${w}.ttf)`;
const CSS = `
@font-face{font-family:BV;src:${font('Regular')};font-weight:400}
@font-face{font-family:BV;src:${font('Medium')};font-weight:500}
@font-face{font-family:BV;src:${font('Bold')};font-weight:700}
*{box-sizing:border-box;margin:0;padding:0}
body{width:1080px;height:2340px;background:#000;color:#fff;font-family:BV,sans-serif;overflow:hidden}
.sb{display:flex;justify-content:space-between;padding:44px 60px 0;font-size:38px;font-weight:500}
.sb b{font-weight:700}
.top{display:flex;align-items:center;gap:40px;padding:70px 60px 0}
.top i{font-style:normal;font-size:60px;color:#fff;line-height:1}
.top h1{font-size:52px;font-weight:700}
.tabs{display:flex;gap:56px;padding:56px 60px 0;font-size:38px;color:#8a8a8a;border-bottom:1px solid #222}
.tabs span{padding-bottom:26px}
.tabs .on{color:#fff;font-weight:700;border-bottom:5px solid #fff}
.vd{display:flex;gap:34px;padding:48px 60px 0}
.th{width:170px;height:300px;border-radius:20px;background:linear-gradient(160deg,#f4efe4,#d9cdb6);color:#1c1a18;display:flex;flex-direction:column;justify-content:flex-end;padding:18px;font-weight:700;font-size:26px;line-height:1.15}
.th small{display:block;font-size:20px;font-weight:500;color:#b3261e;margin-top:6px}
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
<div class="sb"><b>9:41</b><span>5G&nbsp;&nbsp;82%</span></div>
<div class="top"><i>‹</i><h1>Phân tích video</h1></div>
<div class="tabs">${['Tổng quan', 'Người xem', 'Tương tác'].map(t => `<span class="${t === tab ? 'on' : ''}">${t}</span>`).join('')}</div>
<div class="vd"><div class="th">GÓP Ý XONG LẠI<small>XIN LỖI</small></div>
 <div><h2>Góp ý sếp một câu, cuối cùng em phải xin lỗi</h2>
 <p>Đăng: 17/11/2026 · 10:50 · 1:28</p><p class="do">Số liệu 24 giờ đầu</p></div></div>`;

// Đường giữ chân: % người còn xem theo giây (0..88)
const diem = [[0, 100], [1, 93], [2, 86], [3, 66.8], [5, 61], [8, 57], [12, 53.5], [18, 49.5], [25, 46], [32, 43], [38, 41], [42, 37], [46, 34.5], [55, 32.5], [65, 30.8], [75, 29.4], [83, 28.2], [88, 27.3]];
function bieuDo() {
  const W = 900, H = 520, x = s => 110 + s / 88 * (W - 160), y = p => 24 + (100 - p) / 100 * (H - 84);
  const pts = diem.map(([s, p]) => `${x(s).toFixed(1)},${y(p).toFixed(1)}`).join(' ');
  const luoi = [0, 25, 50, 75, 100].map(p => `<line x1="110" x2="${W - 40}" y1="${y(p)}" y2="${y(p)}" stroke="#2c2c2c" stroke-width="2"/><text x="96" y="${y(p) + 10}" fill="#8a8a8a" font-size="26" text-anchor="end">${p}%</text>`).join('');
  const truc = [[0, '0:00'], [22, '0:22'], [44, '0:44'], [66, '1:06'], [88, '1:28']].map(([s, t]) => `<text x="${x(s)}" y="${H - 18}" fill="#8a8a8a" font-size="26" text-anchor="middle">${t}</text>`).join('');
  return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" style="display:block;margin:0 auto">
  <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fe2c55" stop-opacity=".45"/><stop offset="1" stop-color="#fe2c55" stop-opacity="0"/></linearGradient></defs>
  ${luoi}${truc}
  <polygon points="${x(0)},${y(0)} ${pts} ${x(88)},${y(0)}" fill="url(#g)"/>
  <polyline points="${pts}" fill="none" stroke="#fe2c55" stroke-width="6" stroke-linejoin="round"/>
  <line x1="${x(42)}" x2="${x(42)}" y1="${y(100)}" y2="${y(0)}" stroke="#fff" stroke-width="2" stroke-dasharray="8 8" opacity=".6"/>
  <circle cx="${x(42)}" cy="${y(37)}" r="11" fill="#fff"/>
  <rect x="${x(42) + 18}" y="${y(37) - 110}" width="300" height="84" rx="14" fill="#2a2a2a"/>
  <text x="${x(42) + 38}" y="${y(37) - 72}" fill="#fff" font-size="28" font-weight="700">0:42 · còn 37%</text>
  <text x="${x(42) + 38}" y="${y(37) - 40}" fill="#b5b5b5" font-size="24">rơi 4% trong 4 giây</text>
  </svg>`;
}

const gio = [2, 1, 1, 0.5, 0.5, 1, 3, 5, 6, 5, 6, 8, 9, 7, 6, 6, 7, 8, 9, 10, 12, 14, 11, 6];
function cotGio() {
  const W = 900, H = 300, mx = Math.max(...gio), bw = (W - 40) / 24;
  return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" style="display:block;margin:0 auto">
  ${gio.map((v, i) => { const h = v / mx * (H - 60); return `<rect x="${20 + i * bw + 4}" y="${H - 40 - h}" width="${bw - 8}" height="${h}" rx="6" fill="${i === 21 ? '#fe2c55' : '#3a3a3a'}"/>`; }).join('')}
  ${[0, 6, 12, 18, 23].map(i => `<text x="${20 + i * bw + bw / 2}" y="${H - 6}" fill="#8a8a8a" font-size="24" text-anchor="middle">${i}h</text>`).join('')}
  </svg>`;
}

const thanh = (ten, pt, lop = '') => `<div class="dt"><div class="h"><span>${ten}</span><b>${String(pt).replace('.', ',')}%</b></div><div class="thanh ${lop}"><i style="width:${pt}%"></i></div></div>`;

const TRANG = {
  '1-tong-quan': `${dau('Tổng quan')}<div class="wrap">
   <div class="sec">Chỉ số chính <small>so với video trước</small></div>
   <div class="luoi">
    <div class="o"><div class="n">Lượt xem video</div><div class="s">23,6K</div><div class="t">▲ 28%</div></div>
    <div class="o"><div class="n">Tổng thời gian xem</div><div class="s">258,3 giờ</div><div class="t">▲ 53%</div></div>
    <div class="o"><div class="n">Thời gian xem TB</div><div class="s">39,4 giây</div><div class="t">▲ 6,3 giây</div></div>
    <div class="o"><div class="n">Xem hết video</div><div class="s">27,3%</div><div class="t">▲ 5,6%</div></div>
    <div class="o"><div class="n">Người theo dõi mới</div><div class="s">+486</div><div class="t">▲ 56%</div></div>
    <div class="o"><div class="n">Lượt xem sau 3 giây</div><div class="s">66,8%</div><div class="t">▲ 5,4%</div></div>
   </div>
   <div class="sec">Tỉ lệ giữ chân người xem</div>
   <div class="o" style="padding:34px 10px 20px">${bieuDo()}</div>
   <p class="ghi">27,3% người xem đã xem hết video. Đoạn rời nhiều nhất: 0:38 – 0:46.</p>
  </div>`,

  '2-luot-xem-nguon': `${dau('Tổng quan')}<div class="wrap">
   <div class="sec">Lượt xem theo giờ <small>24 giờ đầu</small></div>
   <div class="o" style="padding:30px 10px 20px">${(() => {
     const v = [180, 940, 1820, 2410, 2160, 1980, 1730, 1650, 1590, 1470, 1380, 1260, 1150, 1020, 880, 640, 410, 260, 190, 230, 380, 520, 610, 520];
     const W = 900, H = 380, mx = Math.max(...v), bw = (W - 40) / 24;
     return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" style="display:block;margin:0 auto">${v.map((n, i) => { const h = n / mx * (H - 100); return `<rect x="${20 + i * bw + 4}" y="${H - 44 - h}" width="${bw - 8}" height="${h}" rx="6" fill="${i === 3 ? '#fe2c55' : '#20d5ec'}" opacity="${i === 3 ? 1 : .75}"/>`; }).join('')}
     ${[[0, '10h'], [6, '16h'], [12, '22h'], [18, '4h'], [23, '9h']].map(([i, t]) => `<text x="${20 + i * bw + bw / 2}" y="${H - 8}" fill="#8a8a8a" font-size="24" text-anchor="middle">${t}</text>`).join('')}
     <text x="${20 + 3 * bw + bw / 2}" y="${H - 44 - (H - 100) - 14}" fill="#fff" font-size="26" font-weight="700" text-anchor="middle">2.410</text></svg>`;
   })()}</div>
   <p class="ghi">Đỉnh lượt xem: 13:00 – 14:00, 3 giờ sau khi đăng.</p>
   <div class="sec">Nguồn lưu lượng</div>
   <div class="bang" style="padding:6px 36px">
    ${thanh('Dành cho bạn', 89.6)}${thanh('Hồ sơ cá nhân', 5.1)}${thanh('Tìm kiếm', 3.4)}${thanh('Đang theo dõi', 1.9)}
   </div>
   <div class="sec">Từ khoá tìm kiếm</div>
   <div><span class="chip">darvo là gì<b>41%</b></span><span class="chip">bị sếp đổ lỗi<b>22%</b></span><span class="chip">thao túng tâm lý<b>17%</b></span><span class="chip">góp ý sếp<b>11%</b></span><span class="chip">đảo vai<b>9%</b></span></div>
  </div>`,

  '3-nguoi-xem': `${dau('Người xem')}<div class="wrap">
   <div class="sec">Giới tính</div>
   <div class="bang" style="padding:6px 36px">${thanh('Nữ', 64.9)}${thanh('Nam', 35.1, 'xanh')}</div>
   <div class="sec">Độ tuổi</div>
   <div class="bang" style="padding:6px 36px">${thanh('18 – 24', 30.8)}${thanh('25 – 34', 44.2)}${thanh('35 – 44', 16.3)}${thanh('45 trở lên', 8.7)}</div>
   <div class="sec">Khu vực</div>
   <div class="bang" style="padding:6px 36px">${thanh('TP. Hồ Chí Minh', 33.9, 'xanh')}${thanh('Hà Nội', 27.4, 'xanh')}${thanh('Tỉnh thành khác', 38.7, 'xanh')}</div>
  </div>`,

  '4-tuong-tac': `${dau('Tương tác')}<div class="wrap">
   <div class="sec">Tương tác <small>tỉ lệ / lượt xem</small></div>
   <div class="bang">
    <div class="d"><span>Lượt thích</span><b>2.137 <small style="color:#8a8a8a;font-weight:400;font-size:28px">· 9,1%</small></b></div>
    <div class="d"><span>Bình luận</span><b>164 <small style="color:#8a8a8a;font-weight:400;font-size:28px">· 0,69%</small></b></div>
    <div class="d"><span>Chia sẻ</span><b>351 <small style="color:#8a8a8a;font-weight:400;font-size:28px">· 1,49%</small></b></div>
    <div class="d"><span>Lượt lưu</span><b>618 <small style="color:#8a8a8a;font-weight:400;font-size:28px">· 2,62%</small></b></div>
   </div>
   <div class="sec">Từ nổi bật trong bình luận</div>
   <div><span class="chip">"đúng sếp em"<b>38</b></span><span class="chip">"xin lỗi"<b>27</b></span><span class="chip">"tag"<b>21</b></span><span class="chip">"phần 2"<b>14</b></span><span class="chip">"bị y chang"<b>12</b></span></div>
   <div class="sec">Người theo dõi hoạt động <small>giờ trong ngày</small></div>
   <div class="o" style="padding:30px 10px 20px">${cotGio()}</div>
   <p class="ghi">Người theo dõi của bạn hoạt động nhiều nhất lúc 21:00 – 22:00.</p>
  </div>`,
};

const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({ viewport: { width: 1080, height: 2340 }, deviceScaleFactor: 1 });
for (const [ten, body] of Object.entries(TRANG)) {
  const f = `${process.cwd()}/trang-${ten}.html`;
  writeFileSync(f, `<!doctype html><meta charset="utf-8"><style>${CSS}</style><body>${body}</body>`);
  await page.goto('file://' + f);
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: `${RA}/${ten}.png` });
  console.log('xong', ten);
}
await browser.close();
