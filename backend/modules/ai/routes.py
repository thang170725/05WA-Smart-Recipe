from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.modules.user.models import User
from backend.core.database import get_db
from backend.modules.ai.ai_assistant_service.app.ai import AIAssistantService, PENDING_ACTIONS
from backend.modules.ai.ai_assistant_service.app.schemas import InputAiAssistantSchema, ConfirmSchema
from backend.modules.user.dependencies import get_current_user

router = APIRouter(prefix="/ai", tags=["AIAssistant"])

@router.post("/chat")
async def chat(
    message: InputAiAssistantSchema,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    ai_assistant = AIAssistantService(
        current_user=current_user,
        db=db,
        option="key",
    )

    try:
        reply = await ai_assistant.run_pipline(message.prompt)

        if isinstance(reply, dict):
            # nếu AI trả về trạng thái chat thông thường
            if reply.get("status") == "CHAT":
                return {
                    "reply": reply.get("message")
                }
            
            # nếu AI trả về trạng thái success (đọc thông tin từ RAG thành công)
            if reply.get("status") == "SUCCESS":
                return {
                    "reply": reply.get("message")
                }
            
            # Nếu AI trả về trạng thái WAIT_CONFIRM, đẩy nguyên cụm sang React bắt được status và action_id
            return reply

        return {
            "reply": str(reply)
        }
    except Exception as e:
        print("AI ERROR: ", e)
        return {
            "reply": "AI hiện đang quá tải, vui lòng thử lại sau."
        }

# Endpoint confirm data - Khớp 100% với ConfirmAiActionApi từ React
@router.post("/confirm")
async def confirm_action(
    action: ConfirmSchema,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    pending = PENDING_ACTIONS.get(action.action_id)

    if not pending:
        return {"reply": "Yêu cầu xác nhận không tồn tại hoặc đã hết hạn."}

    if pending["user_id"] != current_user.id:
        return {"reply": "Bạn không có quyền thực hiện thao tác này."}

    ai_assistant = AIAssistantService(
        current_user=current_user,
        db=db,
        option="key",
    )

    # ĐỔI THÀNH HÀM MỚI: Gọi luồng ghi dữ liệu tự động xuống MySQL của Agent
    result = await ai_assistant.confirm_pending_action(action.action_id)

    if result.get("status") == "success":
        return {"reply": result.get("message", "Đã cập nhật dữ liệu thành công xuống hệ thống!")}

    return {"reply": result.get("message", "Cập nhật thất bại, vui lòng thử lại.")}