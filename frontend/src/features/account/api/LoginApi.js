import JsonApi from "../../../services/JsonApi";

export async function LoginApi (devMode, payload ) {
    if (devMode === "dev") {
        return True
    }
    return await JsonApi(
        "/account/login", {
        method: "POST", 
        body: payload 
    });
}

