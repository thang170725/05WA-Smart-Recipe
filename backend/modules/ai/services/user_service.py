from backend.modules.user.services import UserService
from backend.modules.ai_assistant.graph.nodes.intent_node import IntentLLMNode
from backend.modules.ai_assistant.services.formatter import ResponseFormatter

class AIAssistant:
    def __init__(self, user_service: UserService):
        self.user_service = user_service
        self.router = IntentLLMNode()
        self.formatter = ResponseFormatter()

    def handle(self, user_input, user_id, db):
        intent = self.router.classify(user_input)
        print("INTENT FROM API:", intent)

        result = self._dispatch(intent, user_id, db)
        print(result)

        if result is None:
            return "Xin lỗi, tôi chưa hiểu yêu cầu của bạn."

        return self.formatter.format(user_input, result)
        
    def _dispatch(self, intent, user_id, db):
        match intent.type:
            case "READ_ADDRESS":
                return self.user_service.get_address(db, user_id)

            case "READ_PROFILE":
                return self.user_service.get_profile(db, user_id)

            case "READ_EMAIL":
                return self.user_service.get_email(db, user_id)

            case _:
                return None

