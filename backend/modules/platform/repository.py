from sqlalchemy.orm import Session, aliased
from sqlalchemy import func, select
from sqlalchemy.sql.elements import CompilerElement

from backend.modules.platform.models import Platform, Comment, Rating
from backend.modules.platform.schemas import InputCreatePostSchema
from backend.modules.user.models import User

class PlatformRepository:
    # =============================
    # ====== GET ======
    # =============================
    # lấy danh sách 50 bài post gần nhất
    def get_posts_repo(self, db: Session):
        # Subquery lấy comment mới nhất của từng bài viết
        latest_comment_subquery = (
            db.query(
                Comment.id,
                Comment.platform_id,
                Comment.user_id,
                Comment.content,
                Comment.created_at,

                func.row_number()
                .over(
                    partition_by=Comment.platform_id,
                    order_by=Comment.created_at.desc()
                )
                .label("rn")
            )
        ).subquery()

        # Alias cho user comment
        CommentUser = aliased(User)

        posts = (
            db.query(
                # người đăng bài
                User.email.label("user_post_name"),

                # thông tin bài viết
                Platform.id.label("platform_id"),
                Platform.title,
                Platform.content,
                Platform.number_comment,
                Platform.rating_count,
                Platform.rating_avg,
                Platform.created_at.label("post_created_at"),

                # comment mới nhất
                latest_comment_subquery.c.content.label("user_comment"),
                latest_comment_subquery.c.created_at.label("comment_created_at"),

                # người comment
                CommentUser.email.label("user_comment_name")
            )

            # user đăng bài
            .join(
                User,
                User.id == Platform.user_id
            )

            # comment mới nhất
            .outerjoin(
                latest_comment_subquery,
                (latest_comment_subquery.c.platform_id == Platform.id)
                &
                (latest_comment_subquery.c.rn == 1)
            )

            # user của comment
            .outerjoin(
                CommentUser,
                CommentUser.id == latest_comment_subquery.c.user_id
            )

            .order_by(Platform.created_at.desc())
            .limit(50)
            .all()
        )

        return [
            {
                "platform_id": row.platform_id,

                "user_post_name": row.user_post_name,

                "title": row.title,
                "content": row.content,

                "number_comment": row.number_comment,
                "rating_count": row.rating_count,
                "rating_avg": row.rating_avg,

                "post_created_at": row.post_created_at,

                "user_comment_name": row.user_comment_name,
                "user_comment": row.user_comment,
                "comment_created_at": row.comment_created_at,
            }
            for row in posts
        ]

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

    # =============================
    # ======= POST / INSERT =======
    # =============================
    # tạo bài viết mới
    def create_post_repo(self, db: Session, user_id: int, payload: InputCreatePostSchema):
        post = Platform(
            user_id=user_id,
            title=payload.title,
            content=payload.content
        )
        db.add(post)

        return post

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