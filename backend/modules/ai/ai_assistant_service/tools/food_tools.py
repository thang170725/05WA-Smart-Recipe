"""
Food tools placeholder.

Domain món ăn / thực đơn sẽ đăng ký @tool tại đây rồi append vào ALL_TOOLS
trong `tools/registry.py`. Hiện để trống để tránh trùng lặp với user_tools.
"""
from __future__ import annotations

#
#
#
import logging
from backend.config.logging import setup_logging
setup_logging()
logger = logging.getLogger(__name__)

#
#
#
from typing import Literal, Optional

from langchain_core.tools import tool
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from backend.modules.meals.services import get_total_calories_week_service

#
#
#
class GetCaloriesInWeek(BaseModel):
    """không cần tham số - lấy tổng lượng calo đã được tính toán từ thực đơn đồ ăn mà người dùng đã nhập vào trong vòng 1 tuần từ thứ 2 đến chủ nhật"""

#
# ======= LANGCHAIN TOOL ======
#
@tool("get_calories_in_week", args_schema=GetCaloriesInWeek)
def get_calories_in_week() -> str:
    """
    Lấy tổng cộng lượng calo đã được tính toán từ lượng đồ ăn trong thực đơn một tuần của user tính từ thứ 2 đến chủ nhật

    Dùng khi người dùng muốn:
    - Xem lượng calo mình đã nạp vào trong một tuần qua
    - xem lượng thức ăn trong một tuần qua quy đổi là ra calo là bao nhiêu

    Thông tin có thể bao gồm 1 số duy nhất hoặc 1 dict chứa cặp key value
    """
    raise NotImplementedError("Executed via ToolExecutor")
#
# ====== EXECUTION =======
#
async def _exec_get_calories_in_week(db: AsyncSession, user_id: int, week_start, **_kwargs):
    data = await get_total_calories_week_service(db, user_id, week_start)
    if not data:
        return {
            "status": "error",
            "message": "không thể tính lượng lượng calo trong tuần đó"
        }
    
    return {
        "status": "success",
        "data": data
    }

#
# ====== MAPPING =======
#
FOOD_TOOL_EXECUTORS = {
    "get_calories_in_week": _exec_get_calories_in_week
}
FOOD_TOOLS = [
    get_calories_in_week
]