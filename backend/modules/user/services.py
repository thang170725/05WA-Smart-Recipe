#
# ===== nơi setup logging ====
#
import logging
from backend.config.logging import setup_logging
setup_logging()
logger = logging.getLogger(__name__)

#
# ======== nơi import thư viện ========
#
from sqlalchemy.ext.asyncio import AsyncSession

from backend.modules.user import repositories
from backend.modules.user.models import User, OTP
from backend.core.security import hash_password, verify_password
from google.oauth2 import id_token
from google.auth.transport import requests
import os
from dotenv import load_dotenv
import uuid
import shutil
from fastapi import HTTPException, status
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import random
from datetime import datetime, timedelta, timezone

# ==========================
# ====== GET SERVICE =======
# ==========================
async def get_info_user_service(db, user_id):
    try:
        user = await repositories.get_info_user_repo(db, user_id)
        return user
    except Exception as e:
        logger.error(e)

# ========================
# ======= UPDATE =========
# ========================
async def update_profile_service( db: AsyncSession, user_id: int, payload ): 
    try: 
        user, health_metric = await repositories.update_user_repository( db, user_id, payload ) 
        
        db.add(health_metric) 
        await db.commit() 
        await db.refresh(user) 
        return True 
    except Exception as e: 
        await db.rollback() 
        raise ValueError(e) 

# 
async def get_profile( db: AsyncSession, user_id: int ): 
    try: 
        return await repositories.get_by_id( db, user_id ) 
    except Exception as e: 
        await db.rollback() 
        raise ValueError(e) 

async def get_address( db: AsyncSession, user_id: int ): 
    try: 
        user = await repositories.get_by_id( db, user_id ) 
        
        return user.address if user else None 
    except Exception as e: 
        await db.rollback() 
        raise ValueError(e) 

async def get_user_by_email_service( db: AsyncSession, email: str ): 
    try: 
        return await repositories.get_user_by_email_repo( db, email ) 
    except Exception as e: 
        await db.rollback() 
        raise ValueError(e) 

# lấy email bằng user_id 
async def get_email_service( db: AsyncSession, user_id: int ): 
    try: 
        return await repositories.get_email_repo( db, user_id ) 
    except Exception as e: 
        await db.rollback() 
        raise ValueError(e) 

# lấy address 
async def get_address_service( db: AsyncSession, user_id: int ): 
    try: 
        return await repositories.get_address_repo( db, user_id ) 
    except Exception as e: 
        await db.rollback() 
        raise ValueError(e) 

# lấy phone 
async def get_phone_service( db: AsyncSession, user_id: int ): 
    try: 
        return await repositories.get_phone_repo( db, user_id ) 
    except Exception as e: await db.rollback() 
    raise ValueError(e) 

# lấy birth date 
async def get_birth_date_service( db: AsyncSession, user_id: int ): 
    try:
        return await repositories.get_birth_date_repo( db, user_id ) 
    except Exception as e: 
        await db.rollback() 
        raise ValueError(e) 

async def get_fullname_service( db: AsyncSession, user_id ): 
    try: 
        return await repositories.get_fullname_repo( db, user_id ) 
    except Exception as e: 
        await db.rollback() 
        raise ValueError(e) 

async def update_password( db: AsyncSession, user: User, password: str ): 
    try: 
        hashed_password = hash_password(password) 
        await repositories.update_password( db, user, hashed_password ) 
    except Exception as e: 
        await db.rollback() 
        raise ValueError(e) 

async def upload_avatar( db: AsyncSession, user_id: int, file, avatars_path: str ): 
    try: 
        # 1️⃣ Validate 
        if not file.content_type.startswith("image/"): 
            raise HTTPException( status_code=400, detail="File must be image" ) 
        
        # 2️⃣ Tạo tên file 
        file_ext = file.filename.split(".")[-1] 
        unique_name = f"{uuid.uuid4()}.{file_ext}" 
        
        # 3️⃣ Lưu file vật lý 
        file_path = os.path.join( avatars_path, unique_name ) 
        
        with open(file_path, "wb") as buffer: shutil.copyfileobj( file.file, buffer ) 
        
        # 4️⃣ Tạo URL tương đối 
        relative_url = f"/avatars/{unique_name}" 
        
        # 5️⃣ Gọi repo update DB 
        updated_user = await repositories.update_avatar( db, user_id, relative_url ) 
        if not updated_user: 
            raise HTTPException( status_code=404, detail="User not found" ) 
            
        return relative_url 
    except HTTPException: 
        raise 
    except Exception as e: 
        await db.rollback() 
        raise ValueError(e) 

# cập nhật địa chỉ 
async def update_address_service( db: AsyncSession, user_id, new_address: str ): 
    try: 
        user = await repositories.update_address_repo( db, user_id, new_address ) 
        if not user: 
            return "not_found" 
        
        await db.commit() 
        await db.refresh(user) 
        return "successed" 
    except Exception as e: 
        await db.rollback() 
        print("ERROR: ", e) 
        return "failed" 

# cập nhật ngày tháng năm sinh 
async def update_birth_date_service( db: AsyncSession, user_id, new_birth_date: str ): 
    try: 
        user = await repositories.update_birth_date_repo( db, user_id, new_birth_date ) 
        if not user: 
            return None 
        
        await db.commit() 
        await db.refresh(user) 
        return "updated" 
    except Exception as e: 
        await db.rollback() 
        raise ValueError( "update_birth_date_service: ", {e} )