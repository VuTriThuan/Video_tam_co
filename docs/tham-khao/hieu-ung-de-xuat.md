# Hiệu ứng đề xuất (khảo sát kho HyperFrames)

Nguồn: `catalog --json` (448 mục, 428 tên khác nhau sau khi gộp các biến thể `-1..-5`), tra thêm bằng `catalog --query` (tầng `words`) với các từ khoá marker, underline, typewriter, comic, stamp, freeze, speech bubble, paper tear, split, counter. Chỉ đọc mô tả, chưa cài, chưa chép mã.
Bỏ qua những thứ Máy dựng đã có: vong-tron-do, gach-cheo, tick, so-thu-tu, mui-ten, rung, zoom-vao, den-roi, 4 kiểu chuyển cảnh (truot, tron, day-len, phong), chữ đập có rung ở hook.
Loại vì không hợp kênh: shader/WebGPU (glitch, swirl, light-leak, liquid-glass), 3D/carousel, khối giả giao diện app/mạng xã hội, bản đồ, mã nguồn.

Nguyên tắc chung: mỗi cảnh dùng tối đa 1 hiệu ứng trong danh sách này, và chỉ đặt vào khoảnh khắc hook, lật mặt, lời khuyên chốt hoặc chuyển ý. Màu nhấn lấy từ `tong_mau`. Nét vẽ dùng chung bút của `render/net-co-ban.js` để cùng một khối chạy được ở `bang-trang`, `truyen-tranh` và `tranh-tinh-zoom`.

---

## to-da-quang  (tham khảo: marker-highlight, inline-highlight, mk-callout-highlight)
- Hình dung: chữ to hiện lên trước, sau đó một vệt bút dạ quang nét tay (hơi lệch, đầu nét đậm) quét ngang dưới đúng một từ khoá, từ trái sang phải trong khoảng 0,4 giây.
- Dùng khi: câu chốt hoặc lời khuyên có một từ "đinh" ("im lặng", "ranh giới", "ghi lại"). / Không dùng khi: chữ dài quá 2 dòng, hoặc cảnh đã có vong-tron-do hay gach-cheo.
- Tham số canh.json: {"ten":"to-da-quang","tu":"ranh giới","t":0.4,"kieu":"to|gach-duoi"}
- Làm bằng SVG thuần được không: dễ. Chỉ cần một path rộng, bo đầu, mờ 60–70%, nằm sau chữ, vẽ ra bằng `stroke-dashoffset`. Phần duy nhất cần làm thêm là đo vị trí từ khoá trong dòng chữ.
- Ưu tiên: 1

## gach-thay  (tham khảo: strikethrough-replace, hw-underline phần strikethrough)
- Hình dung: cụm chữ cũ ("Sếp khen bạn") bị một nét gạch tay vạch qua 2 lần, chữ mờ đi và tụt xuống, rồi cụm chữ thật ("Sếp đang thử bạn") bật lên ngay bên dưới.
- Dùng khi: lật mặt kiểu "tưởng là… hoá ra…", sửa một niềm tin sai. / Không dùng khi: cần gạch một nhân vật hay đồ vật (đã có gach-cheo), hoặc câu mới dài hơn câu cũ quá nhiều.
- Tham số canh.json: {"ten":"gach-thay","cu":"Sếp khen bạn","moi":"Sếp đang thử bạn","t":0.35}
- Làm bằng SVG thuần được không: dễ. Hai path gạch có dashoffset, cộng opacity/translate cho hai dòng chữ, không cần bộ lọc nào.
- Ưu tiên: 1

## dung-hinh  (tham khảo: freeze-frame-dressing, beat-freeze-cut)
- Hình dung: cảnh đang chạy thì khựng lại, có một chớp trắng ngắn, khung hình co nhẹ thành tấm ảnh có viền giấy, hai miếng băng dính ở góc, hơi nghiêng 2–3 độ, kèm nhãn viết tay ("Khoảnh khắc này…", "Dấu hiệu số 1").
- Dùng khi: hook ("dừng lại ở đây") hoặc đúng lúc lật mặt, để người xem nhìn kỹ một chi tiết. / Không dùng khi: cảnh có thoại dồn dập, hoặc cảnh liền trước vừa dùng zoom-vao hay rung.
- Tham số canh.json: {"ten":"dung-hinh","t":0.5,"nhan":"Khoảnh khắc này","nghieng":-2}
- Làm bằng SVG thuần được không: vừa. Phần đóng băng chỉ là giữ nguyên t của cảnh sau mốc; khung giấy, băng dính và chớp đều là hình chữ nhật cộng opacity. Phải sửa canh-chung.js để "giữ thời gian" và thu nhỏ cả cảnh vào trong khung.
- Ưu tiên: 1

## ap-luc-vay-quanh  (tham khảo: overwhelm-surround, radial-surround)
- Hình dung: nhân vật đứng giữa, còn thông báo, tin nhắn, đầu việc, chữ "Gấp!!" cứ dồn vào từ các mép, xoay vòng và co dần về phía người đó. Nhân vật đứng yên, áp lực đến từ xung quanh.
- Dùng khi: hook hoặc cảnh mô tả bị quá tải, bị ép việc, bị nhóm chat dí. / Không dùng khi: cảnh có từ 2 nhân vật chính trở lên, hoặc bo_cuc dien-thoai đã chiếm cả màn hình.
- Tham số canh.json: {"ten":"ap-luc-vay-quanh","muc_tieu":"nv-0","t":0.2,"vat":["thong-bao","tin-nhan","Gấp!!","Deadline"],"so_luong":8}
- Làm bằng SVG thuần được không: vừa. Các vật bay vào là thẻ bo góc hoặc đạo cụ sẵn có (dien-thoai, phong-bi, chuong) đặt theo quỹ đạo elip có seed cố định. Phải canh để chúng không đè chữ to và không lọt vào vùng TikTok che.
- Ưu tiên: 1

## cuon-tu  (tham khảo: kinetic-type-swap, slot-machine-roll)
- Hình dung: câu đứng yên, riêng một ô chữ cuộn dọc qua vài từ như máy đánh bạc ("Sếp cần bạn… giỏi / chăm / nhanh / **im lặng**"), rồi khựng lại ở từ cuối.
- Dùng khi: chuyển ý hoặc chốt bất ngờ, đáp án là từ thứ ba hay thứ tư. / Không dùng khi: từ chốt quá dài so với các từ khác (ô sẽ nhảy rộng), hoặc lời đọc không khớp nhịp cuộn.
- Tham số canh.json: {"ten":"cuon-tu","cau":"Sếp cần bạn {}","cac_tu":["giỏi","chăm","im lặng"],"t":0.3}
- Làm bằng SVG thuần được không: vừa. Cần clipPath cho ô chữ và đo chiều rộng từ dài nhất; phần cuộn chỉ là translateY.
- Ưu tiên: 2

## vet-muc-chuyen  (tham khảo: hw-scribble-transition)
- Hình dung: từng dải nét bút nguệch ngoạc phủ dần kín màn hình bằng màu nhấn, cảnh đổi ở bên dưới, rồi các nét rút đi để lộ cảnh mới.
- Dùng khi: chuyển sang phần "lời khuyên" hoặc sang một hồi mới, hợp nhất với bang-trang và truyen-tranh. / Không dùng khi: hai cảnh liền nhau đã đổi bằng truot hay tron, hoặc dùng quá 1 lần trong một video.
- Tham số canh.json: {"ten":"vet-muc-chuyen","t":0.85,"mau":"nhan"}
- Làm bằng SVG thuần được không: vừa. Khoảng 6–8 path zigzag dày với dashoffset; phải nối vào cơ chế chuyển cảnh hiện có trong canh-chung.js.
- Ưu tiên: 2

## khung-ve-tay  (tham khảo: hw-box-label, hw-callout-circle)
- Hình dung: một khung chữ nhật bo góc, nét run tay, được vẽ dần quanh câu lời khuyên, có nhãn nhỏ phía trên ("Ghi nhớ", "Mẹo"). Khung "rung nét" nhẹ theo bước khung hình.
- Dùng khi: lời khuyên chốt cuối video, bo_cuc loi-khuyen. / Không dùng khi: đóng khung nhân vật (đã có vong-tron-do), hoặc cảnh có nhiều dòng chữ rời nhau.
- Tham số canh.json: {"ten":"khung-ve-tay","nhan":"Ghi nhớ","t":0.3}
- Làm bằng SVG thuần được không: dễ. Một path chữ nhật gợn bằng seed, vẽ bằng dashoffset; độ rung nét lấy theo floor(t*fps) như hw-boil.
- Ưu tiên: 2

## go-chu  (tham khảo: typewriter, notes-typing)
- Hình dung: câu nhấn được gõ ra từng ký tự, có con trỏ nhấp nháy, nghe như ai đang nhắn tin hay viết email rồi lại xoá.
- Dùng khi: câu "nội tâm" hoặc tin nhắn chưa gửi ("Em xin nghỉ… thôi không gửi"), dùng được cả với màn hình tin-nhan-rieng. / Không dùng khi: chữ hook cần đập vào mắt ngay giây đầu (đã có chữ đập), hoặc câu dài hơn khoảng 40 ký tự.
- Tham số canh.json: {"ten":"go-chu","t":0.2,"xoa_tu":12}
- Làm bằng SVG thuần được không: dễ. Cắt chuỗi theo t, có tính tổ hợp dấu tiếng Việt (cắt theo grapheme để không tách dấu), con trỏ là một rect.
- Ưu tiên: 2

## xe-giay  (tham khảo: torn-paper-rip, paper-collage-reveal)
- Hình dung: một đường xé giấy chạy ngang khung, nửa trên bị lật đi để lộ lõi giấy trắng ở mép rách và bóng đổ mềm, cảnh sau hiện ra ở dưới.
- Dùng khi: lật mặt mạnh nhất video ("bộ mặt thật"), hợp với tranh-tinh-zoom và truyen-tranh. / Không dùng khi: bang-trang có nền trắng trơn (mép giấy trắng không nổi), hoặc dùng quá 1 lần trong một video.
- Tham số canh.json: {"ten":"xe-giay","t":0.8,"huong":"ngang"}
- Làm bằng SVG thuần được không: khó. Mép rách cần path răng cưa có seed, cộng lớp lõi trắng, bóng đổ và phép lật có phối cảnh; muốn nhìn ra giấy thật thì phải có vân, nên tốn công hơn các mục khác.
- Ưu tiên: 3

## dem-so  (tham khảo: count-up, number-wheel, number-pop-in)
- Hình dung: một con số lớn chạy từ 0 lên giá trị đích (hoặc tụt từ cao xuống), khi chạm đích thì nảy nhẹ và đổi sang màu nhấn ("3 năm", "12 lần", "0 đồng tăng lương").
- Dùng khi: câu có số liệu làm hook hoặc làm điểm đau. / Không dùng khi: số không có ý nghĩa cảm xúc, hoặc cảnh đã dùng so-thu-tu.
- Tham số canh.json: {"ten":"dem-so","tu":0,"den":12,"don_vi":"lần","t":0.2}
- Làm bằng SVG thuần được không: dễ. Nội suy giá trị theo t rồi làm tròn; nảy bằng scale. Đặt ưu tiên thấp vì kênh ít khi kể bằng số liệu.
- Ưu tiên: 3

---

## Đợt 1 (ưu tiên 1)
| Hiệu ứng | Kiểu | Độ khó SVG |
| --- | --- | --- |
| to-da-quang | chữ | dễ |
| gach-thay | chữ, lật mặt | dễ |
| dung-hinh | máy quay / khung | vừa |
| ap-luc-vay-quanh | nhân vật / nhấn mạnh | vừa |
