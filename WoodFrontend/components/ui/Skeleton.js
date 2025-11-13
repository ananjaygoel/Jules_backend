import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export function SkeletonBox({ width = '100%', height = 16, borderRadius = 8, style }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 1200, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [anim]);

  const translateX = anim.interpolate({ inputRange: [0, 1], outputRange: [-200, 200] });

  return (
    <View style={[{ width, height, borderRadius, overflow: 'hidden', backgroundColor: '#1a1a20' }, style]}>
      <Animated.View style={[StyleSheet.absoluteFill, { transform: [{ translateX }] }]}> 
        <LinearGradient
          colors={[ 'transparent', 'rgba(255,255,255,0.08)', 'transparent' ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
}

export function SkeletonGrid({ count = 8 }) {
  const items = Array.from({ length: count });
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
      {items.map((_, i) => (
        <View key={i} style={{ width: '48%', marginBottom: 14 }}>
          <SkeletonBox width={'100%'} height={180} borderRadius={14} />
          <SkeletonBox width={'70%'} height={14} borderRadius={6} style={{ marginTop: 8 }} />
        </View>
      ))}
    </View>
  );
}
