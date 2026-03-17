import React, { useEffect, useState, useRef } from 'react'
import { StyleSheet, View, Dimensions, Text } from 'react-native'
import MapView, { Circle, Polygon, Polyline, Marker, Callout } from 'react-native-maps'
import * as Location from 'expo-location'

export default function Home({ userLocation, setUserLocation, user }) {
    const [location, setLocation] = useState(null)
    const [heading, setHeading] = useState(0)
    const [path, setPath] = useState([])
    const otherUsers = userLocation?.filter(u => u.user_id !== user?.id)
    const [region, setRegion] = useState(null)
    const [followUser, setFollowUser] = useState(true)
    const mapRef = useRef(null)
    const markerRefs = useRef({})

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

                    setPath(prev => prev.length === 0 ? [newPoint] : [...prev, newPoint])
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

    if (!location) return null

    const getCone = (lat, lng, heading) => {
        const length = 0.0007
        const spread = 25
        const toRad = deg => (deg * Math.PI) / 180
        const adjustedHeading = heading
        const left = toRad(adjustedHeading - spread)
        const right = toRad(adjustedHeading + spread)
        const lngScale = 1 / Math.cos(toRad(lat))

        return [
            { latitude: lat, longitude: lng },
            { latitude: lat + length * Math.cos(left), longitude: lng + length * Math.sin(left) * lngScale },
            { latitude: lat + length * Math.cos(right), longitude: lng + length * Math.sin(right) * lngScale },
        ]
    }

    const getDynamicRadius = () => {
        if (!region) return 5
        const zoomFactor = region.latitudeDelta
        return Math.max(5, zoomFactor * 1000)
    }

    return (
        <View style={styles.container}>
            <MapView
                ref={mapRef}
                style={styles.map}
                region={followUser ? {
                    latitude: location.latitude,
                    longitude: location.longitude,
                    latitudeDelta: 0.002,
                    longitudeDelta: 0.002,
                } : region}
                onPress={() => { }}
                onRegionChangeComplete={(reg) => {
                    setRegion(reg)
                    setFollowUser(false)
                }}
            >
                {/* Current user path */}
                {path.length > 1 && (
                    <Polyline
                        coordinates={path}
                        strokeColor="#393D7E"
                        strokeWidth={4}
                        lineCap="round"
                        lineJoin="round"
                    />
                )}

                {/* Current user direction cone */}
                <Polygon
                    coordinates={getCone(location.latitude, location.longitude, heading)}
                    fillColor="rgba(135, 206, 250, 0.5)"
                    strokeColor="rgba(135, 206, 250, 0.8)"
                    strokeWidth={2}
                />

                {/* Current user blue dot */}
                <Circle
                    center={location}
                    radius={getDynamicRadius()}
                    fillColor="rgba(0, 122, 255, 1)"
                    strokeColor="white"
                    strokeWidth={2}
                />

                {/* Other users circles + invisible markers with callouts */}
                {otherUsers?.map(u => (
                    <React.Fragment key={u.user_id}>
                        <Circle
                            center={{ latitude: u.latitude, longitude: u.longitude }}
                            radius={getDynamicRadius()}
                            fillColor="rgba(255, 0, 0, 0.9)"
                            strokeColor="white"
                            strokeWidth={1}
                            tappable={true}
                            onPress={() => {
                                markerRefs.current[u.user_id]?.showCallout()
                            }}
                        />
                        <Marker
                            coordinate={{ latitude: u.latitude, longitude: u.longitude }}
                            ref={ref => (markerRefs.current[u.user_id] = ref)}
                            opacity={0}
                        >
                            <Callout tooltip>
                                <View style={{
                                    backgroundColor: 'rgba(0,0,0,0.7)',
                                    paddingHorizontal: 6,
                                    paddingVertical: 3,
                                    borderRadius: 6,
                                }}>
                                    <Text style={{ color: 'white', fontSize: 12 }}>
                                        {u.name || `User ${u.user_id}`}
                                    </Text>
                                </View>
                            </Callout>
                        </Marker>
                    </React.Fragment>
                ))}
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