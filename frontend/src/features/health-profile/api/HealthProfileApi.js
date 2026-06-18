import JsonApi from "../../../services/JsonApi"

export async function PostHealthFormApi (devMode, payload) {
    if (devMode == "dev") {
        console.log("HEALTH FORM: ", payload )
    }

    return await JsonApi("/ai/post-health-form", {
        method: "POST",
        body: payload
    })
}