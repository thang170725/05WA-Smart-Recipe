import logging
from backend.config.logging import setup_logging
setup_logging()
logger = logging.getLogger(__name__)

import csv
import json
import time
import httpx
import pytest
import os

from pathlib import Path
from dotenv import load_dotenv
load_dotenv()

# =========================
# Configuration
# =========================

BASE_URL = os.getenv("BASE_URL")
LOGIN_ENDPOINT="account/login"
API_ENDPOINT = "/ai/chat"

TEST_USER_EMAIL = os.getenv("TEST_USER_EMAIL")
TEST_USER_PASSWORD = os.getenv("TEST_USER_PASSWORD")

INPUT_FILE = Path(
    "/home/thang/workspace/Smart-Recipe/backend/data/test_cases/agent_test_cases.csv"
)
OUTPUT_FILE = Path(
    "/home/thang/workspace/Smart-Recipe/tests/output/agent_test_results.csv"
)


# =========================
# CSV
# =========================

def load_test_cases():
    """Đọc danh sách test case từ CSV."""
    with INPUT_FILE.open("r", encoding="utf-8-sig", newline="") as file:
        return list(csv.DictReader(file))


def save_result(result):
    """Ghi một kết quả test vào CSV."""
    file_exists = OUTPUT_FILE.exists()

    with OUTPUT_FILE.open(
        "a",
        encoding="utf-8-sig",
        newline=""
    ) as file:

        writer = csv.DictWriter(
            file,
            fieldnames=[
                "id",
                "prompt",
                "intent",
                "response_agent",
                "during_response",
            ],
        )

        if not file_exists:
            writer.writeheader()

        writer.writerow(result)


# =========================
# API
# =========================

async def call_agent(prompt, token):
    """
    Gửi prompt tới AI Agent và đọc toàn bộ SSE response.
    """

    request_data = {
        "prompt": prompt
    }

    headers = {
        "Authorization": f"Bearer {token}"
    }

    response_events = []

    async with httpx.AsyncClient(
        base_url=BASE_URL,
        timeout=None,
    ) as client:

        async with client.stream(
            "POST",
            API_ENDPOINT,
            json=request_data,
            headers=headers
        ) as response:

            response.raise_for_status()

            async for line in response.aiter_lines():

                if not line:
                    continue

                if not line.startswith("data:"):
                    continue

                data = line.removeprefix("data:").strip()

                if not data:
                    continue

                try:
                    event = json.loads(data)
                    response_events.append(event)

                except json.JSONDecodeError:
                    continue

    return response_events


# =========================
# Response processing
# =========================

def extract_agent_response(events):
    """
    Lấy nội dung response cuối cùng từ các SSE event.
    """

    replies = []

    for event in events:

        reply = event.get("reply")

        if reply:
            replies.append(str(reply))

    return "".join(replies)

# =========================
# Auth
# =========================

@pytest.fixture(scope="session")
def access_token():
    """
    Đăng nhập 1 lần duy nhất cho cả session test,
    trả về access_token dùng chung cho mọi test case.
    """
    assert TEST_USER_EMAIL, "TEST_USER_EMAIL chưa được nạp — kiểm tra .env"
    assert TEST_USER_PASSWORD, "TEST_USER_PASSWORD chưa được nạp — kiểm tra .env"
    logger.debug("Login với email=%s", TEST_USER_EMAIL)

    with httpx.Client(base_url=BASE_URL, timeout=None) as client:
        response = client.post(
            LOGIN_ENDPOINT,
            json={
                "email": TEST_USER_EMAIL,
                "password": TEST_USER_PASSWORD,
            },
        )
        response.raise_for_status()
        token = response.json()["access_token"]

    logger.info("Login test account thành công, đã lấy access_token")
    return token

# =========================
# Test
# =========================

@pytest.mark.asyncio
@pytest.mark.parametrize(
    "test_case",
    load_test_cases(),
    ids=lambda test_case: test_case["id"],
)
async def test_agent(test_case, access_token):

    test_id = test_case["id"]
    prompt = test_case["prompt"]
    intent = test_case["intent"]

    start_time = time.perf_counter()

    try:
        events = await call_agent(prompt, access_token)

        response_agent = extract_agent_response(events)

    except Exception as exc:
        response_agent = f"ERROR: {exc}"

    end_time = time.perf_counter()

    during_response = round(
        end_time - start_time,
        3,
    )

    result = {
        "id": test_id,
        "prompt": prompt,
        "intent": intent,
        "response_agent": response_agent,
        "during_response": during_response,
    }

    save_result(result)

    print(
        f"\n[{test_id}] "
        f"{during_response}s "
        f"| {response_agent}"
    )