import JsonApi from "../../../services/JsonApi";

export async function SendEmailApi (devMode, email) {
    return JsonApi("/user/send-email", {
        method: "POST",
        body: {email: email}
    })
}

export async function VerifyOtpApi (devMode, email, otp) {
    return JsonApi("/user/verify-email", {
        method: "POST",
        body: {
            email: email,
            otp: otp
        }
    })
}

export async function ResetPasswordApi (devMode, email, newPassword) {
    return JsonApi("/user/reset-password", {
        method: "POST",
        body: {
            email: email,
            new_password: newPassword
        }
    })
}