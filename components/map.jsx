import React, { useEffect, useState, useRef } from 'react'
import { View, StyleSheet, Text, ActivityIndicator } from 'react-native'
import { WebView } from 'react-native-webview'
import * as Location from 'expo-location'
import AsyncStorage from '@react-native-async-storage/async-storage'

export default function Home({ userLocation, user }) {
    const [location, setLocation] = useState(null)
    const [heading, setHeading] = useState(0)
    const [path, setPath] = useState([])
    const [mapLoaded, setMapLoaded] = useState(false)
    const lastLocRef = useRef(null)

    const STORAGE_KEY = 'walkLocations'
    const VEHICLE_SPEED_THRESHOLD = 2.5
    
    const webRef = useRef(null)
    const otherUsers = userLocation?.filter(u => u.user_id !== user?.id)

    const handleWebMessage = (event) => {
        try {
            const message = JSON.parse(event.nativeEvent.data)
            if (message?.type === 'mapReady') {
                setMapLoaded(true)
            }
        } catch (e) {
            // ignore malformed messages
        }
    }

    useEffect(() => {
        let locationSub
        let headingSub

        ;(async () => {
            // preload persisted walking points so they show on map immediately
            try {
                const raw = await AsyncStorage.getItem(STORAGE_KEY)
                if (raw) {
                    const arr = JSON.parse(raw)
                    // convert stored points to shape used by the map
                    const pts = arr.map(p => ({ lat: p.lat, lng: p.lng }))
                    if (pts.length) setPath(pts)
                }
            } catch (e) {
                console.log('Error loading stored walking points:', e)
            }

            const { status } = await Location.requestForegroundPermissionsAsync()
            console.log('Map: location permission status ->', status)
            if (status !== 'granted') return

            locationSub = await Location.watchPositionAsync(
                {
                    accuracy: Location.Accuracy.BestForNavigation,
                    timeInterval: 1000,
                    distanceInterval: 1,
                },
                async (loc) => {
                    const lat = loc.coords.latitude
                    const lng = loc.coords.longitude
                    // prefer native speed when available (m/s)
                    let speed = loc.coords.speed

                    // if speed unavailable, approximate using last location
                    if (speed == null && lastLocRef.current) {
                        const last = lastLocRef.current
                        const dt = (loc.timestamp || Date.now()) - (last.timestamp || 0)
                        if (dt > 0) {
                            const meters = haversineMeters(last.lat, last.lng, lat, lng)
                            speed = meters / (dt / 1000)
                        }
                    }

                    // If speed suggests vehicle, ignore this point
                    if (typeof speed === 'number' && speed > VEHICLE_SPEED_THRESHOLD) {
                        // update lastLocRef but do not store/plot
                        lastLocRef.current = { lat, lng, timestamp: loc.timestamp || Date.now() }
                        return
                    }

                    const newPoint = { lat, lng, timestamp: loc.timestamp || Date.now(), speed }

                    setLocation({ lat, lng })
                    setPath(prev => [...prev, { lat, lng }])

                    // persist walking point
                    try {
                        const raw = await AsyncStorage.getItem(STORAGE_KEY)
                        const arr = raw ? JSON.parse(raw) : []
                        arr.push(newPoint)
                        // optionally cap length to avoid unbounded growth
                        if (arr.length > 10000) arr.splice(0, arr.length - 10000)
                        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(arr))
                    } catch (e) {
                        console.log('Error saving walking location:', e)
                    }

                    lastLocRef.current = { lat, lng, timestamp: loc.timestamp || Date.now() }
                }
            )

            headingSub = await Location.watchHeadingAsync((h) => {
                if (h.trueHeading !== -1) setHeading(h.trueHeading)
            })
        })()

        return () => {
            if (locationSub) locationSub.remove()
            if (headingSub) headingSub.remove()
        }
    }, [])

    // helper: haversine distance in meters
    function haversineMeters(lat1, lon1, lat2, lon2) {
        const toRad = (v) => (v * Math.PI) / 180
        const R = 6371000 // earth meters
        const dLat = toRad(lat2 - lat1)
        const dLon = toRad(lon2 - lon1)
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2)
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
        return R * c
    }

    // 🔥 Send updates to WebView (NO reload)
    useEffect(() => {
        if (!webRef.current || !location) return

        const data = {
            location,
            heading,
            path,
            otherUsers: otherUsers || []
        }

        try {
            webRef.current.postMessage(JSON.stringify(data))
        } catch (e) {
            console.warn('WebView postMessage error', e)
        }
    }, [location, heading, path, otherUsers])

    const leafletHTML = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css"/>
        <style>
            html, body, #map { height: 100%; margin: 0; }
        </style>
    </head>
    <body>
        <div id="map"></div>

        <script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>
        <script>
            const sendNativeMessage = (message) => {
                const payload = JSON.stringify(message)
                if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
                    window.ReactNativeWebView.postMessage(payload)
                } else if (window.parent && window.parent.postMessage) {
                    window.parent.postMessage(payload, '*')
                }
            }

            let map = L.map('map', {
                zoomControl: false,
                minZoom: 12,
            }).setView([0, 0], 18)

            const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap'
            }).addTo(map)

            tileLayer.on('load', () => sendNativeMessage({ type: 'mapReady' }))

            let userMarker = null
            let pathLine = null
            let cone = null
            let otherMarkers = []

            function getCone(lat, lng, heading) {
                const length = 0.0007
                const spread = 25
                const toRad = deg => deg * Math.PI / 180

                const left = toRad(heading - spread)
                const right = toRad(heading + spread)

                return [
                    [lat, lng],
                    [lat + length * Math.cos(left), lng + length * Math.sin(left)],
                    [lat + length * Math.cos(right), lng + length * Math.sin(right)]
                ]
            }

            const handleIncomingMessage = (event) => {
                try {
                    const data = JSON.parse(event.data)
                    const { location, heading, path, otherUsers } = data

                    if (!location) return

                    const latlng = [location.lat, location.lng]

                    // Move map smoothly
                    map.setView(latlng)

                    // User marker
                    if (!userMarker) {
                        userMarker = L.circleMarker(latlng, {
                            radius: 8,
                            color: 'blue',
                            fillColor: 'blue',
                            fillOpacity: 1
                        }).addTo(map)
                    } else {
                        userMarker.setLatLng(latlng)
                    }

                    // Path
                    if (pathLine) {
                        pathLine.setLatLngs(path)
                    } else {
                        pathLine = L.polyline(path, { color: '#393D7E', weight: 4 }).addTo(map)
                    }

                    // Cone
                    if (cone) {
                        cone.setLatLngs(getCone(location.lat, location.lng, heading))
                    } else {
                        cone = L.polygon(getCone(location.lat, location.lng, heading), {
                            color: 'lightblue',
                            fillOpacity: 0.5
                        }).addTo(map)
                    }

                    // Other users
                    otherMarkers.forEach(m => map.removeLayer(m))
                    otherMarkers = []

                    otherUsers.forEach(u => {
                        const m = L.circleMarker([u.latitude, u.longitude], {
                            radius: 8,
                            color: 'red',
                            fillColor: 'red',
                            fillOpacity: 1
                        }).addTo(map)

                        m.bindPopup(u.name || 'User ' + u.user_id)
                        otherMarkers.push(m)
                    })
                } catch (err) {
                    // ignore malformed messages
                }
            }

            document.addEventListener('message', handleIncomingMessage)
            window.addEventListener('message', handleIncomingMessage)
        </script>
    </body>
    </html>
    `

    return (
        <View style={styles.container}>
            {/** if location permission denied, show message instead of blank map */}
            <WebView
                ref={webRef}
                originWhitelist={['*']}
                source={{ html: leafletHTML }}
                javaScriptEnabled
                domStorageEnabled
                style={{ flex: 1 }}
                onMessage={handleWebMessage}
                onError={(e) => console.warn('WebView error', e.nativeEvent)}
                onHttpError={(e) => console.warn('WebView http error', e.nativeEvent)}
            />
            {!mapLoaded && (
                <View style={styles.loaderOverlay} pointerEvents="none">
                    <View style={styles.loaderBox}>
                        <ActivityIndicator size="large" color="#ffffff" />
                        <Text style={styles.loaderText}>Loading map...</Text>
                    </View>
                </View>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    loaderOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(15, 23, 42, 0.88)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    loaderBox: {
        padding: 24,
        borderRadius: 16,
        backgroundColor: 'rgba(20, 28, 45, 0.95)',
        alignItems: 'center',
        width: '80%',
        maxWidth: 320,
    },
    loaderText: {
        marginTop: 16,
        color: '#ffffff',
        fontSize: 16,
        textAlign: 'center',
    },
})