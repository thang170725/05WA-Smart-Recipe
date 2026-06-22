import JsonApi from '../../services/JsonApi';

export async function GetHealthHistoryApi() {
  return JsonApi('/dashboard/get-health-history', { method: 'GET' });
}
