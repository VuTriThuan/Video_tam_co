#!/bin/bash
# Mở Phòng điều hành Tâm Cơ: chạy server nền (nếu chưa chạy) rồi mở trình duyệt.
cd "$(dirname "$0")"
if ! curl -s -m 2 http://localhost:4747/api/trang-thai >/dev/null; then
  nohup node dieu-hanh/server.mjs >> dieu-hanh/server.log 2>&1 &
  for i in 1 2 3 4 5 6 7 8 9 10; do sleep 0.5; curl -s -m 1 http://localhost:4747/api/trang-thai >/dev/null && break; done
fi
open http://localhost:4747
echo "Phòng điều hành: http://localhost:4747"
