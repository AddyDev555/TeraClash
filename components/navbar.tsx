import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native'
import React, { useState } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { useFonts, Poppins_400Regular, Poppins_600SemiBold, Poppins_700Bold } from '@expo-google-fonts/poppins'
import { useRouter } from 'expo-router'

export default function Navbar() {
    const [showInfo, setShowInfo] = useState(false)
    const router = useRouter();

    const [fontsLoaded] = useFonts({
        Poppins_400Regular,
        Poppins_600SemiBold,
        Poppins_700Bold,
    })

    if (!fontsLoaded) return null

    return (
        <View style={styles.container}>

            {/* Logo */}
            <TouchableOpacity style={styles.logoCon}>
                <Image
                    source={require('../assets/images/Logo.png')}
                    style={styles.logo}
                    resizeMode="contain"
                />
                <Text style={styles.logoText}>Tera<Text style={{ color: 'cyan' }}>Clash</Text></Text>
            </TouchableOpacity>

            <View style={styles.rightSection}>
                {/* Sweats Currency */}
                <TouchableOpacity style={styles.sweatsContainer} onPress={() => {
                    setShowInfo(true)
                    setTimeout(() => setShowInfo(false), 5000)
                }}>
                    <Ionicons name="flame" size={16} color="#facc15" />
                    <Text style={styles.sweatsText}>
                        10
                    </Text>
                </TouchableOpacity>

                {/* Marketplace */}
                <TouchableOpacity
                    style={styles.marketplace}
                    onPress={() => router.push('/')}
                >
                    <Ionicons name="cart-outline" size={18} color="cyan" />
                </TouchableOpacity>

                {showInfo && (
                    <View style={styles.popup}>
                        <Ionicons name="information-circle" size={14} color="#22d3ee" />
                        <Text style={styles.popupText}>
                            Earn sweat coins to unlock powerups
                        </Text>
                    </View>
                )}

                {/* Profile */}
                <TouchableOpacity style={styles.profile} onPress={() => router.push('/profile')}>
                    <Text style={styles.profileText}>
                        PR
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 25,
        paddingVertical: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#0F172A',
    },

    logoCon: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    logoText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 18,
        marginLeft: 8,
        letterSpacing: 1,
        fontFamily: 'Poppins_700Bold',
    },

    popup: {
        position: 'absolute',
        top: 38,
        right: -20,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: 'rgba(30, 41, 59, 0.95)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#334155',
        maxWidth: 300,
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 6,
        zIndex: 1000,
    },

    popupText: {
        color: 'white',
        fontSize: 12,
        fontFamily: 'Poppins_400Regular',
    },

    logo: {
        width: 30,
        height: 30,
        borderRadius: 10,
    },

    rightSection: {
        flexDirection: 'row',
        gap: 8,
    },

    profile: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        backgroundColor: 'rgba(30, 41, 59, 0.9)',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#334155',
    },

    profileText: {
        color: 'cyan',
        fontWeight: 'bold',
        fontSize: 13,
    },

    sweatsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(30, 41, 59, 0.9)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        marginRight: 5,
        borderColor: '#334155',
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },

    sweatsText: {
        color: '#facc15',
        fontWeight: 'bold',
        fontSize: 14,
        marginLeft: 6,
    },

    marketplace: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(30, 41, 59, 0.9)',
        borderWidth: 2,
        borderColor: '#334155',
    },
})