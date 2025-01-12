import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Card } from '../types';

const CARDS_STORAGE_KEY = '@language_cards';

export function useCards() {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCards();
  }, []);

  const loadCards = async () => {
    try {
      const storedCards = await AsyncStorage.getItem(CARDS_STORAGE_KEY);
      if (storedCards) {
        setCards(JSON.parse(storedCards));
      }
    } catch (error) {
      console.error('Error loading cards:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveCards = async (newCards: Card[]) => {
    try {
      await AsyncStorage.setItem(CARDS_STORAGE_KEY, JSON.stringify(newCards));
      setCards(newCards);
    } catch (error) {
      console.error('Error saving cards:', error);
    }
  };

  const addCard = async (card: Omit<Card, 'id' | 'createdAt' | 'studyCount' | 'successRate'>) => {
    const newCard: Card = {
      ...card,
      id: Date.now().toString(),
      createdAt: new Date(),
      studyCount: 0,
      successRate: 0,
    };

    const newCards = [...cards, newCard];
    await saveCards(newCards);
  };

  const updateCard = async (updatedCard: Card) => {
    try {
      const newCards = cards.map(card => 
        card.id === updatedCard.id ? updatedCard : card
      );
      
      await AsyncStorage.setItem(CARDS_STORAGE_KEY, JSON.stringify(newCards));
      
      setCards(newCards);
      
      return true;
    } catch (error) {
      console.error('Error updating card:', error);
      return false;
    }
  };

  const deleteCard = async (cardId: string) => {
    const newCards = cards.filter(card => card.id !== cardId);
    await saveCards(newCards);
  };

  return {
    cards,
    loading,
    addCard,
    updateCard,
    deleteCard,
  };
} 