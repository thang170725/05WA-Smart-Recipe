import JsonApi from "./JsonApi"

//
// ====== API GET ======
//
// API lấy thư viện đồ ăn
export async function GetFoodsLibraryApi(devMode) {
    return await JsonApi("/user/get-foods-library", {
        method: "GET",
    })
}