from pydantic import BaseModel, RootModel
from typing import Optional, List, Dict
from datetime import datetime

# ==========================
# ====== POST / INSERT =====
# ==========================
class InputCreatePostSchema(BaseModel):
    title: str
    content: str
class OutputCreatePostSchema(BaseModel):
    status: str

# ==========================
# ====== GET POST ========
# ==========================
# lấy 50 bài viết gần nhất + 1 comment mới nhất
class OutputGetPostSchema(BaseModel):
    platform_id: int
    user_post_name: str
    title: str
    content: str
    number_comment: Optional[int] = 0
    rating_count: Optional[int] = 0
    rating_avg: Optional[float] = 0
    post_created_at: datetime
    
    user_comment_name: Optional[str] = None 
    user_comment: Optional[str] = None
    comment_created_at: Optional[datetime] = None

# ====== GET COMMENT ======
class CommentsSchema(BaseModel):
    id: int
    username: str
    content: str
class OutputGetCommmentSchema(RootModel[Dict[int, List[CommentsSchema]]]):
    pass

# ====== WRITE COMMENT =====
class InputWriteCommentSchema(BaseModel):
    platform_id: int
    content: str