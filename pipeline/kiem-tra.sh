#!/bin/bash
# Kiểm tra chất lượng video thành phẩm (mục 7). In tối đa 10 dòng.
# Dùng: pipeline/kiem-tra.sh <video.mp4> [min_s max_s]
f="$1"; MIN=${2:-75}; MAX=${3:-90}
ok=0; loi() { echo "✗ $1"; ok=1; }; dat() { echo "✓ $1"; }

pr() { ffprobe -v error -select_streams "$1" -show_entries "stream=$2" -of default=nw=1:nk=1 "$f"; }
CODEC=$(pr v:0 codec_name); PROF=$(pr v:0 profile); W=$(pr v:0 width); H=$(pr v:0 height); PIX=$(pr v:0 pix_fmt); FPS=$(pr v:0 r_frame_rate)
AC=$(pr a:0 codec_name); SR=$(pr a:0 sample_rate); BR=$(pr a:0 bit_rate)
DV=$(pr v:0 duration); DA=$(pr a:0 duration)
MB=$(echo "$(stat -f%z "$f") / 1000000" | bc -l)

awk -v d="$DV" -v a="$MIN" -v b="$MAX" 'BEGIN{exit !(d>=a && d<=b)}' && dat "Thời lượng $(printf %.1f $DV)s" || loi "Thời lượng $(printf %.1f $DV)s ngoài $MIN–$MAX"
[[ "$W" == 1080 && "$H" == 1920 && "$FPS" == 30/1 && "$CODEC" == h264 && "$PROF" == High && "$PIX" == yuv420p ]] && dat "Hình 1080x1920 30fps H.264 High yuv420p" || loi "Hình: $W x $H $FPS $CODEC $PROF $PIX"
[[ "$AC" == aac && "$SR" == 48000 ]] && dat "Âm AAC 48 kHz $((BR/1000)) kbps" || loi "Âm: $AC $SR $BR"

R=$(ffmpeg -hide_banner -nostats -i "$f" -af ebur128=peak=true -f null - 2>&1)
I=$(echo "$R" | grep -E '^\s+I:' | tail -1 | awk '{print $2}'); TP=$(echo "$R" | grep -E '^\s+Peak:' | tail -1 | awk '{print $2}')
awk -v i="$I" -v p="$TP" 'BEGIN{exit !(i>=-15 && i<=-13 && p<=-1.5)}' && dat "Độ to $I LUFS, true peak $TP dB" || loi "Độ to $I LUFS, true peak $TP dB"

R=$(ffmpeg -hide_banner -nostats -i "$f" -vf "blackdetect=d=0.1:pix_th=0.05,freezedetect=n=-60dB:d=2" -af "silencedetect=n=-45dB:d=1.2" -f null - 2>&1)
NB=$(echo "$R" | grep -c black_start); NF=$(echo "$R" | grep -c freeze_start); NS=$(echo "$R" | grep -c silence_start)
[[ $NB == 0 ]] && dat "Không khung đen" || loi "Khung đen: $NB đoạn $(echo "$R" | grep -o 'black_start:[0-9.]*' | head -3 | tr '\n' ' ')"
[[ $NF == 0 ]] && dat "Không đứng hình >2s" || loi "Đứng hình: $NF đoạn $(echo "$R" | grep -o 'freeze_start: [0-9.]*' | head -3 | tr '\n' ' ')"
[[ $NS == 0 ]] && dat "Không lặng >1,2s" || loi "Lặng >1,2s: $NS đoạn $(echo "$R" | grep -o 'silence_start: [0-9.]*' | head -3 | tr '\n' ' ')"
awk -v v="$DV" -v a="$DA" 'BEGIN{d=v-a; if(d<0)d=-d; exit !(d<1/30)}' && dat "Hình/tiếng lệch $(awk -v v=$DV -v a=$DA 'BEGIN{printf "%.3f", v-a}')s" || loi "Hình $DV s / tiếng $DA s lệch ≥1 khung"
awk -v m="$MB" 'BEGIN{exit !(m<100)}' && dat "Dung lượng $(printf %.1f $MB) MB" || loi "Dung lượng $(printf %.1f $MB) MB"
exit $ok
