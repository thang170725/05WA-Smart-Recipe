from datetime import datetime, timedelta, timezone
from jose import jwt, JWTError
from passlib.context import CryptContext
from fastapi import HTTPException
from backend.config.settings import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


class PasswordSecurity:
    '''
    Dùng để mã hóa và giải mã password
    '''
    def __init__(self):
        self.pwd_context = CryptContext(
            schemes=["bcrypt"],
            deprecated="auto"
        )
    
    def hash_password(self, password: str) -> str:
        return self.pwd_context.hash(password)

    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        return self.pwd_context.verify(plain_password, hashed_password)


# phần security phục vụ khi login nhanh bằng tài khoản google
REG_TOKEN_SECRET = SECRET_KEY  # có thể dùng secret riêng cho an toàn hơn
REG_TOKEN_EXPIRE_MINUTES = 10

def create_registration_token(google_id: str, email: str, name: str | None):
    payload = {
        "google_id": google_id,
        "email": email,
        "name": name,
        "purpose": "google_register",  # tránh nhầm với access_token thường
        "exp": datetime.utcnow() + timedelta(minutes=REG_TOKEN_EXPIRE_MINUTES)
    }
    return jwt.encode(payload, REG_TOKEN_SECRET, algorithm=ALGORITHM)

def verify_registration_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, REG_TOKEN_SECRET, algorithms=[ALGORITHM])
    except JWTError:
        raise HTTPException(status_code=401, detail="Registration token invalid hoặc hết hạn")

    if payload.get("purpose") != "google_register":
        raise HTTPException(status_code=401, detail="Token không hợp lệ")

    return payload