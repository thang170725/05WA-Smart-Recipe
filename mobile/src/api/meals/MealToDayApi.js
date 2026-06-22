import JsonApi from '../../services/JsonApi';

export async function MealToDayApi(today) {
  return JsonApi('/user/analysis', {
    method: 'POST',
    body: { plan_date: today },
  });
}
