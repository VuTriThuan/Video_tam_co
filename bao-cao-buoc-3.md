# Báo cáo Bước 3 — Đội agent + Phòng điều hành

> Trạng thái: **đã nghiệm thu thật (2026-11-16)**: `/goi-y` + `/chu-de 2` (DARVO) chạy trọn đến `xuat-ban/darvo/`. Còn `/phan-tich` chờ ảnh số liệu.

## Đã làm
| Hạng mục | File |
|---|---|
| Anh Hải (phiên chính), 90 dòng | `CLAUDE.md` |
| Agent mới: Linh, Khoa, Vy, Đức (Opus, `omitClaudeMd`, có `maxTurns`) | `.claude/agents/len-chu-de.md`, `hoa-si.md`, `dong-goi.md`, `phan-tich.md` |
| Tuấn đọc thêm `bai-hoc.md` và nội dung màn hình đã dùng; Tuấn, Chị Mai báo cáo kiểu đồng nghiệp | `.claude/agents/bien-kich.md`, `kiem-duyet.md` |
| 6 lệnh gạch chéo | `.claude/commands/goi-y, chu-de, sua, phan-tich, lam-moi, token` |
| Hook chặn xã giao + lượt thứ 4 | `.claude/hooks/chan-vong-lap.sh` (+ `chan_vong_lap.py`) |
| Hook ghi sự kiện: SessionStart/End, UserPromptSubmit, Stop, Notification, SubagentStart/Stop, Pre/PostToolUse của Agent | `.claude/hooks/ghi-su-kien.sh` → `dieu-hanh/su_kien.py` |
| Chống trùng nội dung màn hình với video trước | `pipeline/kiem-lap.py` (+ trường `man_hinh` trong `logs/da-dung.json`, đã điền bù cho 2 video cũ) |
| Máy dựng gửi tiến độ % và tin nhắn | `render/quay.mjs`, `pipeline/lam-mau.sh`, `pipeline/chot-phong-cach.sh` |
| Phòng điều hành: server Node thuần, SSE, chỉ localhost | `dieu-hanh/server.mjs`, `dieu-hanh/index.html`, `dieu-hanh/van-phong-3d.html`, `./dieu-hanh.sh` |
| Phân tích: thư mục, CSV, script trung vị + tỉ lệ đi tiếp | `phan-tich/`, `phan-tich/trung-vi.py` |

## Kết quả thử
- **Hook chặn:** "ok cảm ơn em nhé" → bị chặn (mã 2). Cùng agent cùng giai đoạn: lượt 1–3 qua, lượt 4 bị chặn với câu "Đã 3 lượt, anh tự quyết hoặc hỏi đại ca."; sang giai đoạn mới thì qua.
- **Sự kiện → văn phòng 3D:** giả lập đúng dữ liệu hook của một lượt `/goi-y`: Anh Hải và Linh chuyển "Đang làm", tin giao việc và tin báo cáo hiện **nguyên văn** ở bản tin; thanh tiến độ Máy dựng chạy 10→100%.
- **kiem-lap.py:** bắt đúng ví dụ trong tài liệu: "Cả Phòng Mình" của `thao-tung` trùng `ghet-ngam`.
- **Các tab:** Duyệt (kịch bản, 3 mẫu, nút ghi `duyet.json`), Đăng bài (video, ảnh bìa, sao chép từng dòng, "Đã đăng", nhắc sau 24 giờ), Phân tích (thả ảnh vào `phan-tich/inbox/<slug>/`, biểu đồ, bảng), Thư viện (đếm số lần dùng từng khối theo trường), Token (ccusage, lưu đệm 10 phút). Đường dẫn ngoài các thư mục cho phép bị chặn (403).
- **`trung-vi.py`:** với số liệu mẫu, in đúng so sánh trung vị và cảnh báo "điểm cắt yếu" khi tỉ lệ đi tiếp 12%.

## Nghiệm thu thật
1. ✅ `/goi-y` thật với Phòng điều hành đang mở (văn phòng 3D + bản tin hiện đúng).
2. ✅ `/chu-de 2` (DARVO) trọn trong phiên mới → `xuat-ban/darvo/` (video.mp4, anh-bia.png, dang-bai.md).
3. ⏳ `/phan-tich ghet-ngam` khi đại ca có ảnh chụp số liệu.

| Chỉ số | Giá trị |
|---|---|
| Token phiên mới cho một chủ đề (ccusage, gồm agent con) | **4,71 triệu**, ~$2.83 |
| — phiên chính (Anh Hải) | ~4,40 triệu (98% là đọc cache), ra 15K |
| — 3 agent con (Tuấn 206K, Chị Mai 64K, Vy 36K) | ~0,31 triệu, ra 38K |
| Thời gian từ đầu đến cuối | ~22 phút (07:31→07:53 UTC, gồm thời gian đại ca duyệt) |
| Phiên `/goi-y` (có sửa hook) | 2,17 triệu, ~$1.26 |

## Còn vướng
- ~~Payload hook chưa thấy thật~~ → đã thấy: agent con chạy **nền**, PostToolUse về ngay lúc giao. Đã sửa `su_kien.py`: bỏ qua PostToolUse kiểu async; báo cáo lấy ở SubagentStop (`last_assistant_message`, hoặc `SubagentHandback` trong `agent_transcript_path`); cờ `da_bao` chống đăng trùng.
- Gợi ý tiết kiệm: phiên chính chiếm ~93% token, chủ yếu do đọc lại cache mỗi lượt; muốn giảm thì giảm số lượt của Anh Hải (gom bước, ít kiểm tra lặt vặt).
- Tự mở Phòng điều hành khi đăng nhập máy: đại ca chọn **không**, mở tay bằng `./dieu-hanh.sh`.
