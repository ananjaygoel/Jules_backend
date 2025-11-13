import React from 'react';
import { View, Text } from 'react-native';
import { theme } from '../../src/theme';

export default function Badge({ label, style, textStyle }) {
  return (
    <View style={[{ backgroundColor: theme.colors.card, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }, style]}>
      <Text style={[{ color: theme.colors.text, fontSize: 12 }, textStyle]}>{label}</Text>
    </View>
  );
}
