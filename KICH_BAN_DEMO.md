# Kịch bản quay demo hệ thống Tâm Cơ (không lời, chỉ chữ chèn)

Video không có giọng, nên mọi thông tin đi bằng **chữ chèn** (cột "Chữ chèn") và **nhạc nền**.
Mỗi chữ chèn đứng trên màn hình ít nhất 2,5 giây, tối đa 12 chữ một dòng.
Tổng thời lượng sau dựng: **bản đầy đủ 6–8 phút**, có thể cắt **bản ngắn 90 giây** (cuối file).

Ký hiệu: **[TUA xN]** = tua nhanh N lần · **[ZOOM]** = phóng to vùng đó lúc dựng · **[CẮT]** = bỏ đoạn chờ.

---

## Chuẩn bị trước khi quay

**Dữ liệu**
- [ ] Chọn **1 chủ đề chưa làm** trong `chu-de/kho.md`, làm dạng **lẻ** (nhanh, ~22 phút). Chuỗi chỉ quay lướt bằng chủ đề cũ.
- [ ] Ghi sẵn ra giấy câu "yêu cầu sửa" sẽ gõ ở cảnh 6 và cảnh 9 (để gõ trơn tru, không ngập ngừng).
- [ ] Ảnh thống kê TikTok cho cảnh 12 đã có sẵn: 4 ảnh **mẫu** của video DARVO trong `demo/so-lieu-tiktok-darvo/` (số liệu dựng cho demo, không phải số thật).
- [ ] Làm trống `phan-tich/inbox/darvo/` trước khi quay (đang có sẵn 1 ảnh của bi-cuop-loi để nhầm chỗ).
- [ ] **Sau khi quay xong cảnh 12 và 13**, trả lại dữ liệu thật để số mẫu không lẫn vào bài học của đội:
  `git checkout -- phan-tich/so-lieu.csv chu-de/bai-hoc.md du-an/lam-moi/` và xoá `phan-tich/bao-cao/darvo.md`, `phan-tich/da-xu-ly/darvo/`. Khối Khoa vẽ thật thì giữ lại.
- [ ] Hiện mới có **6 video**, chưa tới mốc 10 nên máy chưa tự nhắc. Cảnh Khoa (cảnh 13) bấm tay nút **Đề xuất khối mới** ở mục Thư viện: em đã kiểm, nút không bị chặn khi dưới 10 video.
- [ ] Đợt đề xuất ngày 17/11 đại ca đã bỏ 6 khối. Lần bấm này Hải có thể đưa lại vài khối cũ; không sao, cứ tích khối nào đại ca muốn Khoa vẽ thật.

**Máy**
- [ ] `./kiem-tra-he-thong.sh` chạy xanh hết.
- [ ] Đăng nhập Claude rồi (`claude` → `/login`), còn đủ lượt dùng cho một chủ đề (~4,7 triệu token).
- [ ] Bật **Không làm phiền**, tắt thông báo, ẩn Dock, dọn màn hình nền.
- [ ] Trình duyệt: cửa sổ riêng, không dấu trang, không tab khác, phóng to 110–125%.
- [ ] Màn hình quay **1920×1080**, 30 khung/giây. Quay bằng QuickTime (Cmd+Shift+5) hoặc OBS.
- [ ] Terminal: phông to (18–20pt), xoá lịch sử (`clear`), dấu nhắc không lộ `/Users/trithuan` (hoặc che lúc dựng).

**Không được lọt vào khung hình**
- Email, tên tài khoản Claude, `dieu-hanh/cau-hinh.json`, `.claude/settings.json`, file `.env`.
- Mục **Hệ thống → Phiên làm việc** (có cấu hình phiên): lướt qua nhanh hoặc làm mờ.

---

## Phần A — Giới thiệu (≈ 1 phút)

### Cảnh 0. Màn tiêu đề (5 giây)
| Màn hình | Chữ chèn |
|---|---|
| Nền tối, logo Tâm Cơ | **TÂM CƠ** · "Hiểu chiêu để không trúng chiêu." |
| | Một kênh video. 6 nhân viên AI. 1 người duyệt. |

### Cảnh 1. Bật hệ thống (15 giây)
| Thao tác | Chữ chèn |
|---|---|
| Terminal, gõ `./dieu-hanh.sh` | Một lệnh để mở văn phòng |
| Trình duyệt tự mở localhost:4747, trang **Bàn làm việc** | Phòng điều hành |

### Cảnh 2. Văn phòng 3D (20 giây)
| Thao tác | Chữ chèn |
|---|---|
| Kéo chuột xoay bàn cờ 3D chậm một vòng | Mỗi ô là một nhân viên |
| [ZOOM] vào ô của anh Hải ở giữa | Anh Hải · Trưởng nhóm. Đại ca chỉ nói chuyện với Hải |
| Bấm **Xoay về giữa** | |

### Cảnh 3. Đội ngũ (20 giây)
| Thao tác | Chữ chèn |
|---|---|
| Mở mục **Đội ngũ**, cuộn chậm qua từng thẻ | Linh · Nghiên cứu chủ đề |
| | Tuấn · Biên kịch — Chị Mai · Kiểm duyệt |
| | Khoa · Họa sĩ — Vy · Đăng bài — Đức · Số liệu |
| [ZOOM] thẻ **Máy dựng** (nhãn "Máy tự động") | Máy dựng: không tốn token |

---

## Phần B — Làm một video từ đầu đến cuối (≈ 4 phút)

### Cảnh 4. Lên chủ đề — Linh (30 giây)
| Thao tác | Chữ chèn |
|---|---|
| Mục **Chủ đề** → bấm **Nhờ Linh gợi ý 10 chủ đề mới** | Hết ý tưởng? Giao Linh |
| [TUA x8] tới khi thẻ chủ đề mới hiện ra | Linh đọc bài học cũ, tra hiệu ứng tâm lý |
| Mở **Góc kể và ý chính** của một thẻ | Mỗi chủ đề có sẵn hook và góc kể |
| (Tuỳ chọn) gõ tên vào ô **Chủ đề của riêng đại ca** rồi xoá đi | Hoặc tự đặt chủ đề |

> Nếu không muốn tốn lượt chạy `/goi-y`, quay kho có sẵn và bỏ bước bấm.

### Cảnh 5. Giao việc (30 giây)
| Thao tác | Chữ chèn |
|---|---|
| Trên thẻ chủ đề đã chọn, bấm **Lẻ** → **Làm chủ đề này** | 1 cú bấm: chạy trọn quy trình |
| Hộp xác nhận "Bắt đầu chủ đề #…?" → **Bắt đầu** | |
| Tự về **Bàn làm việc**. [ZOOM] sợi dây xanh từ Hải sang Tuấn | Hải giao kịch bản cho Tuấn |
| Khung trò chuyện bên phải, tab **Cả đội**: tin Hải → Tuấn hiện ra | Mọi lời giao việc đều hiện ở đây |
| [TUA x10] Tuấn viết xong → dây chuyển sang Chị Mai | Chị Mai rà lời, máy kiểm cảnh và chống lặp |

### Cảnh 6. Chốt 1: duyệt kịch bản — **có sửa** (50 giây)
| Thao tác | Chữ chèn |
|---|---|
| Trang chủ hiện thẻ đỏ **Đang chờ đại ca** | Chốt 1/3: đại ca đọc kịch bản |
| Mở **Duyệt** → đọc kịch bản, [ZOOM] phần **Hook thay thế** | Tuấn luôn viết kèm hook dự phòng |
| Gõ vào ô ghi chú, ví dụ: *"Hook chưa gắt. Lấy hook thay thế số 2, câu kết ngắn lại."* | Chưa ưng? Ghi rõ chỗ cần sửa |
| Bấm **Yêu cầu sửa** → thông báo "Đã ghi và báo anh Hải làm tiếp" | Không cần gõ lệnh |
| [TUA x8] tin Hải → Tuấn "sửa hook…" | Chỉ sửa đúng chỗ đó, tối đa 1 vòng |
| Kịch bản mới hiện ra, [ZOOM] câu hook đã đổi | |
| Bấm **Duyệt** | Duyệt |

### Cảnh 7. Chốt 2: chọn phong cách (40 giây)
| Thao tác | Chữ chèn |
|---|---|
| [TUA x16] Máy dựng đọc giọng + làm mẫu (khung tin Máy dựng chạy) | Máy dựng đọc giọng, dựng 3 mẫu |
| Mục **Duyệt**: 3 mẫu phát cùng lúc | Chốt 2/3: chọn phong cách |
| Giữ 5 giây cho người xem nhìn | Bảng trắng · Truyện tranh · Tranh điện ảnh |
| Bấm nút **Chọn …** dưới một mẫu | Chọn 1, 2 mẫu còn lại tự xoá |

### Cảnh 8. Dựng bản đầy đủ (20 giây)
| Thao tác | Chữ chèn |
|---|---|
| [TUA x30] Bàn làm việc, Máy dựng sáng, tin tiến độ cảnh 1/…, 2/… | Máy dựng quay từng cảnh, 3 luồng song song |
| Tin "kiểm tra 10 mục: đạt" | Tự kiểm: khung đen, chữ bị che, thời lượng |
| [CẮT] | ~11 phút cho video 90 giây |

### Cảnh 9. Chốt 3: xem bản nháp — **sửa một cảnh** (50 giây)
| Thao tác | Chữ chèn |
|---|---|
| **Duyệt** → phát bản nháp toàn màn hình 10–15 giây | Chốt 3/3: xem bản nháp |
| Dừng ở một cảnh, gõ: *"Cảnh 5: chữ trên màn hình điện thoại hơi nhỏ, phóng to."* → **Yêu cầu sửa** | Sửa đúng một cảnh |
| [TUA x16] tin Máy dựng chỉ quay lại cảnh đó | Không dựng lại cả video |
| Phát lại đúng cảnh vừa sửa, [ZOOM] | |
| Bấm **Duyệt** | Xong |

> Cách khác để quay: gõ thẳng vào khung trò chuyện `/sua cảnh 5 chữ nhỏ quá` để người xem thấy cũng có thể ra lệnh bằng chữ.

### Cảnh 10. Gói đăng bài — Vy (30 giây)
| Thao tác | Chữ chèn |
|---|---|
| Mục **Đăng bài**: video, ảnh bìa, tiêu đề, mô tả, hashtag, bình luận ghim | Vy viết sẵn mọi thứ để đăng |
| Rê chuột lên tiêu đề → bấm **Sao chép** | Rê chuột, bấm, dán |
| Bấm **Đánh dấu đã đăng** | Đăng xong, đánh dấu để Đức theo dõi |

### Cảnh 11. Đăng TikTok (15 giây, tuỳ chọn)
| Thao tác | Chữ chèn |
|---|---|
| Quay điện thoại hoặc TikTok Studio: chọn video, dán tiêu đề, đăng | Đại ca đăng tay, hệ thống không đụng tài khoản |

> Che tên tài khoản và số theo dõi nếu không muốn lộ.

---

## Phần C — Các tình huống khác (≈ 2 phút)

### Cảnh 12. Phân tích số liệu TikTok — Đức (45 giây)
| Thao tác | Chữ chèn |
|---|---|
| Trang chủ hiện lời nhắc "Đã hơn 24 giờ từ lúc đăng…" (video DARVO) | 24 giờ sau đăng |
| Lướt nhanh 4 ảnh trong `demo/so-lieu-tiktok-darvo/` bằng Xem nhanh (chọn cả 4, bấm Space) | Chụp màn hình thống kê TikTok |
| Mục **Phân tích** → ô **Video** chọn DARVO → kéo cả 4 ảnh từ Finder thả vào ô "Kéo thả ảnh chụp màn hình vào đây" | Thả ảnh vào, không cần gõ số |
| Bấm **Giao Đức phân tích** → [TUA x10] | Đức đọc ảnh, trích số |
| Biểu đồ **Lượt xem mỗi video**: cột DARVO (23,6K) cao hơn cột bi-cuop-loi (18,4K) | So với video trước |
| **Bảng số liệu** thêm dòng darvo, [ZOOM] ô xem hết 27,3% | Đức tự trích từng con số |
| Cuộn xuống **Bài học chung**, [ZOOM] một bài học mới | Bài học về thẳng Linh, Tuấn, Vy |

> Số trong ảnh mẫu được đặt cho Đức có chuyện để nói: DARVO tốt hơn bi-cuop-loi ở mọi chỉ số, có điểm rơi rõ ở giây 0:42, bình luận nhắc "phần 2". Đức sẽ rút được 2–3 bài học trông như thật.

### Cảnh 13. Khoa vẽ khối mới (50 giây)
| Thao tác | Chữ chèn |
|---|---|
| Mục **Thư viện**: các khối có số lần dùng, viền đỏ = dùng nhiều nhất | Hệ thống đếm hình nào dùng quá nhiều |
| Bấm **Đề xuất khối mới** (góc trên bên phải), bấm là chạy luôn | Hình nào cũng dùng mãi thì người xem chán |
| Bàn làm việc: Hải đếm số liệu → [TUA x10] → trang chủ báo "Có N khối chờ duyệt ở Thư viện" | Hải đếm và đề xuất hình mới |
| Thẻ **Khối mới chờ duyệt**: bỏ tích 1 khối, giữ 2 khối, gõ ghi chú *"Bàn họp nhìn từ trên xuống"* | Đại ca chọn khối nào được vẽ |
| Bấm **Duyệt** → Bàn làm việc, dây xanh Hải → Khoa | Khoa vẽ |
| [TUA x16] Finder/Xem nhanh: 3 ảnh thử `scratch/thu-<ten>-<phong-cach>.jpg` đặt cạnh nhau | Mỗi khối kiểm trên cả 3 phong cách |
| Quay lại **Thư viện**: khối mới ở **Khối đã duyệt gần đây**, số dùng = 0 | Khối mới vào thư viện cho Tuấn dùng |

> Trường hợp thứ hai (chỉ nhắc bằng chữ chèn, không cần quay): khi Tuấn viết kịch bản cần hình chưa có, Tuấn ghi `de_xuat_khoi` và Khoa vẽ ngay giữa quy trình.

### Cảnh 14. Chi phí (15 giây)
| Thao tác | Chữ chèn |
|---|---|
| **Hệ thống** → **Xem token** → bảng Token theo ngày | Một video lẻ: ~22 phút, ~2,8 USD |

---

## Phần D — Kết (≈ 20 giây)

### Cảnh 15. Kết
| Màn hình | Chữ chèn |
|---|---|
| Phát nhanh 3 video thành phẩm cạnh nhau (3 phong cách) | |
| Quay về văn phòng 3D, tất cả ô tắt | AI làm. Người quyết. |
| Logo | **TÂM CƠ** · Hiểu chiêu để không trúng chiêu. |

---

## Bản ngắn 90 giây (cắt từ bản đầy đủ)
Cảnh 0 (3s) → 2 (8s) → 5 (10s) → 6 rút còn bấm Yêu cầu sửa + kịch bản mới (12s) → 7 (10s) → 8 (5s) → 9 rút còn sửa 1 cảnh (10s) → 10 (8s) → 12 rút còn kéo ảnh + biểu đồ (12s) → 13 rút còn bấm Duyệt + 3 ảnh khối (8s) → 15 (4s).

## Mẹo dựng
- Đoạn chờ tua nhanh nên chèn **đồng hồ nhỏ góc màn hình** ("+12 phút") để người xem hiểu thời gian thật.
- Khi zoom, dùng vòng tròn hoặc khung highlight quanh nút được bấm; làm to con trỏ chuột (Cài đặt hệ thống → Trợ năng → Màn hình → Kích thước con trỏ).
- Chữ chèn cùng một phông, đặt cố định một vị trí (đáy màn hình), nền mờ để đọc được trên mọi cảnh.
- Nhạc nền không lời, nhịp vừa; giảm nhỏ lúc phát video thành phẩm (video đó có giọng đọc).
- Quay từng cảnh thành file riêng, đặt tên theo số cảnh (`c06-duyet-sua.mov`) để dựng nhanh.
