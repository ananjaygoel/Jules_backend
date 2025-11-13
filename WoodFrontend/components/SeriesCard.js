import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../src/theme';

export default function SeriesCard({ title, posterUrl, onPress }) {
  return (
    <TouchableOpacity onPress={onPress} style={{ width: '48%', marginBottom: 14 }}>
      <View style={{ borderRadius: 14, overflow: 'hidden', backgroundColor: theme.colors.card }}>
        {posterUrl ? (
          <View>
            <Image
              source={{ uri: posterUrl }}
              style={{ width: '100%', aspectRatio: 2 / 3 }}
              contentFit="cover"
              transition={200}
            />
            <LinearGradient
              colors={["transparent", "rgba(0,0,0,0.65)"]}
              style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '45%' }}
            />
          </View>
        ) : (
          <View style={{ width: '100%', aspectRatio: 2 / 3, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: theme.colors.textMuted }}>No Image</Text>
          </View>
        )}
      </View>
      <Text style={{ color: theme.colors.text, marginTop: 8, fontSize: 14 }} numberOfLines={1}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}
import React from 'react';
import { View, StyleSheet } from 'react-native';
import Card from './ui/Card';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { Body } from './ui/Text';
import { theme } from '../src/theme';

export default function SeriesCard({ item, onPress }) {
  return (
    <Card onPress={onPress} style={styles.card}>
      <View style={styles.imageWrap}>
        <Image source={{ uri: item.coverImageUrl }} style={styles.thumb} contentFit="cover" cachePolicy="memory-disk" />
        <LinearGradient colors={["rgba(0,0,0,0)", 'rgba(0,0,0,0.7)']} style={styles.gradient} />
        <View style={styles.titleWrap}>
          <Body style={styles.title} numberOfLines={2}>{item.title}</Body>
        </View>
      </View>
      {!!item.genre && <Body muted style={{ paddingHorizontal: 10, paddingBottom: 10 }}>{item.genre}</Body>}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { overflow: 'hidden' },
  imageWrap: { width: '100%', aspectRatio: 3/4, backgroundColor: theme.colors.cardElevated },
  thumb: { width: '100%', height: '100%' },
  gradient: { position: 'absolute', left: 0, right: 0, bottom: 0, height: '50%' },
  titleWrap: { position: 'absolute', left: 10, right: 10, bottom: 10 },
  title: { color: '#fff', fontWeight: '700' }
});
