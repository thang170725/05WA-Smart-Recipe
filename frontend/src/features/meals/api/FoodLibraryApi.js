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

// hướng dẫn nấu
export function GetInstructionsByIdApi (foodId) {
    return JsonApi("/user/get-instructions-by-id", {
        method: "GET",
        params: {
            food_id: foodId,
        },
    });
}

// hướng dẫn nấu
export function GetIngredientsByIdApi (foodId) {
    return JsonApi("/user/get-ingredients-by-id", {
        method: "GET",
        params: {
            food_id: foodId,
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
export function InsertFoodFromLibraryApi (devMode, payload) {
    // payload = {
    //       food_id: food.food_id,
    //       meal_type: selectedMeal,
    //       plan_date: dateDetail.currentDate,
    //       week_start: dateDetail.dateStartInWeek,
    //       quantity: Number(quantity),
    //       unit: unit
    //   }

    return JsonApi("/user/insert-food-from-library", {
        method:"POST",
        body: payload
    })
}