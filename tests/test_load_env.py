import os
from dotenv import load_dotenv
load_dotenv()

DEFAULT_TOOL_TOP_K = os.getenv('DEFAULT_TOOL_TOP_K')
print(DEFAULT_TOOL_TOP_K)