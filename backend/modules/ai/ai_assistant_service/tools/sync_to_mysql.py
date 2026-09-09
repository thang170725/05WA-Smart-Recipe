"""
Đồng bộ catalog Tools → bảng `ai_tool_registry` (MariaDB) kèm embedding.

Chạy thủ công khi thêm/sửa/xóa tool:
    python -m backend.modules.ai.ai_assistant_service.tools.sync_to_mysql
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
import asyncio

from sqlalchemy import select

from backend.config.database import SessionLocal
from backend.modules.ai.ai_assistant_service.app.models import AIToolRegistryModel
from backend.modules.ai.ai_assistant_service.tools.registry import ALL_TOOLS
from backend.modules.ai.ai_assistant_service.tools.rag import embed_text

async def sync_tools_to_mysql() -> None:
    """
    Duyệt ALL_TOOLS → tạo Document (name + description) → embed → upsert MariaDB.

    Embedding dùng task_type=RETRIEVAL_DOCUMENT để khớp với query RETRIEVAL_QUERY lúc RAG.
    Đồng thời xóa các tool cũ trong DB không còn trong registry (tránh RAG trả tên lỗi thời).
    """
    async with SessionLocal() as db:
        logger.info(
            "[ToolSync] Bắt đầu đồng bộ %d tools vào MariaDB...", len(ALL_TOOLS)
        )
        try:
            current_names: set[str] = set()

            for tool in ALL_TOOLS:
                tool_name = tool.name
                current_names.add(tool_name)
                tool_desc = (tool.description or "").strip() or "Không có mô tả."

                # 1. tổng hợp bản mô tả cho từng tool
                text_to_embed = (
                    f"Chức năng hệ thống: {tool_name}. "
                    f"Chi tiết công dụng: {tool_desc}"
                )
                logger.debug(f"{tool.name}:\n{text_to_embed}")

                # 2. embedding
                vector = embed_text(text_to_embed, task_type="RETRIEVAL_DOCUMENT")
                logger.debug(f"{tool.name} shape:\n{len(vector)}")

                result = await db.execute(
                    select(AIToolRegistryModel).where(
                        AIToolRegistryModel.name == tool_name
                    )
                )
                existing = result.scalar_one_or_none()

                if existing:
                    existing.description = tool_desc
                    existing.embedding = vector
                    logger.info("[ToolSync] Cập nhật embedding: %s", tool_name)
                else:
                    db.add(
                        AIToolRegistryModel(
                            name=tool_name,
                            description=tool_desc,
                            embedding=vector,
                        )
                    )
                    logger.info("[ToolSync] Thêm mới tool: %s", tool_name)

            # Xóa tool registry lỗi thời (tên Decision Tree cũ như GetInfoUserInput...)
            all_rows = (await db.execute(select(AIToolRegistryModel))).scalars().all()
            for row in all_rows:
                if row.name not in current_names:
                    logger.info("[ToolSync] Xóa tool cũ khỏi DB: %s", row.name)
                    await db.delete(row)

            await db.commit()
            logger.info("[ToolSync] Hoàn tất đồng bộ tools.")
        except Exception:
            await db.rollback()
            logger.exception("[ToolSync] Lỗi khi đồng bộ.")
            raise

if __name__ == "__main__":
    asyncio.run(sync_tools_to_mysql())
