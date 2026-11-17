#!/bin/bash
# Bước chọn phong cách của một chủ đề: quay 3 video mẫu 20–30 giây (bảng trắng, truyện tranh, tranh điện ảnh)
# từ các cảnh đầu của canh.json, kèm ảnh bìa, kiểm tra chất lượng, rồi mở trang so sánh.
# Cần có sẵn: canh.json, thoi-luong.json, giong/*.wav, bien-do.json (sau bước đọc giọng).
# Dùng: pipeline/lam-mau.sh <chu-de>
set -e
cd "$(dirname "$0")/.."
CD="$1"; [ -z "$CD" ] && { echo "Thiếu tên chủ đề"; exit 1; }

# chọn các cảnh đầu liên tiếp cho đủ 20–30 giây
DS=$(python3 - <<'EOF'
import json
tl = json.load(open("thoi-luong.json"))["canh"]
ds, tong = [], 0.0
for c in tl:
    if tong >= 20 and tong + c["thoi_luong"] > 30: break
    ds.append(c["id"]); tong += c["thoi_luong"]
    if tong >= 30: break
print(",".join(ds))
EOF
)
echo "Cảnh mẫu: $DS"
python3 dieu-hanh/su_kien.py giai-doan mau; python3 dieu-hanh/su_kien.py trang-thai may-dung lam "Làm 3 mẫu phong cách"

# kiểm bố cục toàn bộ cảnh ở cả 3 phong cách (chữ đè nhân vật, chữ đè chữ, chữ lấn vùng TikTok che)
BC=$(node render/kiem-bo-cuc.mjs tat-ca --ra $CD) && BCQ="đạt" || BCQ="có lỗi"
echo "$BC"
[ "$BCQ" = "đạt" ] || python3 dieu-hanh/su_kien.py tin may-dung truong-nhom "Kiểm bố cục $CD: $(echo "$BC" | tail -1). Chi tiết + ảnh: ra/$CD/bo-cuc/"

for pc in bang-trang truyen-tranh tranh-tinh-zoom; do
  OUT=ra/$CD/mau-$pc
  t0=$(date +%s)
  TC_NHAN="Mẫu $pc" node render/quay.mjs $pc --ra $CD/mau-$pc --ds $DS | tail -1
  t1=$(date +%s)
  .venv/bin/python pipeline/ghep.py $CD/mau-$pc
  t2=$(date +%s)
  node render/quay.mjs $pc --ra $CD/mau-$pc --ds $DS --bia | tail -1
  echo "Quay $((t1-t0))s + ghép $((t2-t1))s" > $OUT/thoi-gian.txt
  rm -rf $OUT/canh $OUT/am.wav
  pipeline/kiem-tra.sh $OUT/video.mp4 20 35 | grep "✗" && echo "  ↑ lỗi ở mẫu $pc" || echo "  $pc: kiểm tra đạt"
done
for pc in bang-trang truyen-tranh tranh-tinh-zoom; do python3 pipeline/kiem-lap.py --phong-cach $pc; done
.venv/bin/python pipeline/so-sanh.py "$CD"
python3 dieu-hanh/su_kien.py tin may-dung truong-nhom "Xong 3 mẫu phong cách cho $CD (cảnh $DS). Trang so sánh: review/$CD.html"
python3 dieu-hanh/su_kien.py trang-thai may-dung onl ""
open "review/$CD.html"
