"""
CLI test AI Agent — chạy từng case và xem log từng bước.

Cách dùng (từ root repo, đã activate venv `sr`):

  # 1) Sync tool embeddings (bắt buộc lần đầu / sau khi đổi tool)
  #    Dùng EMBEDDING_PROVIDER=local trong .env
  ./sr/bin/python -m backend.modules.ai.ai_assistant_service.tools.sync_to_mysql

  # 2) Smoke test graph (không gọi LLM)
  ./sr/bin/python -m backend.modules.ai.ai_assistant_service.test

  # 3) Interactive (mặc định Ollama local qwen2.5:7b)
  ./sr/bin/python -m backend.modules.ai.ai_assistant_service.scripts.run_agent_cli

  # 4) Bộ test case có sẵn
  ./sr/bin/python -m backend.modules.ai.ai_assistant_service.scripts.run_agent_cli --cases

  # 5) Một câu hỏi cụ thể
  ./sr/bin/python -m backend.modules.ai.ai_assistant_service.scripts.run_agent_cli -q "BMI của tôi là bao nhiêu?"

  # 6) Dùng Gemini thay local
  ./sr/bin/python -m backend.modules.ai.ai_assistant_service.scripts.run_agent_cli --gemini -q "Protein là gì?"

Biến môi trường hữu ích:
  LOG_LEVEL=INFO
  EMBEDDING_PROVIDER=local
  MODEL_EMBEDDING_LOCAL_NAME=AITeamVN/Vietnamese_Embedding_v2
  LLM_OPTION=local
  LOCAL_LLM_MODEL=qwen2.5:7b
  GOOGLE_API_KEY   — chỉ cần nếu --gemini / LLM_OPTION=key
"""

from __future__ import annotations

import argparse
import asyncio
import logging
import sys

from backend.config.logging import setup_logging
from backend.config.database import SessionLocal
from backend.modules.ai.ai_assistant_service.app.ai import AIAssistantService
from backend.modules.ai.ai_assistant_service.app.utils import trace
from backend.modules.user.services import get_user_by_email_service

setup_logging()
logger = logging.getLogger("smart_recipe.agent.cli")

DEFAULT_TEST_EMAIL = "leducthang72005@gmail.com"

SAMPLE_CASES = [
    {
        "name": "Case 1 — kiến thức chung (không cần tool)",
        "prompt": "Protein là gì và tại sao cần thiết khi tập gym?",
        "expect": "rewrite → retrieve → agent → decision_validator(VALID) → END",
    },
    {
        "name": "Case — ngoài phạm vi",
        "prompt": "Thủ đô của Pháp là gì?",
        "expect": "decision_validator VALID — từ chối khéo, không gọi tool",
    },
    {
        "name": "Case — mơ hồ",
        "prompt": "xyz abc ???",
        "expect": "hỏi lại / nói chưa hiểu",
    },
    {
        "name": "Case — READ tool hồ sơ (cần evidence)",
        "prompt": "Cho tôi xem thông tin cá nhân của tôi",
        "expect": "agent CALL_TOOL → execute → result_evaluator → agent FINAL",
    },
    {
        "name": "Case — READ email",
        "prompt": "Email của tôi là gì?",
        "expect": "gọi get_user_email; nếu NO_TOOL → decision_validator INVALID → rewrite",
    },
    {
        "name": "Case — WRITE tool (WAIT_CONFIRM)",
        "prompt": "Cập nhật địa chỉ của tôi thành Hoài Đức, Hà Nội",
        "expect": "WAIT_CONFIRM + action_id (chưa ghi DB)",
    },
]


async def _load_user(db, email: str):
    user = await get_user_by_email_service(db, email)
    if not user:
        raise RuntimeError(
            f"Không tìm thấy user email={email}. "
            "Đổi --email hoặc tạo user trong DB trước."
        )
    return user


async def run_one(
    prompt: str,
    *,
    email: str,
    option: str,
    name_local: str,
    temperature: float,
) -> dict:
    async with SessionLocal() as db:
        user = await _load_user(db, email)
        service = AIAssistantService(
            current_user=user,
            db=db,
            option=option,
            name_local=name_local,
            temperature=temperature,
        )
        return await service.run_pipline(prompt)


async def run_cases(**kwargs) -> None:
    print("\n" + "=" * 60)
    print(" CHẠY BỘ TEST CASE AI AGENT (kiến trúc mới)")
    print("=" * 60)

    for i, case in enumerate(SAMPLE_CASES, 1):
        print(f"\n\n########## CASE {i}/{len(SAMPLE_CASES)}: {case['name']}")
        print(f"# Prompt : {case['prompt']}")
        print(f"# Expect : {case['expect']}")
        print("#" * 60)

        result = await run_one(case["prompt"], **kwargs)

        print("\n--- KẾT QUẢ ---")
        print(f"status   : {result.get('status')}")
        if result.get("action_id"):
            print(f"action_id: {result['action_id']}")
        print(f"message  : {result.get('message')}")
        print("-" * 40)

        if result.get("status") == "WAIT_CONFIRM" and result.get("action_id"):
            ans = input("Confirm ghi DB ngay? [y/N]: ").strip().lower()
            if ans == "y":
                async with SessionLocal() as db:
                    user = await _load_user(db, kwargs["email"])
                    service = AIAssistantService(
                        current_user=user,
                        db=db,
                        option=kwargs["option"],
                        name_local=kwargs["name_local"],
                        temperature=kwargs["temperature"],
                    )
                    confirm = await service.confirm_pending_action(result["action_id"])
                    print("Confirm result:", confirm)


async def run_interactive(**kwargs) -> None:
    print("\nAI Agent CLI — gõ câu hỏi (hoặc 'quit' để thoát)")
    print("Log từng bước: rewrite → retrieve → agent → ...\n")

    while True:
        try:
            prompt = input("Bạn: ").strip()
        except (EOFError, KeyboardInterrupt):
            print("\nBye.")
            break

        if not prompt:
            continue
        if prompt.lower() in {"quit", "exit", "q"}:
            print("Bye.")
            break

        result = await run_one(prompt, **kwargs)
        print("\n--- KẾT QUẢ ---")
        print(f"status   : {result.get('status')}")
        if result.get("action_id"):
            print(f"action_id: {result['action_id']}")
        print(f"Agent    : {result.get('message')}\n")


def main() -> None:
    parser = argparse.ArgumentParser(description="CLI test Smart-Recipe AI Agent")
    parser.add_argument("-q", "--query", type=str, help="Một câu hỏi duy nhất")
    parser.add_argument("--cases", action="store_true", help="Chạy bộ SAMPLE_CASES")
    parser.add_argument("--email", default=DEFAULT_TEST_EMAIL, help="Email user test")
    parser.add_argument(
        "--gemini",
        action="store_true",
        help="Dùng Gemini (key) thay Ollama local",
    )
    parser.add_argument(
        "--local",
        action="store_true",
        default=True,
        help="Dùng Ollama local (mặc định)",
    )
    parser.add_argument("--model", default="qwen2.5:7b", help="Tên model Ollama")
    parser.add_argument("--temperature", type=float, default=0.2)
    args = parser.parse_args()

    option = "key" if args.gemini else "local"
    kwargs = {
        "email": args.email,
        "option": option,
        "name_local": args.model,
        "temperature": args.temperature,
    }

    trace.banner(
        "CLI READY",
        option=option,
        model=args.model if option == "local" else "gemini",
        email=args.email,
        log_level=logging.getLogger().level,
    )

    if args.cases:
        asyncio.run(run_cases(**kwargs))
    elif args.query:
        result = asyncio.run(run_one(args.query, **kwargs))
        print("\nRESULT:", result)
    else:
        asyncio.run(run_interactive(**kwargs))


if __name__ == "__main__":
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    if hasattr(sys.stdin, "reconfigure"):
        sys.stdin.reconfigure(encoding="utf-8")
    main()
