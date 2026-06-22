import JsonApi from '../../services/JsonApi';

export async function GetExcercisesLibraryApi(categoryName) {
  return JsonApi('/workout/get-exercises-library', {
    method: 'GET',
    params: { category_name: categoryName },
  });
}
