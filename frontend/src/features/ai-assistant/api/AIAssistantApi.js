import { BASE_URL } from "../../../services/JsonApi";

/**
 * Helper: đọc SSE stream từ fetch response.
 * Gọi onEvent cho từng event JSON nhận được.
 */
async function _readSseStream(response, onEvent) {
  if (!response.body) {
    throw new Error("Browser không hỗ trợ response streaming.");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    // SSE events ngăn cách bởi dòng trống
    const events = buffer.split("\n\n");
    buffer = events.pop() || "";

    for (const eventText of events) {
      if (!eventText.trim()) continue;

      const line = eventText.split("\n").find((l) => l.startsWith("data:"));
      if (!line) continue;

      const jsonText = line.replace(/^data:\s*/, "").trim();
      if (!jsonText) continue;

      try {
        const event = JSON.parse(jsonText);
        if (onEvent) onEvent(event);
      } catch (parseErr) {
        console.error("SSE JSON parse error:", parseErr, jsonText);
      }
    }
  }
}

/**
 * Tạo auth headers chung.
 */
function _authHeaders() {
  const headers = {
    "Content-Type": "application/json",
    Accept: "text/event-stream",
  };
  const token = localStorage.getItem("token");
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

/**
 * POST /ai/chat — SSE stream tiến trình Agent + câu trả lời.
 * 
 * onEvent nhận từng event JSON:
 *   - { type: "workflow", node, status, label, message }
 *   - { type: "answer", status, reply, action_id? }       ← trả lời bình thường
 *   - { type: "ask_user", question, options, ask_count }  ← Phase 4: cần thêm info
 *   - { type: "confirm", question, staged_actions, options } ← Phase 3: cần xác nhận
 */
export async function AiAssistantApi(devMode, message, onEvent) {
  if (devMode === "dev") {
    console.log("API AI ASSISTANT:", message);
    return;
  }

  const response = await fetch(`${BASE_URL}/ai/chat`, {
    method: "POST",
    headers: _authHeaders(),
    body: JSON.stringify(message),
  });

  if (!response.ok) {
    throw new Error(`AI API error: ${response.status}`);
  }

  await _readSseStream(response, onEvent);
}

/**
 * POST /ai/resume — tiếp tục graph đang interrupt.
 * 
 * reply: câu trả lời của user (text hoặc option đã chọn).
 *        Với confirm: "Xác nhận" hoặc "Hủy".
 * 
 * Yields cùng event format như /chat.
 */
export async function ResumeAiApi(devMode, reply, onEvent) {
  if (devMode === "dev") {
    console.log("API AI RESUME:", reply);
    // Mock response
    if (onEvent) {
      onEvent({ type: "answer", status: "SUCCESS", reply: "[dev] Resume mock." });
    }
    return;
  }

  const response = await fetch(`${BASE_URL}/ai/resume`, {
    method: "POST",
    headers: _authHeaders(),
    body: JSON.stringify({ reply }),
  });

  if (!response.ok) {
    throw new Error(`AI Resume API error: ${response.status}`);
  }

  await _readSseStream(response, onEvent);
}

/**
 * POST /ai/confirm — backward-compat: xác nhận PENDING_ACTIONS cũ.
 * Sẽ xóa sau khi Phase 3 interrupt ổn định.
 */
export async function ConfirmAiActionApi(devMode, actionId) {
  if (devMode === "dev") {
    console.log("CONFIRM AI ACTION:", actionId);
    return { reply: "[dev] Đã xác nhận (mock)." };
  }

  const token = localStorage.getItem("token");
  const response = await fetch(`${BASE_URL}/ai/confirm`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ action_id: actionId }),
  });

  if (!response.ok) throw new Error(`Confirm API error: ${response.status}`);
  return await response.json();
}
