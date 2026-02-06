
from llm_interface import LLMInterface

def test_connection():
    print("--- Testing LLM Connection ---")
    llm = LLMInterface()
    
    print(f"Target Model: {llm.model_name}")
    
    if llm.check_connection():
        print("✅ Ollama server is running.")
        
        print("Sending test prompt (What is 2+2?)...")
        # Creating a fake drug context for the prompt construction
        ctx = {"drug_interactions": [], "medicine_desc": "Test"}
        
        # We'll just use raw request to test simple chat query to be faster/clearer
        try:
            import requests
            payload = {
                "model": llm.model_name,
                "prompt": "Respond with only one word: 'Connected'.",
                "stream": False
            }
            res = requests.post(llm.base_url, json=payload)
            if res.status_code == 200:
                print(f"✅ Response received: {res.json().get('response', '').strip()}")
            else:
                print(f"❌ Error: {res.status_code} - {res.text}")
        except Exception as e:
            print(f"❌ Exception: {e}")
            
    else:
        print("❌ Ollama server is NOT reachable.")
        print("Please ensure 'ollama serve' is running or restart the app.")

if __name__ == "__main__":
    test_connection()
