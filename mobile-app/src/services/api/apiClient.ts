import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const DEFAULT_URL = Platform.OS === 'android' ? 'http://10.0.2.2:5001/api' : 'http://localhost:5001/api';
const baseURL = process.env.EXPO_PUBLIC_API_URL || DEFAULT_URL;

console.log(`[API CLIENT] Initializing with base URL: ${baseURL}`);

export const apiClient = axios.create({
  baseURL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

apiClient.interceptors.request.use(async (config) => {
  try {
    const token = await SecureStore.getItemAsync('jansetu_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (err) {
    console.warn('[API CLIENT] Error reading token from SecureStore:', err);
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

apiClient.interceptors.response.use((response) => {
  // Returns response.data which is `{ success: true, data: ... }`
  return response.data;
}, async (error) => {
  if (error.response?.status === 401) {
    try {
      await SecureStore.deleteItemAsync('jansetu_token');
      await SecureStore.deleteItemAsync('jansetu_role');
    } catch (cleanErr) {
      console.warn('[API CLIENT] Clean token storage error:', cleanErr);
    }
  }
  return Promise.reject(error);
});
