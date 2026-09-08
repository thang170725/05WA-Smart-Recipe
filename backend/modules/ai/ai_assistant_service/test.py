"""
Smoke test tối giản cho cấu trúc graph (không gọi LLM thật).

Chạy:
    python -m backend.modules.ai.ai_assistant_service.test
"""

from backend.modules.ai.ai_assistant_service.app.graph.builder import build_agent_graph

EXPECTED_NODES = {
    "rewrite",
    "retrieve",
    "agent",
    "execute",
    "decision_validator",
    "result_evaluator",
}


def main():
    graph = build_agent_graph()
    nodes = set(graph.get_graph().nodes.keys()) - {"__start__", "__end__"}
    print("Compiled graph OK.")
    print("Nodes:", sorted(nodes))

    missing = EXPECTED_NODES - nodes
    extra = nodes - EXPECTED_NODES
    if missing:
        raise SystemExit(f"MISSING nodes: {sorted(missing)}")
    if extra:
        print("Note — extra nodes:", sorted(extra))
    print("Architecture nodes match description.md ✓")


if __name__ == "__main__":
    main()
