# 
# ======= nơi import thư viện ======
# 
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from backend.modules.account.dependencies import get_current_user
from backend.config.database import get_db
from backend.modules.platform import services
from backend.modules.user.models import User
from backend.modules.platform.schemas import (
    InputCreatePostSchema,
    OutputCreatePostSchema,
    OutputGetPostSchema, 
    OutputGetCommmentSchema,
    InputWriteCommentSchema
)

router = APIRouter(prefix="/platform", tags=["Platform"])

# ====================
# ====== GET =========
# ====================
# lấy các bài post
@router.get("/get-posts", response_model=list[OutputGetPostSchema])
async def get_posts(
    db: AsyncSession = Depends(get_db)
):
    return await services.get_posts_service(db)

# lấy comment của 1 bài post
@router.get("/get-comments", response_model=OutputGetCommmentSchema)
async def get_comments(
    platform_id: int,
    db: AsyncSession = Depends(get_db)
):
    return await services.get_comments_service(db, platform_id)

# ====================
# ======= POST =======
# ====================
# tạo bài đăng mới
@router.post("/create-post", response_model=OutputCreatePostSchema)
async def create_post(
    payload: InputCreatePostSchema,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await services.create_post_service(db, current_user.id, payload)

# viết bình luận
@router.post("/write-comment")
async def write_comment(
    payload: InputWriteCommentSchema,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    try:
        await services.write_comment_service(db, current_user.id, payload)
        return {'status': 'successed'}
    except:
        return {'status': 'failed'}


# =============================
# RATE
# =============================
@router.post("/{post_id}/rating")
async def rate_post(
    post_id: int,
    body: dict,
    db: AsyncSession = Depends(get_db)
):
    user_id = 1
    return await services.rate_post(db, post_id, user_id, body["rating"])