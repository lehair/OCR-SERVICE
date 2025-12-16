FROM python:3.10-slim

WORKDIR /app

# 1. Cài đặt thư viện hệ thống
# SỬA LỖI: Thay "libgl1-mesa-glx" thành "libgl1"
RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# 2. Thiết lập biến môi trường
ENV PYTHONPATH=/app
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# 3. Cài đặt thư viện Python
# (Dùng cache mount hoặc cài thẳng để tận dụng layer caching)
RUN pip install --no-cache-dir \
    "numpy<2" \
    fastapi \
    uvicorn \
    python-multipart \
    requests \
    easyocr \
    --extra-index-url https://download.pytorch.org/whl/cpu \
    torch==2.2.0+cpu \
    torchvision==0.17.0+cpu

# 4. COPY code vào SAU CÙNG
COPY src ./src

EXPOSE 8002

CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8002"]