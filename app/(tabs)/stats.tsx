import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useCardStore } from '../../src/store/useCardStore';

export default function StatsScreen() {
  const { cards } = useCardStore();

  const totalCards = cards.length;
  const knownCards = cards.filter(card => card.status === 'known').length;
  const learningCards = cards.filter(card => card.status === 'learning').length;
  const averageSuccessRate = cards.length > 0
    ? cards.reduce((sum, card) => sum + card.successRate, 0) / cards.length
    : 0;

  const renderStatBox = (title: string, value: string | number, subtitle?: string) => (
    <View style={styles.statBox}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
      {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>İstatistikler</Text>

      <View style={styles.statsGrid}>
        {renderStatBox('Toplam Kart', totalCards)}
        {renderStatBox('Öğrenildi', knownCards)}
        {renderStatBox('Öğreniliyor', learningCards)}
        {renderStatBox(
          'Başarı Oranı',
          `${(averageSuccessRate * 100).toFixed(1)}%`,
          'Ortalama'
        )}
      </View>

      {totalCards === 0 && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            Henüz kart eklenmemiş. İstatistikleri görmek için önce kart ekleyin.
          </Text>
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  statBox: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    width: '47%',
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
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  statSubtitle: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  emptyContainer: {
    marginTop: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
}); 