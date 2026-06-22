import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'token';

export async function getToken() {
  return AsyncStorage.getItem(TOKEN_KEY);
}

export async function setToken(token) {
  return AsyncStorage.setItem(TOKEN_KEY, token);
}

export async function removeToken() {
  return AsyncStorage.removeItem(TOKEN_KEY);
}
