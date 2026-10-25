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
from backend.modules.ai.ai_assistant_service.app.schemas import (
    InputAiAssistantSchema,
    ConfirmSchema,
    ResumeSchema,
)
from backend.modules.account.dependencies import get_current_user

router = APIRouter(prefix="/ai", tags=["AIAssistant"])


def _make_event_generator(stream_gen):
    """Wrap async generator → SSE bytes."""
    async def generator():
        async for event in stream_gen:
            payload = json.dumps(event, ensure_ascii=False, default=str)
            yield f"data: {payload}\n\n"
    return generator()


def _make_streaming_response(stream_gen):
    return StreamingResponse(
        _make_event_generator(stream_gen),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


# =========================================================================
# ===== POST /ai/chat — SSE stream tiến trình Agent + câu trả lời =========
# =========================================================================
@router.post("/chat")
async def chat(
    message: InputAiAssistantSchema,
    current_user: User = Depends(get_current_user),
):
    """
    StreamingResponse SSE. Mở SessionLocal bên trong để DB sống suốt pipeline.
    """
    async def event_generator():
        async with SessionLocal() as db:
            ai_assistant = AIAssistantService(
                current_user=current_user,
                db=db,
            )
            try:
                async for event in ai_assistant.stream_pipeline(message.prompt):
                    payload = json.dumps(event, ensure_ascii=False, default=str)
                    yield f"data: {payload}\n\n"
            except Exception as exc:
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
            "X-Accel-Buffering": "no",
        },
    )


# =========================================================================
# ===== POST /ai/resume — tiếp tục sau interrupt (ask_user/confirm) =======
# =========================================================================
@router.post("/resume")
async def resume(
    payload: ResumeSchema,
    current_user: User = Depends(get_current_user),
):
    """
    Resume graph đang interrupt.
    
    Body: {"reply": "câu trả lời của user hoặc 'Xác nhận'/'Hủy'"}
    
    SSE stream giống /chat.
    """
    async def event_generator():
        async with SessionLocal() as db:
            ai_assistant = AIAssistantService(
                current_user=current_user,
                db=db,
            )
            try:
                async for event in ai_assistant.resume_pipeline(payload.reply):
                    p = json.dumps(event, ensure_ascii=False, default=str)
                    yield f"data: {p}\n\n"
            except Exception as exc:
                print("AI RESUME ERROR:", exc)
                error_event = {
                    "type": "answer",
                    "status": "ERROR",
                    "reply": "Lỗi khi tiếp tục xử lý. Vui lòng thử lại.",
                }
                yield f"data: {json.dumps(error_event, ensure_ascii=False)}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


# =========================================================================
# ===== POST /ai/confirm — backward-compat (PENDING_ACTIONS cũ) ===========
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
    result = await ai_assistant.confirm_pending_action(action.action_id)

    if result.get("status") == "success":
        return {"reply": result.get("message", "Đã cập nhật dữ liệu thành công xuống hệ thống!")}

    return {"reply": result.get("message", "Cập nhật thất bại, vui lòng thử lại.")}
