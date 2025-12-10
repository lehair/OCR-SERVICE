from sqlalchemy import Column, Integer, String, DateTime, func
from src.model.database import Base

class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255))
    doc_type = Column(String(50), nullable=False)   # can_cuoc_cong_dan | the_sinh_vien | de_cuong
    language = Column(String(10), nullable=False)   # vi | en
    created_at = Column(DateTime, server_default=func.now())

