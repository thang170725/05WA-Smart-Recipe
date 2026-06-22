import JsonApi from '../../services/JsonApi';

export async function AiAssistantApi(message) {
  return JsonApi('/ai/chat', {
    method: 'POST',
    body: message,
  });
}

export async function ConfirmAiActionApi(actionId) {
  return JsonApi('/ai/confirm', {
    method: 'POST',
    body: { action_id: actionId },
  });
}
