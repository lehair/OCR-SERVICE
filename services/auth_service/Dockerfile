FROM python:3.10-slim

WORKDIR /app

# Cài các thư viện cần thiết
RUN pip install --no-cache-dir \
    fastapi \
    pyjwt\
    uvicorn \
    sqlalchemy \
    passlib \
    python-multipart \
    mysql-connector-python

# Copy source
COPY src ./src

# Cho phép import theo src.*
ENV PYTHONPATH=/app

EXPOSE 8001

CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8001"]
