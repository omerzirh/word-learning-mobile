import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Card } from '../types';

const APP_VERSION = '1.0.0';
const CARDS_STORAGE_KEY = '@kelime_karti_cards';
const VERSION_KEY = '@kelime_karti_version';

interface CardStore {
  cards: Card[];
  loading: boolean;
  studyStats: {
    totalSessions: number;
    totalCorrect: number;
    totalIncorrect: number;
    totalTime: number;
    lastSession?: {
      date: Date;
      correct: number;
      incorrect: number;
      duration: number;
    };
  };
  addCard: (card: Omit<Card, 'id' | 'createdAt' | 'studyCount' | 'successRate'>) => Promise<void>;
  updateCard: (card: Card) => Promise<void>;
  deleteCard: (cardId: string) => Promise<void>;
  loadCards: () => Promise<void>;
  updateStudyStats: (stats: {
    correct: number;
    incorrect: number;
    duration: number;
  }) => Promise<void>;
}

const saveToStorage = async (key: string, data: any) => {
  try {
    const jsonValue = JSON.stringify(data);
    await AsyncStorage.setItem(key, jsonValue);
  } catch (error) {
    console.error(`Error saving to storage (${key}):`, error);
    throw error;
  }
};

const migrateDataIfNeeded = async () => {
  try {
    const storedVersion = await AsyncStorage.getItem(VERSION_KEY);
    
    if (storedVersion !== APP_VERSION) {
      // Here we can add migration logic for future versions
      // For example:
      // if (storedVersion === '1.0.0' && APP_VERSION === '2.0.0') {
      //   // Migrate data from 1.0.0 to 2.0.0
      // }
      
      // Update stored version after migration
      await AsyncStorage.setItem(VERSION_KEY, APP_VERSION);
    }
  } catch (error) {
    console.error('Error during migration:', error);
  }
};

export const useCardStore = create<CardStore>((set, get) => ({
  cards: [],
  loading: true,
  studyStats: {
    totalSessions: 0,
    totalCorrect: 0,
    totalIncorrect: 0,
    totalTime: 0,
  },

  loadCards: async () => {
    try {
      // Check for migrations first
      await migrateDataIfNeeded();

      const [storedCards, storedStats] = await Promise.all([
        AsyncStorage.getItem(CARDS_STORAGE_KEY),
        AsyncStorage.getItem(CARDS_STORAGE_KEY + '_stats')
      ]);

      const parsedCards = storedCards ? JSON.parse(storedCards) : [];
      const parsedStats = storedStats ? JSON.parse(storedStats) : {
        totalSessions: 0,
        totalCorrect: 0,
        totalIncorrect: 0,
        totalTime: 0,
      };

      // Ensure dates are properly parsed
      const cards = parsedCards.map((card: any) => ({
        ...card,
        createdAt: new Date(card.createdAt),
        lastStudied: card.lastStudied ? new Date(card.lastStudied) : undefined,
      }));

      set({
        cards,
        studyStats: {
          ...parsedStats,
          lastSession: parsedStats.lastSession ? {
            ...parsedStats.lastSession,
            date: new Date(parsedStats.lastSession.date),
          } : undefined,
        },
        loading: false,
      });
    } catch (error) {
      console.error('Error loading cards:', error);
      set({ loading: false });
    }
  },

  addCard: async (card) => {
    try {
      const newCard: Card = {
        ...card,
        id: Date.now().toString(),
        createdAt: new Date(),
        studyCount: 0,
        successRate: 0,
      };

      const currentCards = get().cards;
      const newCards = [...currentCards, newCard];

      await saveToStorage(CARDS_STORAGE_KEY, newCards);
      set({ cards: newCards });
    } catch (error) {
      console.error('Error adding card:', error);
      throw error;
    }
  },

  updateCard: async (updatedCard) => {
    try {
      const currentCards = get().cards;
      const cardIndex = currentCards.findIndex(card => card.id === updatedCard.id);
      
      if (cardIndex === -1) {
        throw new Error('Card not found');
      }

      // Ensure dates are Date objects
      const cardToUpdate = {
        ...updatedCard,
        lastStudied: new Date(),
        createdAt: new Date(updatedCard.createdAt),
      };

      const newCards = [...currentCards];
      newCards[cardIndex] = cardToUpdate;

      // First update storage
      await saveToStorage(CARDS_STORAGE_KEY, newCards);
      
      // Then update state
      set({ cards: newCards });
    } catch (error) {
      console.error('Error updating card:', error);
      throw error;
    }
  },

  deleteCard: async (cardId) => {
    try {
      const currentCards = get().cards;
      const newCards = currentCards.filter(card => card.id !== cardId);

      await saveToStorage(CARDS_STORAGE_KEY, newCards);
      set({ cards: newCards });
    } catch (error) {
      console.error('Error deleting card:', error);
      throw error;
    }
  },

  updateStudyStats: async (stats) => {
    try {
      const currentStats = get().studyStats;
      const newStats = {
        totalSessions: currentStats.totalSessions + 1,
        totalCorrect: currentStats.totalCorrect + stats.correct,
        totalIncorrect: currentStats.totalIncorrect + stats.incorrect,
        totalTime: currentStats.totalTime + stats.duration,
        lastSession: {
          date: new Date(),
          ...stats,
        },
      };

      await saveToStorage(CARDS_STORAGE_KEY + '_stats', newStats);
      set({ studyStats: newStats });
    } catch (error) {
      console.error('Error updating stats:', error);
      throw error;
    }
  },
})); 