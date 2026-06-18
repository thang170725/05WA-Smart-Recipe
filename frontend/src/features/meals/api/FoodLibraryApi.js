import JsonApi  from "../../../services/JsonApi"
import { MockDataIdAndNameFoodLibrary } from "../../../mockdata/Meal"

// ======================
// ====== API GET =======
// ======================
export function GetListFoodLibraryByCategoryNameApi (categoryName) {
    return JsonApi("/user/get-list-food-library-by-category-name", {
        method: "GET",
        params: {
            category_name: categoryName,
        },
    });
}

// lấy id và name trong thư viện món ăn
export function GetIdAndNameFromFoodLibrary(devMode) {
    if (devMode === "dev") {
        const response = MockDataIdAndNameFoodLibrary()
        console.log("ID and Name of food library: ", response)
        return response
    }
    return JsonApi("/user/get-id-and-name-food-library", {
        method:"GET",
    })
}

// ====== API INSERT ======
// thêm món từ thư viện vào menu
export function InsertMealFromLibraryApi (devMode, payload) {
    return JsonApi("/user/insert-meal-from-library", {
        method:"POST",
        body: payload
    })
}