import JsonApi from "../../../services/JsonApi";

export default async function RegisterApi(message){
    return await JsonApi("/user/register", {
        method: "POST",
        body: message
    })
}