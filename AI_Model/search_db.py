import json
import os
import glob

def search_json(keyword):
    print(f"Searching for '{keyword}'...")
    json_files = glob.glob("*.json")
    found = False
    for file in json_files:
        try:
            with open(file, 'r', encoding='utf-8') as f:
                data = json.load(f)
                count = 0
                if isinstance(data, list):
                    for item in data:
                        # Convert to string to search everything
                        s = json.dumps(item).lower()
                        if keyword.lower() in s:
                            count += 1
                            if count <= 2:
                                print(f"Found in {file}: {str(item)[:100]}...")
                elif isinstance(data, dict):
                    s = json.dumps(data).lower()
                    if keyword.lower() in s:
                         count += 1
                         print(f"Found in {file} (dict)")
                
                if count > 0:
                    found = True
                    print(f"Total {count} matches in {file}")
        except Exception as e:
            print(f"Could not read {file}: {e}")
            
    if not found:
        print("Not found in any JSON file.")

if __name__ == "__main__":
    search_json("Delix")
    search_json("Ramipril")
