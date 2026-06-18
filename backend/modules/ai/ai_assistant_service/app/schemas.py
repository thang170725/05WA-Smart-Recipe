from pydantic import BaseModel, Field
from typing import Optional, Literal, Dict, Any

# ===== AI Schema ======
class InputAiAssistantSchema(BaseModel):
    prompt: Optional[str] = None

# ===== LAYER 1: CLASSIFICAL =======
class IntentLayer1Schema(BaseModel):
    type: Literal[
        'READ',
        'UPDATE',
        'CHAT',
        'UNKNOWN'
    ]

    intent_confidence: float = Field(
        ge=0.0,
        le=1.0,
        description="độ tin cậy từ 0 đến 1"
    )

# ===== LAYER 2: chọn hàm và chạy lệnh (layer 2 langchain) =====
# các chức năng đọc
class IntentReadGroupFuncSchema(BaseModel):
    type: Literal[
        "READ_USER", # đọc thông tin user
        "READ_MEAL_ADAY", # đọc thực đơn một ngày
        "READ_WORKOUT_AWEEK", # đọc lịch tập 1 tuần
        "READ_WORKOUT_ADAY", # đọc lịch tập 1 ngày
    ]

    intent_confidence: float = Field(
        ge=0.0,
        le=1.0,
        description="độ tin cậy từ 0 đến 1"
    )
# các chức năng update
class IntentUpdateGroupFuncSchema(BaseModel):
    type: Literal[
        "UPDATE_ADDRESS",
        "UPDATE_HEIGHT",
        "UPDATE_WEIGHT",
    ]

    # trích xuất giá tri mới
    new_value: str

    intent_confidence: float = Field(
        ge=0.0,
        le=1.0,
        description="độ tin cậy từ 0 đến 1"
    )

# ====== LAYER 3: thực thi hành động ======
# ====== UPDATE =======
# sinh action thay vì gọi API (dành cho update)
class PendingAction(BaseModel):
    intent: str
    payload: dict
    require_confirm: bool = True

# schema confirm data for update
class ConfirmSchema(BaseModel):
    action_id: str
