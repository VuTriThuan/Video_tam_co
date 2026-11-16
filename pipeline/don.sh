#!/bin/bash
# Dọn file trung gian của các chủ đề cũ hơn N ngày (mặc định 14). KHÔNG đụng xuat-ban/ và ra/<slug>/du-lieu/.
# Mặc định chỉ LIỆT KÊ. Xoá thật phải thêm --xoa (anh Hải hỏi đại ca trước).
# Dùng: pipeline/don.sh [--ngay 14] [--xoa]
cd "$(dirname "$0")/.."
NGAY=14; XOA=0
while [ $# -gt 0 ]; do case "$1" in --ngay) NGAY="$2"; shift;; --xoa) XOA=1;; esac; shift; done
HT=$(python3 -c "import json;print(json.load(open('du-an/hien-tai.json')).get('slug',''))" 2>/dev/null)
DS=()
for d in ra/*/; do
  slug=$(basename "$d"); [ "$slug" = "$HT" ] && continue
  # chủ đề còn được sửa gần đây thì giữ
  [ -n "$(find "$d" -maxdepth 2 -newermt "-${NGAY} days" -print -quit 2>/dev/null)" ] && continue
  for x in "$d"video-day-du/canh "$d"video-day-du/am.wav "$d"video-day-du/phan-* "$d"mau-* "$d"xem; do
    [ -e "$x" ] && DS+=("$x")
  done
done
for x in scratch/*; do [ -e "$x" ] && [ -n "$(find "$x" -maxdepth 0 -mtime +$NGAY)" ] && DS+=("$x"); done
[ ${#DS[@]} = 0 ] && { echo "Không có gì cần dọn (cũ hơn $NGAY ngày)."; exit 0; }
echo "File trung gian cũ hơn $NGAY ngày ($(du -shc "${DS[@]}" | tail -1 | cut -f1)):"
for x in "${DS[@]}"; do echo "  $(du -sh "$x" | cut -f1)  $x"; done
if [ $XOA = 1 ]; then rm -rf "${DS[@]}"; echo "Đã xoá."; else echo "(Chưa xoá. Chạy lại với --xoa sau khi đại ca đồng ý.)"; fi
