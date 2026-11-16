"""Thử giọng: 3 giọng x 2 chế độ (v3turbo fp32, v3nano), đo RTF."""
import sys, time, json, soundfile as sf
from vieneu import Vieneu

TEXT = ("Có những người không bao giờ cãi nhau với bạn, nhưng lại ghét bạn theo cách bạn không hề nhận ra. "
        "Mình từng nghĩ quan hệ với cả phòng rất ổn. Cho tới một buổi chiều, mình vô tình thấy trên máy đồng nghiệp "
        "một nhóm chat của phòng. Nhóm đó có đủ mọi người, chỉ thiếu đúng một cái tên. Là tên mình.")

mode = sys.argv[1]
voices = sys.argv[2].split(",")
kw = {"mode": mode}
t0 = time.time(); tts = Vieneu(**kw); load = time.time() - t0
print(f"[{mode}] load {load:.1f}s; voices:", [v[0] for v in tts.list_preset_voices()], flush=True)
res = []
for v in voices:
    t0 = time.time(); audio = tts.infer(TEXT, voice=v); dt = time.time() - t0
    out = f"thu-giong/{mode}_{v.replace(' ', '-')}.wav"
    tts.save(audio, out)
    dur = sf.info(out).duration
    res.append({"mode": mode, "voice": v, "xu_ly_s": round(dt, 1), "do_dai_s": round(dur, 1), "rtf": round(dt / dur, 2)})
    print(res[-1], flush=True)
json.dump(res, open(f"thu-giong/ket-qua-{mode}.json", "w"), ensure_ascii=False, indent=1)
