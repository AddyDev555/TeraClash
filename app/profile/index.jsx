import { StyleSheet, Text, TouchableOpacity, View, Image, ScrollView } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'

export default function Profile() {

    const user = {
        name: "Aditya",
        level: 12,
        xp: 320,
        maxXp: 500,
        coins: 1240,
        wins: 87,
        areas: 14,
        rank: "Gold II"
    }

    const router = useRouter();

    const xpPercentage = (user.xp / user.maxXp) * 100

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="light" />

            {/* Back Button */}
            <View style={styles.topBar}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={26} color="white" />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>

                {/* HEADER */}
                <View style={styles.header}>
                    <View style={styles.avatarWrapper}>
                        <Image
                            source={{ uri: "https://i.pravatar.cc/300" }}
                            style={styles.avatar}
                        />
                    </View>

                    <Text style={styles.username}>{user.name}</Text>

                    <View style={styles.levelBadge}>
                        <Text style={styles.levelText}>Level {user.level}</Text>
                    </View>

                    {/* XP BAR */}
                    <View style={styles.xpBar}>
                        <View style={[styles.xpFill, { width: `${xpPercentage}%` }]} />
                    </View>
                    <Text style={styles.xpText}>{user.xp} / {user.maxXp} XP</Text>
                </View>

                {/* STATS GRID */}
                <View style={styles.statsGrid}>
                    <StatCard title="Sweat Coins" value={user.coins} icon="flame" />
                    <StatCard title="Wins" value={user.wins} icon="trophy" />
                    <StatCard title="Areas" value={user.areas} icon="map" />
                    <StatCard title="Rank" value={user.rank} icon="medal" />
                </View>

                {/* ACHIEVEMENTS */}
                <Text style={styles.sectionTitle}>Achievements</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <Achievement title="First Conquest" />
                    <Achievement title="Explorer" />
                    <Achievement title="Unstoppable" />
                </ScrollView>

                {/* RECENT ACTIVITY */}
                <Text style={styles.sectionTitle}>Recent Activity</Text>
                <ActivityCard text="Conquered Downtown Zone" />
                <ActivityCard text="Reached Level 12" />
                <ActivityCard text="Won 3 Battles Today" />

            </ScrollView>
        </SafeAreaView>
    )
}

/* ---------------- COMPONENTS ---------------- */

const StatCard = ({ title, value, icon }) => (
    <View style={styles.statCard}>
        <Ionicons name={icon} size={22} color="cyan" />
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statTitle}>{title}</Text>
    </View>
)

const Achievement = ({ title }) => (
    <View style={styles.achievement}>
        <Ionicons name="star" size={26} color="#FACC15" />
        <Text style={styles.achievementText}>{title}</Text>
    </View>
)

const ActivityCard = ({ text }) => (
    <View style={styles.activityCard}>
        <Text style={styles.activityText}>{text}</Text>
    </View>
)

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0F172A',
        paddingHorizontal: 16
    },

    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
    },

    pageTitle: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 16
    },

    header: {
        alignItems: 'center',
        marginTop: 20
    },

    avatarWrapper: {
        borderWidth: 3,
        borderColor: 'cyan',
        borderRadius: 60,
        padding: 4
    },

    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50
    },

    username: {
        color: 'white',
        fontSize: 22,
        fontWeight: 'bold',
        marginTop: 12
    },

    levelBadge: {
        backgroundColor: '#0F172A',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 20,
        marginTop: 6
    },

    levelText: {
        color: 'cyan',
        fontWeight: '600'
    },

    xpBar: {
        height: 8,
        width: '80%',
        backgroundColor: '#0F172A',
        borderRadius: 10,
        marginTop: 12,
        overflow: 'hidden'
    },

    xpFill: {
        height: '100%',
        backgroundColor: 'cyan'
    },

    xpText: {
        color: '#94A3B8',
        marginTop: 6,
        fontSize: 12
    },

    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginTop: 30
    },

    statCard: {
        backgroundColor: '#1E293B',
        width: '48%',
        borderRadius: 16,
        padding: 16,
        marginBottom: 14
    },

    statValue: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 6
    },

    statTitle: {
        color: '#94A3B8',
        fontSize: 12,
        marginTop: 4
    },

    sectionTitle: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 25,
        marginBottom: 12
    },

    achievement: {
        backgroundColor: '#1E293B',
        padding: 16,
        borderRadius: 16,
        marginRight: 12,
        alignItems: 'center',
        width: 120
    },

    achievementText: {
        color: 'white',
        fontSize: 12,
        marginTop: 6,
        textAlign: 'center'
    },

    activityCard: {
        backgroundColor: '#1E293B',
        padding: 16,
        borderRadius: 16,
        marginBottom: 12
    },

    activityText: {
        color: 'white'
    }
})