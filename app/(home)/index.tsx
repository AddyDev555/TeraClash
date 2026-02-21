import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import Navbar from '@/components/navbar'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import HeroCards from './components/hero'
import Map from '@/components/map'
import BottomBar from '@/components/bottomBar'

export default function index() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" backgroundColor="#0F172A" />
      <View style={styles.floatingHead}>
        <Navbar />
        <HeroCards />
      </View>
      <Map />
      <BottomBar />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container:{
    flex:1,
    backgroundColor: '#0F172A',
    alignItems:'center',
  },
  floatingHead:{
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingTop: 30,
  },
})