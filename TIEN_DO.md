# TIẾN ĐỘ (đọc file này khi mở phiên mới: "làm tiếp theo TIEN_DO.md")

Kế hoạch: `CHAY_TOAN_BO.md` → Bước 3 (`BUOC_3_DOI_AGENT.md`) → Bước 4 (`BUOC_4_CHUOI_VIDEO_VA_HOAN_THIEN.md`).

## Bước 3 — đã dựng xong (2026-11-16), chờ nghiệm thu thật
- [x] kiem-lap.py: chặn trùng nội dung màn hình với video trước (log có trường `man_hinh`)
- [x] Agent mới: len-chu-de, hoa-si, dong-goi, phan-tich; cập nhật bien-kich, kiem-duyet
- [x] CLAUDE.md (Anh Hải) + 6 lệnh gạch chéo
- [x] Hook chan-vong-lap.sh + ghi-su-kien.sh + `.claude/settings.json`
- [x] Phòng điều hành `dieu-hanh/` (7 tab) + văn phòng 3D live + `./dieu-hanh.sh`
- [x] Máy dựng gửi tiến độ (quay.mjs, lam-mau.sh, chot-phong-cach.sh)
- [x] Phân tích: `phan-tich/` + `trung-vi.py`
- [x] Thử bằng giả lập (xem `bao-cao-buoc-3.md`)
- [x] Nghiệm thu thật (2026-11-16); còn `/phan-tich` chờ ảnh số liệu
- [x] Tự mở Phòng điều hành khi đăng nhập: đại ca chọn KHÔNG, mở tay bằng `./dieu-hanh.sh`

## Bước 4
- [ ] chưa bắt đầu (làm sau khi Bước 3 nghiệm thu)

## Quyết định đã có
- Luật chống lặp theo kiểu cảnh (bo_cuc+nen+goc_may) — đại ca đã chấp nhận.
- Chỉ Opus; xưng em, gọi đại ca; làm theo yêu cầu, không chạy lịch.
- Hook đếm lượt theo (agent, giai đoạn trong `du-an/hien-tai.json`); `/sua` mở giai đoạn mới `sua-n`.

## Việc tiếp theo (phiên mới)
1. ✅ (2026-11-16) `/goi-y` chạy thật OK; đã sửa su_kien.py cho agent chạy nền (báo cáo lấy ở SubagentStop: last_assistant_message hoặc SubagentHandback trong transcript). ~~Đại ca chạy `./dieu-hanh.sh`, gõ `/goi-y` → kiểm văn phòng 3D + bản tin với sự kiện thật. Nếu `dieu-hanh/loi-hook.log` có lỗi hoặc tin báo cáo không hiện: sửa `dieu-hanh/su_kien.py` theo dạng payload thật.~~
2. ✅ `/chu-de 2` DARVO xong → `xuat-ban/darvo/`.
3. ✅ Đo token: 4,71 triệu/~$2.83 một chủ đề (đã điền `bao-cao-buoc-3.md`).
4. Sang Bước 4.
