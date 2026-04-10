import React, { useEffect, useState, useRef } from 'react'
import { View, StyleSheet } from 'react-native'
import { WebView } from 'react-native-webview'
import * as Location from 'expo-location'

export default function Home({ userLocation, user }) {
    const [location, setLocation] = useState(null)
    const [heading, setHeading] = useState(0)
    const [path, setPath] = useState([])

    const webRef = useRef(null)

    const otherUsers = userLocation?.filter(u => u.user_id !== user?.id)

    useEffect(() => {
        let locationSub
        let headingSub

        ;(async () => {
            const { status } = await Location.requestForegroundPermissionsAsync()
            if (status !== 'granted') return

            locationSub = await Location.watchPositionAsync(
                {
                    accuracy: Location.Accuracy.BestForNavigation,
                    timeInterval: 1000,
                    distanceInterval: 1,
                },
                (loc) => {
                    const newPoint = {
                        lat: loc.coords.latitude,
                        lng: loc.coords.longitude,
                    }

                    setLocation(newPoint)
                    setPath(prev => [...prev, newPoint])
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

    // 🔥 Send updates to WebView (NO reload)
    useEffect(() => {
        if (!webRef.current || !location) return

        const data = {
            location,
            heading,
            path,
            otherUsers: otherUsers || []
        }

        webRef.current.postMessage(JSON.stringify(data))
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
            let map = L.map('map').setView([0, 0], 18)

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap'
            }).addTo(map)

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

            document.addEventListener("message", function(event) {
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
            })
        </script>
    </body>
    </html>
    `

    return (
        <View style={styles.container}>
            <WebView
                ref={webRef}
                originWhitelist={['*']}
                source={{ html: leafletHTML }}
                javaScriptEnabled
                domStorageEnabled
                style={{ flex: 1 }}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1 },
})