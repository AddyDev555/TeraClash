import { StyleSheet, View } from 'react-native'
import React, { useEffect } from 'react'
import Navbar from '@/components/navbar'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import HeroCards from './components/hero'
import SceneManager from '@/components/sceneManager'
import Map from '@/components/map'
import BottomBar from '@/components/bottomBar'
import * as NavigationBar from 'expo-navigation-bar';
import ConqueredAreasWidget from './components/info';
import AsyncStorage from '@react-native-async-storage/async-storage'
import { API } from "@/utils/api"

import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing
} from 'react-native-reanimated';

export default function Index() {
  const [user, setUser] = React.useState([]);
  const [userInfo, setUserInfo] = React.useState([]);

  useEffect(() => {
    const fetchUser = async () => {
      const user = await AsyncStorage.getItem('user');
      if (user) {
        setUser(JSON.parse(user));
      }
    };

    const fetchUserInfo = async () => {
      try {

        const storedUser = await AsyncStorage.getItem("user");

        if (!storedUser) {
          console.log("No user found in storage");
          return null;
        }

        const parsedUser = JSON.parse(storedUser);
        const userId = parsedUser.id;
        const response = await API.get(`/api/user_info/${userId}`);
        const userInfo = response;
        setUserInfo(userInfo);

      } catch (error) {
        console.log(error);
        return null;

      }
    };

    fetchUser();
    fetchUserInfo();
  }, [])



  const areas = [
    { id: '1', name: 'Central Park', description: 'A large public park in New York City.' },
    { id: '2', name: 'Eiffel Tower', description: 'An iconic iron tower in Paris.' },
    { id: '3', name: 'Colosseum', description: 'An ancient amphitheater in Rome.' },
  ];

  // Animation values
  const headerOpacity = useSharedValue(0);
  const headerTranslate = useSharedValue(-40);

  const mapOpacity = useSharedValue(0);
  const mapScale = useSharedValue(0.95);

  const widgetTranslate = useSharedValue(60);
  const bottomBarTranslate = useSharedValue(80);

  useEffect(() => {
    NavigationBar.setVisibilityAsync("hidden");
    NavigationBar.setBehaviorAsync("overlay-swipe");

    // Trigger animations
    headerOpacity.value = withTiming(1, { duration: 600 });
    headerTranslate.value = withTiming(0, { duration: 600 });

    mapOpacity.value = withDelay(
      200,
      withTiming(1, { duration: 700, easing: Easing.out(Easing.ease) })
    );

    mapScale.value = withDelay(
      200,
      withTiming(1, { duration: 700 })
    );

    widgetTranslate.value = withDelay(
      400,
      withTiming(0, { duration: 600 })
    );

    bottomBarTranslate.value = withDelay(
      600,
      withTiming(0, { duration: 600 })
    );

  }, []);

  const headerStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerTranslate.value }],
  }));

  const mapStyle = useAnimatedStyle(() => ({
    opacity: mapOpacity.value,
    transform: [{ scale: mapScale.value }],
  }));

  const widgetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: widgetTranslate.value }],
  }));

  const bottomBarStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: bottomBarTranslate.value }],
  }));

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" translucent backgroundColor="transparent" hidden />

      <Animated.View style={[styles.floatingHead, headerStyle]}>
        <Navbar userInfo={userInfo} />
        <HeroCards />
      </Animated.View>

      <Animated.View style={[{ flex: 1 }, mapStyle]}>
        <Map />
      </Animated.View>

      <Animated.View style={widgetStyle}>
        <ConqueredAreasWidget
          areas={areas}
          userInfo={userInfo}
          onAreaPress={() => console.log("Area pressed")}
        />
      </Animated.View>

      <SceneManager scene="appTour" user={user}/>

      <Animated.View style={bottomBarStyle}>
        <BottomBar />
      </Animated.View>

    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  floatingHead: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingTop: 10,
  },
});