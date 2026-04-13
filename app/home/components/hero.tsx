import { StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState, useContext } from 'react'
import { FontAwesome5, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons'
import { NativeModules, PermissionsAndroid, Platform, NativeEventEmitter } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { API } from '../../../utils/api'
import { AppDataContext } from '../../context/AppDataProvider';

const { StepModule } = NativeModules
const { OverlayModule } = NativeModules

export default function HeroCards() {
    const [steps, setSteps] = useState(0)
    const STORAGE_KEY = 'stepsCount'
    const SNAPSHOT_KEY = 'stepsSnapshot'
    const RESET_DATE_KEY = 'stepsResetDate'

    useEffect(() => {
        let interval: any = null

        const setup = async () => {
            // load persisted steps first so UI has a value on initial render
            try {
                const stored = await AsyncStorage.getItem(STORAGE_KEY)
                if (stored != null) {
                    const parsed = Number(stored)
                    if (!Number.isNaN(parsed)) setSteps(parsed)
                }
            } catch (e) {
                console.log('Error reading stored steps:', e)
            }

            // On Android we must request ACTIVITY_RECOGNITION at runtime
            if (Platform.OS === 'android') {
                try {
                    const granted = await PermissionsAndroid.request(
                        PermissionsAndroid.PERMISSIONS.ACTIVITY_RECOGNITION,
                        {
                            title: 'Activity Permission',
                            message: 'Allow TeraClash to access activity to count your steps.',
                        }
                    )

                    if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
                        console.warn('Activity recognition permission denied')
                        return
                    }
                } catch (err) {
                    console.warn('Permission request error', err)
                    return
                }

                // request overlay permission and start overlay if allowed
                try {
                    OverlayModule?.requestPermission?.(null)
                    OverlayModule?.startOverlay?.()
                } catch (e) {
                    // ignore if module missing
                }
            }

            // Setup event listener for realtime updates
            try {
                const emitter = new NativeEventEmitter(StepModule)
                const sub = emitter.addListener('StepUpdate', (count: number) => {
                    setSteps(count)
                })

                // start service after we have listener ready
                StepModule.startService()

                // fetch current steps immediately to avoid showing 0 after navigation
                try {
                    const current = await StepModule.getSteps()
                    setSteps(current)
                } catch (e) {
                    console.log('Error initial fetching steps:', e)
                }

                // fallback polling (less frequent) — poll every 5s to keep UI in sync
                interval = setInterval(async () => {
                    try {
                        const nativeSteps = await StepModule.getSteps()
                        setSteps(nativeSteps)
                    } catch (e) {
                        console.log('Error fetching steps:', e)
                    }
                }, 5000)

                    // store subscription so cleanup can remove it
                    ; (setup as any)._sub = sub
            } catch (e) {
                console.warn('EventEmitter setup failed', e)
                // still start service and poll frequently as fallback
                StepModule.startService()
                interval = setInterval(async () => {
                    try {
                        const nativeSteps = await StepModule.getSteps()
                        setSteps(nativeSteps)
                    } catch (e) {
                        console.log('Error fetching steps:', e)
                    }
                }, 2000)
            }
        }

        // after loading initial data, check if there is a stale snapshot to push
        const checkStaleSnapshot = async () => {
            try {
                const snapRaw = await AsyncStorage.getItem(SNAPSHOT_KEY)
                const resetDateRaw = await AsyncStorage.getItem(RESET_DATE_KEY)
                const today = new Date().toISOString().split('T')[0]
                const lastResetDate = resetDateRaw ? String(resetDateRaw) : null
                const userRaw = await AsyncStorage.getItem('user');

                if (!userRaw) {
                    console.log('No user found in storage');
                    return;
                }

                const user = JSON.parse(userRaw);
                
                if (snapRaw) {
                    const snap = JSON.parse(snapRaw)

                    if (snap?.date && snap.date !== today && snap.steps >= 0) {

                        const payload = {
                            date: snap.date,
                            user_id: user.id,
                            steps: snap.steps,
                            distance: Number((snap.steps * 0.0008).toFixed(2)),
                            calories_burned: Math.round(snap.steps * 0.04),
                        };

                        console.log('Pushing stale snapshot to backend:', payload)

                        await API.post('/api/analysis', payload);
                    }
                }

                if (lastResetDate !== today) {
                    setSteps(0)
                    try {
                        await AsyncStorage.setItem(STORAGE_KEY, '0')
                        await AsyncStorage.setItem(RESET_DATE_KEY, today)
                        OverlayModule?.updateOverlay?.(0, 0, 0)
                    } catch (e) {
                        console.log('Error resetting daily values:', e)
                    }
                }
            } catch (e) {
                console.log('Error checking stale snapshot:', e)
            }
        }

        const initialize = async () => {
            await checkStaleSnapshot()
            setup()
        }

        initialize()

        return () => {
            if (interval) clearInterval(interval)
            // remove native event subscription if present
            try {
                const sub = (setup as any)._sub
                sub?.remove()
            } catch (e) { }
        }
    }, [])

    // persist steps and maintain a daily snapshot; if a snapshot from a previous day exists,
    // push it to the backend before replacing it.
    useEffect(() => {
        const persist = async () => {
            try {
                await AsyncStorage.setItem(STORAGE_KEY, String(steps))
            } catch (e) {
                console.log('Error saving steps:', e)
            }

            try {
                const today = new Date().toISOString().slice(0, 10)
                // write current snapshot for today
                const newSnap = { date: today, steps }
                await AsyncStorage.setItem(SNAPSHOT_KEY, JSON.stringify(newSnap))
                try {
                    // update native overlay if available
                    const distance = steps * KM_PER_STEP
                    OverlayModule?.updateOverlay?.(steps, distance, Math.round(steps * KCAL_PER_STEP))
                } catch (e) {
                    // ignore if module not present
                }
            } catch (e) {
                console.log('Error updating snapshot:', e)
            }
        }

        persist()
    }, [steps])

    // 📊 Calculations
    const KM_PER_STEP = 0.0008
    const KCAL_PER_STEP = 0.04

    const kmWalked = (steps * KM_PER_STEP).toFixed(2)
    const kcalBurned = Math.round(steps * KCAL_PER_STEP)

    return (
        <View style={styles.container}>
            <View style={styles.card}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 30 }}>
                    <Ionicons name="footsteps-outline" size={20} color="cyan" />
                    <Text style={styles.value}>{steps.toLocaleString()}</Text>
                </View>
            </View>

            <View style={styles.card}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 20 }}>
                    <FontAwesome5 name="road" size={20} color="cyan" />
                    <Text style={styles.value}>{kmWalked}</Text>
                </View>
            </View>

            <View style={styles.card}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 30 }}>
                    <MaterialCommunityIcons name="fire" size={24} color="cyan" />
                    <Text style={styles.value}>{kcalBurned}</Text>
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
        paddingVertical: 12,
    },

    card: {
        width: '31%',
        height: 37,
        borderRadius: 10,
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
})