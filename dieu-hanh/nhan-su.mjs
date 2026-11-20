// Nhân sự và skill của Phòng điều hành: đọc, ghi thật vào .claude/agents, .claude/skills và dieu-hanh/doi-ngu.json.
// Xoá là xoá mềm: chuyển vào dieu-hanh/_da-go/ (ngoài .claude nên Claude Code không còn nạp), khôi phục được.
import fs from 'node:fs';
import path from 'node:path';

const GOC = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const DH = path.join(GOC, 'dieu-hanh');
const F_DOI = path.join(DH, 'doi-ngu.json');
const F_KHO = path.join(DH, 'kho-skill.json');
const D_AGENT = path.join(GOC, '.claude', 'agents');
const D_SKILL = path.join(GOC, '.claude', 'skills');
const D_GO = path.join(DH, '_da-go');

export const KHOA = ['dai-ca', 'truong-nhom', 'may-dung'];          // không xoá được
export const CONG_CU = ['Read', 'Write', 'Edit', 'Bash', 'Glob', 'Grep', 'WebSearch', 'WebFetch'];
export const MUC_NGHI = ['low', 'medium', 'high'];
const MAC_DINH_MODEL = { 'truong-nhom': 'Opus 5.5 · medium', 'may-dung': 'script · 0 token' };
const ID = /^[a-z][a-z0-9-]{1,39}$/;
const MAU = /^#[0-9a-f]{6}$/i;

const docTxt = f => { try { return fs.readFileSync(f, 'utf8'); } catch { return ''; } };
const docJson = (f, d) => { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch { return d; } };
const loi = (msg, ma = 400) => Object.assign(new Error(msg), { ma });
const chuoi = (v, max, ten) => { const s = String(v ?? '').trim(); if (s.length > max) throw loi(`${ten} dài quá ${max} ký tự.`); return s; };
const motDong = s => s.replace(/[\r\n]+/g, ' ');
const dau = () => { const d = new Date(), h = n => String(n).padStart(2, '0'); return `${d.getFullYear()}${h(d.getMonth() + 1)}${h(d.getDate())}-${h(d.getHours())}${h(d.getMinutes())}${h(d.getSeconds())}`; };

/* ---------- đội ngũ ---------- */
export const docDoi = () => docJson(F_DOI, []);
function ghiDoi(ds) {
  const t = '[\n' + ds.map(m => ' ' + JSON.stringify(m)).join(',\n') + '\n]\n';
  fs.writeFileSync(F_DOI + '.tmp', t); fs.renameSync(F_DOI + '.tmp', F_DOI);
}

// đọc phần đầu (frontmatter) và thân của một file agent
export function docAgent(id) {
  const t = docTxt(path.join(D_AGENT, id + '.md'));
  const m = t.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) return null;
  const fm = []; for (const d of m[1].split('\n')) { const k = d.match(/^([A-Za-z]+):\s*(.*)$/); if (k) fm.push([k[1], k[2]]); }
  let than = m[2];
  const kh = than.match(/\n*<!-- skill: [^\n]*-->[\s\S]*?<!-- \/skill -->\n*/);
  if (kh) than = than.replace(kh[0], '\n');
  const ka = than.match(/\n*<!-- ai-ngoai: [^\n]*-->[\s\S]*?<!-- \/ai-ngoai -->\n*/);
  if (ka) than = than.replace(ka[0], '\n');
  return { fm: Object.fromEntries(fm), thu_tu: fm.map(x => x[0]), than: than.trim() };
}
// mô hình chọn được cho từng nhân viên (Fable không dùng theo CLAUDE.md; Gemini chỉ gói miễn phí)
// mô hình chọn được cho từng nhân viên (Fable không dùng theo CLAUDE.md; Gemini chỉ gói miễn phí).
// Claude: tên gọi trong Claude Code (opus/sonnet/haiku) trỏ tới dòng 5.5 hiện tại.
// Gemini: tên "latest" do Google tự nâng cấp; bản thật lấy từ logs/phien-ban-ai.json (ghi sau mỗi lần gọi).
const CLAUDE_BAN = { opus: ['Opus 5.5', 'claude-opus-5-5'], sonnet: ['Sonnet 5.5', 'claude-sonnet-5-5'], haiku: ['Haiku 5.5', 'claude-haiku-5-5'] };
const F_BAN_AI = path.join(GOC, 'logs', 'phien-ban-ai.json');
export function moHinh() {
  const ban = docJson(F_BAN_AI, {}), so = id => (String(ban[id]?.ban || '').match(/gemini-(\d+(?:\.\d+)?)/) || [])[1];
  const g = (id, ten, mo_ta, khoa) => { const v = so(id); return { id, ten: v ? `${ten} ${v}` : ten, ma: ban[id]?.ban || id,
    mo_ta: mo_ta + (v ? '' : ' · chưa đo được bản'), ...(khoa ? { khoa: true } : {}), ...(ban[id]?.luc ? { do_luc: ban[id].luc } : {}) }; };
  return {
    claude: [
      { id: 'opus', ten: CLAUDE_BAN.opus[0], ma: CLAUDE_BAN.opus[1], mo_ta: 'mạnh nhất · tốn token nhất' },
      { id: 'sonnet', ten: CLAUDE_BAN.sonnet[0], ma: CLAUDE_BAN.sonnet[1], mo_ta: 'cân bằng · rẻ hơn Opus' },
      { id: 'haiku', ten: CLAUDE_BAN.haiku[0], ma: CLAUDE_BAN.haiku[1], mo_ta: 'nhanh · rẻ nhất · việc đơn giản' },
    ],
    gemini: [
      g('gemini-flash-lite-latest', 'Flash Lite', 'nhanh · ổn định ở gói miễn phí'),
      g('gemini-flash-latest', 'Flash', 'viết tốt hơn · hay quá tải giờ cao điểm'),
      g('gemini-pro-latest', 'Pro', 'không có trong gói miễn phí', true),
    ],
  };
}
const tenMH = id => Object.values(moHinh()).flat().find(x => x.id === id)?.ten || id;
export const modelCua = (id, a = docAgent(id), m = docDoi().find(x => x.id === id)) => MAC_DINH_MODEL[id] || (m?.bo_nao === 'gemini' ? `Gemini ${tenMH(m.mo_hinh_ngoai || 'gemini-flash-lite-latest')} · miễn phí` : a ? `${tenMH(a.fm.model || 'opus')}${a.fm.effort ? ' · ' + a.fm.effort : ''}` : '');
// bộ não ngoài chạy qua pipeline/nhan-vien-ngoai.py: chỉ có công cụ tệp
export const CC_BO_NAO_NGOAI = ['Read', 'Write', 'Edit', 'Glob', 'Grep'];
const TIEN_TO_NAO = /^\[Bộ não Gemini[^\]]*\]\s*/;

function khoiSkill(ds) {
  if (!ds.length) return '';
  return `\n\n<!-- skill: Phòng điều hành tự ghi, sửa ở trang Skill & nhân sự -->\nSkill được giao (đọc \`.claude/skills/<tên>/SKILL.md\` khi việc cần):\n`
    + ds.map(s => `- \`${s.ten}\`${s.de ? ': ' + motDong(s.de) : ''}`).join('\n') + '\n<!-- /skill -->\n';
}
/* ---------- AI phụ trợ (chỉ miễn phí, qua pipeline/goi-ai.py) ---------- */
const F_AI = path.join(GOC, 'pipeline', 'ai-ngoai.json');
export const dsNhaAi = () => Object.keys(docJson(F_AI, { nha: {} }).nha || {});
function khoiAiNgoai(ai) {
  if (!ai?.nha) return '';
  const nha = ai.nha === 'tu-chon' ? '' : ` --nha ${ai.nha}`;
  return `\n<!-- ai-ngoai: Phòng điều hành tự ghi, sửa ở trang Skill & nhân sự -->\nAI phụ trợ (miễn phí): ${ai.nha === 'tu-chon' ? 'tự chọn nhà còn lượt' : ai.nha}. Bộ não vẫn là em; chỉ nhờ AI phụ khi có ích${ai.de ? ': ' + motDong(ai.de) : ''}.\n`
    + `- Chữ: \`python3 pipeline/goi-ai.py chu "<yêu cầu>"${nha}\` (thêm \`--anh <ảnh>\` để đọc ảnh, cần Gemini)\n`
    + `- Ảnh: \`python3 pipeline/goi-ai.py anh "<mô tả, no text>" --ra <tệp.png>\` (Pollinations, có logo góc dưới phải)\n`
    + `- Lỗi hoặc hết lượt thì tự làm tiếp, không thử quá 2 lần. Kết quả AI phụ phải tự rà lại trước khi dùng. Không gửi thông tin cá nhân.\n<!-- /ai-ngoai -->\n`;
}
function kiemAiNgoai(v) {
  if (!v || !v.nha || v.nha === 'khong') return null;
  const nha = String(v.nha);
  if (nha !== 'tu-chon' && !dsNhaAi().includes(nha)) throw loi(`AI phụ "${nha}" không nằm trong danh sách miễn phí.`);
  return { nha, ...(String(v.de || '').trim() ? { de: chuoi(v.de, 200, 'Việc nhờ AI phụ') } : {}) };
}
function ghiAgent(id, fm, thuTu, than, skill, ai) {
  const khoa = [...new Set([...thuTu, 'name', 'description', 'model', 'effort', 'maxTurns', 'omitClaudeMd', 'tools'])].filter(k => fm[k] !== undefined && fm[k] !== '');
  const t = '---\n' + khoa.map(k => `${k}: ${motDong(String(fm[k]))}`).join('\n') + '\n---\n' + than.trim() + '\n' + khoiSkill(skill) + khoiAiNgoai(ai);
  fs.mkdirSync(D_AGENT, { recursive: true });
  const f = path.join(D_AGENT, id + '.md'); fs.writeFileSync(f + '.tmp', t); fs.renameSync(f + '.tmp', f);
}

// danh sách nhân sự kèm thông tin đọc từ file agent
export function dsNhanSu() {
  const coSkill = new Set(dsTenSkill());
  return docDoi().map(m => {
    const a = m.loai === 'ai' && m.id !== 'truong-nhom' ? docAgent(m.id) : null;
    return { ...m, model: modelCua(m.id, a, m), cong_cu: a?.fm.tools || '', co_file: !!a,
      skill: (m.skill || []).map(s => ({ ...s, co: coSkill.has(s.ten) })) };
  });
}
export function chiTietNhanSu(id) {
  const m = docDoi().find(x => x.id === id); if (!m) throw loi('Không có nhân viên này.', 404);
  const a = m.loai === 'ai' && id !== 'truong-nhom' ? docAgent(id) : null;
  return { ...m, mo_hinh: m.bo_nao === 'gemini' ? (m.mo_hinh_ngoai || 'gemini-flash-lite-latest') : (a?.fm.model || 'opus'), mo_ta: (a?.fm.description || '').replace(TIEN_TO_NAO, ''), muc_nghi: a?.fm.effort || 'medium', luot: +(a?.fm.maxTurns || 0) || '',
    cong_cu: a ? String(a.fm.tools || '').split(/\s*,\s*/).filter(Boolean) : [], loi_dan: a?.than || '', co_file: !!a };
}

function kiemSkillGan(ds) {
  const co = new Set(dsTenSkill());
  return (Array.isArray(ds) ? ds : []).slice(0, 30).map(s => ({ ten: String(s.ten || ''), de: chuoi(s.de, 200, 'Mô tả skill'), ...(s.gian_tiep ? { gian_tiep: true } : {}) }))
    .filter(s => { if (!co.has(s.ten)) throw loi(`Skill "${s.ten}" chưa có trong kho.`); return true; });
}

// thêm mới (id rỗng) hoặc sửa một nhân viên
export function luuNhanSu(b) {
  const ds = docDoi(), moi = !b.id, id = moi ? taoId(b.ten, ds) : String(b.id);
  const cu = ds.find(x => x.id === id);
  if (!moi && !cu) throw loi('Không có nhân viên này.', 404);
  const ten = chuoi(b.ten, 40, 'Tên'); if (!ten) throw loi('Nhập tên nhân viên.');
  const m = { ...(cu || { id, loai: 'ai' }), ten, chuc_danh: chuoi(b.chuc_danh, 60, 'Chức danh') || 'Nhân viên',
    phong: chuoi(b.phong, 40, 'Phòng') || 'Nội dung', mau: MAU.test(b.mau || '') ? b.mau : (cu?.mau || '#3d5a80'), viec: chuoi(b.viec, 300, 'Việc') };
  if (m.loai !== 'nguoi' && id !== 'may-dung') { const sk = kiemSkillGan(b.skill); if (sk.length) m.skill = sk; else delete m.skill; }
  if (m.loai === 'ai' && id !== 'truong-nhom' && 'ai_ngoai' in b) { const ai = kiemAiNgoai(b.ai_ngoai); if (ai) m.ai_ngoai = ai; else delete m.ai_ngoai; }
  // agent thật: ghi file .claude/agents/<id>.md (trưởng nhóm là phiên chính, không có file agent)
  if (m.loai === 'ai' && id !== 'truong-nhom') {
    const a = docAgent(id) || { fm: { name: id, omitClaudeMd: 'true' }, thu_tu: [], than: '' };
    const congCu = (Array.isArray(b.cong_cu) ? b.cong_cu : []).filter(x => CONG_CU.includes(x));
    if (m.ai_ngoai && !congCu.includes('Bash')) congCu.push('Bash');   // AI phụ gọi qua script nên cần chạy lệnh
    if ('bo_nao' in b) {
      if (b.bo_nao === 'gemini') {
        const ngoai = congCu.filter(x => !CC_BO_NAO_NGOAI.includes(x) && !(x === 'Bash' && m.ai_ngoai));
        if (ngoai.length) throw loi(`Bộ não Gemini chưa dùng được công cụ ${ngoai.join(', ')}. Bỏ các công cụ đó hoặc giữ Claude.`);
        m.bo_nao = 'gemini';
        const mh = moHinh().gemini.find(x => x.id === b.mo_hinh);
        if (b.mo_hinh && (!mh || mh.khoa)) throw loi(`Mô hình "${b.mo_hinh}" không dùng được với gói miễn phí.`);
        m.mo_hinh_ngoai = mh ? mh.id : 'gemini-flash-lite-latest';
      } else { delete m.bo_nao; delete m.mo_hinh_ngoai; }
    }
    if (!congCu.length) throw loi('Chọn ít nhất một công cụ (thường là Read).');
    const luot = Math.round(+b.luot || 0); if (b.luot !== '' && b.luot != null && (luot < 1 || luot > 60)) throw loi('Số lượt tối đa từ 1 đến 60.');
    const loiDan = chuoi(b.loi_dan, 30000, 'Lời dặn'); if (!loiDan) throw loi('Viết lời dặn việc cho nhân viên (họ là ai, đọc gì, làm gì, báo cáo thế nào).');
    const mhClaude = m.bo_nao !== 'gemini' && moHinh().claude.some(x => x.id === b.mo_hinh) ? b.mo_hinh : (moHinh().claude.some(x => x.id === a.fm.model) ? a.fm.model : 'opus');
    const fm = { ...a.fm, name: id, model: mhClaude, effort: MUC_NGHI.includes(b.muc_nghi) ? b.muc_nghi : 'medium',
      description: (m.bo_nao === 'gemini' ? `[Bộ não Gemini: anh Hải giao bằng lệnh python3 pipeline/nhan-vien-ngoai.py ${id} "<việc>", không gọi agent; lỗi thì mới gọi agent này] ` : '')
        + (chuoi(b.mo_ta, 400, 'Mô tả') || `${ten} (${m.chuc_danh}) — ${m.viec || 'nhân viên Tâm Cơ'}`),
      tools: congCu.join(', '), maxTurns: luot || undefined };
    ghiAgent(id, fm, a.thu_tu, loiDan, m.skill || [], m.ai_ngoai);
  }
  if (cu) ds[ds.indexOf(cu)] = m; else ds.push(m);
  ghiDoi(ds);
  return { ok: true, id, moi };
}
function taoId(ten, ds) {
  const goc = String(ten || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/gi, 'd').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 30) || 'nhan-vien';
  let id = /^[a-z]/.test(goc) ? goc : 'nv-' + goc, n = 2;
  const trung = x => ds.some(m => m.id === x) || KHOA.includes(x) || fs.existsSync(path.join(D_AGENT, x + '.md')) || fs.existsSync(path.join(D_SKILL, x));
  while (trung(id)) id = `${goc}-${n++}`;
  if (!ID.test(id)) throw loi('Tên không tạo được mã hợp lệ.');
  return id;
}

export function xoaNhanSu(id) {
  if (KHOA.includes(id)) throw loi('Không xoá được nhân sự cốt lõi.');
  const ds = docDoi(), m = ds.find(x => x.id === id); if (!m) throw loi('Không có nhân viên này.', 404);
  const d = path.join(D_GO, 'agents'), goc = `${id}__${dau()}`; fs.mkdirSync(d, { recursive: true });
  fs.writeFileSync(path.join(d, goc + '.json'), JSON.stringify(m, null, 1));
  const f = path.join(D_AGENT, id + '.md'); if (fs.existsSync(f)) fs.renameSync(f, path.join(d, goc + '.md'));
  ghiDoi(ds.filter(x => x !== m));
  return { ok: true };
}

/* ---------- skill ---------- */
const dsTenSkill = () => { try { return fs.readdirSync(D_SKILL, { withFileTypes: true }).filter(x => x.isDirectory() && !x.name.startsWith('.') && fs.existsSync(path.join(D_SKILL, x.name, 'SKILL.md'))).map(x => x.name).sort(); } catch { return []; } };
const demTep = d => { let n = 0, kb = 0; const di = x => { for (const e of fs.readdirSync(x, { withFileTypes: true })) { const p = path.join(x, e.name); if (e.isDirectory()) di(p); else { n++; kb += fs.statSync(p).size; } } }; try { di(d); } catch {} return { so_tep: n, kb: Math.round(kb / 1024) }; };
const nguonCua = d => (docTxt(path.join(d, 'NGUON.md')).match(/Nguồn:\s*(.+)/) || [])[1]?.trim() || '';
const moTaGoc = d => (docTxt(path.join(d, 'SKILL.md')).match(/^---\n[\s\S]*?\ndescription:\s*(.+)/) || [])[1]?.replace(/^["|]\s*/, '').trim() || '';

export function dsSkill() {
  const kho = docJson(F_KHO, {}), doi = docDoi();
  return dsTenSkill().map(ten => { const d = path.join(D_SKILL, ten);
    return { ten, mo_ta: kho[ten]?.mo_ta || '', nguon: nguonCua(d), mo_ta_goc: moTaGoc(d).slice(0, 240), ...demTep(d),
      tu_web: !!kho[ten]?.tu_web, dung_boi: doi.filter(m => (m.skill || []).some(s => s.ten === ten)).map(m => m.id) }; });
}
export function chiTietSkill(ten) {
  if (!ID.test(ten) || !dsTenSkill().includes(ten)) throw loi('Không có skill này.', 404);
  const d = path.join(D_SKILL, ten), kho = docJson(F_KHO, {});
  return { ten, mo_ta: kho[ten]?.mo_ta || '', nguon: nguonCua(d), noi_dung: docTxt(path.join(d, 'SKILL.md')), ...demTep(d) };
}
export function luuSkill(b) {
  const moi = !b.goc, ten = String(moi ? b.ten : b.goc || '').trim().toLowerCase();
  if (!ID.test(ten)) throw loi('Tên skill chỉ gồm chữ thường không dấu, số và gạch ngang (vd: copywriting).');
  const d = path.join(D_SKILL, ten);
  if (moi && (fs.existsSync(d) || docDoi().some(m => m.id === ten))) throw loi('Đã có skill hoặc nhân viên tên này.');
  if (!moi && !dsTenSkill().includes(ten)) throw loi('Không có skill này.', 404);
  const moTa = chuoi(b.mo_ta, 200, 'Dùng để'), nguon = chuoi(b.nguon, 300, 'Nguồn');
  let nd = String(b.noi_dung ?? ''); if (nd.length > 300000) throw loi('Nội dung SKILL.md quá 300 KB.');
  if (!nd.trim()) throw loi('Dán nội dung SKILL.md.');
  if (!/^---\n[\s\S]*?\n---/.test(nd)) nd = `---\nname: ${ten}\ndescription: ${motDong(moTa || ten)}\n---\n\n${nd.trim()}\n`;
  fs.mkdirSync(d, { recursive: true });
  fs.writeFileSync(path.join(d, 'SKILL.md'), nd);
  const fn = path.join(d, 'NGUON.md');
  if (moi || nguon !== nguonCua(d)) fs.writeFileSync(fn, `# Nguồn\n\nNguồn: ${nguon || 'tự viết'}\n\nThêm hoặc sửa từ Phòng điều hành ngày ${new Date().toLocaleDateString('vi-VN')}.\n`);
  const kho = docJson(F_KHO, {}); kho[ten] = { ...(kho[ten] || {}), mo_ta: moTa, ...(moi ? { tu_web: true } : {}) };
  fs.writeFileSync(F_KHO, JSON.stringify(kho, null, 1) + '\n');
  return { ok: true, ten, moi };
}
export function xoaSkill(ten) {
  if (!ID.test(ten) || !dsTenSkill().includes(ten)) throw loi('Không có skill này.', 404);
  const dgo = path.join(D_GO, 'skills'), luc = dau(); fs.mkdirSync(dgo, { recursive: true });
  const ds = docDoi(), dung = ds.filter(m => (m.skill || []).some(s => s.ten === ten));
  fs.renameSync(path.join(D_SKILL, ten), path.join(dgo, `${ten}__${luc}`));
  fs.writeFileSync(path.join(dgo, `${ten}__${luc}.json`), JSON.stringify({ dung_boi: dung.map(m => ({ id: m.id, de: m.skill.find(s => s.ten === ten).de })) }, null, 1));
  // gỡ khỏi người đang dùng, cập nhật khối skill trong file agent
  for (const m of dung) { m.skill = m.skill.filter(s => s.ten !== ten); if (!m.skill.length) delete m.skill; capNhatKhoiSkill(m); }
  ghiDoi(ds);
  return { ok: true, go_khoi: dung.map(m => m.ten) };
}
function capNhatKhoiSkill(m) {
  if (m.loai !== 'ai' || m.id === 'truong-nhom') return;
  const a = docAgent(m.id); if (a) ghiAgent(m.id, a.fm, a.thu_tu, a.than, m.skill || [], m.ai_ngoai);
}

/* ---------- đã gỡ: xem và khôi phục ---------- */
export function dsDaGo() {
  const doc = d => { try { return fs.readdirSync(path.join(D_GO, d)); } catch { return []; } };
  const nv = doc('agents').filter(f => f.endsWith('.json')).map(f => { const m = docJson(path.join(D_GO, 'agents', f), {}); return { loai: 'nhan-vien', ma: f.slice(0, -5), id: m.id, ten: m.ten, chuc_danh: m.chuc_danh, luc: f.split('__')[1]?.replace('.json', '') }; });
  const sk = doc('skills').filter(f => !f.endsWith('.json')).map(f => ({ loai: 'skill', ma: f, ten: f.split('__')[0], luc: f.split('__')[1] }));
  return [...nv, ...sk].sort((a, b) => String(b.luc).localeCompare(String(a.luc)));
}
export function khoiPhuc(loai, ma) {
  if (!/^[a-z][a-z0-9-]{1,39}__\d{8}-\d{6}$/.test(ma)) throw loi('Mã không hợp lệ.');
  const id = ma.split('__')[0];
  if (loai === 'skill') {
    const nguon = path.join(D_GO, 'skills', ma), dich = path.join(D_SKILL, id);
    if (!fs.existsSync(nguon)) throw loi('Không thấy bản đã gỡ.', 404);
    if (fs.existsSync(dich)) throw loi('Đang có skill trùng tên, không khôi phục được.');
    fs.renameSync(nguon, dich);
    return { ok: true, ten: id };
  }
  const d = path.join(D_GO, 'agents'), fj = path.join(d, ma + '.json'), fm = path.join(d, ma + '.md');
  if (!fs.existsSync(fj)) throw loi('Không thấy bản đã gỡ.', 404);
  const ds = docDoi(); if (ds.some(m => m.id === id) || fs.existsSync(path.join(D_AGENT, id + '.md'))) throw loi('Đang có nhân viên trùng mã, không khôi phục được.');
  const m = docJson(fj, null); const co = new Set(dsTenSkill());
  if (m.skill) { m.skill = m.skill.filter(s => co.has(s.ten)); if (!m.skill.length) delete m.skill; }
  if (fs.existsSync(fm)) { fs.mkdirSync(D_AGENT, { recursive: true }); fs.renameSync(fm, path.join(D_AGENT, id + '.md')); }
  fs.unlinkSync(fj); ds.push(m); ghiDoi(ds); capNhatKhoiSkill(m);
  return { ok: true, ten: m.ten };
}
