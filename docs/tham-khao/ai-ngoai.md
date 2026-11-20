# AI ngoài (chỉ miễn phí) — `pipeline/goi-ai.py`

Một cổng duy nhất để đội gọi AI khác ngoài Claude. Chỉ dùng thư viện chuẩn Python, không cài thêm gì.

## Lệnh
```
python3 pipeline/goi-ai.py kiem                                   # nhà nào dùng được, đã gọi bao nhiêu hôm nay
python3 pipeline/goi-ai.py chu "câu hỏi" [--nha groq] [--he "dặn hệ thống"]
python3 pipeline/goi-ai.py chu "đọc số liệu trong ảnh" --anh anh.png   # tự chọn Gemini (đọc ảnh)
python3 pipeline/goi-ai.py anh "mô tả ảnh, no text" --ra du-an/<slug>/nen.png --rong 1080 --cao 1920 --seed 3
```
Không ghi `--nha` thì script tự thử theo thứ tự trong `pipeline/ai-ngoai.json`, nhà nào lỗi thì chuyển nhà kế.

## Luật miễn phí (cứng trong code)
- Chỉ gọi nhà và model có trong `pipeline/ai-ngoai.json`. OpenRouter chỉ nhận model đuôi `:free`.
- Không có đường gọi OpenAI hay Anthropic trả tiền. Model GPT miễn phí thì đi qua Pollinations (model `openai`).
- Mỗi nhà có `gioi_han_ngay` đặt thấp hơn hạn mức miễn phí của hãng; chạm trần là dừng.
- Mỗi lượt ghi vào `logs/ai-ngoai.jsonl` (`chi_phi: 0`).

## Nhà đang nối
| Nhà | Khóa | Dùng cho |
|---|---|---|
| Pollinations | không cần | chữ (GPT miễn phí), **vẽ ảnh** (flux). Ảnh có logo nhỏ ở góc dưới phải, cần cắt hoặc che khi dùng |
| Gemini | `GEMINI_API_KEY` | chữ + **đọc ảnh** (Đức đọc ảnh số liệu) |
| Groq | `GROQ_API_KEY` | chữ, rất nhanh |
| OpenRouter | `OPENROUTER_API_KEY` | chữ, model `:free` |
| Ollama | không cần, cài trên máy | chữ, chạy offline |

Khóa để trong `.env` (chép từ `.env.mau`). `.env` đã nằm trong `.gitignore`.

## Lưu ý để luôn 0 đồng
- Google: **không bật billing** cho project chứa khóa Gemini.
- OpenRouter: **không nạp tiền** vào tài khoản.
- Gói miễn phí có thể dùng dữ liệu gửi lên để huấn luyện: không gửi thông tin cá nhân.
- Chưa có nhạc nền miễn phí qua API ổn định; nhạc nền vẫn tự tạo như cũ.
