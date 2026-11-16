"""So số liệu của một video với trung vị các video trước (0 token). In tối đa ~15 dòng.
Dùng: python3 phan-tich/trung-vi.py <slug>
Chuỗi nhiều phần: in thêm tỉ lệ đi tiếp = lượt xem phần n+1 / phần n (dưới 15% = điểm cắt yếu).
"""
import csv, sys, pathlib, statistics
GOC = pathlib.Path(__file__).resolve().parent
SO = ["luot_xem", "tg_xem_tb_giay", "ti_le_xem_het", "giu_3s", "thich", "binh_luan", "chia_se", "luu", "theo_doi_moi"]
slug = sys.argv[1] if len(sys.argv) > 1 else ""
rows = list(csv.DictReader(open(GOC / "so-lieu.csv", encoding="utf-8")))
so = lambda v: float(v.replace("%", "")) if v not in ("", None) else None  # số thuần: không dấu phân cách nghìn, thập phân bằng dấu chấm
nay = [r for r in rows if r["slug"] == slug]
cu = [r for r in rows if r["slug"] != slug]
if not nay: print(f"Chưa có dòng nào của '{slug}' trong so-lieu.csv"); sys.exit(1)
print(f"{slug}: {len(nay)} dòng · so với {len({r['slug'] for r in cu})} video trước" + (" (ít dữ liệu, chưa kết luận chắc)" if len({r['slug'] for r in cu}) < 3 else ""))
for nt in sorted({r["nen_tang"] for r in nay}):
    a = [r for r in nay if r["nen_tang"] == nt]; b = [r for r in cu if r["nen_tang"] == nt]
    ds = []
    for k in SO:
        v = [so(r[k]) for r in a if so(r[k]) is not None]
        m = [so(r[k]) for r in b if so(r[k]) is not None]
        if not v: continue
        tb = sum(v) / len(v)
        ds.append(f"{k}={tb:g}" + (f" (trung vị {statistics.median(m):g}, {'+' if tb >= statistics.median(m) else ''}{(tb / statistics.median(m) - 1) * 100:.0f}%)" if m and statistics.median(m) else ""))
    print(f"[{nt}] " + "; ".join(ds))
    phan = sorted([r for r in a if r["phan"]], key=lambda r: int(r["phan"]))
    for x, y in zip(phan, phan[1:]):
        vx, vy = so(x["luot_xem"]), so(y["luot_xem"])
        if vx and vy is not None:
            tl = vy / vx * 100
            print(f"  đi tiếp phần {x['phan']}→{y['phan']}: {tl:.0f}%" + ("  ← ĐIỂM CẮT YẾU (<15%)" if tl < 15 else ""))
