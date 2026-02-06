
import argparse
import sys
from data_loader import DataLoader
from ocr_engine import OCREngine
from llm_interface import LLMInterface
from web_search import WebSearcher
from user_manager import UserManager

def process_queries(drug_queries, loader, llm, web_search, first_name="Misafir", last_name="Kullanıcı"):
    """
    Analyzes a list of drug/food queries, checks interactions, and logs history.
    """
    if not drug_queries:
        print("Girdi sağlanmadı.")
        return

    # Filter keywords to avoid common noise
    ignored_keywords = {"tablet", "kapsül", "şurup", "mg", "ml", "gr", "fiyatı", "skt", "lot", "kullanımı", "ile"}
    
    # Split queries if they contain commas (allowing "DrugA, FoodB" input)
    final_queries = []
    for q in drug_queries:
        if "," in q:
            parts = [p.strip() for p in q.split(",")]
            final_queries.extend(parts)
        else:
            final_queries.append(q)

    filtered_queries = [q for q in final_queries if len(q) >= 2 and q.lower() not in ignored_keywords and not q.isdigit()]

    # Categories
    detected_drugs = [] # list of (name, data)
    detected_foods = [] # list of name
    unknowns = []

    print(f"🔍 Analiz Ediliyor: {filtered_queries}")

    for query in filtered_queries:
        # 1. Search Drug
        drug_res = loader.search_drug(query)
        if drug_res:
            print(f"✅ İlaç Tespit Edildi: {drug_res['product_name']}")
            detected_drugs.append(drug_res)
            continue
            
        # 2. Search Food
        food_res = loader.search_food(query)
        if food_res:
             print(f"✅ Besin Tespit Edildi: {food_res}")
             detected_foods.append(food_res)
             continue
             
        # 3. Unknown
        unknowns.append(query)

    # Resolve Unknowns using Web Search if necessary
    # (Simplified for now)
    
    # --- INTERACTION ANALYSIS ---
    all_interactions = []
    
    # 1. Drug-Drug Interactions
    if len(detected_drugs) > 1:
        for i in range(len(detected_drugs)):
            for j in range(i + 1, len(detected_drugs)):
                d1 = detected_drugs[i]
                d2 = detected_drugs[j]
                
                d2_name = d2['product_name'].lower()
                d2_salt = d2.get('salt_composition', '').lower()
                
                found_interaction = False
                for inter in d1.get('drug_interactions', []):
                    inter_drug = inter['drug'].lower()
                    if inter_drug in d2_name or (d2_salt and inter_drug in d2_salt):
                        all_interactions.append(f"⚠️  İLAÇ-İLAÇ ETKİLEŞİMİ: {d1['product_name']} + {d2['product_name']} -> {inter['effect']}")
                        found_interaction = True
                        break
    
    # 2. Drug-Food Interactions
    for drug in detected_drugs:
        d_name = drug['product_name']
        d_food_inters = drug.get('food_interactions', [])
        
        # Check against detected foods
        for food in detected_foods:
            # Simple keyword match in warnings
            for text in d_food_inters:
                if food.lower() in text.lower():
                     all_interactions.append(f"⚠️  İLAÇ-BESİN ETKİLEŞİMİ: {d_name} + {food} -> {text}")
        
        # Also always show general food warnings for the drug
        if d_food_inters:
             all_interactions.append(f"ℹ️  {d_name} için genel besin uyarıları: {'; '.join(d_food_inters)}")

    # 3. Food-Food Interactions
    if len(detected_foods) > 1:
        for i in range(len(detected_foods)):
            for j in range(i + 1, len(detected_foods)):
                f1 = detected_foods[i]
                f2 = detected_foods[j]
                inters = loader.check_food_food_interaction(f1, f2)
                for inter in inters:
                    level = inter.get('interaction_level', 'Bilinmiyor')
                    nutrient = inter.get('nutrient_name', 'Bilinmiyor')
                    all_interactions.append(f"🍎 BESİN-BESİN ETKİLEŞİMİ ({level}): {f1} + {f2} -> {nutrient} değerlerinde farklılık/etkileşim.")

    # Display Results
    print("\n" + "="*40)
    print("📊 ANALİZ RAPORU")
    print("="*40)
    
    if detected_drugs:
        print("\n💊 İLAÇLAR:")
        for d in detected_drugs:
             print(f" - {d['product_name']} ({d.get('salt_composition', 'Etken madde yok')})")

    if detected_foods:
        print("\n🥦 BESİNLER:")
        for f in detected_foods:
            print(f" - {f}")

    if all_interactions:
        print("\n⚡ TESPİT EDİLEN ETKİLEŞİMLER:")
        for i in all_interactions:
            print(f" - {i}")
    else:
        print("\n✅ Bilinen bir zararlı etkileşim bulunamadı.")
        
    print("="*40 + "\n")

    # LLM Enhancement
    if detected_drugs:
        if llm.check_connection():
            print("🤖 Yapay Zeka Analizi Başlatılıyor...")
            for drug_data in detected_drugs:
                d_name = drug_data.get('product_name', 'Bilinmiyor')
                print(f"\n🧠 {d_name} için detaylı rapor hazırlanıyor...")
                
                # Call LLM
                analysis = llm.analyze_interaction(d_name, drug_data, detected_interactions=all_interactions)
                
                if analysis and not analysis.strip().startswith("Response stream started"): 
                     print(analysis)
                print("\n" + "-"*30) 
        else:
             print("⚠️  LLM Bağlantısı Simüle Edilemedi. (Ollama kapalı veya model eksik)")

    # Log to User History
    user_mgr = UserManager(".")
    
    items = []
    for d in detected_drugs: 
        items.append({
            "name": d['product_name'], 
            "type": "drug",
            "active_ingredient": d.get('salt_composition', 'Bilinmiyor'),
            "description": d.get('medicine_desc', 'Belirtilmemiş')[:200]  # First 200 chars
        })
    for f in detected_foods: 
        items.append({"name": f, "type": "food"})
    
    summary = "; ".join(all_interactions) if all_interactions else "No interactions found."
    user_mgr.log_interaction(first_name, last_name, items, summary)
    print(f"💾 Sorgu '{first_name} {last_name}' geçmişine kaydedildi.")

def main():
    parser = argparse.ArgumentParser(description="İlaç-Gıda Etkileşim Asistanı")
    parser.add_argument("--image", type=str, help="İlaç ismi içeren resim dosyasının yolu")
    parser.add_argument("--text", type=str, help="Aranacak ilaç ismi")
    parser.add_argument("--interactive", action="store_true", help="Etkileşimli modda çalıştır")
    parser.add_argument("--use-gpu", action="store_true", help="OCR için GPU kullanımını aktif et")
    args = parser.parse_args()

    # 1. Initialize Components
    print("Sistem başlatılıyor...")
    loader = DataLoader(".")
    loader.load_all_data()
    
    ocr = OCREngine(use_gpu=args.use_gpu)
    llm = LLMInterface()
    web_search = WebSearcher()
    
    # 2. Determine Input
    drug_queries = []
    
    if args.image:
        print(f"Görüntü işleniyor: {args.image}")
        texts = ocr.extract_text(args.image)
        drug_queries.extend(texts)
    
    if args.text:
        drug_queries.append(args.text)

    # Interactive Mode
    if args.interactive:
        print("\n--- Etkileşimli Mod ---")
        first_name = "Misafir"
        last_name = "Kullanıcı"
        
        full_name = input("Lütfen Adınızı ve Soyadınızı girin: ").strip()
        if " " in full_name:
            parts = full_name.split()
            first_name = " ".join(parts[:-1])
            last_name = parts[-1]
        elif full_name:
            first_name = full_name
            last_name = ""
            
        print(f"Hoşgeldiniz, {first_name} {last_name}!\n")
        
        while True:
            user_input = input("İlaç/Besin adını girin (çıkmak için 'q'): ").strip()
            if user_input.lower() == 'q':
                break
            # Pass as list [user_input]
            process_queries([user_input], loader, llm, web_search, first_name, last_name)
        return

    # CLI Mode
    if not drug_queries:
        print("Girdi sağlanmadı. --text, --image veya --interactive kullanın.")
        return

    # Default User for CLI
    process_queries(drug_queries, loader, llm, web_search, "CLI", "User")

if __name__ == "__main__":
    main()
