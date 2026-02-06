
from data_loader import DataLoader
from user_manager import UserManager
import os

def test_integration():
    print("--- 1. Testing Data Loading ---")
    loader = DataLoader(".")
    loader._load_food_food_interactions() # Explicitly load for test if not in init yet, but I added it to init
    # Wait, check if I added call to load_all_data in my edit?
    # Yes, I added self._load_food_food_interactions() in load_all_data() implementation modification.
    loader.load_all_data()
    
    if len(loader.food_index) > 0:
        print(f"✅ Food Index Loaded: {len(loader.food_index)} items.")
    else:
        print("❌ Food Index Empty!")

    print("\n--- 2. Testing Food Search ---")
    # Using known names from the json I saw (Hummus, Cheese, etc.)
    # The JSON had "Food_TR" mappings.
    # Ex: "Hummus" -> "Hummus"
    # "Cheese, parmesan" -> "Peynir"
    
    f1_query = "Humus" # Assuming Turkish map
    f1 = loader.search_food(f1_query)
    print(f"Search '{f1_query}' -> {f1}")

    f2_query = "Peynir" 
    f2 = loader.search_food(f2_query)
    print(f"Search '{f2_query}' -> {f2}")
    
    print("\n--- 3. Testing Food Interaction ---")
    if f1 and f2:
        inters = loader.check_food_food_interaction(f1, f2)
        print(f"Interaction {f1} + {f2}: {len(inters)} found.")
        for i in inters:
            print(f" - {i}")
    
    print("\n--- 4. Testing User Manager ---")
    um = UserManager(".")
    test_items = [{"name": f1, "type": "food"}, {"name": f2, "type": "food"}]
    um.log_interaction("test_user_verify", test_items, "Verification Log")
    
    hist = um.get_user_history("test_user_verify")
    print(f"User History: {len(hist)} entries.")
    if len(hist) > 0 and hist[-1]["summary"] == "Verification Log":
        print("✅ History Logged Successfully.")
    else:
        print("❌ History Logging Failed.")

if __name__ == "__main__":
    test_integration()
