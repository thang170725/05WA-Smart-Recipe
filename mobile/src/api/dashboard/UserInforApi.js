import JsonApi from '../../services/JsonApi';

export async function GetUserInforApi() {
  return JsonApi('/dashboard/get-user-infor', { method: 'GET' });
}
