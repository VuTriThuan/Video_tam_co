---
description: Sửa đúng phần đại ca nêu (kịch bản, cảnh, chữ) và chỉ quay lại phần đó
argument-hint: <yêu cầu sửa>
---
Yêu cầu: $ARGUMENTS (nếu trống: đọc mục `da_xu_ly: false` mới nhất trong `du-an/<slug>/duyet.json`, slug ở `du-an/hien-tai.json`).

1. `python3 dieu-hanh/su_kien.py giai-doan sua-<n>` (n = lần sửa thứ mấy, xem `du-an/<slug>/luot.json`).
2. Xác định đúng cảnh bị ảnh hưởng (id trong `canh.json`).
   - Sửa lời: sửa `kich-ban.md` + trường `loi` cảnh đó (hoặc nhờ Tuấn nếu đổi nhiều); chạy máy kiểm; đọc lại giọng **chỉ cảnh đó** nếu `pipeline/doc-giong.py` hỗ trợ, không thì đọc lại toàn bộ rồi `bien-do.py`.
   - Sửa hình/chữ: sửa trường tương ứng trong `canh.json`; chạy `python3 pipeline/kiem-canh.py && python3 pipeline/kiem-lap.py` và `node render/kiem-bo-cuc.mjs <phong-cach> --ds <id,...>` (chữ không đè nhân vật/đạo cụ).
   - Sửa bìa/tiêu đề: nhờ Vy.
3. Quay lại đúng cảnh: `node render/quay.mjs <phong-cach> --ra <slug>/video-day-du --ds <id,...> --sua` (**bắt buộc `--sua`**: giữ các cảnh khác và quay.json đủ cảnh), rồi `.venv/bin/python pipeline/ghep.py <slug>/video-day-du`, `pipeline/kiem-tra.sh ra/<slug>/video-day-du/video.mp4`, chép `video.mp4` vào `xuat-ban/<slug>/` và cập nhật `ra/<slug>/du-lieu/`. Phong cách: xem `logs/da-dung.json`.
   - **Chuỗi:** sau `ghep.py`, chạy `.venv/bin/python pipeline/ghep-chuoi.py <slug>/video-day-du`; kiểm từng phần bị ảnh hưởng `pipeline/kiem-tra.sh ra/<slug>/video-day-du/phan-<n>/video.mp4 60 90`; chép `video.mp4` thành `xuat-ban/<slug>/ban-goc.mp4` và `phan-<n>/video.mp4` vào `xuat-ban/<slug>/phan-<n>/`. Sửa bìa phần n: `node render/quay.mjs <pc> --ra <slug>/video-day-du --ds c01 --bia --phan n` rồi `.venv/bin/python pipeline/ghep-chuoi.py --bia ra/<slug>/video-day-du/phan-<n>/anh-bia.png <n> <N>`.
4. Đánh dấu mục trong `duyet.json` là `da_xu_ly: true`. Báo đại ca 2 dòng: đã sửa gì, cảnh nào được quay lại. Tối đa 2 vòng sửa bản nháp.
