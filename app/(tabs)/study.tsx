import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { useCardStore } from '../../src/store/useCardStore';
import { Card } from '../../src/types';
import { useTheme } from '../../src/hooks/useTheme';

export default function StudyScreen() {
  const { colors } = useTheme();
  const { cards, updateCard, studyStats, updateStudyStats } = useCardStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [studyCards, setStudyCards] = useState<Card[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [sessionSize, setSessionSize] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [timer, setTimer] = useState<ReturnType<typeof setInterval> | null>(null);
  const [sessionStats, setSessionStats] = useState({
    correctCount: 0,
    incorrectCount: 0,
    startTime: new Date(),
  });
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [timer]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const shuffleArray = <T extends any>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const startNewSession = (size: number) => {
    const learningCards = cards.filter(card => card.status === 'learning');
    if (learningCards.length === 0) {
      setModalVisible(false);
      return;
    }
    
    const shuffledCards = shuffleArray(learningCards);
    const selectedCards = shuffledCards.slice(0, Math.min(size, shuffledCards.length));
    
    setStudyCards(selectedCards);
    setCurrentCardIndex(0);
    setShowAnswer(false);
    setSessionSize(size);
    setModalVisible(false);
    setElapsedTime(0);
    setSessionStats({
      correctCount: 0,
      incorrectCount: 0,
      startTime: new Date(),
    });
    setShowResults(false);

    // Start timer
    const newTimer = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);
    setTimer(newTimer);
  };

  const handleResponse = async (correct: boolean) => {
    const currentCard = studyCards[currentCardIndex];
    const newStudyCount = currentCard.studyCount + 1;
    const totalCorrectAnswers = correct 
      ? (currentCard.successRate * currentCard.studyCount) + 1 
      : (currentCard.successRate * currentCard.studyCount);
    
    const newSuccessRate = totalCorrectAnswers / newStudyCount;
    const newStatus: 'learning' | 'known' = newSuccessRate >= 0.8 && newStudyCount >= 2 ? 'known' : 'learning';

    const updatedCard = {
      ...currentCard,
      studyCount: newStudyCount,
      successRate: newSuccessRate,
      status: newStatus,
      lastStudied: new Date(),
    };

    await updateCard(updatedCard);

    // Update session stats
    setSessionStats(prev => ({
      ...prev,
      correctCount: prev.correctCount + (correct ? 1 : 0),
      incorrectCount: prev.incorrectCount + (correct ? 0 : 1),
    }));

    if (currentCardIndex < studyCards.length - 1) {
      setCurrentCardIndex(prev => prev + 1);
      setShowAnswer(false);
    } else {
      // Stop timer and show results
      if (timer) clearInterval(timer);
      setTimer(null);
      
      // Update study stats
      await updateStudyStats({
        correct: sessionStats.correctCount + (correct ? 1 : 0),
        incorrect: sessionStats.incorrectCount + (correct ? 0 : 1),
        duration: elapsedTime,
      });
      
      setShowResults(true);
    }
  };

  const handleFinishSession = () => {
    if (timer) clearInterval(timer);
    setTimer(null);
    setStudyCards([]);
    setCurrentCardIndex(0);
    setShowAnswer(false);
    setSessionSize(null);
    setShowResults(false);
    setModalVisible(false);
  };

  const currentCard = studyCards[currentCardIndex];
  const isSessionActive = studyCards.length > 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {!isSessionActive ? (
        <View style={styles.startContainer}>
          <Text style={[styles.title, { color: colors.text }]}>Yeni Çalışma Oturumu</Text>
          <TouchableOpacity
            style={[styles.startButton, { backgroundColor: colors.primary }]}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.buttonText}>Başla</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.studyContainer}>
          <View style={styles.header}>
            <Text style={[styles.timerText, { color: colors.secondary }]}>
              {formatTime(elapsedTime)}
            </Text>
          </View>

          <TouchableOpacity 
            style={[styles.card, { backgroundColor: colors.card }]}
            onPress={() => setShowAnswer(true)}
            activeOpacity={0.8}
          >
            <Text style={[styles.cardText, { color: colors.text }]}>
              {showAnswer ? currentCard.turkish : currentCard.english}
            </Text>
            {!showAnswer && (
              <Text style={[styles.tapHint, { color: colors.secondary }]}>
                Çeviri için dokun
              </Text>
            )}
          </TouchableOpacity>
          
          {showAnswer && (
            <View style={styles.responseButtons}>
              <TouchableOpacity
                style={[styles.responseButton, { backgroundColor: colors.error }]}
                onPress={() => handleResponse(false)}
              >
                <Text style={styles.buttonText}>Bilmedim</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.responseButton, { backgroundColor: colors.success }]}
                onPress={() => handleResponse(true)}
              >
                <Text style={styles.buttonText}>Bildim</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.progress}>
            <Text style={[styles.progressText, { color: colors.secondary }]}>
              {currentCardIndex + 1} / {studyCards.length}
            </Text>
          </View>
        </View>
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible || showResults}
        onRequestClose={() => {
          if (showResults) {
            handleFinishSession();
          } else {
            setModalVisible(false);
          }
        }}
      >
        <View style={[styles.modalContainer, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            {showResults ? (
              <>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Çalışma Sonuçları</Text>
                <View style={styles.resultRow}>
                  <Text style={[styles.resultLabel, { color: colors.secondary }]}>Doğru:</Text>
                  <Text style={[styles.resultValue, { color: colors.success }]}>
                    {sessionStats.correctCount}
                  </Text>
                </View>
                <View style={styles.resultRow}>
                  <Text style={[styles.resultLabel, { color: colors.secondary }]}>Yanlış:</Text>
                  <Text style={[styles.resultValue, { color: colors.error }]}>
                    {sessionStats.incorrectCount}
                  </Text>
                </View>
                <View style={styles.resultRow}>
                  <Text style={[styles.resultLabel, { color: colors.secondary }]}>Başarı Oranı:</Text>
                  <Text style={[styles.resultValue, { 
                    color: sessionStats.correctCount / studyCards.length >= 0.8 ? colors.success : colors.error 
                  }]}>
                    {Math.round((sessionStats.correctCount / studyCards.length) * 100)}%
                  </Text>
                </View>
                <View style={styles.resultRow}>
                  <Text style={[styles.resultLabel, { color: colors.secondary }]}>Süre:</Text>
                  <Text style={[styles.resultValue, { color: colors.text }]}>
                    {formatTime(elapsedTime)}
                  </Text>
                </View>

                <View style={[styles.separator, { backgroundColor: colors.border }]} />

                <Text style={[styles.sectionTitle, { color: colors.text }]}>Genel İstatistikler</Text>
                <View style={styles.resultRow}>
                  <Text style={[styles.resultLabel, { color: colors.secondary }]}>Toplam Çalışma:</Text>
                  <Text style={[styles.resultValue, { color: colors.text }]}>
                    {studyStats.totalSessions}
                  </Text>
                </View>
                <View style={styles.resultRow}>
                  <Text style={[styles.resultLabel, { color: colors.secondary }]}>Toplam Doğru:</Text>
                  <Text style={[styles.resultValue, { color: colors.success }]}>
                    {studyStats.totalCorrect}
                  </Text>
                </View>
                <View style={styles.resultRow}>
                  <Text style={[styles.resultLabel, { color: colors.secondary }]}>Toplam Yanlış:</Text>
                  <Text style={[styles.resultValue, { color: colors.error }]}>
                    {studyStats.totalIncorrect}
                  </Text>
                </View>
                <View style={styles.resultRow}>
                  <Text style={[styles.resultLabel, { color: colors.secondary }]}>Toplam Süre:</Text>
                  <Text style={[styles.resultValue, { color: colors.text }]}>
                    {formatTime(studyStats.totalTime)}
                  </Text>
                </View>

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, { backgroundColor: colors.error }]}
                    onPress={handleFinishSession}
                  >
                    <Text style={styles.buttonText}>Bitir</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, { backgroundColor: colors.success }]}
                    onPress={() => startNewSession(sessionSize || 5)}
                  >
                    <Text style={styles.buttonText}>Yeni Çalışma</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Kart Sayısı Seç</Text>
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, { backgroundColor: colors.primary }]}
                    onPress={() => startNewSession(5)}
                  >
                    <Text style={styles.buttonText}>5 Kart</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, { backgroundColor: colors.primary }]}
                    onPress={() => startNewSession(10)}
                  >
                    <Text style={styles.buttonText}>10 Kart</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
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
  },
  startContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  startButton: {
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
  },
  studyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: 10,
  },
  timerText: {
    fontSize: 20,
    fontWeight: '600',
  },
  card: {
    width: '100%',
    aspectRatio: 1.6,
    borderRadius: 12,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
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
    fontWeight: 'bold',
    textAlign: 'center',
  },
  tapHint: {
    fontSize: 14,
    marginTop: 10,
    opacity: 0.7,
  },
  responseButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
  },
  responseButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  progress: {
    marginTop: 20,
  },
  progressText: {
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    borderRadius: 15,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
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
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  resultLabel: {
    fontSize: 16,
  },
  resultValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  separator: {
    height: 1,
    marginVertical: 15,
  },
}); 