import * as SecureStore from 'expo-secure-store';

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

export const tokenStorage = {
  getAccessToken() {
    return SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
  },

  getRefreshToken() {
    return SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  },

  setAccessToken(accessToken: string) {
    return SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
  },

  setRefreshToken(refreshToken: string) {
    return SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
  },

  deleteAccessToken() {
    return SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
  },

  deleteRefreshToken() {
    return SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
  },
};
