import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface PriorityBadgeProps {
  priority: string | number;
  style?: any;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, style }) => {
  const getBadgeColors = () => {
    const val = String(priority).toUpperCase();
    if (val === 'CRITICAL' || val === 'HIGH') {
      return { bg: 'rgba(239, 68, 68, 0.15)', text: '#EF4444' };
    }
    if (val === 'MEDIUM') {
      return { bg: 'rgba(245, 158, 11, 0.15)', text: '#F59E0B' };
    }
    return { bg: 'rgba(99, 102, 241, 0.15)', text: '#6366F1' };
  };

  const colors = getBadgeColors();

  return (
    <View style={[styles.badge, { backgroundColor: colors.bg }, style]}>
      <Text style={[styles.text, { color: colors.text }]}>{String(priority)}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start'
  },
  text: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5
  }
});
