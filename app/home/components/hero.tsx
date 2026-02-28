import { StyleSheet, Text, View, Platform, AppState } from 'react-native'
import React, { useEffect, useState, useRef } from 'react'
import { Accelerometer } from 'expo-sensors'
import { FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as TaskManager from 'expo-task-manager'
import * as Location from 'expo-location'

const BACKGROUND_STEP_TASK = 'background-step-counter'
const STEP_STORAGE_KEY = 'stepCounter'

// Define the background task
TaskManager.defineTask(BACKGROUND_STEP_TASK, async ({ data, error }) => {
    if (error) {
        console.error('Background task error:', error)
        return
    }
    // This keeps the task alive
})

export default function HeroCards() {
    const [steps, setSteps] = useState(0)
    const [isAvailable, setIsAvailable] = useState(true)
    const [isTracking, setIsTracking] = useState(false)

    const lastMagnitudeRef = useRef(0)
    const lastStepTimeRef = useRef(0)
    const movingAverageRef = useRef([])
    const accelSubscriptionRef = useRef(null)
    const saveIntervalRef = useRef(null)
    const appState = useRef(AppState.currentState)
    const currentStepsRef = useRef(0)

    // Location tracking refs
    const lastLocationRef = useRef(null)
    const lastLocationTimeRef = useRef(0)
    const locationSubscriptionRef = useRef(null)
    const currentSpeedRef = useRef(0)
    const isMovingRef = useRef(false)

    useEffect(() => {
        const subscription = AppState.addEventListener('change', handleAppStateChange)
        initializeApp()

        return () => {
            subscription.remove()
            cleanup()
        }
    }, [])

    useEffect(() => {
        currentStepsRef.current = steps
    }, [steps])

    const handleAppStateChange = async (nextAppState) => {
        if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
            await loadTodaySteps()
        } else if (nextAppState.match(/inactive|background/)) {
            console.log('App going to background - saving steps:', currentStepsRef.current)
            await saveTodayStepsImmediate()
        }

        appState.current = nextAppState
    }

    const initializeApp = async () => {
        await loadTodaySteps()
        await requestPermissions()
        await startTracking()
    }

    const requestPermissions = async () => {
        try {
            if (Platform.OS === 'android') {
                const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync()
                if (foregroundStatus === 'granted') {
                    const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync()
                }
            } else {
                await Location.requestForegroundPermissionsAsync()
                await Location.requestBackgroundPermissionsAsync()
            }
        } catch (error) {
            console.error('Permission error:', error)
        }
    }

    const startTracking = async () => {
        try {
            const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_STEP_TASK)
            if (isRegistered) {
                setIsTracking(true)
                await initializeSensors()
                await initializeLocationTracking()
                return
            }

            const { status } = await Location.getForegroundPermissionsAsync()

            if (status !== 'granted') {
                await initializeSensors()
                return
            }

            await Location.startLocationUpdatesAsync(BACKGROUND_STEP_TASK, {
                accuracy: Location.Accuracy.Lowest,
                distanceInterval: 0.5,
                deferredUpdatesInterval: 60000,
                showsBackgroundLocationIndicator: Platform.OS === 'ios',
                foregroundService: {
                    notificationTitle: 'Step Counter Active',
                    notificationBody: 'Counting your steps',
                    notificationColor: '#00FFFF',
                }
            })

            setIsTracking(true)
            await initializeSensors()
            await initializeLocationTracking()
        } catch (error) {
            console.error('Failed to start tracking:', error)
            await initializeSensors()
        }
    }

    const initializeLocationTracking = async () => {
        try {
            const { status } = await Location.getForegroundPermissionsAsync()

            if (status !== 'granted') {
                console.log('Location permission not granted')
                return
            }

            if (locationSubscriptionRef.current) {
                locationSubscriptionRef.current.remove()
            }

            locationSubscriptionRef.current = await Location.watchPositionAsync(
                {
                    accuracy: Location.Accuracy.Balanced,
                    timeInterval: 1000, // Update every second
                    distanceInterval: 1, // Update every 1 meter
                },
                processLocationData
            )
        } catch (error) {
            console.error('Location tracking error:', error)
        }
    }

    const processLocationData = (location) => {
        const currentTime = Date.now()
        const { latitude, longitude, speed } = location.coords

        // Update current speed (m/s)
        currentSpeedRef.current = speed || 0

        if (lastLocationRef.current && lastLocationTimeRef.current) {
            const timeDiff = (currentTime - lastLocationTimeRef.current) / 1000 // seconds

            if (timeDiff > 0) {
                const distance = calculateDistance(
                    lastLocationRef.current.latitude,
                    lastLocationRef.current.longitude,
                    latitude,
                    longitude
                )

                const calculatedSpeed = distance / timeDiff // m/s

                // Walking speed range: 0.5 m/s to 2.5 m/s (1.8 km/h to 9 km/h)
                const MIN_WALKING_SPEED = 0.3 // 1.08 km/h - minimum movement to count as walking
                const MAX_WALKING_SPEED = 2.8 // 10 km/h - maximum walking/jogging speed

                // Use the more reliable speed value
                const effectiveSpeed = speed !== null && speed >= 0 ? speed : calculatedSpeed

                // Check if user is walking (not stationary and not in vehicle)
                isMovingRef.current = effectiveSpeed >= MIN_WALKING_SPEED && effectiveSpeed <= MAX_WALKING_SPEED

                // Optional: Log for debugging
                // console.log(`Speed: ${(effectiveSpeed * 3.6).toFixed(2)} km/h, Moving: ${isMovingRef.current}`)
            }
        }

        lastLocationRef.current = { latitude, longitude }
        lastLocationTimeRef.current = currentTime
    }

    // Calculate distance between two coordinates using Haversine formula
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371e3 // Earth's radius in meters
        const φ1 = lat1 * Math.PI / 180
        const φ2 = lat2 * Math.PI / 180
        const Δφ = (lat2 - lat1) * Math.PI / 180
        const Δλ = (lon2 - lon1) * Math.PI / 180

        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

        return R * c // Distance in meters
    }

    const initializeSensors = async () => {
        try {
            Accelerometer.setUpdateInterval(100)

            if (accelSubscriptionRef.current) {
                accelSubscriptionRef.current.remove()
            }

            accelSubscriptionRef.current = Accelerometer.addListener(processAccelerometerData)

            if (saveIntervalRef.current) {
                clearInterval(saveIntervalRef.current)
            }

            saveIntervalRef.current = setInterval(() => {
                saveTodayStepsImmediate()
            }, 2000)

            setIsAvailable(true)
        } catch (error) {
            setIsAvailable(false)
        }
    }

    const cleanup = async () => {
        if (accelSubscriptionRef.current) {
            accelSubscriptionRef.current.remove()
        }
        if (locationSubscriptionRef.current) {
            locationSubscriptionRef.current.remove()
        }
        if (saveIntervalRef.current) {
            clearInterval(saveIntervalRef.current)
        }
        await saveTodayStepsImmediate()
    }

    const loadTodaySteps = async () => {
        try {
            const today = new Date().toDateString()
            const savedData = await AsyncStorage.getItem(STEP_STORAGE_KEY)

            if (savedData) {
                const { date, steps: savedSteps } = JSON.parse(savedData)

                if (date === today) {
                    setSteps(savedSteps)
                    currentStepsRef.current = savedSteps
                } else {
                    setSteps(0)
                    currentStepsRef.current = 0
                    await AsyncStorage.setItem(STEP_STORAGE_KEY, JSON.stringify({ date: today, steps: 0 }))
                }
            } else {
                await AsyncStorage.setItem(STEP_STORAGE_KEY, JSON.stringify({ date: today, steps: 0 }))
            }
        } catch (error) {
            console.log('Load error:', error)
        }
    }

    const saveTodayStepsImmediate = async () => {
        try {
            const today = new Date().toDateString()
            const currentSteps = currentStepsRef.current
            await AsyncStorage.setItem(STEP_STORAGE_KEY, JSON.stringify({
                date: today,
                steps: currentSteps
            }))
        } catch (error) {
            console.log('Save error:', error)
        }
    }

    const processAccelerometerData = (data) => {
        const { x, y, z } = data
        const currentTime = Date.now()

        const magnitude = Math.sqrt(x * x + y * y + z * z)

        movingAverageRef.current.push(magnitude)
        if (movingAverageRef.current.length > 3) {
            movingAverageRef.current.shift()
        }

        const smoothedMagnitude = movingAverageRef.current.reduce((a, b) => a + b, 0) / movingAverageRef.current.length

        const STEP_THRESHOLD = 1.15
        const MIN_STEP_INTERVAL = 300

        const timeSinceLastStep = currentTime - lastStepTimeRef.current

        const isPeak = smoothedMagnitude > STEP_THRESHOLD &&
            lastMagnitudeRef.current < STEP_THRESHOLD &&
            timeSinceLastStep > MIN_STEP_INTERVAL

        // IMPORTANT: Only count step if location indicates walking movement
        if (isPeak && isMovingRef.current) {
            const newSteps = currentStepsRef.current + 1
            setSteps(newSteps)
            currentStepsRef.current = newSteps
            lastStepTimeRef.current = currentTime

            saveTodayStepsImmediate()
        }

        lastMagnitudeRef.current = smoothedMagnitude
    }

    const KM_PER_STEP = 0.0008
    const KCAL_PER_STEP = 0.04

    const kmWalked = (steps * KM_PER_STEP).toFixed(2)
    const kcalBurned = Math.round(steps * KCAL_PER_STEP)

    return (
        <View style={styles.container}>
            <View style={styles.card}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <FontAwesome5 name="walking" size={20} color="cyan" />
                    <Text style={styles.value}>{steps.toLocaleString()}</Text>
                    <Text style={styles.label}>Steps</Text>
                </View>
            </View>

            <View style={styles.card}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <FontAwesome5 name="road" size={20} color="cyan" />
                    <Text style={styles.value}>{kmWalked}</Text>
                    <Text style={styles.label}>KM</Text>
                </View>
            </View>

            <View style={styles.card}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <MaterialCommunityIcons name="fire" size={24} color="cyan" />
                    <Text style={styles.value}>{kcalBurned}</Text>
                    <Text style={styles.label}>kcal</Text>
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        paddingHorizontal: 16,
        paddingVertical: 8,
    },

    card: {
        width: '31%',
        height: 37,
        borderRadius: 12,
        paddingLeft: 10,
        padding: 5,
        justifyContent: 'space-between',
        backgroundColor: 'rgba(30, 41, 59, 0.9)',
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.08)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 6,
    },

    label: {
        fontSize: 10,
        color: '#E5E7EB',
        fontWeight: '500',
        textAlign: 'center',
    },

    value: {
        fontSize: 13,
        fontWeight: '700',
        color: '#FFFFFF',
        marginLeft: 6,
        textAlign: 'center',
    },

    error: {
        fontSize: 8,
        color: '#FCA5A5',
        marginTop: 4,
        padding: 0,
        margin: 0,
    },
})