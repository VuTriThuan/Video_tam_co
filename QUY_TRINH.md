# Quy trình làm một video Tâm Cơ

> Dành cho Claude Code khi sếp giao chủ đề mới. Xưng "em", gọi "sếp", báo cáo ngắn gọn tiếng Việt. Chỉ dùng Opus.
> Không chạy theo lịch: khi nào sếp giao thì làm.

## Đã chốt
- **Giọng:** KorvaTTS `gia_bao`, tốc độ 1,0, chạy CPU (`pipeline/doc-giong.py`). Đọc nhanh ~245 từ/phút → kịch bản **280–300 từ**.
- **3 phong cách:** `bang-trang`, `truyen-tranh`, `tranh-tinh-zoom`.
- Kênh **Tâm Cơ**, "Hiểu chiêu để không trúng chiêu.", logo góc trái mờ 55%.

## Đội agent và Phòng điều hành (Bước 3)
- Phiên chính là **Anh Hải** (`CLAUDE.md`). Agent con: Linh `len-chu-de`, Tuấn `bien-kich`, Chị Mai `kiem-duyet`, Khoa `hoa-si`, Vy `dong-goi`, Đức `phan-tich`. Lệnh: `/goi-y`, `/chu-de`, `/sua`, `/phan-tich`, `/lam-moi`, `/token` (`.claude/commands/`).
- Phòng điều hành: `./dieu-hanh.sh` → http://localhost:4747. Dữ liệu do hook ghi (`.claude/hooks/ghi-su-kien.sh` → `dieu-hanh/su-kien.jsonl`, tin nhắn nguyên văn vào `du-an/<slug>/ban-tin.jsonl`), 0 token. Script dựng gửi tiến độ qua `dieu-hanh/su_kien.py` và `render/quay.mjs`.
- Đánh dấu chủ đề/giai đoạn: `python3 dieu-hanh/su_kien.py bat-dau <slug>` / `giai-doan <ten>`. Hook `chan-vong-lap.sh` đếm lượt theo (agent, giai đoạn): lượt 4 bị chặn.
- Duyệt trên web ghi `du-an/<slug>/duyet.json` rồi máy chủ tự gửi "tiếp" cho Anh Hải (`dieu-hanh/server.mjs` chạy `claude -p`, lệnh gạch chéo được mở rộng từ `.claude/commands/`); nhận "tiếp" thì đọc mục `da_xu_ly: false` mới nhất.
- Văn phòng 3D: `dieu-hanh/van-phong.js` (Three.js 0.160 tải từ jsDelivr qua importmap trong `index.html`; vị trí từng người ở bảng `VT`). Lỗi tải hoặc màn hình hẹp thì `index.html` vẽ sơ đồ 2D.
- Nhân viên và vị trí: `dieu-hanh/doi-ngu.json`. Thêm, sửa, gỡ agent và skill ở trang **Skill & nhân sự** (`dieu-hanh/nhan-su.mjs` ghi `.claude/agents/<id>.md`, `.claude/skills/`, `doi-ngu.json`; gỡ là chuyển vào `dieu-hanh/_da-go/`, khôi phục được). Model đọc thẳng từ file agent, văn phòng 3D tự xếp bàn. Agent mới có hiệu lực từ phiên mới.
- Luồng làm việc: trang **Luồng làm việc** lưu `dieu-hanh/luong.json` + `luong.md`; `/chu-de`, `/lam-moi`, `/phan-tich` đọc `luong.md` nếu có. Gỡ một người thì bước của họ chuyển về anh Hải. "Về quy trình gốc" xoá hai file này.
- Phân tích: ảnh vào `phan-tich/inbox/<slug>/` → `/phan-tich <slug>` → `phan-tich/so-lieu.csv`, `phan-tich/bao-cao/<slug>.md`, `chu-de/bai-hoc.md` (Tuấn, Linh, Vy đọc).

## Hai định dạng (Bước 4)
- **`chuoi` (mặc định):** video gốc 4–6 phút, 3–5 phần × 60–90 giây (mỗi phần 250–340 từ). `/chu-de <tên>`.
- **`le`:** một video 75–90 giây (280–300 từ). `/chu-de <tên> --le`.
- Dữ liệu chuỗi: mỗi cảnh có `"phan"`; `video.json` có `"dinh_dang": "chuoi"` + `"chuoi": {so_phan, diem_cat, nhac_lai, teaser, bia_phan}` (chi tiết đầu `pipeline/kiem-canh.py`). `kich-ban.md` có dòng `## Phần n`.
- Máy kiểm: `kiem-canh.py` kiểm cấu trúc chuỗi; `kiem-lap.py` áp kiểu cảnh ≤2 lần/phần, ≤3 lần cả chuỗi, cảnh mở đầu các phần khác nhau.
- Dựng: quay toàn bộ một lần → `ghep.py` ra bản gốc → `ghep-chuoi.py` ghép từng phần (nhãn "PHẦN n/N" 1,5 giây, màn "Phần n+1 ▶" + teaser 1,5 giây, phần cuối logo + "Theo dõi Tâm Cơ"), bìa từng phần (`quay.mjs --bia --phan n` + `ghep-chuoi.py --bia`). `chot-phong-cach.sh` tự làm cả chuỗi, kiểm từng phần 60–90 giây → `xuat-ban/<slug>/phan-<n>/` + `ban-goc.mp4`.
- Quay song song: `quay.mjs` quay 3 cảnh cùng lúc (mỗi luồng một Chrome riêng, nhanh ~1,7 lần), đổi bằng `--luong N` hoặc biến `TC_LUONG`; từng khung giống hệt quay lần lượt.
- Sửa một cảnh: `quay.mjs ... --ds <id> --sua` (giữ các cảnh khác) rồi ghép lại; chuỗi thì chạy thêm `ghep-chuoi.py`.

## Dàn cảnh = dữ liệu (không viết code cho từng chủ đề)
- Thư viện khối: `render/thu-vien/khoi.js` (nguồn duy nhất về tên khối). Sửa xong chạy `node render/thu-vien/xuat-catalog.mjs` để sinh lại `docs/catalog.md` (cho agent) và `render/thu-vien/ten-khoi.json` (cho máy kiểm).
- `render/canh-chung.js` là bộ ráp: đọc `canh.json` (bo_cuc, nen, goc_may, nhan_vat, xep, dao_cu, man_hinh, hieu_ung, so) + `video.json` (chu_de, tong_mau, seed) rồi ghép khối. Không có mã riêng cho từng cảnh.
- Xem nhanh một khối hoặc cảnh mà không cần giọng: `node render/thu-khoi.mjs <phong-cach> <file-canh-thu.json> <ra.jpg>`.
- `seed` đổi bộ đồng nghiệp/sếp (tóc, áo, kính, dáng); **seed 0 = bộ gốc** (dùng cho `ghet-ngam`).

## Các bước cho một chủ đề
1. **Kịch bản:** gọi `bien-kich` (giao chủ đề + dàn ý) → `kich-ban.md`, `canh.json`, `video.json`.
2. **Máy kiểm:** `python3 pipeline/kiem-canh.py` và `python3 pipeline/kiem-lap.py`. Còn lỗi khối/lặp → gửi nguyên văn cho `bien-kich` sửa đúng cảnh đó. Có `de_xuat_khoi` → giao `hoa-si` (Khoa) vẽ khối mới **một lần** vào `khoi.js`/`net-co-ban.js`, chạy lại `xuat-catalog.mjs`, kiểm 3 phong cách.
3. **Duyệt lời:** gọi `kiem-duyet` (tự chạy 2 lệnh kiểm). **Dừng: sếp duyệt kịch bản.**
4. **Giọng:** `.venv/bin/python pipeline/doc-giong.py` rồi `.venv/bin/python pipeline/bien-do.py`.
5. **Xem trước:** contact sheet vài cảnh, ví dụ `node render/quay.mjs truyen-tranh --ra <chu-de>/xem --xem c01:1,c05:2,...`.
6. **Chọn phong cách:** `pipeline/lam-mau.sh <chu-de>` (tự chạy kiểm bố cục `node render/kiem-bo-cuc.mjs tat-ca` trước: chữ đè đầu/tay nhân vật, chữ đè chữ, chữ lấn vùng TikTok che; ảnh lỗi ở `ra/<chu-de>/bo-cuc/`) → 3 mẫu 20–30 giây + trang `review/<chu-de>.html` (phát cùng lúc); máy nhắc nếu một phong cách đã dùng 2 video liền. **Dừng: sếp chọn.**
7. **Bản đầy đủ:** `pipeline/chot-phong-cach.sh <chu-de> <phong-cach>` → xoá mẫu không chọn, quay, ghép, kiểm tra 10 mục, chép vào `xuat-ban/<chu-de>/`, ghi `logs/da-dung.json`, lưu dữ liệu vào `ra/<chu-de>/du-lieu/`. Xem `ra/<chu-de>/video-day-du/contact-12.jpg`.
8. **Gói đăng:** giao `dong-goi` (Vy) viết `xuat-ban/<chu-de>/dang-bai.md`. **Dừng: sếp xem bản nháp** (tối đa 2 vòng; sửa cảnh nào quay lại cảnh đó).

## Chống lặp
- Luật trong một video và giữa các video: xem đầu file `pipeline/kiem-lap.py`. Hiệu ứng đặc biệt là gia vị: ≤4 lượt/video (chuỗi: mỗi phần), mỗi tên ≤2, không 2 cảnh liền cùng hiệu ứng; Tuấn không bắt buộc dùng hiệu ứng mới. `/lam-moi` chỉ **đề xuất** bỏ hiệu ứng không ai dùng, sếp duyệt mới bỏ. Nội dung màn hình (tên nhóm chat, tên người, tin nhắn, tiêu đề) không được trùng video trước (`logs/da-dung.json` trường `man_hinh`).
- **Cứ sau 10 video** (máy tự nhắc): đọc `logs/da-dung.json`, liệt kê khối/bố cục dùng nhiều nhất, đề xuất 2–3 khối hoặc bối cảnh mới → **sếp duyệt** rồi mới vẽ.

## Hệ thống
- `./kiem-tra-he-thong.sh`: kiểm toàn bộ (0 token). `pipeline/don.sh`: liệt kê file trung gian >14 ngày, `--xoa` chỉ khi sếp đồng ý.
- Sao lưu git (code, cấu hình, khối, agent, tài liệu; không video/âm thanh): sau mỗi thay đổi hệ thống, `git add -A && git commit`.
- Hướng dẫn cho sếp: `HUONG_DAN_SU_DUNG.md`.

## Mẹo
- Mở trang hoặc video cho sếp bằng lệnh `open <đường dẫn>`, vì khung xem file trong ứng dụng không phát được video.
- Lỗi kiểm tra hay gặp: khung đen (màu chuyển cảnh quá tối), chữ bị nhân vật đè (phong cách điện ảnh vẽ chữ ở lớp trên cùng), số bị lệch ra mép (parallax cộng zoom).
- Thời gian máy tham khảo: ~11 phút cho video 90 giây; mỗi mẫu 27 giây mất khoảng 1,5–2 phút.
