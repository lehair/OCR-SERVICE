FROM python:3.10-slim

WORKDIR /app

# Copy mã nguồn
COPY src ./src
# Set PYTHONPATH để Python tìm module src
ENV PYTHONPATH=/app
# Cài các package Python cần thiết
RUN pip install --no-cache-dir fastapi uvicorn opencv-python-headless numpy python-multipart

# Expose port
EXPOSE 8004

# Chạy app
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8004"]