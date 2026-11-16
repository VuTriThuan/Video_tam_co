# Hướng dẫn dùng hệ thống Tâm Cơ

## Mở máy mỗi ngày
1. Mở **Terminal**, gõ: `cd ~/Desktop/video_tam_co` rồi `claude`. (Hoặc mở thư mục này trong ứng dụng Claude.)
2. Mở Phòng điều hành: gõ `./dieu-hanh.sh` trong Terminal. Trình duyệt sẽ mở http://localhost:4747.
3. Nói chuyện với **anh Hải** trong Claude bằng tiếng Việt bình thường. Anh Hải tự giao việc cho cả đội.

## Các lệnh
| Gõ | Khi nào |
|---|---|
| `/goi-y` | Hết ý tưởng: Linh đưa 10 chủ đề mới |
| `/chu-de 3` | Làm chủ đề số 3 trong danh sách. Mặc định là **chuỗi** 3–5 phần |
| `/chu-de 3 --le` | Làm thành **một video lẻ** 75–90 giây |
| `/sua <cần sửa gì>` | Sửa đúng chỗ đó (lời, hình, chữ, bìa), chỉ quay lại phần bị sửa |
| `/phan-tich <tên>` | Sau 24 giờ đăng: Đức đọc ảnh số liệu và rút bài học |
| `/lam-moi` | Khi máy nhắc "đã đủ 10 video": đề xuất hình mới |
| `/token` | Xem đã dùng bao nhiêu |
| `tiếp` | Sau khi bấm Duyệt hoặc Yêu cầu sửa trên Phòng điều hành |

Không nhớ lệnh thì cứ nói, ví dụ "làm chủ đề DARVO đi", anh Hải tự hiểu.

## Luật quan trọng nhất: mỗi chủ đề một phiên mới
Làm xong một chủ đề thì gõ `/clear` rồi mới bắt đầu chủ đề sau. Mọi thứ đã lưu trong máy, không mất gì. Làm vậy tiết kiệm lượt dùng rất nhiều.

## Ba lần đại ca duyệt
Mỗi chủ đề anh Hải sẽ dừng lại 3 lần để hỏi:
1. **Kịch bản:** đọc lời thoại. Với chuỗi, chỗ cắt giữa các phần được tô màu.
2. **Phong cách:** xem 3 mẫu ngắn (bảng trắng, truyện tranh, tranh điện ảnh) và chọn 1.
3. **Bản nháp:** xem video. Với chuỗi thì xem từng phần và bản gốc dài.

Duyệt ở tab **Duyệt** trên Phòng điều hành: bấm *Duyệt* hoặc *Yêu cầu sửa* (ghi rõ chỗ cần sửa, có thể chọn đúng phần), rồi quay lại Claude gõ `tiếp`. Trả lời thẳng trong Claude cũng được.

## Đăng bài
- Tab **Đăng bài** có video, ảnh bìa, tiêu đề, mô tả, hashtag và bình luận ghim. Rê chuột vào dòng nào thì bấm sao chép dòng đó.
- **Chuỗi:** các phần đăng **cùng một ngày**, đúng giờ ghi trên từng thẻ (mặc định 11:30 · 15:30 · 19:30 · 21:30). Gom chúng vào một danh sách phát, tên gợi ý có sẵn ở đầu gói đăng.
- Đăng xong phần nào thì bấm **Đã đăng** ở thẻ phần đó.
- File nằm trong `xuat-ban/<tên chủ đề>/`. Chuỗi có thư mục `phan-1`, `phan-2`… và file `ban-goc.mp4` (bản dài, đăng nếu muốn).

## Gửi số liệu sau 24 giờ
Phòng điều hành sẽ nhắc. Chụp màn hình trang thống kê của TikTok, YouTube, Facebook (chuỗi thì chụp từng phần). Thả ảnh vào tab **Phân tích**, rồi gõ `/phan-tich <tên chủ đề>`. Đức sẽ so với các video trước. Với chuỗi, Đức xem có bao nhiêu người xem tiếp phần sau. Dưới 15% nghĩa là chỗ cắt chưa đủ hấp dẫn.

## Khi gặp trục trặc
- **Hết lượt dùng của gói:** chờ hết thời gian chờ, mở lại Terminal, gõ `cd ~/Desktop/video_tam_co` rồi `claude --continue`, sau đó nói "làm tiếp". Anh Hải đọc file trạng thái và làm tiếp từ chỗ dừng.
- **Phòng điều hành không mở:** gõ lại `./dieu-hanh.sh`.
- **Video bị lỗi kiểm tra:** anh Hải tự sửa tối đa 2 lần. Không được thì anh Hải mô tả lỗi và hỏi đại ca.
- **Máy đầy ổ:** nói "dọn file cũ". Anh Hải liệt kê file trung gian cũ hơn 14 ngày và chỉ xoá khi đại ca đồng ý. Video đã xuất bản không bị đụng tới.
- **Kiểm tra cả hệ thống:** gõ `./kiem-tra-he-thong.sh` trong Terminal.

## Mất bao lâu, tốn bao nhiêu
- **Video lẻ** (đo thật với DARVO): khoảng 22 phút từ lúc giao đến lúc có video, tính cả thời gian đại ca duyệt. Tốn khoảng 4,7 triệu token, tương đương ~2,8 USD nếu tính theo giá API.
- **Chuỗi** 3–5 phần: máy dựng lâu hơn khoảng 3–4 lần vì video dài 4–6 phút. Số đo thật sẽ điền sau lần chạy chuỗi đầu tiên (`bao-cao-buoc-4.md`).
- Với gói Pro, nên làm **1 chủ đề mỗi lần ngồi**. Hết lượt thì chờ rồi làm tiếp bằng `claude --continue`.
