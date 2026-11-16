"""Đọc giọng từng cảnh: canh.json → giong/<id>.wav (đã hậu kỳ) + thoi-luong.json.

Giọng: KorvaTTS gia_bao, tốc độ 1,0, CPU. Dùng: python pipeline/doc-giong.py [--chi c01,c02]
"""
import argparse, json, time, importlib.util, pathlib, soundfile as sf

GOC = pathlib.Path(__file__).resolve().parent.parent


def _nap(ten):
    spec = importlib.util.spec_from_file_location(ten.replace("-", "_"), GOC / "pipeline" / f"{ten}.py")
    m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m); return m


chuan_hoa = _nap("chuan-hoa").chuan_hoa
hau_ky = _nap("giong").hau_ky
GIONG, TOC_DO, BUOC = "gia_bao", 1.0, 32


def nghi_sau(i: int, canh: list) -> float:
    """Khoảng nghỉ sau mỗi cảnh: dài hơn sau hook và trước câu chốt."""
    if i == len(canh) - 1:
        return 0.15
    if i == 0:
        return 0.35
    sau = canh[i + 1]["bo_cuc"]
    if sau == "ket":
        return 0.35
    if sau == "dau-hieu-so":
        return 0.3
    return 0.2


def main():
    ap = argparse.ArgumentParser(); ap.add_argument("--chi", default="")
    a = ap.parse_args()
    canh = json.loads((GOC / "canh.json").read_text())
    chi = set(filter(None, a.chi.split(",")))
    (GOC / "giong" / "tho").mkdir(parents=True, exist_ok=True)
    from korvatts import TTS
    tts = TTS(device="cpu")
    t_bat_dau = time.time()
    for c in canh:
        if chi and c["id"] not in chi:
            continue
        van = chuan_hoa(c["loi"])
        wav, _ = tts.synthesize(van, voice=GIONG, lang="vi", total_steps=BUOC, speed=TOC_DO)
        tho = GOC / "giong" / "tho" / f"{c['id']}.wav"
        tts.save_audio(wav, str(tho))
        hau_ky(str(tho), str(GOC / "giong" / f"{c['id']}.wav"))
        print(c["id"], round(sf.info(str(GOC / "giong" / f"{c['id']}.wav")).duration, 2), "s |", van, flush=True)
    tong_doc = time.time() - t_bat_dau
    # thời lượng từng cảnh = giọng + nghỉ
    tl, t = [], 0.0
    for i, c in enumerate(canh):
        g = sf.info(str(GOC / "giong" / f"{c['id']}.wav")).duration
        d = round(g + nghi_sau(i, canh), 3)
        tl.append({"id": c["id"], "bat_dau": round(t, 3), "giong": round(g, 3), "thoi_luong": d})
        t += d
    (GOC / "thoi-luong.json").write_text(json.dumps({"tong": round(t, 3), "canh": tl}, ensure_ascii=False, indent=1))
    print(f"TỔNG {t:.1f}s | thời gian đọc {tong_doc:.0f}s")


if __name__ == "__main__":
    main()
