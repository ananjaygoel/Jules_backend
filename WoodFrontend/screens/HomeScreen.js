import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, FlatList, Image } from 'react-native';
import { theme } from '../src/theme';
import { api } from '../src/api';
import SeriesCard from '../components/SeriesCard';
import { SkeletonGrid } from '../components/ui/Skeleton';

export default function HomeScreen({ navigation }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await api.home({ page: 1, limit: 20 });
        // expecting data to be an array of series; adapt if shape differs
        setItems(Array.isArray(data) ? data : data?.items || []);
      } catch (e) {
        setError(e?.message || 'Failed to load feed');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const renderItem = useCallback(({ item }) => (
    <SeriesCard
      title={item.title || item.name}
      posterUrl={item.posterUrl || item.poster}
      onPress={() => navigation.navigate('Series', { id: item._id || item.id })}
    />
  ), [navigation]);

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background, paddingHorizontal: 14, paddingTop: 12 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Image source={require('../assets/logo.png')} style={{ width: 28, height: 28, marginRight: 8 }} />
          <Text style={{ color: theme.colors.text, fontSize: 20, fontWeight: '700' }}>WOOD</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Payments')} style={{ backgroundColor: theme.colors.card, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8 }}>
          <Text style={{ color: theme.colors.text }}>Premium</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <SkeletonGrid count={8} />
      ) : error ? (
        <Text style={{ color: theme.colors.textMuted }}>{String(error)}</Text>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(it, idx) => String(it._id || it.id || idx)}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: 'space-between' }}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 24 }}
        />
      )}
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
