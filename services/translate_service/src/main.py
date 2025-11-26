from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.controller.translate_controller import router as translate_router

app = FastAPI(
    title="Translate Service",
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
    return {"status": "translate_service ok"}

app.include_router(translate_router, prefix="/translate")