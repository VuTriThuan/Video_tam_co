"""Ghép các video quay màn hình thành một video demo 2560x1440, 30 khung/giây.

Chạy: python3 demo/ghep-demo.py <file-ra.mp4> <video1> <video2> ...
Mỗi video được thu vừa khung, độn viền màu nền, mờ vào/ra 0,25 giây ở chỗ nối.
"""
import subprocess, sys

W, H, FPS, MO, NEN = 2560, 1440, 30, 0.25, "0x111214"
ra, vao = sys.argv[1], sys.argv[2:]


def thoi_luong(f):
    return float(subprocess.check_output(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f]).decode())


loc, nhan = [], []
for i, f in enumerate(vao):
    d = thoi_luong(f)
    loc.append(
        f"[{i}:v]fps={FPS},scale={W}:{H}:force_original_aspect_ratio=decrease,"
        f"pad={W}:{H}:(ow-iw)/2:(oh-ih)/2:color={NEN},setsar=1,format=yuv420p,"
        f"fade=in:st=0:d={MO},fade=out:st={d - MO:.3f}:d={MO}[v{i}]")
    nhan.append(f"[v{i}]")
loc.append(f"{''.join(nhan)}concat=n={len(vao)}:v=1:a=0[v]")

lenh = ["ffmpeg", "-v", "error", "-stats", "-y"]
for f in vao:
    lenh += ["-i", f]
lenh += ["-filter_complex", ";".join(loc), "-map", "[v]",
         "-c:v", "h264_videotoolbox", "-b:v", "12M", "-maxrate", "18M", "-profile:v", "high",
         "-movflags", "+faststart", ra]
subprocess.run(lenh, check=True)
