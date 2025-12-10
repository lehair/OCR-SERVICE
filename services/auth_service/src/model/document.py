# src/model/document.py
from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime
from .database import Base

class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    doc_type = Column(String(50), index=True)   # 'cccd', 'the_sv', 'de_cuong'
    language = Column(String(10), index=True)   # 'vi', 'en'
    created_at = Column(DateTime, default=datetime.utcnow)