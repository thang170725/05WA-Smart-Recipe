import { Platform } from 'react-native';

/**
 * API base URL — mirrors frontend/src/services/JsonApi.js
 * Android emulator: 10.0.2.2 maps to host machine localhost
 * iOS simulator / web: 127.0.0.1
 * Physical device: set EXPO_PUBLIC_API_URL to your machine IP (e.g. http://192.168.1.10:3651)
 */
export const BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  (Platform.OS === 'android' ? 'http://10.0.2.2:3651' : 'http://127.0.0.1:3651');
