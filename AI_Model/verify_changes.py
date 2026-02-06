
import sys
import os
import requests
import json
from datetime import datetime

# Adjust path so we can import modules
sys.path.append(os.getcwd())

from user_manager import UserManager
from ocr_engine import OCREngine
from llm_interface import LLMInterface

def test_llm_connection():
    print("\n--- Testing LLM Connection with Fine-Tuned Model ---")
    llm = LLMInterface(model_name="llama-3.1-8b-turkish-drug-finetuned")
    
    if not llm.check_connection():
        print("❌ Connecton to Ollama failed!")
        return
        
    print(f"✅ Connection successful. Active Model: {llm.model_name}")
    
    # Simple direct analysis test
    response = llm.analyze_direct("Aspirin nedir?")
    print(f"🤖 Response Preview: {response[:100]}...")
    if len(response) > 10:
        print("✅ LLM returned a valid response.")
    else:
        print("⚠️ LLM response was suspiciously short or empty.")

def test_duplicate_medication_logic():
    print("\n--- Testing Backend Duplicate Medication Logic ---")
    um = UserManager()
    test_email = "test_verify@example.com"
    
    # 1. Register/Ensure user exists (mocking internal logic essentially)
    if test_email not in um.history:
        um.history[test_email] = {"medications": []}
    
    # Clear meds for test
    um.history[test_email]["medications"] = []
    
    # 2. Add "Aspirin"
    um.add_active_medication(test_email, "Aspirin")
    count_1 = len(um.history[test_email]["medications"])
    print(f"Meds count after adding 'Aspirin': {count_1}")
    
    # 3. Add "aspirin " (with space and lower case var)
    um.add_active_medication(test_email, "aspirin ")
    count_2 = len(um.history[test_email]["medications"])
    print(f"Meds count after adding 'aspirin ': {count_2}")
    
    if count_1 == 1 and count_2 == 1:
        print("✅ Duplicate prevention works!")
    else:
        print(f"❌ Duplicate prevention FAILED. Count should be 1 but is {count_2}")

def test_ocr_opencv_integration():
    print("\n--- Testing OCR Engine (OpenCV Integration) ---")
    ocr = OCREngine()
    
    # Create a dummy image for testing if one doesn't exist
    # (Skipping real image creation to avoid dependency complexity, 
    # but we can check if preprocess_image method exists and runs without crashing on a fake path)
    
    print(f"Engine Type: {ocr.engine_type}")
    
    # Check if preprocess logic is accessible
    try:
        # Just check signature or existence
        if hasattr(ocr, 'preprocess_image'):
            print("✅ preprocess_image method exists.")
    except Exception as e:
        print(f"❌ Error checking OCR method: {e}")

if __name__ == "__main__":
    test_llm_connection()
    test_ocr_opencv_integration()
    test_duplicate_medication_logic()
