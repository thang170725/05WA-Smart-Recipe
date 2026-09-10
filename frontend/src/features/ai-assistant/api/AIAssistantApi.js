import { BASE_URL } from "../../../services/JsonApi"
import JsonApi from "../../../services/JsonApi"

/**
 * Gọi /ai/chat dạng SSE (Server-Sent Events).
 * onEvent nhận từng event JSON:
 *   - { type: "workflow", node, status, label, message }
 *   - { type: "answer", status, reply, action_id? }
 */
export async function AiAssistantApi(
    devMode,
    message,
    onEvent
) {
    // ===== Dev mode: không gọi API thật =====
    if (devMode === "dev") {
        console.log("API AI ASSISTANT:", message);
        return;
    }

    // ===== Auth token (giống JsonApi) =====
    const headers = {
        "Content-Type": "application/json",
        Accept: "text/event-stream",
    };

    const token = localStorage.getItem("token");
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    // ===== Dùng BASE_URL đầy đủ (không dùng relative /ai/chat) =====
    const response = await fetch(`${BASE_URL}/ai/chat`, {
        method: "POST",
        headers,
        body: JSON.stringify(message),
    });

    if (!response.ok) {
        throw new Error(
            `AI API error: ${response.status}`
        );
    }

    if (!response.body) {
        throw new Error("Browser không hỗ trợ response streaming.");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");

    // Buffer để ghép chunk SSE chưa đủ \n\n
    let buffer = "";

    while (true) {
        const { value, done } = await reader.read();

        if (done) {
            break;
        }

        buffer += decoder.decode(value, {
            stream: true,
        });

        // SSE events ngăn cách bởi dòng trống
        const events = buffer.split("\n\n");

        // Phần cuối có thể chưa hoàn chỉnh → giữ lại trong buffer
        buffer = events.pop() || "";

        for (const eventText of events) {
            if (!eventText.trim()) {
                continue;
            }

            // Lấy dòng data: {...}
            const line = eventText
                .split("\n")
                .find((l) => l.startsWith("data:"));

            if (!line) {
                continue;
            }

            const jsonText = line
                .replace(/^data:\s*/, "")
                .trim();

            if (!jsonText) {
                continue;
            }

            try {
                const event = JSON.parse(jsonText);

                if (onEvent) {
                    onEvent(event);
                }
            } catch (parseErr) {
                console.error("SSE JSON parse error:", parseErr, jsonText);
            }
        }
    }
}

/**
 * Xác nhận thao tác ghi (WAIT_CONFIRM) — JSON thường, không stream.
 */
export async function ConfirmAiActionApi(devMode, actionId) {
    // ===== Dev mode =====
    if (devMode === "dev") {
        console.log("CONFIRM AI ACTION:", actionId);
        return { reply: "[dev] Đã xác nhận (mock)." };
    }

    return await JsonApi("/ai/confirm", {
        method: "POST",
        body: {
            action_id: actionId
        }
    });
}
