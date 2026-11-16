"""Hậu kỳ giọng: cắt lặng đầu/cuối (giữ 0,12s), highpass 80, de-esser, nén nhẹ, EQ 3 kHz, (giãn nhịp), WAV 48 kHz mono.

Dùng: python pipeline/giong.py vao.wav ra.wav [--tempo 0.9]
"""
import argparse, subprocess

TRIM = ("silenceremove=start_periods=1:start_duration=0.04:start_threshold=-40dB:"
        "start_silence=0.12:detection=rms:window=0.01")
# Ngắt giữa câu (dấu phẩy) dài quá 0,32 s thì rút còn ~0,28 s
GIUA = ("silenceremove=stop_periods=-1:stop_duration=0.32:stop_threshold=-42dB:"
        "stop_silence=0.28:detection=rms:window=0.01")


def hau_ky(vao: str, ra: str, tempo: float = 1.0) -> None:
    chain = [
        TRIM, GIUA, "areverse", TRIM, "areverse",
        "highpass=f=80",
        "deesser=i=0.4:m=0.5:f=0.5",
        "acompressor=threshold=-20dB:ratio=3:attack=8:release=120:makeup=2",
        "equalizer=f=3000:t=q:w=1.2:g=2.5",
    ]
    if abs(tempo - 1.0) > 1e-3:
        chain.append(f"atempo={tempo}")
    chain += ["aresample=48000", "alimiter=limit=0.89"]
    subprocess.run(
        ["ffmpeg", "-y", "-loglevel", "error", "-i", vao, "-af", ",".join(chain),
         "-ac", "1", "-ar", "48000", "-c:a", "pcm_s16le", ra],
        check=True,
    )


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("vao"); ap.add_argument("ra")
    ap.add_argument("--tempo", type=float, default=1.0)
    a = ap.parse_args()
    hau_ky(a.vao, a.ra, a.tempo)
