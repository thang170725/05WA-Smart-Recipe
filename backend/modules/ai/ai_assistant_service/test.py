"""
Smoke test cho cấu trúc graph mới (Multi-Agent LangGraph Pipeline).

Chạy:
    /home/thang/workspace/Smart-Recipe/sr/bin/python -m backend.modules.ai.ai_assistant_service.test
"""

from backend.modules.ai.ai_assistant_service.app.graph.builder import build_agent_graph

EXPECTED_NODES = {
    "rewrite",
    "retrieve",
    "agent_choose_branch",
    "execute_tool",
    "eval_tool",
    "eval_no_tool",
    "agent_return_result",
}


def main():
    graph = build_agent_graph()
    nodes = set(graph.get_graph().nodes.keys()) - {"__start__", "__end__"}
    print("Compiled graph OK.")
    print("Nodes in compiled graph:", sorted(nodes))

    missing = EXPECTED_NODES - nodes
    extra = nodes - EXPECTED_NODES
    if missing:
        raise SystemExit(f"MISSING nodes: {sorted(missing)}")
    if extra:
        print("Note — extra nodes:", sorted(extra))
    print("Architecture nodes match Multi-Agent LangGraph Pipeline specification ✓")


if __name__ == "__main__":
    main()
