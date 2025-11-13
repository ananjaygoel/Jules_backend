import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as SplashScreen from 'expo-splash-screen';
import { Text, View } from 'react-native';
import HomeScreen from './screens/HomeScreen';
import LoginScreen from './screens/LoginScreen';
import PaymentsScreen from './screens/PaymentsScreen';

SplashScreen.preventAutoHideAsync().catch(() => {});

const Stack = createNativeStackNavigator();

export default function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const prepare = async () => {
      try {
        // Load any async app config here later
      } finally {
        setReady(true);
        setTimeout(() => SplashScreen.hideAsync().catch(() => {}), 200);
      }
    };
    prepare();
  }, []);

  if (!ready) {
    return <View style={{ flex: 1, backgroundColor: '#0B0B0F' }} />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Payments" component={PaymentsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
