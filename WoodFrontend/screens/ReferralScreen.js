import React from 'react';
import Screen from '../components/ui/Screen';
import Text from '../components/ui/Text';

export default function ReferralScreen() {
  return (
    <Screen>
      <Text style={{ fontSize: 22 }}>Referral</Text>
    </Screen>
  );
}
import React, { useState } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { api } from '../src/api';
import { useUser } from '../src/userContext';
import Screen from '../components/ui/Screen';
import { Title, Body } from '../components/ui/Text';
import { PrimaryButton, SecondaryButton } from '../components/ui/Button';
import { theme } from '../src/theme';

export default function ReferralScreen() {
  const [code, setCode] = useState('');
  const [msg, setMsg] = useState('');
  const { refresh } = useUser();

  const generate = async () => {
    setMsg('');
    try {
      const res = await api.generateCode();
      setMsg(`Your code: ${res.code}`);
    } catch (e) {
      setMsg(e.message);
    }
  };

  const enter = async () => {
    setMsg('');
    try {
      const res = await api.enterCode(code);
      setMsg(res.message || 'Referral applied');
      await refresh();
    } catch (e) {
      setMsg(e.message);
    }
  };

  return (
    <Screen>
      <View style={styles.container}>
        <Title>Referral</Title>
        <SecondaryButton title="Generate My Code" onPress={generate} />
        <TextInput style={styles.input} value={code} onChangeText={setCode} placeholder="Enter referral code" placeholderTextColor={theme.colors.textMuted} />
        <PrimaryButton title="Apply Code" onPress={enter} />
        {!!msg && <Body style={styles.msg}>{msg}</Body>}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12 },
  input: { borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.radius.lg, padding: 14, color: theme.colors.text, backgroundColor: theme.colors.card },
  msg: { marginTop: 12, color: theme.colors.text }
});
