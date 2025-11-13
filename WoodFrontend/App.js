import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import * as SplashScreen from 'expo-splash-screen';
import { View } from 'react-native';
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import SeriesScreen from './screens/SeriesScreen';
import EpisodeScreen from './screens/EpisodeScreen';
import TasksScreen from './screens/TasksScreen';
import SearchScreen from './screens/SearchScreen';
import ProfileScreen from './screens/ProfileScreen';
import ReferralScreen from './screens/ReferralScreen';
import PaymentsScreen from './screens/PaymentsScreen';
import { StripeProvider } from '@stripe/stripe-react-native';
import { api } from './src/api';
import { theme } from './src/theme';

SplashScreen.preventAutoHideAsync().catch(() => {});

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: { backgroundColor: theme.colors.card, borderTopColor: theme.colors.border },
        tabBarActiveTintColor: theme.colors.text,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarIcon: ({ color, size }) => {
          let icon = 'home';
          if (route.name === 'Home') icon = 'home';
          if (route.name === 'Search') icon = 'search';
          if (route.name === 'Tasks') icon = 'list';
          if (route.name === 'Referral') icon = 'gift';
          if (route.name === 'Profile') icon = 'person';
          return <Ionicons name={icon} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="Tasks" component={TasksScreen} />
      <Tab.Screen name="Referral" component={ReferralScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [ready, setReady] = useState(false);
  const [publishableKey, setPublishableKey] = useState('');

  useEffect(() => {
    const prepare = async () => {
      try {
        const cfg = await api.paymentConfig().catch(() => null);
        if (cfg?.stripePublishableKey) setPublishableKey(cfg.stripePublishableKey);
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

  const AppStack = (
    <Stack.Navigator>
      <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
      <Stack.Screen name="Series" component={SeriesScreen} />
      <Stack.Screen name="Episode" component={EpisodeScreen} />
      <Stack.Screen name="Payments" component={PaymentsScreen} />
    </Stack.Navigator>
  );

  return (
    <NavigationContainer>
      {publishableKey ? (
        <StripeProvider publishableKey={publishableKey}>{AppStack}</StripeProvider>
      ) : (
        AppStack
      )}
    </NavigationContainer>
  );
}
