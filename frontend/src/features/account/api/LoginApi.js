import JsonApi from "../../../services/JsonApi";

export default  async function LoginApi ( payload ) {
    return await JsonApi(
        "/user/login", {
        method: "POST", 
        body: payload 
    });
}

