
import requests
import json

class LLMInterface:
    def __init__(self, model_name="llama-3.1-8b-turkish-drug-finetuned"):
        self.base_url = "http://localhost:11434/api/generate"
        self.model_name = model_name
        self.validate_model()

    def validate_model(self):
        """Checks if model exists, falls back to others if not."""
        try:
            # List available models
            response = requests.get("http://localhost:11434/api/tags", timeout=2)
            if response.status_code == 200:
                models = [m['name'] for m in response.json().get('models', [])]
                # Normalize names (handle :latest)
                models_base = [m.split(':')[0] for m in models]
                
                if self.model_name not in models and self.model_name not in models_base:
                    print(f"⚠️  UYARI: '{self.model_name}' modeli bulunamadı! (Mevcut Modeller: {models})")
                    print("⚠️  Eğitilmiş modelinizi 'ollama create' ile oluşturduğunuzdan emin olun.")
                    
                    # Fallback only if absolutely necessary, but warn heavily
                    fallbacks = ["llama3.1", "llama3", "qwen2.5", "gemma2"]
                    for fb in fallbacks:
                        if fb in models or fb in models_base:
                            print(f"🔄 Geçici olarak '{fb}' modeline geçiliyor (Eğitilmiş model yok).")
                            self.model_name = fb
                            return
        except Exception as e:
            print(f"⚠️  Model kontrolü yapılamadı: {e}")

    def check_connection(self):
        """Checks if Ollama is running."""
        try:
            response = requests.get("http://localhost:11434/", timeout=2)
            return response.status_code == 200
        except:
            return False

    def analyze_direct(self, user_query):
        """
        Sends the query directly to the fine-tuned model without RAG context.
        """
        # System prompt matching the training data style
        prompt = f"""<|begin_of_text|><|start_header_id|>system<|end_header_id|>

Sen yardımcı bir ilaç asistanısın. Her zaman Türkçe yanıt ver.<|eot_id|><|start_header_id|>user<|end_header_id|>

{user_query}<|eot_id|><|start_header_id|>assistant<|end_header_id|>
"""
        try:
            print(f"🧠 LLM Direkt Analizi: {user_query[:50]}...")
            
            payload = {
                "model": self.model_name,
                "prompt": prompt,
                "stream": True,
                "options": {
                    "temperature": 0.3, # Low temperature for factual accuracy
                    "stop": ["<|eot_id|>"]
                }
            }
            
            response = requests.post(self.base_url, json=payload, timeout=120, stream=True)
            response.raise_for_status()
            
            full_response = ""
            for line in response.iter_lines():
                if line:
                    try:
                        json_obj = json.loads(line.decode('utf-8'))
                        chunk = json_obj.get("response", "")
                        full_response += chunk
                        if json_obj.get("done", False):
                            break
                    except json.JSONDecodeError:
                        continue
                        
            return full_response if full_response else "Analiz yanıtı alınamadı."
            
        except Exception as e:
            return f"⚠️ LLM Hatası: {str(e)}"

    def analyze_with_qa_context(self, user_query, qa_results=None):
        """
        Analyzes user query with Q&A knowledge base context for better responses.
        qa_results: List of {question, answer, score} from DataLoader.search_general_qa()
        """
        # Build context from Q&A results
        qa_context = ""
        if qa_results:
            qa_context = "\n\n--- İLGİLİ BİLGİ TABANI ---\n"
            for i, qa in enumerate(qa_results[:2], 1):  # Max 2 relevant Q&A pairs
                qa_context += f"\n**Örnek Soru {i}:** {qa['question']}\n"
                qa_context += f"**Uzman Cevabı:** {qa['answer'][:500]}...\n" if len(qa['answer']) > 500 else f"**Uzman Cevabı:** {qa['answer']}\n"
            qa_context += "\n--- BİLGİ TABANI SONU ---\n"
        
        # Enhanced Turkish prompt
        prompt = f"""<|begin_of_text|><|start_header_id|>system<|end_header_id|>

Sen NutriMedAI adlı bir sağlık asistanısın. Görevin ilaç, besin ve sağlık konularında doğru bilgi vermektir.

KURALLAR:
1. YANITLARIN TAMAMI TÜRKÇE OLMALIDIR.
2. Bilimsel ve güvenilir bilgiler sun.
3. Emin olmadığın konularda "bir sağlık uzmanına danışmanızı öneririm" de.
4. Kısa, net ve anlaşılır cevaplar ver.
{qa_context}<|eot_id|><|start_header_id|>user<|end_header_id|>

{user_query}<|eot_id|><|start_header_id|>assistant<|end_header_id|>
"""
        try:
            print(f"🧠 LLM Analizi (Q&A Destekli): {user_query[:50]}...")
            
            payload = {
                "model": self.model_name,
                "prompt": prompt,
                "stream": True,
                "options": {
                    "temperature": 0.4,
                    "stop": ["<|eot_id|>"]
                }
            }
            
            response = requests.post(self.base_url, json=payload, timeout=120, stream=True)
            response.raise_for_status()
            
            full_response = ""
            for line in response.iter_lines():
                if line:
                    try:
                        json_obj = json.loads(line.decode('utf-8'))
                        chunk = json_obj.get("response", "")
                        full_response += chunk
                        if json_obj.get("done", False):
                            break
                    except json.JSONDecodeError:
                        continue
                        
            return full_response if full_response else "Analiz yanıtı alınamadı."
            
        except Exception as e:
            return f"⚠️ LLM Hatası: {str(e)}"

    def analyze_interaction(self, drug_name, context_data, detected_interactions=None):
        """
        Legacy method kept for compatibility but redirects to analyze_direct
        if context is empty or acts as a wrapper.
        """
        # If we are strictly no-RAG, we might just ignore context_data
        # But if the user asked for No-RAG, we should just use the prompt directly.
        # For this specific task, let's use the direct method construction.
        
        return self.analyze_direct(f"{drug_name} hakkında bilgi ver. { ' Ayrıca şu etkileşimler var: ' + str(detected_interactions) if detected_interactions else ''}")

    def get_generic_name(self, brand_name):
        """
        Asks the LLM for the generic name (active ingredient) of a brand.
        Returns: String (e.g., "Ramipril") or None.
        """
        prompt = f"""
        Identify the main active ingredient (generic name) for the drug brand "{brand_name}".
        
        RULES:
        1. Return ONLY the generic name in English.
        2. If you are not 100% sure or if the drug is a local brand you don't know, return "Unknown".
        3. Do NOT guess. Hallucinations are dangerous.
        
        Example:
        Input: "Delix"
        Output: Ramipril
        Input: "UnknownBrand123"
        Output: Unknown
        """
        
        print(f"⏳ LLM Etken Madde Sorgusu: '{brand_name}' için bekleniyor...", end="", flush=True)
        try:
            payload = {
                "model": self.model_name,
                "prompt": prompt,
                "stream": False,
                "options": {
                    "num_predict": 50,  # Limit output to 50 tokens
                    "temperature": 0.0   # ZERO temperature for max determinism
                }
            }
            # Reduced timeout since we limited tokens
            response = requests.post(self.base_url, json=payload, timeout=45) 
            response.raise_for_status()
            result = response.json().get("response", "").strip()
            print(" ✅")
            
            # Basic cleanup (remove dots, extra words if LLM is chatty)
            if "Unknown" in result or len(result) > 50:
                print(f"⚠️  LLM Cevabı belirsiz: {result}")
                return None
            return result
            
        except requests.exceptions.ConnectionError:
            print(" ❌ (Hata: Ollama bağlantısı sağlanamadı. Lütfen uygulamanın çalıştığından emin olun: localhost:11434)")
            return None
        except requests.exceptions.Timeout:
            print(" ❌ (Zaman aşımı)")
            return None
        except Exception as e:
            print(f" ❌ (Hata: {e})")
            return None

    def _construct_prompt(self, drug_name, data, detected_interactions=None):
        """Constructs the prompt for the LLM."""
        
        # 1. Pre-translate and Sort Interactions
        interactions_list = []
        if data.get("drug_interactions"):
            # Scoring logic: higher is more severe
            def get_severity_score(text):
                text_lower = text.lower()
                if any(x in text_lower for x in ["life-threatening", "severe", "contraindicated", "serious", "avoid"]):
                    return 3 # Severe
                if any(x in text_lower for x in ["monitor", "risk", "increase", "decrease", "moderate"]):
                    return 2 # Moderate
                return 1 # Minor
            
            # Sort by severity score (descending)
            sorted_interactions = sorted(
                data['drug_interactions'], 
                key=lambda x: get_severity_score(x['effect']), 
                reverse=True
            )
            
            # Take top 10
            top_interactions = sorted_interactions[:10]
            
            for i in top_interactions:
                score = get_severity_score(i['effect'])
                label = "CİDDİ" if score == 3 else "ORTA" if score == 2 else "HAFİF"
                interactions_list.append(f"{i['drug']} ({label} Etkileşim)")
                
        interactions_text = ", ".join(interactions_list) if interactions_list else "Belirtilmemiş"
            
        # 2. Pre-translate Food Interactions (Manual Safety Layer)
        food_data = data.get("food_interactions", [])
        food_list = []
        for item in food_data:
            item = item.replace("Avoid alcohol", "Alkol KULLANMAYINIZ")
            item = item.replace("grapefruit", "Greyfurt KULLANMAYINIZ")
            item = item.replace("Avoid", "Uzak durunuz:")
            item = item.replace("Without food", "Aç karnına")
            item = item.replace("With food", "Tok karnına")
            food_list.append(item)
        food_text = "; ".join(food_list) if food_list else "Belirtilmemiş"
        
        # 3. Clean Description
        desc = data.get("medicine_desc", "N/A")
        if len(desc) > 500:
            desc = desc[:500] + "..."
            
        # 4. Generic Warnings (Contraindications from db_drug_interactions.json)
        gen_warnings = ""
        if "generic_warnings" in data:
            gw = data["generic_warnings"]
            gen_warnings = f"""
            KONTRENDİKASYONLAR: {gw.get('contraindications', 'Yok')}
            GENEL UYARILAR: {gw.get('warnings', 'Yok')}
            """

        # 5. Detected Interactions for Current Session
        current_session_warnings = ""
        if detected_interactions:
            current_session_warnings = "\n        ".join(detected_interactions)
            # Make it very prominent
            current_session_warnings = f"""
            !!! TESPİT EDİLEN KRİTİK ÇAKIŞMALAR (ŞU ANKİ KULLANIM) !!!
            Kullanıcının girdiği diğer gıdalar/ilaçlarla şu etkileşimler bulundu:
            {current_session_warnings}
            
            Bunu raporunda en başa, 'ACİL UYARI' başlığıyla yaz!
            """

        # Prepare Professional Clinical Prompt
        prompt = f"""Sen ilaç etkileşimleri konusunda uzmanlaşmış bir klinik karar destek asistanısın.

Analiz sonucunda aşağıdaki ilaç tespit edilmiştir:

**Tespit Edilen İlaç:** {drug_name}
**Etken Madde:** {data.get('salt_composition', 'Belirtilmemiş')}

{current_session_warnings}

**VERİTABANI BİLGİLERİ:**
- İlaç Etkileşimleri: {interactions_text}
- Besin Uyarıları: {food_text}
- Genel Açıklama: {desc}
- Yan Etkiler: {data.get("side_effects", "Belirtilmemiş")}
{gen_warnings}

Aşağıdaki başlıkları içeren yapılandırılmış bir tıbbi rapor oluştur:

### 1. 🚨 Kritik Etkileşim Uyarısı
Hayati risk taşıyan veya kritik düzeyde bir ilaç etkileşimi olup olmadığını açıkça belirt.
(Varsa tespit edilen kritik etkileşimleri burada vurgula. Yoksa "Kritik düzeyde etkileşim tespit edilmedi." yaz.)

### 2. 🚫 Birlikte Kullanılmaması Gereken İlaçlar
{drug_name} ile orta veya yüksek düzeyde etkileşime giren ilaçları listele.
Veritabanındaki etkileşim bilgilerini kullanarak spesifik ilaç isimlerini ve etkileşim düzeylerini belirt.

### 3. 🥦 Gıda ve Yeme-İçme Uyarıları
- İlacın yemeklerle birlikte veya aç karnına alınıp alınamayacağını açıkla.
- Greyfurt, alkol veya diğer gıda etkileşimlerini belirt.
- Gıdanın emilim (absorbsiyon) üzerine etkisi olup olmadığını açıkla.

### 4. 💊 İlaç Hakkında Genel Bilgi
- {drug_name}'in hangi amaçla kullanıldığını kısaca açıkla.
- Etken madde ve ilaç grubu bilgisi ver.

### 5. ⚠️ Yan Etkiler ve Güvenlik Uyarıları
- Yaygın yan etkileri listele.
- Ciddi yan etkilerde ne yapılması gerektiğini belirt.

### 6. 💡 Eczacı Tavsiyesi
Hasta güvenliğini, ilaç kombinasyonlarını ve klinik değerlendirmeyi vurgulayan profesyonel bir eczacı önerisi sun.

**KURALLAR:**
- Dil açık, tıbbi ve profesyonel olsun.
- İngilizce terimler varsa TÜRKÇE'ye çevir.
- Gereksiz uyarı ve hukuki açıklamalardan kaçın.
- Kısa, net ve hasta güvenliğini ön planda tut.
"""
        return prompt

if __name__ == "__main__":
    # Test Stub
    llm = LLMInterface()
    if llm.check_connection():
        print("Ollama is connected.")
        # Dummy context test
        ctx = {
            "drug_interactions": [{"drug": "Aspirin", "effect": "MODERATE"}],
            "food_interactions": ["Avoid Alcohol"],
            "medicine_desc": "Used for anxiety."
        }
        # print(llm.analyze_interaction("Atarax", ctx)) # Uncomment to really test if model is loaded
    else:
        print("Ollama is NOT connected (Expected if not running).")
