#!/usr/bin/env python3
"""Chặn tin xã giao và vòng lặp khi Anh Hải gọi/nhắn agent con (PreToolUse: Agent|Task|SendMessage).

- Tin dưới 60 ký tự chỉ gồm chào / cảm ơn / ok / đã nhận → chặn (exit 2).
- Lượt thứ 4 với cùng agent cho cùng việc (cùng chủ đề + giai đoạn trong du-an/hien-tai.json) → chặn.
  PreToolUse chỉ KIỂM; lượt chỉ được ĐẾM ở PostToolUse (lượt giao bị lỗi/bị từ chối không tính).
  SendMessage tới agentId được quy về loại agent (bảng "_ten" trong luot.json, ghi khi Agent chạy xong).
Không in gì ra stdout. Lý do chặn in ra stderr (Claude đọc được).
"""
import json, sys, re, pathlib, unicodedata

GOC = pathlib.Path(__file__).resolve().parents[2]
XA_GIAO = {"chao", "xin", "cam", "on", "ok", "oke", "okay", "okie", "da", "nhan", "roi", "nhe", "nha", "a", "anh", "em", "chi", "ban",
           "tam", "biet", "thanks", "thank", "you", "hi", "hello", "bye", "nhieu", "lam", "tot", "duoc", "vang", "u", "uh", "dong", "y",
           "cac", "moi", "nguoi", "vat", "va", "hai", "tuan", "mai", "linh", "khoa", "vy", "duc", "good", "great", "tuyet", "voi", "hay", "qua"}


def khong_dau(s):
    s = unicodedata.normalize("NFD", s.lower().replace("đ", "d"))
    return "".join(c for c in s if unicodedata.category(c) != "Mn")


def chi_xa_giao(s):
    s = s.strip()
    if len(s) >= 60: return False
    tu = re.findall(r"[a-z]+", khong_dau(s))
    return bool(tu) and all(t in XA_GIAO for t in tu)


def main():
    try:
        d = json.loads(sys.stdin.read() or "{}")
    except Exception:
        return 0
    ten, vao = d.get("tool_name", ""), d.get("tool_input") or {}
    if ten in ("Agent", "Task"):
        ag, noi = vao.get("subagent_type") or "general-purpose", vao.get("prompt", "")
    elif ten == "SendMessage":
        ag, noi = str(vao.get("to", "")), vao.get("message", "")
        if not isinstance(noi, str): return 0
    else:
        return 0
    su_kien = d.get("hook_event_name", "PreToolUse")
    if su_kien == "PreToolUse" and chi_xa_giao(noi):
        print("Tin chỉ có chào/cảm ơn/ok — không gửi. Làm xong là dừng, không cần xác nhận.", file=sys.stderr)
        return 2
    try:
        ht = json.loads((GOC / "du-an/hien-tai.json").read_text())
    except Exception:
        ht = {"slug": "chung", "giai_doan": ""}
    p = GOC / "du-an" / ht.get("slug", "chung") / "luot.json"
    try:
        dem = json.loads(p.read_text())
    except Exception:
        dem = {}
    ten_ag = dem.setdefault("_ten", {})
    ag = ten_ag.get(ag, ag)
    khoa = f"{ag}|{ht.get('giai_doan', '')}"
    if su_kien == "PreToolUse":
        if dem.get(khoa, 0) >= 3:
            print("Đã 3 lượt, anh tự quyết hoặc hỏi sếp.", file=sys.stderr)
            return 2
        return 0
    # PostToolUse: lượt đã chạy thật → đếm; nhớ agentId → loại agent
    if ten in ("Agent", "Task"):
        m = re.search(r"agentId\W{1,4}(a[0-9a-f]{6,})", json.dumps(d.get("tool_response", ""), ensure_ascii=False))
        if m: ten_ag[m.group(1)] = ag
    dem[khoa] = dem.get(khoa, 0) + 1
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(dem, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    sys.exit(main())
