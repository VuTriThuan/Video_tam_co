# Báo cáo bước 2 — Tổng quát hóa dàn cảnh + chủ đề thứ hai

**Kết luận:** dàn cảnh đã chuyển sang **ráp theo dữ liệu**. Chủ đề 2 ("3 câu nói của người đang thao túng bạn nơi công sở") chạy hết quy trình **mà không phải viết khối mới hay code dàn cảnh nào**. Kịch bản qua máy kiểm ngay lần đầu, video đầy đủ đạt 10/10 kiểm tra ngay lần quay đầu.

## Bảng kết quả

| Hạng mục | Kết quả |
|---|---|
| Hồi quy `ghet-ngam` sau khi chuyển sang dữ liệu | **Đạt** ở cả 3 phong cách (`ra/hoi-quy/so-*.jpg`, trên là bản cũ, dưới là bản mới). Khác biệt nhỏ đều theo hướng tốt hơn: c11 bong bóng "miệng khóa kéo" nay hiện đúng (code cũ ẩn nhầm), c12 chữ "BỤP!" khớp đúng lúc "im bặt", c06/c16 lệch vài chục pixel. Code viết tay cũ đã bị thay hẳn; bản sao lưu ở `ra/hoi-quy/canh-chung-cu.js`. |
| Số khối trong thư viện, số khối phải vẽ thêm cho chủ đề 2 | **134 tên khối** trong `render/thu-vien/khoi.js` (`docs/catalog.md` sinh tự động), gồm 6 vai, 16 tư thế (mỗi tư thế có biến thể #2), 20 đạo cụ, 6 loại màn hình, 7 hiệu ứng, 5 kiểu xếp, 7 bối cảnh + 8 nền trừu tượng, 5 góc máy, 6 tông màu. **Chủ đề 2: 0 khối mới.** Có 4 lỗi hạ tầng em phát hiện và sửa trong lúc làm: bong bóng "ba chấm" trống, chữ ảnh bìa bị viết cứng (nay là trường `bia` trong `video.json`), true peak mẫu điện ảnh -1,4 dB (hạ mục tiêu xuống -2,5 dB), script đếm token trùng tên module `token` của Python. |
| Token chủ đề 2 (tổng, agent, điều phối, khối mới) | Đo bằng `ccusage session` trước/sau (`logs/token-truoc-cd2.json`, `logs/token-sau-cd2.json`). **Tổng phiên chính: 17,1 triệu token**, gồm 40,4 nghìn token ra, 131 nghìn token ghi cache, 16,9 triệu đọc cache; quy ra giá API là $4,97. **2 agent: bien-kich 67,2 nghìn + kiem-duyet 59,1 nghìn = 126 nghìn** (số do công cụ báo; em không chắc ccusage có gộp phần agent vào số tổng hay không). **Khối mới: 0.** **Điều phối + sửa 4 lỗi hạ tầng: phần còn lại.** Hơn 99% là token đọc lại ngữ cảnh: phiên này đã rất dài (cả bước 1 lẫn bước 2), nên mỗi lần gọi công cụ đều phải đọc lại hàng trăm nghìn token ngữ cảnh. |
| Thời gian máy chủ đề 2 | 2 agent: 2,8 phút · đọc giọng: 3,3 phút (186 giây, 83,5 giây âm thanh) · 3 mẫu: 5,8 phút (+1,8 phút quay lại mẫu điện ảnh) · bản đầy đủ: 5,8 phút (quay 263 giây + ghép 70 giây + kiểm tra) · **tổng ~19 phút máy**. |
| Ước tính: gói Pro làm được bao nhiêu video/tuần | Em không đọc được hạn mức cụ thể của gói Pro, nên chỉ ước theo thực tế: cả chủ đề 2 (cộng hoàn thiện hạ tầng) chạy trong khoảng 1,5 giờ của một khung 5 giờ mà không chạm giới hạn. Nếu **mỗi chủ đề mở một phiên mới** (ngữ cảnh ngắn, lượng đọc cache giảm mạnh so với 17 triệu ở đây), ước làm được **khoảng 1–2 video mỗi khung 5 giờ, ~7–10 video/tuần** khi rải đều các ngày. Con số này cần xác nhận bằng một phiên mới. |
| Còn chỗ nào phải viết code tay cho mỗi chủ đề | **Không**, với các chủ đề dùng được khối có sẵn (công sở, giao tiếp, tin nhắn, họp, email…). Chỉ khi `bien-kich` ghi `de_xuat_khoi` mới cần vẽ thêm một lần (ví dụ bối cảnh mới, đạo cụ đặc thù). Ngoài ra, chữ ảnh bìa cần agent điền vào `video.json`. |
| Chống lặp | **7 bối cảnh** (văn phòng mở, phòng họp, pantry, thang máy, phòng sếp, quán cà phê, ở nhà tối), mỗi bối cảnh vẽ được ở cả 3 phong cách · **nhân vật phụ ráp theo seed**: 10 kiểu tóc (4 nam, 5 nữ, 2 sếp, có chồng lấn), 8 màu áo + 3 màu áo sếp, 5 màu tóc, kính có/không, 3 dáng · **6 tông màu** · **5 góc máy** · Minh cố định, mỗi tư thế có 2 biến thể. `kiem-lap.py` bắt được **13 lỗi** khi chạy thử trên video `ghet-ngam`, **0 lỗi** ở chủ đề 2 (agent đã tuân thủ ngay lần đầu). |
| Contact sheet 2 chủ đề đặt cạnh nhau | `review/so-sanh-2-chu-de.jpg` (2 hàng trên là `ghet-ngam`, 2 hàng dưới là `thao-tung`). Nhìn rõ cùng kênh nhưng khác nền, khác tông, khác bộ đồng nghiệp, khác cảnh mở đầu. |

## Diễn giải một luật (cần đại ca xác nhận)
"Một `bo_cuc` dùng tối đa 2 lần" không thực hiện được với video 18–22 cảnh vì chỉ có 8 bố cục. Em áp dụng cho **kiểu cảnh** (tổ hợp bố cục + nền + góc máy), mỗi tổ hợp tối đa 2 lần. Luật "không 2 cảnh liền nhau cùng bố cục" giữ nguyên.

## Đề xuất
1. Mỗi chủ đề nên mở **một phiên Claude Code mới** (`QUY_TRINH.md` đã đủ để phiên mới tự làm). Phần lớn token ở chủ đề 2 là đọc lại ngữ cảnh dài của phiên này.
2. Sau 10 video, `kiem-lap.py` sẽ tự nhắc làm mới thư viện. Khi đó em đọc `logs/da-dung.json` và đề xuất 2–3 khối hoặc bối cảnh mới để đại ca duyệt.

## Nhật ký thời gian
| Bước | Giờ | Ghi chú |
|---|---|---|
| Bắt đầu bước 2 | 2026-11-16 10:13 | |
| Hồi quy ghet-ngam (3 phong cách) | 10:27 | Đạt |
| Chống lặp + máy kiểm + agent + QUY_TRINH | 10:34 | 7 bối cảnh, 6 tông, 5 góc máy, ngoại hình theo seed; kiem-canh.py, kiem-lap.py, logs/da-dung.json |
| Bắt đầu chủ đề 2 | 10:34 | snapshot token |
| CĐ2 kịch bản (2 agent) | 10:38 | 292 từ, 20 cảnh; máy kiểm ĐẠT lần đầu; 0 khối mới |
| CĐ2 đại ca duyệt kịch bản | 11:27 | hook chính |
| CĐ2 đọc giọng | 11:31 | 83,5s video, 186s máy |
| CĐ2 quay 3 mẫu | 11:40 | 3/3 đạt (điện ảnh quay lại 1 lần) |
| CĐ2 đại ca chọn | 11:41 | tranh-tinh-zoom |
| CĐ2 bản đầy đủ | 11:47 | quay 263s + ghép 70s; kiểm tra 10/10 đạt |
| Đo token, báo cáo | 11:48 | 17,1 triệu token (phiên chính) |
| CĐ2 đại ca duyệt bản nháp | 11:50 | Duyệt, không sửa |
