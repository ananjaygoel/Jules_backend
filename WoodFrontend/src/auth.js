import AsyncStorage from '@react-native-async-storage/async-storage';
import { setAuth as setApiAuth } from './api';

const KEY = 'wood_auth';

export async function getStoredAuth() {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return null;
    const auth = JSON.parse(raw);
    setApiAuth(auth);
    return auth;
  } catch {
    return null;
  }
}

export async function setStoredAuth(auth) {
  await AsyncStorage.setItem(KEY, JSON.stringify(auth));
  setApiAuth(auth);
}

export async function clearAuth() {
  await AsyncStorage.removeItem(KEY);
  setApiAuth({});
}
