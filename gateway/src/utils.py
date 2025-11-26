import requests
from requests.exceptions import RequestException
import logging
import os

# ---------------------------
# Cấu hình logging
# ---------------------------
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s'
)

# ---------------------------
# Hàm gửi request POST
# ---------------------------
def post_request(service_url: str, endpoint: str, json_data=None, files=None, timeout=10):
    """
    Gửi POST request tới microservice.
    
    :param service_url: URL gốc của service (ví dụ: http://auth_service:8001)
    :param endpoint: endpoint tương đối (ví dụ: "/register")
    :param json_data: dict JSON để gửi
    :param files: dict file để gửi
    :param timeout: thời gian timeout
    :return: dict response JSON hoặc lỗi
    """
    url = f"{service_url}{endpoint}"
    try:
        response = requests.post(url, json=json_data, files=files, timeout=timeout)
        response.raise_for_status()
        return response.json()
    except RequestException as e:
        logging.error(f"Request to {url} failed: {str(e)}")
        return {"error": str(e)}

# ---------------------------
# Hàm gửi request GET
# ---------------------------
def get_request(service_url: str, endpoint: str, params=None, timeout=10):
    """
    Gửi GET request tới microservice.
    
    :param service_url: URL gốc của service
    :param endpoint: endpoint tương đối
    :param params: dict params GET
    :param timeout: thời gian timeout
    :return: dict response JSON hoặc lỗi
    """
    url = f"{service_url}{endpoint}"
    try:
        response = requests.get(url, params=params, timeout=timeout)
        response.raise_for_status()
        return response.json()
    except RequestException as e:
        logging.error(f"GET request to {url} failed: {str(e)}")
        return {"error": str(e)}

# ---------------------------
# Hàm lấy URL service từ biến môi trường
# ---------------------------
def get_service_url(env_var: str, default: str):
    """
    Lấy URL service từ biến môi trường, nếu không có thì dùng default.
    """
    return os.getenv(env_var, default)