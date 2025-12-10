from datetime import datetime
from sqlalchemy import func
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from src.model.database import SessionLocal
from src.model.user import User
from src.model.document import Document
from passlib.context import CryptContext

router = APIRouter()

# Dùng pbkdf2_sha256 để hash mật khẩu
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


class RegisterRequest(BaseModel):
    username: str
    password: str
    full_name: str | None = None


class LoginRequest(BaseModel):
    username: str
    password: str


class UserResponse(BaseModel):
    username: str
    full_name: str | None = None


# Response cho API thống kê đăng nhập
class LoginStatsResponse(BaseModel):
    total_users: int        # tổng số tài khoản
    logged_in_users: int    # số user đã từng đăng nhập (login_count > 0)
    total_logins: int       # tổng số lượt đăng nhập (sum login_count)


class DocumentLogRequest(BaseModel):
    doc_type: str
    language: str


# ================== AUTH ==================
@router.post("/register", response_model=UserResponse)
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    # kiểm tra trùng username
    existing = db.query(User).filter(User.username == payload.username).first()
    if existing:
        raise HTTPException(status_code=400, detail="Tên đăng nhập đã tồn tại")

    user = User(
        username=payload.username,
        full_name=payload.full_name or payload.username,
        hashed_password=hash_password(payload.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return UserResponse(username=user.username, full_name=user.full_name)


@router.post("/login", response_model=UserResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == payload.username).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Sai tên đăng nhập hoặc mật khẩu")

    # CẬP NHẬT LỊCH SỬ ĐĂNG NHẬP
    user.login_count = (user.login_count or 0) + 1
    user.last_login_at = datetime.utcnow()
    db.add(user)
    db.commit()
    db.refresh(user)

    return UserResponse(username=user.username, full_name=user.full_name)


# ================== LOGIN STATS (DASHBOARD) ==================
@router.get("/stats/login", response_model=LoginStatsResponse)
def get_login_stats(db: Session = Depends(get_db)):
    # tổng số user
    total_users = db.query(User).count()

    # số user đã từng đăng nhập (login_count > 0)
    logged_in_users = db.query(User).filter(User.login_count > 0).count()

    # tổng số lượt đăng nhập
    total_logins = db.query(func.sum(User.login_count)).scalar() or 0

    return LoginStatsResponse(
        total_users=total_users,
        logged_in_users=logged_in_users,
        total_logins=total_logins,
    )


# ================== DOCUMENT LOG ==================
@router.post("/docs/log")
def log_document(payload: DocumentLogRequest, db: Session = Depends(get_db)):
    """
    Được gateway / các service khác gọi để log một tài liệu đã xử lý
    (doc_type, language).
    """
    doc = Document(doc_type=payload.doc_type, language=payload.language)
    db.add(doc)
    db.commit()
    db.refresh(doc)
    return {"id": doc.id}


# ================== DOCUMENT STATS (DASHBOARD) ==================
@router.get("/stats/docs")
def document_stats(db: Session = Depends(get_db)):
    """
    Trả về thống kê tài liệu để Dashboard hiển thị:
    - total_docs: tổng số bản ghi trong bảng documents
    - by_type:  [{doc_type, count}, ...]
    - by_language: [{language, count}, ...]
    """
    # Tổng số document
    total_docs = db.query(Document).count()

    # Đếm theo loại tài liệu
    by_type_rows = (
        db.query(Document.doc_type, func.count().label("count"))
        .group_by(Document.doc_type)
        .all()
    )
    by_type = [
        {"doc_type": doc_type, "count": cnt}
        for doc_type, cnt in by_type_rows
    ]

    # Đếm theo ngôn ngữ
    by_lang_rows = (
        db.query(Document.language, func.count().label("count"))
        .group_by(Document.language)
        .all()
    )
    by_language = [
        {"language": lang, "count": cnt}
        for lang, cnt in by_lang_rows
    ]

    return {
        "total_docs": total_docs,
        "by_type": by_type,
        "by_language": by_language,
    }
