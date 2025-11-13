import React, { useEffect, useState, useCallback } from 'react';
import { View, TouchableOpacity } from 'react-native';
import Screen from '../components/ui/Screen';
import Text from '../components/ui/Text';
import { Image } from 'expo-image';
import { api } from '../src/api';
import { theme } from '../src/theme';
import { SkeletonBox } from '../components/ui/Skeleton';

export default function SeriesScreen({ route, navigation }) {
  const id = route?.params?.id;
  const [series, setSeries] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const data = await api.series(id);
        setSeries(data);
      } catch (e) {
        setError(e?.message || 'Failed to load series');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const openEpisode = useCallback((ep) => {
    navigation.navigate('Episode', { id: ep._id || ep.id });
  }, [navigation]);

  return (
    <Screen>
      {loading ? (
        <View>
          <SkeletonBox width={'100%'} height={220} borderRadius={12} />
          <SkeletonBox width={'50%'} height={22} borderRadius={6} style={{ marginTop: 12 }} />
          <SkeletonBox width={'80%'} height={14} borderRadius={6} style={{ marginTop: 8 }} />
          <SkeletonBox width={'90%'} height={14} borderRadius={6} style={{ marginTop: 6 }} />
        </View>
      ) : error ? (
        <Text style={{ color: theme.colors.textMuted }}>{String(error)}</Text>
      ) : series ? (
        <View>
          {series.poster && (
            <Image source={{ uri: series.poster }} style={{ width: '100%', height: 220, borderRadius: 12 }} contentFit="cover" />
          )}
          <Text style={{ fontSize: 24, marginTop: 12 }}>{series.title}</Text>
          {series.description ? (
            <Text style={{ color: theme.colors.textMuted, marginTop: 6 }}>{series.description}</Text>
          ) : null}
          <Text style={{ marginTop: 16, marginBottom: 8, fontSize: 18 }}>Episodes</Text>
          {Array.isArray(series.episodes) && series.episodes.length > 0 ? (
            series.episodes.map((ep) => (
              <TouchableOpacity key={String(ep._id || ep.id)} onPress={() => openEpisode(ep)} style={{ paddingVertical: 12, borderBottomWidth: 1, borderColor: theme.colors.border }}>
                <Text>{ep.title}</Text>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={{ color: theme.colors.textMuted }}>No episodes yet.</Text>
          )}
        </View>
      ) : null}
    </Screen>
  );
}
import React, { useEffect, useState } from 'react';
import { View, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { api } from '../src/api';
import { useUser } from '../src/userContext';
import Screen from '../components/ui/Screen';
import { Title, Body } from '../components/ui/Text';
import Badge from '../components/ui/Badge';
import { theme } from '../src/theme';

export default function SeriesScreen({ route, navigation }) {
  const { id } = route.params;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, refresh } = useUser();
  const [cfg, setCfg] = useState(null); // { episodeFreeLimit, episodeCost }

  const load = async () => {
    setLoading(true); setError('');
    try {
      const res = await api.series(id);
      setData(res);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); if (!user) refresh().catch((e) => { console.warn('refresh failed', e?.message); }); // ensure we have user to mark unlocked
    (async () => { try { const c = await api.feedConfig(); setCfg(c); } catch (e) { console.warn('feedConfig failed', e?.message); } })();
  }, [id]);

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} color={theme.colors.primary} />;
  if (error) return <Screen><Body style={{ color: theme.colors.danger, margin: theme.spacing(2) }}>{error}</Body></Screen>;

  return (
    <Screen>
      <Title style={{ marginTop: theme.spacing(1) }}>{data.series.title}</Title>
      {!!data.series.description && (
        <Body muted style={{ marginTop: 6, marginBottom: theme.spacing(1) }}>{data.series.description}</Body>
      )}
      <FlatList
        data={data.episodes}
        keyExtractor={(e) => e._id}
        renderItem={({ item }) => {
          const unlocked = Array.isArray(user?.unlockedEpisodes) && user.unlockedEpisodes.includes(item._id);
          const isFree = cfg ? (item.episodeNumber <= cfg.episodeFreeLimit) : null;
          return (
            <TouchableOpacity
              style={{ paddingVertical: theme.spacing(2), borderBottomWidth: 1, borderColor: theme.colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
              onPress={() => navigation.navigate('Episode', {
                id: item._id,
                seriesId: data.series._id,
                episodeNumber: item.episodeNumber,
                title: `${data.series.title} Ep ${item.episodeNumber}`
              })}
            >
              <Body>Episode {item.episodeNumber}</Body>
              <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                {typeof isFree === 'boolean' && (
                  <Badge label={isFree ? 'Free' : `Paid ${cfg?.episodeCost ?? ''}`} tone={isFree ? 'default' : 'warn'} />
                )}
                {unlocked && <Badge label="Unlocked" tone="success" />}
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </Screen>
  );
}
