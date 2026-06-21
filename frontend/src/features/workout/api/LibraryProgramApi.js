import JsonApi from "../../../services/JsonApi";
import { MockDataLibraryProgram } from "../../../mockdata/Workout"

// =============================
// ======== API GET ============ 
// =============================
// lấy ra thư viện bài tập bằng 
export async function GetExcercisesLibraryApi(devMode, categoryName) {
    if (devMode === "dev") {
        const library = MockDataLibraryProgram()
        return library
    }

    return await JsonApi(
        "/workout/get-exercises-library", {
        method: "GET", 
        params: {
            category_name: categoryName
        }
    });
}

