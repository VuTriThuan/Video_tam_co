"""Trang so sánh mẫu của một chủ đề: review/<chu-de>.html — 3 video cạnh nhau, nút phát cùng lúc, thời gian render, ảnh bìa.

Dùng: python pipeline/so-sanh.py <chu-de>
"""
import json, pathlib, sys

GOC = pathlib.Path(__file__).resolve().parent.parent
PC = [("bang-trang", "Bảng trắng"), ("truyen-tranh", "Truyện tranh"), ("tranh-tinh-zoom", "Tranh điện ảnh")]


def main(chu_de):
    the = []
    for k, (ma, ten) in enumerate(PC, 1):
        d = GOC / "ra" / chu_de / f"mau-{ma}"
        if not (d / "video.mp4").exists():
            continue
        q = json.loads((d / "quay.json").read_text())
        tg = (d / "thoi-gian.txt").read_text().strip() if (d / "thoi-gian.txt").exists() else ""
        mb = (d / "video.mp4").stat().st_size / 1e6
        src = f"../ra/{chu_de}/mau-{ma}"
        the.append(f"""<figure class="the"><video src="{src}/video.mp4" controls playsinline preload="metadata" poster="{src}/anh-bia.png"></video>
  <figcaption><b>{k}. {ten}</b> <code>{ma}</code><span>{tg} · video {q['tong_khung'] / 30:.1f}s · {mb:.1f} MB</span>
  <details><summary>Ảnh bìa</summary><img src="{src}/anh-bia.png" alt="Ảnh bìa {ten}"></details></figcaption></figure>""")
    html = f"""<!doctype html><html lang="vi"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Tâm Cơ — chọn phong cách: {chu_de}</title>
<style>
:root{{--nen:#141414;--chu:#F3EFEF;--do:#E63946;--phu:#8a8a93}}
body{{margin:0;background:var(--nen);color:var(--chu);font:15px/1.5 system-ui,-apple-system,sans-serif;padding:20px 16px 40px}}
h1{{margin:0 0 4px;font-size:22px}} h1 b{{color:var(--do)}} p{{margin:0 0 16px;color:var(--phu)}}
.nut{{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:18px}}
button{{background:var(--do);color:#fff;border:0;border-radius:999px;padding:10px 18px;font-weight:700;font-size:15px;cursor:pointer}}
button.phu{{background:#2a2a30}}
.luoi{{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px;max-width:1100px}}
.the{{margin:0;background:#1d1d22;border-radius:14px;padding:8px}}
video{{width:100%;aspect-ratio:9/16;border-radius:10px;background:#000;display:block}}
figcaption{{padding:8px 4px 2px;display:flex;flex-direction:column;gap:2px}} figcaption span{{color:var(--phu);font-size:13px}} code{{color:var(--phu)}}
details img{{width:100%;border-radius:8px;margin-top:6px}} summary{{cursor:pointer;color:var(--phu);font-size:13px}}
</style>
<h1><b>Tâm Cơ</b> · chọn phong cách cho chủ đề “{chu_de}”</h1>
<p>Cùng kịch bản, cùng giọng. Bấm "Phát cùng lúc" (chỉ video đầu có tiếng) rồi báo em số phong cách sếp chọn.</p>
<div class="nut"><button id="phat">▶ Phát cùng lúc</button><button class="phu" id="dung">■ Dừng</button><button class="phu" id="tieng">Bật tiếng tất cả</button></div>
<div class="luoi">{''.join(the)}</div>
<script>
const vs=[...document.querySelectorAll('video')];
document.getElementById('phat').onclick=()=>{{vs.forEach((v,i)=>{{v.currentTime=0;v.muted=i>0;v.play()}})}};
document.getElementById('dung').onclick=()=>vs.forEach(v=>v.pause());
document.getElementById('tieng').onclick=()=>vs.forEach(v=>v.muted=false);
</script></html>"""
    (GOC / "review").mkdir(exist_ok=True)
    ra = GOC / "review" / f"{chu_de}.html"
    ra.write_text(html)
    print(ra.relative_to(GOC))


if __name__ == "__main__":
    main(sys.argv[1])
