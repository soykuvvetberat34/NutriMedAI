
from user_manager import UserManager
import json
import os

def test_named_logging():
    print("--- Testing Name-Based Logging ---")
    um = UserManager(".")
    
    # Test Data
    first_name = "Test"
    last_name = "User"
    items = [{"name": "Humus", "type": "food"}]
    summary = "No interactions"
    
    # Log Interaction
    print(f"Logging for: {first_name} {last_name}")
    um.log_interaction(first_name, last_name, items, summary)
    
    # Verify File Content
    expected_key = "Test USER" # Logic was title() and upper()
    
    print("Checking JSON file...")
    with open("user_history.json", "r", encoding="utf-8") as f:
        data = json.load(f)
        
    if expected_key in data:
        print(f"✅ Key '{expected_key}' found.")
        entry = data[expected_key]
        if entry["user_info"]["name"] == first_name and entry["user_info"]["surname"] == last_name:
             print("✅ User Info matches.")
        else:
             print("❌ User Info mismatch.")
             
        if len(entry["history"]) > 0:
            print(f"✅ History has {len(entry['history'])} entries.")
        else:
            print("❌ History is empty.")
    else:
        print(f"❌ Key '{expected_key}' NOT found. Keys are: {list(data.keys())}")

if __name__ == "__main__":
    test_named_logging()
