"""Kiểm tra canh.json + video.json đúng cấu trúc và mọi khối đều có trong thư viện (không tốn token).

Dùng: python3 pipeline/kiem-canh.py [canh.json] [video.json]
Định dạng chuỗi (video.json "dinh_dang": "chuoi"): mỗi cảnh có "phan" (1..N, N = 3–5, tăng dần), mỗi phần 250–340 từ,
video.json "chuoi": {"so_phan": N, "diem_cat": [id cảnh cuối phần 1..N-1], "nhac_lai": [id cảnh nhắc lại đầu phần 2..N],
"teaser": [câu "Phần sau" ngắn cho phần 1..N-1], "bia_phan": [{"chu","tu_khoa"} × N]}.
In "ĐẠT" hoặc danh sách lỗi; khối thiếu in riêng để phiên chính vẽ thêm. Thoát mã 1 nếu có lỗi.
"""
import json, pathlib, re, sys

GOC = pathlib.Path(__file__).resolve().parent.parent
TEN = json.loads((GOC / "render/thu-vien/ten-khoi.json").read_text())
S = {k: set(v) for k, v in TEN.items()}
loi, thieu = [], set()


def co(ten_nhom, gt, noi):
    if gt not in S[ten_nhom]:
        thieu.add(f"{ten_nhom}: {gt}")
        loi.append(f"{noi}: {ten_nhom} '{gt}' không có trong thư viện")


def kiem_t(x, noi):
    for k in ("t", "het", "t_den", "t_thieu"):
        if k in x and not (isinstance(x[k], (int, float)) and 0 <= x[k] <= 1.6):
            loi.append(f"{noi}: {k}={x[k]} phải là tỷ lệ 0–1")


def vi_tri_dc(v, noi, so_nv):
    if isinstance(v, list):
        if len(v) != 2 or not all(isinstance(a, (int, float)) for a in v):
            loi.append(f"{noi}: vi_tri {v} phải là [x, y]")
        return
    if v in S["vi_tri_dao_cu"] or v == "ban":
        return
    m = re.fullmatch(r"(dau|tay)-(\d)", str(v))
    if m:
        if int(m.group(2)) >= so_nv:
            loi.append(f"{noi}: '{v}' trỏ tới nhân vật không tồn tại")
        return
    loi.append(f"{noi}: vi_tri đạo cụ '{v}' không hợp lệ")


def kiem_chuoi(canh, v):
    ch = v.get("chuoi") or {}
    N = ch.get("so_phan")
    if not isinstance(N, int) or not 3 <= N <= 5: loi.append(f"chuoi.so_phan={N} (cần 3–5)"); return
    phan = [c.get("phan") for c in canh]
    if any(not isinstance(p, int) for p in phan): loi.append("định dạng chuỗi: cảnh nào cũng cần trường 'phan' (số nguyên)"); return
    if phan != sorted(phan) or sorted(set(phan)) != list(range(1, N + 1)):
        loi.append(f"'phan' phải tăng dần, đủ 1..{N} (đang có {sorted(set(phan))})"); return
    nhom = {p: [c for c in canh if c["phan"] == p] for p in range(1, N + 1)}
    for p, cs in nhom.items():
        tu = sum(len(c.get("loi", "").split()) for c in cs)
        if not 250 <= tu <= 340: loi.append(f"phần {p}: {tu} từ (cần 250–340)")
    cat = ch.get("diem_cat", [])
    if cat != [nhom[p][-1]["id"] for p in range(1, N)]:
        loi.append(f"chuoi.diem_cat phải là id cảnh cuối phần 1..{N-1}: {[nhom[p][-1]['id'] for p in range(1, N)]}")
    for p in range(1, N):
        if nhom[p][-1].get("bo_cuc") == "ket": loi.append(f"phần {p}: cảnh cuối là 'ket' — phải kết ở điểm tò mò")
    nl = ch.get("nhac_lai", [])
    if nl != [nhom[p][0]["id"] for p in range(2, N + 1)]:
        loi.append(f"chuoi.nhac_lai phải là id cảnh đầu phần 2..{N}: {[nhom[p][0]['id'] for p in range(2, N + 1)]}")
    for p in range(2, N + 1):
        c0 = nhom[p][0]
        if len(c0.get("loi", "").split()) > 12: loi.append(f"{c0['id']}: câu nhắc lại đầu phần {p} quá 12 từ (cần dưới 3 giây)")
        if len(nhom[p]) < 2: loi.append(f"phần {p}: cần câu nhắc lại + hook mới")
    tz = ch.get("teaser", [])
    if len(tz) != N - 1 or any(not 2 <= len(str(x).split()) <= 8 for x in tz): loi.append(f"chuoi.teaser cần {N-1} câu, mỗi câu 2–8 từ")
    bp = ch.get("bia_phan", [])
    if len(bp) != N: loi.append(f"chuoi.bia_phan cần {N} mục")
    for i, b in enumerate(bp):
        if not 3 <= len(str(b.get("chu", "")).split()) <= 6: loi.append(f"bia_phan[{i}].chu cần 3–6 từ")
        elif b.get("tu_khoa") and b["tu_khoa"].lower() not in b["chu"].lower(): loi.append(f"bia_phan[{i}].tu_khoa không nằm trong chu")


def main():
    p_canh = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else GOC / "canh.json"
    p_video = pathlib.Path(sys.argv[2]) if len(sys.argv) > 2 else GOC / "video.json"
    canh = json.loads(p_canh.read_text())
    if p_video.exists():
        v = json.loads(p_video.read_text())
        if v.get("tong_mau") not in S["tong_mau"]:
            loi.append(f"video.json: tong_mau '{v.get('tong_mau')}' không hợp lệ")
        if not isinstance(v.get("seed"), int):
            loi.append("video.json: thiếu seed (số nguyên)")
        b = v.get("bia") or {}
        if not 3 <= len(str(b.get("chu", "")).split()) <= 6: loi.append("video.json: bia.chu cần 3–6 từ")
        elif b.get("tu_khoa") and b["tu_khoa"].lower() not in b["chu"].lower(): loi.append("video.json: bia.tu_khoa không nằm trong bia.chu")
        if not re.fullmatch(r"[a-z0-9-]+", str(v.get("chu_de", ""))):
            loi.append("video.json: chu_de phải ngắn, không dấu, gạch nối")
        ht = GOC / "du-an/hien-tai.json"
        if len(sys.argv) <= 1 and ht.exists():
            slug = json.loads(ht.read_text()).get("slug")
            if slug and v.get("chu_de") != slug:
                loi.append(f"video.json ở gốc là '{v.get('chu_de')}', không phải chủ đề đang làm '{slug}' (file ghi sai chỗ?)")
    else:
        loi.append("thiếu video.json")
    ids = set()
    for i, c in enumerate(canh):
        n = c.get("id", f"#{i}")
        if n in ids: loi.append(f"{n}: id trùng")
        ids.add(n)
        for k in ("id", "loi", "chu", "bo_cuc", "nen", "goc_may", "sfx"):
            if k not in c: loi.append(f"{n}: thiếu trường '{k}'")
        if sum(1 for x in c.get("nhan_vat") or [] if isinstance(x, dict) and x.get("vai") == "minh") > 1:
            loi.append(f"{n}: vai 'minh' (người dẫn chuyện) chỉ được một lần mỗi cảnh")
        if c.get("bo_cuc") == "so-sanh" and c.get("goc_may") == "can":
            loi.append(f"{n}: so-sanh không dùng goc_may 'can' (cắt mất hai bên khung) — dùng 'trung' hoặc 'toan'")
        if len(c.get("chu", "").split()) > 6: loi.append(f"{n}: chu quá 6 từ")
        if c.get("tu_khoa") and c["tu_khoa"].lower() not in c.get("chu", "").lower(): loi.append(f"{n}: tu_khoa không nằm trong chu")
        if len(c.get("loi", "").split()) > 25: loi.append(f"{n}: câu đọc quá 25 từ")
        if re.search(r"\d", c.get("loi", "")): loi.append(f"{n}: câu đọc còn chữ số")
        if "bo_cuc" in c: co("bo_cuc", c["bo_cuc"], n)
        if "nen" in c: co("nen", c["nen"], n)
        if "goc_may" in c: co("goc_may", c["goc_may"], n)
        if c.get("xep"): co("xep", c["xep"], n)
        nv = c.get("nhan_vat", [])
        for j, x in enumerate(nv):
            x = {"vai": x} if isinstance(x, str) else x
            q = f"{n}.nhan_vat[{j}]"
            co("vai", x.get("vai"), q)
            if "tu_the" in x: co("tu_the", x["tu_the"], q)
            if "bieu_cam" in x: co("bieu_cam", x["bieu_cam"], q)
            if isinstance(x.get("vi_tri"), str): co("vi_tri", x["vi_tri"], q)
            kiem_t(x, q)
            for d in x.get("doi", []):
                kiem_t(d, q + ".doi")
                if "tu_the" in d: co("tu_the", d["tu_the"], q + ".doi")
                if "bieu_cam" in d: co("bieu_cam", d["bieu_cam"], q + ".doi")
        for j, d in enumerate(c.get("dao_cu", [])):
            d = {"ten": d} if isinstance(d, str) else d
            q = f"{n}.dao_cu[{j}]"
            if not re.fullmatch(r"so-\d", d.get("ten", "")): co("dao_cu", d.get("ten"), q)
            if "vi_tri" in d: vi_tri_dc(d["vi_tri"], q, len(nv))
            if "den" in d: vi_tri_dc(d["den"], q, len(nv))
            if d.get("noi_dung"): co("noi_dung_bong", d["noi_dung"], q)
            kiem_t(d, q)
        m = c.get("man_hinh")
        if m:
            co("man_hinh", m.get("loai"), f"{n}.man_hinh")
            kiem_t(m, f"{n}.man_hinh")
            for x in m.get("tin", []): kiem_t(x, f"{n}.man_hinh.tin")
        if c.get("bo_cuc") == "dien-thoai" and not m: loi.append(f"{n}: bố cục dien-thoai cần man_hinh")
        for h in c.get("hieu_ung", []):
            h = {"ten": h} if isinstance(h, str) else h
            co("hieu_ung", h.get("ten"), f"{n}.hieu_ung")
            kiem_t(h, f"{n}.hieu_ung")
        sfx = c.get("sfx", [])
        if len(sfx) > 2: loi.append(f"{n}: quá 2 sfx")
        for s in sfx:
            co("sfx", s if isinstance(s, str) else s.get("ten"), f"{n}.sfx")
        for k in c.get("de_xuat_khoi", []):
            thieu.add(f"đề xuất: {k}")
    chuoi = p_video.exists() and v.get("dinh_dang") == "chuoi"
    if chuoi: kiem_chuoi(canh, v)
    # kịch bản khớp lời trong canh.json
    kb = GOC / "kich-ban.md"
    if kb.exists():
        # bỏ dòng tiêu đề "## Phần n" (kịch bản chuỗi)
        dong = " ".join(d for d in kb.read_text().split("\n---")[0].splitlines() if not d.lstrip().startswith("#")).split()
        if dong != " ".join(c.get("loi", "") for c in canh).split():
            loi.append("lời trong canh.json không khớp kich-ban.md")
        tu = len(dong)
        if not chuoi and not 270 <= tu <= 310: loi.append(f"kịch bản {tu} từ (cần 280–300)")
    if canh and canh[0].get("bo_cuc") != "hook-chu-to": loi.append("cảnh đầu phải là hook-chu-to")
    if canh and canh[-1].get("bo_cuc") != "ket": loi.append("cảnh cuối phải là ket")
    if loi:
        print(f"LỖI ({len(loi)}):"); [print(" -", x) for x in loi[:40]]
    if thieu:
        print("KHỐI THIẾU / ĐỀ XUẤT:"); [print(" -", x) for x in sorted(thieu)]
    if not loi:
        print(f"ĐẠT: {len(canh)} cảnh hợp lệ")
    sys.exit(1 if loi else 0)


if __name__ == "__main__":
    main()
