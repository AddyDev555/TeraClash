import {
    StyleSheet, Text, TouchableOpacity, View,
    ScrollView, ImageBackground, Switch, Modal, TextInput
} from 'react-native'
import React, { useState, useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter, useLocalSearchParams } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as ImagePicker from 'expo-image-picker'
import { API } from "@/utils/api"
import Toast from 'react-native-toast-message'

/* ─────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────── */
const API_URL = process.env.EXPO_PUBLIC_API_URL
const STORAGE_KEY = "user"
const DEFAULT_AVATAR = "https://i.pinimg.com/1200x/cf/78/fe/cf78fe788b403ff3d41784153b10d20d.jpg"

const ACHIEVEMENTS = [
    { id: 1, title: "10,000 Steps", icon: "walk", key: "total_steps", value: 10000 },
    { id: 2, title: "1,000 Sweats", icon: "flame", key: "sweat_coins", value: 1000 },
    { id: 3, title: "20 Territories", icon: "map", key: "areas_captured", value: 20 },
    { id: 4, title: "Level 20", icon: "trophy", key: "user_level", value: 20 },
    { id: 5, title: "100K Steps", icon: "fitness", key: "total_steps", value: 100000 },
]

/* ─────────────────────────────────────────────
   ASYNC STORAGE HELPERS
───────────────────────────────────────────── */
const readUser = async () => {
    const raw = await AsyncStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
}

// Merges only the provided fields — never wipes existing data
const writeUser = async (fields) => {
    const existing = await readUser() || {}
    const merged = { ...existing, ...fields }
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(merged))
    return merged
}

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */
const resolveAvatar = (pp) => {
    if (!pp) return DEFAULT_AVATAR
    if (pp.startsWith("http")) return pp
    const clean = pp.replace(/^\/+/, "")
    return `${API_URL}/api/profile/${clean}`
}

const isUnlocked = (achievement, userData) => {
    if (!userData) return false
    return (userData[achievement.key] || 0) >= achievement.value
}

const showToast = (type, text1, text2) =>
    Toast.show({ type, text1, ...(text2 && { text2 }) })

/* ─────────────────────────────────────────────
   SUB-COMPONENTS
───────────────────────────────────────────── */
const StatCard = ({ title, value, icon }) => (
    <LinearGradient
        colors={['#1e293b', '#0f172a']}
        style={styles.statCard}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
    >
        <View style={styles.statHeader}>
            <View style={[styles.iconContainer, { backgroundColor: '#3b82f620' }]}>
                <Ionicons name={icon} size={24} color="#3b82f6" />
            </View>
            <Text style={styles.statValue}>{value}</Text>
        </View>
        <Text style={styles.statTitle}>{title}</Text>
    </LinearGradient>
)

const AchievementCard = ({ item }) => {
    const progress = item.current
        ? Math.min((item.current / item.value) * 100, 100)
        : 0

    return (
        <LinearGradient
            colors={item.unlocked ? ['#1e293b', '#0f172a'] : ['#0f172a', '#0a0f1a']}
            style={[
                styles.achievementCard,
                item.unlocked && styles.unlockedAchievement
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
        >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={[styles.achievementIconContainer, { backgroundColor: item.unlocked ? '#10b98120' : '#33415520' }]}>
                    <Ionicons name={item.icon} size={24} color={item.unlocked ? '#10b981' : '#475569'} />
                </View>

                <Text style={styles.achievementTitle}>{item.title}</Text>
            </View>

            {!item.unlocked && (
                <View style={styles.progressContainer}>
                    <View style={styles.progressBar}>
                        <View style={[styles.progressFill, { width: `${progress}%` }]} />
                    </View>
                    <Text style={styles.progressText}>
                        {item.current || 0}/{item.value}
                    </Text>
                </View>
            )}

            <View style={[
                styles.statusBadge,
                { backgroundColor: item.unlocked ? '#10b981' : '#334155' }
            ]}>
                <Text style={styles.statusText}>
                    {item.unlocked ? 'Unlocked' : 'Locked'}
                </Text>
            </View>
        </LinearGradient>
    )
}

const SettingRow = ({ title, icon, value, onValueChange }) => (
    <View style={styles.settingRow}>
        <View style={styles.settingLeft}>
            <View style={styles.settingIconContainer}>
                <Ionicons name={icon} size={20} color="#3b82f6" />
            </View>
            <Text style={styles.settingText}>{title}</Text>
        </View>
        <Switch
            value={value}
            onValueChange={onValueChange}
            trackColor={{ false: '#334155', true: '#3b82f6' }}
            thumbColor="#f4f3f4"
        />
    </View>
)

/* ─────────────────────────────────────────────
   MAIN SCREEN
───────────────────────────────────────────── */
export default function Profile() {
    const router = useRouter()
    const { userInfo } = useLocalSearchParams()
    const parsedUserInfo = userInfo ? JSON.parse(userInfo) : null

    // ── All display state sourced from AsyncStorage ──
    const [userId, setUserId] = useState(null)
    const [displayName, setDisplayName] = useState("")
    const [avatarUri, setAvatarUri] = useState(DEFAULT_AVATAR)

    // ── UI state ──
    const [editedName, setEditedName] = useState("")
    const [isEditingName, setIsEditingName] = useState(false)
    const [deleteModalVisible, setDeleteModalVisible] = useState(false)
    const [settings, setSettings] = useState({
        location: true,
        privacy: false,
        darkMode: true,
        notifications: true,
    })

    /* On mount — pull fresh from AsyncStorage */
    useEffect(() => {
        syncFromStorage()
    }, [])

    /*
     * syncFromStorage
     * Single function that reads AsyncStorage and
     * refreshes ALL display state. Called after every write.
     */
    const syncFromStorage = async () => {
        try {
            const u = await readUser()
            if (!u) return
            const name = `${u.first_name || ''} ${u.last_name || ''}`.trim() || "Guest User"
            setUserId(u.id)
            setDisplayName(name)
            setEditedName(name)
            setAvatarUri(resolveAvatar(u.pp))
        } catch (e) {
            showToast("error", "Failed to load profile")
        }
    }

    /* ── Handlers ── */

    const handleSaveName = async () => {
        if (!editedName.trim()) {
            showToast("error", "Name cannot be empty")
            return
        }
        try {
            const [first_name = "", last_name = ""] = editedName.trim().split(" ")

            // 1. Call API via utility
            const data = await API.put("/api/profile/update", {
                user_id: userId,
                first_name,
                last_name,
            })

            // 2. Write response to AsyncStorage (merge — keeps pp intact)
            await writeUser(data.user)

            // 3. Refresh UI from AsyncStorage
            await syncFromStorage()

            setIsEditingName(false)
            showToast("success", "Name updated successfully")
        } catch (e) {
            showToast("error", "Update failed", e.message)
        }
    }

    const handlePickImage = async () => {
        const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync()
        if (!granted) {
            showToast("error", "Permission required", "Allow access to your gallery")
            return
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        })

        if (result.canceled) return

        try {
            const formData = new FormData()
            formData.append("user_id", String(userId))
            formData.append("banner_image", {
                uri: result.assets[0].uri,
                name: "profile.jpg",
                type: "image/jpeg",
            })

            const response = await fetch(`${API_URL}/api/profile/update`, {
                method: "PUT",
                body: formData,
            })

            if (!response.ok) throw new Error(`Server error: ${response.status}`)

            const data = await response.json()

            // ✅ Only write pp — don't touch name fields (server returns null for them)
            await writeUser({ pp: data.user.pp })

            // ✅ Refresh UI from AsyncStorage — name comes from storage, not server
            await syncFromStorage()

            showToast("success", "Profile image updated")
        } catch (e) {
            showToast("error", "Image upload failed", e.message)
        }
    }

    const handleLogout = async () => {
        await AsyncStorage.removeItem(STORAGE_KEY)
        router.replace("/(auth)/login")
    }

    const handleDeleteAccount = async () => {
        await AsyncStorage.removeItem(STORAGE_KEY)
        setDeleteModalVisible(false)
        router.replace("/(auth)/login")
    }

    const toggleSetting = (key) =>
        setSettings(prev => ({ ...prev, [key]: !prev[key] }))

    if (!userId) return null

    /* ── Render ── */
    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="light" />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                {/* ── HEADER IMAGE ── */}
                <View style={styles.imageContainer}>
                    <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={22} color="white" />
                    </TouchableOpacity>

                    <ImageBackground source={{ uri: avatarUri }} style={styles.profileImage} resizeMode="cover">
                        <LinearGradient
                            colors={['transparent', 'rgba(0,0,0,0.8)']}
                            style={styles.gradientOverlay}
                        >
                            <TouchableOpacity style={styles.imageEditIcon} onPress={handlePickImage}>
                                <View
                                    style={styles.editIconGradient}
                                >
                                    <Ionicons name="camera-outline" size={20} color="white" />
                                </View>
                            </TouchableOpacity>

                            {/* Name Row */}
                            <View style={styles.nameRow}>
                                {isEditingName ? (
                                    <>
                                        <TextInput
                                            value={editedName}
                                            onChangeText={setEditedName}
                                            style={styles.nameInput}
                                            placeholder="Enter name"
                                            placeholderTextColor="#94A3B8"
                                            autoFocus
                                        />
                                        <TouchableOpacity onPress={handleSaveName} style={styles.editActionBtn}>
                                            <Ionicons name="checkmark" size={22} color="#3b82f6" />
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => setIsEditingName(false)} style={styles.editActionBtn}>
                                            <Ionicons name="close" size={22} color="#94a3b8" />
                                        </TouchableOpacity>
                                    </>
                                ) : (
                                    <>
                                        <Text style={styles.username}>{displayName}</Text>
                                        <TouchableOpacity style={styles.editIconBtn} onPress={() => setIsEditingName(true)}>
                                            <Ionicons name="pencil" size={18} color="#94a3b8" />
                                        </TouchableOpacity>
                                    </>
                                )}
                            </View>

                            <View style={styles.levelBadge}>
                                <View
                                    style={styles.levelGradient}
                                >
                                    <Text style={styles.levelText}>Level {parsedUserInfo?.user_level || 1}</Text>
                                </View>
                            </View>
                        </LinearGradient>
                    </ImageBackground>
                </View>

                {/* ── STATS ── */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Stats</Text>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.statsScrollContainer}
                    >
                        <StatCard title="Total Steps" value={parsedUserInfo?.total_steps?.toLocaleString() || 0} icon="footsteps-outline" />
                        <StatCard title="Sweat Coins" value={parsedUserInfo?.sweat_coins?.toLocaleString() || 0} icon="flame-outline" />
                        <StatCard title="Territories" value={parsedUserInfo?.areas_captured || 0} icon="map-outline" />
                    </ScrollView>
                </View>

                {/* ── ACHIEVEMENTS ── */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Achievements</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.achievementsScroll}>
                        {ACHIEVEMENTS.map(item => {
                            const current = parsedUserInfo?.[item.key] || 0

                            return (
                                <AchievementCard
                                    key={item.id}
                                    item={{
                                        ...item,
                                        current,
                                        unlocked: current >= item.value
                                    }}
                                />
                            )
                        })}
                    </ScrollView>
                </View>

                {/* ── SETTINGS ── */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Settings</Text>
                    <LinearGradient
                        colors={['#1e293b', '#0f172a']}
                        style={styles.settingsContainer}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <SettingRow title="Dark Mode" icon="moon-outline" value={settings.darkMode} onValueChange={() => toggleSetting('darkMode')} />
                        <SettingRow title="Notifications" icon="notifications-outline" value={settings.notifications} onValueChange={() => toggleSetting('notifications')} />
                    </LinearGradient>
                </View>

                {/* ── ACCOUNT ACTIONS ── */}
                <View style={styles.accountActions}>
                    <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                        <View
                            style={styles.logoutGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        >
                            <Ionicons name="log-out-outline" size={20} color="white" />
                            <Text style={styles.logoutText}>Logout</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.deleteButton} onPress={() => setDeleteModalVisible(true)}>
                        <LinearGradient
                            colors={['#ef4444', '#dc2626']}
                            style={styles.deleteGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        >
                            <Ionicons name="trash-outline" size={20} color="white" />
                            <Text style={styles.deleteText}>Delete Account</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                <View style={styles.bottomPadding} />

            </ScrollView>

            {/* ── DELETE MODAL ── */}
            <Modal visible={deleteModalVisible} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <LinearGradient
                        colors={['#1e293b', '#0f172a']}
                        style={styles.modalContainer}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <View style={styles.modalIconContainer}>
                            <Ionicons name="warning-outline" size={48} color="#ef4444" />
                        </View>
                        <Text style={styles.modalTitle}>Delete Account?</Text>
                        <Text style={styles.modalText}>This action is permanent and cannot be undone.</Text>
                        <View style={styles.modalButtons}>
                            <TouchableOpacity style={styles.cancelButton} onPress={() => setDeleteModalVisible(false)}>
                                <Text style={styles.cancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.confirmDeleteButton} onPress={handleDeleteAccount}>
                                <LinearGradient
                                    colors={['#ef4444', '#dc2626']}
                                    style={styles.confirmGradient}
                                >
                                    <Text style={styles.confirmDeleteText}>Delete</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </LinearGradient>
                </View>
            </Modal>

        </SafeAreaView>
    )
}

/* ─────────────────────────────────────────────
   STYLES
───────────────────────────────────────────── */
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a0f1a',
    },
    scrollContent: {
        paddingBottom: 30,
    },
    section: {
        paddingHorizontal: 16,
        marginTop: 24,
    },
    sectionTitle: {
        color: '#fff',
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 16,
        letterSpacing: -0.5,
    },

    // Header
    imageContainer: {
        width: '100%',
        height: 300,
        position: 'relative',
    },
    backButton: {
        position: 'absolute',
        top: 20,
        left: 15,
        backgroundColor: 'rgba(0,0,0,0.6)',
        padding: 10,
        zIndex: 10,
        borderRadius: 30,
        borderWidth: 1,
        borderColor: '#2d3a4e',
    },
    profileImage: {
        width: '100%',
        height: '100%',
    },
    gradientOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        padding: 20,
    },
    imageEditIcon: {
        position: 'absolute',
        top: 20,
        right: 20,
        zIndex: 10,
    },
    editIconGradient: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        backgroundColor: '#1e293b',
        alignItems: 'center',
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    nameInput: {
        color: '#fff',
        fontSize: 28,
        fontWeight: 'bold',
        borderBottomWidth: 2,
        borderBottomColor: '#3b82f6',
        marginRight: 10,
        minWidth: 200,
        paddingVertical: 4,
    },
    username: {
        color: '#fff',
        fontSize: 28,
        fontWeight: 'bold',
        letterSpacing: -0.5,
    },
    editIconBtn: {
        marginLeft: 12,
        backgroundColor: 'rgba(255,255,255,0.2)',
        padding: 8,
        borderRadius: 20,
    },
    editActionBtn: {
        marginLeft: 8,
        backgroundColor: 'rgba(255,255,255,0.1)',
        padding: 6,
        borderRadius: 20,
    },
    levelBadge: {
        alignSelf: 'flex-start',
    },
    levelGradient: {
        paddingHorizontal: 16,
        paddingVertical: 4,
        borderRadius: 10,
        backgroundColor: '#1e293b',
        borderWidth: 2,
        borderColor: '#2d3a4e',
    },
    levelText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 13,
    },

    // Stats - Now scrollable horizontally
    statsScrollContainer: {
        paddingHorizontal: 4,
        gap: 12,
        flexDirection: 'row',
    },
    statCard: {
        borderRadius: 20,
        padding: 16,
        borderWidth: 1,
        borderColor: '#2d3a4e',
    },
    statHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    statTitle: {
        fontSize: 13,
        color: '#94a3b8',
        fontWeight: '500',
    },
    statValue: {
        fontSize: 24,
        fontWeight: '700',
        color: '#fff',
        letterSpacing: -0.5,
    },

    // Achievements
    achievementsScroll: {
        paddingVertical: 8,
        paddingHorizontal: 4,
        gap: 12,
        flexDirection: 'row',
    },
    achievementCard: {
        width: 160,
        borderRadius: 20,
        padding: 16,
        marginRight: 12,
        borderWidth: 1,
        borderColor: '#2d3a4e',
    },
    unlockedAchievement: {
        borderColor: '#10b981',
    },
    achievementIconContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    achievementTitle: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '600',
        marginBottom: 8,
    },
    progressContainer: {
        marginVertical: 8,
    },
    progressBar: {
        height: 4,
        backgroundColor: '#334155',
        borderRadius: 2,
        overflow: 'hidden',
        marginBottom: 4,
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#3b82f6',
        borderRadius: 2,
    },
    progressText: {
        color: '#94a3b8',
        fontSize: 11,
    },
    statusBadge: {
        marginTop: 8,
        paddingVertical: 4,
        borderRadius: 12,
        alignItems: 'center',
    },
    statusText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#fff',
    },

    // Settings
    settingsContainer: {
        borderRadius: 20,
        padding: 16,
        paddingVertical: 2,
        borderWidth: 1,
        borderColor: '#2d3a4e',
    },
    settingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 14,
    },
    settingLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    settingIconContainer: {
        width: 32,
        height: 32,
        borderRadius: 10,
        backgroundColor: '#3b82f620',
        justifyContent: 'center',
        alignItems: 'center',
    },
    settingText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '500',
    },

    // Account actions
    accountActions: {
        paddingHorizontal: 16,
        marginTop: 24,
        marginBottom: 20,
        gap: 12,
    },
    logoutButton: {
        borderRadius: 14,
        overflow: 'hidden',
    },
    logoutGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: '#3b82f6',
        color: "white",
        paddingVertical: 14,
    },
    logoutText: {
        fontWeight: '700',
        color: 'white',
        fontSize: 15,
    },
    deleteButton: {
        borderRadius: 14,
        overflow: 'hidden',
    },
    deleteGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 14,
    },
    deleteText: {
        fontWeight: '700',
        color: 'white',
        fontSize: 15,
    },
    bottomPadding: {
        height: 20,
    },

    // Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContainer: {
        width: '100%',
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#2d3a4e',
    },
    modalIconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#ef444420',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    modalTitle: {
        color: '#fff',
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 8,
    },
    modalText: {
        color: '#94a3b8',
        textAlign: 'center',
        marginBottom: 24,
        fontSize: 14,
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
    },
    cancelButton: {
        flex: 1,
        backgroundColor: '#334155',
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
    },
    cancelText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
    },
    confirmDeleteButton: {
        flex: 1,
        borderRadius: 12,
        overflow: 'hidden',
    },
    confirmGradient: {
        paddingVertical: 12,
        alignItems: 'center',
    },
    confirmDeleteText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
    },
})