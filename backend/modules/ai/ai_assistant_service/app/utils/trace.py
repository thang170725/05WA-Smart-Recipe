"""
Trace logger — in rõ từng bước Agent đang chạy đến đâu.

Dùng chung cho mọi node / edge để log thống nhất, dễ đọc trên terminal.
Bật bằng LOG_LEVEL=INFO hoặc DEBUG trong .env
"""

from __future__ import annotations

#
# ====== nơi setup logging ======
#
import logging
from backend.config.logging import setup_logging
setup_logging()
logger = logging.getLogger(__name__)

#
#
#
from typing import Any

#
#
#
def banner(title: str, **fields: Any) -> None:
    """In khung bước lớn — dễ nhìn khi debug pipeline."""
    extra = " | ".join(f"{k}={v!r}" for k, v in fields.items() if v is not None)
    line = f"{'=' * 40} {title} {'=' * 40}"
    logger.info(line)
    if extra:
        logger.info("  → %s", extra)

def log_step(msg: str, *args: Any) -> None:
    """
    In ra log 1 dòng chi tiết trong bước hiện tại.
    """
    logger.info("  • " + msg, *args)


def log_route(from_node: str, decision: str, to_node: str) -> None:
    """
    In ra quyết định điều hướng từ node nào sang node nào

    Input:
    - from_node: Node bắt đầu của việc điều hướng  (agent đang đứng ở node này)
    - decision: trả lời cho câu hỏi, hệ thông chọn nhánh nào
    - to_node: Node đích mà graph sẽ đi tới
    """
    logger.info("  ➜ ROUTE: %s --[%s]--> %s", from_node, decision, to_node)


def warn(msg: str, *args: Any) -> None:
    logger.warning("  ⚠ " + msg, *args)


def error(msg: str, *args: Any) -> None:
    logger.error("  ✖ " + msg, *args)
