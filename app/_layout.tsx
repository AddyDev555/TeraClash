import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Image, Text } from 'react-native';
import Toast from 'react-native-toast-message'

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [isLoading, setIsLoading] = useState(true);
  const [initialRoute, setInitialRoute] = useState('(auth)/login');

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await AsyncStorage.getItem('user');

        if (user) {
          setInitialRoute('home');
        } else {
          setInitialRoute('(auth)/login');
        }
      } catch (e) {
        setInitialRoute('(auth)/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (isLoading) {
    return (
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#0f172a',
      }}>
        <Image
          source={require('@/assets/images/Logo.png')}
          style={{ width: 120, height: 120, borderRadius: 20 }}
          resizeMode="contain"
        />
        <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold' }}>Loading...</Text>
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Toast />
      <Stack initialRouteName={initialRoute}>
        <Stack.Screen name="home" options={{ headerShown: false }} />
        <Stack.Screen name="shop/index" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)/login" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)/signup" options={{ headerShown: false }} />
        <Stack.Screen name="analysis/index" options={{ headerShown: false }} />
        <Stack.Screen name="leaderboard/index" options={{ headerShown: false }} />
        <Stack.Screen name="profile/index" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}