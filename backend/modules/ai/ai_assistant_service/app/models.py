from backend.core.database import Base
from sqlalchemy import (
    Column,
    String,
    JSON,
    Text,
    Integer
)

class AIToolRegistryModel(Base):
    __tablename__ = "ai_tool_registry"

    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=False)
    embedding = Column(JSON, nullable=False)