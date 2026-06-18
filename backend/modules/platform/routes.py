from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from backend.modules.user.dependencies import get_current_user
from backend.core.database import get_db
from backend.modules.platform.service import PlatformService
from backend.modules.user.models import User
from backend.modules.platform.schemas import (
    InputCreatePostSchema,
    OutputCreatePostSchema,
    OutputGetPostSchema, 
    OutputGetCommmentSchema,
    InputWriteCommentSchema
)

router = APIRouter(prefix="/platform", tags=["Platform"])
service = PlatformService()


# ====== GET =======
# lấy các bài post
@router.get("/get-posts", response_model=list[OutputGetPostSchema])
def get_posts(
    db: Session = Depends(get_db)
):
    return service.get_posts_service(db)

# lấy comment của 1 bài post
@router.get("/get-comments", response_model=OutputGetCommmentSchema)
def get_comments(
    platform_id: int,
    db: Session = Depends(get_db)
):
    return service.get_comments_service(db, platform_id)


# ======= POST =======
# tạo bài đăng mới
@router.post("/create-post", response_model=OutputCreatePostSchema)
def create_post(
    payload: InputCreatePostSchema,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return service.create_post_service(db, current_user.id, payload)

# viết bình luận
@router.post("/write-comment")
def write_comment(
    payload: InputWriteCommentSchema,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        service.write_comment_service(db, current_user.id, payload)
        return {'status': 'successed'}
    except:
        return {'status': 'failed'}


# =============================
# RATE
# =============================
@router.post("/{post_id}/rating")
def rate_post(
    post_id: int,
    body: dict,
    db: Session = Depends(get_db)
):
    user_id = 1
    return service.rate_post(db, post_id, user_id, body["rating"])