---
description: Chạy trọn quy trình một chủ đề (kịch bản → phong cách → bản nháp)
argument-hint: <tên chủ đề hoặc số trong chu-de/kho.md> [--le]
---
Chủ đề: $ARGUMENTS

**Luồng sếp chỉnh trên web:** nếu có `dieu-hanh/luong.md`, đọc mục `chu-de` trước khi giao việc. Bước nào luồng giao cho người khác, hoặc có thêm bước hay chốt duyệt, thì làm theo luồng (giao đúng người, dừng đúng chốt). Bước của Máy dựng vẫn chạy bằng script như dưới đây; luồng mâu thuẫn với script thì hỏi đại ca. Không có file thì làm như dưới.

**Định dạng:** có `--le` → video lẻ 75–90 giây. Không có → lấy định dạng ghi trong mục kho (`chuoi`/`le`); chủ đề tự đặt tên thì mặc định **chuỗi** (3–5 phần, mỗi phần 60–90 giây).

Làm theo `QUY_TRINH.md` với các vai sau. Dừng đúng 3 chốt; mỗi chốt hỏi đại ca một câu ngắn, kèm đường dẫn, nhắc có thể duyệt ở tab Duyệt (http://localhost:4747) rồi gõ "tiếp".

1. Nếu là số: đọc đúng mục đó trong `chu-de/kho.md` (chỉ mục đó). Chọn slug ngắn không dấu. `python3 dieu-hanh/su_kien.py bat-dau <slug>`. Đổi `trang_thai` của mục trong kho thành `dang-lam`.
2. **Tuấn** (`bien-kich`): giao chủ đề + **định dạng (lẻ/chuỗi, chuỗi thì gợi ý số phần)** + hook + góc kể + 3 ý chính (chuỗi: ý chính cho từng phần + chỗ cắt).
3. Máy kiểm: `python3 pipeline/kiem-canh.py && python3 pipeline/kiem-lap.py`. Lỗi khối/lặp → gửi nguyên văn lỗi cho Tuấn sửa đúng cảnh đó.
4. Có `de_xuat_khoi` → **Khoa** (`hoa-si`) vẽ, rồi chạy lại máy kiểm.
5. **Chị Mai** (`kiem-duyet`) rà lời.
6. **Chốt 1 — duyệt kịch bản:** gửi đại ca hook + số từ + số cảnh + đường dẫn `kich-ban.md` (chuỗi: số phần, số từ từng phần, câu cắt cuối mỗi phần). Dừng.
7. Đại ca duyệt → `su_kien.py giai-doan giong`; `su_kien.py trang-thai may-dung lam "Đọc giọng"`; `.venv/bin/python pipeline/doc-giong.py && .venv/bin/python pipeline/bien-do.py`; `su_kien.py tin may-dung truong-nhom "Đọc giọng xong: <số giây>"`.
8. `pipeline/lam-mau.sh <slug>` (chạy nền nếu lâu; mẫu lấy từ đầu phần 1). Script tự chạy **kiểm bố cục** (`render/kiem-bo-cuc.mjs`, ảnh lỗi ở `ra/<slug>/bo-cuc/`). Lỗi ✗ ở một cảnh (chữ đè đầu/tay nhân vật, chữ đè đạo cụ có chữ) → gửi Tuấn nguyên văn để sửa đúng cảnh đó (rút gọn `chu`, đổi `co`/`vi_tri`/`tu_the` nhân vật, đổi vị trí đạo cụ), rồi chạy lại `node render/kiem-bo-cuc.mjs tat-ca`; tối đa 1 vòng. Lỗi lặp ở nhiều cảnh cùng kiểu (do Máy dựng) → Khoa. ⚠ chữ hiện ngắn chỉ ghi chú cho đại ca. **Chốt 2 — chọn phong cách.** Dừng.
9. `pipeline/chot-phong-cach.sh <slug> <phong-cach>` (chạy nền; chuỗi tự ghép từng phần + `ban-goc.mp4`). Xem `ra/<slug>/video-day-du/contact-12.jpg`.
10. `su_kien.py giai-doan dong-goi`; **Vy** (`dong-goi`) viết `xuat-ban/<slug>/dang-bai.md`.
11. `su_kien.py giai-doan nhap`. **Chốt 3 — xem bản nháp:** `open xuat-ban/<slug>/video.mp4` (chuỗi: `open xuat-ban/<slug>/phan-1/video.mp4`, các phần khác và `ban-goc.mp4` xem ở tab Duyệt). Duyệt cả chuỗi một lần hoặc nêu phần cần sửa. Dừng. Sửa thì dùng `/sua`.
12. Đại ca duyệt bản nháp: đổi mục trong kho thành `da-lam`; báo thời gian máy (từ `ra/<slug>/video-day-du/thoi-gian.txt`); nhắc gõ `/clear` trước chủ đề sau.
