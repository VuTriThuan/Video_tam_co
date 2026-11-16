#!/bin/bash
# PreToolUse (Agent|Task|SendMessage): chặn tin xã giao và lượt thứ 4. Không in ra stdout.
exec python3 "${CLAUDE_PROJECT_DIR:-$(dirname "$0")/../..}/.claude/hooks/chan_vong_lap.py"
