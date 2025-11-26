from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.controller.auth_controller import router as auth_router

app = FastAPI(
    title="Auth Service",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check
@app.get("/health")
def health():
    return {"status": "auth_service ok"}

app.include_router(auth_router, prefix="/auth")