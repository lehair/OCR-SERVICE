from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime
from .database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    full_name = Column(String(100))
    hashed_password = Column(String(255), nullable=False)

    # ⭐ THÊM 2 CỘT NÀY
    login_count = Column(Integer, nullable=False, default=0)
    last_login_at = Column(DateTime, nullable=True)
