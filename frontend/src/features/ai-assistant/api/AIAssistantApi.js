import JsonApi from "../../../services/JsonApi"

export async function AiAssistantApi (devMode, message) {
    if (devMode === "dev") {
        console.log("API AI ASSISTANT: ", message)
        return
    }

    return await JsonApi("/ai/chat", {
        method: "POST",
        body: message
    })
}

export async function ConfirmAiActionApi(devMode, actionId) {
    return await JsonApi("/ai/confirm", {
        method: "POST",
        body: {
            action_id: actionId
        }
    });
}