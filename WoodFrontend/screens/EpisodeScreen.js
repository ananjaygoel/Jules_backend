import React, { useEffect, useState, useCallback } from 'react';
import { View, Alert } from 'react-native';
import Screen from '../components/ui/Screen';
import Text from '../components/ui/Text';
import Button from '../components/ui/Button';
import { Image } from 'expo-image';
import { api } from '../src/api';
import { theme } from '../src/theme';
import { VideoView, useVideoPlayer } from 'expo-video';
import { SkeletonBox } from '../components/ui/Skeleton';

export default function EpisodeScreen({ route, navigation }) {
  const id = route?.params?.id;
  const [ep, setEp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unlocking, setUnlocking] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const data = await api.episode(id);
        setEp(data);
      } catch (e) {
        setError(e?.message || 'Failed to load episode');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const onPeek = useCallback(async () => {
    try {
      await api.peekEpisode(id);
      Alert.alert('Peek', 'Preview unlocked briefly.');
    } catch (e) {
      Alert.alert('Peek failed', e?.message || 'Try again later');
    }
  }, [id]);

  const onUnlock = useCallback(async () => {
    Alert.alert('Unlock episode?', 'Spend coins to unlock this episode?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Unlock',
        onPress: async () => {
          try {
            setUnlocking(true);
            await api.unlockEpisode(id);
            Alert.alert('Unlocked', 'Episode unlocked. Enjoy!');
          } catch (e) {
            Alert.alert('Unlock failed', e?.message || 'Not enough coins or restricted');
          } finally {
            setUnlocking(false);
          }
        },
      },
    ]);
  }, [id]);

  const previewUrl = ep?.previewUrl || ep?.videoPreviewUrl || ep?.videoUrl;
  const player = useVideoPlayer(previewUrl || null, (p) => {
    if (previewUrl) {
      p.loop = true;
      p.play();
      p.volume = 0;
      p.muted = true;
    }
  });

  return (
    <Screen>
      {loading ? (
        <View>
          <SkeletonBox width={'100%'} height={220} borderRadius={12} />
          <SkeletonBox width={'60%'} height={22} borderRadius={6} style={{ marginTop: 12 }} />
          <SkeletonBox width={'90%'} height={14} borderRadius={6} style={{ marginTop: 8 }} />
          <SkeletonBox width={'85%'} height={14} borderRadius={6} style={{ marginTop: 6 }} />
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
            <SkeletonBox width={90} height={40} borderRadius={8} />
            <SkeletonBox width={120} height={40} borderRadius={8} />
          </View>
        </View>
      ) : error ? (
        <Text style={{ color: theme.colors.textMuted }}>{String(error)}</Text>
      ) : ep ? (
        <View>
          {previewUrl ? (
            <VideoView
              player={player}
              style={{ width: '100%', height: 220, borderRadius: 12, overflow: 'hidden', backgroundColor: '#111' }}
              allowsFullscreen={false}
              allowsPictureInPicture={false}
            />
          ) : ep.poster ? (
            <Image source={{ uri: ep.poster }} style={{ width: '100%', height: 220, borderRadius: 12 }} contentFit="cover" />
          ) : null}
          <Text style={{ fontSize: 24, marginTop: 12 }}>{ep.title}</Text>
          {ep.description ? (
            <Text style={{ color: theme.colors.textMuted, marginTop: 6 }}>{ep.description}</Text>
          ) : null}
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
            <Button title="Peek" onPress={onPeek} />
            <Button title={unlocking ? 'Unlocking…' : 'Unlock'} onPress={onUnlock} style={{ backgroundColor: '#2563eb' }} />
          </View>
        </View>
      ) : null}
    </Screen>
  );
}
import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { api } from '../src/api';
import { useUser } from '../src/userContext';
import { Video, ResizeMode } from 'expo-video';
import Screen from '../components/ui/Screen';
import { Title, Body } from '../components/ui/Text';
import { PrimaryButton, SecondaryButton } from '../components/ui/Button';
import { theme } from '../src/theme';

export default function EpisodeScreen({ route, navigation }) {
  const { id, seriesId, episodeNumber } = route.params;
  const [episode, setEpisode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lock, setLock] = useState(null); // { type: 'insufficient' | 'previous' | 'confirm', message?: string, coins?: number, cost?: number, prevId?: string }
  const { refresh } = useUser();

  const load = async () => {
    setLoading(true); setError(''); setLock(null);
    try {
      // Try peek first to see if we should confirm unlock
      const peek = await api.peekEpisode(id);
      if (peek.status === 'free' || peek.status === 'unlocked') {
        const res = await api.episode(id);
        setEpisode(res);
        refresh().catch((e) => { console.warn('refresh failed', e?.message); });
      } else if (peek.status === 'can_unlock') {
        setLock({ type: 'confirm', coins: peek.coins, cost: peek.cost });
      } else if (peek.status === 'insufficient_coins') {
        setLock({ type: 'insufficient', coins: peek.coins, message: 'Insufficient coins' });
      } else if (peek.status === 'previous_locked') {
        setLock({ type: 'previous', prevId: peek.previousEpisodeId, message: 'You must unlock the previous episode first.' });
      } else {
        // Unknown status: fallback to trying to load
        const res = await api.episode(id);
        setEpisode(res);
      }
    } catch (e) {
      // If peek fails (older backend), fallback to previous behavior
      try {
        const res = await api.episode(id);
        setEpisode(res);
        refresh().catch((e) => { console.warn('refresh failed', e?.message); });
      } catch (err) {
        if (err.status === 402) {
          setLock({ type: 'insufficient', message: err.message });
          try { const me = await api.me(); setLock((prev) => ({ ...prev, coins: me.coins })); } catch (e2) { console.warn('me failed', e2?.message); }
        } else if (err.status === 403) {
          setLock({ type: 'previous', message: err.message });
        } else {
          setError(err.message);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} color={theme.colors.primary} />;
  if (error) return <Screen><Body style={{ color: theme.colors.danger, margin: 16 }}>{error}</Body></Screen>;

  const handleUnlock = async () => {
    setLoading(true);
    try {
      await api.unlockEpisode(id);
      await refresh();
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  if (lock) {
    return (
      <Screen>
        {lock.type === 'insufficient' ? (
          <>
            <Title>Episode locked</Title>
            <Body muted>You don’t have enough coins to unlock this episode.</Body>
            {typeof lock.coins === 'number' && (
              <Body muted>Your coins: {lock.coins}</Body>
            )}
            <PrimaryButton title="Earn coins in Tasks" onPress={() => navigation.navigate('Main', { screen: 'Tasks' })} />
            <SecondaryButton title="I have coins now — Try unlock" onPress={load} />
          </>
        ) : lock.type === 'previous' ? (
          <>
            <Title>Unlock previous episode</Title>
            <Body muted>You must unlock the previous episode first.</Body>
            {seriesId && episodeNumber > 1 && (
              <PrimaryButton
                title="Go to previous episode"
                onPress={async () => {
                  try {
                    const data = await api.series(seriesId);
                    const prev = data.episodes.find(e => e.episodeNumber === episodeNumber - 1);
                    if (prev) {
                      navigation.replace('Episode', { id: prev._id, seriesId, episodeNumber: prev.episodeNumber, title: `${data.series.title} Ep ${prev.episodeNumber}` });
                    } else {
                      navigation.navigate('Series', { id: seriesId });
                    }
                  } catch {
                    navigation.navigate('Series', { id: seriesId });
                  }
                }}
              />
            )}
            {seriesId && <SecondaryButton title="Back to Series" onPress={() => navigation.navigate('Series', { id: seriesId })} />}
          </>
        ) : (
          <>
            <Title>Unlock episode?</Title>
            <Body muted>This episode costs {lock.cost ?? '...'} coins.</Body>
            {typeof lock.coins === 'number' && (
              <Body muted>Your coins: {lock.coins}</Body>
            )}
            <PrimaryButton title="Unlock now" onPress={handleUnlock} />
            <SecondaryButton title="Cancel" onPress={() => navigation.goBack()} />
          </>
        )}
      </Screen>
    );
  }

  return (
    <Screen padded={false}>
      <Video
        source={{ uri: episode.videoUrl }}
        style={{ width: '100%', height: 260, backgroundColor: '#000' }}
        useNativeControls
        resizeMode={ResizeMode.CONTAIN}
      />
      <View style={{ padding: theme.spacing(2) }}>
        <Title>Episode #{episode.episodeNumber}</Title>
      </View>
    </Screen>
  );
}
