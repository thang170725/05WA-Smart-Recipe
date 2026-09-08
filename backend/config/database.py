import logging
logger = logging.getLogger(__name__)
from sqlalchemy.ext.asyncio import (
    create_async_engine,
    AsyncSession,
    async_sessionmaker
)
from sqlalchemy.orm import declarative_base
from dotenv import load_dotenv


import os

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", default="Empty")
if DATABASE_URL == "Empty":
    logger.critical("DATABASE_URL is empty or not configured")
    raise ValueError("DATABASE_URL IS EMPTY OR ERROR")

engine = create_async_engine(
    url=DATABASE_URL, 
    echo=False
)

SessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession, 
    expire_on_commit=False
)

Base = declarative_base()

async def get_db():
    async with SessionLocal() as db:
        yield db
