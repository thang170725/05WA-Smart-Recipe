from pydantic import BaseModel, RootModel
from typing import Optional, List, Dict
from datetime import datetime

# ====== CREATE POST ========
class InputCreatePostSchema(BaseModel):
    title: str
    content: str
class OutputCreatePostSchema(BaseModel):
    status: str

# ====== GET POST ========
class OutputGetPostSchema(BaseModel):
    platform_id: int
    title: str
    content: str
    username: str
    number_comment: Optional[int] = 0
    rating_count: Optional[int] = 0
    rating_avg: Optional[float] = 0
    created_at: datetime

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