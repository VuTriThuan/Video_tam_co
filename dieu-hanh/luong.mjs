// Luồng làm việc giữa các agent: sếp chỉnh trên web → dieu-hanh/luong.json (dữ liệu cho giao diện)
// và dieu-hanh/luong.md (bản chữ ngắn để Anh Hải đọc ở đầu /chu-de, /lam-moi, /phan-tich).
import fs from 'node:fs';
import path from 'node:path';

const DH = path.dirname(new URL(import.meta.url).pathname);
const F_JSON = path.join(DH, 'luong.json'), F_MD = path.join(DH, 'luong.md');
const MA = /^[A-Za-z0-9_-]{1,40}$/;
const LOAI = { viec: 'Việc', kiem: 'Máy kiểm', chot: 'Chốt duyệt của sếp' };
const KIEU = { chinh: 'chính', khi_can: 'khi cần', quay_lai: 'quay lại' };
const loi = m => Object.assign(new Error(m), { ma: 400 });
const s = (v, max) => String(v ?? '').replace(/[\r\n]+/g, ' ').trim().slice(0, max);

export function docLuong() {
  try { const d = JSON.parse(fs.readFileSync(F_JSON, 'utf8')); return { ...d, luc: fs.statSync(F_JSON).mtimeMs }; } catch { return null; }
}

export function luuLuong(b, doi) {
  if (!b || !Array.isArray(b.ds) || !b.ds.length) throw loi('Luồng trống.');
  if (b.ds.length > 20) throw loi('Tối đa 20 luồng.');
  const ten = Object.fromEntries(doi.map(m => [m.id, m]));
  const ds = b.ds.map(f => {
    if (!MA.test(f.id || '')) throw loi('Mã luồng không hợp lệ.');
    const gd = (f.giai_doan || []).slice(0, 12).map(g => { if (!MA.test(g.id || '')) throw loi('Mã giai đoạn không hợp lệ.'); return { id: g.id, ten: s(g.ten, 60) || 'Giai đoạn', phu: s(g.phu, 80) }; });
    if (!gd.length) throw loi(`Luồng "${s(f.ten, 60)}" cần ít nhất một giai đoạn.`);
    const coGd = new Set(gd.map(g => g.id));
    if ((f.buoc || []).length > 60) throw loi('Tối đa 60 bước mỗi luồng.');
    const buoc = (f.buoc || []).map(x => {
      if (!MA.test(x.id || '')) throw loi('Mã bước không hợp lệ.');
      if (!ten[x.ai] && x.ai !== 'dai-ca') throw loi(`Bước "${s(x.ten, 60)}" giao cho người không còn trong đội.`);
      return { id: x.id, gd: coGd.has(x.gd) ? x.gd : gd[0].id, ten: s(x.ten, 80) || 'Bước', ai: x.ai, loai: LOAI[x.loai] ? x.loai : 'viec', ra: s(x.ra, 120), mo_ta: s(x.mo_ta, 200) };
    });
    const coB = new Set(buoc.map(x => x.id));
    const noi = (f.noi || []).slice(0, 200).filter(e => coB.has(e.tu) && coB.has(e.den) && e.tu !== e.den)
      .map(e => ({ tu: e.tu, den: e.den, kieu: KIEU[e.kieu] ? e.kieu : 'chinh', nhan: s(e.nhan, 80) }));
    return { id: f.id, ten: s(f.ten, 60) || 'Luồng', giai_doan: gd, buoc, noi };
  });
  const d = { chon: ds.some(f => f.id === b.chon) ? b.chon : ds[0].id, ds };
  fs.writeFileSync(F_JSON + '.tmp', JSON.stringify(d, null, 1)); fs.renameSync(F_JSON + '.tmp', F_JSON);
  fs.writeFileSync(F_MD, banChu(d, ten));
  return { ok: true, luc: Date.now() };
}

// gỡ một nhân viên: các bước của người đó chuyển về anh Hải (tự làm hoặc giao lại), ghi chú để sếp thấy
export function chuyenBuocCuaNguoi(id, ten, doi) {
  const d = docLuong(); if (!d) return 0;
  let n = 0;
  for (const f of d.ds) for (const b of f.buoc) if (b.ai === id) { b.ai = 'truong-nhom'; b.mo_ta = s(`(${ten} đã gỡ, anh Hải nhận lại) ${b.mo_ta || ''}`, 200); n++; }
  if (n) luuLuong(d, doi);
  return n;
}

export function boLuong() {   // về quy trình gốc: Anh Hải không còn đọc luồng tuỳ chỉnh
  for (const f of [F_JSON, F_MD]) try { fs.unlinkSync(f); } catch {}
  return { ok: true };
}

function banChu(d, ten) {
  const nguoi = id => id === 'dai-ca' ? 'Sếp' : ten[id] ? `${ten[id].ten} (\`${id}\`)` : id;
  const out = ['# Luồng làm việc do sếp chỉnh trên Phòng điều hành', '', '> Máy chủ tự ghi từ dieu-hanh/luong.json, không sửa tay. Bước của Máy dựng vẫn chạy bằng script như lệnh gốc.', ''];
  for (const f of d.ds) {
    const so = Object.fromEntries(f.buoc.map((b, i) => [b.id, i + 1]));
    out.push(`## \`${f.id}\` · ${f.ten}`, '');
    f.giai_doan.forEach((g, gi) => {
      const bs = f.buoc.filter(b => b.gd === g.id); if (!bs.length) return;
      out.push(`**Giai đoạn ${gi + 1} · ${g.ten}**${g.phu ? ` (${g.phu})` : ''}`);
      for (const b of bs) out.push(`${so[b.id]}. ${b.ten} — ${nguoi(b.ai)} · ${LOAI[b.loai]}${b.ra ? ` · ra: ${b.ra}` : ''}${b.mo_ta ? ` · ${b.mo_ta}` : ''}`);
      out.push('');
    });
    const phu = f.noi.filter(e => !(e.kieu === 'chinh' && so[e.den] === so[e.tu] + 1));
    if (phu.length) { out.push('Chuyển giao ngoài thứ tự:'); for (const e of phu) out.push(`- ${so[e.tu]} → ${so[e.den]} (${KIEU[e.kieu]}${e.nhan ? ': ' + e.nhan : ''})`); out.push(''); }
  }
  return out.join('\n');
}
