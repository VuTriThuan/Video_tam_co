"""Tổng hợp thư viện SFX sạch (48 kHz mono) vào assets/sfx/. Không dùng file bên ngoài."""
import numpy as np, pathlib
from scipy.io import wavfile
from scipy.signal import butter, sosfilt

SR = 48000
OUT = pathlib.Path(__file__).resolve().parent.parent / "assets" / "sfx"
rng = np.random.default_rng(7)


def t(d):
    return np.arange(int(SR * d)) / SR


def env(n, a, r, shape=2.0):
    """Đường bao attack/release (giây)."""
    x = np.ones(n)
    na, nr = int(SR * a), int(SR * r)
    if na: x[:na] = np.linspace(0, 1, na) ** 0.7
    if nr: x[-nr:] *= np.linspace(1, 0, nr) ** shape
    return x


def bp(x, lo, hi, order=2):
    return sosfilt(butter(order, [lo, hi], btype="band", fs=SR, output="sos"), x)


def lp(x, f, order=2):
    return sosfilt(butter(order, f, btype="low", fs=SR, output="sos"), x)


def sweep_noise(d, f0, f1, q=0.35, blocks=64):
    """Nhiễu lọc băng với tâm tần quét f0→f1 (whoosh)."""
    n = int(SR * d); noise = rng.standard_normal(n); out = np.zeros(n)
    edges = np.linspace(0, n, blocks + 1).astype(int)
    for i in range(blocks):
        fc = f0 * (f1 / f0) ** (i / (blocks - 1))
        seg = bp(noise[max(0, edges[i] - 2000):edges[i + 1]], fc * (1 - q), fc * (1 + q))
        out[edges[i]:edges[i + 1]] = seg[-(edges[i + 1] - edges[i]):]
    return out


def norm(x, peak=0.9):
    x = x - np.mean(x)
    return x / (np.max(np.abs(x)) + 1e-9) * peak


def whoosh(d=0.45, f0=500, f1=3500):
    x = sweep_noise(d, f0, f1)
    n = len(x); e = np.sin(np.linspace(0, np.pi, n)) ** 1.6
    return norm(x * e)


def pop():
    tt = t(0.12); f = 900 * np.exp(-tt * 28) + 300
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 38)
    return norm(x + 0.15 * bp(rng.standard_normal(len(tt)), 2000, 6000) * np.exp(-tt * 120))


def ding():
    tt = t(1.1); x = np.zeros_like(tt)
    for f, a, dk in ((1318.5, 1, 3.2), (2637, 0.35, 5), (3951, 0.15, 7), (1975.5, 0.25, 4)):
        x += a * np.sin(2 * np.pi * f * tt) * np.exp(-tt * dk)
    return norm(x * env(len(tt), 0.003, 0.05), 0.8)


def tick():
    tt = t(0.05); x = bp(rng.standard_normal(len(tt)), 2500, 7000) * np.exp(-tt * 260)
    x += 0.5 * np.sin(2 * np.pi * 1800 * tt) * np.exp(-tt * 200)
    return norm(x, 0.8)


def tin_nhan():
    """Hai nốt ngắn đi lên, kiểu thông báo tin nhắn chung chung."""
    out = []
    for f, d in ((880, 0.09), (1318.5, 0.16)):
        tt = t(d); out.append((np.sin(2 * np.pi * f * tt) + 0.3 * np.sin(4 * np.pi * f * tt)) * env(len(tt), 0.004, d * 0.7))
        out.append(np.zeros(int(SR * 0.025)))
    return norm(np.concatenate(out), 0.8)


def thud():
    tt = t(0.35); f = 110 * np.exp(-tt * 6) + 45
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 14)
    x += 0.3 * lp(rng.standard_normal(len(tt)), 400) * np.exp(-tt * 40)
    return norm(x)


def but_sot_soat(d=0.7):
    """Tiếng bút dạ cọ giấy: nhiễu băng cao, điều biến nhịp nét."""
    tt = t(d); n = bp(rng.standard_normal(len(tt)), 2500, 9000)
    am = 0.55 + 0.45 * np.abs(np.sin(2 * np.pi * 6.5 * tt + 1.3 * np.sin(2 * np.pi * 1.7 * tt)))
    return norm(n * am * env(len(tt), 0.03, 0.15), 0.6)


def lat_giay():
    tt = t(0.42); n = rng.standard_normal(len(tt))
    x = bp(n, 800, 6000) * (np.exp(-((tt - 0.12) / 0.07) ** 2) + 0.6 * np.exp(-((tt - 0.26) / 0.05) ** 2))
    return norm(x, 0.7)


def bup():
    """'Bụp' truyện tranh: thump + chút nhiễu."""
    tt = t(0.25); f = 180 * np.exp(-tt * 18) + 60
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 18)
    x += 0.35 * bp(rng.standard_normal(len(tt)), 300, 3000) * np.exp(-tt * 60)
    return norm(np.tanh(2.2 * x))


def go_phim(so_phim=6):
    out = np.zeros(int(SR * (0.09 * so_phim + 0.1)))
    for i in range(so_phim):
        st = int(SR * (i * 0.09 + rng.uniform(-0.01, 0.01)) + 0.01 * SR)
        k = tick() * rng.uniform(0.5, 1.0)
        k = lp(k, rng.uniform(3500, 6000))
        out[st:st + len(k)] += k[:len(out) - st]
    return norm(out, 0.7)


def riser(d=1.2):
    tt = t(d); x = sweep_noise(d, 200, 4000, q=0.25) * (tt / d) ** 2
    x += 0.25 * np.sin(2 * np.pi * np.cumsum(220 + 440 * (tt / d) ** 2) / SR) * (tt / d) ** 2
    return norm(x * env(len(tt), 0.0, 0.03), 0.8)


def whoosh_tram():
    return norm(lp(whoosh(0.8, 150, 900), 1500))


THU_VIEN = {
    "whoosh": whoosh, "swoosh-nhe": lambda: whoosh(0.3, 1200, 4500) * 0.6, "pop": pop, "ding": ding,
    "tick": tick, "tin-nhan": tin_nhan, "thud": thud, "but-sot-soat": but_sot_soat, "lat-giay": lat_giay,
    "bup": bup, "go-phim": go_phim, "riser": riser, "whoosh-tram": whoosh_tram,
}

if __name__ == "__main__":
    OUT.mkdir(parents=True, exist_ok=True)
    for ten, fn in THU_VIEN.items():
        x = np.asarray(fn(), dtype=np.float64)
        fade = min(len(x), int(SR * 0.005)); x[-fade:] *= np.linspace(1, 0, fade)
        wavfile.write(OUT / f"{ten}.wav", SR, (x * 32767).astype(np.int16))
    (OUT / "NGUON.md").write_text("# Nguồn SFX\n\nTất cả SFX trong thư mục này được tổng hợp bằng `pipeline/sfx.py` (numpy/scipy), không dùng âm thanh bên ngoài.\n")
    print("ghi", len(THU_VIEN), "SFX vào", OUT)
