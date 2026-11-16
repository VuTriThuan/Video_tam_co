---
description: Đức phân tích ảnh chụp số liệu 24 giờ của một video
argument-hint: <slug>
---
1. Kiểm `phan-tich/inbox/$ARGUMENTS/` có ảnh không (`ls`). Không có → nhắc đại ca thả ảnh vào tab Phân tích hoặc thư mục đó, dừng.
2. `python3 dieu-hanh/su_kien.py bat-dau $ARGUMENTS phan-tich`
3. Gọi **Đức** (`phan-tich`): "Đức phân tích số liệu 24 giờ của $ARGUMENTS nhé, ảnh ở phan-tich/inbox/$ARGUMENTS/."
4. Báo đại ca tối đa 4 dòng theo báo cáo của Đức + đường dẫn `phan-tich/bao-cao/$ARGUMENTS.md`.
