import React, { useEffect, useState } from 'react'
import { StyleSheet, View, Dimensions } from 'react-native'
import MapView, { Circle, Polygon, Polyline } from 'react-native-maps'
import * as Location from 'expo-location'

export default function Home() {
    const [location, setLocation] = useState(null)
    const [heading, setHeading] = useState(0)
    const [path, setPath] = useState([])

    useEffect(() => {
        let locationSub
        let headingSub

        (async () => {
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
                        latitude: loc.coords.latitude,
                        longitude: loc.coords.longitude,
                    }

                    setLocation(newPoint)

                    setPath(prev => {
                        if (prev.length === 0) return [newPoint]
                        return [...prev, newPoint]
                    })
                }
            )

            headingSub = await Location.watchHeadingAsync((h) => {
                if (h.trueHeading !== -1) {
                    setHeading(h.trueHeading)
                }
            })
        })()

        return () => {
            if (locationSub) locationSub.remove()
            if (headingSub) headingSub.remove()
        }
    }, [])

    if (!location) return null

    const getCone = (lat, lng, heading) => {
        const length = 0.0007
        const spread = 25

        const toRad = (deg) => (deg * Math.PI) / 180

        // 🔥 Fix: shift heading by -90°
        const adjustedHeading = heading

        const left = toRad(adjustedHeading - spread)
        const right = toRad(adjustedHeading + spread)

        const lngScale = 1 / Math.cos(toRad(lat))

        return [
            { latitude: lat, longitude: lng },
            {
                latitude: lat + length * Math.cos(left),
                longitude: lng + length * Math.sin(left) * lngScale,
            },
            {
                latitude: lat + length * Math.cos(right),
                longitude: lng + length * Math.sin(right) * lngScale,
            },
        ]
    }

    return (
        <View style={styles.container}>
            <MapView
                style={styles.map}
                initialRegion={{
                    latitude: location.latitude,
                    longitude: location.longitude,
                    latitudeDelta: 0.002,
                    longitudeDelta: 0.002,
                }}
                showsUserLocation={false}
                followsUserLocation={true}
            >
                {/* Path Tracker - Shows walked path */}
                {path.length > 1 && (
                    <Polyline
                        coordinates={path}
                        strokeColor="#393D7E" // Red color for the path
                        strokeWidth={4}
                        lineCap="round"
                        lineJoin="round"
                    />
                )}

                {/* Direction Flash */}
                <Polygon
                    coordinates={getCone(location.latitude, location.longitude, heading)}
                    fillColor="rgba(135, 206, 250, 0.5)"
                    strokeColor="rgba(135, 206, 250, 0.8)"
                    strokeWidth={2}
                />

                {/* Blue Dot */}
                <Circle
                    center={location}
                    radius={5}
                    fillColor="rgba(0, 122, 255, 1)"
                    strokeColor="white"
                    strokeWidth={2}
                />
            </MapView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        height: Dimensions.get('window').height,
        width: Dimensions.get('window').width,
    },
})