from backend.modules.ai_assistant.schemas import AIAgent
from backend.modules.ai_assistant.config import SYSTEM_PROMPT

def build_classifier(llm):

    structured_llm = llm.with_structured_output(AIAgent)

    def classify_node(state):
        user_message = state["messages"][-1].content

        prompt = f"""
        {SYSTEM_PROMPT}

        User message:
        {user_message}
        """

        decision = structured_llm.invoke(prompt)

        return {"decision": decision}

    return classify_node