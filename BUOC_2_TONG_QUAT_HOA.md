# BƯỚC 2: TỔNG QUÁT HÓA DÀN CẢNH + THỬ CHỦ ĐỀ THỨ HAI

> **Gửi Claude Code:** Bản thử đã khả thi (xem `bao-cao.md`, `QUY_TRINH.md`). Nút thắt lớn nhất là **dàn cảnh còn viết tay cho từng cảnh** của chủ đề `ghet-ngam` (`render/canh-chung.js`, c01–c21). Bước này biến dàn cảnh thành **ráp theo dữ liệu**, để chủ đề mới gần như không phải viết code nữa. Sau đó làm thử chủ đề thứ hai để đo token thật cho mỗi video.
> Giữ nguyên mọi thứ đã chốt: giọng KorvaTTS `gia_bao` (CPU), kịch bản 280–300 từ, 3 phong cách (`bang-trang`, `truyen-tranh`, `tranh-tinh-zoom`), kênh Tâm Cơ, không chạy theo lịch. Chỉ dùng Opus, không dùng Fable. Xưng "em", gọi "sếp".

## 1. Thư viện khối dựng (làm một lần)

Tạo `render/thu-vien/` và `docs/catalog.md`, gom mọi thứ đã vẽ cho `ghet-ngam` thành **khối dùng lại được**, có tên ngắn không dấu:

| Nhóm | Ví dụ khối (bổ sung thêm cho đủ dùng chung) |
|---|---|
| Nhân vật | vai: `minh`, `dong-nghiep-nam`, `dong-nghiep-nu`, `sep`, `nhom`. Tư thế: `dung`, `khoanh-tay`, `om-dau`, `chi-tay`, `quay-lung`, `ngoi-ban`, `nhin-dien-thoai`, `gio-tay`, `thi-tham`, `nhun-vai`. Biểu cảm theo `bieu_cam` sẵn có. |
| Đạo cụ | `dien-thoai`, `laptop`, `dong-ho`, `chuong`, `kinh-lup`, `dau-hoi`, `dau-than`, `ngoi-sao`, `tai-lieu`, `coc-ca-phe`, `mat-trang`, `phong-bi`, `ban-hop`, `cua` |
| Màn hình | `nhom-chat` (tên nhóm, thành viên, tin nhắn), `email`, `tai-lieu`, `thong-bao`, `tin-nhan-rieng`, `lich-hop` (nội dung truyền qua tham số, không viết cứng) |
| Bố cục | số người 1–4, vị trí `trai/giua/phai`, `doi-dien`, `nhom-quay-lung`, `mot-minh-giua-dam-dong` |
| Hiệu ứng | `vong-tron-do`, `gach-cheo`, `tick`, `so-thu-tu`, `mui-ten`, `rung`, `zoom-vao` |

Mỗi khối phải vẽ được ở cả **3 phong cách** (dùng lớp chất liệu đã có trong `net-co-ban.js`).

## 2. Mở rộng `canh.json` theo cấu trúc

Mỗi cảnh thêm trường có cấu trúc, ví dụ:
```json
{"id":"c03","loi":"...","chu":"Thiếu đúng tên mình","bo_cuc":"dien-thoai",
 "nhan_vat":[{"vai":"minh","tu_the":"nhin-dien-thoai","bieu_cam":"ngac-nhien","vi_tri":"trai"}],
 "dao_cu":[],"man_hinh":{"loai":"nhom-chat","ten":"Cả Phòng Mình","thanh_vien":12,"thieu":"Minh"},
 "hieu_ung":["gach-cheo"],"sfx":["tin-nhan","thud"]}
```
- `render/canh-chung.js` trở thành **bộ ráp thuần dữ liệu**: đọc các trường trên rồi ghép khối, không còn `if (id === "c03")`.
- **Kiểm tra hồi quy:** chuyển 21 cảnh `ghet-ngam` sang dạng dữ liệu, quay lại contact sheet, so với bản cũ. Phải giống ở mức nhìn được, rồi mới xóa code viết tay.
- `pipeline/kiem-canh.py` (không tốn token): kiểm tra `canh.json` đúng cấu trúc, mọi khối đều có trong thư viện. Khối nào thiếu thì in danh sách.

## 3. Sửa 2 agent

- `bien-kich`: chỉ được dùng tên khối có trong `docs/catalog.md` (giữ file catalog ngắn, dạng danh sách). Thiếu khối thật sự cần thì ghi vào `"de_xuat_khoi"`, không tự chế tên.
- `kiem-duyet`: chạy `pipeline/kiem-canh.py` thay vì tự đọc soát JSON.
- Khối mới được đề xuất: phiên chính vẽ **một lần**, thêm vào thư viện và catalog để chủ đề sau dùng lại.

## 4. Thử chủ đề thứ hai và đo token

- Chủ đề: **"3 câu nói của người đang thao túng bạn nơi công sở"** (đúng chất Tâm Cơ: dạy nhận ra chiêu và cách đáp lại). Sếp muốn đổi chủ đề thì đổi.
- Chạy đúng `QUY_TRINH.md` (đã cập nhật theo bước này): kịch bản → **sếp duyệt** → giọng → 3 mẫu → **sếp chọn** → bản đầy đủ → gói đăng → **sếp xem**.
- **Đo token riêng cho chủ đề này:** ghi giờ bắt đầu/kết thúc, dùng `npx ccusage@latest session --offline` (hoặc `blocks`) lấy đúng phần của phiên này. Tách số liệu: token của 2 agent, token điều phối, token viết khối mới (nếu có).

## 5. Chống lặp hình (để xem nhiều video không thấy nhàm)

Dùng chung thư viện cho mọi chủ đề thì giữ được nhận diện kênh, nhưng dễ lặp. Làm thêm những việc sau:

**5.1. Thư viện phải có biến thể**
- **Nhân vật chính "Minh" giữ cố định** (nhận diện kênh), chỉ đổi tư thế và biểu cảm. Mỗi tư thế có ít nhất 2 biến thể (ví dụ `khoanh-tay` đứng thẳng / nghiêng người).
- **Nhân vật phụ ráp từ tham số**: kiểu tóc (≥5), màu áo (≥6), kính có/không, dáng người (≥3). Mỗi chủ đề lấy một `seed` để ra bộ đồng nghiệp/sếp riêng, nhìn như người khác nhau.
- **Bối cảnh nền (≥7):** văn phòng mở, phòng họp, góc pantry/cà phê, thang máy, phòng sếp, quán cà phê ngoài giờ, ở nhà buổi tối. Mỗi bối cảnh vẽ được ở cả 3 phong cách. Mỗi video dùng 2–4 bối cảnh.
- **Góc máy (5 loại):** `can` (cận mặt), `trung`, `toan`, `tu-tren`, `qua-vai`.
- **Tông màu theo chủ đề (≥6):** giữ đen + đỏ thương hiệu, chỉ đổi tông nền: `hoang-hon` (cam), `dem-xanh`, `sang-xam`, `mua-tim`, `binh-minh` (hồng nhạt), `den-vang` (đèn vàng ấm).

**5.2. `canh.json` thêm trường:** `"nen"`, `"goc_may"`, và một `"tong_mau"` chung cho cả video. `bien-kich` phải điền đủ, và chỉ dùng tên có trong `docs/catalog.md`.

**5.3. Script `pipeline/kiem-lap.py`** (chạy cùng `kiem-canh.py`, không tốn token). Vi phạm thì in ra để `bien-kich` sửa đúng cảnh đó:
- Trong một video:
  - một `bo_cuc` dùng tối đa 2 lần, không 2 cảnh liền nhau cùng `bo_cuc`;
  - ít nhất 3 loại `goc_may`;
  - một nền không quá 4 cảnh liên tiếp;
  - một kiểu chuyển cảnh không quá 3 lần liên tiếp.
- Giữa các video: lưu lại mỗi video đã dùng gì vào `logs/da-dung.json` (bố cục, nền, góc máy, tông màu, cảnh mở đầu, phong cách).
  - **Cảnh mở đầu (3 giây hook) không được giống 5 video gần nhất** (khác ít nhất bố cục hoặc nền).
  - Tông màu không trùng 2 video gần nhất.
  - Cùng một phong cách 3 video liền thì báo sếp một dòng lúc chọn mẫu (vẫn để sếp quyết).

**5.4. Làm mới định kỳ:** cứ sau 10 video, phiên chính đọc `logs/da-dung.json`, liệt kê khối/bố cục bị dùng nhiều nhất, đề xuất 2–3 khối hoặc bối cảnh mới. **Sếp duyệt** rồi mới vẽ thêm (vẽ một lần, dùng mãi). Khi nào có agent phân tích: nếu bình luận chê "lặp", "nhàm" thì ưu tiên làm mới.

**5.5. Kiểm tra trong bước này:** sau khi làm xong chủ đề 2, xuất contact sheet của `ghet-ngam` và chủ đề 2 đặt cạnh nhau. Nhìn phải thấy rõ là cùng một kênh, nhưng là hai video khác nhau (khác nền, tông, bộ đồng nghiệp, cảnh mở đầu).

## 6. Báo cáo `bao-cao-buoc-2.md`

| Hạng mục | Kết quả |
|---|---|
| Hồi quy `ghet-ngam` sau khi chuyển sang dữ liệu | đạt / lệch ở cảnh nào |
| Số khối trong thư viện, số khối phải vẽ thêm cho chủ đề 2 | |
| Token chủ đề 2 (tổng, agent, điều phối, khối mới) | |
| Thời gian máy chủ đề 2 | |
| Ước tính: gói Pro làm được bao nhiêu video/tuần | |
| Còn chỗ nào phải viết code tay cho mỗi chủ đề | |
| Chống lặp: số bối cảnh, biến thể nhân vật phụ, tông màu đã có; `kiem-lap.py` bắt được bao nhiêu lỗi ở chủ đề 2 | |
| Contact sheet 2 chủ đề đặt cạnh nhau | đường dẫn file |

Cập nhật `QUY_TRINH.md` theo cách làm mới. Gặp lỗi không tự xử lý được sau 2 lần thử: dừng và hỏi sếp.
