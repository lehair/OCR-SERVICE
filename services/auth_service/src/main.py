# services/auth_service/src/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.controller.auth_controller import router as auth_router
from src.model.database import Base, engine

# ⭐ IMPORT CÁC MODEL ĐỂ SQLAlchemy biết tới bảng
from src.model.user import User          # nếu chưa import

# Tạo bảng trong MySQL (nếu chưa có)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Auth Service",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"status": "auth_service ok"}

app.include_router(auth_router, prefix="/auth")
