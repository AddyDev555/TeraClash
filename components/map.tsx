import React, { useEffect, useState } from 'react'
import { StyleSheet, View, Dimensions } from 'react-native'
import MapView, { Circle, Polygon, Polyline } from 'react-native-maps'
import * as Location from 'expo-location'
import { Magnetometer } from 'expo-sensors'

export default function Home() {
    const [location, setLocation] = useState(null)
    const [heading, setHeading] = useState(0)
    const [path, setPath] = useState([])

    useEffect(() => {
        (async () => {
            const { status } = await Location.requestForegroundPermissionsAsync()
            if (status !== 'granted') return

            Location.watchPositionAsync(
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
                        const last = prev[prev.length - 1]
                        const isSame =
                            last.latitude === newPoint.latitude &&
                            last.longitude === newPoint.longitude
                        if (isSame) return prev
                        return [...prev, newPoint]
                    })
                }
            )
        })()

        const sub = Magnetometer.addListener((data) => {
            const angle = Math.atan2(data.y, data.x)
            setHeading((angle * 180) / Math.PI)
        })

        return () => sub.remove()
    }, [])

    if (!location) return null

    const getCone = (lat, lng, heading) => {
        const length = 0.0007
        const spread = 25
        const rad = (d) => (d * Math.PI) / 180

        return [
            { latitude: lat, longitude: lng },
            {
                latitude: lat + length * Math.cos(rad(heading - spread)),
                longitude: lng + length * Math.sin(rad(heading - spread)),
            },
            {
                latitude: lat + length * Math.cos(rad(heading + spread)),
                longitude: lng + length * Math.sin(rad(heading + spread)),
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
                    latitudeDelta: 0.005,
                    longitudeDelta: 0.005,
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