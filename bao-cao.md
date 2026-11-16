# Báo cáo khả thi — Tâm Cơ

**Kết luận: KHẢ THI CÓ ĐIỀU KIỆN.** Máy MacBook Pro 2017 làm được video 90 giây đạt chuẩn đăng trong khoảng 11 phút máy, hoàn toàn miễn phí. Cách dùng: khi nào cần thì đại ca mở hệ thống và giao chủ đề cho AI làm. Điều kiện duy nhất là phải tổng quát hóa phần dàn cảnh (hiện còn viết tay cho từng cảnh của chủ đề này).

## Bảng kết quả

| Hạng mục | Kết quả |
|---|---|
| Thời gian cài đặt, lỗi gặp phải | Khoảng 12 phút. Gặp 4 lỗi, đều tự xử lý được: (1) `brew install uv` đòi build Python 3.15 từ mã nguồn vì macOS 13 không còn bản dựng sẵn → cài `uv` qua pip; (2) Chromium của Playwright không hỗ trợ macOS 13 → dùng Google Chrome có sẵn (`channel: "chrome"`); (3) repo `bachdyon/video-automator-skills` không còn tồn tại → cài thẳng VieNeu-TTS; (4) `llvmlite`/`numba` bản mới không có bản dựng cho Mac Intel → ghim `numba<0.62` (`scratch/constraints.txt`). |
| Giọng đọc: công cụ, giọng chọn, hệ số tốc độ | **KorvaTTS, giọng `gia_bao`, tốc độ 1,0** (~245 từ/phút), chạy CPU: hệ số **0,65**. Để mặc định thì KorvaTTS dùng CoreML, chậm hơn 4,5 lần (2,94) trên card HD 630. Đã nghe 3 vòng, 45 mẫu. Đại ca chê VieNeu (Turbo 0,67 / Nano 0,24) là "nghe như máy". |
| Thời gian đọc giọng cả video | **96 giây** cho 21 cảnh (89,6 giây âm thanh), đã gồm hậu kỳ (cắt lặng, lọc, nén, EQ) và chuẩn hóa văn bản. |
| Thời gian quay + encode | Mẫu ~27 giây: bảng trắng **76 giây** · tin nhắn 80 giây · truyện tranh 85 giây · hoạt hình phẳng 86 giây · tranh điện ảnh 86–107 giây; ghép thêm 19–28 giây mỗi mẫu. **Video đầy đủ 89,6 giây: quay 278 giây + ghép 93 giây.** Trung bình ~100 ms/khung. |
| Phong cách đại ca chọn, nặng/nhẹ máy nhất | **Tranh điện ảnh**. Từ nay chỉ giữ 3 phong cách (bảng trắng, truyện tranh, tranh điện ảnh), mỗi chủ đề làm 3 mẫu để chọn rồi xoá mẫu không chọn (`tranh-tinh-zoom`). Phong cách này cũng nặng máy nhất (gradient, parallax, bụi bay, vignette) và cho file lớn nhất (12 MB/27 giây). Nhẹ nhất là bảng trắng (76 giây, 6 MB). |
| Tổng thời gian máy từ kịch bản đến mp4 | **~11 phút**: 2 agent viết/duyệt kịch bản 3 phút + đọc giọng 1,6 phút + quay 4,6 phút + ghép/trộn âm/loudnorm 1,6 phút. Kiểm tra chất lượng thêm ~30 giây. |
| Token cả phiên (`ccusage`) | **27,66 triệu token** (Opus 5.5, không dùng Fable): đầu vào 310 · đầu ra 211.336 · ghi cache 535.914 · đọc cache 26,9 triệu. Quy ra giá API: $13,64. Hai agent kịch bản chiếm 120,7 nghìn token (bien-kich 57,5k, kiem-duyet 63,2k). Phần lớn token của phiên này dồn vào việc viết công cụ (làm một lần). |
| Ước tính cho 7 chủ đề/tuần | **Máy:** ~11–12 phút/video → **~1,5 giờ/tuần**, chạy đêm được. **Token:** ước ~2–3 triệu/video (gồm 2 agent ~120k + điều phối, kiểm contact sheet, sửa nhỏ), tức **~15–20 triệu/tuần**, cỡ khoảng 60–70% lượng của phiên này. Có khả năng vừa gói Pro nếu chia 1–2 video/ngày theo khung 5 giờ. **Chưa đo thật**, cần thử 1 chủ đề mới để xác nhận. |
| Phần làm một lần, dùng mãi | `render/chung.js` (easing, chớp mắt, thở, miệng theo giọng, chữ nhấn, chuyển cảnh, mốc SFX) · `render/net-co-ban.js` (một bộ nhân vật/đạo cụ, 4 chất liệu: phẳng / viền / bóng / nét) · 5 template phong cách · `render/quay.mjs` (quay từng khung → ffmpeg, contact sheet, ảnh bìa) · thư viện **13 SFX** tự tổng hợp (`assets/sfx/`) · `pipeline/`: hậu kỳ giọng, chuẩn hóa văn bản + `tu-dien.toml`, biên độ miệng, ghép + loudnorm 2 lượt + logo góc, `kiem-tra.sh` (10 mục), trang so sánh · 2 agent `bien-kich` / `kiem-duyet` · logo góc PNG. |

## Nút thắt lớn nhất
1. **Dàn cảnh còn gắn với chủ đề này.** `render/canh-chung.js` mô tả tay từng cảnh c01–c21 (nhóm chat, lẩu, phòng họp…). Chủ đề mới sẽ rơi về khuôn mặc định theo `bo_cuc`, nhưng các khuôn này vẫn mang đạo cụ của chủ đề cũ. Nếu không tổng quát hóa, mỗi chủ đề sẽ tốn thêm token để viết code dàn cảnh, và đây là phần tốn nhất.
2. **Giọng đọc.** Mất 3 vòng mới có giọng đại ca chấp nhận được. Giọng vẫn là TTS: đọc nhanh, không có cảm xúc theo ngữ cảnh. Đây là giới hạn lớn nhất về chất lượng cảm nhận.
3. Thời lượng sát trần (89,6/90 giây) vì giọng gia_bao đọc nhanh. Kịch bản nên khóa ở 280–300 từ.

## Đề xuất trước khi làm bản đầy đủ (`HUONG_DAN_CAI_DAT_BAN_LINH_MEM.md`)
1. **Tổng quát hóa dàn cảnh theo dữ liệu.** Cho `bien-kich` xuất thêm trường hành động/đạo cụ có cấu trúc (ví dụ `hanh_dong: "quay-lung"`, `dao_cu: ["chuong","dong-ho"]`, `man_hinh: {...}`). `canh-chung.js` chỉ ráp theo các khối có sẵn, không cần viết code mới cho mỗi chủ đề.
2. **Giọng:** giữ KorvaTTS gia_bao (CPU). Theo dõi giai đoạn 2 của KorvaTTS (nhân bản giọng), hoặc dùng nhân bản giọng của VieNeu với bản thu giọng có quyền sử dụng, để giọng có hồn hơn.
3. Phong cách điện ảnh không có khẩu hình. Nếu muốn nhân vật "nói" rõ hơn, có thể xen cảnh cận mặt kiểu hoạt hình phẳng (template đã có sẵn).

## Nhật ký thời gian
| Bước | Bắt đầu | Kết thúc | Ghi chú |
|---|---|---|---|
| 2. Cài đặt | 2026-11-15 20:18 | 20:30 | brew build Python 3.15 quá lâu → cài uv qua pip; Chromium Playwright không hỗ trợ mac13 → dùng Chrome |
| 3. Giọng đọc (thử) | 2026-11-15 20:30 | 20:40 | repo skill không tồn tại; llvmlite mới không có bản Mac Intel → ghim numba<0.62 |
| 3. Chọn giọng | | 21:11 | 3 vòng nghe (45 mẫu). Chốt KorvaTTS gia_bao tốc độ 1,0 (~245 từ/phút) → kịch bản nâng lên 280–320 từ |
| 4. Kịch bản (2 agent) | | 21:17 | bien-kich 57,5k token/87s; kiem-duyet 63,2k token/99s; 306 từ, 21 cảnh |
| 6a. Đọc giọng 21 cảnh | 21:20 | 21:22 | 96 giây máy; sửa cắt lặng để tổng còn 89,6s |
| 5. Dựng 5 phong cách (code) | 2026-11-16 | 09:27 | chung.js, net-co-ban.js (4 chất liệu), canh-chung.js, 5 phong-cach.js |
| 5.2 Quay 5 mẫu ~27s | | 09:27 | phẳng 86s, bảng trắng 76s, truyện tranh 85s, tin nhắn 80s, điện ảnh 86–107s (+ ghép ~20–28s mỗi mẫu); 5/5 qua kiểm tra |
| 5.1c Đại ca chọn phong cách | | 09:44 | Tranh điện ảnh (tranh-tinh-zoom) |
| 5.2 Quay video đầy đủ | 09:45 | 09:52 | 21 cảnh, 89,6s video: quay 278s + ghép 93s; kiểm tra 10/10 đạt |
| 8. Gói đăng bài | | 09:52 | xuat-ban/: video.mp4 30,4 MB, anh-bia.png, dang-bai.md |
| 8. Đại ca duyệt bản nháp | | 09:56 | Duyệt, không sửa |
| 9. Báo cáo khả thi | | 09:57 | ccusage: 27,66 triệu token cả phiên |
