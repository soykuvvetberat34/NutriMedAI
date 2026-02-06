import json
import os
import re

import difflib

class DataLoader:
    def __init__(self, data_dir):
        self.data_dir = data_dir
        self.drug_index = {}  # Normalized Name -> Drug Data
        self.food_interactions = {} # Generic/Drug Name -> Food Interaction Text
        self.generic_data = {} # Generic Name -> Warnings/Contraindications
        self.priority_drugs = [] # List of common drugs for fuzzy matching
        self.enriched_map = {} # Brand -> Generic (Resolved Cache)
        
        self.food_food_interactions = [] # List of {food1, food2, level, effect}
        self.food_index = [] # List of known food names
        
        # Files to load (all in data/ subfolder)
        self.files = {
            "primary": ["data/veri3.json", "data/veri4.json", "data/veri7.json", "data/veri8.json"],
            "food": "data/drug-food.json",
            "generic": "data/db_drug_interactions.json",
            "synthetic": "data/veri6.json",
            "patient": "data/veri5.json",
            "priority": "data/top_500_drugs.json",
            "enriched": "data/enriched_drugs.json",
            "food_food": "data/all_foods_match_status.json"
        }

    def load_all_data(self):
        """Loads and indexes all data."""
        print("Veriler Yükleniyor...")
        self._load_priority_list()
        self._load_enriched_cache()
        self._load_food_interactions()
        self._load_generic_db()
        self._load_primary_data()
        self._load_synthetic_data()
        self._load_food_food_interactions()
        print(f"Veri yükleme tamamlandı. {len(self.drug_index)} ilaç, {len(self.food_index)} besin indekslendi.")

    def _load_food_food_interactions(self):
        """Loads all_foods_match_status.json"""
        path = os.path.join(self.data_dir, self.files["food_food"])
        if not os.path.exists(path):
            print(f"Uyarı: {path} bulunamadı.")
            return

        with open(path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            self.food_index = [self._normalize_name(f) for f in data.get("matched_foods", [])]
            self.food_food_interactions = data.get("interactions", [])

    def search_food(self, query):
        """Checks if a query is a known food."""
        q_norm = self._normalize_name(query)
        # 1. Exact Match
        if q_norm in self.food_index:
            return q_norm
        
        # 2. Fuzzy/Converted Match
        # (Assuming food_index has Turkish names if the JSON was generated from the notebook which did translation)
        matches = difflib.get_close_matches(q_norm, self.food_index, n=1, cutoff=0.7)
        if matches:
            return matches[0]
        return None

    def check_food_food_interaction(self, food1, food2):
        """Checks if two foods have an interaction."""
        f1 = self._normalize_name(food1)
        f2 = self._normalize_name(food2)
        
        interactions = []
        for i in self.food_food_interactions:
            # Check both directions
            i_f1 = self._normalize_name(i.get("food_1", ""))
            i_f2 = self._normalize_name(i.get("food_2", ""))
            
            if (i_f1 == f1 and i_f2 == f2) or (i_f1 == f2 and i_f2 == f1):
                interactions.append(i)
        
        return interactions

    def _normalize_name(self, name):
        """Lowercase and remove excess spaces."""
        if not name:
            return ""
        return name.lower().strip()

    def _load_priority_list(self):
        """Loads top_500_drugs.json"""
        path = os.path.join(self.data_dir, self.files["priority"])
        if not os.path.exists(path):
            return
        
        with open(path, 'r', encoding='utf-8') as f:
            self.priority_drugs = json.load(f)

    def _load_enriched_cache(self):
        """Loads enriched_drugs.json"""
        path = os.path.join(self.data_dir, self.files["enriched"])
        if not os.path.exists(path):
            return
            
        with open(path, 'r', encoding='utf-8') as f:
            raw_map = json.load(f)
            # Normalize keys
            for k, v in raw_map.items():
                if v:
                    self.enriched_map[self._normalize_name(k)] = v

    def _load_food_interactions(self):
        """Loads drug-food.json"""
        path = os.path.join(self.data_dir, self.files["food"])
        if not os.path.exists(path):
            print(f"Uyarı: {path} bulunamadı.")
            return

        with open(path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            for entry in data:
                name = self._normalize_name(entry.get("name"))
                interactions = entry.get("food_interactions", [])
                if name:
                    self.food_interactions[name] = interactions

    def _load_generic_db(self):
        """Loads db_drug_interactions.json"""
        path = os.path.join(self.data_dir, self.files["generic"])
        if not os.path.exists(path):
            print(f"Warning: {path} not found.")
            return

        with open(path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            for entry in data:
                generic_name = self._normalize_name(entry.get("Generic Name"))
                if generic_name:
                    self.generic_data[generic_name] = {
                        "contraindications": entry.get("Contraindications"),
                        "warnings": entry.get("Interaction warnings & Precautions"),
                        "side_effects": entry.get("Side Effects")
                    }

    def _load_primary_data(self):
        """Loads veri3.json and veri4.json"""
        for filename in self.files["primary"]:
            path = os.path.join(self.data_dir, filename)
            if not os.path.exists(path):
                print(f"Warning: {path} not found.")
                continue

            with open(path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                for entry in data:
                    product_name = self._normalize_name(entry.get("product_name"))
                    salt_composition = self._normalize_name(entry.get("salt_composition", ""))
                    
                    # Store main entry
                    if product_name:
                        self.drug_index[product_name] = {
                            "product_name": product_name,
                            "type": "branded",
                            "source": filename,
                            "salt_composition": salt_composition,
                            "medicine_desc": entry.get("medicine_desc"),
                            "side_effects": entry.get("side_effects"),
                            "drug_interactions": self._parse_interactions(entry.get("drug_interactions"))
                        }

    def _load_synthetic_data(self):
        """Loads veri6.json"""
        path = os.path.join(self.data_dir, self.files["synthetic"])
        if not os.path.exists(path):
            print(f"Warning: {path} not found.")
            return

        with open(path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            for entry in data:
                drug_name = self._normalize_name(entry.get("drug_name"))
                if drug_name:
                    # Provide fallback or merge if exists
                    if drug_name not in self.drug_index:
                        self.drug_index[drug_name] = {
                            "type": "synthetic",
                            "source": "veri6.json",
                            "side_effects": entry.get("side_effects"),
                            "contraindications": entry.get("contraindications"),
                            "warnings": entry.get("warnings"),
                            "indications": entry.get("indications")
                        }

    def _parse_interactions(self, interaction_str):
        """Parses the nested JSON string in drug_interactions field."""
        if not interaction_str:
            return []
        try:
            # It comes as a string representation of JSON
            parsed = json.loads(interaction_str)
            # Structure: {"drug": [], "brand": [], "effect": []}
            interactions = []
            if "drug" in parsed and "effect" in parsed:
                for i in range(len(parsed["drug"])):
                    interactions.append({
                        "drug": parsed["drug"][i],
                        "effect": parsed["effect"][i] if i < len(parsed["effect"]) else "Unknown"
                    })
            return interactions
        except json.JSONDecodeError:
            return []

    def search_drug(self, query):
        """
        Search for a drug by name.
        Returns a dictionary with comprehensive info (Merged from all sources).
        """
        query_norm = self._normalize_name(query)
        
        # 1. Exact match upon Cache Check
        # Check if we have a known enriched mapping for this query
        if query_norm in self.enriched_map:
            generic_name = self.enriched_map[query_norm]
            print(f"⚡ Önbellekten Getirildi: {query} -> {generic_name}")
            # Recursively search the generic name
            # But ensure we don't loop infinite if generic maps back to same
            if generic_name and generic_name.lower() != query_norm:
                return self.search_drug(generic_name)

        # 2. Exact match on Product Name
        result = self.drug_index.get(query_norm)
        
        # 3. Priority List Correction (Fuzzy Match)
        if not result and self.priority_drugs:
            # Check if query matches a priority drug (allow typos)
            matches = difflib.get_close_matches(query, self.priority_drugs, n=1, cutoff=0.6)
            if matches:
                 corrected_name = self._normalize_name(matches[0])
                 # If corrected name is different, print message
                 if corrected_name != query_norm:
                     print(f"🔍 '{query}' bulunamadı. '{matches[0]}' olarak düzeltiliyor...")
                     
                 # Check cache for corrected name
                 if corrected_name in self.enriched_map:
                     generic_name = self.enriched_map[corrected_name]
                     print(f"⚡ Önbellekten Getirildi (Düzeltme Sonrası): {matches[0]} -> {generic_name}")
                     return self.search_drug(generic_name)
                     
                 result = self.drug_index.get(corrected_name)
                 if result:
                     query_norm = corrected_name
                     
        # 4. Fuzzy match / Substring match within Full Database
        if not result:
            for name, data in self.drug_index.items():
                if query_norm in name:
                    result = data
                    break # returned first match

        # 5. Search by Salt Composition (Active Ingredient)
        if not result:
             for name, data in self.drug_index.items():
                salt = data.get("salt_composition", "").lower()
                if query_norm in salt:
                    result = data
                    break

        # 6. If found, enrich with Food and Generic info
        if result:
            salt = result.get("salt_composition", "")
            
            # Extract basic generic name from salt (e.g., "Hydroxyzine (10mg)" -> "hydroxyzine")
            # Simple regex to take first word or before space/parenthesis
            generic_key = salt.split('(')[0].strip().lower() if salt else ""
            
            # Enrich with Food Interactions
            food_info = self.food_interactions.get(generic_key, [])
            # Also try matching exact drug name in food db
            if not food_info:
                 food_info = self.food_interactions.get(query_norm, [])
            
            result["food_interactions"] = food_info

            # Enrich with Generic DB info (Contraindications)
            if generic_key in self.generic_data:
                gen_info = self.generic_data[generic_key]
                result["generic_warnings"] = gen_info

            return result
            
        return None

    def get_suggestions(self, query, limit=5):
        """Returns a list of close matches for the query."""
        query_norm = self._normalize_name(query)
        matches = []
        
        # Simple substring match for now
        for name in self.drug_index.keys():
            if query_norm in name:
                matches.append(name)
                if len(matches) >= limit:
                    break
        
        return matches

    # =====================================================
    # GENERAL Q&A KNOWLEDGE BASE (RAG Enhancement)
    # =====================================================
    
    def load_general_qa(self):
        """Loads training_data_merged.json as a general Q&A knowledge base."""
        path = os.path.join(self.data_dir, "data/training_data_merged.json")
        if not os.path.exists(path):
            print(f"Uyarı: {path} bulunamadı. Q&A bilgi tabanı yüklenmedi.")
            self.general_qa = []
            return
        
        try:
            with open(path, 'r', encoding='utf-8') as f:
                self.general_qa = json.load(f)
                print(f"✅ Q&A Bilgi Tabanı yüklendi: {len(self.general_qa)} kayıt")
        except Exception as e:
            print(f"Hata: Q&A yüklenemedi: {e}")
            self.general_qa = []
    
    def search_general_qa(self, query, top_k=3):
        """
        Searches the Q&A knowledge base for relevant answers.
        Uses simple keyword overlap scoring.
        
        Returns: List of {question, answer, score} dicts
        """
        if not hasattr(self, 'general_qa') or not self.general_qa:
            return []
        
        query_lower = query.lower()
        query_words = set(query_lower.split())
        
        # Remove common stop words
        stop_words = {'bir', 'bu', 'şu', 've', 'ile', 'için', 'de', 'da', 'mi', 'mı', 'ne', 'nasıl', 'nedir'}
        query_words = query_words - stop_words
        
        results = []
        for qa in self.general_qa:
            # Support multiple key formats
            question = qa.get("prompt", qa.get("instruction", qa.get("question", ""))).lower()
            answer = qa.get("response", qa.get("output", qa.get("answer", "")))
            
            if not question or not answer:
                continue
            
            # Calculate overlap score
            question_words = set(question.split()) - stop_words
            overlap = query_words & question_words
            
            if overlap:
                score = len(overlap) / max(len(query_words), 1)
                results.append({
                    "question": qa.get("prompt", qa.get("instruction", qa.get("question", ""))),
                    "answer": answer,
                    "score": score
                })
        
        # Sort by score and return top_k
        results.sort(key=lambda x: x["score"], reverse=True)
        return results[:top_k]

if __name__ == "__main__":
    # Test the loader
    loader = DataLoader(".")
    loader.load_all_data()
    
    # Test search
    test_drug = "Atarax 10mg Tablet"
    print(f"\nSearching for: {test_drug}")
    data = loader.search_drug(test_drug)
    print(json.dumps(data, indent=2, ensure_ascii=False))
