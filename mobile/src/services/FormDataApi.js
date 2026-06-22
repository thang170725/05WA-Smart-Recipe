import { BASE_URL } from './config';
import { getToken } from './storage';

export default async function FormDataApi(
  endpoint,
  { method = 'POST', body, headers: customHeaders, ...rest } = {}
) {
  const headers = {};

  const token = await getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const config = {
    method,
    ...rest,
    headers: {
      ...headers,
      ...customHeaders,
    },
    body,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, config);

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    console.error('FORM DATA API ERROR:', {
      url: endpoint,
      status: response.status,
      data,
    });
    throw new Error(JSON.stringify(data));
  }

  return data;
}
