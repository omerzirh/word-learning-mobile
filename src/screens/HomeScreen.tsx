import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Language Cards</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
}); 