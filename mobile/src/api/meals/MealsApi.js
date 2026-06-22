import JsonApi from '../../services/JsonApi';

export async function GetFoodByPlanDateAndMealTypeApi(planDate, mealType) {
  return JsonApi('/user/get-food-by-plan_date-and-meal_type', {
    method: 'GET',
    params: { plan_date: planDate, meal_type: mealType },
  });
}

export async function RemoveMealApi(payload) {
  return JsonApi('/user/remove-meal', {
    method: 'POST',
    body: payload,
  });
}
