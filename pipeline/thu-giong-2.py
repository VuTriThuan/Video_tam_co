"""Thử giọng vòng 2: KorvaTTS (10 giọng) + VieNeu Turbo các giọng chưa thử."""
import time, json, soundfile as sf, subprocess, sys
sys.path.insert(0, "pipeline")
from giong import hau_ky
TEXT = open("pipeline/thu-giong.py").read().split('TEXT = (')[1].split(')\n')[0]
TEXT = eval("(" + TEXT + ")")
res = []
def ghi(engine, voice, raw, dt, tempo=1.0):
    out = f"thu-giong/nghe/v2_{engine}_{voice.replace(' ', '-')}.wav"
    hau_ky(raw, out, tempo)
    d = sf.info(raw).duration
    res.append({"engine": engine, "voice": voice, "rtf": round(dt / d, 2), "do_dai_s": round(sf.info(out).duration, 1)})
    print(res[-1], flush=True)

from korvatts import TTS
k = TTS()
for v in k.list_voices():
    t0 = time.time(); wav, _ = k.synthesize(TEXT, voice=v, lang="vi", total_steps=32, speed=0.9); dt = time.time() - t0
    raw = f"thu-giong/korva_{v}.wav"; k.save_audio(wav, raw); ghi("korva", v, raw, dt)

from vieneu import Vieneu
t = Vieneu(mode="v3turbo")
da_thu = {"Hải Đăng", "Trúc Ly", "Thùy Dung", "Adam"}
for label, vid in t.list_preset_voices():
    name = label.split(" — ")[0].strip()
    if name in da_thu: continue
    try:
        t0 = time.time(); a = t.infer(TEXT, voice=vid, temperature=0.95); dt = time.time() - t0
    except Exception as e:
        print("lỗi", name, e, flush=True); continue
    raw = f"thu-giong/turbo2_{name.replace(' ', '-')}.wav"; t.save(a, raw)
    ghi("turbo", name + " — " + label.split(" — ")[1], raw, dt, tempo=0.88)
json.dump(res, open("thu-giong/ket-qua-vong2.json", "w"), ensure_ascii=False, indent=1)
print("XONG")
