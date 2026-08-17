import JsonApi from "../../../services/JsonApi";

export async function RegisterApi(message){
    return await JsonApi("/user/register", {
        method: "POST",
        body: message
    })
}

// ================================
// ====== CHECK EXISTS EMAIL ======
// ================================
export async function checkEmailApi(email) {
    return await JsonApi("/account/check-email", {
        params: {
            email: email
        }
    })
}