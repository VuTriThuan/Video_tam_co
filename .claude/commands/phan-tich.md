---
description: Đức phân tích ảnh chụp số liệu 24 giờ của một video
argument-hint: <slug>
---
**Luồng sếp chỉnh trên web:** nếu có `dieu-hanh/luong.md`, đọc mục `phan-tich` trước khi giao việc. Bước nào luồng giao cho người khác, hoặc có thêm bước hay chốt duyệt, thì làm theo luồng (giao đúng người, dừng đúng chốt). Bước của Máy dựng vẫn chạy bằng script như dưới đây; luồng mâu thuẫn với script thì hỏi sếp. Không có file thì làm như dưới.

1. Kiểm `phan-tich/inbox/$ARGUMENTS/` có ảnh không (`ls`). Không có → nhắc sếp thả ảnh vào tab Phân tích hoặc thư mục đó, dừng.
2. `python3 dieu-hanh/su_kien.py bat-dau $ARGUMENTS phan-tich`
3. Gọi **Đức** (`phan-tich`): "Đức phân tích số liệu 24 giờ của $ARGUMENTS nhé, ảnh ở phan-tich/inbox/$ARGUMENTS/."
4. Báo sếp tối đa 4 dòng theo báo cáo của Đức + đường dẫn `phan-tich/bao-cao/$ARGUMENTS.md`.
