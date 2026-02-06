
from data_loader import DataLoader
import json

loader = DataLoader(".")
# Verify loading only the relevant files to be quick if possible, 
# but load_all_data needed for index.
loader.load_all_data()

drug = loader.search_drug("cyclosporine")
if drug:
    print(f"Found {len(drug.get('drug_interactions', []))} interactions.")
    # Print first 5 interactions to see structure
    print(json.dumps(drug.get('drug_interactions', [])[:5], indent=2))
else:
    print("Drug not found.")
