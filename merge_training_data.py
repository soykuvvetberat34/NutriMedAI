"""
Merge all training data JSON files into a single comprehensive dataset.
Also formats for fine-tuning with Ollama/LLM.
"""
import json
import os
from pathlib import Path

def merge_training_data():
    """Merge all training_data_part*.json files into one."""
    base_path = Path(__file__).parent
    all_data = []
    
    # Find all part files
    # Find all relevant data files
    # We look for "training_data*.json" AND "veri*.json" AND "enriched_drugs.json"
    patterns = ["training_data*.json", "veri*.json", "enriched_drugs.json"]
    files_to_process = []
    
    for pattern in patterns:
        files_to_process.extend(base_path.glob(pattern))
        
    # Remove duplicates and exclude non-data files if any accidentally matched
    files_to_process = list(set(files_to_process))
    
    print(f"📂 Found {len(files_to_process)} data files to merge.")

    for file_path in files_to_process:
        if file_path.name == "training_data_merged.json": continue # Skip self
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                if isinstance(data, list):
                    all_data.extend(data)
                    print(f"✅ Loaded {len(data)} items from {file_path.name}")
                else:
                    print(f"⚠️ Skipped {file_path.name} (Not a list)")
        except Exception as e:
            print(f"❌ Error loading {file_path.name}: {e}")
    
    print(f"\n📊 Total training examples: {len(all_data)}")
    
    # Save merged file
    output_file = base_path / "training_data_merged.json"
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(all_data, f, ensure_ascii=False, indent=2)
    print(f"💾 Saved merged data to {output_file.name}")
    
    # Create Ollama fine-tuning format (JSONL)
    ollama_file = base_path / "training_data_ollama.jsonl"
    with open(ollama_file, 'w', encoding='utf-8') as f:
        for item in all_data:
            # Ollama format: {"prompt": "...", "completion": "..."}
            entry = {
                "prompt": f"<s>[INST] {item['prompt']} [/INST]",
                "completion": f"{item['response']}</s>"
            }
            f.write(json.dumps(entry, ensure_ascii=False) + "\n")
    print(f"💾 Saved Ollama format to {ollama_file.name}")
    
    # Create conversation format for advanced fine-tuning
    conversation_file = base_path / "training_data_conversations.jsonl"
    with open(conversation_file, 'w', encoding='utf-8') as f:
        for item in all_data:
            entry = {
                "conversations": [
                    {"role": "user", "content": item['prompt']},
                    {"role": "assistant", "content": item['response']}
                ]
            }
            f.write(json.dumps(entry, ensure_ascii=False) + "\n")
    print(f"💾 Saved conversation format to {conversation_file.name}")
    
    return all_data

if __name__ == "__main__":
    data = merge_training_data()
    print(f"\n✅ Training data preparation complete!")
    print(f"📁 Files created:")
    print(f"   - training_data_merged.json (raw merged)")
    print(f"   - training_data_ollama.jsonl (Ollama fine-tuning)")
    print(f"   - training_data_conversations.jsonl (conversation format)")
