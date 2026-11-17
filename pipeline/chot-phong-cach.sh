#!/bin/bash
# Sau khi đại ca chọn phong cách: xoá mẫu của các phong cách không được chọn, quay video đầy đủ,
# kiểm tra chất lượng, xuất ảnh bìa và chép vào xuat-ban/<chu-de>/.
# Chuỗi (video.json "dinh_dang": "chuoi"): quay toàn bộ một lần → ban-goc.mp4 + ghép từng phần (pipeline/ghep-chuoi.py)
#   → xuat-ban/<chu-de>/phan-<n>/{video.mp4, anh-bia.png} + xuat-ban/<chu-de>/ban-goc.mp4
# Dùng: pipeline/chot-phong-cach.sh <chu-de> <bang-trang|truyen-tranh|tranh-tinh-zoom>
set -e
cd "$(dirname "$0")/.."
CD="$1"; PC="$2"
case "$PC" in bang-trang|truyen-tranh|tranh-tinh-zoom) ;; *) echo "Phong cách không hợp lệ: $PC"; exit 1;; esac

for khac in bang-trang truyen-tranh tranh-tinh-zoom; do
  [ "$khac" != "$PC" ] && [ -d "ra/$CD/mau-$khac" ] && rm -rf "ra/$CD/mau-$khac" && echo "Đã xoá mẫu $khac"
done
.venv/bin/python pipeline/so-sanh.py "$CD" >/dev/null

OUT=ra/$CD/video-day-du
python3 dieu-hanh/su_kien.py giai-doan day-du
# kiểm bố cục đúng phong cách đã chọn; có lỗi vẫn quay nhưng báo anh Hải
BC=$(node render/kiem-bo-cuc.mjs $PC --ra $CD) && BCQ=0 || BCQ=1
echo "$BC" | tail -12
[ $BCQ = 0 ] || python3 dieu-hanh/su_kien.py tin may-dung truong-nhom "Bố cục $CD ($PC) còn lỗi: $(echo "$BC" | tail -1). Xem ra/$CD/bo-cuc/"
t0=$(date +%s)
TC_NHAN="Quay bản đầy đủ ($PC)" node render/quay.mjs $PC --ra $CD/video-day-du | tail -1
t1=$(date +%s)
.venv/bin/python pipeline/ghep.py $CD/video-day-du
python3 dieu-hanh/su_kien.py tien-do 100 "Ghép xong"
t2=$(date +%s)
node render/quay.mjs $PC --ra $CD/video-day-du --ds c01 --bia | tail -1
echo "Quay $((t1-t0))s + ghép $((t2-t1))s" | tee $OUT/thoi-gian.txt
ffmpeg -y -loglevel error -i $OUT/video.mp4 -vf "fps=12/$(ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 $OUT/video.mp4),scale=300:-1,tile=6x2:padding=6:color=white" -frames:v 1 -q:v 4 $OUT/contact-12.jpg
CHUOI=$(python3 -c "import json;v=json.load(open('video.json'));print(v['chuoi']['so_phan'] if v.get('dinh_dang')=='chuoi' else 0)")
if [ "$CHUOI" != 0 ]; then
  python3 dieu-hanh/su_kien.py trang-thai may-dung lam "Ghép $CHUOI phần"
  .venv/bin/python pipeline/ghep-chuoi.py $CD/video-day-du
  KQ=0; TOM=""
  for n in $(seq 1 $CHUOI); do
    node render/quay.mjs $PC --ra $CD/video-day-du --ds c01 --bia --phan $n | tail -1
    .venv/bin/python pipeline/ghep-chuoi.py --bia $OUT/phan-$n/anh-bia.png $n $CHUOI
    KT=$(pipeline/kiem-tra.sh $OUT/phan-$n/video.mp4 60 90) || KQ=1
    echo "— phần $n/$CHUOI"; echo "$KT"
    TOM="$TOM phần $n: $(ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 $OUT/phan-$n/video.mp4 | cut -d. -f1)s $(echo "$KT" | grep -c "✓")/9$(echo "$KT" | grep "✗" | head -1);"
  done
  KT=$(pipeline/kiem-tra.sh $OUT/video.mp4 200 420) || KQ=1; echo "— bản gốc"; echo "$KT"
  python3 dieu-hanh/su_kien.py tin may-dung truong-nhom "Xong chuỗi $CD ($PC, $CHUOI phần), quay $((t1-t0)) giây máy.$TOM bản gốc $(echo "$KT" | grep -c "✓")/9"
  [ $KQ = 0 ] || { python3 dieu-hanh/su_kien.py trang-thai may-dung loi "Kiểm tra chuỗi chưa đạt"; exit 1; }
  mkdir -p xuat-ban/$CD && cp $OUT/video.mp4 xuat-ban/$CD/ban-goc.mp4 && cp $OUT/anh-bia.png xuat-ban/$CD/anh-bia-goc.png
  for n in $(seq 1 $CHUOI); do mkdir -p xuat-ban/$CD/phan-$n && cp $OUT/phan-$n/video.mp4 $OUT/phan-$n/anh-bia.png xuat-ban/$CD/phan-$n/; done
  python3 pipeline/kiem-lap.py --ghi $PC
  mkdir -p ra/$CD/du-lieu && cp canh.json video.json kich-ban.md thoi-luong.json bien-do.json ra/$CD/du-lieu/ && cp -r giong ra/$CD/du-lieu/
  python3 dieu-hanh/su_kien.py trang-thai may-dung onl ""
  echo "→ xuat-ban/$CD/ (ban-goc.mp4 + phan-1..$CHUOI)"; exit 0
fi
KT=$(pipeline/kiem-tra.sh $OUT/video.mp4) && KQ=0 || KQ=1; echo "$KT"
python3 dieu-hanh/su_kien.py tin may-dung truong-nhom "Xong bản đầy đủ $CD ($PC): $(ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 $OUT/video.mp4 | cut -d. -f1) giây, quay $((t1-t0)) giây máy. Kiểm tra: $(echo "$KT" | grep -c "✓")/10 đạt$(echo "$KT" | grep "✗" | head -2 | tr "\n" " ")"
[ $KQ = 0 ] || { python3 dieu-hanh/su_kien.py trang-thai may-dung loi "Kiểm tra chưa đạt"; exit 1; }
mkdir -p xuat-ban/$CD && cp $OUT/video.mp4 $OUT/anh-bia.png xuat-ban/$CD/
python3 pipeline/kiem-lap.py --ghi $PC
mkdir -p ra/$CD/du-lieu && cp canh.json video.json kich-ban.md thoi-luong.json bien-do.json ra/$CD/du-lieu/ && cp -r giong ra/$CD/du-lieu/
echo "→ xuat-ban/$CD/"
