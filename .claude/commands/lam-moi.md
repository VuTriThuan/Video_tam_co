---
description: Đề xuất 2–3 khối/bối cảnh mới từ logs/da-dung.json (sau mỗi 10 video)
---
**Luồng sếp chỉnh trên web:** nếu có `dieu-hanh/luong.md`, đọc mục `lam-moi` trước khi giao việc. Bước nào luồng giao cho người khác, hoặc có thêm bước hay chốt duyệt, thì làm theo luồng (giao đúng người, dừng đúng chốt). Bước của Máy dựng vẫn chạy bằng script như dưới đây; luồng mâu thuẫn với script thì hỏi đại ca. Không có file thì làm như dưới.

1. `python3 dieu-hanh/su_kien.py bat-dau lam-moi lam-moi`
2. Đọc `logs/da-dung.json`; đếm bo_cuc, nen, goc_may, mở đầu dùng nhiều nhất trong 10 video gần nhất (viết lệnh python ngắn, không đọc bằng mắt). Xem danh sách tên trong `render/thu-vien/ten-khoi.json`.
3. Đếm thêm `hieu_ung` trong 10 video gần nhất. Hiệu ứng (trừ nhóm chú thích) **chưa dùng lần nào** trong 10 video → ghi vào danh sách **đề xuất bỏ** (tên + lý do), kèm đề xuất mới. Chỉ đề xuất; **không bỏ gì cho tới khi đại ca duyệt từng cái**. Đại ca duyệt bỏ → Khoa xoá khỏi `render/thu-vien/khoi.js` + `canh-chung.js`, sinh lại catalog, chạy `python3 pipeline/kiem-canh.py`.
3b. Đề xuất cho đại ca 2–3 khối hoặc bối cảnh mới (tên, mô tả 1 dòng, thay cho khối nào đang dùng nhiều). **Ghi tất cả (cả đề xuất bỏ ở bước 3) vào `du-an/lam-moi/de-xuat.json`** để đại ca duyệt trên trang Thư viện (máy chủ tự báo lên Bàn làm việc). Ghi đè cả file, mỗi đợt một file:
   `{"luc":"<ISO>","so_video":N,"muc":[{"id":"1","viec":"them|bo","ten":"<tên-khối>","nhom":"bo_cuc|nen|goc_may|hieu_ung|…","mo_ta":"…","thay_cho":"…","trang_thai":"cho"}]}`
   Báo đại ca ngắn: "Có N khối chờ duyệt ở Thư viện." **Dừng chờ đại ca duyệt.**
4. Đại ca duyệt (bấm trên web, hoặc nhắn trong chat thì em tự đổi `trang_thai` thành `duyet`/`khong`) → giao **Khoa** (`hoa-si`) vẽ từng mục `trang_thai: "duyet"`. Xong đặt `da_xu_ly: true` ở mục cuối `du-an/lam-moi/duyet.json`. Báo lại tên khối mới.
