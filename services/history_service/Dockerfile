FROM python:3.10-slim

WORKDIR /app
# Copy thư mục src vào trong container
COPY src ./src

# Set PYTHONPATH để Python tìm thấy module src
ENV PYTHONPATH=/app

# Cài các thư viện cần thiết cho History (FastAPI + MySQL + SQLAlchemy)
# Bỏ qua torch/easyocr vì service này không dùng AI
RUN pip install --no-cache-dir \
    fastapi \
    uvicorn \
    sqlalchemy \
    mysql-connector-python \
    requests \
    python-multipart \
    pyjwt

# Mở cổng 8007 (Cổng của History Service)
EXPOSE 8007

# Chạy server
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8007"]