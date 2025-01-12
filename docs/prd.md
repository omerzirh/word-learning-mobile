# Dil Öğrenme Kartları Uygulaması PRD
**Versiyon:** 1.0
**Tarih:** 12 Ocak 2025
**Platform:** Android/iOS (React Native + Expo)

## 1. Ürün Tanımı
Dil öğrenme kartları uygulaması, kullanıcıların kelime ve ifadeleri flashcard yöntemiyle öğrenmelerini sağlayan bir mobil uygulamadır. Uygulama, React Native kullanılarak Android platformu için geliştirilecektir.

## 2. Hedef Kitle
- Yabancı dil öğrenmek isteyen kullanıcılar
- Kelime hazinesini geliştirmek isteyenler
- 15-50 yaş arası aktif mobil uygulama kullanıcıları

## 3. Temel Özellikler

### 3.1. Kart Yönetimi
- **Kart Oluşturma**
  - Kelime/ifadenin İngilizcesi
  - Kelime/ifadenin Türkçesi
  - Oluşturulma tarihi
  - Öğrenilme durumu (öğreniliyor/öğrenildi)

- **Kart Listeleme**
  - Öğrenilecek kartlar sekmesi
  - Öğrenilmiş kartlar sekmesi
  - Her sekme için liste görünümü
  - Kartları seçme/seçimi kaldırma özellikleri

### 3.2. Çalışma Modu
- **Grup Çalışması**
  - 5 veya 10 kartlık gruplar halinde çalışma seçeneği
  - Seçili kartlarla özel çalışma grupları oluşturma
  - İlerleme göstergesi

- **Kart Etkileşimleri**
  - Kartı çevirme özelliği
  - Biliyorum/Bilmiyorum işaretleme
  - Kartlar arası geçiş
  - Çalışma sonucu istatistikleri

### 3.3. Öğrenme Takibi
- Öğrenilen kelime sayısı
- Öğrenilmekte olan kelime sayısı
- Günlük/haftalık öğrenme istatistikleri
- Başarı oranı grafikleri

## 4. Teknik Gereksinimler

### 4.2. UI Komponentleri
- Custom TabBar
- FlashCard komponenti
- CheckBox
- Button
- ProgressBar
- Modal
- ListView
- Statistics Charts

### 4.3. Veri Yapısı

```typescript
interface Card {
  id: string;
  english: string;
  turkish: string;
  status: 'learning' | 'known';
  createdAt: Date;
  lastStudied?: Date;
  studyCount: number;
  successRate: number;
}

interface StudySession {
  id: string;
  date: Date;
  cardIds: string[];
  correctCount: number;
  incorrectCount: number;
  duration: number;
}

interface UserProgress {
  totalCards: number;
  knownCards: number;
  learningCards: number;
  dailyGoal: number;
  streak: number;
}
```

## 5. UI/UX Gereksinimleri

### 5.1. Ana Ekranlar
1. **Giriş Ekranı**
   - Öğrenme istatistikleri özeti
   - Çalışma modu başlatma butonu
   - Kartları yönetme seçeneği

2. **Kart Yönetimi Ekranı**
   - Tab yapısı (Öğrenilecek/Öğrenildi)
   - Kart listeleme
   - Toplu seçim araçları
   - Filtreleme seçenekleri

3. **Çalışma Modu Ekranı**
   - Kart görüntüleme alanı
   - İlerleme göstergesi
   - Kontrol butonları
   - Sonuç özeti

### 5.2. Tasarım Prensipleri
- Material Design 3 prensipleri
- Koyu/açık tema desteği
- Responsive tasarım
- Gesture desteği
- Akıcı animasyonlar


