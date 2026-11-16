"""Lấy số token của một phiên Claude Code từ file JSON của `npx ccusage@latest session --offline --json`.
Dùng: python3 pipeline/token.py <file.json> <session-id> [file-truoc.json]  (có file trước thì in phần chênh lệch)"""
import json, sys
K = ("inputTokens", "outputTokens", "cacheCreationTokens", "cacheReadTokens", "totalTokens", "totalCost")
def lay(f, sid):
    for s in json.load(open(f))["session"]:
        if s["period"].startswith(sid): return {k: s[k] for k in K}
    return {k: 0 for k in K}
a = lay(sys.argv[1], sys.argv[2])
if len(sys.argv) > 3:
    b = lay(sys.argv[3], sys.argv[2]); a = {k: round(a[k] - b[k], 4) for k in K}
print(json.dumps(a))
