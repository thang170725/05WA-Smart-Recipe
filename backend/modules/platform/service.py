from backend.modules.platform.repository import PlatformRepository
from backend.modules.platform.schemas import InputCreatePostSchema

from sqlalchemy.orm import Session

class PlatformService:
    def __init__(self):
        self.repo = PlatformRepository()

    # =============================
    # ====== GET ==================
    # =============================
    # lấy danh sách các bài post
    def get_posts_service(self, db):
        try:
            return self.repo.get_posts_repo(db)
        except Exception as e:
            raise ValueError(e)
    
    # lấy danh sách các comment trong 1 bài post
    def get_comments_service(self, db, platform_id):
        def format_data(rows):
            if not rows:
                return {}

            res = []
            for r in rows:
                res.append({
                    'id': r["id"],
                    'username': r["username"],
                    'content': r["content"] 
                })
            
            return {
                platform_id: res
            }
        
        comments = self.repo.get_comments_repo(db, platform_id)

        return format_data(comments)

    # ====================
    # ======= POST =======
    # ====================
    def create_post_service(self, db: Session, user_id: int, payload: InputCreatePostSchema):
        try:
            post = self.repo.create_post_repo(db, user_id, payload)

            db.commit()
            db.refresh(post)

            return {'status': 'success'}
        except:
            return None

    # viết bình luận
    def write_comment_service(self, db: Session, user_id, payload):
        comment = self.repo.insert_comment_repo(user_id, payload)

        db.add(comment)
        db.commit()
        db.refresh(comment)

    def rate_post(self, db, post_id, user_id, rating):
        return self.repo.rate_post(db, post_id, user_id, rating)