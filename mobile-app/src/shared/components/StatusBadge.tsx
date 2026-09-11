import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface StatusBadgeProps {
  status: string;
  style?: any;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, style }) => {
  const getBadgeColors = () => {
    switch (status) {
      case 'CLOSED':
      case 'RESOLVED':
        return { bg: 'rgba(16, 185, 129, 0.15)', text: '#10B981' };
      case 'IN_PROGRESS':
      case 'ASSIGNED':
        return { bg: 'rgba(245, 158, 11, 0.15)', text: '#F59E0B' };
      case 'REOPENED':
        return { bg: 'rgba(239, 68, 68, 0.15)', text: '#EF4444' };
      case 'REPORTED':
      case 'VERIFIED':
      default:
        return { bg: 'rgba(99, 102, 241, 0.15)', text: '#6366F1' };
    }
  };

  const colors = getBadgeColors();

  return (
    <View style={[styles.badge, { backgroundColor: colors.bg }, style]}>
      <Text style={[styles.text, { color: colors.text }]}>{status}</Text>
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
