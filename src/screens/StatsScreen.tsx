import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export function StatsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Statistics</Text>
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