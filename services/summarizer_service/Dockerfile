FROM python:3.10-slim

WORKDIR /app

# Cài git chỉ khi cần clone repo trong container
RUN apt-get update && apt-get install -y git && rm -rf /var/lib/apt/lists/*
RUN pip install --no-cache-dir fastapi uvicorn python-multipart
# Copy mã nguồn
COPY src ./src
# Set PYTHONPATH để Python tìm module src
ENV PYTHONPATH=/app
# Expose port
EXPOSE 8003

# Chạy app
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8003"]
