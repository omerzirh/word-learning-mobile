import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useCardStore } from '../../src/store/useCardStore';
import { useTheme } from '../../src/hooks/useTheme';

export default function StatsScreen() {
  const { colors } = useTheme();
  const { cards, studyStats } = useCardStore();

  const learningCards = cards.filter(card => card.status === 'learning');
  const knownCards = cards.filter(card => card.status === 'known');

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const calculateAverageSuccessRate = () => {
    if (cards.length === 0) return 0;
    const totalSuccessRate = cards.reduce((sum, card) => sum + card.successRate, 0);
    return (totalSuccessRate / cards.length) * 100;
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>İstatistikler</Text>

      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Kartlar</Text>
        <View style={styles.statRow}>
          <Text style={[styles.statLabel, { color: colors.secondary }]}>Toplam Kart:</Text>
          <Text style={[styles.statValue, { color: colors.text }]}>{cards.length}</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={[styles.statLabel, { color: colors.secondary }]}>Öğreniliyor:</Text>
          <Text style={[styles.statValue, { color: colors.text }]}>{learningCards.length}</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={[styles.statLabel, { color: colors.secondary }]}>Öğrenildi:</Text>
          <Text style={[styles.statValue, { color: colors.text }]}>{knownCards.length}</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={[styles.statLabel, { color: colors.secondary }]}>Ortalama Başarı:</Text>
          <Text style={[styles.statValue, { color: colors.text }]}>
            {calculateAverageSuccessRate().toFixed(1)}%
          </Text>
        </View>
      </View>

      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Çalışma</Text>
        <View style={styles.statRow}>
          <Text style={[styles.statLabel, { color: colors.secondary }]}>Toplam Oturum:</Text>
          <Text style={[styles.statValue, { color: colors.text }]}>{studyStats.totalSessions}</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={[styles.statLabel, { color: colors.secondary }]}>Toplam Doğru:</Text>
          <Text style={[styles.statValue, { color: colors.success }]}>{studyStats.totalCorrect}</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={[styles.statLabel, { color: colors.secondary }]}>Toplam Yanlış:</Text>
          <Text style={[styles.statValue, { color: colors.error }]}>{studyStats.totalIncorrect}</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={[styles.statLabel, { color: colors.secondary }]}>Toplam Süre:</Text>
          <Text style={[styles.statValue, { color: colors.text }]}>{formatTime(studyStats.totalTime)}</Text>
        </View>
      </View>

      {knownCards.length > 0 && (
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Son Öğrenilen Kartlar</Text>
          {knownCards
            .filter(card => card.lastStudied)
            .sort((a, b) => (b.lastStudied?.getTime() ?? 0) - (a.lastStudied?.getTime() ?? 0))
            .slice(0, 5)
            .map(card => (
              <View key={card.id} style={[styles.cardItem, { borderBottomColor: colors.border }]}>
                <View>
                  <Text style={[styles.cardText, { color: colors.text }]}>{card.english}</Text>
                  <Text style={[styles.cardSubText, { color: colors.secondary }]}>{card.turkish}</Text>
                </View>
                <View style={styles.cardStats}>
                  <Text style={[styles.cardStatText, { color: colors.secondary }]}>
                    {(card.successRate * 100).toFixed(0)}%
                  </Text>
                  <Text style={[styles.cardStatText, { color: colors.secondary }]}>
                    {card.studyCount} çalışma
                  </Text>
                </View>
              </View>
            ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  section: {
    borderRadius: 12,
    padding: 15,
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  statLabel: {
    fontSize: 16,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  cardItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  cardText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardSubText: {
    fontSize: 14,
  },
  cardStats: {
    alignItems: 'flex-end',
  },
  cardStatText: {
    fontSize: 12,
  },
}); 