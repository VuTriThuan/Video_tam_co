# BẢN TỐI GIẢN: 5 VIDEO MẪU ĐỂ CHỌN + 1 VIDEO HOÀN CHỈNH ĐĂNG ĐƯỢC

> **Gửi Claude Code:** Đây là bản thử để xem dự án "Bản lĩnh mềm" có khả thi không. **Phạm vi nhỏ, nhưng chất lượng phải đăng được thật:** từ **cùng một kịch bản và cùng một giọng đọc**, làm **5 video mẫu theo 5 phong cách hình ảnh** để sếp chọn, rồi hoàn thiện **1 video dọc 75–90 giây** theo phong cách được chọn, chỉn chu, kèm ảnh bìa, tiêu đề, mô tả, hashtag. Tất cả miễn phí, chạy trên máy. Đồng thời đo thời gian và token.
> **Chưa làm:** Phòng điều hành, văn phòng 3D, lịch tuần, chọn tên kênh, agent phân tích.
> Xưng "em", gọi chủ kênh là **"sếp"**, trả lời bằng tiếng Việt, báo cáo ngắn gọn.

---

## 0. Chuẩn "đăng được" (mọi bước đều phải hướng tới)

| Tiêu chí | Yêu cầu |
|---|---|
| Nội dung | Video **trọn vẹn một mình** (không phải "phần 1"): hook → chuyện → 3 dấu hiệu → cách xử lý → câu chốt. Người xem không cần xem video khác vẫn hiểu. |
| 3 giây đầu | Câu hook mạnh + chuyển động lớn + chữ to + SFX. Không có màn hình tĩnh, không logo mở đầu. |
| Giọng | Tự nhiên, đúng dấu, không vấp, nhịp khoảng 150–170 từ/phút, ngắt nghỉ hợp lý. Sếp nghe duyệt trước khi dựng. |
| Hình | Có chuyển động liên tục (nhân vật chớp mắt, miệng mấp máy theo giọng, đồ vật bật vào có nảy, chuyển cảnh mượt). Không cảnh nào đứng yên quá 2 giây. |
| Chữ trên màn hình | Chỉ là chữ nhấn (không phải phụ đề), tối đa 6 từ, đủ dấu, không tràn, nằm trong vùng an toàn. |
| Vùng an toàn | Chữ và mặt nhân vật cách mép trên ≥ 250px, mép dưới ≥ 420px, mép phải ≥ 160px (giao diện TikTok/Reels/Shorts che các vùng này). |
| Âm thanh | Không nhạc nền. SFX có chọn lọc, khớp hành động trên hình, nhỏ hơn giọng ~12 dB. Tổng thể -14 LUFS, true peak ≤ -1,5 dB, không rè, không bị cắt tiếng. |
| Kết | 2–3 giây cuối: câu chốt + logo và tên kênh **Tâm Cơ** + lời mời theo dõi. Không bán hàng. |
| Kỹ thuật | 1080×1920, 30 fps, H.264 High, yuv420p, AAC 48 kHz 192 kbps, `+faststart`, dưới 100 MB. |
| Kênh | Tên kênh **Tâm Cơ**, câu giới thiệu "Hiểu chiêu để không trúng chiêu." Logo: quân mã cờ vua đỏ `#E63946` trên nền đen `#141414` (file `assets/logo/tam-co-bieu-tuong.svg` và `tam-co-anh-dai-dien.png`, sếp đặt sẵn vào thư mục). |
| Logo góc | Biểu tượng quân mã + chữ "Tâm Cơ" nhỏ ở góc trên bên trái (cách trái 48px, trên 180px), mờ 55%. |

---

## 1. Máy và luật chơi

- MacBook Pro 15" 2017, Intel Core i7 4 nhân 2,8 GHz, Intel HD 630, RAM 16 GB, macOS Ventura 13.7.6.
- Không AI vẽ ảnh, không dịch vụ trả phí, không GPU thuê. Gói Claude Pro: chỉ dùng **Opus 5.5**, **không dùng Fable**.
- Làm trong thư mục `~/Desktop/video_tam_co/` (sếp mở Claude Code ngay tại đây; logo đã có sẵn ở `assets/logo/`). Đọc code bên thứ ba trước khi chạy. Bỏ qua thư mục `giai-doan-2/` và file `HUONG_DAN_CAI_DAT_BAN_LINH_MEM.md` (để dành cho bản đầy đủ).
- **Tiết kiệm token:** lệnh in dài thì chỉ xem 20 dòng cuối; không đọc file wav/mp4 vào ngữ cảnh; kiểm tra hình bằng cách xuất vài khung JPG nhỏ rồi xem.
- Ghi thời gian bắt đầu/kết thúc từng bước vào `bao-cao.md`.

## 2. Cài đặt

```bash
xcode-select --install            # có rồi thì bỏ qua
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"   # nếu chưa có brew
brew install ffmpeg uv node
cd ~/Desktop/video_tam_co
npm init -y && npm install playwright && npx playwright install chromium
```
- `brew install ffmpeg` lỗi hoặc build quá 30 phút: dùng binary tĩnh ffmpeg cho macOS Intel (evermeet.cx) đặt vào `~/bin`.
- Chromium của Playwright không chạy trên macOS 13: dùng Google Chrome có sẵn, `chromium.launch({ channel: "chrome" })`.
- Font (giấy phép OFL, tải từ Google Fonts vào `fonts/`, nạp bằng `@font-face` cục bộ): **Be Vietnam Pro** (ExtraBold cho chữ nhấn). Kiểm tra dấu: "Ặ ẩ ỡ ự ỷ đ Đ".

## 3. Giọng đọc (ĐIỂM KIỂM TRA 1)

1. Clone `https://github.com/bachdyon/video-automator-skills` vào `vendor/`, đọc skill `free_tts` (dùng VieNeu-TTS: `https://github.com/pnnbao97/VieNeu-TTS`).
2. Môi trường `uv` Python 3.11/3.12, cài `vieneu`. **Máy Intel: KHÔNG dùng extra index `.../whl/metal/`**, cài bản CPU.
3. Không chạy được sau 2 lần thử thì dùng **KorvaTTS** (`pip install korvatts`, `github.com/dogenthq/KorvaTTS`).
4. Đọc cùng một đoạn 20 giây bằng **3 giọng khác nhau** (nam/nữ, Bắc/Nam nếu có), cả chế độ thường và turbo. Đo hệ số tốc độ (thời gian xử lý / độ dài âm thanh).
5. **Dừng cho sếp nghe và chọn giọng + chế độ.** (Làm song song bước 4 và 5 trong lúc chờ.)
6. **Hậu kỳ giọng** (`pipeline/giong.py`, chạy cho mọi file giọng):
   - cắt khoảng lặng thừa đầu/cuối, giữ 0,12 giây;
   - lọc `highpass=f=80`, khử xì nhẹ (`deesser`), nén nhẹ (`acompressor` ratio ~3), EQ tăng nhẹ vùng 3 kHz cho rõ lời;
   - xuất WAV 48 kHz mono.
7. **Chuẩn hóa văn bản** trước khi đọc: số → chữ, viết tắt → cách đọc, bỏ ký hiệu; từ điển sửa phát âm `tu-dien.toml` (ví dụ "sếp", "deadline" → "đét lai").

**Dừng hẳn và báo sếp nếu:** cả hai công cụ đều hỏng, hoặc hệ số tốc độ > 15, hoặc giọng tốt nhất vẫn sai dấu nhiều / nghe như máy đến mức không đăng được.

## 4. Kịch bản: 2 agent (ĐIỂM KIỂM TRA 2)

### 4.1. `.claude/agents/bien-kich.md`
```markdown
---
name: bien-kich
description: Viết kịch bản video dọc 75–90 giây hoàn chỉnh kèm danh sách cảnh cho kênh Bản lĩnh mềm.
model: opus
effort: high
maxTurns: 4
omitClaudeMd: true
tools: Read, Write
---
Kênh: kỹ năng giao tiếp, tâm lý học ứng dụng cho người trẻ đi làm (22–32 tuổi). Giọng kể chuyện cá nhân ngôi thứ nhất, tự nhiên như người thật nói, câu ngắn, có cảm xúc; pha một đoạn đúc kết kiểu chuyên gia. Không phụ đề, không emoji, số viết bằng chữ, không câu nào quá 25 từ.

Chủ đề: "3 dấu hiệu bạn đang bị ghét ngầm nơi công sở". Video TRỌN VẸN, 200–240 từ:
- 0–3s HOOK: một câu đánh thẳng, ví dụ "Có những người không bao giờ cãi nhau với bạn, nhưng lại ghét bạn theo cách bạn không hề nhận ra."
- CHUYỆN (≈20s): mình từng nghĩ quan hệ với cả phòng rất ổn, cho tới hôm thấy trên máy đồng nghiệp một nhóm chat của phòng... không có tên mình. Chi tiết cụ thể, có cảm xúc.
- 3 DẤU HIỆU (≈40s), mỗi dấu hiệu 1–2 câu + 1 ví dụ đời thường: (1) họ chỉ nói chuyện công việc với bạn, chuyện riêng thì im; (2) khen bạn trước mặt nhưng "quên" nhắc tên bạn trước sếp; (3) thông tin luôn đến tay bạn sau cùng.
- CÁCH XỬ LÝ (≈15s): đừng kết luận từ một dấu hiệu; chủ động hỏi han một người trong nhóm; giữ chuyên môn thật tốt để không ai gạt mình ra được.
- CHỐT (≈5s): một câu đọng lại dễ nhớ + "theo dõi kênh để xem thêm".
Ghi 2 file:
- kich-ban.md: lời đọc hoàn chỉnh.
- canh.json: 16–22 cảnh, mỗi cảnh:
  {"id":"c01","loi":"câu đọc","chu":"chữ nhấn ≤6 từ hoặc \"\"","bo_cuc":"<một trong danh mục>","bieu_cam":"binh-thuong|buon|ngac-nhien|suy-nghi|cuoi|lo-lang","dao_cu":["dien-thoai-nhom-chat","ban-lam-viec","sep","dong-nghiep","dau-hoi","so-1|so-2|so-3"...],"sfx":["whoosh|pop|ding|tick|swoosh-nhe|tin-nhan|thud"]}
  Danh mục bo_cuc: "hook-chu-to", "nhan-vat-ke", "dien-thoai", "nhan-vat-va-dong-nghiep", "dau-hieu-so", "so-sanh", "loi-khuyen", "ket".
Báo cáo tối đa 3 câu: số từ, số cảnh, câu hook.
```

### 4.2. `.claude/agents/kiem-duyet.md`
```markdown
---
name: kiem-duyet
description: Rà kịch bản cho tự nhiên, đúng thời lượng, hook mạnh; sửa trực tiếp.
model: opus
effort: medium
maxTurns: 3
omitClaudeMd: true
tools: Read, Edit
---
Đọc kich-ban.md và canh.json, sửa trực tiếp:
- Câu nào đọc lên gượng, văn viết, sáo rỗng thì viết lại cho giống người thật nói.
- Tổng 200–240 từ, không câu nào quá 25 từ, lời trong canh.json khớp đúng kich-ban.md.
- Hook đủ mạnh chưa; thêm 2 hook thay thế vào cuối kich-ban.md.
- Không đụng tôn giáo, chính trị, luật pháp; không xúc phạm ai.
Báo cáo tối đa 3 câu: đã sửa gì.
```

Phiên chính gọi `bien-kich` rồi `kiem-duyet`, **mỗi agent một lần** (chỉ gọi lại `bien-kich` 1 lần nếu sai yêu cầu rõ ràng). Tin nhắn giao việc và báo cáo viết tự nhiên, đi thẳng vào việc, không chào hỏi/cảm ơn.

**Dừng cho sếp duyệt kịch bản** (gửi lời đọc + 2 hook thay thế). Sếp sửa gì thì sửa đúng chỗ đó.

## 5. Hình ảnh: 5 phong cách, chuyển động thật

### 5.1. Phần dùng chung cho cả 5 phong cách
- **Bảng màu thương hiệu Tâm Cơ:** đen `#141414`, đỏ `#E63946`, xám ấm `#F3EFEF`, thêm trắng `#FFFFFF` và một màu phụ trung tính tùy phong cách. Đỏ chỉ dùng làm điểm nhấn (từ khóa, số dấu hiệu, chi tiết quan trọng). Mỗi phong cách được biến tấu nhưng phải nhận ra là cùng một kênh, chữ luôn dễ đọc.
- **Cùng `canh.json`, cùng giọng, cùng thời lượng từng cảnh.** Mỗi phong cách chỉ khác cách vẽ từng `bo_cuc` (hook-chu-to, nhan-vat-ke, dien-thoai, nhan-vat-va-dong-nghiep, dau-hieu-so, so-sanh, loi-khuyen, ket). Nhờ vậy sếp so sánh công bằng, và đổi phong cách sau này không phải viết lại kịch bản.
- **Điện thoại/nhóm chat** luôn là giao diện chung chung tự vẽ, không logo hay nhận diện Zalo, Messenger.
- Mọi nhân vật, đạo cụ, nền vẽ bằng SVG/CSS, lưu ở `assets/<phong-cach>/` để video sau dùng lại.

### 5.1b. Năm phong cách
| # | Mã | Phong cách | Đặc điểm hình | Chuyển động riêng | SFX đặc trưng |
|---|---|---|---|---|---|
| 1 | `hoat-hinh-phang` | Hoạt hình phẳng | Nhân vật dẫn chuyện cố định, nét bo tròn, nền mảng màu + họa tiết chấm; đồng nghiệp, sếp cùng phong cách | Thở, chớp mắt, **miệng theo giọng**, tay đổi tư thế (chỉ, đếm số, ôm đầu), đồ vật bật nảy | pop, whoosh |
| 2 | `bang-trang` | Vẽ tay trên bảng trắng | Nền giấy trắng ngà, nét bút đen dày mỏng, người que có biểu cảm, chữ viết tay (Patrick Hand hoặc font viết tay OFL hỗ trợ tiếng Việt), 1 màu nhấn đỏ | **Nét vẽ hiện dần** (stroke-dashoffset theo t), có thể kèm bàn tay cầm bút vẽ; miệng người que theo giọng | tiếng bút sột soạt, lật giấy |
| 3 | `truyen-tranh` | Truyện tranh | Khung tranh viền đen dày, chấm halftone, bong bóng thoại/ý nghĩ vài chữ, hiệu ứng tốc độ, chữ tượng thanh | Khung tranh xuất hiện lần lượt, camera trượt từ khung này sang khung khác, khung rung nhẹ khi "bụp"; miệng nhân vật theo giọng | lật trang, "bụp", whoosh |
| 4 | `tin-nhan` | Mô phỏng tin nhắn | Màn hình chat chiếm phần lớn khung; bong bóng tin nhắn, "đang nhập…", ảnh đại diện tròn; cảnh xen: khuôn mặt nhân vật phản ứng (avatar lớn) | Tin nhắn hiện theo từng câu đọc, cuộn màn hình, so sánh nhắn "sai" (gạch chéo đỏ) và "đúng" (tick xanh); chữ nhấn là tin nhắn ghim | gõ phím, ting tin nhắn |
| 5 | `tranh-tinh-zoom` | Tranh minh họa điện ảnh | Tranh bóng đổ (silhouette) tông điện ảnh: văn phòng chiều tà, người ngồi một mình, nhóm người quay lưng; ánh sáng cửa sổ, vignette | **Parallax nhiều lớp** (tiền cảnh, nhân vật, hậu cảnh trượt lệch tốc độ), zoom chậm, hạt bụi bay, chữ nhấn kiểu phụ đề phim (không phải phụ đề lời) | riser, whoosh trầm |

### 5.1c. Video mẫu và trang so sánh
- Mỗi phong cách làm **1 video mẫu 25–30 giây** = các cảnh đầu của kịch bản (hook + câu chuyện + dấu hiệu 1), đã có giọng, SFX, logo góc, đạt đủ chuẩn mục 0 (trừ thời lượng). Không cần dựng cả video cho cả 5 phong cách, để tiết kiệm thời gian máy.
- Mỗi mẫu kèm 1 ảnh bìa thử.
- `review/so-sanh.html`: một trang mở bằng trình duyệt, 5 video xếp cạnh nhau (có nút phát cùng lúc), dưới mỗi video: tên phong cách, thời gian render, ảnh bìa. Không cần server.
- **Dừng cho sếp chọn 1 phong cách** (hoặc kết hợp, ví dụ "hoạt hình phẳng + cảnh tin nhắn của phong cách 4"). Nếu sếp muốn xem trọn video của 2 phong cách trước khi chọn thì làm thêm.
- Sau khi chọn: hoàn thiện video đầy đủ 75–90 giây theo phong cách đó (mục 5.2 → 8).

### 5.2. Kỹ thuật dựng (quay từng khung hình)
- `render/<phong-cach>/video.html` (mỗi phong cách một trang, dùng chung thư viện `render/chung.js` cho easing, chuyển cảnh, miệng theo giọng, logo góc): trang 1080×1920 đọc `canh.json` + `thoi-luong.json`, có hàm `renderAt(t)` vẽ đúng khung hình tại giây `t` (không dùng animation chạy theo đồng hồ thật).
- Chuyển động bắt buộc (áp dụng theo từng phong cách ở bảng 5.1b):
  - nhân vật thở nhẹ (thân nhún 1–2px), chớp mắt mỗi 2–4 giây;
  - **miệng mấp máy theo giọng**: `pipeline/bien-do.py` tính âm lượng giọng theo từng khung (1/30 giây) ra `bien-do.json`; độ mở miệng theo âm lượng (im lặng thì ngậm);
  - đồ vật/chữ bật vào có độ nảy (easing back/elastic), mỗi thứ lệch nhau 0,1–0,2 giây;
  - chữ nhấn xuất hiện ngay khi câu bắt đầu, từ khóa quan trọng đổi màu cam;
  - camera đẩy vào rất nhẹ trong mỗi cảnh (scale 1 → 1,04);
  - chuyển cảnh 0,25–0,35 giây (trượt, che mảng màu, phóng), mỗi loại không dùng quá 3 lần liên tiếp;
  - cảnh "dấu hiệu" có số to bật vào + SFX.
- `render/quay.mjs <phong-cach> [--tu c01 --den c06]`: Playwright mở trang, lặp `t` bước 1/30 giây, chụp JPEG chất lượng 92, đẩy qua pipe thẳng vào ffmpeg. Mỗi cảnh một file mp4 cùng thông số (`libx264 -preset veryfast -crf 18 -pix_fmt yuv420p -r 30`); ghi tên tạm `.tmp.mp4`, đổi tên khi ffmpeg thoát mã 0; chuyển cảnh nằm bên trong file của cảnh.
- **Trước khi quay mỗi phong cách:** xuất 6 khung hình ở các thời điểm nhiều chi tiết nhất thành 1 ảnh ghép nhỏ (contact sheet), tự xem: font, dấu, tràn chữ, vùng an toàn, nhân vật có bị méo. Sửa xong mới quay.
- Ghép bằng concat demuxer `-c copy`; chèn logo góc bằng `overlay` (một lần encode cuối, `-crf 18`); gắn âm thanh.

## 6. Âm thanh

- Đọc giọng **từng cảnh** ra `giong/<id>.wav` (qua hậu kỳ ở mục 3.6). Thời lượng cảnh = độ dài giọng + 0,15–0,35 giây nghỉ (dài hơn sau câu hook và trước câu chốt).
- `pipeline/sfx.py` (numpy/scipy) tổng hợp thư viện SFX sạch: whoosh, swoosh nhẹ, pop, ding, tick, tiếng tin nhắn, thud nhẹ. Có thể dùng thêm gói **CC0** (ví dụ của Kenney.nl), ghi nguồn vào `assets/sfx/NGUON.md`.
- Gắn SFX đúng khung hình đồ vật bật vào / chuyển cảnh (lấy mốc thời gian từ `renderAt`), mỗi cảnh tối đa 2 SFX, không đè lên âm tiết quan trọng.
- Trộn: giọng là chính, SFX thấp hơn ~12 dB; `loudnorm=I=-14:TP=-1.5:LRA=11` (2 lượt cho chính xác). AAC 48 kHz 192 kbps.

## 7. Kiểm tra chất lượng tự động (bắt buộc trước khi gửi sếp)

`pipeline/kiem-tra.sh` in tối đa 10 dòng:
- thời lượng 75–90 giây; độ phân giải, fps, codec, pix_fmt đúng mục 0;
- độ to bằng `ebur128`: -14 ± 1 LUFS, true peak ≤ -1,5;
- `blackdetect` không có khung đen; `freezedetect` không có đoạn đứng hình > 2 giây;
- `silencedetect` không có khoảng lặng > 1,2 giây;
- độ dài âm thanh và hình lệch nhau < 1 khung;
- dung lượng < 100 MB.
Sau đó xuất **contact sheet 12 khung** của video thành phẩm, tự xem lần cuối. Lỗi nào thì sửa đúng cảnh đó và quay lại cảnh đó, không quay lại cả video.

## 8. Gói đăng bài

Trong `xuat-ban/`:
- `video.mp4`
- `anh-bia.png` 1080×1920: nhân vật biểu cảm mạnh + chữ to 3–6 từ (ví dụ "BẠN ĐANG BỊ GHÉT NGẦM?"), trong vùng an toàn. Dựng bằng chính template, không phải cắt khung ngẫu nhiên.
- `dang-bai.md`: 3 phương án tiêu đề (< 60 ký tự); mô tả TikTok (1–2 câu + câu hỏi kéo bình luận), Facebook (3–4 câu), YouTube Shorts (2–3 câu, có #Shorts); 5–8 hashtag (ví dụ #kynanggiaotiep #tamlyhoc #congso #nguoitredilam #tamco); 1 bình luận ghim; gợi ý giờ đăng.

**Gửi sếp xem bản nháp.** Sếp góp ý thì sửa, tối đa 2 vòng.

## 9. Báo cáo khả thi

`bao-cao.md`, báo sếp bảng sau:

| Hạng mục | Kết quả |
|---|---|
| Thời gian cài đặt, lỗi gặp phải | |
| Giọng đọc: công cụ, giọng chọn, hệ số tốc độ | |
| Thời gian đọc giọng cả video | |
| Thời gian quay + encode: từng mẫu 30 giây của 5 phong cách, và video đầy đủ | |
| Phong cách sếp chọn, phong cách nào nặng/nhẹ máy nhất | |
| Tổng thời gian máy từ kịch bản đến mp4 | |
| Token cả phiên (`/cost` hoặc `npx ccusage@latest daily --offline`) | |
| Ước tính cho 7 chủ đề/tuần: thời gian máy + token, có vừa gói Pro không | |
| Phần nào làm một lần dùng mãi (nhân vật, đạo cụ, SFX, template) | |

Kết luận: **khả thi / khả thi có điều kiện / không khả thi**, nút thắt lớn nhất, và đề xuất trước khi làm bản đầy đủ (`HUONG_DAN_CAI_DAT_BAN_LINH_MEM.md`).

---

## Thứ tự làm
2 → 3 (dừng: sếp chọn giọng) → 4 (dừng: sếp duyệt kịch bản) → 5.1, 5.1b dựng nhân vật, đạo cụ, template 5 phong cách (làm song song khi chờ sếp) → 6 → 5.2 quay 5 mẫu 30 giây → 5.1c trang so sánh (dừng: sếp chọn phong cách) → 5.2 quay video đầy đủ → 7 → 8 (dừng: sếp xem bản nháp) → 9.
Gặp lỗi không tự xử lý được sau 2 lần thử: dừng, mô tả lỗi ngắn gọn, hỏi sếp.
