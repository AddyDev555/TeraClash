import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Image,
    ScrollView,
    ImageBackground,
    Switch,
} from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { BlurView } from 'expo-blur'

const SettingRow = ({ title, icon, value, onValueChange }) => (
    <View style={styles.settingRow}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Ionicons name={icon} size={20} color="cyan" />
            <Text style={styles.settingText}>{title}</Text>
        </View>

        <Switch
            value={value}
            onValueChange={onValueChange}
            trackColor={{ false: '#334155', true: 'cyan' }}
            thumbColor={value ? '#f4f3f4' : '#f4f3f4'}
        />
    </View>
)

const AchievementCard = ({ item }) => (
    <View
        style={[
            styles.achievementCard,
            { backgroundColor: item.unlocked ? '#1E293B' : '#0F172A' }
        ]}
    >
        <Ionicons
            name={item.icon}
            size={32}
            color={item.unlocked ? 'cyan' : '#475569'}
        />

        <Text style={styles.achievementTitle}>
            {item.title}
        </Text>

        <View style={[
            styles.statusBadge,
            { backgroundColor: item.unlocked ? 'cyan' : '#334155' }
        ]}>
            <Text style={styles.statusText}>
                {item.unlocked ? 'Unlocked' : 'Locked'}
            </Text>
        </View>
    </View>
)

export default function Profile() {

    const user = {
        name: "Thia",
        level: 12,
        coins: 1240,
        areas: 14,
        steps: "2000"
    }

    const achievements = [
        { id: 1, title: "First 1,000 Steps", icon: "walk", unlocked: true },
        { id: 2, title: "Earn 1,000 Coins", icon: "flame", unlocked: true },
        { id: 3, title: "Capture 10 Territories", icon: "map", unlocked: true },
        { id: 4, title: "Reach Level 20", icon: "trophy", unlocked: false },
        { id: 5, title: "100K Total Steps", icon: "fitness", unlocked: false },
    ]

    const [locationEnabled, setLocationEnabled] = React.useState(true)
    const [privacyMode, setPrivacyMode] = React.useState(false)
    const [darkMode, setDarkMode] = React.useState(true)
    const [notificationsEnabled, setNotificationsEnabled] = React.useState(true)

    const router = useRouter();

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="light" />

            <ScrollView showsVerticalScrollIndicator={false}>

                {/* PROFILE HEADER IMAGE */}
                <View style={styles.imageContainer}>

                    {/* Top Left Back Button */}
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => router.back()}
                    >
                        <Ionicons name="arrow-back" size={22} color="white" />
                    </TouchableOpacity>

                    <ImageBackground
                        source={{ uri: "https://i.pravatar.cc/500" }}
                        style={styles.profileImage}
                        resizeMode="cover"
                    >

                        {/* Blur Overlay */}
                        <BlurView intensity={60} style={styles.blurOverlay}>
                            {/* Top Right Edit Image Icon */}
                            <TouchableOpacity style={styles.imageEditIcon}>
                                <Ionicons name="create-outline" size={22} color="white" />
                            </TouchableOpacity>

                            {/* Username Row */}
                            <View style={styles.nameRow}>
                                <Text style={styles.username}>{user.name}</Text>
                                <TouchableOpacity style={{ marginLeft: 8 }}>
                                    <Ionicons name="pencil" size={18} color="white" />
                                </TouchableOpacity>
                            </View>

                            {/* Level Badge */}
                            <View style={styles.levelBadge}>
                                <Text style={styles.levelText}>Level {user.level}</Text>
                            </View>

                        </BlurView>
                    </ImageBackground>
                </View>

                {/* CONTENT WITH PADDING */}
                <View style={{ paddingHorizontal: 16 }}>
                    <Text style={styles.title}>Stats</Text>

                    {/* STATS GRID */}
                    <View style={styles.statsGrid}>
                        <StatCard title="Total Steps" value={user.steps} icon="walk" />
                        <StatCard title="Sweat Coins" value={user.coins} icon="flame" />
                        <StatCard title="Territories" value={user.areas} icon="map" />
                    </View>
                </View>

                {/* Achievements */}
                <View style={{ paddingHorizontal: 16 }}>
                    <Text style={styles.title}>Achievements</Text>

                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingVertical: 12 }}
                    >
                        {achievements.map((item) => (
                            <AchievementCard key={item.id} item={item} />
                        ))}
                    </ScrollView>
                </View>

                {/* Settings */}
                <View style={{ paddingHorizontal: 16 }}>
                    <Text style={styles.title}>Settings</Text>

                    {/* SETTINGS */}
                    <View style={styles.settingsCon}>
                        <SettingRow
                            title="Location Sharing"
                            icon="location"
                            value={locationEnabled}
                            onValueChange={setLocationEnabled}
                        />

                        <SettingRow
                            title="Privacy Mode"
                            icon="lock-closed"
                            value={privacyMode}
                            onValueChange={setPrivacyMode}
                        />

                        <SettingRow
                            title="Dark Mode"
                            icon="moon"
                            value={darkMode}
                            onValueChange={setDarkMode}
                        />

                        <SettingRow
                            title="Notifications"
                            icon="notifications"
                            value={notificationsEnabled}
                            onValueChange={setNotificationsEnabled}
                        />
                    </View>
                </View>

            </ScrollView>
        </SafeAreaView>
    )
}

/* ---------------- COMPONENTS ---------------- */

const StatCard = ({ title, value, icon }) => (
    <View style={styles.statCard}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Ionicons name={icon} size={22} color="cyan" />
            <Text style={styles.statValue}>{value}</Text>
        </View>
        <Text style={styles.statTitle}>{title}</Text>
    </View>
)

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0F172A',
        padding: 0,
        margin: 0,
        position: 'relative',
        bottom: 20,
    },

    imageContainer: {
        width: '100%',
        height: 260
    },

    backButton: {
        position: 'absolute',
        top: 20,
        left: 15,
        backgroundColor: 'rgba(0,0,0,0.6)',
        padding: 8,
        zIndex: 10,
        borderRadius: 20
    },

    profileImage: {
        width: '100%',
        height: '100%',
        justifyContent: 'flex-end'
    },

    blurOverlay: {
        width: '100%',
        height: '100%',
        padding: 20,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.2)'
    },

    imageEditIcon: {
        position: 'absolute',
        top: 20,
        right: 20,
        backgroundColor: 'rgba(0,0,0,0.4)',
        padding: 8,
        borderRadius: 20
    },

    nameRow: {
        flexDirection: 'row',
        alignItems: 'center'
    },

    username: {
        color: 'white',
        fontSize: 24,
        fontWeight: 'bold'
    },

    levelBadge: {
        backgroundColor: '#1E293B',
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 20,
        marginTop: 2,
        alignSelf: 'flex-start'
    },

    levelText: {
        color: 'cyan',
        fontWeight: '600'
    },

    title: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
        paddingTop: 20,
        paddingLeft: 5
    },

    statsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10
    },

    statCard: {
        backgroundColor: '#1E293B',
        width: '32%',
        borderRadius: 16,
        padding: 16
    },

    statValue: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold'
    },

    statTitle: {
        color: '#94A3B8',
        fontSize: 12,
        marginTop: 4
    },

    achievementCard: {
        width: 160,
        borderRadius: 20,
        padding: 16,
        marginRight: 12,
        justifyContent: 'space-between',
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5
    },

    achievementTitle: {
        color: 'white',
        fontSize: 13,
        fontWeight: '600',
        marginTop: 12
    },

    statusBadge: {
        marginTop: 10,
        paddingVertical: 4,
        borderRadius: 12,
        alignItems: 'center'
    },

    statusText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#0F172A'
    },

    settingsCon: {
        marginTop: 20,
        backgroundColor: '#1E293B',
        borderRadius: 20,
        padding: 16,
        paddingTop: 0,
        marginBottom: 40
    },

    settingsTitle: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16
    },

    settingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 14,
        borderBottomWidth: 0.5,
        borderBottomColor: '#334155'
    },

    settingText: {
        color: 'white',
        fontSize: 14
    },
})