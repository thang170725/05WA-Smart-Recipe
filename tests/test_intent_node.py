import pytest
from backend.modules.ai_assistant.graph.builder import build_graph
from backend.modules.ai_assistant.schemas import AssistantStateSchema


@pytest.fixture
def graph():
    return build_graph()


def test_read_intent(graph):
    state = AssistantStateSchema(
        input="Cho tôi xem thông tin tài khoản"
    )

    result = graph.invoke(state)
    result = AssistantStateSchema(**result)

    assert result.intent == "READ"
    assert 0 <= result.intent_confidence <= 1


def test_update_intent(graph):
    state = AssistantStateSchema(
        input="Cập nhật email thành abc@gmail.com"
    )

    result = graph.invoke(state)
    result = AssistantStateSchema(**result)

    assert result.intent == "UPDATE"


def test_chat_intent(graph):
    state = AssistantStateSchema(
        input="Hôm nay bạn khỏe không?"
    )

    result = graph.invoke(state)
    result = AssistantStateSchema(**result)

    assert result.intent == "CHAT"