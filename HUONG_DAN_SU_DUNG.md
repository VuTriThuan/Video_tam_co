# Hướng dẫn dùng hệ thống Tâm Cơ

## Mở máy mỗi ngày
1. Mở **Terminal**, gõ `cd ~/Desktop/video_tam_co` rồi `./dieu-hanh.sh`. Trình duyệt mở Phòng điều hành ở http://localhost:4747.
2. Mọi việc làm ngay trên trang đó: nhắn **anh Hải** ở khung trò chuyện bên phải, chọn chủ đề ở mục **Chủ đề**, duyệt ở mục **Duyệt**, lấy video ở mục **Đăng bài**, gửi số liệu ở mục **Phân tích**.
3. **Làm một lần duy nhất:** mở Terminal, chạy `claude`, gõ `/login` và đăng nhập. Chưa đăng nhập thì anh Hải trên web sẽ báo "chưa đăng nhập".

Vẫn có thể nói chuyện với anh Hải trong ứng dụng Claude như trước; tin nhắn hai bên đều hiện trên Phòng điều hành.

## Đội ngũ
| Tên | Vị trí |
|---|---|
| Anh Hải | Trưởng nhóm sản xuất |
| Linh | Nghiên cứu chủ đề |
| Tuấn | Biên kịch |
| Chị Mai | Biên tập kiểm duyệt |
| Khoa | Họa sĩ thiết kế |
| Vy | Xuất bản & đăng bài |
| Đức | Phân tích số liệu |
| Máy dựng | Kỹ thuật dựng (tự động, không tốn token) |

Mục **Đội ngũ** cho xem từng người đang làm gì và tin gần nhất của họ. Trang chủ có **văn phòng 3D** (bàn cờ nổi): kéo để xoay, ô dưới chân ai sáng xanh là người đó đang làm, sợi dây xanh nối về anh Hải là việc anh Hải đang giao. Cần mạng lần đầu để tải thư viện 3D; không có mạng hoặc mở trên điện thoại thì trang tự chuyển sang sơ đồ 2D.

## Các lệnh
Gõ vào khung trò chuyện trên Phòng điều hành (hoặc bấm nút tương ứng trên trang).

| Gõ | Khi nào |
|---|---|
| `/goi-y` | Hết ý tưởng: Linh đưa 10 chủ đề mới |
| `/chu-de 3` | Làm chủ đề số 3 trong danh sách. Mặc định là **chuỗi** 3–5 phần |
| `/chu-de 3 --le` | Làm thành **một video lẻ** 75–90 giây |
| `/sua <cần sửa gì>` | Sửa đúng chỗ đó (lời, hình, chữ, bìa), chỉ quay lại phần bị sửa |
| `/phan-tich <tên>` | Sau 24 giờ đăng: Đức đọc ảnh số liệu và rút bài học |
| `/lam-moi` | Khi máy nhắc "đã đủ 10 video": đề xuất hình mới |
| `/token` | Xem đã dùng bao nhiêu |
| `tiếp` | Bảo anh Hải làm tiếp. Bấm Duyệt trên web thì hệ thống đã tự gửi, không cần gõ |

Không nhớ lệnh thì cứ nói, ví dụ "làm chủ đề DARVO đi", anh Hải tự hiểu.

## Luật quan trọng nhất: mỗi chủ đề một phiên mới
Bắt đầu chủ đề từ mục **Chủ đề** thì hệ thống tự mở phiên mới. Nếu gõ lệnh tay, bấm **Phiên mới** dưới ô nhắn trước khi sang chủ đề khác (trong ứng dụng Claude là `/clear`). Mọi thứ đã lưu trong máy, không mất gì. Làm vậy tiết kiệm lượt dùng rất nhiều.

## Ba lần đại ca duyệt
Mỗi chủ đề anh Hải sẽ dừng lại 3 lần để hỏi:
1. **Kịch bản:** đọc lời thoại. Với chuỗi, chỗ cắt giữa các phần được tô màu.
2. **Phong cách:** xem 3 mẫu ngắn (bảng trắng, truyện tranh, tranh điện ảnh) và chọn 1.
3. **Bản nháp:** xem video. Với chuỗi thì xem từng phần và bản gốc dài.

Duyệt ở mục **Duyệt** trên Phòng điều hành: bấm *Duyệt* hoặc *Yêu cầu sửa* (ghi rõ chỗ cần sửa, có thể chọn đúng phần). Bấm xong anh Hải tự làm tiếp. Khi có chốt đang chờ, trang chủ hiện thẻ đỏ "Đang chờ đại ca".

## Đăng bài
- Tab **Đăng bài** có video, ảnh bìa, tiêu đề, mô tả, hashtag và bình luận ghim. Rê chuột vào dòng nào thì bấm sao chép dòng đó.
- **Chuỗi:** các phần đăng **cùng một ngày**, đúng giờ ghi trên từng thẻ (mặc định 11:30 · 15:30 · 19:30 · 21:30). Gom chúng vào một danh sách phát, tên gợi ý có sẵn ở đầu gói đăng.
- Đăng xong phần nào thì bấm **Đã đăng** ở thẻ phần đó.
- File nằm trong `xuat-ban/<tên chủ đề>/`. Chuỗi có thư mục `phan-1`, `phan-2`… và file `ban-goc.mp4` (bản dài, đăng nếu muốn).

## Gửi số liệu sau 24 giờ
Phòng điều hành sẽ nhắc. Chụp màn hình trang thống kê của TikTok, YouTube, Facebook (chuỗi thì chụp từng phần). Thả ảnh vào mục **Phân tích**, rồi bấm **Giao Đức phân tích**. Đức sẽ so với các video trước. Với chuỗi, Đức xem có bao nhiêu người xem tiếp phần sau. Dưới 15% nghĩa là chỗ cắt chưa đủ hấp dẫn.

## Khi gặp trục trặc
- **Hết lượt dùng của gói:** chờ hết thời gian chờ, mở lại Terminal, gõ `cd ~/Desktop/video_tam_co` rồi `claude --continue`, sau đó nói "làm tiếp". Anh Hải đọc file trạng thái và làm tiếp từ chỗ dừng.
- **Phòng điều hành không mở:** gõ lại `./dieu-hanh.sh`.
- **Video bị lỗi kiểm tra:** anh Hải tự sửa tối đa 2 lần. Không được thì anh Hải mô tả lỗi và hỏi đại ca.
- **Máy đầy ổ:** nói "dọn file cũ". Anh Hải liệt kê file trung gian cũ hơn 14 ngày và chỉ xoá khi đại ca đồng ý. Video đã xuất bản không bị đụng tới.
- **Kiểm tra cả hệ thống:** mục **Hệ thống** → *Chạy kiểm tra* (hoặc gõ `./kiem-tra-he-thong.sh` trong Terminal).
- **Anh Hải báo "có lệnh bị chặn quyền":** phiên trên web chỉ được chạy các lệnh trong `dieu-hanh/cau-hinh.json` (mục `cho_phep`). Thêm lệnh vào đó nếu đại ca đồng ý.
- **Muốn dừng giữa chừng:** bấm nút vuông ở ô nhắn (hoặc nút *Dừng* trên trang chủ).

## Mất bao lâu, tốn bao nhiêu
- **Video lẻ** (đo thật với DARVO): khoảng 22 phút từ lúc giao đến lúc có video, tính cả thời gian đại ca duyệt. Tốn khoảng 4,7 triệu token, tương đương ~2,8 USD nếu tính theo giá API.
- **Chuỗi** 3–5 phần: máy dựng lâu hơn khoảng 3–4 lần vì video dài 4–6 phút. Số đo thật sẽ điền sau lần chạy chuỗi đầu tiên (`bao-cao-buoc-4.md`).
- Với gói Pro, nên làm **1 chủ đề mỗi lần ngồi**. Hết lượt thì chờ rồi làm tiếp bằng `claude --continue`.
