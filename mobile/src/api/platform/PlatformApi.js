import JsonApi from '../../services/JsonApi';

export async function CreatePostApi(payload) {
  return JsonApi('/platform/create-post', {
    method: 'POST',
    body: payload,
  });
}

export function WriteComment(content, platform_id) {
  return JsonApi('/platform/write-comment', {
    method: 'POST',
    body: { platform_id, content },
  });
}

export async function GetPostApi() {
  return JsonApi('/platform/get-posts', { method: 'GET' });
}

export async function GetCommentsApi(platform_id) {
  const comments = await JsonApi('/platform/get-comments', {
    method: 'GET',
    params: { platform_id },
  });
  return comments[platform_id] || [];
}
