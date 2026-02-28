import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { useRouter, usePathname } from 'expo-router'

export default function BottomBar() {
    const pathname = usePathname();
    
    const tabs = [
        { name: 'Home', icon: 'home', route: '/home' },
        { name: 'Analysis', icon: 'bar-chart', route: '/analysis' },
        { name: 'LeaderBoard', icon: 'trophy', route: '/leaderboard' },
    ]

    const router = useRouter()

    const handleTabPress = (route, name) => {
        router.push(route);
    }


    return (
        <View style={styles.container}>
            <View style={styles.glassEffect}>
                {tabs.map((tab) => (
                    <TouchableOpacity
                        key={tab.name}
                        style={[
                            styles.tab,
                            pathname === tab.route && styles.activeTab
                        ]}
                        onPress={() => handleTabPress(tab.route, tab.name)}
                        activeOpacity={0.7}
                    >
                        <View style={styles.iconContainer}>
                            <Ionicons
                                name={pathname === tab.route ? tab.icon : `${tab.icon}-outline`}
                                size={19}
                                color={pathname === tab.route ? 'cyan' : '#94A3B8'}
                            />
                            {/* {activeTab === tab.name && <View style={styles.indicator} />} */}
                        </View>
                        <Text style={[
                            styles.tabText,
                            pathname === tab.route && styles.activeText
                        ]}>
                            {tab.name}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 15,
        zIndex: 1000,
        left: 0,
        right: 0,
        height: 53,
        overflow: 'hidden',
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
    },
    glassEffect: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: '#0F172A',
        backdropFilter: 'blur(10px)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        paddingHorizontal: 8,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    tab: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
    },
    activeTab: {
        backgroundColor: 'rgba(103, 232, 249, 0.15)',
    },
    iconContainer: {
        position: 'relative',
        marginBottom: 4,
    },
    indicator: {
        position: 'absolute',
        bottom: -6,
        left: '50%',
        marginLeft: -2,
        width: 4,
        height: 4,
        backgroundColor: 'cyan',
        borderRadius: 2,
    },
    tabText: {
        fontSize: 11,
        color: '#94A3B8',
        fontWeight: '600',
        letterSpacing: 0.3,
    },
    activeText: {
        color: 'cyan',
        fontWeight: '700',
    },
})