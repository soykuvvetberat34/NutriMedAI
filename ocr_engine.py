import os
import cv2
import numpy as np

class OCREngine:
    def __init__(self, use_gpu=False):
        self.reader = None
        self.use_gpu = use_gpu
        self.engine_type = "easyocr" # Default
        self._initialize_engine()

    def _initialize_engine(self):
        """
        Try to initialize EasyOCR, fallback to Pytesseract.
        """
        try:
            import easyocr
            print("🚀 EasyOCR Başlatılıyor (GPU: {})...".format(self.use_gpu))
            # language 'tr' for Turkish, 'en' for English
            self.reader = easyocr.Reader(['tr', 'en'], gpu=self.use_gpu)
            self.engine_type = "easyocr"
        except ImportError:
            try:
                import pytesseract
                from PIL import Image
                print("⚠️  EasyOCR bulunamadı. Pytesseract kullanılıyor.")
                self.engine_type = "pytesseract"
                self.pil_image = Image
                self.pytesseract = pytesseract
            except ImportError:
                print("❌ HATA: Hiçbir OCR kütüphanesi bulunamadı ve Mock motoru devre dışı bırakıldı.")
                self.engine_type = "none"

    def preprocess_image(self, image_path):
        """
        Uses OpenCV to preprocess the image for better OCR results.
        """
        img = cv2.imread(image_path)
        if img is None:
            return None

        # 1. Convert to Grayscale
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

        # 2. Rescale if too small (upscaling helps OCR)
        height, width = gray.shape
        if height < 500:
            scale = 2
            gray = cv2.resize(gray, None, fx=scale, fy=scale, interpolation=cv2.INTER_CUBIC)

        # 3. Apply Gaussian Blur to reduce noise
        blurred = cv2.GaussianBlur(gray, (5, 5), 0)

        # 4. Adaptive Thresholding (good for variable lighting)
        # binary = cv2.adaptiveThreshold(gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, 
        #                                cv2.THRESH_BINARY, 11, 2)
        
        # Return the processed image (OCR Reader usually takes numpy array)
        return gray
        
        return img 

    def extract_text(self, image_path):
        """
        Extracts text from an image file.
        Returns: list of strings (detected text lines).
        """
        if not os.path.exists(image_path):
            return ["Hata: Resim dosyası bulunamadı."]

        results = []
        try:
            # Preprocess (Read image using OpenCV)
            processed_img = self.preprocess_image(image_path)
            if processed_img is None:
                return ["Hata: Resim okunamadı."]

            if self.engine_type == "easyocr":
                print(f"📸 Resim taranıyor (OpenCV + EasyOCR): {image_path}")
                # EasyOCR accepts numpy array (image) directly
                detections = self.reader.readtext(processed_img, detail=0)
                # Filter short noise
                results = [text for text in detections if len(text) > 2]
            
            elif self.engine_type == "pytesseract":
                # Convert back to PIL for pytesseract
                img_pil = self.pil_image.fromarray(cv2.cvtColor(processed_img, cv2.COLOR_BGR2RGB))
                text = self.pytesseract.image_to_string(img_pil, lang='tur+eng')
                results = [line.strip() for line in text.split('\n') if len(line.strip()) > 2]
            
            elif self.engine_type == "none":
                return ["Hata: OCR motoru başlatılamadı."]
                
        except Exception as e:
            print(f"❌ OCR Hatası: {e}")
            return []

        print(f"🔍 OCR Sonuçları: {results}")
        return results

if __name__ == "__main__":
    ocr = OCREngine()
    print("Motor:", ocr.engine_type)
