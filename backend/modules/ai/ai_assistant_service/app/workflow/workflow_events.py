"""
Workflow progress events — map node → label thân thiện cho frontend SSE.

Frontend chỉ nhận high-level status (không expose chain-of-thought).
"""

# ---- Nhãn hiển thị cho từng node trong LangGraph ----
WORKFLOW_NODES = {
    "rewrite": "Phân tích câu hỏi",
    "retrieve": "Tìm công cụ phù hợp",
    "agent": "AI suy luận",
    "execute": "Thực thi công cụ",
    "result_evaluator": "Kiểm tra kết quả",
    "decision_validator": "Xác thực câu trả lời",
    "done": "Hoàn thành",
}

# ---- Message mặc định khi node đang chạy ----
WORKFLOW_RUNNING_MESSAGES = {
    "rewrite": "Đang phân tích yêu cầu của bạn...",
    "retrieve": "Đang tìm công cụ phù hợp...",
    "agent": "Đang xác định phương án xử lý...",
    "execute": "Đang thực hiện truy vấn...",
    "result_evaluator": "Đang kiểm tra kết quả...",
    "decision_validator": "Đang xác thực câu trả lời...",
    "done": "Đã xong.",
}


def build_workflow_event(
    node: str,
    status: str,
    *,
    message: str | None = None,
) -> dict:
    """
    Tạo event SSE type=workflow.

    status: "running" | "completed" | "error"
    """
    label = WORKFLOW_NODES.get(node, node)

    if not message:
        if status == "running":
            message = WORKFLOW_RUNNING_MESSAGES.get(node, f"Đang xử lý: {label}")
        elif status == "completed":
            message = f"Đã xong: {label}"
        elif status == "error":
            message = f"Lỗi ở bước: {label}"
        else:
            message = label

    return {
        "type": "workflow",
        "node": node,
        "status": status,
        "label": label,
        "message": message,
    }


def infer_next_running_node(node_name: str, state: dict) -> str | None:
    """
    Đoán node tiếp theo để emit status=running (UX),
    dựa trên state sau khi node vừa completed.
    """
    if node_name == "rewrite":
        return "retrieve"

    if node_name == "retrieve":
        return "agent"

    if node_name == "agent":
        decision = state.get("decision") or {}
        action = str(decision.get("action") or "").upper()
        if action == "CALL_TOOL":
            return "execute"
        if action == "NEED_RETRIEVAL":
            return "rewrite"
        return "decision_validator"

    if node_name == "execute":
        if state.get("final_status") in ("WAIT_CONFIRM", "ERROR"):
            return None
        return "result_evaluator"

    if node_name == "result_evaluator":
        validation = state.get("result_validation") or {}
        if validation.get("should_retrieve_again"):
            return "rewrite"
        category = str(validation.get("category") or "").upper()
        if category == "WRONG_TOOL":
            return "rewrite"
        return "agent"

    if node_name == "decision_validator":
        validation = state.get("decision_validation") or {}
        if str(validation.get("status") or "").upper() == "INVALID":
            return "rewrite"
        return None

    return None
