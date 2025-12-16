from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.sql import func
from src.database import Base

class HistoryRecord(Base):
    __tablename__ = "records"  # Tên bảng trong MySQL

    id = Column(Integer, primary_key=True, index=True)
    
    # Thông tin người dùng
    user_id = Column(Integer, index=True, nullable=False)

    # Thông tin file
    filename = Column(String(255))
    ocr_text = Column(Text)  # Nội dung văn bản dài
    
    # Thông tin phân loại (Lấy từ ý tưởng Document cũ của bạn)
    doc_type = Column(String(50), index=True, default="Chưa phân loại") # VD: cccd, hoadon
    language = Column(String(10), index=True, default="vi")             # VD: vi, en
    
    # Thời gian
    created_at = Column(DateTime(timezone=True), server_default=func.now())