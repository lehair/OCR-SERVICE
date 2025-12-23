from fastapi import APIRouter, HTTPException, Depends, Query, Header
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional, List
import os
import jwt

from src.database import get_db
from src.model import HistoryRecord

router = APIRouter()

# JWT secret phải khớp Auth Service
JWT_SECRET = os.getenv('JWT_SECRET', 'OCRSUITE_SECRET_KEY_123456')
JWT_ALGO = os.getenv('JWT_ALGO', 'HS256')


def require_admin(authorization: str | None = Header(default=None)):
    if not authorization or not authorization.startswith('Bearer '):
        raise HTTPException(status_code=401, detail='Missing Bearer token')
    token = authorization.split(' ', 1)[1].strip()
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGO])
    except Exception:
        raise HTTPException(status_code=401, detail='Invalid token')
    if not payload.get('is_admin'):
        raise HTTPException(status_code=403, detail='Admin only')
    return payload


# --- Models DTO (Dữ liệu đầu vào/ra) ---
class HistoryCreate(BaseModel):
    user_id: int
    filename: str
    ocr_text: str
    doc_type: str = "Chưa phân loại"
    language: str = "vi"

class HistoryResponse(BaseModel):
    id: int
    user_id: int
    filename: str
    doc_type: str
    language: str
    created_at: str

# ================== 1. API LƯU (SAVE) ==================
# Được gọi bởi OCR Service sau khi xử lý xong ảnh
@router.post("/save")
def save_history(item: HistoryCreate, db: Session = Depends(get_db)):
    try:
        new_record = HistoryRecord(
            user_id=item.user_id,
            filename=item.filename,
            ocr_text=item.ocr_text,
            doc_type=item.doc_type,
            language=item.language
        )
        db.add(new_record)
        db.commit()
        db.refresh(new_record)
        return {"message": "Saved successfully", "id": new_record.id}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database Error: {str(e)}")

# ================== 2. API BROWSER (LIST) ==================
# Hiển thị danh sách lịch sử cho Frontend
@router.get("/list/{user_id}")
def get_history_list(
    user_id: int, 
    doc_type: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(HistoryRecord).filter(HistoryRecord.user_id == user_id)
    
    # Lọc theo loại tài liệu (nếu có chọn filter)
    if doc_type and doc_type != "All":
        query = query.filter(HistoryRecord.doc_type == doc_type)
    
    # Sắp xếp: Mới nhất lên đầu
    records = query.order_by(HistoryRecord.created_at.desc()).all()
    return {"data": records}

# ================== 3. API DASHBOARD (STATS) ==================
# Trả về số liệu để vẽ biểu đồ
@router.get("/stats/{user_id}")
def get_dashboard_stats(user_id: int, db: Session = Depends(get_db), _: dict = Depends(require_admin)):
    # A. Tổng số file
    total_files = db.query(HistoryRecord).filter(HistoryRecord.user_id == user_id).count()
    
    # B. Thống kê theo Loại (Doc Type) -> Vẽ biểu đồ tròn
    type_query = (
        db.query(HistoryRecord.doc_type, func.count(HistoryRecord.id))
        .filter(HistoryRecord.user_id == user_id)
        .group_by(HistoryRecord.doc_type)
        .all()
    )
    # Chuyển thành dạng: [{"type": "CCCD", "count": 5}, ...]
    by_type = [{"type": row[0], "count": row[1]} for row in type_query]

    # C. Thống kê theo Ngôn ngữ (Language) -> Vẽ biểu đồ cột
    lang_query = (
        db.query(HistoryRecord.language, func.count(HistoryRecord.id))
        .filter(HistoryRecord.user_id == user_id)
        .group_by(HistoryRecord.language)
        .all()
    )
    by_language = [{"language": row[0], "count": row[1]} for row in lang_query]
    
    return {
        "user_id": user_id,
        "total_files": total_files,
        "by_type": by_type,
        "by_language": by_language
    }