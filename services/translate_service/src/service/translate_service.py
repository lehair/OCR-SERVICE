import requests
import urllib.parse
import html

class TranslateService:
    def __init__(self):
        self.endpoint = "https://api.mymemory.translated.net/get"
    
    def translate_text(self, text, target_lang='en', source_lang='vi'):
        """
        Dịch văn bản sử dụng MyMemory Translation API
        """
        try:
            # Kiểm tra text rỗng
            if not text or not text.strip():
                return {
                    'success': False,
                    'error': 'Văn bản trống'
                }
            
            # MyMemory API có giới hạn về độ dài văn bản
            if len(text) > 500:
                text = text[:500]
            
            print(f"DEBUG: Translating '{text[:50]}...' from {source_lang} to {target_lang}")
            
            # Mã hóa văn bản để gửi qua URL
            encoded_text = urllib.parse.quote(text)
            
            # Xây dựng URL request
            url = f"{self.endpoint}?q={encoded_text}&langpair={source_lang}|{target_lang}"
            
            print(f"DEBUG: Request URL: {url}")
            
            response = requests.get(url, timeout=10)
            
            print(f"DEBUG: Response status: {response.status_code}")
            
            if response.status_code == 200:
                result = response.json()
                print(f"DEBUG: API Result: {result}")
                
                if result.get('responseStatus') == 200:
                    translated_text = result['responseData']['translatedText']
                    
                    # Xử lý kết quả - MyMemory có thể trả về các ký tự HTML entity
                    translated_text = self._clean_translated_text(translated_text)
                    
                    return {
                        'success': True,
                        'translated_text': translated_text,
                        'source_lang': source_lang,
                        'target_lang': target_lang
                    }
                else:
                    error_msg = result.get('responseDetails', 'Unknown translation error')
                    return {
                        'success': False,
                        'error': f"Lỗi API dịch thuật: {error_msg}"
                    }
            else:
                return {
                    'success': False,
                    'error': f"Lỗi HTTP: {response.status_code}"
                }
                
        except requests.exceptions.Timeout:
            return {
                'success': False,
                'error': 'Timeout - Máy chủ API không phản hồi'
            }
        except requests.exceptions.ConnectionError:
            return {
                'success': False,
                'error': 'Lỗi kết nối - Kiểm tra kết nối internet'
            }
        except Exception as e:
            return {
                'success': False,
                'error': f"Lỗi dịch thuật: {str(e)}"
            }
    
    def _clean_translated_text(self, text):
        """
        Làm sạch văn bản dịch - MyMemory có thể trả về các ký tự HTML entity
        """
        try:
            # Decode HTML entities
            cleaned_text = html.unescape(text)
            return cleaned_text
        except:
            return text
    
    def detect_language(self, text):
        """
        Phát hiện ngôn ngữ
        """
        if not text:
            return 'vi'
            
        vietnamese_chars = set('àáảãạăắằẳẵặâấầẩẫậèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵđ')
        text_lower = text.lower()
        
        # Đếm số ký tự tiếng Việt
        vietnamese_count = sum(1 for char in text_lower if char in vietnamese_chars)
        
        # Nếu có nhiều hơn 2 ký tự tiếng Việt, coi là tiếng Việt
        if vietnamese_count > 2:
            return 'vi'
        else:
            return 'en'