import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, Alert } from 'react-native';
import { useCardStore } from '../../src/store/useCardStore';
import { Card } from '../../src/types';

export default function StudyScreen() {
  const { cards, updateCard, studyStats, updateStudyStats, loadCards } = useCardStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [groupSize, setGroupSize] = useState<5 | 10>(10);
  const [showResults, setShowResults] = useState(false);
  const [isStudyActive, setIsStudyActive] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [timer, setTimer] = useState<ReturnType<typeof setInterval> | null>(null);
  const [sessionStats, setSessionStats] = useState({
    correctCount: 0,
    incorrectCount: 0,
    duration: 0,
    startTime: new Date(),
  });
  const [studyCards, setStudyCards] = useState<Card[]>([]);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    loadCards();
  }, []);

  // Timer'ı başlat
  const startTimer = () => {
    const newTimer = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);
    setTimer(newTimer);
  };

  // Timer'ı durdur
  const stopTimer = () => {
    if (timer) {
      clearInterval(timer);
      setTimer(null);
    }
  };

  // Component unmount olduğunda timer'ı temizle
  useEffect(() => {
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [timer]);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleResponse = async (correct: boolean) => {
    try {
      // 1. Mevcut kartı güncelle
      const currentCard = studyCards[currentIndex];
      
      // Calculate total correct answers for this card
      const totalCorrectAnswers = (currentCard.successRate * currentCard.studyCount) + (correct ? 1 : 0);
      const newStudyCount = currentCard.studyCount + 1;
      const newSuccessRate = totalCorrectAnswers / newStudyCount;

      // A card is considered "known" if:
      // 1. Success rate is 100% on first try OR
      // 2. Success rate is >= 80% after multiple tries
      const isKnown = (newStudyCount === 1 && correct) || newSuccessRate >= 0.8;
      
      const updatedCard = {
        ...currentCard,
        studyCount: newStudyCount,
        lastStudied: new Date(),
        successRate: newSuccessRate,
        status: isKnown ? 'known' : 'learning'
      } as Card;

      // Kartı güncelle
      await updateCard(updatedCard);

      // 2. Session istatistiklerini güncelle
      const newStats = {
        correctCount: sessionStats.correctCount + (correct ? 1 : 0),
        incorrectCount: sessionStats.incorrectCount + (correct ? 0 : 1),
        duration: elapsedTime,
        startTime: sessionStats.startTime,
      };

      // Her durumda kartı ters çevir
      setIsFlipped(false);
      
      // 3. Son kart kontrolü
      if (currentIndex === studyCards.length - 1) {
        stopTimer();
        setSessionStats(newStats);
        
        await updateStudyStats({
          correct: newStats.correctCount,
          incorrect: newStats.incorrectCount,
          duration: newStats.duration,
        });
        
        setModalVisible(true);
      } else {
        setSessionStats(newStats);
        setCurrentIndex(currentIndex + 1);
      }

      // Update study cards array with the updated card
      const updatedStudyCards = [...studyCards];
      updatedStudyCards[currentIndex] = updatedCard;
      setStudyCards(updatedStudyCards);

    } catch (error) {
      console.error('Error in handleResponse:', error);
      Alert.alert(
        'Hata',
        'Kart güncellenirken bir sorun oluştu. Lütfen tekrar deneyin.'
      );
    }
  };

  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const startNewSession = (size: 5 | 10) => {
    const learningCards = cards.filter(card => card.status === 'learning');
    
    if (learningCards.length === 0) {
      return;
    }

    // First shuffle all learning cards
    const shuffledAllCards = shuffleArray(learningCards);
    // Then take the first 'size' cards
    const selectedCards = shuffledAllCards.slice(0, size);

    setStudyCards(selectedCards);
    setCurrentIndex(0);
    setIsFlipped(false);
    setShowResults(false);
    setModalVisible(false);
    setGroupSize(size);
    setElapsedTime(0);
    setSessionStats({
      correctCount: 0,
      incorrectCount: 0,
      duration: 0,
      startTime: new Date(),
    });
    setIsStudyActive(true);
    startTimer();
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleFinishSession = () => {
    setShowResults(false);
    setModalVisible(false);
    setStudyCards([]);
    setCurrentIndex(0);
    setIsFlipped(false);
    setIsStudyActive(false);
    loadCards(); // Kartları yeniden yükle
  };

  useEffect(() => {
    // showResults değiştiğinde modalVisible'ı güncelle
    setModalVisible(showResults);
  }, [showResults]);

  if (!isStudyActive) {
    const learningCards = cards.filter(card => card.status === 'learning');
    
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Çalışma Modu</Text>
        
        {learningCards.length === 0 ? (
          <Text style={styles.message}>
            Öğrenilecek kart kalmadı! Tebrikler! 🎉
          </Text>
        ) : (
          <>
            <Text style={styles.message}>
              {learningCards.length} adet öğrenilecek kartınız var.
            </Text>
            <Text style={styles.subtitle}>
              Kaç kartla çalışmak istersiniz?
            </Text>
            <View style={styles.groupButtons}>
              <TouchableOpacity
                style={styles.groupButton}
                onPress={() => startNewSession(5)}
              >
                <Text style={styles.groupButtonText}>5 Kart</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.groupButton}
                onPress={() => startNewSession(10)}
              >
                <Text style={styles.groupButtonText}>10 Kart</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.cardList}>
              <Text style={styles.listTitle}>Öğrenilecek Kartlar:</Text>
              {learningCards.map((card, index) => (
                <View key={card.id} style={styles.listCard}>
                  <Text style={styles.listCardNumber}>{index + 1}.</Text>
                  <View style={styles.listCardContent}>
                    <Text style={styles.listCardText}>{card.english}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          </>
        )}
      </View>
    );
  }

  const currentCard = studyCards[currentIndex];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            {currentIndex + 1} / {studyCards.length}
          </Text>
        </View>
        <Text style={styles.timerText}>
          {formatTime(elapsedTime)}
        </Text>
      </View>

      <TouchableOpacity 
        style={styles.card} 
        onPress={handleFlip}
        activeOpacity={0.9}
      >
        <Text style={styles.cardText}>
          {isFlipped ? currentCard.turkish : currentCard.english}
        </Text>
        <Text style={styles.flipHint}>
          Kartı çevirmek için dokun
        </Text>
      </TouchableOpacity>

      {isFlipped && (
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={[styles.responseButton, styles.wrongButton]}
            onPress={() => handleResponse(false)}
          >
            <Text style={styles.responseButtonText}>Bilmedim</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.responseButton, styles.correctButton]}
            onPress={() => handleResponse(true)}
          >
            <Text style={styles.responseButtonText}>Bildim</Text>
          </TouchableOpacity>
        </View>
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={handleFinishSession}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Çalışma Sonuçları</Text>
            
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Doğru:</Text>
              <Text style={[styles.resultValue, { color: '#34c759' }]}>
                {sessionStats.correctCount}
              </Text>
            </View>
            
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Yanlış:</Text>
              <Text style={[styles.resultValue, { color: '#ff3b30' }]}>
                {sessionStats.incorrectCount}
              </Text>
            </View>
            
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Başarı Oranı:</Text>
              <Text style={[styles.resultValue, { color: sessionStats.correctCount / studyCards.length >= 0.8 ? '#34c759' : '#ff3b30' }]}>
                {Math.round((sessionStats.correctCount / studyCards.length) * 100)}%
              </Text>
            </View>
            
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Süre:</Text>
              <Text style={styles.resultValue}>
                {formatTime(sessionStats.duration)}
              </Text>
            </View>

            <View style={styles.separator} />

            <Text style={styles.statsTitle}>Genel İstatistikler</Text>

            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Toplam Çalışma:</Text>
              <Text style={styles.resultValue}>
                {studyStats.totalSessions + 1}
              </Text>
            </View>

            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Toplam Doğru:</Text>
              <Text style={[styles.resultValue, { color: '#34c759' }]}>
                {studyStats.totalCorrect + sessionStats.correctCount}
              </Text>
            </View>

            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Toplam Yanlış:</Text>
              <Text style={[styles.resultValue, { color: '#ff3b30' }]}>
                {studyStats.totalIncorrect + sessionStats.incorrectCount}
              </Text>
            </View>

            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Toplam Süre:</Text>
              <Text style={styles.resultValue}>
                {formatTime(studyStats.totalTime + sessionStats.duration)}
              </Text>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.finishButton]}
                onPress={handleFinishSession}
              >
                <Text style={styles.modalButtonText}>Bitir</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.continueButton]}
                onPress={() => startNewSession(groupSize)}
              >
                <Text style={styles.modalButtonText}>Yeni Çalışma</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
  message: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 10,
    color: '#666',
  },
  cardList: {
    marginTop: 20,
    maxHeight: '60%',
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  listCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 8,
    alignItems: 'center',
  },
  listCardNumber: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 10,
    color: '#666',
    width: 30,
  },
  listCardContent: {
    flex: 1,
  },
  listCardText: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  listCardSubtext: {
    fontSize: 14,
    color: '#666',
  },
  groupButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 20,
  },
  groupButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
  },
  groupButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  progressContainer: {
    flex: 1,
  },
  progressText: {
    fontSize: 16,
    color: '#666',
  },
  timerText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#007AFF',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    minHeight: 200,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  cardText: {
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
  },
  flipHint: {
    fontSize: 14,
    color: '#999',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  responseButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  wrongButton: {
    backgroundColor: '#ff3b30',
  },
  correctButton: {
    backgroundColor: '#34c759',
  },
  responseButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  resultLabel: {
    fontSize: 16,
    color: '#666',
  },
  resultValue: {
    fontSize: 18,
    fontWeight: '600',
  },
  newSessionButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    borderRadius: 8,
    marginTop: 20,
  },
  newSessionButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  separator: {
    height: 2,
    backgroundColor: '#eee',
    marginVertical: 20,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginBottom: 10,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  finishButton: {
    backgroundColor: '#ff3b30',
  },
  continueButton: {
    backgroundColor: '#34c759',
  },
  modalButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
}); 