import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '../services/auth/AuthContext';
import { useBrandingStore } from '../store/brandingStore';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { PlayfairDisplay_900Black } from '@expo-google-fonts/playfair-display';
import { Inter_400Regular, Inter_700Bold } from '@expo-google-fonts/inter';
import { View, ActivityIndicator } from 'react-native';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

export default function RootLayout() {
  const { loadBranding, backgroundColor, textColor } = useBrandingStore();

  const [fontsLoaded] = useFonts({
    PlayfairDisplay_900Black,
    Inter_400Regular,
    Inter_700Bold,
  });

  useEffect(() => {
    loadBranding();
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8F7F3' }}>
        <ActivityIndicator size="large" color="#2F2F2F" />
      </View>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: '#FFFFFF',
            },
            headerTintColor: '#2F2F2F',
            headerTitleStyle: {
              fontFamily: 'PlayfairDisplay_900Black',
              fontSize: 18,
            },
            contentStyle: {
              backgroundColor: '#F8F7F3',
            }
          }}
        >
          <Stack.Screen name="index" options={{ title: 'JanSetu Hub', headerShown: false }} />
          <Stack.Screen name="citizen/login" options={{ title: 'Citizen Login' }} />
          <Stack.Screen name="citizen/dashboard" options={{ title: 'Citizen Dashboard', headerLeft: () => null }} />
          <Stack.Screen name="citizen/report" options={{ title: 'File Civic Report' }} />
          <Stack.Screen name="citizen/track" options={{ title: 'Track Issue' }} />
          <Stack.Screen name="authority/login" options={{ title: 'Authority Portal' }} />
          <Stack.Screen name="authority/dashboard" options={{ title: 'Command Center', headerLeft: () => null }} />
          <Stack.Screen name="authority/issue-detail" options={{ title: 'Issue Detail' }} />
          <Stack.Screen name="worker/login" options={{ title: 'Field Worker Login' }} />
          <Stack.Screen name="worker/dashboard" options={{ title: 'Worker Operations', headerLeft: () => null }} />
          <Stack.Screen name="worker/task-detail" options={{ title: 'Task Details' }} />
        </Stack>
      </AuthProvider>
    </QueryClientProvider>
  );
}
