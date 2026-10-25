"""
LangGraph builder — Phase 2/3/4 update.

Flow đầy đủ:
  START → intake
    ├─ general_qa   → docs_retrieval → agent_return_result
    ├─ out_of_scope → agent_return_result
    ├─ unclear      → ask_user [INTERRUPT] → (resume) → retrieve → ...
    └─ task         → retrieve → agent_choose_branch
                        ├─ TOOL     → execute_tool
                        │              ├─ READ → eval_tool → ...
                        │              └─ WRITE → confirm_gate [INTERRUPT] → agent_return_result
                        ├─ NEED_INFO → ask_user [INTERRUPT] → (resume) → retrieve
                        └─ NO_TOOL  → eval_no_tool
                                        ├─ UNKNOWN → ask_user [INTERRUPT] → ...
                                        ├─ VALID   → agent_return_result
                                        └─ INVALID → rewrite → retrieve

Tất cả node interrupt đều dùng MemorySaver checkpointer (truyền qua compile).
"""

from __future__ import annotations

from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.memory import MemorySaver

from backend.modules.ai.ai_assistant_service.app.config.agent_state_config import AgentState
from backend.modules.ai.ai_assistant_service.app.graph.nodes.intake import intake_node
from backend.modules.ai.ai_assistant_service.app.graph.nodes.docs_retrieval import docs_retrieval_node
from backend.modules.ai.ai_assistant_service.app.graph.nodes.rewrite import rewrite_query_node
from backend.modules.ai.ai_assistant_service.app.graph.nodes.retrieve import retrieve_tools_node
from backend.modules.ai.ai_assistant_service.app.graph.nodes.router_agent import router_agent_node
from backend.modules.ai.ai_assistant_service.app.graph.nodes.execute import execute_tools_node
from backend.modules.ai.ai_assistant_service.app.graph.nodes.result_evaluator import result_evaluator_node
from backend.modules.ai.ai_assistant_service.app.graph.nodes.no_tool_evaluator import no_tool_evaluator_node
from backend.modules.ai.ai_assistant_service.app.graph.nodes.response_writer import response_writer_node
from backend.modules.ai.ai_assistant_service.app.graph.nodes.ask_user import ask_user_node
from backend.modules.ai.ai_assistant_service.app.graph.nodes.confirm_gate import confirm_gate_node
from backend.modules.ai.ai_assistant_service.app.graph.edges import (
    route_after_intake,
    route_after_router_agent,
    route_after_execute,
    route_after_confirm_gate,
    route_after_ask_user,
    route_after_tool_eval,
    route_after_no_tool_eval,
)


def build_agent_graph(checkpointer=None):
    """
    Compile LangGraph agent.

    Args:
        checkpointer: LangGraph checkpointer để hỗ trợ interrupt/resume.
                      Mặc định dùng MemorySaver (dev/single-process).
                      Production: truyền vào SQLite hoặc custom MariaDB checkpointer.
    """
    if checkpointer is None:
        checkpointer = MemorySaver()

    workflow = StateGraph(AgentState)

    # ── Nodes ──
    workflow.add_node("intake", intake_node)
    workflow.add_node("docs_retrieval", docs_retrieval_node)
    workflow.add_node("rewrite", rewrite_query_node)
    workflow.add_node("retrieve", retrieve_tools_node)
    workflow.add_node("agent_choose_branch", router_agent_node)
    workflow.add_node("execute_tool", execute_tools_node)
    workflow.add_node("eval_tool", result_evaluator_node)
    workflow.add_node("eval_no_tool", no_tool_evaluator_node)
    workflow.add_node("agent_return_result", response_writer_node)
    # Phase 3/4 nodes
    workflow.add_node("ask_user", ask_user_node)
    workflow.add_node("confirm_gate", confirm_gate_node)

    # ── Edges ──
    workflow.add_edge(START, "intake")

    # Intake → branch
    workflow.add_conditional_edges(
        "intake",
        route_after_intake,
        {
            "docs_retrieval": "docs_retrieval",
            "retrieve": "retrieve",
            "ask_user": "ask_user",
            "agent_return_result": "agent_return_result",
        },
    )
    workflow.add_edge("docs_retrieval", "agent_return_result")

    # Ask User interrupt → resume → retrieve
    workflow.add_conditional_edges(
        "ask_user",
        route_after_ask_user,
        {
            "retrieve": "retrieve",
            "agent_return_result": "agent_return_result",
        },
    )

    # Task bridge + retry
    workflow.add_edge("rewrite", "retrieve")
    workflow.add_edge("retrieve", "agent_choose_branch")

    workflow.add_conditional_edges(
        "agent_choose_branch",
        route_after_router_agent,
        {
            "execute_tool": "execute_tool",
            "eval_no_tool": "eval_no_tool",
            "ask_user": "ask_user",
        },
    )

    # Execute → eval_tool (READ) or confirm_gate (WRITE)
    workflow.add_conditional_edges(
        "execute_tool",
        route_after_execute,
        {
            "eval_tool": "eval_tool",
            "confirm_gate": "confirm_gate",
        },
    )

    # Confirm gate interrupt → agent_return_result
    workflow.add_conditional_edges(
        "confirm_gate",
        route_after_confirm_gate,
        {
            "agent_return_result": "agent_return_result",
        },
    )

    workflow.add_conditional_edges(
        "eval_tool",
        route_after_tool_eval,
        {
            "agent_return_result": "agent_return_result",
            "agent_choose_branch": "agent_choose_branch",
            "rewrite": "rewrite",
        },
    )

    workflow.add_conditional_edges(
        "eval_no_tool",
        route_after_no_tool_eval,
        {
            "ask_user": "ask_user",
            "agent_return_result": "agent_return_result",
            "rewrite": "rewrite",
        },
    )

    workflow.add_edge("agent_return_result", END)

    return workflow.compile(checkpointer=checkpointer)
