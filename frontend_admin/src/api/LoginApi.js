import JsonApi from "./JsonApi";

export async function LoginApi(payload){
    return await JsonApi('/account/admin/login', {
        method: "POST",
        body: {
            email: payload.username,
            password: payload.password
        }
    })
}