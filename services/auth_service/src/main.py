# services/auth_service/src/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text, inspect

from src.controller.auth_controller import router as auth_router
from src.model.database import Base, engine, SessionLocal

# ⭐ IMPORT CÁC MODEL ĐỂ SQLAlchemy biết tới bảng
from src.model.user import User


def _ensure_schema():
    """Tạo bảng nếu chưa có + tự thêm cột is_admin (tránh lỗi khi DB đã tồn tại)."""
    Base.metadata.create_all(bind=engine)

    try:
        with engine.begin() as conn:
            insp = inspect(conn)
            cols = [c.get("name") for c in insp.get_columns("users")]
            if "is_admin" not in cols:
                conn.execute(
                    text("ALTER TABLE users ADD COLUMN is_admin BOOLEAN NOT NULL DEFAULT 0")
                )
                print("✅ Added column users.is_admin")
    except Exception as e:
        # Nếu DB chưa sẵn sàng hoặc thiếu quyền ALTER TABLE
        print("⚠️ Schema ensure error:", repr(e))


def _ensure_admin_seed():
    """Nếu chưa có admin nào, gán user đầu tiên thành admin để tránh bị khóa dashboard."""
    db = SessionLocal()
    try:
        # Lưu ý: getattr(User, "is_admin", False) không dùng được trực tiếp trong query,
        # nhưng ở project này User luôn có is_admin sau khi mình cập nhật model.
        has_admin = db.query(User).filter(User.is_admin == True).count() > 0
        if not has_admin:
            first = db.query(User).order_by(User.user_id.asc()).first()
            if first:
                first.is_admin = True
                db.add(first)
                db.commit()
                print(f"✅ Seed admin user: {first.username}")
    except Exception as e:
        print("⚠️ Admin seed error:", repr(e))
    finally:
        db.close()


# chạy lúc service start
_ensure_schema()
_ensure_admin_seed()

app = FastAPI(
    title="Auth Service",
    version="1.0.0",
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
    return {"status": "auth_service ok"}

app.include_router(auth_router, prefix="/auth")
