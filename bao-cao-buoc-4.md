# Báo cáo Bước 4: Chuỗi video + hoàn thiện

> Trạng thái: **đã dựng xong (2026-11-16) và thử máy dựng trên dữ liệu DARVO**. Phần nghiệm thu bằng một chuỗi thật (§7) điền sau khi chạy `/chu-de` trong phiên mới.

## Đã làm
| Hạng mục | File |
|---|---|
| Cấu trúc chuỗi (`phan`, `video.json → chuoi`), 250–340 từ/phần, nhắc lại ≤12 từ, điểm cắt không phải `ket` | `pipeline/kiem-canh.py` |
| Kiểu cảnh ≤2/phần, ≤3 cả chuỗi; mở đầu các phần khác nhau; log ghi `dinh_dang`, `so_phan` | `pipeline/kiem-lap.py` |
| Ghép từng phần: nhãn "PHẦN n/N", màn "Phần n+1 ▶" + teaser (riser + whoosh), phần cuối logo + "Theo dõi Tâm Cơ" (ding), -14 LUFS, 1 lần encode | `pipeline/ghep-chuoi.py` |
| Bìa từng phần (chữ riêng + nhãn PHẦN n/N cùng vị trí) | `render/quay.mjs --bia --phan n`, `ghep-chuoi.py --bia` |
| Quy trình chuỗi tự động → `xuat-ban/<slug>/phan-n/` + `ban-goc.mp4` | `pipeline/chot-phong-cach.sh` |
| Quay lại 1 cảnh không làm mất cảnh khác (lỗi cũ của /sua) | `render/quay.mjs --sua` |
| Tuấn / Chị Mai / Vy viết, rà, đóng gói chuỗi; `/chu-de --le`; `/sua` chuỗi | `.claude/agents/*`, `.claude/commands/*` |
| Đăng bài: giờ đăng + gói đăng riêng từng phần | `dieu-hanh/index.html` |
| Kiểm toàn hệ thống, dọn, sao lưu git, hướng dẫn | `kiem-tra-he-thong.sh`, `pipeline/don.sh`, `.gitignore`, `HUONG_DAN_SU_DUNG.md` |

## Thử máy (DARVO chia giả 3 phần, 21 cảnh)
- Ghép 3 phần mất 87 giây máy; mỗi phần đạt 9/9 mục kiểm tra (khoảng 30 giây vì video gốc ngắn, nên dùng khoảng thời lượng thử 20–40 giây).
- `--sua c03`: quay lại 1 cảnh mất 12 giây; quay.json khớp hoàn toàn bản gốc (vị trí cảnh, SFX, tổng khung).
- `kiem-canh` bắt đúng lỗi số từ/phần và câu nhắc lại dài; `kiem-lap` bắt đúng lỗi hai phần mở đầu giống nhau.

## Lệch so với đặc tả
- `"chuoi"` nằm trong `video.json` (không phải `canh.json`) vì `canh.json` là danh sách cảnh mà bộ dựng đang đọc; thêm `teaser` và `bia_phan`.
- Mũi tên "→" thay bằng tam giác ▶ tự vẽ (font Be Vietnam Pro không có ký tự mũi tên).

## Nghiệm thu (chờ phiên mới)
| Chỉ số | Giá trị |
|---|---|
| Chủ đề chuỗi | _chờ_ |
| Số phần / thời lượng từng phần | _chờ_ |
| Token phiên (ccusage) | _chờ_ |
| Token trung bình mỗi video đăng | _chờ_ (tham khảo lẻ: 4,71 triệu/video) |
| Thời gian máy | _chờ_ |
