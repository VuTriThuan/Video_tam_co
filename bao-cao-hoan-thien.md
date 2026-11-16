# Báo cáo hoàn thiện hệ thống Tâm Cơ (2026-11-16)

## 1. Hệ thống gồm những gì
| Phần | Nội dung |
|---|---|
| Đội agent | Anh Hải (phiên chính) + Linh `len-chu-de`, Tuấn `bien-kich`, Chị Mai `kiem-duyet`, Khoa `hoa-si`, Vy `dong-goi`, Đức `phan-tich` — tất cả Opus |
| Lệnh | `/goi-y`, `/chu-de` (chuỗi mặc định, `--le`), `/sua`, `/phan-tich`, `/lam-moi`, `/token` |
| Máy dựng (0 token) | giọng KorvaTTS `gia_bao` (CPU) → biên độ → 3 mẫu phong cách → quay đầy đủ → ghép lẻ/chuỗi → kiểm tra 9 mục → `xuat-ban/` |
| Kiểm máy | `kiem-canh.py` (khối, cấu trúc chuỗi, số từ), `kiem-lap.py` (kiểu cảnh, bối cảnh, nội dung màn hình), `kiem-tra.sh` (độ to, hình, tiếng) |
| Phòng điều hành | `./dieu-hanh.sh` → http://localhost:4747: văn phòng 3D, bản tin, duyệt, đăng bài, phân tích, thư viện, token |
| Hook | ghi sự kiện/tin nhắn, chặn vòng lặp (>3 lượt) |
| Bảo trì | `kiem-tra-he-thong.sh`, `pipeline/don.sh`, git, `HUONG_DAN_SU_DUNG.md` |

## 2. Kết quả kiểm tra toàn bộ (8.1)
`./kiem-tra-he-thong.sh` → **ĐẠT TOÀN BỘ**.
- [x] `/goi-y` → 10 chủ đề
- [x] `/chu-de --le` → `thao-tung` đạt
- [x] `/chu-de` chuỗi → `cuop-cong` 3 phần + bản gốc + gói đăng
- [x] `/sua` → `quay.mjs --sua` chỉ quay lại cảnh nêu (dùng thật cho c45)
- [~] `/phan-tich` → script chạy được; **chưa có ảnh số liệu thật**
- [x] `/lam-moi` đọc được `logs/da-dung.json` (4 video)
- [x] Phòng điều hành 5 API, bản tin có tin thật, hook không lỗi
- [x] Hook chặn vòng lặp hoạt động (đã chặn thật lượt thứ 4 của Tuấn); mọi agent Opus
- [x] Dọn + git

## 3. Token và thời gian trung bình
| | Lẻ (DARVO) | Chuỗi 3 phần (cuop-cong) |
|---|---|---|
| Token cả chủ đề | 4,71 triệu (~$2,8) | 9,41 triệu (~$5,6 ước tính) |
| Token mỗi video đăng | 4,71 triệu | ≈3,1 triệu |
| Thời gian máy | ~10 phút (quay + ghép 253 s, cộng giọng và 3 mẫu ước tính) | ~24 phút (quay + ghép 755 s) |
| Từ đầu đến cuối (gồm duyệt) | ~22 phút | ~62 phút |

Phiên chính chiếm ~95% token, gần hết là đọc lại cache mỗi lượt. Chuỗi tốn hơn chủ yếu vì phải xử lý tay các lỗi ở mục 4 (mỗi lượt thêm của Anh Hải ≈ 100–150K token cache).

## 4. Giới hạn còn lại
- **Lỗi quy trình phát hiện khi chạy chuỗi thật** (chi tiết `bao-cao-buoc-4.md`): Tuấn ghi file sai chỗ; `so-sanh` + góc cận cắt mất nhân vật; đỉnh âm bản gốc vượt ngưỡng làm `chot-phong-cach.sh` dừng; Chị Mai hết 5 lượt; hook tính cả lượt giao bị lỗi.
- Giọng đọc: một giọng `gia_bao` chạy CPU, ngữ điệu đều; đọc chuỗi 245 giây mất ~4 phút máy.
- `/phan-tich` chưa nghiệm thu với số liệu thật.
- Đo token bằng ccusage cần tải `npx` (bị chặn trong phiên tự động) → đang đếm từ transcript.

## 5. Đề xuất nâng cấp
1. Sửa 5 lỗi ở mục 4 (ưu tiên: vị trí file của Tuấn, limiter cuối khi ghép, luật `so-sanh` trong `kiem-canh.py`) — giảm lượt sửa tay, ước tiết kiệm 2–3 triệu token mỗi chuỗi.
2. Gom các bước máy sau Chốt 2 thành một lệnh (dựng → kiểm → chép → báo) để Anh Hải chỉ đọc một kết quả.
3. Thêm khung hình kiểm tự động cho cảnh nhiều nhân vật (đếm bóng người) trước khi ghép.
4. Sau 10 video: chạy `/lam-moi`; khi có số liệu 24 giờ: `/phan-tich` để chỉnh giờ đăng và hook.
5. Thử giọng thứ hai hoặc tăng tốc giọng bằng GPU nếu có máy.
