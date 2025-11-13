import React from 'react';
import { View } from 'react-native';
import { theme } from '../../src/theme';

export default function Card({ children, style }) {
  return (
    <View style={[{ backgroundColor: theme.colors.card, borderRadius: 12, padding: 12 }, style]}>
      {children}
    </View>
  );
}
