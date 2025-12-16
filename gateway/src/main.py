from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.routes.auth_router import router as auth_router
from src.routes.ocr_router import router as ocr_router
from src.routes.summarizer_router import router as summarizer_router
from src.routes.preprocess_router import router as preprocess_router
from src.routes.classifier_router import router as classifier_router
from src.routes.translate_router import router as translate_router
from src.routes.history_router import router as history_router

app = FastAPI(title="API Gateway")

# Thêm CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Hoặc ["http://localhost:3000"] để giới hạn domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all routers
app.include_router(auth_router, prefix="/auth")
app.include_router(ocr_router, prefix="/ocr")
app.include_router(summarizer_router, prefix="/summarizer")
app.include_router(preprocess_router, prefix="/preprocess")
app.include_router(classifier_router, prefix="/classifier")
app.include_router(translate_router, prefix="/translate")
app.include_router(history_router, prefix="/history", tags=["History"])

@app.get("/")
def root():
    return {"message": "Gateway is running"}