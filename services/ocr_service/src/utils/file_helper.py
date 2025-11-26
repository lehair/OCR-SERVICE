import os
import shutil
from fastapi import UploadFile

TEMP_DIR = "temp_uploads"

def ensure_dir(path):
    if not os.path.exists(path):
        os.makedirs(path)

def save_temp_file(upload_file: UploadFile) -> str:
    ensure_dir(TEMP_DIR)
    file_path = os.path.join(TEMP_DIR, upload_file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(upload_file.file, buffer)
    return file_path