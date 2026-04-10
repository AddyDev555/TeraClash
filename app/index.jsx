import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, ActivityIndicator, Image, StyleSheet } from 'react-native';

export default function Index() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const check = async () => {
      const u = await AsyncStorage.getItem('user');
      setUser(u);
      setLoading(false);
    };
    check();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <Image
          source={require('../assets/images/Logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    );
  }

  return user
    ? <Redirect href="/home" />
    : <Redirect href="/(auth)/login" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0f1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 140,
    height: 140,
    marginBottom: 20,
    borderRadius: 20,
  },
});