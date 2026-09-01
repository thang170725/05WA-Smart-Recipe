from backend.modules.platform import repositories

from backend.modules.platform.schemas import InputCreatePostSchema

from sqlalchemy.ext.asyncio import AsyncSession


# =============================
# ====== GET ==================
# =============================

# lấy danh sách các bài post
async def get_posts_service(
    db: AsyncSession
):
    try:
        return await repositories.get_posts_repo(
            db
        )

    except Exception as e:
        raise ValueError(e)


# lấy danh sách các comment trong 1 bài post
async def get_comments_service(
    db: AsyncSession,
    platform_id
):
    try:
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

        comments = await repositories.get_comments_repo(
            db,
            platform_id
        )

        return format_data(comments)

    except Exception as e:
        raise ValueError(e)


# ====================
# ======= POST =======
# ====================

async def create_post_service(
    db: AsyncSession,
    user_id: int,
    payload: InputCreatePostSchema
):
    try:
        post = await repositories.create_post_repo(
            db,
            user_id,
            payload
        )

        await db.commit()

        await db.refresh(post)

        return {
            'status': 'success'
        }

    except Exception:
        await db.rollback()
        return None


# viết bình luận
async def write_comment_service(
    db: AsyncSession,
    user_id,
    payload
):
    try:
        comment = await repositories.insert_comment_repo(
            user_id,
            payload
        )

        db.add(comment)

        await db.commit()

        await db.refresh(comment)

    except Exception as e:
        await db.rollback()
        raise e


async def rate_post(
    db: AsyncSession,
    post_id,
    user_id,
    rating
):
    try:
        return await repositories.rate_post(
            db,
            post_id,
            user_id,
            rating
        )

    except Exception as e:
        await db.rollback()
        raise e
