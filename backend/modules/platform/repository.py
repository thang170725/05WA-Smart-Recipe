from sqlalchemy.orm import Session
from sqlalchemy import func, select
from backend.modules.platform.models import Platform, Comment, Rating
from backend.modules.user.models import User

class PlatformRepository:
    # ====== GET ======
    # lấy danh sách các bài post
    def get_posts_repo(self, db: Session):
        stmt = (
            select(
                Platform.id.label("platform_id"),
                Platform.title,
                Platform.content,
                Platform.number_comment,
                Platform.rating_count,
                Platform.rating_avg,
                Platform.created_at,
                User.username
            )
            .join(User, User.id == Platform.user_id)
            .order_by(Platform.created_at)
        )

        return db.execute(stmt).mappings().all()

    # lất danh sách comment của một bài post
    def get_comments_repo(self, db: Session, platform_id: int):
        stmt = (
            select(
                Comment.id,
                Comment.content,
                User.username
            )
            .join(User, User.id == Comment.user_id)
            .where(Comment.platform_id == platform_id)
            .order_by(Comment.created_at)
        )

        return db.execute(stmt).mappings().all()

    # ======== INSERT ========
    # tạo bài viết mới
    def create_post_repo(self, user_id, data: dict):
        return Platform(
            user_id=user_id,
            title=data.title,
            content=data.content
        )

    # ghi bình luận vào db
    def insert_comment_repo(self, user_id, payload):
        return Comment(
            user_id=user_id,
            platform_id=payload.platform_id,
            content=payload.content
        )

    # =============================
    # RATINGS
    # =============================

    def rate_post(self, db: Session, post_id: int, user_id: int, rating_value: int):
        rating = db.query(Rating).filter(
            Rating.platform_id == post_id,
            Rating.user_id == user_id
        ).first()

        if rating:
            rating.rating = rating_value
        else:
            rating = Rating(
                platform_id=post_id,
                user_id=user_id,
                rating=rating_value
            )
            db.add(rating)

        db.commit()

        # update avg
        avg_data = db.query(
            func.count(Rating.id),
            func.avg(Rating.rating)
        ).filter(Rating.platform_id == post_id).first()

        post = self.get_post_by_id(db, post_id)
        post.rating_count = avg_data[0]
        post.rating_avg = float(avg_data[1] or 0)

        db.commit()
        return post