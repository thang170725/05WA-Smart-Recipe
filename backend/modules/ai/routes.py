# 
# ===== nơi import thư viện ======= 
# 
from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
import json
from sqlalchemy.ext.asyncio import AsyncSession

from backend.modules.user.models import User
from backend.config.database import get_db, SessionLocal
from backend.modules.ai.ai_assistant_service.app.ai import AIAssistantService, PENDING_ACTIONS
from backend.modules.ai.ai_assistant_service.app.schemas import InputAiAssistantSchema, ConfirmSchema
from backend.modules.account.dependencies import get_current_user

router = APIRouter(prefix="/ai", tags=["AIAssistant"])


# =========================================================================
# ===== POST /ai/chat — SSE stream tiến trình Agent + câu trả lời =========
# =========================================================================
@router.post("/chat")
async def chat(
    message: InputAiAssistantSchema,
    current_user: User = Depends(get_current_user),
):
    """
    StreamingResponse + Depends(get_db) dễ đóng session TRƯỚC khi stream xong.
    → Mở SessionLocal bên trong event_generator để DB sống suốt pipeline.
    """

    async def event_generator():
        """
        Bọc stream_pipeline → SSE format:
          data: {...}\n\n
        """
        # ===== Session DB sống đến khi stream kết thúc =====
        async with SessionLocal() as db:
            # Mặc định local (qwen2.5:7b) — đổi LLM_OPTION=key trong .env nếu muốn Gemini
            ai_assistant = AIAssistantService(
                current_user=current_user,
                db=db,
            )

            try:
                async for event in ai_assistant.stream_pipeline(
                    message.prompt
                ):
                    # ensure_ascii=False để tiếng Việt không bị escape
                    payload = json.dumps(
                        event,
                        ensure_ascii=False,
                        default=str,
                    )
                    yield f"data: {payload}\n\n"
            except Exception as exc:
                # Lỗi ngoài pipeline — vẫn trả SSE để frontend không treo
                print("AI STREAM ERROR:", exc)
                error_event = {
                    "type": "answer",
                    "status": "ERROR",
                    "reply": "AI hiện đang quá tải, vui lòng thử lại sau.",
                }
                yield f"data: {json.dumps(error_event, ensure_ascii=False)}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",  # tắt buffer nginx nếu có
        },
    )


# =========================================================================
# ===== POST /ai/confirm — xác nhận thao tác ghi DB =======================
# =========================================================================
@router.post("/confirm")
async def confirm_action(
    action: ConfirmSchema,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    pending = PENDING_ACTIONS.get(action.action_id)

    if not pending:
        return {"reply": "Yêu cầu xác nhận không tồn tại hoặc đã hết hạn."}

    if pending["user_id"] != current_user.id:
        return {"reply": "Bạn không có quyền thực hiện thao tác này."}

    ai_assistant = AIAssistantService(
        current_user=current_user,
        db=db,
    )

    # Gọi luồng ghi dữ liệu đã xác nhận xuống MySQL
    result = await ai_assistant.confirm_pending_action(action.action_id)

    if result.get("status") == "success":
        return {"reply": result.get("message", "Đã cập nhật dữ liệu thành công xuống hệ thống!")}

    return {"reply": result.get("message", "Cập nhật thất bại, vui lòng thử lại.")}
