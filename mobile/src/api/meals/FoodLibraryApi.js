import JsonApi from '../../services/JsonApi';

export function GetListFoodLibraryByCategoryNameApi(categoryName) {
  return JsonApi('/user/get-list-food-library-by-category-name', {
    method: 'GET',
    params: { category_name: categoryName },
  });
}

export function GetIdAndNameFromFoodLibrary() {
  return JsonApi('/user/get-id-and-name-food-library', { method: 'GET' });
}

export function InsertFoodFromLibraryApi(payload) {
  return JsonApi('/user/insert-food-from-library', {
    method: 'POST',
    body: payload,
  });
}
