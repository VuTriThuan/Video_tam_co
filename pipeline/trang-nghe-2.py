import json, os
res = json.load(open("thu-giong/ket-qua-vong2.json"))
def rows(engine):
    out = []
    for r in res:
        if r["engine"] != engine: continue
        f = f"nghe/v2_{engine}_{r['voice'].replace(' ', '-')}.wav"
        out.append(f"<tr><td>{r['voice']}</td><td>RTF {r['rtf']}</td><td><audio controls preload='none' src='{f}'></audio></td></tr>")
    return "\n".join(out)
html = f"""<!doctype html><meta charset="utf-8"><title>Thử giọng vòng 2</title>
<style>body{{font:16px system-ui;background:#141414;color:#F3EFEF;padding:24px}}h1,h2{{color:#E63946}}td{{padding:6px 14px;border-bottom:1px solid #333}}</style>
<h1>Thử giọng vòng 2</h1><p>Cùng đoạn văn như vòng 1, đã hậu kỳ. Sếp ghi lại tên 1–3 giọng ưng nhất.</p>
<h2>KorvaTTS (công cụ dự phòng, tốc độ 0,9)</h2><table>{rows('korva')}</table>
<h2>VieNeu Turbo — các giọng chưa nghe (temperature 0,95, giãn nhịp 0,88)</h2><table>{rows('turbo')}</table>"""
open("thu-giong/nghe-thu-2.html", "w").write(html)
print("ok", len(res))
