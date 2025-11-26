# Gateway Service
FROM python:3.10-slim

WORKDIR /app

COPY src ./src
# Set PYTHONPATH để Python tìm module src
ENV PYTHONPATH=/app
RUN pip install --no-cache-dir fastapi uvicorn requests python-multipart

EXPOSE 8010

CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8010"]