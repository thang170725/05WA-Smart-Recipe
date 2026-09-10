"""
LangGraph builder — lắp node + edge theo kiến trúc mới (description.md).

Flow:
  START → rewrite → retrieve → agent
    ├─ CALL_TOOL      → execute → result_evaluator → agent | rewrite
    ├─ NEED_RETRIEVAL → rewrite → retrieve → agent
    └─ FINAL_ANSWER   → decision_validator → END | rewrite
"""

from __future__ import annotations

#
#
#
from langgraph.graph import StateGraph, START, END

from backend.modules.ai.ai_assistant_service.app.config.agent_state_config import AgentState
from backend.modules.ai.ai_assistant_service.app.graph.nodes.rewrite import rewrite_query_node
from backend.modules.ai.ai_assistant_service.app.graph.nodes.retrieve import retrieve_tools_node
from backend.modules.ai.ai_assistant_service.app.graph.nodes.agent import agent_node
from backend.modules.ai.ai_assistant_service.app.graph.nodes.execute import execute_tools_node
from backend.modules.ai.ai_assistant_service.app.graph.nodes.decision_validator import (
    decision_validator_node,
)
from backend.modules.ai.ai_assistant_service.app.graph.nodes.result_evaluator import (
    result_evaluator_node,
)
from backend.modules.ai.ai_assistant_service.app.graph.edges import (
    route_after_agent,
    route_after_decision_validator,
    route_after_execute,
    route_after_result_evaluator,
)

#
#
#
def build_agent_graph():
    """
    Compile LangGraph workflow.

    Returns:
        CompiledGraph — gọi `.ainvoke(initial_state)` để chạy pipeline.
    """
    workflow = StateGraph(AgentState)

    # ---- Đăng ký nodes ----
    workflow.add_node("rewrite", rewrite_query_node)
    workflow.add_node("retrieve", retrieve_tools_node)
    workflow.add_node("agent", agent_node)
    workflow.add_node("execute", execute_tools_node)
    workflow.add_node("decision_validator", decision_validator_node)
    workflow.add_node("result_evaluator", result_evaluator_node)

    # ---- Edges cố định ----
    workflow.add_edge(START, "rewrite")
    workflow.add_edge("rewrite", "retrieve")
    workflow.add_edge("retrieve", "agent")

    # ---- Agent → execute | validate_no_tool | rewrite | END ----
    workflow.add_conditional_edges(
        "agent",
        route_after_agent,
        {
            "execute": "execute",
            "validate_no_tool": "decision_validator",
            "rewrite": "rewrite",
            "end": END,
        },
    )

    # ---- Decision Validator → END | rewrite ----
    workflow.add_conditional_edges(
        "decision_validator",
        route_after_decision_validator,
        {
            "end": END,
            "rewrite": "rewrite",
        },
    )

    # ---- Execute → result_evaluator | END ----
    workflow.add_conditional_edges(
        "execute",
        route_after_execute,
        {
            "result_evaluator": "result_evaluator",
            "end": END,
        },
    )

    # ---- Result Evaluator → agent | rewrite ----
    workflow.add_conditional_edges(
        "result_evaluator",
        route_after_result_evaluator,
        {
            "agent": "agent",
            "rewrite": "rewrite",
        },
    )

    return workflow.compile()
