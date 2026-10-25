"""
Phase 0 — quyết định thiết kế đã chốt (xem agent_requirements.md §13).

Đổi giá trị ở đây khi chốt lại; không hard-code rải rác trong node.
"""

from __future__ import annotations

# 1) Xác nhận thao tác ghi/xuất: một thẻ gộp, cho bỏ chọn từng việc
CONFIRM_MODE = "batch"  # batch | single

# 2) Bộ nhớ chat ngắn hạn
CHAT_HISTORY_WINDOW = 10  # số tin gần nhất đưa vào Intake

# 3) Chia miền specialist
DOMAINS = ("profile", "nutrition", "workout")
# Tool tệp (PDF/Excel) dùng chung, gắn khi task.kind == "export"

# 4) Checkpointer (Phase 3 mới bật interrupt thật)
# MemorySaver: dev / single-process. Production: SQLite hoặc custom MariaDB.
CHECKPOINTER_BACKEND = "memory"  # memory | sqlite | mariadb

# 5) Tin mới khi đang chờ xác nhận
# Giữ hành vi hiện tại: FE chặn gửi; tin mới không tự thành "Sửa".
PENDING_CONFIRM_NEW_MESSAGE = "block"

# 6) File xuất
FILE_TTL_HOURS = 24

# 7) Task độc lập: tuần tự trước (song song làm sau)
TASK_EXECUTION = "sequential"

# Giới hạn vòng lặp (agent_requirements §11)
MAX_TASKS_PER_TURN = 5
MAX_STEPS_PER_TASK = 4
MAX_REPLAN = 2
MAX_ASK = 3
MAX_STRUCTURED_PARSE_RETRIES = 2
MAX_TOOL_TECHNICAL_RETRIES = 1
READ_RESULT_LIMIT = 50
CONFIRM_TTL_MINUTES = 30

# ---------------------------------------------------------------------------
# Inventory tool hiện có (Phase 0) — phân loại đọc / ghi / xuất
# ---------------------------------------------------------------------------
# profile READ:  get_user_info, get_user_email, get_user_fullname, get_user_phone,
#                get_user_birth_date, get_user_address, ...
# profile WRITE: update_address, update_birth_date  (PENDING_ACTIONS cũ)
# nutrition READ: get_calories_in_week
# nutrition WRITE: (chưa)
# workout: (chưa)
# export: (chưa)
#
# Bridge Phase 1–2: nhánh intent=task vẫn đi retrieve → router → execute cũ.
# Phase 3+ chuyển sang prepare_*/commit_* + Confirm Gate.
