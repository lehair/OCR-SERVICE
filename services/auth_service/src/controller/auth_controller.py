from datetime import datetime, timedelta
from sqlalchemy import func
from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel
from sqlalchemy.orm import Session
import jwt  # Cần cài: pip install pyjwt

from src.model.database import SessionLocal
from src.model.user import User
from passlib.context import CryptContext

router = APIRouter()

# Cấu hình JWT
SECRET_KEY = "OCRSUITE_SECRET_KEY_123456" # Nên để trong .env
ALGORITHM = "HS256"

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

# --- Hàm tạo Token ---
def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=60) # Token sống 60 phút
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# --- Models ---
class RegisterRequest(BaseModel):
    username: str
    password: str
    full_name: str | None = None

class LoginRequest(BaseModel):
    username: str
    password: str

# ✅ CẬP NHẬT: Response trả về Token và ID
class LoginResponse(BaseModel):
    user_id: int
    username: str
    full_name: str | None = None
    is_admin: bool = False
    access_token: str
    token_type: str = "bearer"

# Response cho API thống kê Login (Giữ lại cái này ok)
class LoginStatsResponse(BaseModel):
    total_users: int        
    logged_in_users: int    
    total_logins: int       



# --- AUTHZ: yêu cầu Bearer token và quyền admin ---
def require_admin(authorization: str | None = Header(default=None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing Bearer token")
    token = authorization.split(" ", 1)[1].strip()
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")
    if not payload.get("is_admin"):
        raise HTTPException(status_code=403, detail="Admin only")
    return payload

# ================== AUTH API ==================
@router.post("/register") # Bỏ response_model để trả về tự do hoặc định nghĩa lại
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.username == payload.username).first()
    if existing:
        raise HTTPException(status_code=400, detail="Tên đăng nhập đã tồn tại")

    # Nếu chưa có admin nào, user đầu tiên sẽ là admin
    has_admin = db.query(User).filter(getattr(User, "is_admin", False) == True).count() > 0
    is_first_admin = (db.query(User).count() == 0) or (not has_admin)

    user = User(
        username=payload.username,
        full_name=payload.full_name or payload.username,
        hashed_password=hash_password(payload.password),
        is_admin=is_first_admin,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return {"message": "Đăng ký thành công", "username": user.username}


@router.post("/login", response_model=LoginResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == payload.username).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Sai tên đăng nhập hoặc mật khẩu")

    # Cập nhật lịch sử đăng nhập
    user.login_count = (user.login_count or 0) + 1
    user.last_login_at = datetime.utcnow()
    db.add(user)
    db.commit()
    db.refresh(user)

    # ✅ TẠO TOKEN
    access_token = create_access_token(data={"sub": user.username, "id": user.user_id, "is_admin": bool(getattr(user, "is_admin", False))})

    # ✅ TRẢ VỀ ĐẦY ĐỦ THÔNG TIN
    return LoginResponse(
        user_id=user.user_id, # Frontend cần cái này để lưu History
        username=user.username,
        full_name=user.full_name,
        is_admin=bool(getattr(user, "is_admin", False)),
        access_token=access_token,
        token_type="bearer"
    )

# ================== LOGIN STATS (Giữ lại cái này) ==================
@router.get("/stats/login", response_model=LoginStatsResponse)
def get_login_stats(db: Session = Depends(get_db), _: dict = Depends(require_admin)):
    total_users = db.query(User).count()
    logged_in_users = db.query(User).filter(User.login_count > 0).count()
    total_logins = db.query(func.sum(User.login_count)).scalar() or 0

    return LoginStatsResponse(
        total_users=total_users,
        logged_in_users=logged_in_users,
        total_logins=total_logins,
    )