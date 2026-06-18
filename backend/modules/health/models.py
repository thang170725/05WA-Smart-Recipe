from sqlalchemy import Column, Integer, Float, String, TIMESTAMP, ForeignKey, Enum, text
from backend.core.database import Base


class HealthMetric(Base):
    __tablename__ = "health_metrics"

    id = Column(Integer, primary_key=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    weight = Column(Float, nullable=False)
    height = Column(Float, nullable=False)

    bmi = Column(Float)
    bmr = Column(Float)
    tdee = Column(Float)

    health_status = Column(String(50))

    recorded_at = Column(
        TIMESTAMP,
        server_default=text("CURRENT_TIMESTAMP")
    )

class HealthHistory(Base):
    __tablename__ = "health_history"

    id = Column(Integer, primary_key=True)
    user_id = Column(
        Integer, 
        ForeignKey("users.id", ondelete='CASCADE')
    )

    month = Column(
        Enum('Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'),
        nullable=False
    )
    bmi_avarage = Column(
        Float,
        nullable=True
    )