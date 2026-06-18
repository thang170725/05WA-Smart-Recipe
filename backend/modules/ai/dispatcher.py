import inspect
from backend.modules.ai_assistant.tools import USER_TOOLS

def dispatch_node(state):

    decision = state["decision"]

    if decision.confidence < 0.7:
        return {"final_answer": "Tôi chưa hiểu rõ."}

    tool = USER_TOOLS.get(decision.intent)

    if not tool:
        return {"final_answer": "Chức năng chưa hỗ trợ."}

    params = decision.parameters or {}

    # 🔥 FILTER PARAMS THEO FUNCTION SIGNATURE
    sig = inspect.signature(tool)
    allowed_params = sig.parameters.keys()

    filtered_params = {
        k: v for k, v in params.items()
        if k in allowed_params
    }

    try:
        result = tool(user_id=1, **filtered_params)
        return {"tool_result": result}
    except Exception as e:
        return {"final_answer": f"Lỗi hệ thống: {str(e)}"}