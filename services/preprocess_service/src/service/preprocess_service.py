import cv2
import numpy as np

class PreprocessService:
    """Service xử lý ảnh trước OCR: deskew, sharpen, threshold"""

    def sharpen(self, img: np.ndarray) -> np.ndarray:
        """Làm nét ảnh (sharpen)"""
        kernel = np.array([[0, -1, 0],
                           [-1, 5, -1],
                           [0, -1, 0]])
        return cv2.filter2D(img, -1, kernel)

    def threshold(self, img: np.ndarray) -> np.ndarray:
        """Nhị phân hóa ảnh với Otsu threshold, trả về ảnh 3 kênh BGR"""
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        _, th = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        # Convert lại sang BGR để tránh lỗi khi encode PNG
        return cv2.cvtColor(th, cv2.COLOR_GRAY2BGR)

    def deskew(self, img: np.ndarray) -> np.ndarray:
        """Chỉnh nghiêng ảnh, an toàn với ảnh trắng"""
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        gray = cv2.bitwise_not(gray)
        coords = np.column_stack(np.where(gray > 0))

        if coords.size == 0:
            # Ảnh trắng hoàn toàn, trả lại ảnh gốc
            return img

        angle = cv2.minAreaRect(coords)[-1]
        if angle < -45:
            angle = -(90 + angle)
        else:
            angle = -angle

        (h, w) = img.shape[:2]
        M = cv2.getRotationMatrix2D((w // 2, h // 2), angle, 1.0)
        rotated = cv2.warpAffine(img, M, (w, h),
                                 flags=cv2.INTER_CUBIC,
                                 borderMode=cv2.BORDER_REPLICATE)
        return rotated
