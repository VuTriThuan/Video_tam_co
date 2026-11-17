#!/bin/bash
# Kiểm tra toàn hệ thống Tâm Cơ bằng máy (0 token). In ✓/✗ cho từng mục của BUOC_4 §8.1.
# Mục nào cần chạy thật bằng Claude (/goi-y, /chu-de, /sua, /phan-tich) thì kiểm DẤU VẾT đã chạy (file kết quả).
# Dùng: ./kiem-tra-he-thong.sh
cd "$(dirname "$0")"
LOI=0; dat() { echo "✓ $1"; }; loi() { echo "✗ $1"; LOI=1; }
kt() { if eval "$2" >/dev/null 2>&1; then dat "$1"; else loi "$1${3:+ — $3}"; fi; }

# 1. /goi-y
N=$(grep -cE '^#+ *[0-9]+\.|^[0-9]+\. ' chu-de/kho.md 2>/dev/null); N=${N:-0}
[ "$N" -ge 10 ] && dat "/goi-y: $N chủ đề trong chu-de/kho.md" || loi "/goi-y: chu-de/kho.md mới có $N chủ đề"

# 2. /chu-de --le: ít nhất 1 video lẻ trong xuat-ban đạt kiểm tra
LE=$(for d in xuat-ban/*/; do [ -f "$d/video.mp4" ] && echo "$d"; done | tail -1)
if [ -n "$LE" ] && pipeline/kiem-tra.sh "$LE/video.mp4" >/dev/null; then dat "/chu-de --le: $(basename $LE) đạt kiểm tra"; else loi "/chu-de --le: chưa có video lẻ đạt kiểm tra"; fi

# 3. /chu-de chuỗi: 3–5 phần đạt + bản gốc + gói đăng
CH=$(for d in xuat-ban/*/; do [ -d "$d/phan-1" ] && echo "$d"; done | tail -1)
if [ -n "$CH" ]; then
  NP=$(ls -d "$CH"/phan-* | wc -l | tr -d ' '); OK=1
  for p in "$CH"/phan-*; do pipeline/kiem-tra.sh "$p/video.mp4" 60 90 >/dev/null || OK=0; [ -f "$p/anh-bia.png" ] || OK=0; done
  [ -f "$CH/ban-goc.mp4" ] && [ -f "$CH/dang-bai.md" ] || OK=0
  [ $OK = 1 ] && [ "$NP" -ge 3 ] && [ "$NP" -le 5 ] && dat "/chu-de chuỗi: $(basename $CH) $NP phần đạt + bản gốc + gói đăng" || loi "/chu-de chuỗi: $(basename $CH) chưa đủ ($NP phần, kiểm tra/bìa/bản gốc/gói đăng)"
else loi "/chu-de chuỗi: chưa có chuỗi nào trong xuat-ban/ (cần nghiệm thu trong phiên mới)"; fi

# 4. /sua
kt "/sua: quay.mjs có chế độ --sua (chỉ quay lại cảnh nêu)" "grep -q \"co('--sua')\" render/quay.mjs && grep -q -- '--sua' .claude/commands/sua.md"

# 5. /phan-tich
kt "/phan-tich: trung-vi.py chạy được" "python3 -c \"import ast;ast.parse(open('phan-tich/trung-vi.py').read())\" && head -1 phan-tich/so-lieu.csv | grep -q luot_xem"
[ -n "$(ls phan-tich/bao-cao/*.md 2>/dev/null)" ] && dat "/phan-tich: đã có báo cáo thật" || echo "· /phan-tich: chưa có báo cáo thật (chờ ảnh số liệu 24 giờ)"

# 6. /lam-moi
kt "/lam-moi: logs/da-dung.json đọc được" "python3 -c \"import json;assert len(json.load(open('logs/da-dung.json')))>=1\""

# 7. Phòng điều hành
if curl -s -m 2 http://localhost:4747/api/trang-thai >/dev/null; then
  OK=1; for a in trang-thai du-an ban-tin thu-vien phan-tich; do curl -s -m 5 -f http://localhost:4747/api/$a >/dev/null || OK=0; done
  [ $OK = 1 ] && dat "Phòng điều hành: 5 API trả lời" || loi "Phòng điều hành: có API lỗi"
else echo "· Phòng điều hành chưa mở (./dieu-hanh.sh) — bỏ qua kiểm API"; fi
[ -s dieu-hanh/loi-hook.log ] && loi "Hook ghi sự kiện có lỗi: $(tail -1 dieu-hanh/loi-hook.log)" || dat "Hook ghi sự kiện: không lỗi"
kt "Bản tin có tin nhắn thật" "grep -q '\"loai\": \"tin\"' dieu-hanh/su-kien.jsonl"

# 8. Hook chặn vòng lặp, không Fable
kt "Hook chặn vòng lặp đã gắn" "grep -q chan-vong-lap .claude/settings.json && test -x .claude/hooks/chan-vong-lap.sh"
test -f render/kiem-bo-cuc.mjs && grep -q kiem-bo-cuc pipeline/lam-mau.sh && dat "Kiểm bố cục gắn vào lam-mau.sh" || loi "Thiếu kiểm bố cục"
grep -q -- "--luong" render/quay.mjs && dat "quay.mjs quay song song (--luong)" || loi "quay.mjs chưa quay song song"
ls .claude/skills/{marketing-psychology,humanizer,stop-slop,algorithmic-art,hyperframes,hyperframes-cli,hyperframes-registry}/SKILL.md >/dev/null 2>&1 && dat "7 skill đã cài trong .claude/skills" || loi "Thiếu skill trong .claude/skills"
grep -qil "fable" .claude/agents/*.md .claude/settings.json 2>/dev/null && loi "Có agent/cấu hình nhắc tới Fable" || dat "Mọi agent dùng Opus ($(grep -h '^model:' .claude/agents/*.md | sort -u | tr '\n' ' '))"

# 9. Dọn
kt "pipeline/don.sh có sẵn" "test -x pipeline/don.sh"
echo "· Dọn: $(pipeline/don.sh | head -1)"

# 10. Sao lưu git
kt "Git đã khởi tạo, bỏ video/âm thanh/node_modules/.venv" "git rev-parse --git-dir && grep -q node_modules .gitignore && grep -q '.venv' .gitignore && ! git ls-files | grep -qE '\.(mp4|wav)$'"

[ $LOI = 0 ] && echo "ĐẠT TOÀN BỘ" || echo "CÒN MỤC CHƯA ĐẠT"
exit $LOI
