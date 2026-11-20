# Kịch bản quay demo hệ thống Tâm Cơ

Video **không lời**: thông tin đi bằng **chữ chèn** và **nhạc nền**. Bản đầy đủ 6–8 phút, bản ngắn 90 giây (cuối file).

Cách đọc mỗi cảnh:
- **Bắt đầu từ:** màn hình phải ở trạng thái này trước khi bấm quay.
- **Các bước:** làm đúng thứ tự, chậm hơn bình thường một chút. Sau mỗi cú bấm, **để chuột yên 2 giây** cho người xem kịp nhìn.
- **Chữ chèn:** chèn lúc dựng, mỗi dòng đứng ít nhất 2,5 giây, đặt cố định ở đáy màn hình.
- **Dừng quay khi:** dấu hiệu cảnh đã xong.

Ký hiệu khi dựng: **[TUA xN]** tua nhanh N lần · **[ZOOM]** phóng to vùng đó · **[CẮT]** bỏ đoạn chờ.

---

## 1. Chuẩn bị (làm trước một ngày)

### Dữ liệu
- [ ] Chọn **1 chủ đề chưa làm** trong mục Chủ đề (lọc "Chưa làm"). Chọn tên dễ hiểu với người xem, ví dụ chủ đề về sếp hoặc đồng nghiệp. Làm dạng **Lẻ**.
- [ ] In hoặc ghi ra giấy **2 câu yêu cầu sửa** để gõ trơn tru:
  - Chốt 1 (kịch bản): `Hook chưa đủ gắt. Dùng hook thay thế số 2, câu kết ngắn lại.`
  - Chốt 3 (bản nháp): `Đoạn giây 0:20 đến 0:25, chữ trên màn hình điện thoại nhỏ quá, phóng to lên.` (xem bản nháp rồi đổi số giây cho khớp một đoạn có chữ trên điện thoại hoặc bảng)
- [ ] 4 ảnh thống kê TikTok **mẫu** của DARVO đã có ở `demo/so-lieu-tiktok-darvo/` (số liệu dựng cho demo). Thư mục `phan-tich/inbox/darvo/` đang trống, đúng như cần.
- [ ] Hiện có **6 video**, máy chưa tự nhắc làm khối mới. Cảnh Khoa sẽ bấm tay nút **Đề xuất khối mới**: em đã kiểm, nút chạy được dưới 10 video.

### Máy
- [ ] Mở Terminal, `cd ~/Desktop/video_tam_co`, chạy `./kiem-tra-he-thong.sh`: phải xanh hết.
- [ ] Đã đăng nhập Claude. Mở ứng dụng Claude → Cài đặt → Usage: nên bắt đầu khi khung 5 giờ **vừa làm mới**.
- [ ] Bật **Không làm phiền** (Trung tâm điều khiển → Tập trung), ẩn Dock (Cmd+Option+D), dọn biểu tượng màn hình nền.
- [ ] Chrome: mở **cửa sổ mới** chỉ có tab localhost:4747, ẩn thanh dấu trang (Cmd+Shift+B), phóng to 110% (Cmd +).
- [ ] Chọn một giao diện sáng hoặc tối (nút ở đáy cột trái Phòng điều hành) và **giữ nguyên suốt video**. Gợi ý: sáng, dễ đọc khi xem trên điện thoại.
- [ ] Phóng to con trỏ chuột: Cài đặt hệ thống → Trợ năng → Màn hình → Con trỏ → Kích thước, kéo lên khoảng 1/3.
- [ ] Phần mềm quay: QuickTime (Cmd+Shift+5 → Quay toàn màn hình) hoặc OBS 1920×1080, 30 khung/giây.
- [ ] Terminal: phông 20pt, gõ `clear` trước khi quay.

### Không được lọt vào khung hình
- Email, tên tài khoản Claude, đường dẫn `/Users/trithuan` (che lúc dựng nếu lộ).
- File `dieu-hanh/cau-hinh.json`, `.claude/settings.json`.
- Thẻ **Phiên làm việc** ở mục Hệ thống: không cuộn tới.

---

## 2. Thứ tự quay thực tế (khác thứ tự dựng)

Quay theo **3 buổi**. Buổi 2 là một lần chạy thật, không quay lại được, nên làm cẩn thận nhất.

| Buổi | Cảnh | Thời gian ngồi | Ghi chú |
|---|---|---|---|
| 1 | 0, 1, 2, 3, 14 | 15 phút | Không tốn token. Quay lúc nào cũng được, quay hỏng thì quay lại |
| 2 | 4 → 10 | 40–60 phút | Chạy thật một chủ đề lẻ. **Quay liền một mạch**, không tắt máy quay giữa các cảnh |
| 3 | 12, 13 | 30–60 phút | Đức và Khoa. Nên làm ở một khung 5 giờ khác buổi 2 |

**Mẹo cho buổi 2:** để máy quay chạy liên tục từ cảnh 4 tới cảnh 10, ghi lại giờ đồng hồ mỗi khi có việc đáng chú ý ("14:32 thẻ đỏ hiện"). Lúc dựng chỉ việc tìm đúng phút đó, không sợ lỡ khoảnh khắc nào.

---

## 3. Kịch bản từng cảnh

### PHẦN A — GIỚI THIỆU (≈ 1 phút)

#### Cảnh 0. Màn tiêu đề (5 giây) — làm lúc dựng, không cần quay
- Nền tối, logo Tâm Cơ ở giữa (`assets/logo/`).
- **Chữ chèn:** `TÂM CƠ` → `Một kênh video. 6 nhân viên AI. 1 người duyệt.`

#### Cảnh 1. Bật hệ thống (15 giây)
**Bắt đầu từ:** Terminal đang mở, đã ở thư mục `video_tam_co`, màn hình sạch.
1. Gõ chậm `./dieu-hanh.sh`, bấm Enter.
2. Chờ Chrome tự mở trang Phòng điều hành.
3. Để yên 3 giây ở trang Bàn làm việc.

**Chữ chèn:** `Một lệnh để mở văn phòng` → (khi trang hiện) `Phòng điều hành`
**Dừng quay khi:** trang đã tải xong, văn phòng 3D hiện ra.

#### Cảnh 2. Văn phòng 3D (20 giây)
**Bắt đầu từ:** mục **Bàn làm việc**, chưa có việc chạy (thẻ trên cùng ghi "Hôm nay làm chủ đề nào, sếp?").
1. Rê chuột xuống khung văn phòng 3D (có dòng chữ "TÂM CƠ STUDIO" phía trên).
2. Nhấn giữ chuột trái, **kéo chậm sang ngang** cho bàn cờ xoay khoảng nửa vòng (5–6 giây).
3. Thả chuột, rê lên từng ô nhân viên để hiện tên.
4. Bấm **Xoay về giữa** (góc phải trên khung 3D).

**Chữ chèn:** `Mỗi ô là một nhân viên` → `Anh Hải · Trưởng nhóm. Sếp chỉ nói chuyện với Hải`
**Dựng:** [ZOOM] vào ô anh Hải ở giữa khi hiện chữ thứ hai.

#### Cảnh 3. Đội ngũ (20 giây)
**Bắt đầu từ:** Bàn làm việc.
1. Cột trái, bấm **Đội ngũ**.
2. Cuộn chậm từ trên xuống dưới, mỗi hàng thẻ dừng 2 giây.
3. Dừng ở thẻ **Máy dựng**.

**Chữ chèn (đổi theo hàng thẻ đang thấy):**
`Linh · Nghiên cứu chủ đề` → `Tuấn · Biên kịch · Chị Mai · Kiểm duyệt` → `Khoa · Họa sĩ · Vy · Đăng bài · Đức · Số liệu` → `Máy dựng: chạy tự động, không tốn token`
**Dựng:** [ZOOM] nhãn "Máy tự động" trên thẻ Máy dựng.

---

### PHẦN B — LÀM MỘT VIDEO TỪ ĐẦU ĐẾN CUỐI (≈ 4 phút) · Buổi 2

> Bật máy quay từ đây và để chạy liên tục tới hết cảnh 10.

#### Cảnh 4. Kho chủ đề — Linh (25 giây)
**Bắt đầu từ:** Bàn làm việc.
1. Cột trái, bấm **Chủ đề**.
2. Lọc **Chưa làm** (nút đầu tiên trên hàng lọc).
3. Cuộn chậm qua vài thẻ, mỗi thẻ có số, tên, câu hook.
4. Trên thẻ chủ đề đã chọn: bấm **Góc kể và ý chính** cho mở ra, để yên 3 giây.
5. Rê chuột lên ô **Chủ đề của riêng sếp** ở đầu trang (không gõ gì).

**Chữ chèn:** `Linh tìm chủ đề từ tâm lý học và bài học cũ` → `Mỗi chủ đề có sẵn hook và góc kể` → `Hoặc sếp tự đặt chủ đề`

> Không bấm "Nhờ Linh gợi ý 10 chủ đề mới" để khỏi tốn lượt. Kho đang có sẵn chủ đề là đủ.

#### Cảnh 5. Giao việc (35 giây)
**Bắt đầu từ:** mục Chủ đề, thẻ chủ đề đã chọn đang ở giữa màn hình.
1. Trên thẻ đó, bấm **Lẻ**.
2. Bấm **Làm chủ đề này**.
3. Hộp "Bắt đầu chủ đề #…?" hiện ra: để yên 2 giây, bấm **Bắt đầu**.
4. Trang tự chuyển về **Bàn làm việc**: thẻ trên cùng thành "Đội đang làm việc", bên dưới hiện dải 6 bước *Kịch bản → Giọng đọc → 3 mẫu phong cách → Dựng đầy đủ → Gói đăng bài → Bản nháp*.
5. Mở khung trò chuyện (nút tròn góc phải dưới, nếu chưa mở), bấm tab **Cả đội**.
6. Để yên, chờ tin anh Hải giao việc cho Tuấn hiện ra. Trên khung 3D có sợi dây xanh nối Hải với Tuấn.
7. Cứ để máy quay chạy. Tuấn viết xong thì dây chuyển sang Chị Mai.

**Chữ chèn:** `Một cú bấm: cả đội vào việc` → `6 bước, sếp chỉ duyệt 3 lần` → `Hải giao kịch bản cho Tuấn` → `Mọi lời giao việc đều hiện ở đây` → `Chị Mai rà lời, máy kiểm cảnh và chống lặp`
**Dựng:** [ZOOM] dải 6 bước; [ZOOM] sợi dây xanh; [TUA x10] đoạn chờ Tuấn viết, đồng hồ góc màn hình `+6 phút`.
**Chờ khoảng:** 5–8 phút.

#### Cảnh 6. Chốt 1: duyệt kịch bản, có yêu cầu sửa (60 giây)
**Bắt đầu từ:** Bàn làm việc, thẻ trên cùng chuyển sang **"Đang chờ sếp · Duyệt kịch bản"**.
1. Bấm **Mở để duyệt** trên thẻ đó.
2. Trang Duyệt mở sẵn khung **1 Kịch bản** (có nhãn đỏ "Đang chờ sếp").
3. Cuộn chậm đọc lời thoại (5–6 giây), dừng ở mục **Hook thay thế**.
4. Bấm vào ô **"Ghi chú cho anh Hải…"**, gõ chậm câu sửa đã chuẩn bị.
5. Bấm **Yêu cầu sửa**. Thông báo nhỏ "Đã ghi và báo anh Hải làm tiếp" hiện ra.
6. Mở lại khung trò chuyện, tab Cả đội: chờ tin Hải giao Tuấn sửa hook.
7. Khi Bàn làm việc lại hiện thẻ "Duyệt kịch bản": bấm **Mở để duyệt**, cuộn tới câu mở đầu mới.
8. Bấm **Duyệt** (nút đậm cạnh "Yêu cầu sửa").

**Chữ chèn:** `Chốt 1/3: sếp đọc kịch bản` → `Tuấn luôn viết kèm hook dự phòng` → `Chưa ưng? Ghi rõ chỗ cần sửa` → `Không cần gõ lệnh, Hải tự làm tiếp` → `Tuấn sửa đúng chỗ đó` → `Ưng rồi: Duyệt`
**Dựng:** [ZOOM] mục Hook thay thế; [ZOOM] câu hook cũ và mới đặt cạnh nhau (chụp màn hình trước và sau); [TUA x10] đoạn chờ sửa, `+3 phút`.
**Lưu ý:** mỗi kịch bản chỉ sửa **1 vòng**. Bản sửa chưa ưng lắm cũng bấm Duyệt.

#### Cảnh 7. Chốt 2: chọn phong cách (45 giây)
**Bắt đầu từ:** sau khi duyệt kịch bản, Bàn làm việc báo "Đội đang làm việc", thanh tiến độ của Máy dựng chạy.
1. Để máy quay chạy qua đoạn Máy dựng đọc giọng và làm 3 mẫu.
2. Thẻ chuyển sang **"Đang chờ sếp · Chọn phong cách"**: bấm **Mở để duyệt**.
3. Khung **2 Chọn phong cách** mở với 3 video mẫu. Bấm **▶ Phát cả 3 cùng lúc**.
4. Để 3 mẫu chạy **8–10 giây** cho người xem so sánh.
5. Bấm **Chọn Truyện tranh** dưới mẫu truyện tranh.

**Chữ chèn:** `Máy dựng đọc giọng, làm 3 mẫu` → `Chốt 2/3: chọn phong cách` → `Bảng trắng · Truyện tranh · Tranh điện ảnh` → `Chọn 1, hai mẫu còn lại tự xoá`
**Dựng:** [TUA x16] đoạn làm mẫu, `+6 phút`.
**Vì sao chọn Truyện tranh:** kênh chưa có video truyện tranh nào (5 video tranh điện ảnh, 1 bảng trắng). Chọn truyện tranh thì cảnh kết có đủ 3 phong cách. 2 video gần nhất đều là tranh điện ảnh nên máy sẽ nhắc đổi phong cách. Nếu thấy dòng nhắc này thì quay lại, đây là một chi tiết hay.

#### Cảnh 8. Dựng bản đầy đủ (20 giây sau khi tua)
**Bắt đầu từ:** vừa chọn phong cách.
1. Về **Bàn làm việc**. Thẻ "Đội đang làm việc" có thanh tiến độ và dòng việc của Máy dựng (cảnh 1/…, 2/…).
2. Để máy quay chạy. Thỉnh thoảng rê chuột lên ô Máy dựng trên khung 3D.
3. Tới lúc Vy (Đăng bài) sáng lên: Máy dựng đã xong, Vy đang viết gói đăng.

**Chữ chèn:** `Máy dựng quay từng cảnh, 3 luồng song song` → `Tự kiểm 10 mục: khung đen, chữ bị che, thời lượng` → `Vy viết tiêu đề, mô tả, hashtag`
**Dựng:** [TUA x30], đồng hồ `+11 phút`.
**Chờ khoảng:** 11–15 phút.

#### Cảnh 9. Chốt 3: xem bản nháp, sửa một đoạn (60 giây)
**Bắt đầu từ:** thẻ **"Đang chờ sếp · Xem bản nháp"**.
1. Bấm **Mở để duyệt**. Khung **3 Bản nháp** mở với video.
2. Bấm phát, xem 10–15 giây. Bấm nút toàn màn hình của video rồi thoát ra (Esc).
3. Bấm mở **Gói đăng bài của Vy**, cuộn lướt qua, thu lại.
4. Bấm vào ô ghi chú, gõ câu sửa đã chuẩn bị (đổi số giây cho đúng đoạn có chữ).
5. Bấm **Yêu cầu sửa**.
6. Về Bàn làm việc: dải bước hiện bước sửa, Máy dựng chỉ quay lại **đúng cảnh đó**.
7. Thẻ "Xem bản nháp" hiện lại: mở, tua video tới đúng đoạn vừa sửa, phát.
8. Bấm **Duyệt**.

**Chữ chèn:** `Chốt 3/3: xem bản nháp` → `Gói đăng bài đã có sẵn` → `Sửa đúng một đoạn` → `Chỉ quay lại cảnh đó, không dựng lại cả video` → `Xong`
**Dựng:** [ZOOM] đoạn trước và sau khi sửa, đặt cạnh nhau; [TUA x16], `+4 phút`.

#### Cảnh 10. Gói đăng bài — Vy (30 giây)
**Bắt đầu từ:** vừa duyệt bản nháp.
1. Cột trái, bấm **Đăng bài**. Thẻ video mới nằm trên cùng.
2. Rê chuột chậm qua: video, ảnh bìa, tiêu đề, mô tả, hashtag, bình luận ghim.
3. Rê lên dòng tiêu đề đầu tiên → bấm **Sao chép** hiện ra.
4. Bấm **Đánh dấu đã đăng**.

**Chữ chèn:** `Vy viết sẵn mọi thứ để đăng` → `Rê chuột, bấm, dán` → `Đăng xong, đánh dấu để Đức theo dõi`
**Dừng quay buổi 2 tại đây.**

#### Cảnh 11. Đăng TikTok (15 giây, không bắt buộc)
- Quay màn hình điện thoại (iPhone: Trung tâm điều khiển → Ghi màn hình): mở TikTok, chọn video, dán tiêu đề, bấm Đăng.
- **Chữ chèn:** `Sếp tự đăng, hệ thống không đụng vào tài khoản`
- Che tên tài khoản và số người theo dõi lúc dựng.

---

### PHẦN C — CÁC TÌNH HUỐNG KHÁC (≈ 2 phút) · Buổi 3

#### Cảnh 12. Phân tích số liệu TikTok — Đức (50 giây)
**Bắt đầu từ:** mục **Đăng bài**, Finder đã mở sẵn thư mục `demo/so-lieu-tiktok-darvo/` ở cửa sổ nhỏ góc phải (che đi bằng Chrome, cần mới kéo ra).
1. Ở mục Đăng bài, dòng nhắc **"Đã hơn 24 giờ từ lúc đăng Góp ý sếp…"** hiện trên đầu trang. Để yên 2 giây.
2. Bấm **Gửi số liệu cho Đức** trên dòng nhắc. Trang chuyển sang mục **Phân tích**.
3. Ô **Video**: chọn video DARVO (tiêu đề "Góp ý sếp một câu…").
4. Chuyển sang Finder, chọn cả 4 ảnh, bấm **Space** để xem nhanh, bấm mũi tên phải lướt qua 4 ảnh (mỗi ảnh 2 giây), bấm Space đóng lại.
5. Kéo cả 4 ảnh thả vào ô **"Kéo thả ảnh chụp màn hình vào đây"**. 4 ảnh nhỏ hiện ra, dòng chữ ghi "4 ảnh đang chờ Đức đọc".
6. Bấm **Giao Đức phân tích**.
7. Về Bàn làm việc: ô Đức sáng lên. Để máy quay chạy tới khi Đức xong.
8. Quay lại mục **Phân tích**: biểu đồ **Lượt xem mỗi video** có thêm cột darvo · tiktok (23,6k) cao hơn cột bi-cuop-loi · tiktok (18,4k).
9. Cuộn xuống **Bảng số liệu**: dòng darvo mới.
10. Cuộn xuống **Bài học chung**: dừng ở bài học mới nhất.

**Chữ chèn:** `24 giờ sau khi đăng` → `Chụp màn hình thống kê TikTok` → `Thả ảnh vào, không cần gõ số` → `Đức đọc ảnh, tự trích từng con số` → `So với các video trước` → `Bài học chuyển thẳng cho Linh, Tuấn, Vy`
**Dựng:** [TUA x10] đoạn Đức làm, `+4 phút`; [ZOOM] cột darvo trên biểu đồ; [ZOOM] ô "27.3" trong bảng; [ZOOM] bài học mới.
**Chờ khoảng:** 3–5 phút.

#### Cảnh 13. Khoa vẽ khối mới (60 giây)
**Bắt đầu từ:** Bàn làm việc, không có việc nào đang chạy.
1. Cột trái, bấm **Thư viện**.
2. Cuộn chậm qua các nhóm khối: mỗi khối ghi số lần đã dùng. Viền đỏ là khối dùng nhiều nhất, khối mờ là chưa dùng lần nào.
3. Cuộn lên đầu trang, bấm **Đề xuất khối mới** (góc phải trên). Bấm là chạy luôn, không có hộp hỏi lại.
4. Về Bàn làm việc, chờ Hải đếm và đề xuất.
5. Thẻ trên cùng thành **"Đang chờ sếp · Duyệt khối mới"**: bấm **Mở để duyệt**.
6. Thẻ **Khối mới chờ duyệt** hiện danh sách, mỗi khối có ô tích, tên, mô tả, "thay cho" khối nào.
7. **Chỉ giữ tích 1 khối** (khối dễ hình dung nhất), bỏ tích các khối còn lại từng cái một. Chữ phía dưới đổi thành "Duyệt 1/N khối".
8. Gõ vào ô **"Ghi chú cho Khoa"** một câu ngắn, ví dụ: `Vẽ rõ, nhìn trên điện thoại vẫn đọc được.`
9. Bấm **Duyệt**.
10. Về Bàn làm việc: dây xanh nối Hải với Khoa. Để máy quay chạy tới khi Khoa xong.
11. Mở Finder thư mục `scratch/` trong dự án, tìm 3 ảnh `thu-<tên khối>-bang-trang.jpg`, `…-truyen-tranh.jpg`, `…-tranh-tinh-zoom.jpg`. Chọn cả 3, bấm Space, lướt qua.
12. Quay lại mục **Thư viện**: khối mới nằm ở **Khối đã duyệt gần đây**, và có trong nhóm của nó với số dùng 0.

**Chữ chèn:** `Hệ thống đếm hình nào dùng quá nhiều` → `Hải đề xuất hình mới` → `Sếp chọn khối nào được vẽ` → `Khoa vẽ` → `Mỗi khối kiểm trên cả 3 phong cách` → `Khối mới vào thư viện, Tuấn dùng được ngay`
**Dựng:** [TUA x10] đoạn Hải đề xuất; [TUA x20] đoạn Khoa vẽ, `+15 phút`; 3 ảnh khối đặt cạnh nhau.
**Chờ khoảng:** Hải 2–3 phút, Khoa 10–20 phút.
**Lưu ý:** chỉ tích 1 khối để Khoa làm nhanh và đỡ tốn lượt. Hải có thể đưa lại vài khối đã bỏ hôm 17/11; không sao, cứ tích khối sếp muốn có thật.

#### Sau khi quay xong buổi 3: trả lại dữ liệu thật
Số liệu DARVO là số mẫu, không được để lại trong hệ thống. Chạy trong Terminal:
```bash
cd ~/Desktop/video_tam_co && git checkout -- phan-tich/so-lieu.csv chu-de/bai-hoc.md du-an/lam-moi/ && rm -rf phan-tich/bao-cao/darvo.md phan-tich/da-xu-ly/darvo
```
Khối Khoa vẽ là thật thì **giữ lại**. Nếu sếp không muốn giữ, nhắn em gỡ.

---

#### Cảnh 14. Chi phí (15 giây) · Buổi 1
**Bắt đầu từ:** Bàn làm việc.
1. Cột trái, bấm **Hệ thống**.
2. Cuộn thẳng xuống thẻ **Token theo ngày** (lướt nhanh qua thẻ Phiên làm việc, không dừng).
3. Bấm **Xem token**, chờ bảng hiện: Đầu vào, Đầu ra, Đọc cache, Ghi cache, USD.

**Chữ chèn:** `Một video lẻ: khoảng 22 phút, khoảng 2,8 USD`
**Dựng:** che hoặc cắt bỏ thẻ Phiên làm việc nếu lọt vào hình.

---

### PHẦN D — KẾT (≈ 20 giây)

#### Cảnh 15. Kết — làm lúc dựng
1. Ghép 3 video thành phẩm chạy cạnh nhau, mỗi video 5 giây:
   - Bảng trắng: `xuat-ban/darvo/video.mp4`
   - Tranh điện ảnh: `xuat-ban/bi-cuop-loi/video.mp4`
   - Truyện tranh: video vừa làm ở buổi 2
2. Chèn lại 3 giây văn phòng 3D lúc mọi ô đã tắt (cắt từ cảnh 2).
3. Logo Tâm Cơ.

**Chữ chèn:** `3 phong cách, 1 đội` → `AI làm. Người quyết.` → `TÂM CƠ · Hiểu chiêu để không trúng chiêu.`

---

## 4. Bản ngắn 90 giây
| Đoạn | Lấy từ | Dài |
|---|---|---|
| Tiêu đề | Cảnh 0 | 3s |
| Văn phòng 3D xoay | Cảnh 2 | 8s |
| Bấm Làm chủ đề này, cả đội vào việc | Cảnh 5 | 10s |
| Yêu cầu sửa hook, hook mới | Cảnh 6 | 12s |
| 3 mẫu phát cùng lúc, chọn | Cảnh 7 | 10s |
| Máy dựng tua nhanh | Cảnh 8 | 5s |
| Sửa một đoạn bản nháp | Cảnh 9 | 10s |
| Gói đăng bài | Cảnh 10 | 8s |
| Kéo ảnh TikTok vào, biểu đồ lên | Cảnh 12 | 12s |
| Duyệt khối, 3 ảnh khối | Cảnh 13 | 8s |
| Kết | Cảnh 15 | 4s |

## 5. Mẹo dựng
- Đoạn tua nhanh: chèn **đồng hồ nhỏ góc phải trên** ("+12 phút") để người xem biết thời gian thật.
- Mỗi cú bấm quan trọng: thêm **vòng tròn sáng** quanh chỗ bấm (CapCut: hiệu ứng "Nhấn mạnh" hoặc hình tròn có viền).
- Chữ chèn: một phông (Be Vietnam Pro có sẵn trong thư mục `fonts/`), cỡ to, nền đen mờ 60%, đặt cố định ở đáy.
- Nhạc nền không lời, nhịp vừa. **Giảm nhỏ nhạc** lúc phát video thành phẩm, vì video đó có giọng đọc.
- Cắt từng cảnh ra file riêng, đặt tên theo số cảnh (`c06-duyet-kich-ban.mov`), rồi ghép.
