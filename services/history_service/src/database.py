import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Lấy cấu hình từ docker-compose, mặc định trỏ vào mysql container
DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "mysql+mysqlconnector://ocr_user:123456@mysql:3306/ocr_auth"
)

engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()