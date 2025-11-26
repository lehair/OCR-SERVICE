from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.controller.preprocess_controller import router as preprocess_router

app = FastAPI(
    title="Preprocess Service",
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
    return {"status": "preprocess_service ok"}

app.include_router(preprocess_router, prefix="/preprocess")