# src/model/database.py
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# SQLite DB lưu trong file users.db (cùng thư mục làm việc của app)
SQLALCHEMY_DATABASE_URL = "sqlite:///./users.db"

# connect_args chỉ dùng cho SQLite
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()
