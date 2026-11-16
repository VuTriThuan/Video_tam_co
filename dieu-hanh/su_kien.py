#!/usr/bin/env python3
"""Ghi sự kiện cho Phòng điều hành (0 token). Không in gì ra stdout.

Mọi sự kiện nối vào dieu-hanh/su-kien.jsonl (server đọc đuôi file rồi đẩy SSE);
tin nhắn còn ghi thêm vào du-an/<slug>/ban-tin.jsonl.

Dùng:
  su_kien.py hook                          (hook Claude Code: đọc JSON từ stdin)
  su_kien.py bat-dau <slug> [giai_doan]    đặt chủ đề đang làm (du-an/hien-tai.json)
  su_kien.py giai-doan <ten>               đổi giai đoạn (kich-ban, giong, mau, day-du, dong-goi, nhap, sua-1…)
  su_kien.py tin <tu> <den> <noi>
  su_kien.py tien-do <phan_tram> <viec>
  su_kien.py trang-thai <id> <lam|onl|off|cho|loi> [viec]
"""
import json, sys, time, pathlib, os

GOC = pathlib.Path(__file__).resolve().parent.parent
LOG = GOC / "dieu-hanh" / "su-kien.jsonl"
HIEN_TAI = GOC / "du-an" / "hien-tai.json"
NHO = GOC / "dieu-hanh" / ".nho-agent.json"  # agent_id -> agent_type, việc đang giao
MODEL = {"truong-nhom": "opus · medium", "len-chu-de": "opus · medium", "bien-kich": "opus · high", "kiem-duyet": "opus · medium",
         "hoa-si": "opus · medium", "dong-goi": "opus · medium", "phan-tich": "opus · high", "may-dung": "script · 0 token"}
DOI = [k for k in MODEL if k not in ("truong-nhom", "may-dung")]
WEB = bool(os.environ.get("TAMCO_WEB"))


def hien_tai():
    try:
        return json.loads(HIEN_TAI.read_text())
    except Exception:
        return {"slug": "chung", "giai_doan": ""}


def ghi(ev):
    ev = {"ts": round(time.time(), 3), "slug": hien_tai().get("slug", "chung"), **ev}
    LOG.parent.mkdir(parents=True, exist_ok=True)
    with LOG.open("a", encoding="utf-8") as f:
        f.write(json.dumps(ev, ensure_ascii=False) + "\n")
    if ev["loai"] == "tin":
        p = GOC / "du-an" / ev["slug"] / "ban-tin.jsonl"
        p.parent.mkdir(parents=True, exist_ok=True)
        with p.open("a", encoding="utf-8") as f:
            f.write(json.dumps(ev, ensure_ascii=False) + "\n")


def tt(id_, trang_thai, viec=None):
    ev = {"loai": "trang-thai", "id": id_, "trang_thai": trang_thai, "model": MODEL.get(id_, "")}
    if viec is not None: ev["viec"] = viec[:120]
    ghi(ev)


def tin(tu, den, noi):
    ghi({"loai": "tin", "tu": tu, "den": den, "noi": noi})


def nho():
    try:
        return json.loads(NHO.read_text())
    except Exception:
        return {}


def luu_nho(d):
    NHO.write_text(json.dumps(d, ensure_ascii=False))


def chu_cua(resp):
    """Lấy phần chữ trong kết quả tool Agent (nhiều dạng)."""
    if isinstance(resp, str): return resp
    if isinstance(resp, list): return "\n".join(chu_cua(x) for x in resp if x)
    if isinstance(resp, dict):
        for k in ("content", "result", "text", "output", "message"):
            if k in resp: return chu_cua(resp[k])
    return ""


def bo_duoi(s):
    # bỏ dòng kỹ thuật "agentId: …" hoặc thẻ usage ở cuối kết quả
    ra = [d for d in s.strip().splitlines() if not d.startswith(("agentId:", "<usage>", "</usage>", "total_tokens", "tool_uses", "duration_ms"))]
    return "\n".join(ra).strip()


def bao_cao_tu_transcript(duong):
    """Lấy báo cáo cuối của agent con: SubagentHandback(message) hoặc đoạn chữ assistant cuối."""
    try: dong = pathlib.Path(duong).read_text().splitlines()
    except Exception: return ""
    for l in reversed(dong):
        try: m = json.loads(l).get("message") or {}
        except Exception: continue
        if m.get("role") != "assistant" or not isinstance(m.get("content"), list): continue
        for c in m["content"]:
            if c.get("type") == "tool_use" and c.get("name") == "SubagentHandback":
                return chu_cua((c.get("input") or {}).get("message", ""))
        chu = "\n".join(c.get("text", "") for c in m["content"] if c.get("type") == "text").strip()
        if chu: return chu
    return ""


def hook():
    d = json.loads(sys.stdin.read() or "{}")
    e = d.get("hook_event_name", "")
    slug = hien_tai().get("slug", "chung")
    if e == "SessionStart":
        tt("truong-nhom", "onl", ""); tt("may-dung", "onl", "")
        if d.get("source") in ("startup", "clear"):
            for k in DOI: tt(k, "onl", "")  # phiên mới: chưa ai nhận việc
    elif e == "UserPromptSubmit":
        tt("truong-nhom", "lam", "Đọc yêu cầu của đại ca")
        # phiên mở từ web (TAMCO_WEB) thì máy chủ đã tự ghi lời đại ca và câu trả lời
        if not WEB and (d.get("prompt") or "").strip(): tin("dai-ca", "truong-nhom", d["prompt"].strip()[:4000])
    elif e == "Stop":
        tt("truong-nhom", "cho", "Chờ đại ca")
        if not WEB:
            bc = bo_duoi(chu_cua(d.get("last_assistant_message") or bao_cao_tu_transcript(d.get("transcript_path", ""))))
            if bc: tin("truong-nhom", "dai-ca", bc)
    elif e == "Notification":
        tt("truong-nhom", "cho", (d.get("message") or "Chờ đại ca duyệt")[:120])
    elif e == "SessionEnd":
        # phiên mở từ web kết thúc sau mỗi lệnh nhưng đội vẫn trực: không cho mọi người "vắng"
        if not WEB:
            for k in MODEL: tt(k, "off", "")
    elif e in ("PreToolUse", "PostToolUse"):
        ten, vao = d.get("tool_name", ""), d.get("tool_input") or {}
        if ten in ("Agent", "Task"):
            ag = vao.get("subagent_type") or "general-purpose"
            if ag not in MODEL: return
            if e == "PreToolUse":
                m = nho(); m.setdefault("viec", {})[ag] = vao.get("description", ""); m.setdefault("da_bao", {})[ag] = False; luu_nho(m)
                tt("truong-nhom", "lam", f"Giao việc · {slug}")
                tt(ag, "onl", "")  # đứng dậy ở góc nghỉ, SubagentStart sẽ đưa về bàn
                tin("truong-nhom", ag, vao.get("prompt", ""))
                # SubagentStart sẽ đưa về bàn; dự phòng: 3 giây sau tự chuyển "đang làm" (để kịp thấy đi từ góc nghỉ về bàn)
                import subprocess
                subprocess.Popen([sys.executable, __file__, "trang-thai-neu", ag, "onl", "lam", vao.get("description", "")],
                                 stdin=subprocess.DEVNULL, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, start_new_session=True)
            else:
                tho = chu_cua(d.get("tool_response")) or json.dumps(d.get("tool_response"), ensure_ascii=False)
                if "async" in tho.lower() and "launch" in tho.lower():
                    # agent chạy nền: báo cáo và trạng thái sẽ đến ở SubagentStop
                    tt("truong-nhom", "lam", f"Điều phối · {slug}"); return
                bc = bo_duoi(chu_cua(d.get("tool_response")))
                if bc and not nho().get("da_bao", {}).get(ag): tin(ag, "truong-nhom", bc)
                tt(ag, "onl", ""); tt("truong-nhom", "lam", f"Điều phối · {slug}")
        elif ten == "SendMessage":
            den = vao.get("to", "")
            m = nho(); den = m.get("id", {}).get(den, den)
            if e == "PreToolUse" and den in MODEL:
                tin("truong-nhom", den, vao.get("message", "") if isinstance(vao.get("message"), str) else json.dumps(vao.get("message"), ensure_ascii=False))
    elif e == "SubagentStart":
        ag, aid = d.get("agent_type", ""), d.get("agent_id", "")
        if ag in MODEL:
            m = nho(); m.setdefault("id", {})[aid] = ag; luu_nho(m)
            tt(ag, "lam", m.get("viec", {}).get(ag, ""))
    elif e == "SubagentStop":
        ag = d.get("agent_type") or nho().get("id", {}).get(d.get("agent_id", ""), "")
        if ag in MODEL:
            bc = d.get("last_assistant_message") or bao_cao_tu_transcript(d.get("agent_transcript_path", ""))
            bc = bo_duoi(chu_cua(bc))
            m = nho()
            if bc and not m.get("da_bao", {}).get(ag):
                tin(ag, "truong-nhom", bc); m.setdefault("da_bao", {})[ag] = True; luu_nho(m)
            tt(ag, "onl", "")


def main():
    a = sys.argv[1:]
    if not a: return
    lenh = a[0]
    if lenh == "hook":
        try: hook()
        except Exception as ex:  # hook không bao giờ được làm hỏng phiên
            (GOC / "dieu-hanh" / "loi-hook.log").open("a").write(f"{time.ctime()} {ex!r}\n")
    elif lenh == "bat-dau":
        HIEN_TAI.parent.mkdir(parents=True, exist_ok=True)
        HIEN_TAI.write_text(json.dumps({"slug": a[1], "giai_doan": a[2] if len(a) > 2 else "kich-ban", "tu": time.strftime("%Y-%m-%d %H:%M")}, ensure_ascii=False))
        (GOC / "du-an" / a[1]).mkdir(parents=True, exist_ok=True)
    elif lenh == "giai-doan":
        h = hien_tai(); h["giai_doan"] = a[1]; HIEN_TAI.parent.mkdir(parents=True, exist_ok=True); HIEN_TAI.write_text(json.dumps(h, ensure_ascii=False))
    elif lenh == "tin":
        tin(a[1], a[2], " ".join(a[3:]))
    elif lenh == "tien-do":
        ghi({"loai": "tien-do", "id": "may-dung", "phan_tram": int(float(a[1])), "viec": " ".join(a[2:])})
    elif lenh == "trang-thai-neu":  # trang-thai-neu <id> <nếu đang> <thành> <việc>: chờ 3 giây, chỉ đổi khi chưa ai đổi
        time.sleep(3)
        cuoi = None
        try:
            with LOG.open("rb") as f:
                f.seek(max(0, LOG.stat().st_size - 200_000))
                for d in f.read().decode("utf-8", "ignore").splitlines():
                    try:
                        ev = json.loads(d)
                        if ev.get("loai") == "trang-thai" and ev.get("id") == a[1]: cuoi = ev["trang_thai"]
                    except Exception: pass
        except Exception: pass
        if cuoi == a[2]: tt(a[1], a[3], " ".join(a[4:]))
    elif lenh == "trang-thai":
        tt(a[1], a[2], " ".join(a[3:]) if len(a) > 3 else None)


if __name__ == "__main__":
    main()
