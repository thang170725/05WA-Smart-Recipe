import JsonApi from '../../services/JsonApi';

export async function SendEmailApi(email) {
  return JsonApi('/user/send-email', {
    method: 'POST',
    body: { email },
  });
}

export async function VerifyOtpApi(email, otp) {
  return JsonApi('/user/verify-email', {
    method: 'POST',
    body: { email, otp },
  });
}

export async function ResetPasswordApi(email, newPassword) {
  return JsonApi('/user/reset-password', {
    method: 'POST',
    body: { email, new_password: newPassword },
  });
}
