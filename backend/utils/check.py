from backend.config.database import engine, SessionLocal
from backend.config.logger import logger
from sqlalchemy import text
from backend.config.logger import logger

import asyncio

async def test_connection():
    '''
    Hàm dùng để check test xem có kết nối được db không
    
    cách dùng: 
        - asyncio.run(test_connection())
    '''
    logger.info("Starting database connection test")

    try:
        async with engine.connect() as connection:
            logger.info("Database connection established")
            
            result = await connection.exec_driver_sql("SELECT 1")

            value = result.scalar()

            logger.info(
                "Database connection successful | SELECT 1 = %s",
                value,
            )
    except Exception:
        logger.exception("Database connection failed")

    finally:
        await engine.dispose()
        logger.info("Database engine disposed")

async def test_session():
    '''
    Dùng để test session async đã hoạt động chưa
    
    Cách dùng:
     - asyncio.run(test_session())
    '''
    logger.debug("Starting AsyncSession test")

    try:
        async with SessionLocal() as db:
            result = await db.execute(text("SELECT 1"))

            value = result.scalar()

            logger.info(
                "AsyncSession test successful | SELECT 1 = %s",
                value,
            )

    except Exception:
        logger.exception("AsyncSession test failed")


if __name__ == "__main__":
    asyncio.run(test_session())