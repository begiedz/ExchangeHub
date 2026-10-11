import axios from 'axios';
import { tokenStorage } from '../storage/token-storage';

export const httpClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  timeout: 10_000,
});

httpClient.interceptors.request.use(async config => {
  const token = await tokenStorage.getAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});
