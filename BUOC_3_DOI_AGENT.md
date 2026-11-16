# BƯỚC 3: ĐỘI AGENT + PHÒNG ĐIỀU HÀNH (văn phòng 3D chạy dữ liệu thật)

> **Gửi Claude Code:** Quy trình làm video đã chạy ổn (`QUY_TRINH.md`, `bao-cao-buoc-2.md`): dàn cảnh ráp theo dữ liệu, 134 khối, 3 phong cách, giọng KorvaTTS `gia_bao`, ~19 phút máy/video. Bước này **không làm lại phần dựng video**. Chỉ bọc quy trình đó thành một đội agent có tên, nói chuyện như đồng nghiệp, có Phòng điều hành để đại ca xem, và có agent phân tích sau khi đăng.
> File `HUONG_DAN_CAI_DAT_BAN_LINH_MEM.md` cũ chỉ để tham khảo ý tưởng. Chỗ nào khác với file này hoặc `QUY_TRINH.md` thì theo file này. Chỉ dùng Opus, không dùng Fable. Xưng "em", gọi "đại ca".

## 0. Đã chốt (giữ nguyên)
- Làm **theo yêu cầu**: đại ca giao chủ đề thì làm, không chạy lịch tự động.
- Kênh **Tâm Cơ**. Giọng KorvaTTS `gia_bao`. Kịch bản 280–300 từ. 3 phong cách, mỗi chủ đề làm 3 mẫu để đại ca chọn. Ba chốt duyệt: kịch bản → phong cách → bản nháp.
- Chấp nhận cách hiểu luật chống lặp theo **kiểu cảnh** (bố cục + nền + góc máy, mỗi tổ hợp tối đa 2 lần).
- **Sửa thêm vào `kiem-lap.py`:** nội dung màn hình (tên nhóm chat, tin nhắn, tiêu đề email…) không được trùng với các video trước (so với `logs/da-dung.json`). Ví dụ "Cả Phòng Minh" đã dùng ở `ghet-ngam` thì `thao-tung` phải đặt tên nhóm khác.

## 1. Tiết kiệm token (bắt buộc)
- **Mỗi chủ đề một phiên mới.** Làm xong một chủ đề, trưởng nhóm nhắc đại ca gõ `/clear` (hoặc mở `claude` mới) trước chủ đề sau. Trạng thái nằm trong file, không nằm trong trí nhớ phiên.
- `CLAUDE.md` ngắn (dưới 120 dòng): vai trưởng nhóm, luật giao tiếp, bảng lệnh. Chi tiết để trong `QUY_TRINH.md` và `docs/`.
- Mọi agent con: `model: opus`, `omitClaudeMd: true`, có `maxTurns`. Effort: `bien-kich` high, còn lại medium.
- Hook không in gì ra stdout. Script in tối đa 3 dòng khi thành công.
- Dùng **lệnh gạch chéo** (`.claude/commands/*.md`) cho từng việc, để hướng dẫn chỉ được nạp khi gọi.

## 2. Đội ngũ

| Tên | id | Vai | Ghi chú |
|---|---|---|---|
| Anh Hải | `truong-nhom` | Phiên chính: điều phối, chạy script, báo cáo đại ca | Đại ca chỉ nói chuyện với Anh Hải |
| Linh | `len-chu-de` | Gợi ý chủ đề | **Mới.** opus medium |
| Tuấn | `bien-kich` | Kịch bản + `canh.json` có cấu trúc | Đã có |
| Chị Mai | `kiem-duyet` | Rà kịch bản, chạy `kiem-canh.py`, `kiem-lap.py` | Đã có |
| Khoa | `hoa-si` | Vẽ khối mới khi có `de_xuat_khoi`, thêm vào thư viện + catalog, kiểm 3 phong cách | **Mới.** opus medium. Tách ra agent để ngữ cảnh phiên chính luôn gọn |
| Vy | `dong-goi` | `dang-bai.md` + chữ ảnh bìa (`video.json` trường `bia`) | **Mới** (trước đây phiên chính làm). opus medium |
| Đức | `phan-tich` | Đọc ảnh chụp số liệu 24h, rút bài học | **Mới.** opus high |
| Máy dựng | `may-dung` | Các script trong `pipeline/` và `render/` | Không phải AI, 0 token, chỉ gửi tin tiến độ |

**`len-chu-de`:** khi đại ca gõ `/goi-y`, tìm 3–5 lượt trên web về chủ đề tâm lý, giao tiếp, công sở, thao túng đang được bàn nhiều. Đọc `logs/da-dung.json`, `chu-de/bai-hoc.md` (nếu có). Đề xuất 10 chủ đề vào `chu-de/kho.md`, mỗi chủ đề gồm tiêu đề, hook 1 dòng, góc kể chuyện, 3 ý chính, khối có sẵn dùng được hay cần khối mới. Cấm: tôn giáo, chính trị, Đảng/Nhà nước, luật pháp. Báo cáo tối đa 5 câu.

**`phan-tich`:** đại ca thả ảnh chụp số liệu sau 24 giờ vào `phan-tich/inbox/<slug>/` (hoặc kéo thả trên Phòng điều hành) rồi gõ `/phan-tich <slug>`. Thu nhỏ ảnh bằng `sips -Z 1200` trước khi đọc. Trích số vào `phan-tich/so-lieu.csv` (lượt xem, thời gian xem TB, tỉ lệ xem hết, giữ chân 3 giây nếu có, thích, bình luận, chia sẻ, lưu, theo dõi mới, phong cách, tông màu, nền mở đầu); ô nào ảnh không có thì để trống, không đoán. So với trung vị các video trước (tính bằng script). Ghi `phan-tich/bao-cao/<slug>.md` (3 điểm tốt, 3 điểm cần sửa, 3 hành động). Cập nhật `chu-de/bai-hoc.md` tối đa 40 dòng, mỗi dòng có bằng chứng. `bien-kich` và `len-chu-de` đọc file này. Ảnh đã xử lý chuyển sang `phan-tich/da-xu-ly/`.

## 3. Cách nói chuyện (như đồng nghiệp thật, không vòng lặp)
- Tin nhắn tự nhiên, xưng anh/em/chị theo vai, đi thẳng vào việc. Ví dụ: Anh Hải → Tuấn: *"Tuấn viết kịch bản 'Sếp giao việc kiểu đẩy trách nhiệm' nhé, ý tưởng ở chu-de/kho.md mục 3. Hook phải gắt."* Tuấn → Anh Hải: *"Xong rồi anh, 294 từ, 20 cảnh, máy kiểm đạt. Có đề xuất một khối mới là 'cửa phòng sếp hé mở', em ghi trong de_xuat_khoi."*
- Agent con không nhắn trực tiếp cho nhau, mọi việc qua Anh Hải.
- Không có tin chỉ để chào, cảm ơn, tạm biệt, "ok", "đã nhận". Làm xong là dừng, Anh Hải không gửi tin xác nhận lại.
- Tối đa 3 lượt qua lại cho một việc. Agent con hỏi tối đa 1 câu, phải kèm phương án đề xuất. Tối đa 1 vòng sửa kịch bản.
- **Hook chặn** `.claude/hooks/chan-vong-lap.sh` (PreToolUse trên tool gọi/nhắn agent): tin dưới 60 ký tự chỉ gồm chào/cảm ơn/ok thì chặn (exit 2); lượt thứ 4 với cùng agent cho cùng việc thì chặn, báo "Đã 3 lượt, anh tự quyết hoặc hỏi đại ca."

## 4. Lệnh của đại ca (`.claude/commands/`)
| Lệnh | Việc |
|---|---|
| `/goi-y` | Linh đề xuất 10 chủ đề |
| `/chu-de <tên hoặc số trong kho>` | Chạy trọn `QUY_TRINH.md`: Tuấn → Chị Mai → (Khoa nếu cần khối mới) → **dừng duyệt kịch bản** → giọng → 3 mẫu → **dừng chọn phong cách** → bản đầy đủ → Vy đóng gói → **dừng xem bản nháp** |
| `/sua <yêu cầu>` | Sửa đúng phần được nêu (kịch bản, cảnh, chữ), quay lại đúng cảnh đó |
| `/phan-tich <slug>` | Đức phân tích |
| `/lam-moi` | Sau 10 video: đọc `da-dung.json`, đề xuất 2–3 khối/bối cảnh mới, đại ca duyệt thì Khoa vẽ |
| `/token` | `npx ccusage@latest daily --offline`, trả 3 dòng |

Đại ca cũng có thể nói bình thường ("làm chủ đề X đi"), Anh Hải tự hiểu.

## 5. Phòng điều hành (`dieu-hanh/`, `http://localhost:4747`)
- `dieu-hanh/server.mjs`: Node thuần (http, fs), chỉ nghe trên localhost, không cơ sở dữ liệu. Đẩy cập nhật bằng SSE.
- **Văn phòng 3D:** dùng `giai-doan-2/van-phong-3d.html` (đã có demo). Sửa danh sách nhân viên theo bảng mục 2 (Khoa thành `hoa-si`, "Họa sĩ"). Server phục vụ đúng giao thức ghi ở đầu file đó:
  - `GET /api/trang-thai` → `{"nhan_vien":[{"id","trang_thai","viec","model"}]}`
  - `SSE /api/stream` → `{"loai":"trang-thai",...}`, `{"loai":"tin","tu","den","noi"}`, `{"loai":"tien-do","id":"may-dung","phan_tram","viec"}`
- **Nguồn dữ liệu (hook ghi, 0 token):** `.claude/hooks/ghi-su-kien.sh` gắn vào `SessionStart` (Anh Hải online), `SubagentStart` (agent → đang làm, kèm mô tả việc), `SubagentStop` (agent → online), `PreToolUse`/`PostToolUse` của tool gọi agent (ghi **nguyên văn** tin giao việc và tin báo cáo vào `du-an/<slug>/ban-tin.jsonl`), `Notification` (Anh Hải → **chờ duyệt** khi hỏi đại ca), `SessionEnd` (mọi người → offline). Script trong `pipeline/` ghi tin "Máy dựng" và tiến độ phần trăm khi quay.
- **Các tab khác** (một file HTML, không framework):
  1. **Bản tin:** khung chat nhóm, avatar + tên, lọc theo chủ đề. Chỉ để xem; đại ca nhắn thì nhắn trong Claude Code.
  2. **Duyệt:** đọc kịch bản, phát 3 mẫu cạnh nhau, phát bản nháp; nút Duyệt / Chọn phong cách / Yêu cầu sửa kèm ô ghi chú → ghi `du-an/<slug>/duyet.json`. Anh Hải đọc file này khi đại ca gõ "tiếp" (vẫn duyệt trong chat được như cũ).
  3. **Đăng bài:** video, ảnh bìa, nút sao chép tiêu đề/mô tả/hashtag từng nền tảng, nút "Đã đăng" (ghi giờ) → 24 giờ sau hiện nhắc "chụp số liệu".
  4. **Phân tích:** kéo thả ảnh vào đúng `phan-tich/inbox/<slug>/`, xem báo cáo, biểu đồ đơn giản từ `so-lieu.csv`.
  5. **Thư viện:** xem catalog khối theo nhóm, thống kê dùng nhiều/ít từ `da-dung.json`.
  6. **Token:** gọi `ccusage --json --offline` tối đa 1 lần/10 phút.
- Mở bằng `./dieu-hanh.sh` (chạy server nền rồi mở trình duyệt). Hỏi đại ca trước khi cài tự chạy khi đăng nhập máy.
- Nhẹ cho máy 2017: tab ẩn thì dừng hoạt ảnh, không poll liên tục.

## 6. Nghiệm thu
1. Đại ca mở Phòng điều hành, gõ `/goi-y` → thấy Linh từ góc nghỉ đi về bàn, làm việc, gửi báo cáo; Bản tin hiện tin nhắn.
2. Đại ca chọn 1 chủ đề, **mở phiên mới**, gõ `/chu-de ...` → chạy trọn đến `xuat-ban/<slug>/`, các nhân viên đổi trạng thái đúng, Máy dựng nhấp nháy khi quay, có thanh tiến độ.
3. Thử hook chặn: giả lập tin "ok cảm ơn" bị chặn; lượt thứ 4 bị chặn.
4. Thử `/phan-tich ghet-ngam` với ảnh chụp đại ca gửi (nếu đã có).
5. Báo cáo `bao-cao-buoc-3.md`: **token của phiên mới cho một chủ đề** (đo bằng `ccusage session`), thời gian máy, những gì còn vướng. Cập nhật `QUY_TRINH.md`.

Gặp lỗi không tự xử lý được sau 2 lần thử: dừng, mô tả ngắn, hỏi đại ca.
