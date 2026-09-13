"""
Workflow progress events — map node → label thân thiện cho frontend SSE.

Frontend chỉ nhận high-level status (không expose chain-of-thought).
"""

# ---- Nhãn hiển thị cho từng node trong LangGraph ----
WORKFLOW_NODES = {
    "rewrite": "Phân tích câu hỏi",
    "retrieve": "Tìm công cụ phù hợp",
    "agent_choose_branch": "Định tuyến xử lý",
    "execute_tool": "Thực thi công cụ",
    "eval_tool": "Đánh giá kết quả công cụ",
    "eval_no_tool": "Xác thực yêu cầu",
    "agent_return_result": "Tổng hợp câu trả lời",
    # Legacy aliases (nếu còn)
    "agent": "Định tuyến xử lý",
    "execute": "Thực thi công cụ",
    "result_evaluator": "Kiểm tra kết quả",
    "decision_validator": "Xác thực câu trả lời",
    "done": "Hoàn thành",
}

# ---- Message mặc định khi node đang chạy ----
WORKFLOW_RUNNING_MESSAGES = {
    "rewrite": "Đang phân tích yêu cầu của bạn...",
    "retrieve": "Đang tìm kiếm công cụ phù hợp...",
    "agent_choose_branch": "Đang phân tích định tuyến xử lý...",
    "execute_tool": "Đang thực hiện truy vấn công cụ...",
    "eval_tool": "Đang kiểm tra kết quả công cụ...",
    "eval_no_tool": "Đang xác thực yêu cầu...",
    "agent_return_result": "Đang soạn thảo câu trả lời...",
    # Legacy aliases
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
    iteration = int(state.get("iteration") or 0)
    max_iterations = int(state.get("max_iterations") or 6)
    retrieval_iteration = int(state.get("retrieval_iteration") or 0)
    max_retrieval = int(state.get("max_retrieval_retries") or 2)
    execution_iteration = int(state.get("execution_iteration") or 0)
    max_execution = int(state.get("max_execution_steps") or 4)

    if node_name == "rewrite":
        return "retrieve"

    if node_name == "retrieve":
        return "agent_choose_branch"

    if node_name in ("agent_choose_branch", "agent"):
        decision = state.get("decision") or {}
        action = str(decision.get("action") or "").upper()
        if action in ("TOOL", "CALL_TOOL"):
            return "execute_tool"
        return "eval_no_tool"

    if node_name in ("execute_tool", "execute"):
        if state.get("final_status") in ("WAIT_CONFIRM", "ERROR"):
            return None
        return "eval_tool"

    if node_name in ("eval_tool", "result_evaluator"):
        validation = state.get("result_validation") or {}
        status = str(validation.get("status") or "DATA_COMPLETE").upper()
        if status in ("DATA_COMPLETE", "SUCCESS"):
            return "agent_return_result"
        if status in ("NEED_MORE_TOOLS", "INSUFFICIENT"):
            if iteration >= max_iterations or execution_iteration >= max_execution:
                return "agent_return_result"
            return "agent_choose_branch"
        # FAILED
        if retrieval_iteration >= max_retrieval or iteration >= max_iterations:
            return "agent_return_result"
        return "rewrite"

    if node_name in ("eval_no_tool", "decision_validator"):
        validation = state.get("decision_validation") or {}
        valid = validation.get("valid", True)
        category = str(validation.get("category") or "").upper()
        if valid and category != "INVALID_BYPASS":
            return "agent_return_result"
        if retrieval_iteration >= max_retrieval or iteration >= max_iterations:
            return "agent_return_result"
        return "rewrite"

    if node_name == "agent_return_result":
        return "done"

    return None
