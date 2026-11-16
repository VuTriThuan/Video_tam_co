// Sinh docs/catalog.md (cho agent bien-kich) và render/thu-vien/ten-khoi.json (cho pipeline/kiem-canh.py) từ khoi.js.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
const GOC = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..');
const ctx = {}; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(GOC, 'render/thu-vien/khoi.js'), 'utf8'), ctx);
const TV = ctx.TV;
const ten = {
  bo_cuc: Object.keys(TV.BO_CUC), vai: Object.keys(TV.VAI), tu_the: Object.keys(TV.TU_THE), bieu_cam: TV.BIEU_CAM,
  vi_tri: Object.keys(TV.VI_TRI), vi_tri_dao_cu: Object.keys(TV.VI_TRI_DAO_CU), xep: Object.keys(TV.XEP), nen: TV.NEN,
  dao_cu: Object.keys(TV.DAO_CU), noi_dung_bong: TV.NOI_DUNG_BONG, man_hinh: Object.keys(TV.MAN_HINH),
  hieu_ung: Object.keys(TV.HIEU_UNG), sfx: TV.SFX, goc_may: Object.keys(TV.GOC_MAY), tong_mau: Object.keys(TV.TONG_MAU), boi_canh: Object.keys(TV.BOI_CANH),
};
fs.writeFileSync(path.join(GOC, 'render/thu-vien/ten-khoi.json'), JSON.stringify(ten, null, 1));
const ds = o => Object.entries(o).map(([k, v]) => `- \`${k}\`: ${typeof v === 'string' ? v : v.mo_ta || ''}`).join('\n');
const md = `# Catalog khối dựng Tâm Cơ
> Sinh tự động từ \`render/thu-vien/khoi.js\`, không sửa tay. Agent chỉ được dùng đúng các tên dưới đây; cần khối mới thì ghi vào \`"de_xuat_khoi"\`.

## Cấu trúc một cảnh (canh.json)
\`\`\`json
{"id":"c05","loi":"câu đọc","chu":"chữ nhấn ≤6 từ hoặc \\"\\"","tu_khoa":"từ trong chu để tô đỏ","bo_cuc":"<bo_cuc>","nen":"<nen>","goc_may":"<goc_may>",
 "so":1,
 "nhan_vat":[{"vai":"minh","tu_the":"dung","bieu_cam":"buon","vi_tri":"giua","co":"lon|vua|nho","hang":"sau","lat":false,
   "vao":"nhay|tu-duoi|tu-trai|tu-phai|di-vao|co-san","t":0.1,
   "doi":[{"t":0.5,"tu_the":"om-dau","bieu_cam":"ngac-nhien","quay":true}],"noi_gia":false}],
 "xep":"<xep, tùy chọn>",
 "dao_cu":[{"ten":"dau-hoi","vi_tri":"dau-0","t":0.4,"het":0.9,"den":"tay-1","noi_dung":"giay","ben":"trai"}],
 "man_hinh":{"loai":"nhom-chat","ten":"Cả Phòng Mình","thanh_vien":12,"thieu":"Mình","t_thieu":0.6},
 "hieu_ung":[{"ten":"vong-tron-do","muc_tieu":"man-hinh","t":0.7}],
 "sfx":["whoosh","thud"]}
\`\`\`
- Mọi \`t\`, \`het\` là **tỷ lệ của câu đọc** (0 = đầu câu, 1 = cuối câu). Bỏ trống thì tự xếp lệch nhau.
- \`nhan_vat\` thứ tự = thứ tự vẽ; nhân vật \`minh\` tự mấp máy miệng theo giọng.
- Đạo cụ chỉ cần tên: \`"dao_cu":["dong-ho","chuong"]\` cũng được (tự đặt vị trí).

## bo_cuc
${ds(TV.BO_CUC)}

## vai
${ds(TV.VAI)}

## tu_the
${Object.keys(TV.TU_THE).map(k => `\`${k}\``).join(', ')}

## bieu_cam
${TV.BIEU_CAM.map(k => `\`${k}\``).join(', ')}

## vi_tri (nhân vật)
${Object.keys(TV.VI_TRI).map(k => `\`${k}\``).join(', ')}

## xep
${ds(TV.XEP)}

## nen (bắt buộc mỗi cảnh; dùng 2–4 bối cảnh mỗi video)
Bối cảnh:
${ds(TV.BOI_CANH)}
Nền trừu tượng: ${TV.NEN.filter(k => !TV.BOI_CANH[k]).map(k => `\`${k}\``).join(', ')}
Nền đặc biệt (khi nào dùng):
${ds(TV.NEN_DAC_BIET || {})}

## goc_may (bắt buộc mỗi cảnh; ≥3 loại mỗi video)
${ds(TV.GOC_MAY)}

## tong_mau (một cho cả video, ghi trong video.json)
${Object.keys(TV.TONG_MAU).map(k => `\`${k}\``).join(', ')}

## video.json
\`{"chu_de":"ten-ngan-khong-dau","tong_mau":"<tong_mau>","seed":<số nguyên ≥1 — đổi bộ đồng nghiệp/sếp>,"bia":{"chu":"CHỮ ẢNH BÌA 3–6 TỪ","tu_khoa":"TỪ TÔ ĐỎ"}}\`

## Biến thể
- \`"bien_the": 2\` trên một nhân vật: tư thế biến thể (nghiêng người, tay khác).

## dao_cu
${Object.keys(TV.DAO_CU).map(k => `\`${k}\``).join(', ')}
- Vị trí đạo cụ: ${Object.keys(TV.VI_TRI_DAO_CU).map(k => `\`${k}\``).join(', ')}, \`dau-<k>\`, \`tay-<k>\`, \`ban\`, hoặc \`[x, y]\` (khung 1080×1920).
- \`bong-noi\` nhận \`noi_dung\`: ${TV.NOI_DUNG_BONG.map(k => `\`${k}\``).join(', ')}. \`laptop\` nhận \`man\`: \`tai-lieu\` | \`trong\` | \`bieu-do\`.

## man_hinh (loai và tham số)
${ds(TV.MAN_HINH)}
- \`tin\` trong \`nhom-chat\`: \`{"ai":"chi","nd":"Tối nay đi lẩu nha","t":0.3}\`, \`{"ai":"anh","icon":"tim"}\`, \`{"ai":"chi","anh":"lau","nd":"chú thích"}\`. \`ai\`: \`minh\` (bên phải) hoặc \`chi|anh|em|sep\`.

## hieu_ung
${ds(TV.HIEU_UNG)}
- \`muc_tieu\`: ${TV.MUC_TIEU}

## sfx
${TV.SFX.map(k => `\`${k}\``).join(', ')} (tối đa 2 mỗi cảnh; có thể ghi \`{"ten":"thud","t":0.7}\`)
`;
fs.mkdirSync(path.join(GOC, 'docs'), { recursive: true });
fs.writeFileSync(path.join(GOC, 'docs/catalog.md'), md);
console.log('docs/catalog.md + render/thu-vien/ten-khoi.json:', Object.values(ten).reduce((a, b) => a + b.length, 0), 'tên');
