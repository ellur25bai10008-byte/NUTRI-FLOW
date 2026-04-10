from sqlalchemy import Column, Integer, String, Boolean, DateTime
from database import Base
import datetime

class Habit(Base):
    __tablename__ = "habits"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    is_healthy = Column(Boolean, default=True)  # True = Good, False = Bad
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
