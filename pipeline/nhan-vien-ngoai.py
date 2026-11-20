#!/usr/bin/env python3
"""Chạy một nhân viên bằng AI ngoài làm BỘ NÃO CHÍNH (hiện: Gemini, gói miễn phí).

  python3 pipeline/nhan-vien-ngoai.py <id> "<việc anh Hải giao>" [--thu <thư mục>] [--model ...]

- Lời dặn lấy từ .claude/agents/<id>.md (giống bản Claude), công cụ theo dòng `tools:`:
  Read/Glob/Grep -> doc_tep, liet_ke · Write -> ghi_tep · Edit -> sua_tep. Bash/WebSearch chưa hỗ trợ.
- Chỉ đọc/ghi trong thư mục dự án; cấm .env, .git, node_modules, .venv; không ghi vào code
  (.claude/, pipeline/, render/, dieu-hanh/).
- --thu <dir>: chạy thử, mọi file ghi ra nằm trong <dir> (không đụng file thật).
- Mỗi lượt gọi Gemini tính vào hạn mức miễn phí của pipeline/goi-ai.py (logs/ai-ngoai.jsonl).
In ra báo cáo cuối của nhân viên. Mã thoát khác 0 nếu hỏng -> anh Hải giao lại cho bản Claude.
"""
import argparse, importlib.util, json, os, pathlib, subprocess, sys, time

GOC = pathlib.Path(__file__).resolve().parent.parent
_spec = importlib.util.spec_from_file_location("goi_ai", GOC / "pipeline" / "goi-ai.py")
AI = importlib.util.module_from_spec(_spec); _spec.loader.exec_module(AI)

CAM_DOC = {".env", ".git", "node_modules", ".venv", "vendor"}
CAM_GHI = {".claude", "pipeline", "render", "dieu-hanh", "docs"}
TOI_DA_DOC = 60000


THU = False


def su_kien(*a):
    if THU:
        return
    try:
        subprocess.run([sys.executable, str(GOC / "dieu-hanh" / "su_kien.py"), *a], timeout=10,
                       stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    except Exception:
        pass


def doc_agent(id_):
    t = (GOC / ".claude" / "agents" / f"{id_}.md").read_text(encoding="utf-8")
    _, fm, than = t.split("---", 2)
    meta = {}
    for d in fm.strip().splitlines():
        if ":" in d:
            k, v = d.split(":", 1); meta[k.strip()] = v.strip()
    return meta, than.strip()


class KhoTep:
    def __init__(self, thu=None):
        self.thu = pathlib.Path(thu).resolve() if thu else None
        self.da_ghi = []

    def _rel(self, p):
        p = str(p or "").strip().lstrip("/")
        q = (GOC / p).resolve()
        if q != GOC and GOC not in q.parents:
            raise ValueError("ngoài thư mục dự án")
        rel = q.relative_to(GOC)
        if rel.parts and (rel.parts[0] in CAM_DOC or rel.name.startswith(".env")):
            raise ValueError("tệp bị cấm")
        return rel

    def _that(self, rel):  # file để đọc: ưu tiên bản đã ghi trong hộp thử
        if self.thu and (self.thu / rel).exists():
            return self.thu / rel
        return GOC / rel

    def doc_tep(self, duong_dan):
        f = self._that(self._rel(duong_dan))
        if not f.is_file():
            return {"loi": f"không có tệp {duong_dan}"}
        t = f.read_text(encoding="utf-8", errors="replace")
        return {"noi_dung": t[:TOI_DA_DOC], **({"cat_bot": True} if len(t) > TOI_DA_DOC else {})}

    def liet_ke(self, mau):
        mau = str(mau or "*").lstrip("/")
        ds = sorted(str(p.relative_to(GOC)) for p in GOC.glob(mau)
                    if not (set(p.relative_to(GOC).parts) & CAM_DOC))
        return {"tep": ds[:200]}

    def _ghi(self, rel, t):
        if rel.parts and rel.parts[0] in CAM_GHI:
            raise ValueError("không được ghi vào code/cấu hình")
        f = (self.thu / rel) if self.thu else (GOC / rel)
        f.parent.mkdir(parents=True, exist_ok=True)
        f.write_text(t, encoding="utf-8")
        if str(rel) not in self.da_ghi:
            self.da_ghi.append(str(rel))

    def ghi_tep(self, duong_dan, noi_dung):
        self._ghi(self._rel(duong_dan), str(noi_dung)); return {"ok": True}

    def sua_tep(self, duong_dan, cu, moi):
        rel = self._rel(duong_dan); f = self._that(rel)
        if not f.is_file():
            return {"loi": f"không có tệp {duong_dan}"}
        t = f.read_text(encoding="utf-8"); n = t.count(cu)
        if n != 1:
            return {"loi": f"đoạn 'cu' xuất hiện {n} lần, cần đúng 1"}
        self._ghi(rel, t.replace(cu, moi)); return {"ok": True}


def khai_bao(tools):
    s = lambda d: {"type": "STRING", "description": d}
    ds = []
    if tools & {"Read", "Glob", "Grep"}:
        ds += [{"name": "doc_tep", "description": "Đọc một tệp văn bản trong dự án.",
                "parameters": {"type": "OBJECT", "properties": {"duong_dan": s("đường dẫn tương đối từ gốc dự án")}, "required": ["duong_dan"]}},
               {"name": "liet_ke", "description": "Liệt kê tệp theo mẫu glob, vd 'xuat-ban/*/dang-bai.md'.",
                "parameters": {"type": "OBJECT", "properties": {"mau": s("mẫu glob")}, "required": ["mau"]}}]
    if "Write" in tools:
        ds.append({"name": "ghi_tep", "description": "Tạo hoặc ghi đè cả tệp.",
                   "parameters": {"type": "OBJECT", "properties": {"duong_dan": s("đường dẫn tương đối"), "noi_dung": s("toàn bộ nội dung")}, "required": ["duong_dan", "noi_dung"]}})
    if "Edit" in tools:
        ds.append({"name": "sua_tep", "description": "Thay đúng một đoạn trong tệp (đoạn cũ phải xuất hiện đúng 1 lần).",
                   "parameters": {"type": "OBJECT", "properties": {"duong_dan": s("đường dẫn"), "cu": s("đoạn cũ"), "moi": s("đoạn mới")}, "required": ["duong_dan", "cu", "moi"]}})
    return ds


def goi_gemini(ch, model, than):
    cfg = AI.kiem_mien_phi(ch, "gemini", model, "nhan-vien")
    for lan in range(3):
        if lan == 2 and model != "gemini-flash-lite-latest":  # Flash quá tải 2 lần: lùi về Flash Lite
            model = "gemini-flash-lite-latest"; print("(Gemini Flash quá tải, chuyển sang Flash Lite)", file=sys.stderr)
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
        try:
            raw, _ = AI.gui(url, than, {"x-goog-api-key": os.environ[cfg["khoa"]]}, cho=150)
            AI.ghi("gemini", model, "nhan-vien", True)
            j = json.loads(raw); AI.ghi_phien_ban(model, j.get("modelVersion"))
            return j
        except RuntimeError as e:
            AI.ghi("gemini", model, "nhan-vien", False, str(e))
            if any(k in str(e) for k in ("HTTP 503", "HTTP 429", "HTTP 500", "quá giờ chờ")):
                time.sleep(6 * (lan + 1)); continue
            raise
    raise RuntimeError("Gemini bận, thử lại sau")


def main():
    AI.doc_env()
    ap = argparse.ArgumentParser()
    ap.add_argument("id"); ap.add_argument("viec")
    ap.add_argument("--thu"); ap.add_argument("--model", default=None)  # bản Flash đầy đủ hay quá tải ở gói miễn phí
    a = ap.parse_args()
    global THU
    THU = bool(a.thu)

    ch = json.load(open(AI.CAU_HINH, encoding="utf-8"))
    if not a.model:  # mô hình sếp chọn ở trang Skill & nhân sự
        try:
            doi = json.loads((GOC / "dieu-hanh" / "doi-ngu.json").read_text(encoding="utf-8"))
            a.model = next((x.get("mo_hinh_ngoai") for x in doi if x.get("id") == a.id), None)
        except Exception:
            pass
        a.model = a.model or "gemini-flash-lite-latest"
    meta, loi_dan = doc_agent(a.id)
    tools = {x.strip() for x in meta.get("tools", "").split(",") if x.strip()}
    thieu = tools & {"Bash", "WebSearch", "WebFetch"}
    if thieu:
        print(f"(lưu ý: bộ não Gemini chưa có công cụ {', '.join(sorted(thieu))}, nhân viên làm không có chúng)", file=sys.stderr)
    kho = KhoTep(a.thu)
    he = (loi_dan + "\n\n---\nEm đang chạy bằng Gemini trong hệ thống Tâm Cơ. Đường dẫn tệp tính từ gốc dự án. "
          "Dùng công cụ để đọc trước rồi mới viết; ghi kết quả bằng ghi_tep/sua_tep, không dán cả tệp vào câu trả lời. "
          "Viết tiếng Việt tự nhiên, có dấu. Làm xong thì trả lời đúng phần báo cáo theo lời dặn, không gọi thêm công cụ.")
    contents = [{"role": "user", "parts": [{"text": a.viec}]}]
    toi_da = max(8, int(meta.get("maxTurns") or 6) * 3)
    ten = {"dong-goi": "Vy"}.get(a.id, a.id)

    su_kien("trang-thai", a.id, "lam", a.viec[:80])
    try:
        for vong in range(toi_da):
            j = goi_gemini(ch, a.model, {"contents": contents, "systemInstruction": {"parts": [{"text": he}]},
                                          "tools": [{"functionDeclarations": khai_bao(tools)}]})
            c = j["candidates"][0].get("content") or {"role": "model", "parts": []}
            contents.append(c)
            goi = [p["functionCall"] for p in c.get("parts", []) if "functionCall" in p]
            if not goi:
                bao = "".join(p.get("text", "") for p in c.get("parts", [])).strip()
                break
            tra = []
            for g in goi:
                try:
                    kq = getattr(kho, g["name"])(**(g.get("args") or {}))
                except (AttributeError, TypeError, ValueError) as e:
                    kq = {"loi": str(e)}
                print(f"  · {g['name']} {json.dumps(g.get('args', {}), ensure_ascii=False)[:90]}", file=sys.stderr)
                tra.append({"functionResponse": {"name": g["name"], "response": kq, **({"id": g["id"]} if g.get("id") else {})}})
            contents.append({"role": "user", "parts": tra})
        else:
            raise RuntimeError(f"quá {toi_da} vòng chưa xong")
    except (RuntimeError, SystemExit) as e:
        su_kien("trang-thai", a.id, "loi", str(e)[:80])
        print(f"LỖI bộ não Gemini: {e}. Giao lại cho bản Claude.", file=sys.stderr)
        sys.exit(1)

    su_kien("trang-thai", a.id, "onl", "")
    if not a.thu:
        su_kien("tin", a.id, "truong-nhom", f"[Gemini] {bao}"[:500])
    print(f"[{ten} · bộ não Gemini {a.model} · {vong + 1} lượt · miễn phí]", file=sys.stderr)
    if kho.da_ghi:
        print("Đã ghi: " + ", ".join(kho.da_ghi) + (f" (trong {a.thu})" if a.thu else ""), file=sys.stderr)
    print(bao)


if __name__ == "__main__":
    main()
