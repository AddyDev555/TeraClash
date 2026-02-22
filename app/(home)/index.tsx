import { StyleSheet, View } from 'react-native'
import React, { useEffect } from 'react'
import Navbar from '@/components/navbar'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import HeroCards from './components/hero'
import Map from '@/components/map'
import BottomBar from '@/components/bottomBar'
import * as NavigationBar from 'expo-navigation-bar';
import ConqueredAreasWidget from './components/info';

import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing
} from 'react-native-reanimated';

export default function Index() {

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
        <Navbar />
        <HeroCards />
      </Animated.View>

      <Animated.View style={[{ flex: 1 }, mapStyle]}>
        <Map />
      </Animated.View>

      <Animated.View style={widgetStyle}>
        <ConqueredAreasWidget
          areas={areas}
          onAreaPress={() => console.log("Area pressed")}
        />
      </Animated.View>

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