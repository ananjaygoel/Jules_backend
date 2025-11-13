import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { theme } from '../../src/theme';

export default function Button({ title, onPress, style, textStyle }) {
  return (
    <TouchableOpacity onPress={onPress} style={[{ backgroundColor: theme.colors.primary, paddingVertical: 12, paddingHorizontal: 16, borderRadius: 8, alignItems: 'center' }, style]}>
      <Text style={[{ color: 'white', fontWeight: '600' }, textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
}
