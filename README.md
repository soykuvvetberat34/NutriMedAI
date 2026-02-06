# NutriMedAI - Akıllı Sağlık Asistanı 🏥

İlaç-besin etkileşimlerini analiz eden, Türkçe destekli yapay zeka sağlık asistanı.

---

## 🌟 Özellikler

- **İlaç-Besin Etkileşimi Analizi** - Kullandığınız ilaçlarla hangi besinlerin etkileşebileceğini öğrenin
- **Otomatik İlaç Algılama** - Mesajlarınızdan ilaç isimlerini otomatik çıkarır
- **Web Doğrulamalı Yanıtlar** - Her yanıt web kaynaklarıyla doğrulanır
- **OCR ile Görsel Analiz** - İlaç kutusunu fotoğraflayın, bilgileri alın
- **Türkçe Dil Desteği** - Tamamen Türkçe yanıtlar
- **Doğruluk Skoru** - Her yanıtta güvenilirlik yüzdesi gösterilir

---

## 🛠️ Kullanılan Teknolojiler

### Backend
| Teknoloji | Versiyon | Açıklama |
|-----------|----------|----------|
| Python | 3.10+ | Ana programlama dili |
| Flask | 2.3+ | REST API framework |
| Flask-CORS | 4.0+ | Cross-origin resource sharing |

### Frontend
| Teknoloji | Versiyon | Açıklama |
|-----------|----------|----------|
| React | 18+ | UI kütüphanesi |
| Next.js | 14+ | React framework |
| TypeScript | 5+ | Tip güvenliği |

### AI
| Bileşen | Teknoloji | Açıklama |
|---------|-----------|----------|
| LLM | Llama 3.1 (8B) | Yerel dil modeli |
| Runtime | Ollama | Model çalıştırma ortamı |
| OCR | EasyOCR + OpenCV | Görüntüden metin çıkarma |

---

## 📁 Proje Yapısı

```
hackathon_chatbot-main/
├── data/                          # Veri dosyaları
│   ├── veri3.json - veri8.json   # İlaç veritabanları
│   ├── drug-food.json             # İlaç-besin etkileşimleri
│   ├── db_drug_interactions.json  # Jenerik ilaç uyarıları
│   ├── training_data_merged.json  # Q&A bilgi tabanı
│   └── all_foods_match_status.json # Besin-besin etkileşimleri
│
├── api_server.py                  # Ana API sunucusu
├── data_loader.py                 # Veri yükleme modülü
├── llm_interface.py               # LLM iletişim katmanı
├── user_manager.py                # Kullanıcı yönetimi
├── ocr_engine.py                  # OCR motoru
├── web_search.py                  # Web doğrulama modülü
├── benchmark_accuracy.py          # Doğruluk testi scripti
│
├── requirements.txt               # Python bağımlılıkları
├── baslat.bat                     # Windows başlatma scripti
└── README.md                      # Bu dosya
```

---

## 🚀 Kurulum

### 1. Bağımlılıkları Yükleyin
```bash
pip install -r requirements.txt
```

### 2. Ollama'yı Kurun
```bash
# Windows
winget install Ollama.Ollama

# macOS
brew install ollama
```

### 3. Llama 3.1 Modelini İndirin
```bash
ollama pull llama3.1
```

### 4. Sunucuyu Başlatın
```bash
python api_server.py
```

Veya Windows'ta:
```bash
baslat.bat
```

---

## 📊 API Endpoints

| Endpoint | Metod | Açıklama |
|----------|-------|----------|
| `/api/chat` | POST | Ana sohbet |
| `/api/analyze-image` | POST | OCR ile görsel analizi |
| `/api/profile` | POST | Kullanıcı profili |
| `/api/update-health-profile` | POST | Sağlık profili güncelleme |
| `/api/register` | POST | Kayıt |
| `/api/login` | POST | Giriş |

---

## 📈 Doğruluk Sistemi

Her yanıtta otomatik güven skoru gösterilir:

| Gösterge | Skor | Anlamı |
|----------|------|--------|
| 🟢 | %80-95 | Yüksek güven - Web doğrulamalı |
| 🟡 | %60-79 | Orta güven - Kısmi eşleşme |
| 🔴 | %30-59 | Düşük güven - Genel LLM yanıtı |

### Benchmark Çalıştırma
```bash
python benchmark_accuracy.py
```

---

## 📊 Veri Kapsamı

| Veri Türü | Kayıt Sayısı |
|-----------|--------------|
| İlaç | 5,593+ |
| Besin | 365 |
| İlaç-Besin Etkileşimi | 2,000+ |
| Q&A Bilgi Tabanı | 167+ |

---

## ⚠️ Uyarı

Bu uygulama yalnızca bilgilendirme amaçlıdır. **Tıbbi tavsiye yerine geçmez.** Her zaman bir sağlık profesyoneline danışın.

---

## 📝 Lisans

MIT License

---

## 👥 Katkıda Bulunun

Pull request'ler memnuniyetle karşılanır!
