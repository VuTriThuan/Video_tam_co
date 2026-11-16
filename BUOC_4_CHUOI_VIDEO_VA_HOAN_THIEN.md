# BƯỚC 4: CHUỖI VIDEO NHIỀU PHẦN + HOÀN THIỆN HỆ THỐNG

> **Gửi Claude Code:** Làm sau khi Bước 3 (`BUOC_3_DOI_AGENT.md`) đã nghiệm thu. Bước này thêm định dạng **chuỗi**: mỗi chủ đề là một video gốc 4–6 phút, cắt thành 3–5 phần, mỗi phần là một video đăng riêng. Sau đó nghiệm thu toàn hệ thống và viết hướng dẫn sử dụng cho đại ca. Vẫn giữ mọi thứ đã chốt (Tâm Cơ, KorvaTTS `gia_bao`, 3 phong cách, thư viện khối, chống lặp, đội agent, Phòng điều hành). Chỉ dùng Opus, không dùng Fable. Xưng "em", gọi "đại ca".

## 1. Hai định dạng
| Định dạng | Mô tả | Lệnh |
|---|---|---|
| `chuoi` (mặc định) | Video gốc 4–6 phút, 3–5 phần, mỗi phần 60–90 giây | `/chu-de <tên>` |
| `le` | Một video 75–90 giây đứng riêng (như hiện tại) | `/chu-de <tên> --le` |

Linh (`len-chu-de`) ghi gợi ý định dạng cho từng chủ đề trong `chu-de/kho.md`: chủ đề nhiều ý thì `chuoi`, chủ đề một ý thì `le`.

## 2. Kịch bản chuỗi (Tuấn + Chị Mai)
- Giọng `gia_bao` đọc khoảng 245 từ/phút, nên mỗi phần **250–340 từ** (60–85 giây); cả chuỗi 3–5 phần.
- **Phần 1:** hook 3 giây như bình thường.
- **Phần 2 trở đi:** mở bằng **1 câu nhắc lại dưới 3 giây** ("Phần trước mình kể chuyện bị cả phòng lập nhóm chat riêng…") rồi một hook mới. Người chưa xem phần trước vẫn phải hiểu.
- **Mọi phần trừ phần cuối kết ở điểm tò mò**: ngay trước ý quan trọng nhất, giữa cao trào câu chuyện, hoặc bằng câu hỏi bỏ lửng ("…và chiêu thứ ba mới là chiêu nguy hiểm nhất.").
- **Phần cuối:** đúc kết + câu chốt + mời theo dõi kênh Tâm Cơ.
- `canh.json`: mỗi cảnh thêm trường `"phan"`. Thêm `"chuoi": {"so_phan": n, "diem_cat": [...], "nhac_lai": [...]}`.
- Chị Mai kiểm tra thêm: số từ từng phần, mỗi phần có điểm cắt và câu nhắc lại, mỗi phần xem riêng vẫn hiểu. `kiem-canh.py` kiểm tra cấu trúc chuỗi.

## 3. Hình và chống lặp trong chuỗi
- **Cả chuỗi dùng chung một phong cách và một tông màu** để người xem nhận ra là cùng series. Nền và góc máy vẫn thay đổi.
- `kiem-lap.py`:
  - cảnh mở đầu của mỗi phần khác nhau (khác bố cục hoặc nền);
  - luật "kiểu cảnh tối đa 2 lần" áp cho **từng phần**; cả chuỗi tối đa 3 lần;
  - nội dung màn hình (tên nhóm chat, tin nhắn…) không trùng các video trước.
- **Đầu mỗi phần:** nhãn nhỏ "PHẦN 2/4" bật vào 1,5 giây (góc trên, trong vùng an toàn, không đè logo).
- **Cuối mỗi phần (trừ phần cuối):** màn "Phần 3 →" kèm câu gợi tò mò ngắn, 1,5 giây, có SFX. **Phần cuối:** màn logo Tâm Cơ + "Theo dõi Tâm Cơ".

## 4. Dựng và cắt (Máy dựng, 0 token)
- Đọc giọng và quay **toàn bộ cảnh một lần**, như hiện tại.
- Ghép **từng phần** từ các file cảnh của phần đó (concat `-c copy`), chèn nhãn phần + màn kết + logo góc trong một lần encode cuối, rồi trộn âm thanh từng phần (-14 LUFS).
- Ghép thêm `ban-goc.mp4` (toàn bộ, không có màn "Phần tiếp") để đại ca dùng nếu muốn đăng bản dài.
- Mẫu chọn phong cách: vẫn **3 mẫu 20–30 giây lấy từ đầu phần 1**.
- `kiem-tra.sh` chạy cho **từng phần**: 60–90 giây, đủ 10 mục kiểm tra.
- Xuất ra `xuat-ban/<slug>/phan-<n>/` gồm `video.mp4`, `anh-bia.png`; cộng `xuat-ban/<slug>/ban-goc.mp4` và `xuat-ban/<slug>/dang-bai.md`.

## 5. Đóng gói chuỗi (Vy)
- **Ảnh bìa từng phần:** chữ hook riêng của phần + nhãn "PHẦN n/N" to, giữ cùng bố cục cho cả chuỗi để nhìn lưới video trên trang kênh thấy đồng bộ.
- **Tiêu đề:** 3 phương án cho mỗi phần, dạng "<hook> (Phần 2/4)", dưới 60 ký tự.
- **Mô tả:** phần 2 trở đi nhắc "xem phần 1 trên kênh". Mỗi phần có bình luận ghim gợi tò mò cho phần sau.
- **Giờ đăng:** các phần **cùng một ngày, cách nhau 2–4 giờ** (mặc định 11:30 · 15:30 · 19:30 · 21:30, điều chỉnh theo `chu-de/bai-hoc.md`).
- **Danh sách phát:** gợi ý tên playlist/series cho TikTok, YouTube, Facebook (ví dụ "Tâm Cơ: Ghét ngầm nơi công sở").

## 6. Phòng điều hành và phân tích
- **Tab Duyệt:** kịch bản hiển thị theo từng phần, điểm cắt được tô màu. Bản nháp: xem từng phần và bản gốc. Duyệt cả chuỗi một lần, hoặc yêu cầu sửa một phần cụ thể.
- **Tab Đăng bài:** mỗi phần một thẻ có giờ đăng gợi ý, nút sao chép, nút "Đã đăng". 24 giờ sau phần cuối thì nhắc chụp số liệu cả chuỗi.
- **Văn phòng 3D:** Máy dựng hiện tiến độ "Ghép phần 2/4 · 60%".
- **Đức (`phan-tich`):** ghi số liệu theo từng phần. Thêm chỉ số **tỉ lệ đi tiếp** = lượt xem phần n+1 / phần n. Dưới 15% thì đánh giá điểm cắt của phần n yếu và chỉ ra câu kết cần sửa. Rút bài học về điểm cắt và câu nhắc lại vào `chu-de/bai-hoc.md`.

## 7. Nghiệm thu bước 4
1. **Mở phiên mới**, chạy `/chu-de` một chủ đề dạng chuỗi (để Linh gợi ý rồi đại ca chọn, hoặc dùng "Dấu hiệu bị ghét ngầm" bản dài). Chạy trọn đến `xuat-ban/<slug>/` với 3–5 phần đạt kiểm tra.
2. Đo token của phiên này bằng `ccusage session`, tính **token trung bình mỗi video đăng** (chia cho số phần).
3. Ghi `bao-cao-buoc-4.md`; cập nhật `QUY_TRINH.md` và `CLAUDE.md`.

## 8. Hoàn thiện cả hệ thống
**8.1. Kiểm tra toàn bộ (chạy được một lệnh `./kiem-tra-he-thong.sh`)**
- [ ] `/goi-y` → 10 chủ đề trong `chu-de/kho.md`
- [ ] `/chu-de <tên> --le` → 1 video đạt kiểm tra
- [ ] `/chu-de <tên>` → chuỗi 3–5 phần đạt kiểm tra + bản gốc + gói đăng
- [ ] `/sua` sửa đúng một cảnh, chỉ quay lại cảnh đó
- [ ] `/phan-tich` chạy được với ảnh chụp thật hoặc ảnh mẫu
- [ ] `/lam-moi` đề xuất khối mới từ `da-dung.json`
- [ ] Phòng điều hành đủ các tab; văn phòng 3D đổi trạng thái đúng theo agent thật; bản tin hiện tin nhắn nguyên văn
- [ ] Hook chặn vòng lặp hoạt động; không agent nào dùng Fable
- [ ] Không còn file tạm thừa; file trung gian của chủ đề cũ hơn 14 ngày được dọn bằng `pipeline/don.sh` (hỏi đại ca trước khi xóa)
- [ ] Sao lưu: khởi tạo git cho code, cấu hình, thư viện khối, agent, tài liệu (bỏ qua video, âm thanh, `node_modules`, `.venv`)

**8.2. Viết `HUONG_DAN_SU_DUNG.md` cho đại ca** (tiếng Việt đơn giản, không thuật ngữ kỹ thuật, tối đa 2 trang):
- mở hệ thống mỗi ngày: Terminal → `cd ~/Desktop/video_tam_co` → `claude` → `./dieu-hanh.sh`;
- bảng lệnh và lúc nào dùng lệnh nào;
- quy tắc "mỗi chủ đề một phiên mới";
- các chốt duyệt và cách duyệt trên Phòng điều hành;
- cách đăng và gửi số liệu 24 giờ;
- khi gặp lỗi hoặc hết lượt dùng của gói Pro thì làm gì (`claude --continue`);
- ước tính thực tế: mấy chủ đề/tuần vừa gói Pro, mỗi chủ đề mất bao lâu máy.

**8.3. Báo cáo cuối `bao-cao-hoan-thien.md`:** hệ thống gồm những gì, kết quả 8.1, token và thời gian trung bình mỗi video (lẻ và chuỗi), giới hạn còn lại (ví dụ giọng đọc), đề xuất nâng cấp sau này.

Gặp lỗi không tự xử lý được sau 2 lần thử: dừng, mô tả ngắn, hỏi đại ca.
