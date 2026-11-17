// Phòng điều hành Tâm Cơ — Node thuần (http, fs), chỉ nghe localhost:4747, không cơ sở dữ liệu.
// Nguồn dữ liệu: dieu-hanh/su-kien.jsonl (hook + script ghi), các thư mục du-an/, ra/, xuat-ban/, phan-tich/.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { execFile, spawn } from 'node:child_process';
import readline from 'node:readline';

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
// tin nhắn: vào nhật ký chung (đẩy SSE) và vào bản tin của chủ đề
function ghiTin(tu, den, noi, slug) {
  slug = slug || docJson(p('du-an', 'hien-tai.json'), {}).slug || 'chung';
  const ev = { ts: Date.now() / 1000, slug, loai: 'tin', tu, den, noi };
  fs.appendFileSync(LOG, JSON.stringify(ev) + '\n');
  if (/^[a-z0-9-]{1,60}$/.test(slug)) { fs.mkdirSync(p('du-an', slug), { recursive: true }); fs.appendFileSync(p('du-an', slug, 'ban-tin.jsonl'), JSON.stringify(ev) + '\n'); }
}

/* ---------------- đội ngũ: mỗi agent là một nhân viên có chức danh ---------------- */
const DOI = docJson(path.join(DH, 'doi-ngu.json'), []);
const TEN = Object.fromEntries(DOI.map(m => [m.id, m.ten]));
function doiNgu() {
  return DOI.map(m => {
    const fm = {}; const mm = docTxt(p('.claude', 'agents', m.id + '.md')).match(/^---\n([\s\S]*?)\n---/);
    if (mm) for (const d of mm[1].split('\n')) { const k = d.match(/^(\w+):\s*(.*)/); if (k) fm[k[1]] = k[2]; }
    return { ...m, model: fm.model ? `${fm.model}${fm.effort ? ' · ' + fm.effort : ''}` : (MODEL[m.id] || ''), cong_cu: fm.tools || '' };
  });
}

/* ---------------- kho chủ đề ---------------- */
function kho() {
  const ds = []; let c = null;
  for (const d of docTxt(p('chu-de', 'kho.md')).split('\n')) {
    let m;
    if ((m = d.match(/^##\s*(\d+)\.\s*(.+)/))) { c = { so: +m[1], ten: m[2].trim() }; ds.push(c); }
    else if (c && (m = d.match(/^-\s*([a-z_]+):\s*(.*)/))) c[m[1]] = m[2].trim();
  }
  return ds;
}

/* ---------------- Anh Hải chạy từ web: `claude -p`, nối tiếp phiên bằng --resume ---------------- */
const PHIEN_F = path.join(DH, '.phien.json');
let phien = docJson(PHIEN_F, {});
let chay = null; const hangCho = [];
const luuPhien = () => { try { fs.writeFileSync(PHIEN_F, JSON.stringify(phien)); } catch {} };
const cauHinh = () => ({ model: 'opus', effort: 'medium', quyen: 'acceptEdits', cho_phep: [], ...docJson(path.join(DH, 'cau-hinh.json'), {}) });
const ttPhien = () => ({ dang_chay: !!chay, bat_dau: chay?.bat_dau || 0, lenh: chay?.noi || '', xep_hang: hangCho.length, noi_tiep: !!phien.session_id, hoat_dong: chay?.hoat_dong || '' });
const NHAC = `Phiên này do đại ca điều khiển từ Phòng điều hành trên web, không có ai bấm cho phép trong terminal.
- Không dùng run_in_background. Lệnh dài chạy tiền cảnh với timeout đủ lớn (tối đa 3600000 ms).
- Không dùng lệnh open, không đưa đường dẫn review/*.html hay localhost: đại ca xem video, ảnh bìa, gói đăng ngay trên web (mục Duyệt, Đăng bài). Chỉ cần nói "đại ca xem ở mục Duyệt".
- Câu trả lời cuối mỗi lượt hiện trong khung trò chuyện của đại ca: viết ngắn, nói rõ đại ca cần làm gì tiếp.
- Ở các chốt duyệt, đại ca bấm trên mục Duyệt; hệ thống tự gửi "tiếp" cho em.`;

// "/ten tham số" → nội dung .claude/commands/ten.md (chế độ -p không tự chạy lệnh gạch chéo của dự án)
function moRong(noi) {
  const m = noi.match(/^\/([a-z0-9-]+)(?:\s+([\s\S]*))?$/);
  if (!m) return noi;
  const t = docTxt(p('.claude', 'commands', m[1] + '.md'), null);
  if (t == null) return noi;
  const than = t.replace(/^---\n[\s\S]*?\n---\n/, ''), a = (m[2] || '').trim();
  return than.includes('$ARGUMENTS') ? than.replaceAll('$ARGUMENTS', a) : than + (a ? '\n\nYêu cầu thêm của đại ca: ' + a : '');
}
function hoatDong(b) {
  if (b.type === 'text') return (b.text || '').trim().split('\n')[0].slice(0, 160);
  if (b.type !== 'tool_use') return '';
  const i = b.input || {}, rel = f => f ? path.relative(GOC, String(f)) : '';
  switch (b.name) {
    case 'Bash': return 'Chạy: ' + String(i.description || i.command || '').slice(0, 120);
    case 'Agent': case 'Task': return 'Giao việc cho ' + (TEN[i.subagent_type] || i.subagent_type || 'đồng nghiệp');
    case 'Read': return 'Đọc ' + rel(i.file_path);
    case 'Edit': case 'Write': return 'Sửa ' + rel(i.file_path);
    default: return b.name;
  }
}
function guiLenh(noi, moi) {
  noi = String(noi || '').trim().slice(0, 8000);
  if (!noi) return { loi: 'Chưa có nội dung.' };
  if (chay) { hangCho.push({ noi, moi }); phat({ loai: 'phien', ...ttPhien() }); return { ok: true, xep_hang: hangCho.length }; }
  chayLenh(noi, moi); return { ok: true };
}
function chayLenh(noi, moi, thuLai) {
  if (moi) { phien = {}; luuPhien(); }
  const ch = cauHinh();
  const args = ['-p', '--output-format', 'stream-json', '--verbose', '--model', ch.model, '--effort', ch.effort, '--permission-mode', ch.quyen, '--append-system-prompt', NHAC];
  if (phien.session_id) args.push('--resume', phien.session_id);
  if (ch.cho_phep?.length) args.push('--allowedTools', ...ch.cho_phep);
  const env = { ...process.env };
  // máy chủ được mở từ bên trong một phiên Claude khác: bỏ biến của phiên đó để dùng đăng nhập riêng của CLI
  if (env.CLAUDECODE) for (const k of Object.keys(env)) if (/^CLAUDE/.test(k) || k === 'ANTHROPIC_BASE_URL') delete env[k];
  Object.assign(env, { TAMCO_WEB: '1', BASH_DEFAULT_TIMEOUT_MS: '1800000', BASH_MAX_TIMEOUT_MS: '3600000',
    PATH: `${process.env.HOME}/.local/bin:/opt/homebrew/bin:/usr/local/bin:${process.env.PATH || ''}` });
  if (!thuLai) ghiTin('dai-ca', 'truong-nhom', noi);
  const proc = spawn(process.env.CLAUDE_BIN || 'claude', args, { cwd: GOC, env, stdio: ['pipe', 'pipe', 'pipe'], detached: true });
  const c = chay = { proc, bat_dau: Date.now(), noi, xong: false, loi: '', hoat_dong: 'Đọc yêu cầu của đại ca', dung: false };
  phat({ loai: 'phien', ...ttPhien() });
  proc.on('error', e => { c.loi += String(e.message || e); });
  proc.stdin.on('error', () => {}); proc.stdin.end(moRong(noi));
  proc.stderr.on('data', d => { c.loi = (c.loi + d).slice(-2000); });
  readline.createInterface({ input: proc.stdout }).on('line', dong => {
    let j; try { j = JSON.parse(dong); } catch { return; }
    if (j.session_id && j.type === 'system') { phien.session_id = j.session_id; luuPhien(); }
    if (j.type === 'assistant' && !j.parent_tool_use_id) for (const b of j.message?.content || []) {
      const h = hoatDong(b); if (h) { c.hoat_dong = h; phat({ loai: 'hoat-dong', noi: h }); }
    }
    if (j.type === 'result') {
      c.xong = true; if (j.session_id) { phien.session_id = j.session_id; luuPhien(); }
      let t = String(j.result || '').trim();
      if (j.is_error || (j.subtype && j.subtype !== 'success')) t = t || `Phiên dừng vì lỗi (${j.subtype}).`;
      if (/not logged in|\/login/i.test(t) && t.length < 200) {
        t = 'Em chưa nhận được lệnh: chương trình `claude` trên máy này chưa đăng nhập. Đại ca mở Terminal, chạy `claude`, gõ `/login` và đăng nhập một lần, rồi gửi lại lệnh ở đây.';
        phien = {}; luuPhien();
      }
      const tc = [...new Set((j.permission_denials || []).map(d => d.tool_name + (d.tool_input?.command ? ': ' + String(d.tool_input.command).slice(0, 80) : '')))];
      if (tc.length) t += `\n\n(Có lệnh bị chặn quyền: ${tc.join('; ')}. Đại ca đồng ý thì thêm vào mục cho_phep của dieu-hanh/cau-hinh.json.)`;
      ghiTin('truong-nhom', 'dai-ca', t || '(Anh Hải không trả lời gì.)');
    }
  });
  proc.on('close', () => {
    if (chay !== c) return;
    chay = null;
    if (!c.xong) {
      if (!thuLai && !c.dung && phien.session_id && /No conversation found|session/i.test(c.loi)) return chayLenh(noi, true, true);
      ghiTin('truong-nhom', 'dai-ca', c.dung ? 'Em đã dừng theo lệnh đại ca.' : 'Phiên kết thúc bất thường. ' + c.loi.slice(-600));
      // hook Stop có thể chưa chạy: trả mọi người về trạng thái nghỉ
      const slug = hienTai().slug || 'chung';
      for (const n of Object.values(NV)) if (n.trang_thai === 'lam' && n.id !== 'truong-nhom') ghiSuKien({ slug, loai: 'trang-thai', id: n.id, trang_thai: 'onl', viec: '' });
      ghiSuKien({ slug, loai: 'trang-thai', id: 'truong-nhom', trang_thai: 'cho', viec: 'Chờ đại ca' });
    }
    const ke = hangCho.shift();
    if (ke) return chayLenh(ke.noi, ke.moi);
    // lượt hỏng trước khi hook Stop kịp chạy (ví dụ chưa đăng nhập) thì anh Hải vẫn phải về trạng thái chờ
    if (c.xong) ghiSuKien({ slug: hienTai().slug || 'chung', loai: 'trang-thai', id: 'truong-nhom', trang_thai: 'cho', viec: 'Chờ đại ca' });
    phat({ loai: 'phien', ...ttPhien() });
  });
}
function dungLenh() {
  hangCho.length = 0;
  if (!chay) return false;
  chay.dung = true; const pid = chay.proc.pid;
  try { process.kill(-pid, 'SIGTERM'); } catch { try { chay.proc.kill('SIGTERM'); } catch {} }
  setTimeout(() => { try { process.kill(-pid, 'SIGKILL'); } catch {} }, 5000);
  return true;
}

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
  const ht = hienTai().slug, khoDs = kho();
  const ds = [...ten].map(slug => {
    const xb = p('xuat-ban', slug);
    const st = [p('du-an', slug), xb, p('ra', slug)].map(d => { try { return fs.statSync(d).mtimeMs; } catch { return 0; } });
    const soPhan = thuMuc(xb).filter(d => /^phan-\d+$/.test(d)).length;
    const bia = [path.join(xb, 'anh-bia.png'), path.join(xb, 'phan-1', 'anh-bia.png'), path.join(xb, 'anh-bia-goc.png')].find(coFile);
    const ten = (docTxt(path.join(xb, 'dang-bai.md')).split('\n')[0].match(/["“](.+)["”]/) || [])[1] || khoDs.find(k => k.slug === slug)?.ten || slug;
    return { slug, ten, hien_tai: slug === ht, xuat_ban: fs.existsSync(xb), so_muc: soPhan || 1, chuoi: soPhan > 0, bia: bia ? url(bia) : null,
      co_bao_cao: coFile(p('phan-tich', 'bao-cao', slug + '.md')), da_dang: docJson(p('du-an', slug, 'dang.json'), {}), sua: Math.max(...st) };
  });
  return ds.sort((a, b) => b.hien_tai - a.hien_tai || b.sua - a.sua);
}

// chốt nào đang chờ đại ca: suy từ giai đoạn hiện tại + file đã có
function canDuyet() {
  const ht = hienTai(), slug = ht.slug;
  if (!slugHopLe(slug) || ['goi-y', 'lam-moi', 'chung', 'thu-hook'].includes(slug)) return null;
  const k = kho().find(x => x.slug === slug);
  const gd = ht.giai_doan || '';
  const loai = gd === 'kich-ban' ? 'kich-ban' : gd === 'mau' ? 'phong-cach' : (gd === 'nhap' || /^sua-/.test(gd)) ? 'nhap' : null;
  const co = { ten: k?.ten || slug, slug, giai_doan: gd, xong: k?.trang_thai === 'da-lam' };
  if (!loai || co.xong || chay || NV['truong-nhom'].trang_thai === 'lam') return { ...co, loai: null };
  const d = duAn(slug);
  if (d.duyet.some(x => !x.da_xu_ly)) return { ...co, loai: null, cho_hai: true };
  const san = loai === 'kich-ban' ? !!d.kich_ban : loai === 'phong-cach' ? d.mau.length > 0 : !!(d.nhap || d.phan.some(x => x.video));
  return { ...co, loai: san ? loai : null };
}

// khối mới /lam-moi đề xuất: du-an/lam-moi/de-xuat.json, mục trang_thai 'cho' | 'duyet' | 'khong'
function deXuatKhoi(tv) {
  const d = docJson(p('du-an', 'lam-moi', 'de-xuat.json'), null);
  if (!d || !Array.isArray(d.muc) || !tv) return d && Array.isArray(d.muc) ? d : null;
  const co = new Set(tv.nhom.flatMap(g => g.khoi.map(k => k.ten)));
  d.muc.forEach(m => { m.da_ve = m.viec === 'bo' ? !co.has(m.ten) : co.has(m.ten); });
  return d;
}
const soKhoiCho = () => (deXuatKhoi()?.muc || []).filter(m => m.trang_thai === 'cho').length;

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

// "đang làm" mà hơn một giờ không có tin gì mới là trạng thái sót lại của phiên cũ (phiên bị đóng giữa chừng)
const conLam = (id, tt, ts) => tt === 'lam' && !(chay && id === 'truong-nhom') && Date.now() / 1000 - (ts || 0) > 3600 ? 'onl' : tt;

/* ---------------- http ---------------- */
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.md': 'text/markdown; charset=utf-8',
  '.mp4': 'video/mp4', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.wav': 'audio/wav', '.svg': 'image/svg+xml', '.csv': 'text/csv; charset=utf-8', '.txt': 'text/plain; charset=utf-8' };
const CHO_PHEP = ['ra', 'xuat-ban', 'review', 'phan-tich', 'chu-de', 'du-an', 'assets', 'fonts'];

// trình duyệt bỏ ngang (tua, chuyển video) thì đóng file ngay, không giữ kết nối
const ong = (rs, res) => { res.on('close', () => rs.destroy()); rs.on('error', () => res.destroy()); rs.pipe(res); };
function guiTep(req, res, f) {
  let st; try { st = fs.statSync(f); if (!st.isFile()) throw 0; } catch { res.writeHead(404); return res.end('Không thấy'); }
  const loai = MIME[path.extname(f).toLowerCase()] || 'application/octet-stream';
  const r = req.headers.range && /bytes=(\d*)-(\d*)/.exec(req.headers.range);
  if (r) {
    const a = r[1] ? +r[1] : st.size - +r[2], b = r[1] && r[2] ? Math.min(+r[2], st.size - 1) : st.size - 1;
    res.writeHead(206, { 'Content-Type': loai, 'Content-Range': `bytes ${a}-${b}/${st.size}`, 'Accept-Ranges': 'bytes', 'Content-Length': b - a + 1, 'Cache-Control': 'no-cache' });
    return ong(fs.createReadStream(f, { start: a, end: b }), res);
  }
  res.writeHead(200, { 'Content-Type': loai, 'Content-Length': st.size, 'Accept-Ranges': 'bytes', 'Cache-Control': 'no-cache' });
  ong(fs.createReadStream(f), res);
}
const json = (res, o, ma = 200) => { res.writeHead(ma, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }); res.end(JSON.stringify(o)); };
const docBody = (req, max = 30e6) => new Promise((ok, loi) => { const c = []; let n = 0; req.on('data', d => { n += d.length; if (n > max) { loi(new Error('quá lớn')); req.destroy(); } else c.push(d); }); req.on('end', () => ok(Buffer.concat(c))); });
const slugHopLe = s => typeof s === 'string' && /^[a-z0-9-]{1,60}$/.test(s);

const server = http.createServer(async (req, res) => {
  const u = new URL(req.url, 'http://localhost');
  const pn = decodeURIComponent(u.pathname);
  // máy chủ này ra lệnh được cho Anh Hải, nên chỉ nhận yêu cầu từ chính trang localhost này (chặn trang web lạ và DNS rebinding)
  const host = req.headers.host || '';
  if (!/^(localhost|127\.0\.0\.1)(:\d+)?$/.test(host)) { res.writeHead(403); return res.end(); }
  if (req.method === 'POST' && req.headers.origin) {
    let oh = ''; try { oh = new URL(req.headers.origin).host; } catch {}
    if (oh !== host) { res.writeHead(403); return res.end(); }
  }
  try {
    if (req.method === 'GET') {
      if (pn === '/' || pn === '/index.html') return guiTep(req, res, path.join(DH, 'index.html'));
      if (pn === '/van-phong.js') return guiTep(req, res, path.join(DH, 'van-phong.js'));
      if (pn === '/nhac.js') return guiTep(req, res, path.join(DH, 'nhac.js'));
      if (pn === '/api/trang-thai') return json(res, { nhan_vien: Object.values(NV).map(({ id, trang_thai, viec, model, ts }) => ({ id, trang_thai: conLam(id, trang_thai, ts), viec, model, ts })), tien_do: tienDo, hien_tai: hienTai(), phien: ttPhien(), can_duyet: canDuyet(), khoi_cho: soKhoiCho() });
      if (pn === '/api/doi-ngu') return json(res, { ds: doiNgu() });
      if (pn === '/api/kho') return json(res, { ds: kho() });
      if (pn === '/api/cau-hinh') return json(res, cauHinh());
      if (pn === '/api/stream') {
        res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' });
        res.write('retry: 5000\n\n'); khach.add(res); req.on('close', () => khach.delete(res)); return;
      }
      if (pn === '/api/du-an') return json(res, { ds: danhSach(), hien_tai: hienTai() });
      if (pn.startsWith('/api/du-an/')) { const s = pn.slice(11); return slugHopLe(s) ? json(res, duAn(s)) : json(res, { loi: 'slug' }, 400); }
      if (pn === '/api/ban-tin') { const s = u.searchParams.get('slug'); return json(res, { ds: banTin(slugHopLe(s) ? s : '') }); }
      if (pn === '/api/thu-vien') { const tv = thuVien(); return json(res, { ...tv, de_xuat: deXuatKhoi(tv) }); }
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
        const cau = `${b.quyet === 'duyet' ? 'Duyệt' : 'Yêu cầu sửa'} ${noi}${muc.phong_cach ? ': ' + muc.phong_cach : ''}${muc.phan ? ' (phần ' + muc.phan + ')' : ''}${muc.ghi_chu ? ' — ' + muc.ghi_chu : ''}`;
        ghiTin('dai-ca', 'truong-nhom', cau, b.slug);
        // báo luôn cho Anh Hải làm tiếp, đại ca không phải gõ "tiếp"
        const r = b.gui === false ? {} : guiLenh('tiếp');
        return json(res, { ok: true, da_gui: !!r.ok, xep_hang: r.xep_hang || 0 });
      }
      if (pn === '/api/duyet-khoi') {
        const b = JSON.parse((await docBody(req, 1e5)).toString() || '{}');
        const f = p('du-an', 'lam-moi', 'de-xuat.json'), d = docJson(f, null);
        if (!d) return json(res, { loi: 'Chưa có đề xuất nào.' }, 400);
        const chon = new Set((b.chon || []).map(String)), ghi = String(b.ghi_chu || '').slice(0, 2000);
        const cho = d.muc.filter(m => m.trang_thai === 'cho');
        if (!cho.length) return json(res, { loi: 'Không còn mục nào chờ duyệt.' }, 400);
        cho.forEach(m => { m.trang_thai = chon.has(m.id) ? 'duyet' : 'khong'; m.luc_duyet = new Date().toISOString(); });
        fs.writeFileSync(f, JSON.stringify(d, null, 1));
        const ok = cho.filter(m => m.trang_thai === 'duyet'), khong = cho.filter(m => m.trang_thai === 'khong');
        const fd = p('du-an', 'lam-moi', 'duyet.json'), ds = docJson(fd, []);
        ds.push({ luc: new Date().toISOString(), loai: 'khoi-moi', quyet: ok.length ? 'duyet' : 'bo', chon: ok.map(m => m.ten), khong: khong.map(m => m.ten), ghi_chu: ghi, da_xu_ly: !ok.length });
        fs.writeFileSync(fd, JSON.stringify(ds, null, 1));
        const ten = a => a.map(m => (m.viec === 'bo' ? 'bỏ ' : '') + m.ten).join(', ');
        const cau = (ok.length ? `Duyệt khối mới: ${ten(ok)}` : 'Không duyệt khối mới nào') + (khong.length && ok.length ? `. Không làm: ${ten(khong)}` : '') + (ghi ? ' — ' + ghi : '');
        ghiTin('dai-ca', 'truong-nhom', cau, 'lam-moi');
        const r = ok.length ? guiLenh(`${cau}. Mục đã duyệt nằm trong du-an/lam-moi/de-xuat.json (trang_thai "duyet"). Làm bước 4 của /lam-moi: giao Khoa vẽ từng khối, xong thì đặt da_xu_ly: true ở mục cuối du-an/lam-moi/duyet.json.`) : {};
        return json(res, { ok: true, da_gui: !!r.ok, xep_hang: r.xep_hang || 0 });
      }
      if (pn === '/api/lenh') {
        const b = JSON.parse((await docBody(req, 1e5)).toString() || '{}');
        const r = guiLenh(b.noi, !!b.moi); return json(res, r, r.loi ? 400 : 200);
      }
      if (pn === '/api/dung') return json(res, { ok: dungLenh() });
      if (pn === '/api/phien-moi') { if (chay) return json(res, { loi: 'Anh Hải đang làm, dừng trước đã.' }, 409); phien = {}; luuPhien(); phat({ loai: 'phien', ...ttPhien() }); return json(res, { ok: true }); }
      if (pn === '/api/he-thong') {
        const b = JSON.parse((await docBody(req, 1e4)).toString() || '{}');
        const lenh = { 'kiem-tra': ['kiem-tra-he-thong.sh'], don: ['pipeline/don.sh'], 'don-xoa': ['pipeline/don.sh', '--xoa'] }[b.viec];
        if (!lenh) return json(res, { loi: 'việc' }, 400);
        return execFile('bash', lenh, { cwd: GOC, timeout: 600_000, maxBuffer: 5e6 }, (err, out, e2) => json(res, { ra: (out || '') + (e2 || ''), ma: err ? (err.code ?? 1) : 0 }));
      }
      if (pn === '/api/da-dang') {
        const b = JSON.parse((await docBody(req, 1e4)).toString() || '{}');
        if (!slugHopLe(b.slug)) return json(res, { loi: 'slug' }, 400);
        const f = p('du-an', b.slug, 'dang.json'); fs.mkdirSync(path.dirname(f), { recursive: true });
        const d = docJson(f, {}); const k = b.phan ? 'phan-' + (+b.phan) : 'video';
        if (b.bo) delete d[k]; else d[k] = new Date().toISOString();
        fs.writeFileSync(f, JSON.stringify(d, null, 1)); return json(res, d);
      }
      if (pn === '/api/xoa-anh') {
        const s = u.searchParams.get('slug'), ten = path.basename(u.searchParams.get('ten') || '');
        const f = p('phan-tich', 'inbox', s || '', ten);
        if (!slugHopLe(s) || !ten || ten.startsWith('.') || !fs.existsSync(f)) return json(res, { loi: 'không thấy ảnh' }, 400);
        fs.unlinkSync(f); return json(res, { ok: true });
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
