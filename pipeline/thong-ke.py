#!/usr/bin/env python3
"""Thống kê token và chi phí của RIÊNG dự án Tâm Cơ (0 token: chỉ đọc nhật ký trên máy).

  python3 pipeline/thong-ke.py            # in JSON cho Phòng điều hành
  python3 pipeline/thong-ke.py --kiem     # in đối chiếu với chi phí Claude Code tự tính

Nguồn:
- ~/.claude/projects/<thư mục dự án>/*.jsonl (+ subagents/*.jsonl): token từng tin nhắn, mô hình, giờ,
  nhân viên (attributionAgent). Bỏ trùng theo message.id + requestId trên toàn dự án như ccusage
  (phiên tách nhánh chép lại tin cũ sang tệp mới).
- Bản ghi "cost-state" mỗi phiên: chi phí USD theo mô hình do Claude Code tính. Chi phí từng tin nhắn
  = token quy đổi × đơn giá suy ra từ phiên đó (đầu vào 1, đầu ra 5, đọc cache 0,1, ghi cache 5 phút 1,25, 1 giờ 2).
- dieu-hanh/su-kien.jsonl: chủ đề đang làm theo thời gian -> gắn tin nhắn vào chủ đề.
- logs/ai-ngoai.jsonl: lượt gọi AI ngoài miễn phí.
Bộ nhớ đệm theo từng tệp (logs/.thong-ke-dem.json) để lần sau chạy nhanh.
"""
import bisect, collections, datetime, glob, json, os, pathlib, sys

GOC = pathlib.Path(__file__).resolve().parent.parent
THU_MUC = pathlib.Path.home() / ".claude" / "projects" / ("-" + str(GOC).strip("/").replace("/", "-").replace("_", "-"))
DEM = GOC / "logs" / ".thong-ke-dem.json"
SLUG = sorted(p.name for p in (GOC / "du-an").iterdir() if p.is_dir()) if (GOC / "du-an").is_dir() else []
TRONG_SO = {"in": 1, "out": 5, "cr": 0.1, "cw5": 1.25, "cw1": 2}


def doc_tep(f):
    """-> (các dòng tin nhắn, chi phí phiên theo mô hình, giờ của tin cuối đã tính vào chi phí đó, chủ đề được nhắc tới)"""
    dong, thay, cost, moc, nhac = [], set(), None, 0, set()
    for l in open(f, encoding="utf-8", errors="replace"):
        nhac.update(x for x in SLUG if x not in nhac and x in l)
        if '"cost-state"' in l:
            try:
                cost = json.loads(l); moc = dong[-1][0] if dong else 0
            except ValueError:
                pass
            continue
        if '"assistant"' not in l or '"usage"' not in l:
            continue
        try:
            j = json.loads(l)
        except ValueError:
            continue
        if j.get("type") != "assistant":
            continue
        m = j.get("message") or {}
        u = m.get("usage") or {}
        k = (m.get("id"), j.get("requestId"))
        if k in thay or not m.get("model") or m.get("model") == "<synthetic>":
            continue
        thay.add(k)
        cc = u.get("cache_creation") or {}
        cw1 = cc.get("ephemeral_1h_input_tokens", 0)
        cw5 = cc.get("ephemeral_5m_input_tokens", u.get("cache_creation_input_tokens", 0) - cw1)
        try:
            ts = datetime.datetime.fromisoformat(j["timestamp"].replace("Z", "+00:00")).timestamp()
        except (KeyError, ValueError):
            continue
        dong.append([round(ts), m["model"], j.get("attributionAgent") or ("?" if j.get("isSidechain") else "truong-nhom"),
                     u.get("input_tokens", 0), u.get("output_tokens", 0), u.get("cache_read_input_tokens", 0), cw5, cw1,
                     j.get("sessionId") or pathlib.Path(f).stem, f"{k[0]}:{k[1]}"])
    chi_phi = {k: v.get("costUSD", 0) for k, v in (cost or {}).get("modelUsage", {}).items()}
    return dong, chi_phi, moc, sorted(nhac)


def nap():
    try:
        dem = json.loads(DEM.read_text(encoding="utf-8"))
    except (OSError, ValueError):
        dem = {}
    moi, tep = {}, sorted(glob.glob(str(THU_MUC / "*.jsonl")) + glob.glob(str(THU_MUC / "*" / "subagents" / "*.jsonl")))
    for f in tep:
        st = os.stat(f); khoa = f"{st.st_mtime_ns}:{st.st_size}"
        if dem.get(f, {}).get("k") == khoa and dem[f].get("v") == 4:
            moi[f] = dem[f]
        else:
            d, c, t, nh = doc_tep(f); moi[f] = {"k": khoa, "v": 4, "d": d, "c": c, "t": t, "s": nh}
    DEM.parent.mkdir(exist_ok=True)
    DEM.write_text(json.dumps(moi), encoding="utf-8")
    return moi


def dong_thoi_gian_chu_de():
    """[(ts, slug)] các sự kiện sản xuất theo thứ tự thời gian, từ nhật ký sự kiện."""
    ds = []
    try:
        for l in open(GOC / "dieu-hanh" / "su-kien.jsonl", encoding="utf-8"):
            try:
                j = json.loads(l)
            except ValueError:
                continue
            # chỉ lấy sự kiện sản xuất thật: tiến độ máy, tin giữa trưởng nhóm và nhân viên, nhân viên bắt đầu làm.
            # Tin giữa sếp và trưởng nhóm bị hook ghi theo chủ đề hiện tại kể cả khi đang làm việc khác, nên bỏ.
            sx = (j.get("loai") == "tien-do"
                  or (j.get("loai") == "tin" and "dai-ca" not in (j.get("tu"), j.get("den")))
                  or (j.get("loai") == "trang-thai" and j.get("trang_thai") == "lam" and j.get("id") not in ("truong-nhom", None)))
            if j.get("slug") and j.get("ts") and sx:
                ds.append((j["ts"], j["slug"]))
    except OSError:
        pass
    ds.sort()
    return ds


def main():
    du = nap()
    # phiên tách nhánh chép lại tin cũ sang tệp mới: bỏ trùng trên toàn dự án (như ccusage).
    # Giữ bản ở tệp dài hơn; tệp nhánh chỉ là bản chép một phần thì hết dòng -> chi phí chép theo cũng bị bỏ.
    thay = set()
    for f in sorted(du, key=lambda f: ("/subagents/" in f, -len(du[f]["d"]), f)):
        giu = []
        for r in du[f]["d"]:
            if r[9] not in thay:
                thay.add(r[9]); giu.append(r)
        du[f]["d"] = giu
    # đơn giá theo phiên × mô hình (USD / token quy đổi)
    w = lambda r: r[3] * TRONG_SO["in"] + r[4] * TRONG_SO["out"] + r[5] * TRONG_SO["cr"] + r[6] * TRONG_SO["cw5"] + r[7] * TRONG_SO["cw1"]
    # Claude Code chỉ ghi chi phí (cost-state) ở vài mốc; phiên đang chạy có thể ghi từ giữa phiên.
    # Đơn giá phiên = chi phí / token tới mốc đó; tin sau mốc tính tiếp theo đơn giá ấy.
    tong_w, chi, moc = collections.defaultdict(float), {}, {}
    for f, v in du.items():
        if v["c"] and "/subagents/" not in f:
            moc[pathlib.Path(f).stem] = v.get("t") or 0
            for mo, usd in v["c"].items():
                chi[(pathlib.Path(f).stem, mo)] = usd
    sau_moc = lambda r: r[8] in moc and r[0] > moc[r[8]]
    for f, v in du.items():
        for r in v["d"]:
            if not sau_moc(r):
                tong_w[(r[8], r[1])] += w(r)
    bo_nhanh = sum(v for k, v in chi.items() if not tong_w.get(k))  # chi phí chép theo tệp nhánh
    gia = {k: chi[k] / tong_w[k] for k in chi if tong_w.get(k)}
    gia_tb = collections.defaultdict(list)
    for (s, mo), g in gia.items():
        gia_tb[mo].append(g)
    gia_tb = {mo: sum(v) / len(v) for mo, v in gia_tb.items()}

    if "--kiem" in sys.argv:
        tinh = collections.defaultdict(float)
        for f, v in du.items():
            for r in v["d"]:
                tinh[r[1]] += w(r) * gia.get((r[8], r[1]), gia_tb.get(r[1], 0))
        print("Chi phí Claude Code tự tính (tổng các phiên):", round(sum(chi.values()), 2), "USD")
        print("  trong đó chép trùng ở phiên tách nhánh:   ", round(bo_nhanh, 2), "USD ->", round(sum(chi.values()) - bo_nhanh, 2), "USD")
        print("Chi phí em phân bổ lại từ token:           ", round(sum(tinh.values()), 2), "USD")
        them = sum(w(r) * gia.get((r[8], r[1]), gia_tb.get(r[1], 0)) for v in du.values() for r in v["d"] if sau_moc(r) or r[8] not in moc)
        print("  trong đó phần sau mốc cost-state / phiên chưa có cost-state (ước tính):", round(them, 2), "USD")
        print("Phiên có cost-state:", len({s for s, _ in chi}), "/ tệp chính:", sum(1 for f in du if "/subagents/" not in f))
        return

    # Gắn lượt vào chủ đề: lượt nằm trong khoảng chủ đề đang sản xuất (sự kiện sản xuất cách nhau ≤ 1 giờ,
    # nới 10 phút hai đầu) VÀ thuộc phiên có giao việc cho nhân viên trong khoảng đó (phiên sản xuất).
    # Phiên khác chạy song song (sửa hệ thống, làm web) tính là việc ngoài chủ đề.
    doan = collections.defaultdict(list)
    for ts, sl in dong_thoi_gian_chu_de():
        L = doan[sl]
        if L and ts - L[-1][1] <= 3600:
            L[-1][1] = ts
        else:
            L.append([ts, ts])
    DOAN = sorted([a - 600, b + 600, sl, set()] for sl, L in doan.items() for a, b in L)
    for v in du.values():
        for r in v["d"]:
            if r[2] != "truong-nhom":
                for d in DOAN:
                    if d[0] <= r[0] <= d[1]:
                        d[3].add(r[8])
    def chu_de(ts, s):
        ung = [(d[0], d[2]) for d in DOAN if d[0] <= ts <= d[1] and s in d[3]]
        return max(ung)[1] if ung else "khac"

    T = lambda: {"in": 0, "out": 0, "cr": 0, "cw": 0, "tong": 0, "usd": 0.0, "tin": 0}
    tong, ngay, mo_hinh, nguoi, cd, phien = T(), collections.defaultdict(T), collections.defaultdict(T), collections.defaultdict(T), collections.defaultdict(T), collections.defaultdict(T)
    ngay_mh = collections.defaultdict(lambda: collections.defaultdict(float))
    phien_luc = {}
    for f, v in du.items():
        for r in v["d"]:
            usd = w(r) * gia.get((r[8], r[1]), gia_tb.get(r[1], 0))
            n = datetime.datetime.fromtimestamp(r[0]).strftime("%Y-%m-%d")
            for o in (tong, ngay[n], mo_hinh[r[1]], nguoi[r[2]], cd[chu_de(r[0], r[8])], phien[r[8]]):
                o["in"] += r[3]; o["out"] += r[4]; o["cr"] += r[5]; o["cw"] += r[6] + r[7]
                o["tong"] += r[3] + r[4] + r[5] + r[6] + r[7]; o["usd"] += usd; o["tin"] += 1
            ngay_mh[n][r[1]] += usd
            a, b = phien_luc.get(r[8], (r[0], r[0])); phien_luc[r[8]] = (min(a, r[0]), max(b, r[0]))

    def ten_phien(s):
        try:
            t = json.loads((THU_MUC / s / "custom-title.json").read_text(encoding="utf-8"))
            if t.get("customTitle") or t.get("title"):
                return t.get("customTitle") or t.get("title")
        except (OSError, ValueError):
            pass
        cuoi = ""  # không có tên đặt riêng: lấy lệnh gần nhất của sếp trong phiên
        try:
            for l in open(THU_MUC / f"{s}.jsonl", encoding="utf-8", errors="replace"):
                if '"last-prompt"' in l:
                    try:
                        cuoi = json.loads(l).get("lastPrompt") or cuoi
                    except ValueError:
                        pass
        except OSError:
            pass
        return " ".join(cuoi.split())[:90]

    # AI ngoài miễn phí
    gn = collections.defaultdict(lambda: collections.defaultdict(lambda: {"ok": 0, "loi": 0}))
    try:
        for l in open(GOC / "logs" / "ai-ngoai.jsonl", encoding="utf-8"):
            try:
                j = json.loads(l)
            except ValueError:
                continue
            gn[j["ngay"]][j["nha"]]["ok" if j.get("ok") else "loi"] += 1
    except OSError:
        pass

    lam = lambda d: {k: round(v, 4) if k == "usd" else v for k, v in d.items()}
    print(json.dumps({
        "luc": datetime.datetime.now().isoformat(timespec="seconds"),
        "nguon": str(THU_MUC), "so_phien": len(phien), "tong": lam(tong), "bo_trung_usd": round(bo_nhanh, 4),
        "theo_ngay": [{"ngay": k, **lam(v), "theo_mo_hinh": {m: round(u, 4) for m, u in ngay_mh[k].items()}} for k, v in sorted(ngay.items())],
        "theo_mo_hinh": [{"ma": k, **lam(v)} for k, v in sorted(mo_hinh.items(), key=lambda x: -x[1]["usd"])],
        "theo_nhan_vien": [{"id": k, **lam(v)} for k, v in sorted(nguoi.items(), key=lambda x: -x[1]["usd"])],
        "theo_chu_de": [{"slug": k, **lam(v)} for k, v in sorted(cd.items(), key=lambda x: -x[1]["usd"])],
        "phien": [{"id": k, "ten": ten_phien(k), "bd": phien_luc[k][0], "kt": phien_luc[k][1], **lam(v)}
                  for k, v in sorted(phien.items(), key=lambda x: -phien_luc[x[0]][1])][:30],
        "ai_ngoai": [{"ngay": k, "nha": {n: dict(c) for n, c in v.items()}} for k, v in sorted(gn.items())],
    }, ensure_ascii=False))


if __name__ == "__main__":
    main()
