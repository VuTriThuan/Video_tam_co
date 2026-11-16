"""Ghép từng phần của một chuỗi từ các cảnh đã quay (0 token).

Dùng: .venv/bin/python pipeline/ghep-chuoi.py <ten> [thu-muc-du-lieu]
  <ten>: thư mục ra/<ten>/ đã có canh/*.mp4 + quay.json (quay toàn bộ một lần, ví dụ darvo/video-day-du)
  thu-muc-du-lieu: nơi có canh.json + video.json (mặc định thư mục gốc)
Ra: ra/<ten>/phan-<n>/video.mp4 cho từng phần:
  - nối cảnh của phần (-c copy) + 1,5 giây màn kết ("Phần n+1 →" + câu gợi tò mò, hoặc logo + "Theo dõi Tâm Cơ" ở phần cuối)
  - nhãn "PHẦN n/N" góc trên phải 1,5 giây đầu, logo góc trái, một lần encode
  - âm thanh: giọng + SFX của phần + SFX màn kết, loudnorm -14 LUFS
"""
import json, subprocess, sys, pathlib, importlib.util
import numpy as np, soundfile as sf
from PIL import Image, ImageDraw, ImageFont

GOC = pathlib.Path(__file__).resolve().parent.parent
spec = importlib.util.spec_from_file_location("ghep", GOC / "pipeline" / "ghep.py")
ghep = importlib.util.module_from_spec(spec); spec.loader.exec_module(ghep)
SR, FPS, DUOI = ghep.SR, 30, 1.5          # màn kết 1,5 giây
W, H = 1080, 1920
F = lambda kieu, co: ImageFont.truetype(str(GOC / "fonts" / f"BeVietnamPro-{kieu}.ttf"), co)
DO, TOI = (232, 72, 59), (16, 14, 24)


def bao(pt, viec):
    subprocess.run([sys.executable, str(GOC / "dieu-hanh" / "su_kien.py"), "tien-do", str(int(pt)), viec])


def ngat(chu, font, rong, ve):
    dong, cur = [], ""
    for w in chu.split():
        thu = (cur + " " + w).strip()
        if ve.textlength(thu, font=font) <= rong: cur = thu
        else: dong.append(cur); cur = w
    return dong + [cur] if cur else dong


def anh_nhan(n, N, ra):
    font = F("ExtraBold", 46); chu = f"PHẦN {n}/{N}"
    ve0 = ImageDraw.Draw(Image.new("RGBA", (1, 1)))
    w = int(ve0.textlength(chu, font=font)) + 56
    im = Image.new("RGBA", (w, 84), (0, 0, 0, 0)); ve = ImageDraw.Draw(im)
    ve.rounded_rectangle((0, 0, w - 1, 83), 42, fill=(*DO, 240))
    ve.text((w / 2, 42), chu, font=font, fill="white", anchor="mm")
    im.save(ra); return w


def anh_ket(ra, n, N, teaser):
    im = Image.new("RGBA", (W, H), (*TOI, 228 if n < N else 250)); ve = ImageDraw.Draw(im)
    if n < N:
        # font không có ký tự mũi tên → tự vẽ tam giác sau chữ
        fo = F("ExtraBold", 150); chu = f"Phần {n + 1}"; w = ve.textlength(chu, font=fo); x0 = (W - w - 130) / 2
        ve.text((x0, 820), chu, font=fo, fill=DO, anchor="lm")
        ax = x0 + w + 40; ve.polygon([(ax, 770), (ax + 90, 820), (ax, 870)], fill=DO)
        y = 980
        for d in ngat(teaser, F("Bold", 64), 900, ve):
            ve.text((W / 2, y), d, font=F("Bold", 64), fill="white", anchor="mm"); y += 84
        ve.text((W / 2, 1300), "Xem tiếp trên kênh Tâm Cơ", font=F("Medium", 44), fill=(210, 205, 220), anchor="mm")
    else:
        bt = Image.open(GOC / "assets" / "logo" / "tam-co-bieu-tuong.png").convert("RGBA").resize((360, 360))
        im.alpha_composite(bt, ((W - 360) // 2, 560))
        ve.text((W / 2, 1020), "Theo dõi Tâm Cơ", font=F("ExtraBold", 96), fill="white", anchor="mm")
        ve.text((W / 2, 1120), "Hiểu chiêu để không trúng chiêu.", font=F("Medium", 52), fill=(230, 200, 196), anchor="mm")
    im.save(ra)


def nhan_bia(png, n, N):
    """Thêm nhãn "PHẦN n/N" to vào ảnh bìa, cùng vị trí cho cả chuỗi (giữa, phía dưới, trong vùng cắt 3:4 của lưới kênh)."""
    im = Image.open(png).convert("RGBA"); ve = ImageDraw.Draw(im)
    fo = F("ExtraBold", 110); chu = f"PHẦN {n}/{N}"; w = ve.textlength(chu, font=fo) + 110
    x0, y0 = (W - w) / 2, 1440
    ve.rounded_rectangle((x0 + 10, y0 + 12, x0 + w + 10, y0 + 172), 40, fill=(0, 0, 0, 90))
    ve.rounded_rectangle((x0, y0, x0 + w, y0 + 160), 40, fill=(*DO, 255))
    ve.text((W / 2, y0 + 80), chu, font=fo, fill="white", anchor="mm")
    im.convert("RGB").save(png)


def tron_phan(ds, sfx, t0, dai, cuoi, ra_wav):
    n = int(round(dai * SR))
    giong = np.zeros(n); hu = np.zeros(n)
    for c in ds:
        x, sr = sf.read(str(GOC / "giong" / f"{c['id']}.wav")); assert sr == SR
        i0 = int(round((c["bat_dau"] - t0) * SR))
        giong[i0:i0 + len(x)] += x[: max(0, n - i0)]
    muc = ghep.db(giong[np.abs(giong) > 0.01])
    for e in sfx:
        x, _ = sf.read(str(GOC / "assets" / "sfx" / f"{e['ten']}.wav"))
        if x.ndim > 1: x = x.mean(axis=1)
        hoat = x[np.abs(x) > 0.02]
        g = 10 ** ((muc - (8 if e.get("ket") else 12) - ghep.db(hoat)) / 20) if len(hoat) else 0.2
        i0 = int(round(e["t"] * SR)); seg = x[: max(0, n - i0)] * g
        hu[i0:i0 + len(seg)] += seg
    sf.write(str(ra_wav), giong + hu, SR, subtype="PCM_24")


def main(ten, du_lieu=GOC):
    D = GOC / "ra" / ten
    q = json.loads((D / "quay.json").read_text())
    canh = json.loads((pathlib.Path(du_lieu) / "canh.json").read_text())
    video = json.loads((pathlib.Path(du_lieu) / "video.json").read_text())
    ch = video["chuoi"]; N = ch["so_phan"]
    phan_cua = {c["id"]: c["phan"] for c in canh}
    nhat = {c["id"]: c for c in q["ds"]}
    tong_ra = []
    for n in range(1, N + 1):
        P = D / f"phan-{n}"; P.mkdir(exist_ok=True)
        ds = [nhat[c["id"]] for c in canh if c["phan"] == n]
        t0 = ds[0]["bat_dau"]
        khung = sum(c["so_khung"] for c in ds); dp = khung / FPS; dai = dp + DUOI
        bao((n - 1) / N * 100, f"Ghép phần {n}/{N}")
        (P / "ds.txt").write_text("".join(f"file '{D / 'canh' / (c['id'] + '.mp4')}'\n" for c in ds))
        ghep.chay("ffmpeg", "-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", str(P / "ds.txt"), "-c", "copy", str(P / "hinh.mp4"))
        sfx = [{**e, "t": round(e["t"] - t0, 3)} for e in q["sfx"] if t0 <= e["t"] < t0 + dp - 0.05]
        sfx.append({"ten": "riser", "t": round(dp - 0.25, 3), "ket": 1} if n < N else {"ten": "ding", "t": round(dp + 0.1, 3), "ket": 1})
        if n < N: sfx.append({"ten": "whoosh", "t": round(dp + 0.9, 3), "ket": 1})
        tron_phan(ds, sfx, t0, dai, n == N, P / "tron.wav")
        bao((n - 0.6) / N * 100, f"Ghép phần {n}/{N}")
        ghep.loudnorm(P / "tron.wav", P / "am.wav")
        w = anh_nhan(n, N, P / "nhan.png")
        anh_ket(P / "ket.png", n, N, (ch.get("teaser") or [""] * N)[n - 1] if n < N else "")
        logo = GOC / "assets" / "logo" / "logo-goc.png"
        loc = (f"[0]tpad=stop_mode=clone:stop_duration={DUOI}[b];"
               f"[1]format=rgba,colorchannelmixer=aa=0.55[lg];"
               f"[2]format=rgba,fade=t=in:st=0:d=0.2:alpha=1,fade=t=out:st=1.25:d=0.25:alpha=1[nh];"
               f"[3]format=rgba,fade=t=in:st=0:d=0.25:alpha=1,setpts=PTS+{dp:.4f}/TB[kt];"
               f"[b][lg]overlay=48:180:format=auto{':enable=lt(t\\,' + f'{dp:.3f}' + ')' if n == N else ''}[v1];"
               f"[v1][nh]overlay={W - 48 - w}:180:format=auto:eof_action=pass[v2];"
               f"[v2][kt]overlay=0:0:format=auto:eof_action=pass,scale=in_range=auto:out_range=tv,format=yuv420p[v]")
        ghep.chay("ffmpeg", "-y", "-loglevel", "error", "-i", str(P / "hinh.mp4"), "-i", str(logo),
                  "-loop", "1", "-t", "1.5", "-framerate", "30", "-i", str(P / "nhan.png"),
                  "-loop", "1", "-t", str(DUOI), "-framerate", "30", "-i", str(P / "ket.png"), "-i", str(P / "am.wav"),
                  "-filter_complex", loc, "-map", "[v]", "-map", "4:a", "-c:v", "libx264", "-preset", "medium", "-crf", "18",
                  "-profile:v", "high", "-pix_fmt", "yuv420p", "-color_range", "tv", "-r", "30", "-c:a", "aac", "-b:a", "192k",
                  "-ar", "48000", "-movflags", "+faststart", "-t", f"{dai:.4f}", str(P / "video.mp4"))
        for f in ("hinh.mp4", "tron.wav", "tron-gh.wav", "ds.txt", "am.wav"):
            (P / f).unlink(missing_ok=True)
        tong_ra.append(f"phần {n}/{N}: {dai:.1f}s")
        print(f"phần {n}/{N} → {(P / 'video.mp4').relative_to(GOC)} ({dai:.1f}s)")
    bao(100, f"Ghép xong {N} phần")
    return tong_ra


if __name__ == "__main__":
    if sys.argv[1] == "--bia":  # ghep-chuoi.py --bia <anh-bia.png> <n> <N>
        nhan_bia(sys.argv[2], int(sys.argv[3]), int(sys.argv[4])); sys.exit()
    main(sys.argv[1], sys.argv[2] if len(sys.argv) > 2 else GOC)
