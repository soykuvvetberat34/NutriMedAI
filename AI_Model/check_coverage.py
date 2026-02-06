
import json
from data_loader import DataLoader

def main():
    print("Veritabanı yükleniyor...")
    loader = DataLoader(".")
    loader.load_all_data()
    
    try:
        with open("top_500_drugs.json", "r", encoding="utf-8") as f:
            drug_list = json.load(f)
    except FileNotFoundError:
        print("top_500_drugs.json bulunamadı!")
        return

    found_count = 0
    missing = []

    print(f"\n{len(drug_list)} ilaç taranıyor...")
    
    for drug in drug_list:
        # data_loader.search_drug handles normalization and salt composition search
        result = loader.search_drug(drug)
        if result:
            found_count += 1
        else:
            missing.append(drug)

    print("\n------------------------------------------------")
    print(f"✅ Bulunan: {found_count}")
    print(f"❌ Eksik: {len(missing)}")
    print("------------------------------------------------")
    
    percentage = (found_count / len(drug_list)) * 100
    print(f"Kapsama Oranı: %{percentage:.2f}")

    # Save missing to a file for the next step
    with open("missing_drugs.json", "w", encoding="utf-8") as f:
        json.dump(missing, f, indent=2, ensure_ascii=False)
    print("\nEksik ilaçlar 'missing_drugs.json' dosyasına kaydedildi.")

if __name__ == "__main__":
    main()
