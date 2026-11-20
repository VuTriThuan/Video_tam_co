#!/usr/bin/env python3
"""Gọi AI ngoài (chỉ gói MIỄN PHÍ) cho đội Tâm Cơ. Chỉ dùng thư viện chuẩn của Python.

  python3 pipeline/goi-ai.py kiem                         # xem nhà nào dùng được, đã gọi bao nhiêu hôm nay
  python3 pipeline/goi-ai.py chu "câu hỏi" [--nha gemini] [--model ...] [--anh a.png] [--he "lời dặn hệ thống"]
  python3 pipeline/goi-ai.py anh "mô tả ảnh" --ra du-an/x/nen.png [--rong 1080 --cao 1920 --seed 7]

Luật miễn phí (cứng, không tắt được bằng tham số):
  - Chỉ gọi nhà + model có trong pipeline/ai-ngoai.json. OpenRouter bắt buộc model đuôi ':free'.
  - Mỗi nhà có gioi_han_ngay thấp hơn hạn mức miễn phí; chạm là dừng.
  - Không có đường gọi OpenAI/Anthropic trả tiền.
Mỗi lượt gọi ghi vào logs/ai-ngoai.jsonl.
"""
import argparse, base64, datetime, json, mimetypes, os, sys, urllib.error, urllib.parse, urllib.request

GOC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CAU_HINH = os.path.join(GOC, "pipeline", "ai-ngoai.json")
NHAT_KY = os.path.join(GOC, "logs", "ai-ngoai.jsonl")
PHIEN_BAN = os.path.join(GOC, "logs", "phien-ban-ai.json")  # tên "latest" -> bản thật lần gọi gần nhất (Phòng điều hành đọc)


def ghi_phien_ban(ten, that):
    if not that or that == ten:
        return
    try:
        d = json.load(open(PHIEN_BAN, encoding="utf-8"))
    except (OSError, ValueError):
        d = {}
    if d.get(ten, {}).get("ban") == that:
        return
    d[ten] = {"ban": that, "luc": datetime.datetime.now().isoformat(timespec="seconds")}
    os.makedirs(os.path.dirname(PHIEN_BAN), exist_ok=True)
    json.dump(d, open(PHIEN_BAN, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
UA = "TamCo-pipeline/1.0"


def ssl_ctx():
    import ssl
    try:
        import certifi
        return ssl.create_default_context(cafile=certifi.where())
    except ImportError:
        pass
    if os.path.exists("/etc/ssl/cert.pem"):
        return ssl.create_default_context(cafile="/etc/ssl/cert.pem")
    return ssl.create_default_context()


SSL = ssl_ctx()


def doc_env():
    p = os.path.join(GOC, ".env")
    if os.path.exists(p):
        for dong in open(p, encoding="utf-8"):
            dong = dong.strip()
            if dong and not dong.startswith("#") and "=" in dong:
                k, v = dong.split("=", 1)
                os.environ.setdefault(k.strip(), v.strip().strip('"').strip("'"))


def loi(msg, ma=1):
    print(f"LỖI: {msg}", file=sys.stderr)
    sys.exit(ma)


def hom_nay():
    return datetime.date.today().isoformat()


def dem_hom_nay():
    dem = {}
    if os.path.exists(NHAT_KY):
        for dong in open(NHAT_KY, encoding="utf-8"):
            try:
                d = json.loads(dong)
            except ValueError:
                continue
            if d.get("ngay") == hom_nay() and d.get("ok"):
                dem[d["nha"]] = dem.get(d["nha"], 0) + 1
    return dem


def ghi(nha, model, loai, ok, ghi_chu=""):
    os.makedirs(os.path.dirname(NHAT_KY), exist_ok=True)
    with open(NHAT_KY, "a", encoding="utf-8") as f:
        f.write(json.dumps({"ngay": hom_nay(), "gio": datetime.datetime.now().strftime("%H:%M:%S"),
                            "nha": nha, "model": model, "loai": loai, "ok": ok, "chi_phi": 0,
                            "ghi_chu": ghi_chu[:200]}, ensure_ascii=False) + "\n")


def gui(url, du_lieu=None, dau=None, cho=120):
    dau = dict(dau or {})
    dau.setdefault("User-Agent", UA)
    body = None
    if du_lieu is not None:
        body = json.dumps(du_lieu).encode()
        dau["Content-Type"] = "application/json"
    req = urllib.request.Request(url, data=body, headers=dau)
    try:
        with urllib.request.urlopen(req, timeout=cho, context=SSL) as r:
            return r.read(), r.headers.get("Content-Type", "")
    except urllib.error.HTTPError as e:
        raise RuntimeError(f"HTTP {e.code}: {e.read()[:300].decode('utf-8', 'replace')}")
    except urllib.error.URLError as e:
        raise RuntimeError(f"không kết nối được: {e.reason}")
    except (TimeoutError, OSError) as e:
        raise RuntimeError(f"quá giờ chờ: {e}")


# ---------- kiểm luật miễn phí ----------
def kiem_mien_phi(ch, nha, model, loai):
    if nha in ch.get("khong_ho_tro", {}):
        loi(ch["khong_ho_tro"][nha])
    if nha not in ch["nha"]:
        loi(f"nhà '{nha}' không có trong danh sách miễn phí ({', '.join(ch['nha'])})")
    cfg = ch["nha"][nha]
    if model not in cfg["models"]:
        loi(f"model '{model}' chưa được duyệt là miễn phí cho {nha}. Được dùng: {', '.join(cfg['models'])}")
    if nha == "openrouter" and not model.endswith(":free"):
        loi("OpenRouter chỉ được dùng model đuôi ':free'")
    if cfg.get("khoa") and not os.environ.get(cfg["khoa"]):
        loi(f"chưa có {cfg['khoa']} trong .env (lấy miễn phí ở {cfg.get('lay_khoa')})", 2)
    da = dem_hom_nay().get(nha, 0)
    if da >= cfg["gioi_han_ngay"]:
        loi(f"{nha} đã gọi {da}/{cfg['gioi_han_ngay']} lượt hôm nay, dừng để không vượt gói miễn phí", 3)
    return cfg


# ---------- gọi chữ ----------
def anh_b64(p):
    mime = mimetypes.guess_type(p)[0] or "image/png"
    return mime, base64.b64encode(open(p, "rb").read()).decode()


def chu_gemini(cfg, model, hoi, he, anh):
    parts = [{"text": hoi}]
    for p in anh:
        mime, b = anh_b64(p)
        parts.append({"inline_data": {"mime_type": mime, "data": b}})
    du = {"contents": [{"role": "user", "parts": parts}]}
    if he:
        du["system_instruction"] = {"parts": [{"text": he}]}
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
    raw, _ = gui(url, du, {"x-goog-api-key": os.environ[cfg["khoa"]]})
    j = json.loads(raw)
    ghi_phien_ban(model, j.get("modelVersion"))
    return "".join(p.get("text", "") for p in j["candidates"][0]["content"]["parts"])


def chu_kieu_openai(url, khoa, model, hoi, he):
    msgs = ([{"role": "system", "content": he}] if he else []) + [{"role": "user", "content": hoi}]
    raw, _ = gui(url, {"model": model, "messages": msgs}, {"Authorization": f"Bearer {khoa}"})
    return json.loads(raw)["choices"][0]["message"]["content"]


def chu_ollama(cfg, model, hoi, he):
    msgs = ([{"role": "system", "content": he}] if he else []) + [{"role": "user", "content": hoi}]
    raw, _ = gui(cfg["dia_chi"] + "/api/chat", {"model": model, "messages": msgs, "stream": False}, cho=600)
    return json.loads(raw)["message"]["content"]


def chu_pollinations(model, hoi, he):
    raw, _ = gui("https://text.pollinations.ai/openai", {"model": model, "messages":
                 ([{"role": "system", "content": he}] if he else []) + [{"role": "user", "content": hoi}]})
    try:
        return json.loads(raw)["choices"][0]["message"]["content"]
    except (ValueError, KeyError):
        return raw.decode("utf-8", "replace")


def goi_chu(ch, nha, model, hoi, he, anh):
    cfg = kiem_mien_phi(ch, nha, model, "chu")
    if anh and not cfg.get("doc_anh"):
        loi(f"{nha} không đọc ảnh miễn phí, dùng --nha gemini")
    if nha == "gemini":
        return chu_gemini(cfg, model, hoi, he, anh)
    if nha == "groq":
        return chu_kieu_openai("https://api.groq.com/openai/v1/chat/completions", os.environ[cfg["khoa"]], model, hoi, he)
    if nha == "openrouter":
        return chu_kieu_openai("https://openrouter.ai/api/v1/chat/completions", os.environ[cfg["khoa"]], model, hoi, he)
    if nha == "ollama":
        return chu_ollama(cfg, model, hoi, he)
    if nha == "pollinations":
        return chu_pollinations(model, hoi, he)
    loi(f"chưa viết cách gọi cho {nha}")


# ---------- gọi ảnh ----------
def goi_anh(ch, nha, model, mo_ta, ra, rong, cao, seed):
    kiem_mien_phi(ch, nha, model, "anh")
    if nha != "pollinations":
        loi("hiện chỉ Pollinations vẽ ảnh miễn phí")
    q = urllib.parse.urlencode({"width": rong, "height": cao, "model": model, "nologo": "true",
                                "seed": seed, "private": "true"})
    url = "https://image.pollinations.ai/prompt/" + urllib.parse.quote(mo_ta) + "?" + q
    raw, kieu = gui(url, cho=180)
    if not kieu.startswith("image/"):
        raise RuntimeError(f"không nhận được ảnh ({kieu}): {raw[:200]!r}")
    os.makedirs(os.path.dirname(os.path.abspath(ra)), exist_ok=True)
    open(ra, "wb").write(raw)
    return f"{ra} ({len(raw)//1024} KB)"


def lenh_kiem(ch, kieu_json=False):
    dem = dem_hom_nay()
    ds = []
    for ten, cfg in ch["nha"].items():
        if cfg.get("khoa"):
            dung = bool(os.environ.get(cfg["khoa"]))
            co = "có khóa" if dung else f"CHƯA có {cfg['khoa']}"
        elif ten == "ollama":
            try:
                gui(cfg["dia_chi"] + "/api/tags", cho=3); co, dung = "đang chạy", True
            except RuntimeError:
                co, dung = "chưa cài/chưa chạy", False
        else:
            co, dung = "không cần khóa", True
        ds.append({"id": ten, "ten": cfg["ten"], "dung_duoc": dung, "trang_thai": co, "da_goi": dem.get(ten, 0),
                   "gioi_han": cfg["gioi_han_ngay"], "model": cfg["mac_dinh"], "doc_anh": bool(cfg.get("doc_anh")),
                   "ve_anh": ten in ch.get("thu_tu_anh", []), "lay_khoa": cfg.get("lay_khoa", "")})
    if kieu_json:
        print(json.dumps({"ngay": hom_nay(), "ds": ds, "khong_ho_tro": ch.get("khong_ho_tro", {})}, ensure_ascii=False))
        return
    print("AI ngoài (chỉ gói miễn phí) — hôm nay", hom_nay())
    for d in ds:
        print(f"  {d['id']:13} {d['trang_thai']:28} {d['da_goi']}/{d['gioi_han']} lượt  · {d['model']}")
    for ten, ly_do in ch.get("khong_ho_tro", {}).items():
        print(f"  {ten:13} không nối: {ly_do}")


def chon_nha(ch, thu_tu):
    dem = dem_hom_nay()
    for ten in ch[thu_tu]:
        cfg = ch["nha"][ten]
        if cfg.get("khoa") and not os.environ.get(cfg["khoa"]):
            continue
        if dem.get(ten, 0) >= cfg["gioi_han_ngay"]:
            continue
        if ten == "ollama":
            try:
                gui(cfg["dia_chi"] + "/api/tags", cho=3)
            except RuntimeError:
                continue
        yield ten


def main():
    doc_env()
    ch = json.load(open(CAU_HINH, encoding="utf-8"))
    ap = argparse.ArgumentParser(description="Gọi AI ngoài miễn phí")
    ap.add_argument("lenh", choices=["kiem", "chu", "anh"])
    ap.add_argument("noi_dung", nargs="?", default="")
    ap.add_argument("--nha"); ap.add_argument("--model"); ap.add_argument("--he", default="")
    ap.add_argument("--anh", action="append", default=[])
    ap.add_argument("--ra"); ap.add_argument("--rong", type=int, default=1080)
    ap.add_argument("--cao", type=int, default=1920); ap.add_argument("--seed", type=int, default=0)
    ap.add_argument("--json", action="store_true", help="kiem: in JSON cho Phòng điều hành")
    a = ap.parse_args()

    if a.lenh == "kiem":
        return lenh_kiem(ch, a.json)
    if not a.noi_dung:
        loi("thiếu nội dung")
    if a.lenh == "anh" and not a.ra:
        loi("thiếu --ra <file.png>")

    ds = [a.nha] if a.nha else list(chon_nha(ch, "thu_tu_anh" if a.lenh == "anh" else "thu_tu_chu"))
    if a.anh and not a.nha:
        ds = [n for n in ds if ch["nha"][n].get("doc_anh")]
    if not ds:
        loi("không còn nhà miễn phí nào dùng được (thiếu khóa hoặc hết lượt hôm nay). Chạy: python3 pipeline/goi-ai.py kiem", 2)

    loi_cuoi = ""
    for nha in ds:
        cfg = ch["nha"].get(nha, {})
        model = a.model or (cfg.get("mac_dinh_anh") if a.lenh == "anh" else None) or cfg.get("mac_dinh", "")
        try:
            if a.lenh == "chu":
                kq = goi_chu(ch, nha, model, a.noi_dung, a.he, a.anh)
            else:
                kq = goi_anh(ch, nha, model, a.noi_dung, a.ra, a.rong, a.cao, a.seed)
        except RuntimeError as e:
            ghi(nha, model, a.lenh, False, str(e))
            loi_cuoi = f"{nha}: {e}"
            print(f"(thử {nha} không được: {e})", file=sys.stderr)
            if a.nha:
                break
            continue
        ghi(nha, model, a.lenh, True)
        print(f"[{nha} · {model} · miễn phí]", file=sys.stderr)
        print(kq)
        return
    loi(loi_cuoi or "không gọi được")


if __name__ == "__main__":
    main()
