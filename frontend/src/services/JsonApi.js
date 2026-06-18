export const BASE_URL = "http://127.0.0.1:3651";

export default async function JsonApi(
  endpoint,
  { 
    method = "GET", 
    body,
    params,
    headers: customHeaders, 
    ...rest 
  } = {}
) {
  const headers = {}

  if (body) {
    headers["Content-Type"] = "application/json"
  }

  const token = localStorage.getItem("token")
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  let url = `${BASE_URL}${endpoint}`;
  if (params) {
    const searchParams = new URLSearchParams(params);
    url += `?${searchParams.toString()}`;
  }

  const config = {
    method,
    ...rest,
    headers: {
      ...headers,
      ...customHeaders,
    },
  }

  if (body) {
    config.body = JSON.stringify(body)
  }

  const response = await fetch(url, config)

  let data = null
  try {
    data = await response.json()
  } catch {
    data = null
  }

  if (!response.ok) {
    console.error("API ERROR:", {
      url: endpoint,
      status: response.status,
      data,
    })
    throw new Error(JSON.stringify(data))
  }

  return data
}