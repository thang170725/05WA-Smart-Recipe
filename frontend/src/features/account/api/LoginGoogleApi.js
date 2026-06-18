import JsonApi from "../../../services/JsonApi";

export async function LoginGoogleApi(credentials) {
    return await JsonApi(
        "/user/login/google", {
        method: "POST", 
        body: credentials 
    });
}

