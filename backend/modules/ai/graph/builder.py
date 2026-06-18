from langgraph.graph import StateGraph
from backend.modules.ai_assistant.schemas import AssistantStateSchema
from backend.modules.ai_assistant.graph.nodes.intent_node import IntentLLMNode


def build_graph():
    workflow = StateGraph(AssistantStateSchema)

    workflow.add_node("intent", IntentLLMNode())

    workflow.set_entry_point("intent")

    workflow.set_finish_point("intent")

    return workflow.compile()