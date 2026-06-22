export function UsernameRegExp() {
  return /^[a-zA-Z0-9_]{4,20}$/;
}

export function PasswordRegExp() {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;
}

export function PhoneRegExp() {
  return /^(03|05|07|08|09)[0-9]{8}$/;
}

export function EmailRegExp() {
  return /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
}
