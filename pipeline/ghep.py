"""Ghép video: nối cảnh (-c copy) → trộn giọng + SFX → loudnorm 2 lượt → chèn logo góc → mp4 đăng được.

Dùng: python pipeline/ghep.py <ten>   (đọc ra/<ten>/quay.json, ghi ra/<ten>/video.mp4)
"""
import json, subprocess, sys, pathlib, re
import numpy as np, soundfile as sf

GOC = pathlib.Path(__file__).resolve().parent.parent
SR = 48000


def chay(*a, **k):
    return subprocess.run(list(a), check=True, capture_output=True, text=True, **k)


def db(x):
    return 20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-9)


def tron_am(q, ra_wav):
    tong = q["tong_khung"] / 30
    n = int(round(tong * SR))
    giong = np.zeros(n); hieu_ung = np.zeros(n)
    for c in q["ds"]:
        x, sr = sf.read(str(GOC / "giong" / f"{c['id']}.wav"))
        assert sr == SR
        i0 = int(round(c["bat_dau"] * SR))
        giong[i0:i0 + len(x)] += x[: max(0, n - i0)]
    muc_giong = db(giong[np.abs(giong) > 0.01])
    for e in q["sfx"]:
        x, _ = sf.read(str(GOC / "assets" / "sfx" / f"{e['ten']}.wav"))
        hoat = x[np.abs(x) > 0.02]
        g = 10 ** ((muc_giong - 12 - db(hoat)) / 20) if len(hoat) else 0.2
        i0 = int(round(e["t"] * SR))
        seg = x[: max(0, n - i0)] * g
        hieu_ung[i0:i0 + len(seg)] += seg
    tron = giong + hieu_ung
    sf.write(str(ra_wav), tron, SR, subtype="PCM_24")


def loudnorm(vao, ra):
    # giới hạn đỉnh trước để loudnorm tuyến tính đủ chỗ tăng âm lượng
    truoc = pathlib.Path(str(vao).replace(".wav", "-gh.wav"))
    chay("ffmpeg", "-y", "-loglevel", "error", "-i", str(vao), "-af", "alimiter=limit=0.5:attack=3:release=60:level=false",
         "-c:a", "pcm_s24le", str(truoc))
    vao = truoc
    # lượt 1: đo
    r = subprocess.run(["ffmpeg", "-hide_banner", "-i", str(vao), "-af", "loudnorm=I=-13.5:TP=-2.5:LRA=11:print_format=json", "-f", "null", "-"],
                       capture_output=True, text=True)
    m = json.loads(re.findall(r"\{[^{}]*\}", r.stderr)[-1])
    f = (f"loudnorm=I=-13.5:TP=-2.5:LRA=11:measured_I={m['input_i']}:measured_TP={m['input_tp']}:"
         f"measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true,aresample={SR},"
         # chặn đỉnh lần cuối ở -2,5 dB: bản dài loudnorm có thể vượt TP, AAC còn đội thêm ~1 dB
         "alimiter=limit=0.75:attack=1:release=50:level=false")
    chay("ffmpeg", "-y", "-loglevel", "error", "-i", str(vao), "-af", f, "-ar", str(SR), "-c:a", "pcm_s24le", str(ra))


def main(ten):
    D = GOC / "ra" / ten
    q = json.loads((D / "quay.json").read_text())
    ds = D / "ds.txt"
    ds.write_text("".join(f"file 'canh/{c['id']}.mp4'\n" for c in q["ds"]))
    chay("ffmpeg", "-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", str(ds), "-c", "copy", str(D / "hinh.mp4"))
    tron_am(q, D / "tron.wav")
    loudnorm(D / "tron.wav", D / "am.wav")
    logo = GOC / "assets" / "logo" / "logo-goc.png"
    chay("ffmpeg", "-y", "-loglevel", "error", "-i", str(D / "hinh.mp4"), "-i", str(logo), "-i", str(D / "am.wav"),
         "-filter_complex", "[1]format=rgba,colorchannelmixer=aa=0.55[lg];[0][lg]overlay=48:180:format=auto,scale=in_range=auto:out_range=tv,format=yuv420p[v]",
         "-map", "[v]", "-map", "2:a", "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-profile:v", "high", "-pix_fmt", "yuv420p", "-color_range", "tv",
         "-r", "30", "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-movflags", "+faststart", "-shortest", str(D / "video.mp4"))
    for f in ("hinh.mp4", "tron.wav", "tron-gh.wav", "ds.txt"):
        (D / f).unlink(missing_ok=True)
    print("video →", (D / "video.mp4").relative_to(GOC))


if __name__ == "__main__":
    main(sys.argv[1])
