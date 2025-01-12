import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export function CardsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Cards</Text>
    </View>
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
}); 