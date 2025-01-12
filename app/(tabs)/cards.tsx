import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Modal, Alert, ScrollView } from 'react-native';
import { useCardStore } from '../../src/store/useCardStore';
import { Card } from '../../src/types';
import { useTheme } from '../../src/hooks/useTheme';

export default function CardsScreen() {
  const { colors } = useTheme();
  const { cards, loading, addCard, loadCards } = useCardStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<'learning' | 'known'>('learning');
  const [searchText, setSearchText] = useState('');
  const [newCard, setNewCard] = useState({
    english: '',
    turkish: '',
  });

  useEffect(() => {
    loadCards();
  }, []);

  const filteredCards = cards
    .filter(card => card.status === activeTab)
    .filter(card => 
      card.english.toLowerCase().includes(searchText.toLowerCase()) ||
      card.turkish.toLowerCase().includes(searchText.toLowerCase())
    );

  const handleAddCard = async () => {
    if (newCard.english.trim() && newCard.turkish.trim()) {
      await addCard({
        english: newCard.english.trim(),
        turkish: newCard.turkish.trim(),
        status: 'learning',
      });
      setNewCard({ english: '', turkish: '' });
      setModalVisible(false);
    }
  };

  const renderCard = (card: Card) => (
    <TouchableOpacity 
      key={card.id} 
      style={[styles.card, { backgroundColor: colors.card }]} 
      onPress={() => {
        Alert.alert(
          card.english,
          card.turkish,
          [{ text: 'Tamam', style: 'default' }]
        );
      }}
    >
      <Text style={[styles.cardText, { color: colors.text }]}>{card.english}</Text>
      <Text style={[styles.cardSubText, { color: colors.secondary }]}>{card.turkish}</Text>
      <View style={[styles.cardStats, { borderTopColor: colors.border }]}>
        <Text style={[styles.cardStatText, { color: colors.secondary }]}>Başarı: {(card.successRate * 100).toFixed(0)}%</Text>
        <Text style={[styles.cardStatText, { color: colors.secondary }]}>Çalışma: {card.studyCount}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Kartlarım</Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.addButtonText}>+ Yeni Kart</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={[styles.searchInput, { 
            backgroundColor: colors.card,
            color: colors.text,
            borderColor: colors.border
          }]}
          placeholder="Kart ara..."
          placeholderTextColor={colors.secondary}
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      <View style={[styles.tabContainer, { backgroundColor: colors.border }]}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'learning' && [styles.activeTab, { backgroundColor: colors.card }]
          ]}
          onPress={() => setActiveTab('learning')}
        >
          <Text style={[
            styles.tabText,
            { color: colors.secondary },
            activeTab === 'learning' && { color: colors.primary }
          ]}>
            Öğreniliyor ({cards.filter(c => c.status === 'learning').length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'known' && [styles.activeTab, { backgroundColor: colors.card }]
          ]}
          onPress={() => setActiveTab('known')}
        >
          <Text style={[
            styles.tabText,
            { color: colors.secondary },
            activeTab === 'known' && { color: colors.primary }
          ]}>
            Öğrenildi ({cards.filter(c => c.status === 'known').length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.cardList}>
        {filteredCards.map(card => renderCard(card))}
        {filteredCards.length === 0 && (
          <Text style={[styles.emptyText, { color: colors.secondary }]}>
            {activeTab === 'learning' ? 'Öğrenilecek kart yok' : 'Öğrenilmiş kart yok'}
          </Text>
        )}
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Yeni Kart Ekle</Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: colors.background,
                color: colors.text,
                borderColor: colors.border
              }]}
              placeholder="İngilizce"
              placeholderTextColor={colors.secondary}
              value={newCard.english}
              onChangeText={(text) => setNewCard(prev => ({ ...prev, english: text }))}
            />
            <TextInput
              style={[styles.input, { 
                backgroundColor: colors.background,
                color: colors.text,
                borderColor: colors.border
              }]}
              placeholder="Türkçe"
              placeholderTextColor={colors.secondary}
              value={newCard.turkish}
              onChangeText={(text) => setNewCard(prev => ({ ...prev, turkish: text }))}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.error }]}
                onPress={() => {
                  setModalVisible(false);
                  setNewCard({ english: '', turkish: '' });
                }}
              >
                <Text style={styles.modalButtonText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.success }]}
                onPress={handleAddCard}
              >
                <Text style={styles.modalButtonText}>Kaydet</Text>
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
  },
  addButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  searchContainer: {
    marginBottom: 15,
  },
  searchInput: {
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 15,
    borderRadius: 8,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: 'white',
  },
  tabText: {
    fontSize: 16,
  },
  cardList: {
    flex: 1,
  },
  card: {
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
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
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardSubText: {
    fontSize: 16,
    marginBottom: 8,
  },
  cardStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    paddingTop: 8,
    marginTop: 4,
  },
  cardStatText: {
    fontSize: 14,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 20,
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
  input: {
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 12,
    borderWidth: 1,
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
  modalButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
}); 