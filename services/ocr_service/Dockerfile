FROM python:3.10-slim

WORKDIR /app

COPY src ./src

# Set PYTHONPATH để Python tìm module src
ENV PYTHONPATH=/app

# Cài torch CPU + easyocr + fastapi
RUN pip install --no-cache-dir \
    "numpy<2" \
    fastapi \
    uvicorn \
    easyocr \
    python-multipart\
    torch==2.2.0+cpu \
    torchvision==0.17.0+cpu \
    -f https://download.pytorch.org/whl/torch_stable.html

EXPOSE 8002

CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8002"]