import JsonApi from "../../../services/JsonApi";

export async function SendEmailApi (devMode, payload) {
    return JsonApi("/user/send-email", {
        method: "POST",
        body: payload
    })
}

export async function VerifyOtpApi (devMode, payload) {
    return JsonApi("/user/verify-otp", {
        method: "POST",
        body: payload
    })
}

export async function ResetPasswordApi (devMode, payload) {
    return JsonApi("/user/reset-password", {
        method: "POST",
        body: payload
    })
}