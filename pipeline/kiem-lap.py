"""Kiểm tra chống lặp hình (không tốn token), chạy cùng kiem-canh.py.

Dùng:
  python3 pipeline/kiem-lap.py                 kiểm tra canh.json + video.json hiện tại
  python3 pipeline/kiem-lap.py --phong-cach X  nhắc nếu X đã dùng 2 video liền trước (lúc chọn mẫu)
  python3 pipeline/kiem-lap.py --ghi X         ghi video hiện tại (phong cách X) vào logs/da-dung.json khi đã xong
Trong một video:
  - một kiểu cảnh (bo_cuc + nen + goc_may) dùng tối đa 2 lần; không 2 cảnh liền nhau cùng bo_cuc
  - ít nhất 3 loại goc_may; một nền không quá 4 cảnh liên tiếp; 2–4 bối cảnh
  - một kiểu chuyển cảnh không quá 3 lần liên tiếp (theo vòng chuyển cảnh của từng phong cách)
  - hiệu ứng đặc biệt (mọi hieu_ung trừ nhóm chú thích vong-tron-do/gach-cheo/tick/so-thu-tu/mui-ten) là gia vị:
    tối đa 4 lượt mỗi video (chuỗi: mỗi phần), mỗi tên tối đa 2 lượt, không 2 cảnh liền nhau cùng một hiệu ứng
Chuỗi (video.json "dinh_dang": "chuoi"): kiểu cảnh tối đa 2 lần trong TỪNG phần, tối đa 3 lần cả chuỗi;
  cảnh mở đầu các phần phải khác nhau (khác bo_cuc hoặc nen).
Giữa các video (logs/da-dung.json):
  - cảnh mở đầu khác 5 video gần nhất (khác bo_cuc hoặc nen); tông màu khác 2 video gần nhất
  - nội dung màn hình (tên nhóm chat, tên người nhắn, tin nhắn, tiêu đề email/tài liệu/lịch, thông báo)
    không trùng bất kỳ video nào trước (so không dấu, không phân biệt hoa thường; bỏ qua chuỗi 1 từ)
  - sau mỗi 10 video: nhắc làm mới thư viện
"""
import json, pathlib, sys, datetime
from collections import Counter

GOC = pathlib.Path(__file__).resolve().parent.parent
LOG = GOC / "logs" / "da-dung.json"
CHU_THICH = {"vong-tron-do", "gach-cheo", "tick", "so-thu-tu", "mui-ten"}  # hiệu ứng chú thích, không tính là "đặc biệt"
TOI_DA_HU, TOI_DA_MOI_HU = 4, 2
BOI_CANH = set(json.loads((GOC / "render/thu-vien/ten-khoi.json").read_text())["boi_canh"])
# vòng chuyển cảnh của từng phong cách (khớp phong-cach.js)
VONG = {"bang-trang": ["lat", "xoa", "lat", "xoa"], "truyen-tranh": ["truot", "lat", "truot", "phong"], "tranh-tinh-zoom": ["den", "phong", "den", "truot"]}


def doc():
    return json.loads((GOC / "canh.json").read_text()), json.loads((GOC / "video.json").read_text())


def lich_su():
    return json.loads(LOG.read_text()) if LOG.exists() else []


KHOA_MH = ("ten", "nd", "dong", "tieu_de", "tu")


def chuan(x):
    import unicodedata
    x = unicodedata.normalize("NFD", x.lower().replace("đ", "d"))
    return " ".join("".join(ch for ch in x if unicodedata.category(ch) != "Mn").split())


def noi_dung_mh(canh):
    """Tập chuỗi hiển thị trên màn hình của các cảnh (chỉ chuỗi ≥2 từ)."""
    ra = {}
    def duyet(o, id_):
        if isinstance(o, dict):
            for k, v in o.items():
                if k in KHOA_MH and isinstance(v, str) and len(v.split()) >= 2: ra.setdefault(v, id_)
                else: duyet(v, id_)
        elif isinstance(o, list):
            for v in o: duyet(v, id_)
    for c in canh:
        if c.get("man_hinh"): duyet(c["man_hinh"], c["id"])
    return ra


def tom_tat(canh, video, pc):
    return {"chu_de": video["chu_de"], "ngay": datetime.date.today().isoformat(), "phong_cach": pc, "tong_mau": video["tong_mau"],
            "seed": video.get("seed"), "mo_dau": {"bo_cuc": canh[0]["bo_cuc"], "nen": canh[0].get("nen", "burst")},
            "bo_cuc": dict(Counter(c["bo_cuc"] for c in canh)), "nen": dict(Counter(c.get("nen") for c in canh)),
            "goc_may": dict(Counter(c.get("goc_may") for c in canh)), "man_hinh": sorted(noi_dung_mh(canh)),
            "hieu_ung": dict(Counter(h.get("ten") for c in canh for h in c.get("hieu_ung", []))),
            "dinh_dang": video.get("dinh_dang", "le"), "so_phan": (video.get("chuoi") or {}).get("so_phan", 1)}


def kiem():
    canh, video = doc()
    vp = []
    kc = lambda c: (c["bo_cuc"], c.get("nen"), c.get("goc_may"))
    def dem_kieu(ds, toi_da, noi):
        for k, n in Counter(kc(c) for c in ds if c["bo_cuc"] not in ("hook-chu-to", "ket")).items():
            if n > toi_da: vp.append(f"{noi}kiểu cảnh {'/'.join(map(str, k))} dùng {n} lần (tối đa {toi_da}): " + ", ".join(c["id"] for c in ds if kc(c) == k))
    chuoi = video.get("dinh_dang") == "chuoi"
    if chuoi:
        phan = sorted({c.get("phan", 1) for c in canh})
        nhom = {p: [c for c in canh if c.get("phan", 1) == p] for p in phan}
        for p in phan: dem_kieu(nhom[p], 2, f"phần {p}: ")
        dem_kieu(canh, 3, "cả chuỗi: ")
        mo = {}
        for p in phan:
            c0 = nhom[p][0]; k = (c0["bo_cuc"], c0.get("nen"))
            if k in mo: vp.append(f"cảnh mở đầu phần {p} ({c0['id']}) giống phần {mo[k]} ({k[0]} / {k[1]}) — đổi bo_cuc hoặc nen")
            mo.setdefault(k, p)
    else:
        dem_kieu(canh, 2, "")
    def dem_hu(ds, noi):
        luot = [(c["id"], h.get("ten")) for c in ds for h in c.get("hieu_ung", []) if h.get("ten") not in CHU_THICH]
        if len(luot) > TOI_DA_HU: vp.append(f"{noi}{len(luot)} lượt hiệu ứng đặc biệt (tối đa {TOI_DA_HU}) — bỏ bớt, giữ ở hook/lật mặt/chốt: " + ", ".join(f"{i}:{t}" for i, t in luot))
        for ten, n in Counter(t for _, t in luot).items():
            if n > TOI_DA_MOI_HU: vp.append(f"{noi}hiệu ứng '{ten}' dùng {n} lần (tối đa {TOI_DA_MOI_HU}): " + ", ".join(i for i, t in luot if t == ten))
    if chuoi:
        for p in phan: dem_hu(nhom[p], f"phần {p}: ")
    else:
        dem_hu(canh, "")
    for a, b in zip(canh, canh[1:]):
        chung = {h.get("ten") for h in a.get("hieu_ung", [])} & {h.get("ten") for h in b.get("hieu_ung", [])} - CHU_THICH
        if chung: vp.append(f"{a['id']}–{b['id']}: 2 cảnh liền nhau cùng hiệu ứng {sorted(chung)}")
    for a, b in zip(canh, canh[1:]):
        if a["bo_cuc"] == b["bo_cuc"]: vp.append(f"{a['id']}–{b['id']}: 2 cảnh liền nhau cùng bo_cuc '{a['bo_cuc']}'")
    goc = {c.get("goc_may") for c in canh}
    if len(goc) < 3: vp.append(f"chỉ có {len(goc)} loại góc máy (cần ≥3): {sorted(map(str, goc))}")
    chuoi = 1
    for a, b in zip(canh, canh[1:]):
        chuoi = chuoi + 1 if a.get("nen") == b.get("nen") else 1
        if chuoi == 5: vp.append(f"nền '{b.get('nen')}' quá 4 cảnh liên tiếp (tới {b['id']})")
    bc = {c.get("nen") for c in canh} & BOI_CANH
    if not 2 <= len(bc) <= 4: vp.append(f"dùng {len(bc)} bối cảnh (cần 2–4): {sorted(bc)}")
    for pc, vong in VONG.items():
        ds = [vong[(k + 3) % len(vong)] for k in range(1, len(canh))]
        dai = max((sum(1 for _ in g) for _, g in __import__("itertools").groupby(ds)), default=0)
        if dai > 3: vp.append(f"{pc}: một kiểu chuyển cảnh lặp {dai} lần liên tiếp")
    ls = [x for x in lich_su() if x["chu_de"] != video["chu_de"]]
    md = (canh[0]["bo_cuc"], canh[0].get("nen", "burst"))
    for x in ls[-5:]:
        if (x["mo_dau"]["bo_cuc"], x["mo_dau"]["nen"]) == md:
            vp.append(f"cảnh mở đầu ({md[0]} / {md[1]}) giống video '{x['chu_de']}' — đổi nen của cảnh {canh[0]['id']}")
    for x in ls[-2:]:
        if x["tong_mau"] == video["tong_mau"]:
            vp.append(f"tông màu '{video['tong_mau']}' trùng video '{x['chu_de']}' (2 video gần nhất)")
    da_co = {}
    for x in ls:
        for chuoi_mh in x.get("man_hinh", []): da_co.setdefault(chuan(chuoi_mh), x["chu_de"])
    for chuoi_mh, id_ in noi_dung_mh(canh).items():
        if chuan(chuoi_mh) in da_co:
            vp.append(f"{id_}: nội dung màn hình '{chuoi_mh}' đã dùng ở video '{da_co[chuan(chuoi_mh)]}' — đặt tên/tin khác")
    if ls and len(ls) % 10 == 0:
        dem = Counter()
        for x in ls[-10:]: dem.update(x["bo_cuc"]); dem.update({f"nen:{k}": v for k, v in x["nen"].items()})
        print(f"NHẮC: đã đủ {len(ls)} video — nên làm mới. Dùng nhiều nhất: " + ", ".join(f"{k}×{v}" for k, v in dem.most_common(5)))
    if vp:
        print(f"LẶP ({len(vp)}):"); [print(" -", x) for x in vp]
    else:
        print("ĐẠT: không lặp")
    return vp


def main():
    a = sys.argv[1:]
    if "--ghi" in a:
        pc = a[a.index("--ghi") + 1]
        canh, video = doc()
        ls = [x for x in lich_su() if x["chu_de"] != video["chu_de"]] + [tom_tat(canh, video, pc)]
        LOG.parent.mkdir(exist_ok=True); LOG.write_text(json.dumps(ls, ensure_ascii=False, indent=1))
        print(f"đã ghi '{video['chu_de']}' ({pc}) vào logs/da-dung.json — tổng {len(ls)} video")
        return
    if "--phong-cach" in a:
        pc = a[a.index("--phong-cach") + 1]
        ls = lich_su()
        if len(ls) >= 2 and all(x["phong_cach"] == pc for x in ls[-2:]):
            print(f"LƯU Ý: '{pc}' đã dùng 2 video liền trước; chọn nữa sẽ là 3 video liền (đại ca quyết).")
        return
    sys.exit(1 if kiem() else 0)


if __name__ == "__main__":
    main()
