#
# ===== CLI test (giữ file cũ, ủy quyền sang scripts/run_agent_cli) =====
#
# Chạy:
#   ./sr/bin/python -m tests.test_llm_local
#   ./sr/bin/python -m tests.test_llm_local --cases
#   ./sr/bin/python -m tests.test_llm_local -q "Protein là gì?"
#
from backend.modules.ai.ai_assistant_service.scripts.run_agent_cli import main
import sys

if __name__ == "__main__":
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    if hasattr(sys.stdin, "reconfigure"):
        sys.stdin.reconfigure(encoding="utf-8")
    main()
