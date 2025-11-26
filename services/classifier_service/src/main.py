from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.controller.classifier_controller import router as classifier_router

app = FastAPI(
    title="Classifier Service",
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
    return {"status": "classifier_service ok"}

app.include_router(classifier_router, prefix="/classifier")