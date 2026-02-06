import json
import os
import glob

def format_output(data):
    """
    Formats the drug data into the target Turkish output string,
    replicating the logic from llm_interface.py.
    """
    drug_name = data.get("product_name", "Bilinmiyor")
    
    # 1. Pre-translate Interactions
    interactions_list = []
    if data.get("drug_interactions"):
        try:
            # It might be a string JSON or already a list/dict depending on how it was loaded
            # In data_loader it parses it. Here we are reading raw JSON.
            # Convert string to json if needed
            interactions_raw = data.get("drug_interactions")
            parsed = []
            if isinstance(interactions_raw, str):
                parsed_json = json.loads(interactions_raw)
                # Parse the structure {"drug": [], "brand": [], "effect": []}
                if "drug" in parsed_json and "effect" in parsed_json:
                    for i in range(len(parsed_json["drug"])):
                        parsed.append({
                            "drug": parsed_json["drug"][i],
                            "effect": parsed_json["effect"][i] if i < len(parsed_json["effect"]) else "Unknown"
                        })
            elif isinstance(interactions_raw, list):
                parsed = interactions_raw
            
            for i in parsed:
                effect = i.get('effect', '')
                effect_tr = "CİDDİ" if effect == 'SERIOUS' else "ORTA" if effect == 'MODERATE' else "HAFİF"
                interactions_list.append(f"{i.get('drug', '')} ({effect_tr} Risk)")
        except:
            pass
            
    interactions_text = ", ".join(interactions_list) if interactions_list else "Belirtilmemiş"

    # 2. Pre-translate Food Interactions
    food_data = data.get("food_interactions", [])
    food_list = []
    if isinstance(food_data, list):
        for item in food_data:
            item = item.replace("Avoid alcohol", "Alkol kullanmayınız")
            item = item.replace("grapefruit", "greyfurt tüketilmemeli")
            item = item.replace("Without food", "Aç karnına alınmalı")
            item = item.replace("With food", "Tok karnına alınmalı")
            food_list.append(item)
    food_text = "; ".join(food_list) if food_list else "Belirtilmemiş"

    # 3. Description & Side Effects
    desc = data.get("medicine_desc", "Bilgi bulunamadı.")
    side_effects = data.get("side_effects", "Belirtilmemiş")

    # Construct the Target Output
    # We want the model to "speak" this directly.
    
    response = f"""# 💊 İlaç Etkileşimleri
* {interactions_text}

# 🥦 Gıda ve Kullanım
* {food_text}

# ✅ İlaç Hakkında (Özet)
* Ne İşe Yarar: {desc[:200]}...
* Yan Etkiler: {side_effects[:200]}...
"""
    return response

def format_db_interactions(entry):
    """Parses db_drug_interactions.json style entries"""
    name = entry.get("Generic Name", "Bilinmiyor")
    indication = entry.get("Indications", "Belirtilmemiş")
    side_effects = entry.get("Side Effects", "Belirtilmemiş")
    warnings = entry.get("Interaction warnings & Precautions", "Yok")
    
    response = f"""# 💊 İlaç Bilgisi: {name}
* Kullanım Alanı: {indication}
* Yan Etkiler: {side_effects}

# ⚠️ Uyarılar ve Etkileşimler
* {warnings}
"""
    return response

def format_drug_food(entry):
    """Parses drug-food.json style entries"""
    name = entry.get("name", "Bilinmiyor")
    interactions = entry.get("food_interactions", [])
    
    if not interactions:
        return None
        
    interactions_text = "\n* ".join(interactions)
        
    response = f"""# 🥦 {name} ile Gıda Etkileşimleri
Bu ilacı kullanırken dikkat edilmesi gerekenler:
* {interactions_text}
"""
    return response

def process_file(filename, dataset):
    if not os.path.exists(filename):
        print(f"Skipping {filename} (not found)")
        return
        
    print(f"Reading {filename}...")
    try:
        with open(filename, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except Exception as e:
        print(f"❌ Error reading {filename}: {e}")
        return
        
    count = 0
    for entry in data:
        # Detect Schema
        drug_name = None
        output_text = None
        
        # Schema 1: Main Data (veri*.json, training_data*.json)
        if "product_name" in entry:
            drug_name = entry.get("product_name")
            output_text = format_output(entry)
            
        # Schema 2: DB Interactions (db_drug_interactions.json)
        elif "Generic Name" in entry:
            drug_name = entry.get("Generic Name")
            output_text = format_db_interactions(entry)
            
        # Schema 3: Drug Food (drug-food.json)
        elif "food_interactions" in entry and "name" in entry:
            drug_name = entry.get("name")
            output_text = format_drug_food(entry)
            
        if not drug_name or not output_text: 
            continue
        
        # Create Training Example
        training_example = {
            "instruction": f"Şu ilaç hakkında bilgi ver: {drug_name}",
            "input": "",
            "output": output_text
        }
        
        dataset.append(training_example)
        count += 1
        
    print(f"Added {count} entries from {filename}")

def main():
    # 1. Merge all data first
    print("🔄 Merging all data files...")
    # Import here to avoid circular dependency if any, or just replicate simple logic
    # Looking at the file structure, we can just glob here too or assume merge_training_data was run
    # Ideally we should import the merge function or run it.
    
    # Let's just scan everything here to be safe and robust
    files = glob.glob("veri*.json") + glob.glob("training_data*.json") + \
            glob.glob("enriched*.json") + ["db_drug_interactions.json", "drug-food.json"]
            
    # Remove duplicates and filtered files
    files = list(set(files))
    files = [f for f in files if "merged" not in f and "ollama" not in f and "conversations" not in f]
    
    print(f"🎯 Processing {len(files)} files: {files}")
    
    dataset = []
    
    for f in files:
        process_file(f, dataset)
        
    output_file = "finetune_dataset.jsonl"
    print(f"Writing {len(dataset)} examples to {output_file}...")
    
    with open(output_file, 'w', encoding='utf-8') as f:
        for entry in dataset:
            f.write(json.dumps(entry, ensure_ascii=False) + "\n")
            
    print("Done.")

if __name__ == "__main__":
    main()
