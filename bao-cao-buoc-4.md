# Báo cáo Bước 4: Chuỗi video + hoàn thiện

> Trạng thái: **đã nghiệm thu bằng chuỗi thật `cuop-cong` (2026-11-16)**. `./kiem-tra-he-thong.sh`: ĐẠT TOÀN BỘ (chỉ còn `/phan-tich` chờ ảnh số liệu thật).

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

## Nghiệm thu thật — chuỗi `cuop-cong` (2026-11-16)
| Chỉ số | Giá trị |
|---|---|
| Chủ đề chuỗi | Kẻ cướp công (kho mục 1), phong cách tranh điện ảnh (`tranh-tinh-zoom`) |
| Số phần / thời lượng | 3 phần: 87,1 s · 81,9 s · 81,0 s; bản gốc 245,5 s; 61 cảnh, 818 từ |
| Kiểm tra | 3 phần + bản gốc đạt 9/9 (sau khi sửa tay, xem dưới) |
| Token phiên (đếm từ transcript, gồm agent con) | **9,41 triệu** (~$5,6 nếu tính theo tỉ lệ giá của Bước 3) |
| — phiên chính (Anh Hải) | 8,97 triệu (≈98% đọc cache), ra 33K |
| — Tuấn 297K · Chị Mai 481K · Vy 88K | 0,87 triệu, ra 85K |
| Token trung bình mỗi video đăng | ≈3,1 triệu/phần (lẻ: 4,71 triệu/video) |
| Thời gian máy | đọc giọng ~4 phút; 3 mẫu ~4 phút; quay 592 s + ghép 163 s; sửa c45 + ghép lại ~3 phút → **~24 phút máy** |
| Thời gian từ đầu đến cuối | ~62 phút (08:08→09:10 UTC, gồm thời gian đại ca duyệt) |

Ghi chú đo: `npx ccusage` bị chặn tải gói trong phiên, nên cộng `usage` trực tiếp từ transcript (`~/.claude/projects/.../<phiên>.jsonl` + `subagents/*.jsonl`, bỏ trùng theo message id).

## Lỗi gặp khi chạy thật (đã xử lý tay, CHƯA sửa gốc)
1. **Tuấn ghi file vào `du-an/<slug>/`** trong khi máy kiểm và bộ dựng đọc `canh.json`/`video.json`/`kich-ban.md` ở thư mục gốc → máy kiểm chạy nhầm bản cũ (DARVO) và báo "ĐẠT". Phải chép tay lên gốc. → Sửa `bien-kich.md` (ghi ở gốc + bản lưu `du-an/<slug>/`) hoặc cho script nhận slug.
2. **`so-sanh` + `goc_may: can` cắt mất hai bên khung**: chỉ còn một người giữa vạch chia. Thêm vào đó hai nhân vật cùng vai `minh`. Đổi người phải sang `dong-nghiep-nam` + `goc_may: toan` thì đúng. → `kiem-canh.py` nên cấm `so-sanh` với `can`, và cấm trùng `vai` trong một cảnh.
3. **Đỉnh âm bản gốc và phần 1 vượt -1,5 dB** (true peak -0,6) dù loudnorm TP=-2,5 → `chot-phong-cach.sh` dừng trước khi chép `xuat-ban/`. Đã hạ bằng `alimiter` sau ghép rồi chạy nốt bước chép tay. → Thêm limiter cuối trong `ghep.py`/`ghep-chuoi.py` (sau loudnorm, trước AAC).
4. **Chị Mai chạm giới hạn 5 lượt** hai lần, không kịp báo cáo (vẫn sửa file). → Nới `maxTurns` của `kiem-duyet` hoặc bảo chị gom lệnh.
5. **Hook `chan-vong-lap.sh` tính cả lượt giao bị lỗi** (2 lần Agent lỗi do bộ phân loại không trả lời) → lượt sửa thứ hai của Tuấn bị chặn, Anh Hải tự sửa.
6. Mẫu `bang-trang` và `tranh-tinh-zoom` -15,1 LUFS (sát ngưỡng -15) — không ảnh hưởng chọn phong cách.
