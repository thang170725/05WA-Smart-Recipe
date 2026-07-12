import JsonApi from '../../services/JsonApi';

// ======================
// ====== API GET =======
// ======================
export function GetListFoodLibraryByCategoryNameApi(categoryName) {
  return JsonApi('/user/get-list-food-library-by-category-name', {
    method: 'GET',
    params: { category_name: categoryName },
  });
}

export function GetIdAndNameFromFoodLibrary() {
  return JsonApi('/user/get-id-and-name-food-library', { method: 'GET' });
}

// nguyên liệu
export function GetIngredientsByIdApi (foodId) {
  return JsonApi("/user/get-ingredients-by-id", {
      method: "GET",
      params: {
          food_id: foodId,
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

// ==============================
// ====== API POST / UPDATE =======
// ==============================
export function InsertFoodFromLibraryApi(payload) {
  return JsonApi('/user/insert-food-from-library', {
    method: 'POST',
    body: payload,
  });
}
