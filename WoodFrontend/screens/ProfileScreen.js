import React from 'react';
import Screen from '../components/ui/Screen';
import Text from '../components/ui/Text';

export default function ProfileScreen() {
  return (
    <Screen>
      <Text style={{ fontSize: 22 }}>Profile</Text>
    </Screen>
  );
}
import React, { useEffect, useState } from 'react';
import { View, TextInput, StyleSheet, FlatList } from 'react-native';
import { api } from '../src/api';
import { clearAuth } from '../src/auth';
import { useUser } from '../src/userContext';
import { useNavigation } from '@react-navigation/native';
import Screen from '../components/ui/Screen';
import { Title, Body } from '../components/ui/Text';
import { PrimaryButton, SecondaryButton } from '../components/ui/Button';
import { theme } from '../src/theme';

export default function ProfileScreen() {
  const { user, refresh } = useUser();
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [msg, setMsg] = useState('');
  const [started, setStarted] = useState([]);

  const load = async () => {
    try {
      await refresh();
      setName(user?.name || '');
      try {
        const s = await api.startedSeries();
        setStarted(Array.isArray(s) ? s : []);
      } catch (e) { console.warn('startedSeries failed', e?.message); }
    } catch (e) {
      setMsg(e.message);
    }
  };

  useEffect(() => { load(); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const save = async () => {
    setMsg('');
    try {
      await api.updateMe({ name });
      await refresh();
      setMsg('Saved');
    } catch (e) {
      setMsg(e.message);
    }
  };

  return (
    <Screen>
      <View style={styles.container}>
        <Title>Profile</Title>
        {user ? (
          <>
            <Body>Email: {user.email}</Body>
            <Body>Coins: {user.coins ?? 0}</Body>
            <TextInput style={styles.input} value={name} onChangeText={setName} placeholderTextColor={theme.colors.textMuted} />
            <PrimaryButton title="Save" onPress={save} />
            <SecondaryButton title="Buy Coins / Subscribe" onPress={() => navigation.navigate('Payments')} />
            <SecondaryButton title="Logout" onPress={clearAuth} />
            <Title style={{ marginTop: theme.spacing(2) }}>Started Series</Title>
            <FlatList
              data={started}
              keyExtractor={(i) => i._id}
              renderItem={({ item }) => (
                <Body style={{ paddingVertical: 6 }}>{item.title}</Body>
              )}
            />
          </>
        ) : (
          <Body>Loading… {msg}</Body>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12 },
  input: { borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.radius.lg, padding: 14, color: theme.colors.text, backgroundColor: theme.colors.card }
});
