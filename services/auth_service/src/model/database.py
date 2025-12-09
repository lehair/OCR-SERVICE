# services/auth_service/src/model/database.py
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Lấy từ biến môi trường (docker-compose), nếu không có thì dùng mặc định
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "mysql+mysqlconnector://ocr_user:123456@mysql:3306/ocr_auth"
)

# Tạo engine kết nối MySQL
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,  # check kết nối trước khi dùng
)

# Session dùng để làm việc với DB trong mỗi request
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base cho các model (User, ...)
Base = declarative_base()
