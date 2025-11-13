import React from 'react';
import { View } from 'react-native';
import { theme } from '../../src/theme';

export default function Screen({ children, style }) {
  return <View style={[{ flex: 1, backgroundColor: theme.colors.background, padding: 16 }, style]}>{children}</View>;
}
