from sqlalchemy import Column, Integer, String, Text, ForeignKey, Float, TIMESTAMP, text
from sqlalchemy.orm import relationship
from backend.core.database import Base
from sqlalchemy.sql import func



class Platform(Base):
    __tablename__ = "platform"

    id = Column(Integer, primary_key=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True
    )

    title = Column(String(255))
    content = Column(Text)

    category_id = Column(
        Integer,
        ForeignKey("categories.id", ondelete="CASCADE"),
        index=True
    )

    number_comment = Column(
        Integer,
        nullable=False,
        server_default="0"
    )

    rating_count = Column(
        Integer,
        nullable=False,
        server_default="0"
    )

    rating_avg = Column(
        Float,
        nullable=False,
        server_default="0"
    )

    created_at = Column(
        TIMESTAMP,
        server_default=text("CURRENT_TIMESTAMP")
    )

    comments = relationship("Comment", back_populates="platform")
    ratings = relationship("Rating", back_populates="platform")

class Comment(Base):
    __tablename__ = "comments"

    id = Column(Integer, primary_key=True)

    platform_id = Column(
        Integer,
        ForeignKey("platform.id", ondelete="CASCADE"),
        index=True
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True
    )

    content = Column(Text, nullable=False)

    created_at = Column(
        TIMESTAMP,
        server_default=text("CURRENT_TIMESTAMP")
    )
    platform = relationship("Platform", back_populates="comments")

class Rating(Base):
    __tablename__ = "ratings"

    id = Column(Integer, primary_key=True)
    platform_id = Column(Integer, ForeignKey("platform.id", ondelete="CASCADE"))
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    rating = Column(Integer)
    created_at = Column(TIMESTAMP, server_default=func.now())

    platform = relationship("Platform", back_populates="ratings")