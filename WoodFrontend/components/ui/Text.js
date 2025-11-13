import React from 'react';
import { Text as RNText } from 'react-native';
import { theme } from '../../src/theme';

export default function Text({ children, style, ...rest }) {
  return (
    <RNText style={[{ color: theme.colors.text }, style]} {...rest}>
      {children}
    </RNText>
  );
}
