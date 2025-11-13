import React from 'react';
import Screen from '../components/ui/Screen';
import Text from '../components/ui/Text';

export default function SearchScreen() {
  return (
    <Screen>
      <Text style={{ fontSize: 22 }}>Search</Text>
    </Screen>
  );
}
import React, { useState } from 'react';
import { View, TextInput, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { api } from '../src/api';
import SeriesCard from '../components/SeriesCard';
import Screen from '../components/ui/Screen';
import { Body } from '../components/ui/Text';
import { theme } from '../src/theme';

export default function SearchScreen({ navigation }) {
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const run = async () => {
    if (!q.trim()) return;
    setLoading(true); setError('');
    try {
      const data = await api.search(q, 1, 20);
      setResults(Array.isArray(data.series) ? data.series : []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await run();
    setRefreshing(false);
  };

  return (
    <Screen padded={false}>
      <View style={{ padding: theme.spacing(2), paddingBottom: theme.spacing(1), flexDirection: 'row', gap: 8 }}>
        <TextInput
          style={{ flex: 1, borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.radius.lg, padding: 12, color: theme.colors.text, backgroundColor: theme.colors.card }}
          placeholder="Search series or genre"
          placeholderTextColor={theme.colors.textMuted}
          value={q}
          onChangeText={setQ}
          onSubmitEditing={run}
          returnKeyType="search"
        />
      </View>
      {loading && <ActivityIndicator style={{ marginTop: 12 }} color={theme.colors.primary} />}
      {!!error && <Body style={{ color: theme.colors.danger, margin: 12 }}>{error}</Body>}
      <FlatList
        data={results}
        contentContainerStyle={{ padding: theme.spacing(2), gap: theme.spacing(2) }}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <SeriesCard item={item} onPress={() => navigation.navigate('Series', { id: item._id, title: item.title })} />
        )}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />}
      />
    </Screen>
  );
}
