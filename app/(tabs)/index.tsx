import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Modal, Alert, ScrollView } from 'react-native';
import { useCardStore } from '../../src/store/useCardStore';
import { Card } from '../../src/types';

export default function CardsScreen() {
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
      style={styles.card} 
      onPress={() => {
        Alert.alert(
          card.english,
          card.turkish,
          [{ text: 'Tamam', style: 'default' }]
        );
      }}
    >
      <Text style={styles.cardText}>{card.english}</Text>
      <View style={styles.cardStats}>
        <Text style={styles.cardStatText}>Başarı: {(card.successRate * 100).toFixed(0)}%</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Kartlarım</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.addButtonText}>+ Yeni Kart</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Kart ara..."
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'learning' && styles.activeTab]}
          onPress={() => setActiveTab('learning')}
        >
          <Text style={[styles.tabText, activeTab === 'learning' && styles.activeTabText]}>
            Öğreniliyor ({cards.filter(c => c.status === 'learning').length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'known' && styles.activeTab]}
          onPress={() => setActiveTab('known')}
        >
          <Text style={[styles.tabText, activeTab === 'known' && styles.activeTabText]}>
            Öğrenildi ({cards.filter(c => c.status === 'known').length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.cardList}>
        {filteredCards.map(card => renderCard(card))}
        {filteredCards.length === 0 && (
          <Text style={styles.emptyText}>
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
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Yeni Kart Ekle</Text>
            <TextInput
              style={styles.input}
              placeholder="İngilizce"
              value={newCard.english}
              onChangeText={(text) => setNewCard(prev => ({ ...prev, english: text }))}
            />
            <TextInput
              style={styles.input}
              placeholder="Türkçe"
              value={newCard.turkish}
              onChangeText={(text) => setNewCard(prev => ({ ...prev, turkish: text }))}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setModalVisible(false);
                  setNewCard({ english: '', turkish: '' });
                }}
              >
                <Text style={styles.modalButtonText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
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
  },
  addButton: {
    backgroundColor: '#007AFF',
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
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 15,
    backgroundColor: '#E5E5EA',
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
    color: '#666',
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  cardList: {
    flex: 1,
  },
  card: {
    backgroundColor: 'white',
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
    color: '#666',
    marginBottom: 8,
  },
  cardStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 8,
    marginTop: 4,
  },
  cardStatText: {
    fontSize: 14,
    color: '#666',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginTop: 20,
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
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 12,
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
  cancelButton: {
    backgroundColor: '#ff3b30',
  },
  saveButton: {
    backgroundColor: '#34c759',
  },
  modalButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
}); 