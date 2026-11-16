"""Biên độ giọng theo từng khung (1/30 giây) của từng cảnh → bien-do.json, dùng cho miệng nhân vật.

Kết quả: {"fps":30,"canh":{"c01":[0..1,...], ...}}; im lặng → 0 (ngậm miệng).
"""
import json, pathlib, numpy as np, soundfile as sf

GOC = pathlib.Path(__file__).resolve().parent.parent
FPS = 30


def mot_canh(path):
    x, sr = sf.read(str(path))
    if x.ndim > 1: x = x.mean(1)
    hop = sr // FPS
    n = len(x) // hop
    rms = np.array([np.sqrt(np.mean(x[i * hop:(i + 1) * hop] ** 2)) for i in range(n)])
    db = 20 * np.log10(rms + 1e-6)
    muc = np.clip((db + 28) / 16, 0, 1)               # độ to tuyệt đối: -28 dB → 0, -12 dB → 1
    tb = np.convolve(db, np.ones(9) / 9, mode="same")
    nhip = np.clip((db - tb) / 6 + 0.5, 0, 1)          # nhấp nhô theo âm tiết
    v = np.where(db < -32, 0, 0.55 * muc + 0.45 * nhip * muc)
    v = np.convolve(v, [0.25, 0.5, 0.25], mode="same")
    return [round(float(a), 3) for a in v]


def main():
    canh = json.loads((GOC / "canh.json").read_text())
    out = {"fps": FPS, "canh": {c["id"]: mot_canh(GOC / "giong" / f"{c['id']}.wav") for c in canh}}
    (GOC / "bien-do.json").write_text(json.dumps(out))
    tb = np.mean([np.mean(v) for v in out["canh"].values()])
    print("bien-do:", len(out["canh"]), "cảnh, trung bình", round(float(tb), 3))


if __name__ == "__main__":
    main()
