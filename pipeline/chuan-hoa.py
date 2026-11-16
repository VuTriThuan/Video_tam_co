"""Chuẩn hóa văn bản trước khi đọc: số → chữ, viết tắt → cách đọc, bỏ ký hiệu, áp từ điển tu-dien.toml."""
import re, tomllib, pathlib

GOC = pathlib.Path(__file__).resolve().parent.parent
TD = tomllib.loads((GOC / "tu-dien.toml").read_text())
SO = "không một hai ba bốn năm sáu bảy tám chín".split()


def _ba_so(n: int, day_du: bool) -> str:
    tr, ch, dv = n // 100, n // 10 % 10, n % 10
    out = []
    if day_du or tr:
        out += [SO[tr], "trăm"]
    if ch == 0:
        if dv and out:
            out.append("lẻ")
    elif ch == 1:
        out.append("mười")
    else:
        out += [SO[ch], "mươi"]
    if dv:
        if dv == 1 and ch > 1:
            out.append("mốt")
        elif dv == 5 and ch > 0:
            out.append("lăm")
        elif dv == 4 and ch > 1:
            out.append("tư")
        else:
            out.append(SO[dv])
    return " ".join(out)


def so_thanh_chu(n: int) -> str:
    if n == 0:
        return "không"
    nhom, don_vi = [], ["", "nghìn", "triệu", "tỷ"]
    while n:
        nhom.append(n % 1000); n //= 1000
    out = []
    for i in range(len(nhom) - 1, -1, -1):
        if nhom[i] == 0:
            continue
        out.append(_ba_so(nhom[i], day_du=i < len(nhom) - 1))
        if don_vi[i]:
            out.append(don_vi[i])
    return " ".join(out)


def chuan_hoa(text: str) -> str:
    t = text
    for k, v in TD.get("viet-tat", {}).items():
        if k == "%":
            t = t.replace("%", v)
        else:
            t = re.sub(rf"(?<!\w){re.escape(k)}(?!\w)", v, t, flags=re.I)
    t = re.sub(r"(?<=\d)\.(?=\d{3}\b)", "", t)  # dấu chấm phân cách nghìn
    t = re.sub(r"\d+", lambda m: so_thanh_chu(int(m.group())), t)
    for k, v in TD.get("doc", {}).items():
        t = re.sub(rf"(?<!\w){re.escape(k)}(?!\w)", v, t, flags=re.I)
    t = t.replace("…", ",").replace("...", ",")
    t = re.sub(r"[\"“”‘’'*_#()\[\]{}<>|/\\~^]", "", t)
    t = re.sub(r"\s*[-–—]\s*", ", ", t)
    t = re.sub(r",\s*([.!?])", r"\1", t)
    t = re.sub(r"\s+", " ", t).strip()
    if t and t[-1] not in ".!?":
        t += "."
    return t


if __name__ == "__main__":
    import sys
    print(chuan_hoa(" ".join(sys.argv[1:]) or "Có 3 dấu hiệu... sếp giao deadline 25% team \"quên\" tên mình."))
