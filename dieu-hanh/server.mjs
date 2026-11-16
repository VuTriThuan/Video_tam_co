// Phòng điều hành Tâm Cơ — Node thuần (http, fs), chỉ nghe localhost:4747, không cơ sở dữ liệu.
// Nguồn dữ liệu: dieu-hanh/su-kien.jsonl (hook + script ghi), các thư mục du-an/, ra/, xuat-ban/, phan-tich/.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { execFile } from 'node:child_process';

const GOC = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const DH = path.join(GOC, 'dieu-hanh');
const LOG = path.join(DH, 'su-kien.jsonl');
const PORT = +process.env.PORT || 4747;
const p = (...a) => path.join(GOC, ...a);
const docJson = (f, d) => { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch { return d; } };
const docTxt = (f, d = '') => { try { return fs.readFileSync(f, 'utf8'); } catch { return d; } };
const coFile = f => { try { return fs.statSync(f).isFile(); } catch { return false; } };

/* ---------------- trạng thái nhân viên ---------------- */
const MODEL = { 'truong-nhom': 'opus · medium', 'len-chu-de': 'opus · medium', 'bien-kich': 'opus · high', 'kiem-duyet': 'opus · medium',
  'hoa-si': 'opus · medium', 'dong-goi': 'opus · medium', 'phan-tich': 'opus · high', 'may-dung': 'script · 0 token' };
const NV = {};
for (const id in MODEL) NV[id] = { id, trang_thai: 'off', viec: '', model: MODEL[id], ts: 0 };
let tienDo = null;
const khach = new Set();

function apDung(ev) {
  if (ev.loai === 'trang-thai' && NV[ev.id]) {
    Object.assign(NV[ev.id], { trang_thai: ev.trang_thai, ts: ev.ts });
    if (ev.viec !== undefined) NV[ev.id].viec = ev.viec;
  } else if (ev.loai === 'tien-do') {
    tienDo = ev; Object.assign(NV['may-dung'], { trang_thai: ev.phan_tram >= 100 ? 'onl' : 'lam', viec: ev.viec, ts: ev.ts });
  }
}

// đọc lại đuôi nhật ký khi khởi động; quá 6 giờ không có gì thì coi như mọi người offline
let viTriDoc = 0;
(function napLai() {
  if (!coFile(LOG)) return;
  const st = fs.statSync(LOG), tu = Math.max(0, st.size - 2_000_000);
  const buf = Buffer.alloc(st.size - tu); const fd = fs.openSync(LOG, 'r'); fs.readSync(fd, buf, 0, buf.length, tu); fs.closeSync(fd);
  for (const dong of buf.toString('utf8').split('\n')) { try { apDung(JSON.parse(dong)); } catch {} }
  viTriDoc = st.size;
  const moiNhat = Math.max(0, ...Object.values(NV).map(n => n.ts || 0));
  if (Date.now() / 1000 - moiNhat > 6 * 3600) for (const n of Object.values(NV)) n.trang_thai = 'off';
})();

function phat(ev) {
  const s = `data: ${JSON.stringify(ev)}\n\n`;
  for (const r of khach) r.write(s);
}
function docTiep() {
  if (!coFile(LOG)) return;
  const size = fs.statSync(LOG).size;
  if (size < viTriDoc) viTriDoc = 0;
  if (size === viTriDoc) return;
  const buf = Buffer.alloc(size - viTriDoc); const fd = fs.openSync(LOG, 'r'); fs.readSync(fd, buf, 0, buf.length, viTriDoc); fs.closeSync(fd);
  const txt = buf.toString('utf8'); const cuoi = txt.lastIndexOf('\n');
  if (cuoi < 0) return;
  viTriDoc += Buffer.byteLength(txt.slice(0, cuoi + 1));
  for (const dong of txt.slice(0, cuoi).split('\n')) {
    let ev; try { ev = JSON.parse(dong); } catch { continue; }
    apDung(ev); phat(ev);
  }
}
fs.mkdirSync(DH, { recursive: true });
try { fs.watch(DH, (_, f) => { if (f === 'su-kien.jsonl') docTiep(); }); } catch {}
setInterval(docTiep, 3000); // dự phòng nếu fs.watch lỡ sự kiện (rẻ: chỉ stat)
setInterval(() => { for (const r of khach) r.write(': giu\n\n'); }, 25000);

function ghiSuKien(ev) { fs.appendFileSync(LOG, JSON.stringify({ ts: Date.now() / 1000, ...ev }) + '\n'); }

/* ---------------- dữ liệu dự án ---------------- */
const hienTai = () => docJson(p('du-an', 'hien-tai.json'), { slug: '' });
const thuMuc = d => { try { return fs.readdirSync(d, { withFileTypes: true }).filter(x => x.isDirectory() && !x.name.startsWith('.')).map(x => x.name); } catch { return []; } };
const PC = ['bang-trang', 'truyen-tranh', 'tranh-tinh-zoom'];
const url = f => '/tep/' + path.relative(GOC, f).split(path.sep).map(encodeURIComponent).join('/');

function duAn(slug) {
  const ht = hienTai(), laHienTai = ht.slug === slug;
  const dl = p('ra', slug, 'du-lieu');
  const kb = laHienTai && coFile(p('kich-ban.md')) && docJson(p('video.json'), {}).chu_de === slug ? p('kich-ban.md') : path.join(dl, 'kich-ban.md');
  const canhF = kb.startsWith(dl) ? path.join(dl, 'canh.json') : p('canh.json');
  const videoF = kb.startsWith(dl) ? path.join(dl, 'video.json') : p('video.json');
  const mau = PC.filter(pc => coFile(p('ra', slug, `mau-${pc}`, 'video.mp4'))).map(pc => ({ phong_cach: pc, video: url(p('ra', slug, `mau-${pc}`, 'video.mp4')), bia: coFile(p('ra', slug, `mau-${pc}`, 'anh-bia.png')) ? url(p('ra', slug, `mau-${pc}`, 'anh-bia.png')) : null }));
  const xb = p('xuat-ban', slug);
  const phan = thuMuc(xb).filter(d => /^phan-\d+$/.test(d)).sort((a, b) => a.slice(5) - b.slice(5)).map(d => ({
    ten: d, video: coFile(path.join(xb, d, 'video.mp4')) ? url(path.join(xb, d, 'video.mp4')) : null, bia: coFile(path.join(xb, d, 'anh-bia.png')) ? url(path.join(xb, d, 'anh-bia.png')) : null }));
  const nhapF = [path.join(xb, 'video.mp4'), p('ra', slug, 'video-day-du', 'video.mp4')].find(coFile);
  return {
    slug, la_hien_tai: laHienTai, giai_doan: laHienTai ? ht.giai_doan : '',
    kich_ban: docTxt(kb), canh: docJson(canhF, []), video_json: docJson(videoF, {}),
    mau, nhap: nhapF ? url(nhapF) : null, phan, ban_goc: coFile(path.join(xb, 'ban-goc.mp4')) ? url(path.join(xb, 'ban-goc.mp4')) : null,
    bia: coFile(path.join(xb, 'anh-bia.png')) ? url(path.join(xb, 'anh-bia.png')) : null,
    dang_bai: docTxt(path.join(xb, 'dang-bai.md')), review: coFile(p('review', slug + '.html')) ? url(p('review', slug + '.html')) : null,
    duyet: docJson(p('du-an', slug, 'duyet.json'), []), da_dang: docJson(p('du-an', slug, 'dang.json'), {}),
    bao_cao: docTxt(p('phan-tich', 'bao-cao', slug + '.md')),
  };
}

function danhSach() {
  const ten = new Set([...thuMuc(p('du-an')), ...thuMuc(p('xuat-ban')), ...thuMuc(p('ra')).filter(d => fs.existsSync(p('ra', d, 'du-lieu')) || PC.some(pc => fs.existsSync(p('ra', d, 'mau-' + pc))))]);
  ten.delete('hoi-quy'); ten.delete('chung'); ten.delete('goi-y'); ten.delete('thu-hook');
  const ht = hienTai().slug;
  const ds = [...ten].map(slug => {
    const xb = p('xuat-ban', slug);
    const st = [p('du-an', slug), xb, p('ra', slug)].map(d => { try { return fs.statSync(d).mtimeMs; } catch { return 0; } });
    return { slug, hien_tai: slug === ht, xuat_ban: fs.existsSync(xb), da_dang: docJson(p('du-an', slug, 'dang.json'), {}), sua: Math.max(...st) };
  });
  return ds.sort((a, b) => b.hien_tai - a.hien_tai || b.sua - a.sua);
}

function banTin(slug, n = 300) {
  const docF = f => docTxt(f).split('\n').filter(Boolean).map(d => { try { return JSON.parse(d); } catch { return null; } }).filter(Boolean);
  let ds = slug ? docF(p('du-an', slug, 'ban-tin.jsonl')) : thuMuc(p('du-an')).flatMap(s => docF(p('du-an', s, 'ban-tin.jsonl')));
  return ds.sort((a, b) => a.ts - b.ts).slice(-n);
}

/* thư viện khối: đọc docs/catalog.md + đếm số lần dùng trong canh.json của các video đã làm */
function thuVien() {
  const md = docTxt(p('docs', 'catalog.md'));
  const nhom = []; let cur = null;
  for (const dong of md.split('\n')) {
    const h = dong.match(/^## (.+)/);
    if (h) { cur = { ten: h[1].trim(), khoi: [] }; nhom.push(cur); continue; }
    if (!cur) continue;
    const m = dong.match(/^- `([^`]+)`:\s*(.*)/);
    if (m) cur.khoi.push({ ten: m[1], mo_ta: m[2] });
    else if (/^`/.test(dong.trim())) for (const t of dong.matchAll(/`([^`]+)`/g)) cur.khoi.push({ ten: t[1], mo_ta: '' });
  }
  const dem = {};
  const video = docJson(p('logs', 'da-dung.json'), []);
  // đếm theo trường: "bo_cuc:ket", "dao_cu:dong-ho"… (ten/loai trong object con tính cho trường cha)
  const duyet = (o, k) => { if (typeof o === 'string') { if (k) dem[k + ':' + o] = (dem[k + ':' + o] || 0) + 1; }
    else if (Array.isArray(o)) o.forEach(x => duyet(x, k));
    else if (o && typeof o === 'object') for (const [kk, v] of Object.entries(o)) { if (['loi', 'chu', 'id', 'tu_khoa', 'nd', 'ai'].includes(kk)) continue; duyet(v, ['ten', 'loai'].includes(kk) ? k : kk); } };
  for (const v of video) duyet(docJson(p('ra', v.chu_de, 'du-lieu', 'canh.json'), []), '');
  for (const v of video) if (v.tong_mau) dem['tong_mau:' + v.tong_mau] = (dem['tong_mau:' + v.tong_mau] || 0) + 1;
  for (const g of nhom) { const k0 = g.ten.split(/[\s(]/)[0]; for (const k of g.khoi) k.dung = dem[k0 + ':' + k.ten] || 0; }
  return { nhom: nhom.filter(g => g.khoi.length && !/Cấu trúc|^video\.json/.test(g.ten)), so_video: video.length, video };
}

function phanTich() {
  const csv = docTxt(p('phan-tich', 'so-lieu.csv')).trim().split('\n').filter(Boolean);
  const cot = (csv.shift() || '').split(',');
  const dong = csv.map(d => Object.fromEntries(d.split(',').map((v, i) => [cot[i], v])));
  const bc = (() => { try { return fs.readdirSync(p('phan-tich', 'bao-cao')).filter(f => f.endsWith('.md')).map(f => f.slice(0, -3)); } catch { return []; } })();
  const inbox = Object.fromEntries(thuMuc(p('phan-tich', 'inbox')).map(s => [s, fs.readdirSync(p('phan-tich', 'inbox', s)).filter(f => !f.startsWith('.'))]));
  return { cot, dong, bao_cao: bc, inbox, bai_hoc: docTxt(p('chu-de', 'bai-hoc.md')) };
}

let tokenCache = { t: 0, data: null, loi: null };
function token(cb) {
  if (Date.now() - tokenCache.t < 600_000 && (tokenCache.data || tokenCache.loi)) return cb(tokenCache);
  execFile('npx', ['-y', 'ccusage@latest', 'daily', '--json', '--offline'], { timeout: 120_000, maxBuffer: 20e6 }, (err, out) => {
    try { tokenCache = { t: Date.now(), data: JSON.parse(out), loi: null }; }
    catch { tokenCache = { t: Date.now(), data: null, loi: String(err?.message || 'không đọc được ccusage').slice(0, 200) }; }
    cb(tokenCache);
  });
}

/* ---------------- http ---------------- */
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.md': 'text/markdown; charset=utf-8',
  '.mp4': 'video/mp4', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.wav': 'audio/wav', '.svg': 'image/svg+xml', '.csv': 'text/csv; charset=utf-8', '.txt': 'text/plain; charset=utf-8' };
const CHO_PHEP = ['ra', 'xuat-ban', 'review', 'phan-tich', 'chu-de', 'du-an', 'assets', 'fonts'];

function guiTep(req, res, f) {
  let st; try { st = fs.statSync(f); if (!st.isFile()) throw 0; } catch { res.writeHead(404); return res.end('Không thấy'); }
  const loai = MIME[path.extname(f).toLowerCase()] || 'application/octet-stream';
  const r = req.headers.range && /bytes=(\d*)-(\d*)/.exec(req.headers.range);
  if (r) {
    const a = r[1] ? +r[1] : st.size - +r[2], b = r[1] && r[2] ? Math.min(+r[2], st.size - 1) : st.size - 1;
    res.writeHead(206, { 'Content-Type': loai, 'Content-Range': `bytes ${a}-${b}/${st.size}`, 'Accept-Ranges': 'bytes', 'Content-Length': b - a + 1, 'Cache-Control': 'no-cache' });
    return fs.createReadStream(f, { start: a, end: b }).pipe(res);
  }
  res.writeHead(200, { 'Content-Type': loai, 'Content-Length': st.size, 'Accept-Ranges': 'bytes', 'Cache-Control': 'no-cache' });
  fs.createReadStream(f).pipe(res);
}
const json = (res, o, ma = 200) => { res.writeHead(ma, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }); res.end(JSON.stringify(o)); };
const docBody = (req, max = 30e6) => new Promise((ok, loi) => { const c = []; let n = 0; req.on('data', d => { n += d.length; if (n > max) { loi(new Error('quá lớn')); req.destroy(); } else c.push(d); }); req.on('end', () => ok(Buffer.concat(c))); });
const slugHopLe = s => typeof s === 'string' && /^[a-z0-9-]{1,60}$/.test(s);

const server = http.createServer(async (req, res) => {
  const u = new URL(req.url, 'http://localhost');
  const pn = decodeURIComponent(u.pathname);
  try {
    if (req.method === 'GET') {
      if (pn === '/' || pn === '/index.html') return guiTep(req, res, path.join(DH, 'index.html'));
      if (pn === '/van-phong-3d.html') return guiTep(req, res, path.join(DH, 'van-phong-3d.html'));
      if (pn === '/api/trang-thai') return json(res, { nhan_vien: Object.values(NV).map(({ id, trang_thai, viec, model }) => ({ id, trang_thai, viec, model })), tien_do: tienDo, hien_tai: hienTai() });
      if (pn === '/api/stream') {
        res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' });
        res.write('retry: 5000\n\n'); khach.add(res); req.on('close', () => khach.delete(res)); return;
      }
      if (pn === '/api/du-an') return json(res, { ds: danhSach(), hien_tai: hienTai() });
      if (pn.startsWith('/api/du-an/')) { const s = pn.slice(11); return slugHopLe(s) ? json(res, duAn(s)) : json(res, { loi: 'slug' }, 400); }
      if (pn === '/api/ban-tin') { const s = u.searchParams.get('slug'); return json(res, { ds: banTin(slugHopLe(s) ? s : '') }); }
      if (pn === '/api/thu-vien') return json(res, thuVien());
      if (pn === '/api/phan-tich') return json(res, phanTich());
      if (pn === '/api/token') return token(t => json(res, t));
      if (pn.startsWith('/tep/')) {
        const rel = path.normalize(pn.slice(5)); const f = path.join(GOC, rel);
        if (!f.startsWith(GOC + path.sep) || !CHO_PHEP.includes(rel.split(path.sep)[0])) { res.writeHead(403); return res.end(); }
        return guiTep(req, res, f);
      }
    }
    if (req.method === 'POST') {
      if (pn === '/api/duyet') {
        const b = JSON.parse((await docBody(req, 1e5)).toString() || '{}');
        if (!slugHopLe(b.slug) || !['kich-ban', 'phong-cach', 'nhap'].includes(b.loai) || !['duyet', 'sua'].includes(b.quyet)) return json(res, { loi: 'thiếu thông tin' }, 400);
        if (b.phong_cach && !PC.includes(b.phong_cach)) return json(res, { loi: 'phong cách' }, 400);
        const f = p('du-an', b.slug, 'duyet.json'); fs.mkdirSync(path.dirname(f), { recursive: true });
        const ds = docJson(f, []);
        const muc = { luc: new Date().toISOString(), loai: b.loai, quyet: b.quyet, phong_cach: b.phong_cach || undefined, phan: b.phan || undefined, ghi_chu: String(b.ghi_chu || '').slice(0, 2000), da_xu_ly: false };
        ds.push(muc); fs.writeFileSync(f, JSON.stringify(ds, null, 1));
        const noi = { 'kich-ban': 'kịch bản', 'phong-cach': 'phong cách', nhap: 'bản nháp' }[b.loai];
        ghiSuKien({ slug: b.slug, loai: 'tin', tu: 'dai-ca', den: 'truong-nhom', noi: `${b.quyet === 'duyet' ? 'Duyệt' : 'Yêu cầu sửa'} ${noi}${muc.phong_cach ? ': ' + muc.phong_cach : ''}${muc.phan ? ' (phần ' + muc.phan + ')' : ''}${muc.ghi_chu ? ' — ' + muc.ghi_chu : ''}. Gõ "tiếp" trong Claude Code để anh Hải làm.` });
        fs.appendFileSync(p('du-an', b.slug, 'ban-tin.jsonl'), JSON.stringify({ ts: Date.now() / 1000, slug: b.slug, loai: 'tin', tu: 'dai-ca', den: 'truong-nhom', noi: `${b.quyet === 'duyet' ? 'Duyệt' : 'Yêu cầu sửa'} ${noi}${muc.phong_cach ? ': ' + muc.phong_cach : ''}${muc.phan ? ' (phần ' + muc.phan + ')' : ''}${muc.ghi_chu ? ' — ' + muc.ghi_chu : ''}` }) + '\n');
        return json(res, { ok: true });
      }
      if (pn === '/api/da-dang') {
        const b = JSON.parse((await docBody(req, 1e4)).toString() || '{}');
        if (!slugHopLe(b.slug)) return json(res, { loi: 'slug' }, 400);
        const f = p('du-an', b.slug, 'dang.json'); fs.mkdirSync(path.dirname(f), { recursive: true });
        const d = docJson(f, {}); const k = b.phan ? 'phan-' + (+b.phan) : 'video';
        if (b.bo) delete d[k]; else d[k] = new Date().toISOString();
        fs.writeFileSync(f, JSON.stringify(d, null, 1)); return json(res, d);
      }
      if (pn === '/api/tai-anh') {
        const s = u.searchParams.get('slug'), ten = (u.searchParams.get('ten') || '').normalize('NFC');
        const sach = ten.replace(/[^\p{L}\p{N}._ -]/gu, '_').slice(0, 80);
        if (!slugHopLe(s) || !/\.(png|jpe?g|webp|heic)$/i.test(sach)) return json(res, { loi: 'chỉ nhận ảnh png/jpg/webp/heic và slug hợp lệ' }, 400);
        const d = p('phan-tich', 'inbox', s); fs.mkdirSync(d, { recursive: true });
        fs.writeFileSync(path.join(d, sach), await docBody(req));
        return json(res, { ok: true, tep: `phan-tich/inbox/${s}/${sach}` });
      }
    }
    res.writeHead(404); res.end('Không thấy');
  } catch (e) { json(res, { loi: String(e.message || e) }, 500); }
});
server.listen(PORT, '127.0.0.1', () => console.log(`Phòng điều hành: http://localhost:${PORT}`));
