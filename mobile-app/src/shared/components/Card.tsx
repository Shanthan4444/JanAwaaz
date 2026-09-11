import React from 'react';
import { View, StyleSheet } from 'react-native';

interface CardProps {
  children: React.ReactNode;
  style?: any;
}

export const Card: React.FC<CardProps> = ({ children, style }) => {
  return (
    <View style={[styles.card, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#11131E',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1E2235',
    padding: 16,
    marginBottom: 16
  }
});
