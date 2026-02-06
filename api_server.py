from flask import Flask, request, jsonify
from flask_cors import CORS
from data_loader import DataLoader
from llm_interface import LLMInterface
from user_manager import UserManager
from ocr_engine import OCREngine
from web_search import WebSearcher
import os
import tempfile
import base64
from datetime import datetime
import re

app = Flask(__name__)
# Allow CORS for all domains on all routes, specifically for API
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Create uploads directory
UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), 'uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.before_request
def log_request():
    print(f"📥 API Request: {request.method} {request.path}")

# Initialize system
print("🚀 Sistem v3.0 (COMPLETE REWRITE) Başlatılıyor...")
loader = DataLoader(".")
loader.load_all_data()
loader.load_general_qa()  # Load Q&A knowledge base for RAG enhancement
llm = LLMInterface()
user_mgr = UserManager()
ocr = OCREngine(use_gpu=False)  # Initialize OCR engine
web_searcher = WebSearcher()  # Initialize web search for verification

@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    success, msg = user_mgr.register_user(
        data.get("name"), 
        data.get("surname"), 
        data.get("email"), 
        data.get("password")
    )
    if success:
        return jsonify({"success": True, "message": msg})
    return jsonify({"success": False, "message": msg}), 400

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    profile, msg = user_mgr.authenticate_user(data.get("email"), data.get("password"))
    if profile:
        return jsonify({"success": True, "profile": profile})
    return jsonify({"success": False, "message": msg}), 401

@app.route('/api/profile', methods=['POST'])
def get_profile():
    data = request.json
    email = data.get("email")
    if not email:
        return jsonify({"error": "Email required"}), 400
        
    profile = user_mgr.get_user_profile(email)
    if profile:
        return jsonify(profile)
    return jsonify({"error": "User not found"}), 404

@app.route('/api/analyze-image', methods=['POST'])
def analyze_image():
    """
    Accepts an image, runs improved OCR, and sends text DIRECTLY to fine-tuned LLM.
    """
    try:
        data = request.json
        user_email = data.get('email')
        image_data = data.get('image')
        
        if not image_data:
            return jsonify({"success": False, "message": "Görsel gerekli"}), 400
        
        if ',' in image_data:
            image_data = image_data.split(',')[1]
        
        image_bytes = base64.b64decode(image_data)
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filepath = os.path.join(UPLOAD_FOLDER, f"upload_{timestamp}.jpg")
        
        with open(filepath, 'wb') as f:
            f.write(image_bytes)
        
        # Run OCR (Now enriched with OpenCV)
        ocr_results = ocr.extract_text(filepath)
        print(f"🔍 OCR Sonuçları: {ocr_results}")
        
        if not ocr_results:
            return jsonify({
                "success": False,
                "message": "Görselden metin okunamadı."
            })
        
        query_text = " ".join(ocr_results)
        
        # Direct LLM Analysis (No DB Search)
        # Using a prompt that asks the model to identify what it sees
        context_prompt = f"Görseldeki şu metinleri okudum: '{query_text}'. Bu bir ilaç veya besin etiketi olabilir. Analiz et ve varsa uyarılarını sırala."
        llm_response = llm.analyze_direct(context_prompt)
        
        # Log to history
        if user_email:
            risk_level = "info"
            if "risk" in llm_response.lower() or "dikkat" in llm_response.lower():
                risk_level = "medium"
            if "tehlikeli" in llm_response.lower() or "kullanmayınız" in llm_response.lower():
                risk_level = "high"
                
            user_mgr.log_interaction_v2(
                user_email,
                f"[📷 Görsel] {query_text[:40]}...",
                risk_level,
                llm_response[:100] + "...",
                llm_response
            )
        
        return jsonify({
            "success": True,
            "reply": llm_response,
            "ocr_results": ocr_results,
            "detected_drugs": [], # Can't guarantee extraction without DB, leaving empty for now or could parse LLM
            "detected_foods": []
        })
        
    except Exception as e:
        print(f"❌ Image analysis error: {e}")
        return jsonify({"success": False, "message": str(e)}), 500

@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.json
    user_message = data.get('message', '')
    user_email = data.get('email')
    
    if not user_message:
        return jsonify({"reply": "Lütfen bir mesaj yazın."})

    # =========================================
    # AUTOMATIC MEDICATION EXTRACTION
    # =========================================
    detected_medications = []
    added_medications = []
    
    # Check for medication usage patterns
    usage_patterns = [
        r'([\w\s]+?)\s+(?:kullanıyorum|kullanmaktayım|alıyorum|içiyorum)',
        r'(?:kullanıyorum|alıyorum)\s+([\w\s,]+)',
    ]
    
    msg_lower = user_message.lower()
    if any(trigger in msg_lower for trigger in ['kullanıyorum', 'kullanmaktayım', 'alıyorum', 'içiyorum']):
        # Extract potential drug names
        # Split by common separators
        cleaned = re.sub(r'\s+', ' ', user_message)
        
        # Remove trigger words and split
        for trigger in ['kullanıyorum', 'kullanmaktayım', 'alıyorum', 'içiyorum']:
            cleaned = cleaned.replace(trigger, '|||')  # Mark for split
        
        # Split by multiple delimiters
        parts = re.split(r'[,\|\|\|]|\sve\s|\sile\s', cleaned)
        
        for part in parts:
            part = part.strip()
            if len(part) > 2 and len(part) < 50:  # Reasonable drug name length
                # Try to validate against drug database
                drug_data = loader.search_drug(part)
                if drug_data:
                    detected_medications.append({
                        "name": part.title(),
                        "validated": True,
                        "data": drug_data
                    })
                    added_medications.append(part.title())
                    print(f"💊 İlaç Algılandı ve Doğrulandı: {part}")
    
    # Build medication confirmation message
    medication_notice = ""
    if added_medications:
        meds_str = ", ".join(added_medications)
        medication_notice = f"\n\n✅ **İlaç Listenize Eklendi:** {meds_str}\n_Profilinizden ilaç listesini güncelleyebilirsiniz._"

    # RAG-Enhanced LLM Call: Search Q&A knowledge base first
    print(f"💬 Chat İsteği (Q&A Destekli): {user_message}")
    
    # Search for relevant Q&A from knowledge base
    qa_results = loader.search_general_qa(user_message, top_k=2)
    if qa_results:
        print(f"📚 İlgili Q&A bulundu: {len(qa_results)} kayıt (skor: {qa_results[0]['score']:.2f})")
    
    # Use Q&A-enhanced analysis
    response_text = llm.analyze_with_qa_context(user_message, qa_results)

    # =========================================
    # CONFIDENCE SCORE CALCULATION (Web Verified)
    # =========================================
    confidence_score = 65  # Base score
    confidence_factors = []
    web_sources = []
    
    # Primary Factor: Web Search Verification
    try:
        web_result = web_searcher.verify_response(user_message, response_text)
        web_score = web_result.get("score", 65)
        web_sources = web_result.get("sources", [])
        explanation = web_result.get("explanation", "")
        
        confidence_score = web_score
        if explanation:
            confidence_factors.append(f"Web Doğrulaması: {explanation}")
        print(f"🌐 Web Verification: {web_score}% - Sources: {len(web_sources)}")
    except Exception as e:
        print(f"⚠️ Web verification failed: {e}")
        confidence_factors.append("Web doğrulaması yapılamadı")
    
    # Secondary Factor: Q&A Knowledge Base Match (bonus +10)
    if qa_results and qa_results[0]['score'] > 0.5:
        qa_bonus = 10
        confidence_score = min(95, confidence_score + qa_bonus)
        confidence_factors.append(f"Bilgi tabanı eşleşmesi: +{qa_bonus}%")
    
    # Secondary Factor: Medication Database Validation (bonus +10)
    if detected_medications:
        db_bonus = min(10, len(detected_medications) * 5)
        confidence_score = min(95, confidence_score + db_bonus)
        confidence_factors.append(f"Veritabanı doğrulaması: +{db_bonus}%")
    
    # Penalty: Uncertainty phrases
    if "emin değilim" in response_text.lower() or "bilmiyorum" in response_text.lower():
        confidence_score = max(30, confidence_score - 15)
        confidence_factors.append("Bilgi eksikliği: -15%")
    
    # Cap confidence between 30-95%
    confidence_score = max(30, min(95, confidence_score))
    
    # Build confidence display
    if confidence_score >= 80:
        confidence_emoji = "🟢"
        confidence_label = "Yüksek"
    elif confidence_score >= 60:
        confidence_emoji = "🟡"
        confidence_label = "Orta"
    else:
        confidence_emoji = "🔴"
        confidence_label = "Düşük"
    
    # Include sources in display if available
    sources_text = ""
    if web_sources:
        sources_text = "\n📎 Kaynaklar: " + ", ".join([f"[{i+1}]({url})" for i, url in enumerate(web_sources[:2])])
    
    confidence_notice = f"\n\n---\n{confidence_emoji} **Doğruluk Skoru:** %{confidence_score} ({confidence_label}){sources_text}"
    
    print(f"📊 Final Güven Skoru: {confidence_score}% - Faktörler: {confidence_factors}")

    # Simple Risk Heuristic based on text content
    risk_level = "info"
    lower_resp = response_text.lower()
    if "ölümcül" in lower_resp or "acil" in lower_resp or "kullanmayınız" in lower_resp:
        risk_level = "high"
    elif "dikkat" in lower_resp or "uyarı" in lower_resp or "risk" in lower_resp:
        risk_level = "medium"

    # Save History
    if user_email:
         user_mgr.log_interaction_v2(
             user_email, 
             user_message[:50] + "..." if len(user_message) > 50 else user_message, 
             risk_level, 
             response_text[:100] + "..." if len(response_text) > 100 else response_text,
             response_text
         )

    # Append medication notice and confidence to response
    final_response = response_text + medication_notice + confidence_notice

    return jsonify({
        "reply": final_response, 
        "detected_drugs": added_medications,
        "confidence_score": confidence_score,
        "is_authenticated": bool(user_email)
    })

@app.route('/api/update-health-profile', methods=['POST'])
def update_health_profile():
    """Updates user's health profile with diseases, allergies, medications."""
    data = request.json
    email = data.get("email")
    if not email:
        return jsonify({"success": False, "message": "Email gerekli"}), 400
    
    diseases = data.get("diseases")
    allergies = data.get("allergies")
    medications = data.get("medications")
    
    success = user_mgr.update_user_health_profile(email, diseases, allergies, medications)
    
    if success:
        return jsonify({"success": True, "message": "Sağlık profili güncellendi"})
    return jsonify({"success": False, "message": "Kullanıcı bulunamadı"}), 404

@app.route('/api/health-advice', methods=['POST'])
def get_health_advice():
    """Returns personalized health advice based on user's profile."""
    data = request.json
    email = data.get("email")
    if not email:
        return jsonify({"success": False, "message": "Email gerekli"}), 400
    
    advice = user_mgr.get_health_advice(email)
    profile_complete = user_mgr.is_profile_complete(email)
    
    return jsonify({
        "success": True, 
        "advice": advice,
        "profile_complete": profile_complete
    })

@app.route('/api/profile-status', methods=['POST'])
def get_profile_status():
    """Checks if user has completed their health profile."""
    data = request.json
    email = data.get("email")
    if not email:
        return jsonify({"profile_complete": False}), 400
    
    return jsonify({
        "profile_complete": user_mgr.is_profile_complete(email)
    })

if __name__ == '__main__':
    app.run(port=5000, debug=True)
