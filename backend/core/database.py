from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.orm import declarative_base
from dotenv import load_dotenv
import os

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL", default="Empty")

if DATABASE_URL == "Empty":
    raise ValueError("DATABASE_URL IS EMPTY OR ERROR")

engine = create_engine(
    url=DATABASE_URL, 
    echo=True
)

SessionLocal = sessionmaker(bind=engine, autoflush=False)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
