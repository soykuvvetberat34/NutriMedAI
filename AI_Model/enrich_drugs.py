
import json
import os
import time
from llm_interface import LLMInterface
from web_search import WebSearcher
from data_loader import DataLoader

def main():
    # 1. Load Missing List
    try:
        with open("missing_drugs.json", "r", encoding="utf-8") as f:
            missing_drugs = json.load(f)
    except FileNotFoundError:
        print("missing_drugs.json bulunamadı!")
        return

    # 2. Init Components
    print(f"Toplam {len(missing_drugs)} eksik ilaç zenginleştirilecek.")
    
    loader = DataLoader(".")
    loader.load_all_data()
    
    llm = LLMInterface()
    web_search = WebSearcher()
    
    enriched_data = {}
    
    # Load existing enriched data if any (to resume)
    if os.path.exists("enriched_drugs.json"):
        with open("enriched_drugs.json", "r", encoding="utf-8") as f:
             enriched_data = json.load(f)
             print(f"Mevcut önbellekten {len(enriched_data)} kayıt yüklendi.")

    # 3. Process each drug
    count = 0
    total = len(missing_drugs)
    
    for drug in missing_drugs:
        drug = drug.strip()
        if drug in enriched_data:
            continue # Skip already processed
            
        print(f"\n[{count+1}/{total}] İşleniyor: {drug}...")
        match_found = False
        
        # Strategy 1: Web Search (More reliable for Turkish brand names)
        # LLM (llama3) tends to hallucinate active ingredients for local brands.
        print(f"🌍 Web aranıyor: {drug}...")
        potential_names = web_search.search_drug_name(drug)
        if potential_names:
             # Try matches from web search
             for name in potential_names:
                  # Is this name in DB?
                  if loader.search_drug(name):
                      print(f"✅ Web Buldu: {drug} -> {name}")
                      enriched_data[drug] = name
                      match_found = True
                      break
                  
                  # Or check if this result IS the generic name (by checking DB)
                  # or ask LLM to extract generic from this specific web result title if needed.
                  
                  # If the found name + "Tablets" etc. is in DB?
                  
        # Strategy 2: Active Ingredient lookup via LLM (Fallback)
        if not match_found:
             print(f"⏳ LLM Etken Madde Sorgusu: '{drug}'...")
             generic_name = llm.get_generic_name(drug)
             if generic_name and generic_name != "Unknown":
                # Verify if this generic exists in DB to be safe
                db_result = loader.search_drug(generic_name)
                if db_result:
                    print(f"✅ LLM Buldu: {drug} -> {generic_name}")
                    enriched_data[drug] = generic_name
                    match_found = True
                else:
                    print(f"⚠️  LLM '{generic_name}' dedi ama veritabanında yok.")

        if not match_found:
            print(f"❌ Sonuç bulunamadı: {drug}")
            enriched_data[drug] = None # Mark as not found to avoid reprocessing
            
        # Save incrementally every 2 items (safety)
        if count % 2 == 0:
            with open("enriched_drugs.json", "w", encoding="utf-8") as f:
                json.dump(enriched_data, f, indent=2, ensure_ascii=False)
        
        count += 1
        # Be nice to APIs
        # time.sleep(0.5) 

    # Final Save
    with open("enriched_drugs.json", "w", encoding="utf-8") as f:
        json.dump(enriched_data, f, indent=2, ensure_ascii=False)
    
    print("\nİşlem tamamlandı. 'enriched_drugs.json' kaydedildi.")

if __name__ == "__main__":
    main()
