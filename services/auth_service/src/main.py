from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.controller.auth_controller import router as auth_router
from src.model.database import Base, engine        # 🆕
from src.model import user                         # 🆕 để đảm bảo model User được load

app = FastAPI(
    title="Auth Service",
    version="1.0.0"
)

# 🆕 Tạo bảng trong DB nếu chưa có
Base.metadata.create_all(bind=engine)

# CORS
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
