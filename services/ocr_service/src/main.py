from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.controller.ocr_controller import router as ocr_router

app = FastAPI(
    title="OCR Service",
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
    return {"status": "ocr_service ok"}

app.include_router(ocr_router, prefix="/ocr")