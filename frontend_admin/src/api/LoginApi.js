import JsonApi from "./JsonApi";

export async function LoginApi(payload){
    return await JsonApi('api/admin/login', {
        method: "POST",
        body: {
            email: payload.email,
            password: payload.password
        }
    })
}