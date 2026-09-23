import JsonApi from "../../../services/JsonApi";

export async function LoginGoogleApi(credentials) {
    return await JsonApi(
        "/account/login/google", {
        method: "POST", 
        body: credentials 
    });
}

export async function CompleteGoogleRegisterApi(data) {
    return await JsonApi("/account/register/google/complete", {
      method: "POST",
      body: data
    });
  }