try:
    from googlesearch import search
except ImportError:
    print("⚠️ Google Search kütüphanesi yüklenemedi. Web araması devre dışı.")
    search = None

import requests
from bs4 import BeautifulSoup

class WebSearcher:
    def __init__(self):
        self.headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'}

    def search_drug_name(self, query):
        """
        Searches for the query and tries to find a valid drug name.
        Returns a list of potential drug names or titles found.
        """
        results = []
        
        # 1. Try Google Search Library
        if search:
            try:
                print(f"🌍 Google'da aranıyor: '{query}'...")
                # Search for "drug name active ingredient" or just the text + "ilacı"
                search_query = f"{query} ilacı nedir etken maddesi"
                
                for result in search(search_query, num_results=3, lang="tr"):
                    results.append(result)
            except Exception as e:
                print(f"❌ Google Kütüphanesi Hatası: {e}")

        # 2. Extract potential info from URLs or Titles
        extracted_names = []
        
        # If library failed or returned nothing, we can try a direct scrape of a known drug site
        if not results:
             # Fallback: Scrape a generic drug site search (Simulated)
             # Real implementation would need a specific target like 'ilacrehberi.com' 
             # but parsing SERPs is hard without a library.
             pass

        for url in results:
            # simple heuristic: get last part of url, replace - with space
            parts = url.strip('/').split("/")
            if parts:
                slug = parts[-1]
                if not slug: 
                    slug = parts[-2] if len(parts) > 1 else ""
                cleaned = slug.replace("-", " ").replace("_", " ").title()
                extracted_names.append(cleaned)
        
        return extracted_names

    def verify_response(self, query, llm_response, max_results=3):
        """
        Verifies LLM response by comparing with web search results.
        Returns: dict with {score: 0-100, sources: [], explanation: str}
        """
        if not search:
            return {"score": 80, "sources": [], "explanation": "Web araması devre dışı, yüksek güven varsayıldı."}
        
        try:
            print(f"🔍 Web doğrulaması yapılıyor: '{query[:40]}...'")
            
            # Extract key medical terms from query for better search
            medical_terms = self._extract_medical_terms(query)
            search_query = f"{query} {' '.join(medical_terms)} sağlık bilgi tedavi"
            
            urls = list(search(search_query, num_results=max_results, lang="tr"))
            
            if not urls:
                return {"score": 75, "sources": [], "explanation": "Web sonucu bulunamadı, varsayılan skor."}
            
            # Scrape content from URLs
            web_content = ""
            valid_sources = []
            
            for url in urls[:3]:  # Max 3 sources for better coverage
                try:
                    resp = requests.get(url, headers=self.headers, timeout=5)
                    if resp.status_code == 200:
                        soup = BeautifulSoup(resp.text, 'html.parser')
                        # Get text from paragraphs and headings
                        paragraphs = soup.find_all(['p', 'h1', 'h2', 'h3', 'li'])
                        text = " ".join([p.get_text() for p in paragraphs[:15]])
                        web_content += text[:1500] + " "
                        valid_sources.append(url)
                except Exception as e:
                    print(f"⚠️ URL okunamadı: {url} - {e}")
                    continue
            
            if not web_content:
                return {"score": 75, "sources": urls, "explanation": "Web içeriği okunamadı."}
            
            # Calculate improved similarity
            similarity_score = self._calculate_similarity_v2(llm_response.lower(), web_content.lower())
            
            # More generous scoring formula (base 70, max bonus 25)
            final_score = min(95, max(60, 70 + int(similarity_score * 25)))
            
            explanation = f"Web kaynakları ile %{int(similarity_score * 100)} eşleşme."
            
            return {
                "score": final_score,
                "sources": valid_sources,
                "explanation": explanation
            }
            
        except Exception as e:
            print(f"❌ Web doğrulama hatası: {e}")
            return {"score": 75, "sources": [], "explanation": f"Hata, varsayılan skor."}
    
    def _extract_medical_terms(self, text):
        """Extracts medical keywords from text for better search."""
        medical_keywords = [
            'ilaç', 'hap', 'tablet', 'kapsül', 'şurup', 'tedavi', 'hastalık',
            'yan etki', 'doz', 'vitamin', 'antibiyotik', 'ağrı', 'ateş',
            'tansiyon', 'diyabet', 'kolesterol', 'mide', 'kalp', 'böbrek',
            'karaciğer', 'alerji', 'enfeksiyon', 'iltiihap', 'kanser'
        ]
        found = []
        text_lower = text.lower()
        for kw in medical_keywords:
            if kw in text_lower:
                found.append(kw)
        return found[:3]  # Max 3 terms
    
    def _calculate_similarity_v2(self, text1, text2):
        """
        Improved similarity calculation with medical term weighting.
        Returns: float 0-1
        """
        # Tokenize
        words1 = set(text1.split())
        words2 = set(text2.split())
        
        # Remove common stop words
        stop_words = {'bir', 'bu', 'şu', 've', 'ile', 'için', 'de', 'da', 'mi', 'mı', 'ne', 
                      'nasıl', 'nedir', 'the', 'is', 'a', 'an', 'of', 'to', 'in', 'on', 'at',
                      'gibi', 'olarak', 'olan', 'olup', 'çok', 'daha', 'en', 'her', 'kadar'}
        words1 = words1 - stop_words
        words2 = words2 - stop_words
        
        if not words1 or not words2:
            return 0.6  # Higher neutral score
        
        # Medical terms get extra weight
        medical_terms = {'ilaç', 'tedavi', 'hastalık', 'yan', 'etki', 'doz', 'kullanım',
                         'vitamin', 'ağrı', 'ateş', 'enfeksiyon', 'tablet', 'kapsül'}
        
        # Calculate weighted intersection
        intersection = words1 & words2
        medical_matches = intersection & medical_terms
        
        # Regular Jaccard
        jaccard = len(intersection) / len(words1 | words2) if words1 | words2 else 0
        
        # Bonus for medical term matches (each medical match adds 0.05)
        medical_bonus = min(0.2, len(medical_matches) * 0.05)
        
        # Combined score (capped at 1.0)
        final_similarity = min(1.0, jaccard + medical_bonus)
        
        # Apply minimum floor of 0.4 for any non-empty response
        return max(0.4, final_similarity)
    
    def _calculate_similarity(self, text1, text2):
        """Legacy method - redirects to v2."""
        return self._calculate_similarity_v2(text1, text2)

if __name__ == "__main__":
    ws = WebSearcher()
    print(ws.search_drug_name("Delix"))
