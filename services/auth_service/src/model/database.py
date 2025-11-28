from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Dùng file users.db nằm cùng thư mục với Dockerfile (trong container là /app/users.db)
DATABASE_URL = "sqlite:///./users.db"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()
