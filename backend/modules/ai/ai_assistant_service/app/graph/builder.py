"""
LangGraph builder — Kiến trúc Multi-Agent LangGraph Pipeline.

Nodes:
  1. rewrite: Query Rewriter
  2. retrieve: Tool Retrieval (Cosine Similarity)
  3. agent_choose_branch: Router Agent (TOOL vs NO_TOOL)
  4. execute_tool: Execute Tool Calls
  5. eval_tool: Evaluate Tool Result (DATA_COMPLETE | NEED_MORE_TOOLS | FAILED)
  6. eval_no_tool: No-Tool Evaluator (ASKANDANSWER | OUTSIDE | UNKNOWN | INVALID_BYPASS)
  7. agent_return_result: Generative Result / Response Writer
"""

from __future__ import annotations

from langgraph.graph import StateGraph, START, END

from backend.modules.ai.ai_assistant_service.app.config.agent_state_config import AgentState
from backend.modules.ai.ai_assistant_service.app.graph.nodes.rewrite import rewrite_query_node
from backend.modules.ai.ai_assistant_service.app.graph.nodes.retrieve import retrieve_tools_node
from backend.modules.ai.ai_assistant_service.app.graph.nodes.router_agent import router_agent_node
from backend.modules.ai.ai_assistant_service.app.graph.nodes.execute import execute_tools_node
from backend.modules.ai.ai_assistant_service.app.graph.nodes.result_evaluator import result_evaluator_node
from backend.modules.ai.ai_assistant_service.app.graph.nodes.no_tool_evaluator import no_tool_evaluator_node
from backend.modules.ai.ai_assistant_service.app.graph.nodes.response_writer import response_writer_node
from backend.modules.ai.ai_assistant_service.app.graph.edges import (
    route_after_router_agent,
    route_after_tool_eval,
    route_after_no_tool_eval,
)


def build_agent_graph():
    """
    Compile LangGraph workflow theo kiến trúc Multi-Agent Pipeline.
    """
    workflow = StateGraph(AgentState)

    # 1. Register Nodes
    workflow.add_node("rewrite", rewrite_query_node)
    workflow.add_node("retrieve", retrieve_tools_node)
    workflow.add_node("agent_choose_branch", router_agent_node)
    workflow.add_node("execute_tool", execute_tools_node)
    workflow.add_node("eval_tool", result_evaluator_node)
    workflow.add_node("eval_no_tool", no_tool_evaluator_node)
    workflow.add_node("agent_return_result", response_writer_node)

    # 2. Linear Entry Pipeline
    workflow.add_edge(START, "rewrite")
    workflow.add_edge("rewrite", "retrieve")
    workflow.add_edge("retrieve", "agent_choose_branch")

    # 3. Router Edge (Tool vs No-Tool)
    workflow.add_conditional_edges(
        "agent_choose_branch",
        route_after_router_agent,
        {
            "execute_tool": "execute_tool",
            "eval_no_tool": "eval_no_tool",
        },
    )

    # 4. Tool Execution & Evaluation Branch
    workflow.add_edge("execute_tool", "eval_tool")
    workflow.add_conditional_edges(
        "eval_tool",
        route_after_tool_eval,
        {
            "agent_return_result": "agent_return_result",
            "agent_choose_branch": "agent_choose_branch",
            "rewrite": "rewrite",
        },
    )

    # 5. No-Tool Evaluation Branch
    workflow.add_conditional_edges(
        "eval_no_tool",
        route_after_no_tool_eval,
        {
            "agent_return_result": "agent_return_result",
            "rewrite": "rewrite",
        },
    )

    # 6. Terminal Edge
    workflow.add_edge("agent_return_result", END)

    return workflow.compile()
