import { StyleSheet, Text, View } from 'react-native'
import React, { useEffect } from 'react'
import Navbar from '@/components/navbar'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import HeroCards from './components/hero'
import Map from '@/components/map'
import BottomBar from '@/components/bottomBar'
import * as NavigationBar from 'expo-navigation-bar';
import ConqueredAreasWidget from './components/info';

export default function index() {
  const areas = [
    { id: '1', name: 'Central Park', description: 'A large public park in New York City.' },
    { id: '2', name: 'Eiffel Tower', description: 'An iconic iron tower in Paris.' },
    { id: '3', name: 'Colosseum', description: 'An ancient amphitheater in Rome.' },
  ]; 
  useEffect(() => {
    NavigationBar.setVisibilityAsync("hidden"); // hides nav bar
    NavigationBar.setBehaviorAsync("overlay-swipe"); 
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" translucent backgroundColor="transparent" hidden/>
      <View style={styles.floatingHead}>
        <Navbar />
        <HeroCards />
      </View>
      <Map />
      <ConqueredAreasWidget areas={areas} onAreaPress={() => console.log("Area pressed")} />
      <BottomBar />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container:{
    flex:1,
    backgroundColor: '#0F172A',
  },
  floatingHead:{
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingTop: 10,
  },
})