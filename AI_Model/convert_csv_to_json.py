import pandas as pd
import json
import os
import sys

def process_file(input_csv, output_json):
    if not os.path.exists(input_csv):
        print(f"Error: {input_csv} not found.")
        return

    print(f"Processing {input_csv} -> {output_json}...")
    
    drug_index = {}
    
    # Columns mapping based on previous analysis
    col_drug1 = 'Drug 1_normalized'
    col_drug2 = 'Drug 2_normalized'
    col_interaction = 'Interaction Description'
    col_desc = 'description'
    col_toxicity = 'toxicity'
    col_moa = 'mechanism-of-action'
    col_indication = 'indication'
    col_pharm = 'pharmacodynamics'
    col_absorp = 'absorption'
    col_metab = 'metabolism'
    
    chunk_count = 0
    chunk_size = 50000
    
    try:
        # Read in chunks to handle large files
        for chunk in pd.read_csv(input_csv, chunksize=chunk_size, dtype=str):
            chunk_count += 1
            print(f"Processing chunk {chunk_count}...", end='\r')
            
            # Fill NaNs
            chunk.fillna("", inplace=True)
            
            # Iterate efficiently
            
            # Check if columns exist
            missing_cols = [c for c in [col_drug1, col_drug2, col_interaction] if c not in chunk.columns]
            if missing_cols:
                print(f"\nMissing columns in {input_csv}: {missing_cols}")
                return

            drug1_vals = chunk[col_drug1].values
            drug2_vals = chunk[col_drug2].values
            interaction_vals = chunk[col_interaction].values
            
            # Optional columns
            desc_vals = chunk[col_desc].values if col_desc in chunk.columns else [""] * len(chunk)
            tox_vals = chunk[col_toxicity].values if col_toxicity in chunk.columns else [""] * len(chunk)
            moa_vals = chunk[col_moa].values if col_moa in chunk.columns else [""] * len(chunk)
            ind_vals = chunk[col_indication].values if col_indication in chunk.columns else [""] * len(chunk)
            pharm_vals = chunk[col_pharm].values if col_pharm in chunk.columns else [""] * len(chunk)
            abs_vals = chunk[col_absorp].values if col_absorp in chunk.columns else [""] * len(chunk)
            metab_vals = chunk[col_metab].values if col_metab in chunk.columns else [""] * len(chunk)
            
            for i in range(len(chunk)):
                d1 = drug1_vals[i].strip()
                if not d1: continue
                
                if d1 not in drug_index:
                    # Initialize entry
                    side_effects = tox_vals[i].strip()
                    moa = moa_vals[i].strip()
                    if moa:
                        side_effects += f"\n\nMechanism of Action: {moa}"
                        
                    drug_index[d1] = {
                        "product_name": d1,
                        "type": "branded",
                        "salt_composition": d1,
                        "medicine_desc": desc_vals[i].strip(),
                        "side_effects": side_effects.strip(),
                        "indication": ind_vals[i].strip(),
                        "pharmacodynamics": pharm_vals[i].strip(),
                        "absorption": abs_vals[i].strip(),
                        "metabolism": metab_vals[i].strip(),
                        "interactions_list": [] 
                    }
                
                # Add interaction
                d2 = drug2_vals[i].strip()
                effect = interaction_vals[i].strip()
                
                if d2:
                    drug_index[d1]["interactions_list"].append({
                        "drug": d2,
                        "effect": effect
                    })

    except Exception as e:
        print(f"\nError processing {input_csv}: {e}")
        import traceback
        traceback.print_exc()
        return

    print(f"\nFinished reading CSV. Converting interactions for {len(drug_index)} drugs...")
    
    # Convert dict to list format expected by JSON
    final_data = []
    
    for drug, data in drug_index.items():
        # Format interactions as the special JSON string explicitly required by data_loader
        # Structure: {"drug": [], "brand": [], "effect": []}
        interactions_struct = {
            "drug": [],
            "brand": [],
            "effect": []
        }
        
        for interaction in data["interactions_list"]:
            interactions_struct["drug"].append(interaction["drug"])
            interactions_struct["brand"].append("") # No brand info for interacting drug
            interactions_struct["effect"].append(interaction["effect"])
            
        # Serialize interactions to string
        data["drug_interactions"] = json.dumps(interactions_struct)
        del data["interactions_list"] # Remove temp list
        
        final_data.append(data)
        
    print(f"Writing to {output_json}...")
    with open(output_json, 'w', encoding='utf-8') as f:
        json.dump(final_data, f, indent=2, ensure_ascii=False)
        
    print(f"Done. Saved {len(final_data)} entries to {output_json}.")

if __name__ == "__main__":
    process_file('FINAL_CLEANED1.csv', 'veri7.json')
    process_file('FINAL_CLEANED1_final_corrected2.csv', 'veri8.json')
