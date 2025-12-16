from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.database import engine, Base
from src.controller import history_controller

# 👇 QUAN TRỌNG: Import Model để SQLAlchemy nhận diện bảng cần tạo
from src.model import HistoryRecord 

# Tự động tạo bảng 'records' trong MySQL nếu chưa có
Base.metadata.create_all(bind=engine)

app = FastAPI(title="History Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def health():
    return {"status": "History Service is running with MySQL"}

# Gắn router
app.include_router(history_controller.router, prefix="/api/history")