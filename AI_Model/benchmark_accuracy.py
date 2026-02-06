"""
NutriMedAI Benchmark & Doğruluk Değerlendirme Scripti
=====================================================
Bu script projenin genel doğruluk oranını test sorularıyla ölçer.

Kullanım: python benchmark_accuracy.py
"""

import requests
import json
import time
from datetime import datetime

# API endpoint
API_URL = "http://localhost:5000/api/chat"

# Test soruları - farklı kategorilerde
TEST_QUESTIONS = [
    # İlaç Soruları
    {"category": "İlaç", "question": "Aspirin ne için kullanılır?"},
    {"category": "İlaç", "question": "Parol'un yan etkileri nelerdir?"},
    {"category": "İlaç", "question": "Metformin hangi hastalıkta kullanılır?"},
    {"category": "İlaç", "question": "Antibiyotik ne zaman alınmalı?"},
    
    # Etkileşim Soruları
    {"category": "Etkileşim", "question": "Kan sulandırıcı ile hangi besinler etkileşir?"},
    {"category": "Etkileşim", "question": "Greyfurt hangi ilaçlarla etkileşir?"},
    {"category": "Etkileşim", "question": "Alkol ve ilaç birlikte kullanılabilir mi?"},
    
    # Hastalık Soruları
    {"category": "Hastalık", "question": "Diyabet belirtileri nelerdir?"},
    {"category": "Hastalık", "question": "Hipertansiyon tedavisi nasıl yapılır?"},
    {"category": "Hastalık", "question": "Grip nasıl tedavi edilir?"},
    
    # Vitamin & Takviye
    {"category": "Vitamin", "question": "D vitamini eksikliği belirtileri nelerdir?"},
    {"category": "Vitamin", "question": "B12 vitamini ne işe yarar?"},
    
    # Genel Sağlık
    {"category": "Genel", "question": "Hamilelikte hangi ilaçlar kullanılmamalı?"},
    {"category": "Genel", "question": "Çocuklarda ateş düşürücü nasıl verilir?"},
    {"category": "Genel", "question": "Yaşlılarda ilaç kullanımında nelere dikkat edilmeli?"},
]


def run_benchmark():
    """Tüm test sorularını çalıştırır ve sonuçları toplar."""
    print("=" * 60)
    print("🔬 NutriMedAI Benchmark Başlatılıyor...")
    print(f"📅 Tarih: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"📝 Toplam Soru: {len(TEST_QUESTIONS)}")
    print("=" * 60)
    
    results = []
    category_scores = {}
    
    for i, test in enumerate(TEST_QUESTIONS, 1):
        category = test["category"]
        question = test["question"]
        
        print(f"\n[{i}/{len(TEST_QUESTIONS)}] 💬 {question[:50]}...")
        
        try:
            start_time = time.time()
            
            response = requests.post(
                API_URL,
                json={"message": question},
                timeout=120
            )
            
            elapsed = time.time() - start_time
            
            if response.status_code == 200:
                data = response.json()
                score = data.get("confidence_score", 0)
                reply = data.get("reply", "")[:100]
                
                print(f"   ✅ Skor: %{score} | Süre: {elapsed:.1f}s")
                
                results.append({
                    "category": category,
                    "question": question,
                    "score": score,
                    "time": elapsed,
                    "success": True
                })
                
                # Kategori ortalaması için topla
                if category not in category_scores:
                    category_scores[category] = []
                category_scores[category].append(score)
            else:
                print(f"   ❌ Hata: HTTP {response.status_code}")
                results.append({
                    "category": category,
                    "question": question,
                    "score": 0,
                    "time": 0,
                    "success": False
                })
                
        except requests.exceptions.Timeout:
            print(f"   ⏰ Zaman aşımı!")
            results.append({
                "category": category,
                "question": question,
                "score": 0,
                "time": 120,
                "success": False
            })
        except Exception as e:
            print(f"   ❌ Hata: {e}")
            results.append({
                "category": category,
                "question": question,
                "score": 0,
                "time": 0,
                "success": False
            })
        
        # Rate limiting
        time.sleep(1)
    
    # Sonuçları hesapla
    print("\n" + "=" * 60)
    print("📊 BENCHMARK SONUÇLARI")
    print("=" * 60)
    
    successful = [r for r in results if r["success"]]
    
    if successful:
        scores = [r["score"] for r in successful]
        times = [r["time"] for r in successful]
        
        avg_score = sum(scores) / len(scores)
        min_score = min(scores)
        max_score = max(scores)
        avg_time = sum(times) / len(times)
        
        print(f"\n📈 GENEL İSTATİSTİKLER:")
        print(f"   Toplam Test: {len(TEST_QUESTIONS)}")
        print(f"   Başarılı: {len(successful)}")
        print(f"   Başarısız: {len(TEST_QUESTIONS) - len(successful)}")
        print(f"\n🎯 DOĞRULUK SKORLARI:")
        print(f"   Ortalama: %{avg_score:.1f}")
        print(f"   Minimum: %{min_score}")
        print(f"   Maksimum: %{max_score}")
        print(f"\n⏱️ YANIT SÜRELERİ:")
        print(f"   Ortalama: {avg_time:.1f} saniye")
        
        # Kategori bazlı sonuçlar
        print(f"\n📂 KATEGORİ BAZLI SONUÇLAR:")
        for cat, cat_scores in category_scores.items():
            cat_avg = sum(cat_scores) / len(cat_scores)
            print(f"   {cat}: %{cat_avg:.1f} (n={len(cat_scores)})")
        
        # Skor dağılımı
        print(f"\n📊 SKOR DAĞILIMI:")
        high = len([s for s in scores if s >= 80])
        medium = len([s for s in scores if 60 <= s < 80])
        low = len([s for s in scores if s < 60])
        print(f"   🟢 Yüksek (≥80%): {high}")
        print(f"   🟡 Orta (60-79%): {medium}")
        print(f"   🔴 Düşük (<60%): {low}")
        
        # Sonuçları dosyaya kaydet
        report = {
            "timestamp": datetime.now().isoformat(),
            "total_tests": len(TEST_QUESTIONS),
            "successful_tests": len(successful),
            "average_score": round(avg_score, 2),
            "min_score": min_score,
            "max_score": max_score,
            "average_time": round(avg_time, 2),
            "category_scores": {k: round(sum(v)/len(v), 2) for k, v in category_scores.items()},
            "detailed_results": results
        }
        
        with open("benchmark_results.json", "w", encoding="utf-8") as f:
            json.dump(report, f, ensure_ascii=False, indent=2)
        
        print(f"\n💾 Sonuçlar 'benchmark_results.json' dosyasına kaydedildi.")
        
        # Özet sonuç
        print("\n" + "=" * 60)
        if avg_score >= 80:
            print(f"🏆 SONUÇ: YÜKSEK DOĞRULUK (%{avg_score:.1f})")
        elif avg_score >= 60:
            print(f"✅ SONUÇ: ORTA DOĞRULUK (%{avg_score:.1f})")
        else:
            print(f"⚠️ SONUÇ: DÜŞÜK DOĞRULUK (%{avg_score:.1f})")
        print("=" * 60)
        
        return avg_score
    else:
        print("❌ Hiçbir test başarılı olmadı!")
        return 0


if __name__ == "__main__":
    print("\n⚠️ API sunucusunun çalışır durumda olduğundan emin olun!")
    print("   (python api_server.py)\n")
    
    # Otomatik başlat
    score = run_benchmark()
    
    print(f"\n✅ Benchmark tamamlandı. Genel Doğruluk: %{score:.1f}")
