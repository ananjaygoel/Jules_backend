import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { theme } from '../src/theme';

export default function LoginScreen({ navigation }) {
  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: theme.colors.text, fontSize: 28, marginBottom: 24 }}>WOOD</Text>
      <TouchableOpacity onPress={() => navigation.replace('Home')} style={{ backgroundColor: theme.colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 }}>
        <Text style={{ color: 'white', fontWeight: '600' }}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
}
import React, { useState } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { api } from '../src/api';
import Screen from '../components/ui/Screen';
import { Title, Body } from '../components/ui/Text';
import { PrimaryButton } from '../components/ui/Button';
import { theme } from '../src/theme';
import { Image } from 'expo-image';

export default function LoginScreen({ onLogin }) {
  const [name, setName] = useState('Test User');
  const [email, setEmail] = useState('test@example.com');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async () => {
    setLoading(true); setError('');
    try {
      // For demo, generate a deterministic uid; in production, use Firebase Auth
      const firebaseUid = 'test_uid';
      await api.register({ firebaseUid, name, email });
      await onLogin({ firebaseUid });
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <View style={styles.container}>
        <Image source={require('../assets/logo.png')} style={styles.logo} contentFit="contain" cachePolicy="memory-disk" />
        <Title style={styles.title}>WOOD</Title>
        <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Name" placeholderTextColor={theme.colors.textMuted} />
        <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="Email" autoCapitalize="none" placeholderTextColor={theme.colors.textMuted} />
        {!!error && <Body style={styles.error}>{error}</Body>}
        <PrimaryButton title={loading ? 'Please wait…' : 'Continue'} onPress={handleRegister} loading={loading} />
        <Body muted style={styles.hint}>Note: This demo skips Firebase auth. Add Firebase later and pass an ID token in Authorization header.</Body>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', gap: 12 },
  logo: { alignSelf: 'center', width: 96, height: 96, marginBottom: 12 },
  title: { textAlign: 'center', marginBottom: 24 },
  input: { borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.radius.lg, padding: 14, color: theme.colors.text, backgroundColor: theme.colors.card },
  error: { color: theme.colors.danger },
  hint: { marginTop: 12 }
});
