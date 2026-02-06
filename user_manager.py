import json
import os
from datetime import datetime

class UserManager:
    def __init__(self, data_dir="."):
        self.history_file = os.path.join(data_dir, "data/user_history.json")
        self.history = self._load_history()

    def _load_history(self):
        if os.path.exists(self.history_file):
            try:
                with open(self.history_file, 'r', encoding='utf-8') as f:
                    return json.load(f)
            except json.JSONDecodeError:
                return {}
        return {}

    def _save_history(self):
        with open(self.history_file, 'w', encoding='utf-8') as f:
            json.dump(self.history, f, ensure_ascii=False, indent=2)

    def log_interaction(self, name, surname, items, interaction_summary):
        """
        Logs an interaction event.
        name: User's first name
        surname: User's last name
        items: List of dictionaries or strings identifying the items
        interaction_summary: Text description of the result.
        """
        user_key = f"{name.strip().title()} {surname.strip().upper()}"
        
        if user_key not in self.history:
            self.history[user_key] = {
                "user_info": {"name": name, "surname": surname},
                "history": []
            }
            
        entry = {
            "date": datetime.now().isoformat(),
            "items": items,
            "summary": interaction_summary
        }
        
        self.history[user_key]["history"].append(entry)
        self._save_history()

    def register_user(self, name, surname, email, password):
        """Registers a new user."""
        user_key = email.lower().strip() # Use email as unique key
        if user_key in self.history:
            return False, "Kullanıcı zaten kayıtlı."
            
        self.history[user_key] = {
            "user_info": {
                "name": name, 
                "surname": surname,
                "password": password # In real app, hash this!
            },
            "medications": [],
            "diseases": [],  # New field for chronic diseases
            "allergies": [], # New field for allergies
            "history": [],
            "analysis_history": [],
            "profile_complete": False # Track if user completed health profile
        }
        self._save_history()
        return True, "Kayıt başarılı."

    def authenticate_user(self, email, password):
        """Validates user credentials."""
        user_key = email.lower().strip()
        user_data = self.history.get(user_key)
        
        if not user_data:
            return None, "Kullanıcı bulunamadı."
            
        if user_data["user_info"].get("password") == password:
            # Return profile without password - use deepcopy to avoid modifying original!
            import copy
            profile = copy.deepcopy(user_data)
            if "password" in profile.get("user_info", {}):
                del profile["user_info"]["password"]
            return profile, "Giriş başarılı."
            
        return None, "Hatalı şifre."

    def calculate_health_score(self, history):
        """
        Calculates health score (0-100) based on weighted factors:
        - 50% Drug-Food Interaction Safety
        - 30% Chronic Disease Management (Proxy: 'Medium' risks)
        - 20% Nutritional Discipline (History Trend)
        """
        if not history:
            return 0 # Start at 0, user needs to interact to build score

        # 1. Drug Safety Score (50%)
        # Deduct 20 for each HIGH risk in last 5 entries
        drug_score = 100
        recent_5 = history[:5]
        low_risk_count_recent = 0
        
        for h in recent_5:
            if h.get('riskLevel') == 'high' or "⚠️" in h.get('summary', ''):
                drug_score -= 20
        drug_score = max(0, drug_score)

        # 2. Disease Management Score (30%)
        # Deduct 10 for each MEDIUM risk in last 5 entries
        disease_score = 100
        for h in recent_5:
            if h.get('riskLevel') == 'medium':
                disease_score -= 10
        disease_score = max(0, disease_score)

        # 3. Discipline Score (20%)
        # Percentage of SAFE interactions in last 10 entries
        recent_10 = history[:10]
        safe_count = 0
        for h in recent_10:
            if h.get('riskLevel') in ['low', 'info']:
                safe_count += 1
        
        discipline_score = 100 if not recent_10 else (safe_count / len(recent_10)) * 100
        
        # Weighted Calculation
        final_score = (drug_score * 0.50) + (disease_score * 0.30) + (discipline_score * 0.20)
        return int(final_score)

    def get_user_profile(self, email):
        """Returns the full user profile with dynamic health score."""
        user_key = email.lower().strip()
        data = self.history.get(user_key)
        if data:
            # Calculate dynamic score on fetch
            score = self.calculate_health_score(data.get("analysis_history", []))
            data["health_score"] = score
        return data

    def add_active_medication(self, email, medication_name):
        """Adds a medication to the user's active list if not present."""
        user_key = email.lower().strip()
        if user_key not in self.history:
            return # Should not happen if logged in
            
        if "medications" not in self.history[user_key]:
            self.history[user_key]["medications"] = []
            
        # Check defaults
        # Strip and lower case for robust comparison
        medication_clean = medication_name.strip().lower()
        existing = [m["name"].strip().lower() for m in self.history[user_key]["medications"]]
        
        if medication_clean not in existing:
            new_med = {
                "id": str(datetime.now().timestamp()),
                "name": medication_name.strip(), # Save clean version
                "status": "active",
                "startDate": datetime.now().strftime("%Y-%m-%d"),
                "frequency": "Belirtilmedi"
            }
            self.history[user_key]["medications"].append(new_med)
            self._save_history()

    def log_interaction_v2(self, email, query, risk_level, summary, full_reply):
        """Logs chat interaction to user history."""
        user_key = email.lower().strip()
        if user_key not in self.history:
            return

        if "analysis_history" not in self.history[user_key]:
            self.history[user_key]["analysis_history"] = []

        entry = {
            "id": int(datetime.now().timestamp()), # Use int timestamp as ID
            "date": datetime.now().strftime("%Y-%m-%d"),
            "time": datetime.now().strftime("%H:%M"),
            "query": query,
            "riskLevel": risk_level,
            "summary": summary,
            "fullResponse": full_reply
        }
        
        # Add to beginning
        self.history[user_key]["analysis_history"].insert(0, entry)
        self._save_history()

    def update_user_health_profile(self, email, diseases=None, allergies=None, medications=None):
        """Updates user's health profile with diseases, allergies, and marks profile as complete."""
        user_key = email.lower().strip()
        if user_key not in self.history:
            return False
            
        if diseases is not None:
            self.history[user_key]["diseases"] = diseases
        if allergies is not None:
            self.history[user_key]["allergies"] = allergies
        if medications is not None:
            # Add new medications without duplicates
            existing = [m["name"].lower() for m in self.history[user_key].get("medications", [])]
            for med in medications:
                if med.lower() not in existing:
                    new_med = {
                        "id": str(datetime.now().timestamp()),
                        "name": med,
                        "status": "active",
                        "startDate": datetime.now().strftime("%Y-%m-%d"),
                        "frequency": "Belirtilmedi"
                    }
                    self.history[user_key]["medications"].append(new_med)
        
        self.history[user_key]["profile_complete"] = True
        self._save_history()
        return True

    def get_health_advice(self, email):
        """Generates personalized health advice based on user's profile."""
        user_key = email.lower().strip()
        user_data = self.history.get(user_key)
        
        if not user_data:
            return "Kullanıcı bulunamadı."
        
        diseases = user_data.get("diseases", [])
        medications = user_data.get("medications", [])
        allergies = user_data.get("allergies", [])
        analysis_history = user_data.get("analysis_history", [])
        
        advice_parts = []
        
        # Header
        name = user_data.get("user_info", {}).get("name", "Kullanıcı")
        advice_parts.append(f"**{name} için Kişisel Sağlık Özeti**\n")
        
        # Diseases section
        if diseases:
            advice_parts.append("### 🏥 Kronik Hastalıklarınız")
            for d in diseases:
                advice_parts.append(f"- {d}")
            advice_parts.append("")
            
            # Disease-specific advice
            disease_advice = {
                "Diyabet": "🍬 **Diyabet:** Şekerli gıdalardan uzak durun. Düzenli kan şekeri ölçümü yapın.",
                "Hipertansiyon": "🧂 **Hipertansiyon:** Tuz tüketiminizi azaltın. Düzenli tansiyon ölçümü yapın.",
                "Kalp Hastalığı": "❤️ **Kalp:** Doymuş yağlardan kaçının. Düzenli egzersiz yapın.",
                "Böbrek Hastalığı": "💧 **Böbrek:** Protein ve potasyum alımınızı kontrol edin.",
                "Astım": "🌬️ **Astım:** Tetikleyicilerden (toz, polen) uzak durun.",
                "Hipotiroidi": "🦋 **Tiroid:** İlacınızı aç karnına, kahveden 1 saat önce alın.",
            }
            
            for d in diseases:
                for key, advice in disease_advice.items():
                    if key.lower() in d.lower():
                        advice_parts.append(advice)
            advice_parts.append("")
        
        # Medications section
        if medications:
            advice_parts.append("### 💊 Kullandığınız İlaçlar")
            for m in medications:
                med_name = m.get("name", m) if isinstance(m, dict) else m
                advice_parts.append(f"- {med_name}")
            advice_parts.append("")
            advice_parts.append("⚠️ **Dikkat:** İlaçlarınızı düzenli saatlerde alın. Yeni bir ilaç başlamadan önce etkileşimleri kontrol edin.")
            advice_parts.append("")
        
        # Allergies section
        if allergies:
            advice_parts.append("### 🚫 Alerjileriniz")
            for a in allergies:
                advice_parts.append(f"- {a}")
            advice_parts.append("")
            advice_parts.append("⚠️ Gıda alırken etiketleri kontrol edin!")
            advice_parts.append("")
        
        # Score section
        score = self.calculate_health_score(analysis_history)
        advice_parts.append(f"### 📊 Sağlık Skorunuz: {score}/100")
        
        if score < 30:
            advice_parts.append("🔴 Skorunuz düşük. Daha fazla güvenli gıda tercihi yapın.")
        elif score < 60:
            advice_parts.append("🟡 Orta seviye. Dikkatli olmaya devam edin.")
        elif score < 85:
            advice_parts.append("🟢 İyi gidiyorsunuz! Böyle devam edin.")
        else:
            advice_parts.append("🌟 Mükemmel! Sağlık bilinciniz çok yüksek.")
        
        # General tips
        advice_parts.append("\n### 💡 Genel Öneriler")
        advice_parts.append("- Günde en az 2 litre su için")
        advice_parts.append("- Günde 30 dakika yürüyüş yapın")
        advice_parts.append("- Yeterli uyku (7-8 saat) alın")
        advice_parts.append("- Stres yönetimi için nefes egzersizleri yapın")
        
        return "\n".join(advice_parts)

    def is_profile_complete(self, email):
        """Checks if user has completed their health profile."""
        user_key = email.lower().strip()
        user_data = self.history.get(user_key, {})
        return user_data.get("profile_complete", False)

    def export_for_lstm(self):
        """
        Prepares data for future LSTM training.
        Returns a flat list of sequences or events.
        """
        # Placeholder for future implementation
        return self.history
