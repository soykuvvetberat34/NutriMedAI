# NutriMedAI

**NutriMedAI**, bireylerin gıda tüketimi ve ilaç kullanımına bağlı sağlık risklerini yapay zekâ ile analiz eden, kişiye özel uyarılar ve öneriler sunan akıllı bir mobil sağlık asistanıdır. 
### Projenin Amacı 
Proje; sadece “bilgi veren” değil, riskleri değerlendiren, faydalı kombinasyonları öneren ve kaçınılması gereken durumları net şekilde açıklayan bir karar destek sistemi sunmayı amaçlamaktadır.


## 🚀 Temel Özellikler

### 🤖AI Destekli Etkileşim Analizi
- **İlaç–İlaç Etkileşimi**:
Kullanıcının mevcut ilaç listesi ile yeni eklenen ilaçlar arasındaki olası etkileşimler analiz edilir.

- **İlaç–Besin Etkileşim Analizi**:
İlaçların hangi besinlerle birlikte tüketilmemesi gerektiği belirlenir.

- **Besin–Besin Etkileşim Analizi**:
Birlikte tüketilmesi önerilmeyen besin kombinasyonları tespit edilir.

- **Yan Etki Tespiti**:
İlaçların bilinen yan etki profillerine göre kişiye özel risk değerlendirmesi yapılır.

- **Kişisel Analiz ve Rehberlik** :
Analiz sonuçları, kullanıcıya özel öneriler ve değerlendirmelerle birlikte sunulur.

- **Anlık Uyarılar** :
Olası risk durumlarında anlaşılır ve yönlendirici bildirimler ile kullanıcı bilgilendirilir.

### 💬AI Asistan
- **Doğal Dil ile Etkileşim** :
Kullanıcı, serbest metin yazarak veya konuşarak gıda ve ilaç bilgisi girebilir.

- **LLM Destekli Sohbet** :
Llama 3.1 tabanlı büyük dil modeli ile sağlık odaklı soru–cevap etkileşimi sağlanır.

- **Kişiselleştirilmiş Geri Bildirim** :
Kullanıcının geçmiş verileri ve mevcut durumu dikkate alınarak özel yanıtlar üretilir.

- **Proaktif Asistan Yapısı**:
Gün içi zaman dilimlerine (kahvaltı, öğle, akşam) göre kullanıcıya uygun öneriler sunulur.

### 📷 Görüntüden İlaç Tanıma (OCR)
- Kamera veya fotoğraf üzerinden ilaç kutularının otomatik olarak tanınması
  - Teknoloji: ocr_engine.py
 
### 📊 Veri Kaynakları ve Veri Seti Oluşturma
**NutriMedAI, analiz doğruluğunu artırmak amacıyla çok kaynaklı ve doğrulanabilir veri setleri kullanmaktadır.**

- **Web Scraping:**
  Açık kaynak ve güvenilir sağlık platformlarından gıda–ilaç etkileşim verileri toplanmıştır.

- **JSON Tabanlı Veri Setleri:**
  - 5.593+ ilaç
  - 365 besin
  - İlaç–ilaç, ilaç–besin ve besin–besin etkileşim kayıtları
- **Sentetik Veri Üretimi:** Gerçek kullanım senaryolarını kapsamak amacıyla kontrollü sentetik veri üretimi ile veri çeşitliliği artırılmıştır.
- **Çoklu Veri Birleştirme:** Farklı kaynaklardan elde edilen veriler normalize edilerek tek bir analiz yapısında birleştirilmiştir.
---
## 🛠️ Kullanılan Teknolojiler

### Backend
| Teknoloji  | Versiyon | Açıklama                    |
| ---------- | -------- | --------------------------- |
| Python     | 3.10+    | Ana programlama dili        |
| Flask      | 2.3+     | REST API framework          |
| Flask-CORS | 4.0+     | Cross-origin istek yönetimi |

### Frontend
| Teknoloji    | Versiyon | Açıklama                      |
| ------------ | -------- | ----------------------------- |
| React        | 18+      | Kullanıcı arayüzü kütüphanesi |
| Next.js      | 14+      | React tabanlı framework       |
| TypeScript   | 5+       | Tip güvenliği                 |
| Context API  | –        | Merkezi state yönetimi        |
| LocalStorage | –        | Yerel veri kalıcılığı         |

### API Uç Noktaları
| Endpoint                     | Metod | Açıklama                    |
| ---------------------------- | ----- | --------------------------- |
| `/api/chat`                  | POST  | AI sohbet ve soru–cevap     |
| `/api/analyze-image`         | POST  | OCR tabanlı görsel analiz   |
| `/api/profile`               | POST  | Kullanıcı profil yönetimi   |
| `/api/update-health-profile` | POST  | Sağlık profili güncelleme   |
| `/api/health-advice`         | POST  | Kişiselleştirilmiş öneriler |
| `/api/register`              | POST  | Kullanıcı kaydı             |
| `/api/login`                 | POST  | Kullanıcı girişi            |

### AI & Veri İşleme
| Bileşen     | Teknoloji               | Açıklama                       |
| ----------- | ----------------------- | ------------------------------ |
| LLM         | Llama 3.1 (8B)          | Yerel çalışan dil modeli       |
| Runtime     | Ollama                  | Model çalıştırma ortamı        |
| OCR         | Tesseract + OpenCV      | Görüntüden metin çıkarma       |
| RAG         | Özel implementasyon     | JSON tabanlı context injection |
| Veri İşleme | In-memory JSON indexing | Hızlı arama altyapısı          |


## 🏗️ Proje Mimarisi
NutriMedAI, Clean Architecture prensiplerine uygun olarak katmanlı bir yapı ile geliştirilmiştir.

 ### **Frontend**
  - Kullanıcı arayüzü ve etkileşimlerin yönetildiği katmandır.
    - Teknolojiler: React + Next.js + TypeScript
```
📁 frontend/
├── 📁 presentation/
│   ├── 📁 pages/                 # Sayfa bileşenleri
│   │   ├── chat.tsx              # /chat – AI sohbet ekranı
│   │   ├── profile.tsx           # /profile – Kullanıcı profili
│   │   └── history.tsx           # /history – Geçmiş analizler
│   │
│   ├── 📁 components/            # UI bileşenleri
│   │   ├── ChatBox.tsx           # AI sohbet bileşeni
│   │   ├── DrugCard.tsx          # İlaç bilgi kartı
│   │   └── FoodAlert.tsx         # Gıda–ilaç uyarı bileşeni
│   │
│   └── 📁 context/               # Global state yönetimi
│       └── UserContext.tsx       # Kullanıcı durumu
│           ├── medications       # İlaçlar
│           ├── diseases          # Hastalıklar
│           └── allergies         # Alerjiler

```
 ### **Backend API (Python)**
```
📁 backend/
├── 📁 api/
│   └── api_server.py             # Flask REST API, endpoint tanımları
│
├── 📁 ai/
│   ├── llm_interface.py          # LLM entegrasyonu ve AI analizleri
│   └── ocr_engine.py             # Görüntüden ilaç tanıma (OCR)
│
├── 📁 data/
│   ├── data_loader.py            # JSON veri yükleme ve indeksleme
│   ├── veri3-8.json              # İlaç verileri
│   ├── drug-food.json            # İlaç–besin etkileşimleri
│   └── training_data_merged.json # Q&A ve eğitim verileri
│
├── 📁 user/
│   └── user_manager.py           # Kullanıcı profilleri ve geçmiş kayıtlar
│
└── requirements.txt              # Python bağımlılıkları

```
#### Persistence Layer
- Kullanıcı profilleri
  - user_manager.py
- Geçmiş kayıtları
- Oturum yönetimi

#### Business Logic (AI Layer)
- AI analizleri
 -llm_interface.py
- AI analizleri
- Güven skoru hesaplama
- LLM–veritabanı entegrasyonu

## Performans & Doğruluk
**Yapılan Banchmark  Teslerinde projenin doğruluk oranı %80 olarak ölçülmüştür.**
### ⚡ Performans Metrikleri
| Metrik              | Değer    | Açıklama                |
| ------------------- | -------- | ----------------------- |
| API Yanıt Süresi    | <100 ms  | LLM hariç               |
| LLM Yanıt Süresi    | 2–5 sn   | Donanıma bağlı          |
| Veri Yükleme        | ~5–10 sn | ~800 MB indeksleme      |
| İlaç Arama          | O(1)     | Hash tabanlı            |
| Fuzzy Matching      | O(n)     | `difflib`               |
| Eşzamanlı Kullanıcı | ~10–50   | Flask dev server limiti |

### 🎯 Doğruluk & Güven Skoru Sistemi
Her AI yanıtı, kullanıcıya otomatik bir güven skoru ile sunulur.

#### 🔵 Güven Seviyeleri
| Gösterge | Skor Aralığı | Anlam                                 |
| -------- | ------------ | ------------------------------------- |
| 🟢       | %80–95       | Yüksek güven – veritabanı doğrulamalı |
| 🟡       | %60–79       | Orta güven – kısmi eşleşme            |
| 🔴       | %30–59       | Düşük güven – genel LLM yanıtı        |

#### 🧮 Skoru Etkileyen Faktörler
| Faktör                                  | Etki   |
| --------------------------------------- | ------ |
| Q&A veri tabanı eşleşmesi               | +0–20% |
| İlaç/besin veritabanı doğrulaması       | +5–15% |
| Tıbbi anahtar kelime içeriği            | +10%   |
| Detaylı yanıt (200+ karakter)           | +5%    |
| Uzman yönlendirmesi (“Doktora danışın”) | −5%    |
| Bilgi belirsizliği                      | −10%   |

## 👥 Hedef Kitle
#### Bireysel Kullanıcılar

- Her yaş grubundan, sağlıklı ve bilinçli beslenmek isteyen bireyler

- Gıda–ilaç etkileşimleri konusunda farkındalık kazanmayı hedefleyen kullanıcılar

#### Profesyonel Kullanıcılar

- **Diyetisyenler**: Danışanlarının beslenme ve ilaç kullanımını daha güvenli şekilde değerlendirmek isteyen profesyoneller

- **Eczacılar & Eczaneler**: İlaç yan etkileri ve gıda etkileşimleri konusunda danışmanlık sunan sağlık profesyonelleri

- **Doktorlar** : Hastalarının günlük tüketim alışkanlıklarını destekleyici bir karar destek aracı arayan hekimler

- **Hastaneler** : Dijital sağlık çözümlerini klinik ve operasyonel süreçlerine entegre etmek isteyen sağlık kurumları

## 💡 Tüketici Faydası 
### Bireysel Fayda
- **Erken Risk Tespiti**: Gıda tüketimi ve ilaç kullanımına bağlı olası sağlık risklerini önceden fark etmeyi sağlar.
- **Zaman ve Bilgi Tasarrufu**: Karmaşık etkileşimleri sadeleştirerek hızlı ve anlaşılır geri bildirim sağlar.
- **Bilinçli Tüketim**: Kişisel verilere dayalı analizlerle daha güvenli beslenme ve ilaç kullanımı kararları alınmasını destekler.
- **Önleyici Sağlık Yaklaşımı**: Riskler oluşmadan önce kullanıcıyı bilgilendirerek olası sağlık sorunlarının önüne geçilmesine katkı sunar.
- **Bilgi Artışı**: Anlaşılır uyarılar ve açıklamalar ile kullanıcıların sağlık farkındalığını artırır.
  
### Sosyal Fayda
- **Toplum Sağlığı**: Gıda–ilaç etkileşimleri konusunda farkındalık oluşturarak genel sağlık bilincinin artmasına katkı sağlar.
- **Eğitici Etki**: Kullanıcıların uzun vadede daha bilinçli tüketim alışkanlıkları kazanmasına yardımcı olur.
-**Erişilebilirlik**: Mobil platform üzerinden her yaş grubuna ve her seviyeden kullanıcıya kolay erişim imkânı sunar.
-**Dijital Sağlık Dönüşümü**: Yapay zekâ tabanlı karar destek yaklaşımıyla modern dijital sağlık çözümlerine adaptasyonu destekler.
---
## NUTRİMED AI - Ekran Görüntüleri
### 1️⃣ Onboarding ve Giriş Ekranı 
![1](https://github.com/user-attachments/assets/eac94eee-4ea0-4e34-a7b6-4665e636f265)
![2](https://github.com/user-attachments/assets/8a7eef6e-70b0-4c1b-a09b-9a5c49714fc0)
### 2️⃣ Ana Sayfa – Günlük Sağlık Özeti
![3](https://github.com/user-attachments/assets/17dc7b71-43ab-4e06-ac2d-56e9f77f3858)

### 3️⃣ AI Asistan – Sohbet Başlangıcı
![4](https://github.com/user-attachments/assets/224b00a2-f6e5-4801-9abb-46125124fdc5)
![5](https://github.com/user-attachments/assets/16796ee7-338c-4974-84c9-1e5ba7b96948)
![6](https://github.com/user-attachments/assets/8e75c63b-47a5-4787-b91a-226d555dc6ed)
![7](https://github.com/user-attachments/assets/d9987ec5-4e44-41be-9f61-d789d15ab3d1)

### 4️⃣ Analiz Sonucu – Detaylı Açıklama
![8](https://github.com/user-attachments/assets/53e2dc86-b11a-4fc5-ac1d-0e75fc51ee66)
![9](https://github.com/user-attachments/assets/2e27de53-648d-4e11-ba80-9194ba7eccdd)

### 5️⃣ Etkileşim & Uyarı Detayları
![10](https://github.com/user-attachments/assets/1247b18f-0f51-4879-8342-36a108648248)

### 8️⃣Profil & Ayarlar

![10](https://github.com/user-attachments/assets/1247b18f-0f51-4879-8342-36a108648248)
![11](https://github.com/user-attachments/assets/6de211bb-f67d-4988-8e3e-2d1fbe658489)

---



*Yapay zekâ destekli karar destek yaklaşımıyla gıda ve ilaç etkileşimlerini analiz eden, bireylerin günlük sağlık kararlarını daha güvenli ve bilinçli hale getiren yenilikçi bir dijital sağlık çözümü. 🧠🥗💊*  
