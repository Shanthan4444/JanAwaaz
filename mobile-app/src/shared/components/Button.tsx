import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useBrandingStore } from '../../store/brandingStore';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'success';
  loading?: boolean;
  disabled?: boolean;
  style?: any;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style
}) => {
  const { primaryColor } = useBrandingStore();

  const getBackgroundColor = () => {
    if (disabled || loading) return '#1A1D26';
    if (variant === 'primary') return primaryColor;
    if (variant === 'secondary') return '#1E293B';
    if (variant === 'danger') return '#EF4444';
    if (variant === 'success') return '#10B981';
    return 'transparent';
  };

  const getTextColor = () => {
    if (disabled) return '#64748B';
    if (variant === 'outline') return primaryColor;
    return '#FFFFFF';
  };

  const getBorderColor = () => {
    if (variant === 'outline') return primaryColor;
    return 'transparent';
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        {
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
          borderWidth: variant === 'outline' ? 1 : 0
        },
        style
      ]}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} size="small" />
      ) : (
        <Text style={[styles.text, { color: getTextColor() }]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    flexDirection: 'row'
  },
  text: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5
  }
});
