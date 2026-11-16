#!/bin/bash
# Ghi sự kiện cho Phòng điều hành (0 token). Không in gì, luôn thoát 0.
python3 "${CLAUDE_PROJECT_DIR:-$(dirname "$0")/../..}/dieu-hanh/su_kien.py" hook >/dev/null 2>&1
exit 0
