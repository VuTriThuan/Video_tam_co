# BẮT ĐẦU: KÊNH TÂM CƠ

## Trong thư mục này có gì
- `BAN_TOI_GIAN_THU_KHA_THI.md`: **file đưa cho Claude Code chạy trước.** Ra 5 video mẫu 30 giây, rồi 1 video hoàn chỉnh đăng được, kèm báo cáo khả thi.
- `HUONG_DAN_CAI_DAT_BAN_LINH_MEM.md`: bản hệ thống đầy đủ (đội agent, Phòng điều hành, 7 chủ đề/tuần). **Chưa dùng**, đợi bản thử xong.
- `assets/logo/`: logo kênh Tâm Cơ (ảnh đại diện 1024×1024 và biểu tượng nền trong cho logo góc video).
- `giai-doan-2/van-phong-3d.html`: văn phòng 3D xem các agent làm việc. Mở bằng trình duyệt để xem demo; nối vào hệ thống ở giai đoạn 2.

## Các bước bắt đầu

**1. Mở Terminal.** Bấm Cmd + Space, gõ `Terminal`, Enter.

**2. Cài Claude Code** (bỏ qua nếu gõ `claude --version` đã ra số phiên bản):
```bash
curl -fsSL https://claude.ai/install.sh | bash
```
Lệnh chạy không hiện tiến độ, cứ đợi đến khi báo cài xong. Sau đó **mở cửa sổ Terminal mới** và gõ `claude --version` để kiểm tra.
Nếu báo `command not found: claude`, chạy:
```bash
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zshrc && source ~/.zshrc
```
Nếu lệnh cài báo lỗi, thử cách khác: `brew install --cask claude-code`.

**3. Vào thư mục dự án và mở Claude Code:**
```bash
cd ~/Desktop/video_tam_co
claude
```
- Lần đầu: chọn đăng nhập bằng tài khoản Claude (gói Pro).
- macOS có thể hỏi cho Terminal quyền truy cập thư mục Desktop: bấm **Cho phép**.
- Claude Code hỏi có tin thư mục này không: chọn **Yes**.

**4. Chọn model:** gõ `/model`, chọn **Opus**, mức effort **Medium**. (Không chọn Fable: với gói Pro, Fable tính thêm tiền.)

**5. Dán câu lệnh này vào Claude Code rồi Enter:**
```
Đọc file BAN_TOI_GIAN_THU_KHA_THI.md và làm theo đúng thứ tự trong đó. Dừng ở các điểm kiểm tra để hỏi anh. Gọi anh là đại ca.
```

**6. Trong lúc chạy:**
- Claude Code sẽ hỏi quyền trước khi chạy lệnh cài đặt. Đọc lướt rồi chọn **Yes** (hoặc "Yes, and don't ask again" cho các lệnh như `brew`, `npm`, `ffmpeg`, `uv`).
- Có 3 lần dừng chờ đại ca: **chọn giọng đọc**, **duyệt kịch bản**, **chọn 1 trong 5 phong cách** (mở `review/so-sanh.html` để xem 5 video cạnh nhau). Cuối cùng là xem bản nháp video.
- Cắm sạc máy. Đọc giọng và dựng video trên máy 2017 có thể mất vài chục phút đến vài giờ.
- Nếu Claude Code báo hết lượt dùng của gói Pro: đợi hạn mức reset (theo khung 5 giờ) rồi gõ `claude --continue` trong thư mục này để làm tiếp.

**7. Kết quả** nằm trong thư mục `xuat-ban/`: `video.mp4`, `anh-bia.png`, `dang-bai.md` (tiêu đề, mô tả, hashtag). Kèm `bao-cao.md` đánh giá khả thi.
