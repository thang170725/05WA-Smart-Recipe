import JsonApi from "../../../services/JsonApi";

export async function RegisterApi(devMode, message){
    if (devMode === 'dev') {
        console.log("dữ liệu đăng ký: ", message)
        return 
    }
    return await JsonApi("/account/register", {
        method: "POST",
        body: message
    })
}

// ================================
// ====== CHECK EXISTS EMAIL ======
// ================================
export async function checkEmailApi(devMode, email) {
    if (devMode === 'dev') {
        return 
    }
    return await JsonApi("/account/check-email", {
        params: {
            email: email
        }
    })
}