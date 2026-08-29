import JsonApi from "../../../services/JsonApi";

export default  async function LoginApi ( payload ) {
    return await JsonApi(
        "/account/login", {
        method: "POST", 
        body: payload 
    });
}

