import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack initialRouteName="(auth)/login">
        <Stack.Screen name="home" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)/login" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)/signup" options={{ headerShown: false }} />
        <Stack.Screen name="analysis/index" options={{ headerShown: false}} />
        <Stack.Screen name="leaderboard/index" options={{ headerShown: false}} />
        <Stack.Screen name="profile/index" options={{ headerShown: false }}  />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
