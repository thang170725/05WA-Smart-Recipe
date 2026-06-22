import JsonApi from '../../services/JsonApi';

export async function PostHealthFormApi(payload) {
  return JsonApi('/ai/post-health-form', {
    method: 'POST',
    body: payload,
  });
}
