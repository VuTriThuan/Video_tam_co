# HƯỚNG DẪN CÀI ĐẶT HỆ THỐNG "BẢN LĨNH MỀM" (bản 4)
## Đội AI agent làm video ngắn bằng Claude Code: miễn phí, chạy trên máy, tiết kiệm token

> **Gửi Claude Code:** Đây là đặc tả toàn bộ dự án. Đọc hết một lượt, rồi làm theo **Phần 13**. **Ưu tiên số một hiện tại: GIAI ĐOẠN 1, tức là cài cho chạy được và ra sản phẩm mẫu.** Những mục ghi "(giai đoạn 2)" thì chưa làm, chỉ để biết hướng thiết kế cho đúng. Sau mỗi bước, báo kết quả thật ngắn gọn. Xưng "em", gọi chủ kênh là **"đại ca"**, trả lời bằng tiếng Việt.

---

## PHẦN 0. TÓM TẮT DỰ ÁN

**Kênh:** kỹ năng giao tiếp, tâm lý học ứng dụng, EQ cho người trẻ đi làm, gọi chung là "bản lĩnh mềm". Ví dụ chủ đề: phát hiện người nói dối, cách nhờ vả, đáp lời khéo, xử lý mâu thuẫn, thao túng tâm lý (cả cách dùng lẫn cách nhận diện), dấu hiệu bị ghét ngầm, quy tắc ngầm nơi công sở.

**Nền tảng:** TikTok, Facebook Reels, YouTube Shorts. Chủ kênh **tự đăng tay**.

**Sản lượng:** **7 chủ đề mỗi tuần.** Mỗi chủ đề là một "video gốc" 4–8 phút, cắt thành nhiều phần (thường 3–5 phần), mỗi phần là một video đăng riêng. Tức là khoảng 21–35 video mỗi tuần.

**Định dạng:**
- Khung dọc 1080×1920, 30 fps; mỗi phần dài 60–90 giây.
- Kịch bản thiết kế để mỗi phần **dừng đúng chỗ gây tò mò**; phần sau mở bằng 2–3 giây nhắc lại.
- **Không phụ đề, không nhạc nền.** Có **hiệu ứng âm thanh (SFX)** cho các hành động trong video.
- Không lộ mặt chủ kênh; có **nhân vật dẫn chuyện cố định**.
- Giọng đọc AI tiếng Việt **miễn phí, chạy trên máy**.

**Giọng văn:** chủ yếu **kể chuyện cá nhân ở ngôi thứ nhất**, pha thêm đoạn **giảng giải kiểu chuyên gia** để đúc kết. Không dùng kiểu diễn lại hội thoại A–B. Không cần kiểm chứng số liệu.

**Chủ đề cấm:** tôn giáo; Đảng, Nhà nước, chính trị; luật pháp; nội dung nhạy cảm tương tự.

**Chủ đề thao túng/ảnh hưởng:** **được phép dạy cách dùng** các kỹ thuật thao túng, gây ảnh hưởng, thuyết phục trong giao tiếp, công sở, đàm phán, bán hàng, nhờ vả (ví dụ: neo giá, chân trước cửa, có qua có lại, đóng khung câu hỏi, im lặng gây áp lực, khen để mở lời, tạo khan hiếm, nắm thế chủ động trong cuộc họp). Ranh giới, do agent `kiem-duyet` giữ:
- Không dạy kiểm soát/cô lập/gaslighting người yêu, vợ chồng, người thân; không dạy ép buộc tình dục.
- Không dạy lừa đảo chiếm đoạt tiền, giả danh, gian lận; không nhắm vào trẻ em, người già, người yếu thế.
- Mỗi video thao túng nên có 1–2 câu "nếu người khác dùng chiêu này với bạn thì nhận ra bằng cách…". Câu này vừa giúp người xem, vừa giảm rủi ro nền tảng hạn chế phân phối.

**Kiếm tiền:** tạm thời không gắn giỏ hàng, không giới thiệu sản phẩm.

**Hai chốt duyệt của đại ca:** (1) duyệt **cả 7 kịch bản một lần vào thứ Hai**, (2) duyệt **bản nháp video** theo lô. Duyệt trên giao diện Phòng điều hành (Phần 10), không duyệt lẻ từng cái.

**Lịch sản xuất hằng tuần (giai đoạn 2):** sẽ thiết kế sau, khi hệ thống đã chạy ra sản phẩm mẫu. Những gì đã chốt: duyệt 7 kịch bản một lần vào thứ Hai; các phần của một chủ đề đăng cùng ngày, cách nhau vài giờ. Chưa cần lập lịch, chưa cần chạy tự động qua đêm.

**Đại ca chỉ nói chuyện với trưởng nhóm.** Ô chat của Claude Code là phiên của trưởng nhóm (agent cao nhất). Agent con không bao giờ hỏi thẳng đại ca; có gì cần đại ca quyết thì báo lên trưởng nhóm, trưởng nhóm gom lại và hỏi đại ca một lần.

**Một video dùng chung cho cả 3 nền tảng.** Mỗi video có **logo kênh nhỏ ở góc** để chống bị lấy lại (Phần 4.4).

**Gói Claude: Pro.** Chỉ dùng **Opus 5.5** cho mọi agent. **Fable bị tắt mặc định**, vì trên gói Pro Fable không nằm trong hạn mức của gói mà trừ vào usage credits (tốn tiền thật). Chỉ dùng Fable khi đại ca gõ lệnh riêng (Phần 11), và phải hỏi xác nhận trước khi chạy.

**Sau khi đăng 24 giờ:** đại ca chụp màn hình kết quả, thả vào thư mục, agent `phan-tich` đánh giá và rút bài học cho tuần sau (Phần 9).

**Tách biệt hoàn toàn** với các dự án khác của đại ca.

---

## PHẦN 1. MÁY VÀ GIỚI HẠN PHẦN CỨNG

| Thông số | Giá trị |
|---|---|
| Máy | MacBook Pro 15-inch, 2017 |
| CPU | Intel Core i7 lõi tứ 2,8 GHz |
| Đồ họa | Intel HD Graphics 630 (không CUDA, không Apple Silicon) |
| RAM | 16 GB |
| macOS | Ventura 13.7.6 |

**Bắt buộc tuân theo:**
- **Không** tạo ảnh/video bằng AI (Stable Diffusion, Flux, video AI...). Hình ảnh **dựng bằng code**: HTML/CSS/SVG + JavaScript, quay từng khung hình bằng trình duyệt headless, ghép bằng ffmpeg.
- **Không** dịch vụ trả phí, API trả phí, GPU thuê. Thứ duy nhất tốn phí là gói Claude đại ca đang dùng, nên phải **tiết kiệm token** (Phần 3).
- Encode H.264 dùng `-preset veryfast`. Mỗi lúc chỉ một job nặng (TTS hoặc render).
- 7 chủ đề/tuần nghĩa là khoảng 35–50 phút video thành phẩm mỗi tuần. Giọng đọc và render chạy **qua đêm** bằng hàng đợi (Phần 4.5). Máy được để chạy liên tục, cắm sạc.
- Chừa ít nhất 30 GB ổ trống. Sau khi đại ca đăng xong, tự xóa file trung gian (`03_giong/`, `04_canh/`) của chủ đề cũ hơn 14 ngày, chỉ giữ thành phẩm.

---

## PHẦN 2. CÀI CÔNG CỤ NỀN

Mỗi bước chạy lệnh kiểm tra phiên bản; bước nào có rồi thì bỏ qua.

```bash
xcode-select --install          # đã có thì bỏ qua
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
brew install ffmpeg git uv node jq
ffmpeg -version | head -1 ; node -v ; uv --version
```
- macOS 13 có thể không còn trong nhóm hỗ trợ chính của Homebrew, một số gói phải build từ mã nguồn. Nếu `brew install ffmpeg` lỗi hoặc quá lâu: dùng binary tĩnh ffmpeg cho macOS Intel (ví dụ evermeet.cx), đặt vào `~/bin`, thêm vào PATH. Ghi lại vào `docs/ghi-chu-cai-dat.md`.
- Node cần bản 20 trở lên.

**Font (giấy phép OFL):** tải **Be Vietnam Pro** và **Patrick Hand** từ Google Fonts vào `assets/fonts/`. Kiểm tra đủ dấu: "Ặ ẩ ỡ ự ỷ đ Đ".

**Trình duyệt quay khung hình:**
```bash
cd ~/BanLinhMem/render && npm init -y && npm install playwright && npx playwright install chromium
```
Nếu Chromium của Playwright không chạy trên macOS 13, dùng Google Chrome có sẵn: `chromium.launch({ channel: "chrome" })`.

**Theo dõi token:** `npx ccusage@latest daily --offline` (công cụ đọc log có sẵn trên máy, không gọi mạng, không tốn token).

---

## PHẦN 3. NGUYÊN TẮC TIẾT KIỆM TOKEN (QUAN TRỌNG NHẤT)

Token chỉ được tiêu cho việc **cần suy nghĩ sáng tạo hoặc phán đoán**: chọn chủ đề, viết kịch bản, kiểm duyệt, phân cảnh, viết mô tả đăng bài, phân tích kết quả. Mọi thứ **máy móc** (đọc giọng, dựng hình, trộn âm, ghép cắt, thumbnail, dọn file) do **script `blm`** làm, **không tốn token**.

### 3.1. Chia việc: AI hay script, model và mức suy nghĩ (effort)
Mức effort: `medium` = trung bình, `high` = cao, `xhigh` = cao hơn. Không dùng `max`.

| Việc | Ai làm | Model | Effort | maxTurns |
|---|---|---|---|---|
| Điều phối (phiên chính) | trưởng nhóm | opus | medium | — |
| Lên 7 chủ đề/tuần | `len-chu-de` | opus | medium | 12 |
| Viết kịch bản | `bien-kich` | opus | **high** | 6 |
| Kiểm duyệt kịch bản | `kiem-duyet` | opus | medium | 4 |
| Bảng phân cảnh | `dao-dien` | opus | medium | 6 |
| Lồng tiếng, dựng hình, SFX, ghép, cắt, thumbnail, logo góc | **script `blm`** | không dùng AI | — | — |
| Tiêu đề, mô tả, hashtag, giờ đăng | `dong-goi` | opus | medium | 4 |
| Phân tích kết quả 24h | `phan-tich` | opus | high | 10 |
| Tổng kết tháng | `phan-tich` | opus | xhigh (truyền qua tham số effort khi gọi) | 10 |
| Viết lại kịch bản quan trọng | `bien-kich` | **fable**, chỉ khi đại ca ra lệnh | medium | 6 |

Cách khai báo trong frontmatter mỗi agent:
```yaml
model: opus
effort: medium        # hoặc high
maxTurns: 6           # chặn agent chạy vòng vo tốn token
omitClaudeMd: true    # agent không nạp CLAUDE.md, chỉ dùng hướng dẫn riêng của nó
```
- Phiên chính đặt mặc định: trong `.claude/settings.json` thêm `"model": "opus"` và `"modelSettings": {"claude-opus-5-5": {"effortLevel": "medium"}}`.
- **Chặn Fable vô tình:** trưởng nhóm không bao giờ tự truyền `model: fable` khi gọi agent. Lệnh "viết lại bằng fable" phải hỏi đại ca xác nhận ("Lệnh này trừ usage credits, đại ca chắc chứ?") trước khi chạy.
- Phiên chính (trưởng nhóm) chỉ điều phối, không tự viết nội dung.

### 3.1b. Cách các agent giao tiếp: như đồng nghiệp thật, nhưng không nói chuyện phiếm
**Mô hình:** như một phòng làm nội dung. **Trưởng nhóm** (phiên chính) giao việc, agent con làm và báo cáo lại, trưởng nhóm phản hồi khi cần. Agent con không nhắn trực tiếp cho nhau: việc gì liên quan agent khác thì báo trưởng nhóm, trưởng nhóm chuyển, giống công ty thật.

**Mỗi agent có tên và vai** (để bản tin đọc như chat của một team):
| Agent | Tên | Vai |
|---|---|---|
| trưởng nhóm (phiên chính) | Anh Hải | điều phối, quyết định, báo cáo đại ca |
| len-chu-de | Linh | lên ý tưởng |
| bien-kich | Tuấn | biên kịch |
| kiem-duyet | Chị Mai | kiểm duyệt |
| dao-dien | Khoa | đạo diễn hình ảnh |
| dong-goi | Vy | đóng gói đăng bài |
| phan-tich | Đức | phân tích số liệu (giai đoạn 2) |
| script `blm` | Máy dựng | báo tiến độ render (tin tự động, không tốn token) |

**Tin nhắn phải giống người thật:** câu tự nhiên, xưng hô anh/em/chị theo vai, nói thẳng vào việc. Ví dụ:
- Anh Hải → Tuấn: "Tuấn viết giúp anh kịch bản 'Dấu hiệu bị ghét ngầm' nhé, 4–5 phần, giọng kể chuyện cá nhân. Ý tưởng Linh để ở chu-de/lich-tuan.md mục 1. Phần 1 cần cắt ngay trước dấu hiệu nặng nhất."
- Tuấn → Anh Hải: "Xong rồi anh, 4 phần, khoảng 5 phút 20. Em cắt phần 1 ở đoạn phát hiện nhóm chat riêng. Hơi băn khoăn phần 3 hơi dài, chị Mai xem giúp có nên tách không."
- Anh Hải → Chị Mai: "Chị rà kịch bản của Tuấn giúp em, Tuấn hỏi phần 3 có nên tách."
- Máy dựng → Anh Hải: "Xong phần 2: 78 giây, 21 cảnh."

**Luật chống vòng lặp và nói chuyện phiếm (bắt buộc):**
1. **Mỗi tin nhắn phải có nội dung công việc:** giao việc, kết quả, câu hỏi cụ thể, hoặc quyết định. Không có tin chỉ để chào, cảm ơn, tạm biệt, "ok", "đã nhận", "em bắt đầu đây".
2. **Không chào đầu, không chào cuối.** Có thể mở bằng tên người nhận ("Tuấn ơi,…") nhưng câu tiếp theo phải là việc.
3. **Làm xong là dừng.** Agent con báo kết quả xong thì kết thúc; trưởng nhóm **không** gửi lại tin xác nhận hay cảm ơn. Chỉ nhắn tiếp khi có yêu cầu sửa hoặc trả lời câu hỏi.
4. **Tối đa 3 lượt qua lại** giữa trưởng nhóm và một agent cho cùng một việc (giao việc → báo cáo/hỏi → phản hồi → báo cáo cuối). Tới lượt thứ 3 mà chưa xong thì trưởng nhóm tự quyết, hoặc ghi vào danh sách hỏi đại ca.
5. **Agent con được hỏi trưởng nhóm tối đa 1 câu cho mỗi việc**, và chỉ hỏi khi thật sự không tự quyết được. Câu hỏi phải kèm phương án em đề xuất ("Em định tách phần 3 làm đôi, anh thấy được không?").
6. **Độ dài:** tin giao việc tối đa 4 câu (kèm đường dẫn file); tin báo cáo tối đa 5 câu. Nội dung dài (kịch bản, JSON) luôn nằm trong file, tin nhắn chỉ nói nằm ở đâu và điểm cần chú ý.
7. **Hook chặn cứng** (Phần 10.2): tin trưởng nhóm gửi agent mà chỉ là chào/cảm ơn thì bị chặn; lượt thứ 4 với cùng một agent cho cùng một việc thì bị chặn.
8. **Tối đa 1 vòng sửa kịch bản.** Chị Mai sửa trực tiếp được thì sửa luôn; chỉ trả lại cho Tuấn khi lỗi nặng, và Tuấn viết lại đúng một lần.

### 3.2. Mười quy tắc bắt buộc
1. **`CLAUDE.md` ngắn, dưới 120 dòng.** Chi tiết để trong `docs/`, agent chỉ đọc khi cần.
2. **Không bao giờ đọc file media** (wav, mp4, png lớn) hay log dài vào ngữ cảnh. Kiểm tra bằng lệnh trả về 1 dòng (`ffprobe ... | jq`, `tail -n 5`).
3. **Script `blm` in ra tối đa 3 dòng** khi thành công (ví dụ `OK phan-2.mp4 78.4s`); log đầy đủ ghi vào `logs/`. Chỉ khi lỗi mới in 20 dòng cuối.
4. **Subagent trả về tóm tắt tối đa 8 dòng**; nội dung thật ghi vào file. Trưởng nhóm không đọc lại file nếu không cần.
5. **Làm theo lô:** một phiên "lên tuần" tạo 7 chủ đề và 7 kịch bản liền; không mở 7 phiên rời.
6. **Bảng phân cảnh dùng ID template có sẵn** (Phần 6.3), JSON gọn, không mô tả hình bằng văn xuôi dài.
7. **Tái sử dụng:** thư viện template, SFX, nhân vật, câu mở đầu/kết thúc mẫu dựng một lần, dùng mãi.
8. **Gõ `/clear` giữa các công đoạn lớn** (sau khi duyệt kịch bản, sau khi duyệt bản nháp). Trạng thái nằm trong file `du-an/<slug>/trang-thai.json`, không nằm trong trí nhớ phiên.
9. **Ảnh chụp kết quả thu nhỏ trước khi đọc:** `sips -Z 1200 anh.png` (sips có sẵn trên macOS), cắt bỏ phần thừa nếu được.
10. **Hook theo dõi (Phần 10) không in gì ra stdout**, để không chèn chữ vào ngữ cảnh của Claude.

11. **Gói Pro có giới hạn mỗi 5 giờ và mỗi tuần, dùng chung cho chat và Claude Code.** Không gom quá 4 kịch bản vào một phiên; nếu chạm giới hạn thì lưu trạng thái vào file và dừng, phiên sau làm tiếp. Không bật usage credits tự động.

### 3.3. Đo lường
- Cuối mỗi tuần chạy `npx ccusage@latest weekly --offline --json` và ghi tổng vào `logs/token-tuan.csv`. Phòng điều hành hiển thị con số này.
- Mục tiêu: sau 2 tuần, tìm 3 chỗ tốn token nhất và tối ưu tiếp.

---

## PHẦN 4. GIỌNG ĐỌC, SFX VÀ SCRIPT `blm`

### 4.1. Giọng đọc chính: skill `free-tts` (VieNeu-TTS)
- Repo skill: `https://github.com/bachdyon/video-automator-skills` (thư mục `free_tts`/`free-tts`).
- Mã nguồn VieNeu-TTS: `https://github.com/pnnbao97/VieNeu-TTS`.
1. Clone vào thư mục riêng, trống: `~/BanLinhMem/vendor/video-automator-skills`.
2. **Đọc `SKILL.md` và script trước khi chạy** (code bên thứ ba). Báo đại ca nếu thấy gửi dữ liệu đi đâu bất thường.
3. Copy skill vào `.claude/skills/free-tts/`. Tạo môi trường `uv` Python 3.11/3.12 tại `.venv`.
4. Cài `vieneu`. **Máy Intel: KHÔNG dùng extra index `.../whl/metal/`** (bản đó dành cho chip Apple). Cài bản CPU.
5. Chạy thử chế độ `--mode turbo`, đo "bao nhiêu giây để đọc 60 giây lời", ghi vào `docs/ghi-chu-cai-dat.md`.

**Dự phòng:** KorvaTTS (TTS tiếng Việt chạy trên máy, Apache-2.0, `pip install korvatts`, repo `github.com/dogenthq/KorvaTTS`). Cũng đọc mã trước khi chạy.

**Chọn giọng:** tạo 4–6 mẫu cùng một đoạn 20 giây vào `review/giong-mau/`, **dừng cho đại ca nghe và chọn**, lưu vào `config/voice.toml`.

**Chuẩn hóa văn bản** (`pipeline/chuan_hoa.py`): số thành chữ, viết tắt thành cách đọc, bỏ emoji, giữ nguyên dấu; từ điển sửa phát âm tại `config/tu-dien-phat-am.toml`.

### 4.2. SFX miễn phí
- `pipeline/tao_sfx.py` tự tổng hợp bằng numpy/scipy: whoosh, pop, ding, click, gõ phím, nét bút, lật giấy, "bụp", riser, ting tin nhắn. Xuất vào `assets/sfx/`.
- Có thể bổ sung gói **CC0** (ví dụ gói âm thanh của Kenney.nl); ghi nguồn vào `assets/sfx/NGUON.md`.
- Trộn: SFX thấp hơn giọng 10–14 dB, không nhạc nền, chuẩn hóa **-14 LUFS**, true peak -1,5 dB.

### 4.3. Dựng hình
- Mỗi template trong `render/templates/<phong-cach>/<id>.html` có hàm `renderAt(t)` vẽ đúng khung hình tại giây t (không dùng animation chạy theo đồng hồ thật).
- `render/quay.mjs`: mở trang 1080×1920, lặp t theo bước 1/30 giây, chụp JPEG chất lượng 92, đẩy qua pipe vào ffmpeg, mỗi cảnh ra một file mp4. Mọi cảnh cùng thông số: `libx264 -preset veryfast -crf 20 -pix_fmt yuv420p -r 30`.
- Ghi ra tên tạm `.tmp.mp4`, đổi tên khi ffmpeg thoát mã 0. Chỉ render lại cảnh bị sửa.
- Trước khi render cả loạt template mới: chụp 3 khung hình nhiều chi tiết nhất để kiểm tra font, tràn chữ, mất dấu (chỉ làm khi tạo template mới, không làm mỗi video).

### 4.4. Script điều khiển `blm` (Python, `pipeline/blm.py`, alias `blm`)
| Lệnh | Việc |
|---|---|
| `blm giong <slug>` | chuẩn hóa văn bản, đọc từng cảnh, đo thời lượng thật, ghi vào JSON |
| `blm dung <slug> [--canh id]` | render các cảnh |
| `blm tron <slug>` | trộn giọng + SFX theo JSON |
| `blm ghep <slug>` | ghép cảnh (concat demuxer, `-c copy`), thêm màn "Phần tiếp theo →" 1,5 giây, chèn logo góc (một lần encode cho mỗi phần), gắn âm thanh |
| `blm kiemtra <slug>` | thời lượng mỗi phần 60–90 giây, không khung đen, tiếng khớp hình |
| `blm thumbnail <slug>` | ảnh bìa 1080×1920 cho từng phần từ template |
| `blm sanxuat <slug>` | chạy liền giong → dung → tron → ghep → kiemtra → thumbnail |
| `blm hangdoi` | chạy lần lượt mọi chủ đề đã duyệt kịch bản (dùng qua đêm) |
| `blm don` | xóa file trung gian cũ hơn 14 ngày |

**Logo góc chống lấy video:** logo kênh (PNG nền trong) cao khoảng 110px, độ mờ 55%, đặt **góc trên bên trái** (cách mép trái 48px, mép trên 180px), vì bên phải và phía dưới bị giao diện TikTok/Reels/Shorts che. Cảnh cuối mỗi phần hiện tên kênh to ở giữa 1 giây. Chèn bằng ffmpeg `overlay` trong `blm ghep`, không tốn token.

Mỗi bước ghi trạng thái vào `du-an/<slug>/trang-thai.json` và **một dòng sự kiện** vào `logs/su-kien.jsonl` (để Phòng điều hành hiển thị).

### 4.5. Chạy qua đêm (giai đoạn 2)
Sau khi đại ca đồng ý: tạo `launchd` job chạy `blm hangdoi` lúc 23:00 mỗi ngày (không tốn token vì không gọi Claude).

---

## PHẦN 5. CẤU TRÚC THƯ MỤC

```
~/BanLinhMem/
├── CLAUDE.md                 # < 120 dòng
├── .claude/
│   ├── agents/               # 6 agent (Phần 6)
│   ├── hooks/                # hook gửi sự kiện cho Phòng điều hành (Phần 10)
│   ├── settings.json
│   └── skills/free-tts/
├── config/  kenh.toml voice.toml tu-dien-phat-am.toml bai-hoc.md phong-cach/
├── docs/    quy-trinh.md mau-kich-ban.md template-catalog.md ghi-chu-cai-dat.md
├── assets/  fonts/ sfx/ logo/ nhan-vat/
├── pipeline/ blm.py chuan_hoa.py tao_sfx.py ...
├── render/   templates/ quay.mjs
├── dieu-hanh/                # Phòng điều hành (Phần 10)
├── chu-de/   kho-chu-de.md da-lam.md lich-tuan.md
├── du-an/<yyyy-mm-dd>_<slug>/
│   ├── 01_kich-ban.md 02_phan-canh.json trang-thai.json ban-tin.jsonl
│   ├── 03_giong/ 04_canh/ 05_nhap/
│   └── 06_xuat-ban/phan-<n>/ video.mp4 thumbnail.png dang-bai.md
├── phan-tich/ inbox/ bao-cao/ so-lieu.csv
├── review/
├── logs/     su-kien.jsonl token-tuan.csv ...
└── vendor/
```
Khởi tạo git; `.gitignore` bỏ qua `*.wav *.mp4 *.m4a logs/ du-an/*/0[3-6]* vendor/`.

---

## PHẦN 6. ĐỘI AGENT (6 AGENT AI)

### 6.1. Quy trình một tuần (giai đoạn 2)
```
CHỦ NHẬT — phiên "lên tuần" (chia 2 phiên sáng/tối):
  [len-chu-de] 7 chủ đề → [bien-kich] 7 kịch bản → [kiem-duyet]
  → THỨ HAI: ★ ĐẠI CA DUYỆT 7 KỊCH BẢN trên Phòng điều hành
  → [dao-dien] 7 bảng phân cảnh
ĐÊM THỨ HAI → THỨ TƯ: blm hangdoi (giọng + hình + âm + ghép, không tốn token)
THỨ NĂM: ★ ĐẠI CA DUYỆT BẢN NHÁP → [dong-goi] → 06_xuat-ban/
ĐẠI CA ĐĂNG → sau 24h thả ảnh chụp vào phan-tich/inbox/ → [phan-tich]
  → cập nhật config/bai-hoc.md → tuần sau len-chu-de và bien-kich đọc file này
```
Quy trình tuần ở trên là hướng thiết kế (giai đoạn 2). Ở giai đoạn 1 chỉ chạy một chủ đề mẫu theo Phần 8.

Bản tin: tin giao việc của trưởng nhóm và tin báo cáo của agent con (viết theo luật ở Phần 3.1b) được **hook ghi lại nguyên văn** vào `du-an/<slug>/ban-tin.jsonl`. Không ai phải viết thêm tin riêng cho bản tin, nên không tốn thêm token.

### 6.2. `len-chu-de.md`
```markdown
---
name: len-chu-de
description: Đề xuất 7 chủ đề cho tuần tới của kênh Bản lĩnh mềm.
model: opus
effort: medium
maxTurns: 12
omitClaudeMd: true
tools: WebSearch, Read, Write, Edit
---
Kênh: giao tiếp, tâm lý học ứng dụng, EQ, thao túng/ảnh hưởng cho người trẻ đi làm 22–32 tuổi.
Đọc trước: config/bai-hoc.md, chu-de/da-lam.md (chỉ đọc 30 dòng cuối).
Tìm 3–5 lượt WebSearch về chủ đề tâm lý/công sở đang được bàn nhiều. Không fetch trang dài.
Chọn 7 chủ đề, cân bằng: 2 công sở, 2 giao tiếp hằng ngày, 1–2 thao túng/ảnh hưởng, 1 nhận diện người khác, 1 tự do.
Mỗi chủ đề 1 khối ngắn: slug, tiêu đề, nỗi đau, góc kể chuyện cá nhân, 3–6 ý, hook 1 dòng, điểm tò mò để cắt, số phần dự kiến.
CẤM: tôn giáo, chính trị/Đảng/Nhà nước, luật pháp. Không trùng da-lam.md.
Ghi vào chu-de/lich-tuan.md. Báo cáo cho Anh Hải theo luật Phần 3.1b (tự nhiên, tối đa 5 câu): đã ghi ở đâu, chủ đề nào em thấy mạnh nhất.
```

### 6.3. `bien-kich.md`
```markdown
---
name: bien-kich
description: Viết kịch bản video gốc 4–8 phút, chia phần 60–90 giây với điểm cắt gây tò mò.
model: opus
effort: high
maxTurns: 6
omitClaudeMd: true
tools: Read, Write
---
Đọc docs/mau-kich-ban.md và config/bai-hoc.md trước.
Giọng: người thật kể chuyện, tự nhiên, không văn mẫu.
Cấu trúc: hook 3 giây → chuyện cá nhân ngôi thứ nhất (nhân vật tên Việt, chi tiết cụ thể, có cảm xúc) → bước ngoặt → phần chuyên gia đúc kết 3–6 ý, mỗi ý có ví dụ, câu "nên"/"không nên" → kết một câu đọng lại + mời theo dõi (không bán hàng).
Chủ đề thao túng: dạy rõ cách làm, kèm 1–2 câu cách nhận ra khi bị người khác dùng.
Chia phần 150–230 từ/phần. Mỗi phần (trừ phần cuối) kết ở điểm tò mò ("...và chiêu thứ ba mới là chiêu nguy hiểm nhất. Phần 2."). Mỗi phần (trừ phần 1) mở bằng 1–2 câu nhắc lại.
Không phụ đề, không emoji. Ghi du-an/<slug>/01_kich-ban.md. Báo cáo cho Anh Hải tối đa 5 câu, tự nhiên như đồng nghiệp: số phần, tổng thời lượng, điểm cắt, chỗ còn băn khoăn (nếu có).
```

### 6.4. `kiem-duyet.md`
```markdown
---
name: kiem-duyet
description: Rà kịch bản: chủ đề cấm, ranh giới thao túng, độ tự nhiên, điểm cắt, độ dài.
model: opus
effort: medium
maxTurns: 4
omitClaudeMd: true
tools: Read, Edit
---
Sửa trực tiếp, thêm cuối file mục "Ghi chú kiểm duyệt" (tối đa 6 dòng):
- Loại bỏ: tôn giáo, chính trị/Đảng/Nhà nước, luật pháp; xúc phạm nhóm người, vùng miền, giới tính.
- Ranh giới thao túng: không kiểm soát/cô lập/gaslighting người yêu, người thân; không ép buộc tình dục; không lừa đảo tiền, giả danh; không nhắm trẻ em, người già, người yếu thế. Có câu "cách nhận ra".
- Không lời khuyên y tế/tâm thần cụ thể.
- Câu nào trên 30 từ thì tách. Mỗi phần đúng 150–230 từ, có điểm cắt.
- Đưa 2 hook thay thế cho phần 1.
Báo cáo cho Anh Hải tối đa 4 câu: đã sửa gì, có cần Tuấn viết lại không (chỉ khi lỗi nặng).
```

### 6.5. `dao-dien.md`
```markdown
---
name: dao-dien
description: Biến kịch bản đã duyệt thành bảng phân cảnh JSON dùng template có sẵn.
model: opus
effort: medium
maxTurns: 6
omitClaudeMd: true
tools: Read, Write
---
Đọc config/kenh.toml (phong cách, nhân vật) và docs/template-catalog.md (danh sách ID template + tham số).
CHỈ dùng template có trong catalog. Nếu thật sự cần template mới, ghi vào mục "de_xuat_template" để làm sau, không tự chế.
Mỗi cảnh 2–6 giây: {"id","phan","loi","tpl","p":{tham số},"sfx":[["pop",0.2]],"chuyen":"cat|truot|mo"}.
Chữ trên màn hình chỉ là điểm nhấn, tối đa 6 chữ, không phải phụ đề. 3 giây đầu mỗi phần có chuyển động mạnh + SFX.
Ghi du-an/<slug>/02_phan-canh.json (gọn, không xuống dòng thừa). Báo cáo cho Anh Hải tối đa 3 câu: số cảnh, số phần, template mới cần làm (nếu có).
```

### 6.6. `dong-goi.md`
```markdown
---
name: dong-goi
description: Viết tiêu đề, mô tả, hashtag, bình luận ghim, giờ đăng cho từng phần trên TikTok, Facebook Reels, YouTube Shorts.
model: opus
effort: medium
maxTurns: 4
omitClaudeMd: true
tools: Read, Write
---
Chỉ đọc 01_kich-ban.md. Với mỗi phần ghi 06_xuat-ban/phan-<n>/dang-bai.md:
- 3 tiêu đề dưới 60 ký tự, gây tò mò, không sai sự thật; chữ in trên thumbnail (3–6 từ).
- Mô tả TikTok (1–2 câu + câu hỏi kéo bình luận), Facebook (3–4 câu), YouTube Shorts (2–3 câu, có #Shorts).
- 5–8 hashtag trộn rộng và hẹp. Một bình luận ghim.
- Giờ đăng: các phần của chủ đề đăng CÙNG MỘT NGÀY, cách nhau 2–4 giờ (mặc định 11:30, 15:30, 19:30, 21:30; đọc config/bai-hoc.md để điều chỉnh). Ghi giờ vào trang-thai.json.
Ghi chữ thumbnail vào trang-thai.json để `blm thumbnail` dựng ảnh. Báo cáo cho Anh Hải tối đa 3 câu.
```

### 6.7. `phan-tich.md` (agent mới: đánh giá sau 24 giờ)
Xem Phần 9.

---

## PHẦN 7. FILE `CLAUDE.md` CỦA DỰ ÁN (dưới 120 dòng)

Gồm: tóm tắt Phần 0 thật ngắn; giới hạn máy; 10 quy tắc token (Phần 3.2); bảng lệnh của đại ca (Phần 11); bảng lệnh `blm`; quy tắc an toàn (đọc code bên thứ ba trước khi chạy, chỉ làm việc trong `~/BanLinhMem`, không xóa file ngoài `du-an/*/0[3-4]*` và `logs/`); xưng hô "đại ca" / "em". Mọi chi tiết khác trỏ tới `docs/`.

`docs/mau-kich-ban.md`:
```
# <Tiêu đề>
Slug / Nỗi đau / Tổng thời lượng / Số phần
## Phần 1 (~75s) — Điểm cắt: <mô tả>
[HOOK] ... [KỂ] ... [CẮT] ...
## Phần 2 ...
## Ghi chú kiểm duyệt
```

---

## PHẦN 8. GIAI ĐOẠN THỬ NGHIỆM: 5 VIDEO MẪU, GIỌNG MẪU, TÊN KÊNH, LOGO

### 8.1. Chủ đề mẫu: "Dấu hiệu bạn đang bị ghét ngầm nơi công sở"
Dùng `bien-kich` + `kiem-duyet` viết kịch bản đủ (4–6 phút, 3–5 phần), **gửi đại ca duyệt**. Sau khi duyệt, lấy **Phần 1** làm video mẫu; cả 5 phong cách dùng chung giọng đọc và chung bảng phân cảnh lõi.

Gợi ý (được thay đổi): hook "Có những người không bao giờ cãi nhau với bạn, nhưng lại ghét bạn theo cách bạn không nhận ra." Chuyện: mình tưởng quan hệ với chị đồng nghiệp rất ổn, cho tới khi phát hiện cả phòng có nhóm chat riêng không có mình. Dấu hiệu: chỉ nói chuyện công việc; khen trước mặt nhưng "quên" nhắc tên bạn trước sếp; trả lời tin nhắn chậm bất thường riêng với bạn; người và chân quay đi, cười không tới mắt; thông tin luôn tới tay bạn sau cùng; đùa "nói đùa thôi mà" nhưng có gai. Phần chuyên gia: đừng kết luận từ một dấu hiệu; cách kiểm tra nhẹ nhàng; cách xử lý. Điểm cắt phần 1: ngay trước dấu hiệu "đáng sợ nhất".

### 8.2. Năm phong cách hình ảnh (dựng bằng code)
Mỗi phong cách có `config/phong-cach/<ten>.md` và bộ template trong `render/templates/<ten>/`, đăng ký vào `docs/template-catalog.md`:
1. **bang-trang** – vẽ tay trên bảng trắng: nét bút vẽ dần (SVG stroke-dashoffset theo t), người que có biểu cảm, chữ Patrick Hand, một màu nhấn đỏ. SFX: bút, lật giấy.
2. **hoat-hinh-phang** – nhân vật dẫn chuyện cố định bằng SVG nhiều bộ phận (chớp mắt, miệng, tay), bối cảnh văn phòng phẳng, pastel. SFX: pop, whoosh.
3. **truyen-tranh** – khung tranh xuất hiện lần lượt, viền đen dày, halftone, bong bóng thoại vài chữ, camera trượt giữa các khung. SFX: lật trang, "bụp".
4. **tin-nhan** – màn hình chat giả lập chung chung (không dùng logo/nhận diện Zalo, Messenger), bong bóng hiện dần, "đang nhập…", so sánh nhắn "sai"/"đúng", xen cảnh nhân vật phản ứng. SFX: gõ phím, ting.
5. **tranh-tinh-zoom** – tranh silhouette tông điện ảnh bằng SVG, zoom chậm + parallax nhiều lớp, hạt bụi, vignette. SFX: riser, whoosh trầm.

Mỗi phong cách cần tối thiểu các template: `mo-dau`, `nhan-vat-noi`, `liet-ke-dau-hieu`, `so-sanh-dung-sai`, `tinh-huong`, `cau-chot`, `phan-tiep`, `thumbnail`.

### 8.3. Tên kênh và logo (ĐÃ CHỐT)
- **Tên kênh: Tâm Cơ.** Câu giới thiệu (bio): "Hiểu chiêu để không trúng chiêu."
- **Logo:** quân mã cờ vua màu đỏ `#E63946` trên nền đen `#141414`. Màu phụ: xám ấm `#F3EFEF`, trắng.
- File (đại ca đặt vào `assets/logo/`): `tam-co-anh-dai-dien.png` (1024×1024, ảnh đại diện), `tam-co-anh-dai-dien.svg`, `tam-co-bieu-tuong.svg` / `.png` (biểu tượng nền trong, dùng cho logo góc video).
- Ghi vào `config/kenh.toml`: ten = "Tâm Cơ", bio, màu, đường dẫn logo. Mọi phong cách hình ảnh dùng bảng màu này làm gốc; đỏ chỉ dùng làm điểm nhấn.

### 8.4. Trang duyệt thử nghiệm
Trong Phòng điều hành có tab "Thử nghiệm": phát 5 video mẫu cạnh nhau, nghe giọng mẫu, nút chọn. Lựa chọn ghi vào `config/kenh.toml`. **Dừng chờ đại ca chọn** rồi mới sản xuất hàng loạt.

---

## PHẦN 9. AGENT `phan-tich`: ĐÁNH GIÁ VIDEO SAU 24 GIỜ (giai đoạn 2)

**Cách đại ca gửi:** sau 24 giờ, chụp màn hình trang thống kê từng video trên từng nền tảng, thả vào `phan-tich/inbox/<slug>/` với tên `<nen-tang>-phan<n>-<so>.png` (ví dụ `tiktok-phan1-1.png`, `ytb-phan2-1.png`). Có thể kéo thả ngay trên Phòng điều hành (Phần 10). Rồi gõ lệnh **"phân tích <slug>"** (hoặc "phân tích hết").

`.claude/agents/phan-tich.md`:
```markdown
---
name: phan-tich
description: Đọc ảnh chụp số liệu 24h, trích số, so với trung bình kênh, chẩn đoán và rút bài học.
model: opus
effort: high
maxTurns: 10
omitClaudeMd: true
tools: Read, Write, Edit, Bash
---
1. Thu nhỏ ảnh trước khi đọc: `sips -Z 1200 <file>`. Đọc từng ảnh một lần.
2. Trích số vào phan-tich/so-lieu.csv (một dòng/video/nền tảng): ngay_dang, slug, phan, nen_tang, phong_cach, luot_xem, thoi_gian_xem_tb, ti_le_xem_het, giu_chan_3s (nếu có), thich, binh_luan, chia_se, luu, theo_doi_moi. Ô nào ảnh không có thì để trống, không đoán.
3. So với trung vị 20 video gần nhất cùng nền tảng (tính bằng script Python, không tính nhẩm).
4. Chẩn đoán theo luật:
   - Lượt xem thấp + giữ chân 3s thấp → hook yếu.
   - Xem hết thấp ở phần giữa → nhịp chậm, cảnh tĩnh quá lâu.
   - Lượt xem phần 2 / phần 1 dưới 15% → điểm cắt chưa đủ tò mò hoặc khó tìm phần tiếp.
   - Lưu/chia sẻ cao → nội dung hữu ích, nên làm thêm chủ đề cùng nhóm.
   - Bình luận nhiều → đọc nội dung bình luận nếu ảnh có, tìm ý tưởng chủ đề mới.
5. Ghi phan-tich/bao-cao/<slug>.md: bảng số, 3 điểm tốt, 3 điểm cần sửa, 3 hành động cụ thể cho tuần sau.
6. Cập nhật config/bai-hoc.md: tối đa 40 dòng, gộp/xóa bài học cũ trùng lặp, mỗi dòng 1 bài học có bằng chứng (ví dụ "Hook bằng câu hỏi trực diện giữ chân 3s cao hơn hook kể chuyện: 4/5 video").
7. Báo cáo cho Anh Hải tối đa 5 câu: kết quả chính + 3 hành động.
```
Sau khi phân tích xong, chuyển ảnh sang `phan-tich/da-xu-ly/` để không đọc lại.

Cuối tháng: lệnh **"tổng kết tháng"** → báo cáo phong cách nào, nhóm chủ đề nào, độ dài nào, giờ đăng nào hiệu quả nhất (tính từ `so-lieu.csv` bằng script, AI chỉ viết nhận xét).

---

## PHẦN 10. PHÒNG ĐIỀU HÀNH: GIAO DIỆN XEM AGENT LÀM VIỆC

### 10.1. Tham khảo từ GitHub
Đọc README (không cần cài) để học cách làm, rồi **tự dựng bản gọn** phù hợp máy:
- `https://github.com/disler/claude-code-hooks-multi-agent-observability`: dùng hook của Claude Code gửi sự kiện về server, hiện bảng điều khiển thời gian thực. Bản gốc cần Bun và có tùy chọn dùng API key ngoài, nên không cài nguyên.
- `https://github.com/simple10/agents-observe` (MIT): hook ghi sự kiện, server SQLite, dashboard React.

Lý do tự dựng: không cần Docker/Bun, chạy nhẹ trên máy 2017, gắn được với `blm`, bản tin agent và nút duyệt. Nếu đại ca muốn dùng nguyên bản thì hỏi trước khi cài.

### 10.2. Thiết kế
- `dieu-hanh/server.mjs`: Node thuần (chỉ dùng module có sẵn: http, fs), cổng `localhost:4747`, đọc `logs/su-kien.jsonl`, các `ban-tin.jsonl`, `trang-thai.json`, đẩy cập nhật bằng Server-Sent Events. Không cơ sở dữ liệu.
- `.claude/hooks/ghi-su-kien.sh`: gắn vào `SubagentStart`, `SubagentStop`, `PreToolUse`, `PostToolUse`, `Stop`, `Notification` trong `.claude/settings.json`. Chỉ append một dòng JSON gọn (giờ, agent, model, effort, sự kiện, tên tool, 80 ký tự đầu của mô tả) vào `logs/su-kien.jsonl`. **Không in gì ra stdout**, chạy dưới 50 ms.
- Với tool gọi/nhắn agent (`Agent`, `Task`, `SendMessage` khi trưởng nhóm phản hồi tiếp cho agent đã chạy): hook PreToolUse ghi **nguyên văn** tin của trưởng nhóm, hook PostToolUse ghi **nguyên văn** tin báo cáo của agent con, kèm tên người gửi/nhận theo bảng tên ở Phần 3.1b, vào `ban-tin.jsonl` của chủ đề đang làm (slug đọc từ `logs/dang-lam.txt`). `blm` cũng ghi tin "Máy dựng" vào đây.
- **Hook chặn vòng lặp** `.claude/hooks/chan-vong-lap.sh` (PreToolUse, matcher các tool gọi/nhắn agent):
  - Nếu tin của trưởng nhóm dưới 60 ký tự và chỉ gồm chào/cảm ơn/tạm biệt/ok/đã nhận (so bằng regex tiếng Việt và tiếng Anh) → chặn (exit code 2), stderr: "Tin không có nội dung công việc, không gửi."
  - Đếm số lượt theo cặp (slug, agent) trong `logs/dem-luot.json`; lượt thứ 4 → chặn, stderr: "Đã 3 lượt với <tên> cho việc này. Anh tự quyết hoặc ghi vào danh sách hỏi đại ca." Bộ đếm reset khi việc đó được đánh dấu xong.
  - Khi không chặn: không in gì, chạy dưới 50 ms.
- Thẻ agent hiển thị **model + effort** đang chạy; nếu thấy model `fable` thì thẻ đổi viền đỏ, kèm chữ "đang trừ usage credits".
- `dieu-hanh/index.html` (một file, không framework), giao diện tiếng Việt, gồm các tab:
  1. **Văn phòng:** mỗi agent là một thẻ có avatar riêng (SVG đơn giản), trạng thái (rảnh / đang làm / chờ duyệt / lỗi), việc đang làm, model, thời gian chạy. Thẻ đang làm có hiệu ứng nhấp nháy nhẹ.
  2. **Bản tin:** khung chat giống nhóm chat công ty: avatar + tên (Anh Hải, Tuấn, Chị Mai…), giờ gửi, tin nguyên văn. Lọc theo chủ đề. Chỉ để xem; đại ca nhắn thì nhắn trong Claude Code cho Anh Hải.
  3. **Dây chuyền:** bảng 7 chủ đề × các bước (chủ đề, kịch bản, duyệt, phân cảnh, giọng, hình, ghép, duyệt nháp, đóng gói, đã đăng, đã phân tích), ô màu theo trạng thái.
  4. **Duyệt:** đọc kịch bản ngay trên trang, xem bản nháp video, nút **Duyệt** / **Yêu cầu sửa** kèm ô ghi chú; bấm nút ghi file `du-an/<slug>/duyet.json`. Trưởng nhóm đọc file này khi đại ca gõ "làm tiếp".
  5. **Đăng bài:** mỗi phần một thẻ có video, thumbnail, nút sao chép tiêu đề/mô tả/hashtag từng nền tảng, nút "Đã đăng" (ghi giờ đăng để nhắc chụp số liệu sau 24h).
  6. **Phân tích:** kéo thả ảnh chụp vào đúng `phan-tich/inbox/<slug>/`, xem báo cáo, biểu đồ đơn giản từ `so-lieu.csv`, danh sách "đến hạn chụp số liệu".
  7. **Token:** token theo ngày/tuần từ `ccusage --json --offline` (server gọi tối đa 1 lần/10 phút), token theo từng agent ước tính từ sự kiện.
  8. **Thử nghiệm:** như Phần 8.4.
- Lệnh mở: `blm dieuhanh` (chạy server nền và mở trình duyệt). Chỉ nghe trên localhost.

### 10.3. Văn phòng 3D (giai đoạn 2)
- Đã có bản mẫu `van-phong-3d.html` (CSS 3D thuần, không thư viện, nhẹ cho máy 2017): 7 nhân viên ngồi bàn/đi ra góc nghỉ/vắng mặt theo trạng thái Đang làm, Online, Offline, Chờ duyệt, Lỗi; bong bóng lời nói, thư bay giữa các bàn khi nhắn tin, tủ máy chủ "Máy dựng" nhấp nháy khi render, danh sách nhân viên và bản tin bên cạnh.
- Đặt file vào `dieu-hanh/` làm tab "Văn phòng 3D". Mở file trực tiếp thì chạy demo; mở qua `http://localhost:4747/van-phong-3d.html` thì trang gọi `GET /api/trang-thai` và nghe `SSE /api/stream`. Giao thức sự kiện ghi ở đầu file; server chỉ cần chuyển các dòng từ `logs/su-kien.jsonl` và `ban-tin.jsonl` sang đúng định dạng đó.

---

## PHẦN 11. LỆNH ĐẠI CA DÙNG HẰNG NGÀY

| Đại ca gõ | Hệ thống làm |
|---|---|
| `lên tuần` | len-chu-de → bien-kich ×7 → kiem-duyet ×7 → báo "mời đại ca duyệt trên Phòng điều hành" |
| `làm tiếp` | đọc các `duyet.json`: kịch bản đã duyệt → dao-dien → xếp hàng đợi render đêm; kịch bản bị yêu cầu sửa → bien-kich sửa theo ghi chú |
| `sản xuất ngay <slug>` | chạy `blm sanxuat` ngay, không chờ đêm |
| `đóng gói` | các bản nháp đã duyệt → dong-goi → 06_xuat-ban |
| `sửa cảnh <slug> <id> <yêu cầu>` | sửa JSON cảnh đó, render lại đúng cảnh đó, ghép lại |
| `phân tích <slug>` / `phân tích hết` | agent phan-tich |
| `tổng kết tháng` | báo cáo tháng |
| `token tuần này` | đọc logs/token-tuan.csv, trả 3 dòng |
| `viết lại bằng fable <slug>` | **hỏi xác nhận trước** (trừ usage credits), rồi gọi bien-kich với model fable, effort medium, viết lại đúng 1 kịch bản |
| `nghĩ kỹ <việc>` | chạy việc đó với effort xhigh (chỉ khi đại ca yêu cầu) |

---

## PHẦN 12. CHECKLIST NGHIỆM THU

- [ ] ffmpeg, node, uv, Playwright/Chrome chạy được; ghi phiên bản vào `docs/ghi-chu-cai-dat.md`
- [ ] Giọng VieNeu-TTS (hoặc KorvaTTS) đọc ra WAV rõ, đủ dấu; đã đo tốc độ
- [ ] Thư viện SFX có `NGUON.md`
- [ ] `blm` chạy đủ các lệnh, mỗi lệnh in tối đa 3 dòng khi thành công
- [ ] 5 agent của giai đoạn 1 có `model: opus`, `effort`, `maxTurns`, `omitClaudeMd` đúng bảng Phần 3.1; không agent nào mặc định dùng fable; `CLAUDE.md` dưới 120 dòng
- [ ] Agent con không nhắn trực tiếp cho nhau; tin nhắn tự nhiên, không có tin chào/cảm ơn/tạm biệt; hook chặn vòng lặp đã thử (gửi "ok cảm ơn" bị chặn, lượt thứ 4 bị chặn)
- [ ] Video thành phẩm có logo góc trên bên trái, không bị giao diện app che
- [ ] Hook ghi sự kiện, không in ra stdout; Phòng điều hành mở được ở `localhost:4747`, có 3 tab Văn phòng, Bản tin, Thử nghiệm (5 tab còn lại: giai đoạn 2)
- [ ] Kịch bản "Dấu hiệu bị ghét ngầm" đã gửi duyệt; 5 video mẫu, giọng mẫu nằm trong tab Thử nghiệm; logo Tâm Cơ có ở góc mọi video
- [ ] Đại ca đã chọn phong cách, giọng (tên kênh đã chốt: Tâm Cơ) → `config/kenh.toml`
- [ ] Chạy trọn chủ đề mẫu tới `06_xuat-ban/` (video từng phần, thumbnail, tiêu đề, mô tả, hashtag)
- [ ] Ghi lại số token của lần chạy trọn đầu tiên làm mốc so sánh

## PHẦN 13. THỨ TỰ LÀM CHO CLAUDE CODE

### GIAI ĐOẠN 1 (LÀM NGAY): chạy được và ra sản phẩm mẫu
1. Phần 2: cài công cụ nền.
2. Phần 4.1: giọng đọc. Tạo giọng mẫu xong thì báo đại ca nghe, **trong lúc chờ vẫn làm tiếp các bước sau** (dùng tạm giọng mẫu đầu tiên).
3. Phần 4.2: thư viện SFX.
4. Phần 5: tạo thư mục; Phần 7: `CLAUDE.md`.
5. Phần 6: tạo 5 agent `len-chu-de`, `bien-kich`, `kiem-duyet`, `dao-dien`, `dong-goi` (chưa cần `phan-tich`).
6. Phần 4.3–4.4: template, `quay.mjs`, `blm` với các lệnh `giong`, `dung`, `tron`, `ghep`, `kiemtra`, `thumbnail`, `sanxuat`.
7. Phần 10 bản rút gọn: server + hook ghi sự kiện + hook chặn vòng lặp + 3 tab **Văn phòng, Bản tin, Thử nghiệm**.
8. Phần 8: kịch bản mẫu "Dấu hiệu bị ghét ngầm" → **dừng cho đại ca duyệt** → 5 video mẫu Phần 1 theo 5 phong cách (logo đã chốt: Tâm Cơ) → tab Thử nghiệm → **dừng cho đại ca chọn**.
9. Chạy trọn chủ đề mẫu đủ các phần với phong cách đã chọn, qua `dong-goi`, ra `06_xuat-ban/` (video, thumbnail, tiêu đề, mô tả, hashtag). Ghi số token của lần chạy này làm mốc.

**Xong giai đoạn 1 khi:** đại ca có trong tay một chủ đề hoàn chỉnh, đăng được ngay.

### GIAI ĐOẠN 2 (LÀM SAU, khi đại ca bảo)
- Lịch sản xuất hằng tuần, lệnh "lên tuần" cho 7 chủ đề, duyệt theo lô thứ Hai.
- `blm hangdoi` + `launchd` chạy qua đêm (hỏi trước khi bật).
- Agent `phan-tich` (Phần 9) và các tab Dây chuyền, Duyệt, Đăng bài, Phân tích, Token.
- `blm don`, tổng kết tháng.

Gặp lỗi không tự xử lý được sau 2 lần thử: dừng, mô tả lỗi ngắn gọn và hỏi đại ca.
