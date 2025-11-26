FROM python:3.10-slim

WORKDIR /app

RUN pip install --no-cache-dir fastapi uvicorn sentence-transformers

COPY src ./src
# Set PYTHONPATH để Python tìm module src
ENV PYTHONPATH=/app
EXPOSE 8005
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8005"]