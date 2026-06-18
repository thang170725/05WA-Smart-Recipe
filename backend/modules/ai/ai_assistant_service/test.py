from backend.modules.ai.ai_assistant_service.tools.__init__ import ALL_SYSTEMS_TOOLS

for tool_class in ALL_SYSTEMS_TOOLS:
  print(tool_class.__name__, tool_class.__doc__)