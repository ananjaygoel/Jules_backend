import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { theme } from '../src/theme';

export default function HomeScreen({ navigation }) {
  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background, padding: 16 }}>
      <Text style={{ color: theme.colors.text, fontSize: 22, marginBottom: 16 }}>Home</Text>
      <TouchableOpacity onPress={() => navigation.navigate('Payments')} style={{ backgroundColor: theme.colors.card, padding: 12, borderRadius: 8 }}>
        <Text style={{ color: theme.colors.text }}>Go to Payments</Text>
      </TouchableOpacity>
    </View>
  );
}
import React, { useEffect, useState, useCallback } from 'react';
import { View, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { api } from '../src/api';
import SeriesCard from '../components/SeriesCard';
import Screen from '../components/ui/Screen';
import { Title, Body } from '../components/ui/Text';
import { theme } from '../src/theme';
import { Image } from 'expo-image';

export default function HomeScreen({ navigation }) {
  const [data, setData] = useState({ series: [], page: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const load = async (page = 1) => {
    setLoading(true); setError('');
    try {
      const res = await api.home({ page, limit: 10 });
      setData(res);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load(1);
    setRefreshing(false);
  }, []);

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} color={theme.colors.primary} />;
  if (error) return <Screen><Body style={{ color: theme.colors.danger, marginTop: theme.spacing(2) }}>{error}</Body></Screen>;

  return (
    <Screen padded={false}>
      <View style={{ paddingHorizontal: theme.spacing(2), paddingTop: theme.spacing(2), paddingBottom: theme.spacing(1) }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <Image source={require('../assets/logo.png')} style={{ width: 24, height: 24, borderRadius: 6 }} contentFit="contain" />
          <Title>Discover</Title>
        </View>
        <Body muted>Fresh micro-dramas tailored for you</Body>
      </View>
      <FlatList
        data={data.series}
        numColumns={2}
        contentContainerStyle={{ padding: theme.spacing(2), gap: theme.spacing(2) }}
        columnWrapperStyle={{ gap: theme.spacing(2) }}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={{ flex: 1 }}>
            <SeriesCard item={item} onPress={() => navigation.navigate('Series', { id: item._id, title: item.title })} />
          </View>
        )}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />}
      />
    </Screen>
  );
}
