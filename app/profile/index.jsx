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
    <View style={styles.statCard}>
        <View style={styles.statHeader}>
            <View style={[styles.iconContainer, { backgroundColor: '#c2ccd820' }]}>
                <Ionicons name={icon} size={20} color="cyan" />
            </View>
            <Text style={styles.statValue}>{value}</Text>
        </View>
        <Text style={styles.statTitle}>{title}</Text>
    </View>
)

const AchievementCard = ({ item }) => {
    const progress = item.current
        ? Math.min((item.current / item.value) * 100, 100)
        : 0

    return (
        <View style={[
            styles.achievementCard,
            item.unlocked && styles.unlockedAchievement
        ]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={[styles.achievementIconContainer, { backgroundColor: item.unlocked ? '#10b98120' : '#33415520' }]}>
                    <Ionicons name={item.icon} size={20} color={item.unlocked ? '#10b981' : '#475569'} />
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
        </View>
    )
}

const SettingRow = ({ title, icon, value, onValueChange }) => (
    <View style={styles.settingRow}>
        <View style={styles.settingLeft}>
            <View style={[styles.settingIconContainer, { backgroundColor: '#c2ccd820' }]}>
                <Ionicons name={icon} size={18} color="cyan" />
            </View>
            <Text style={styles.settingText}>{title}</Text>
        </View>
        <Switch
            value={value}
            onValueChange={onValueChange}
            trackColor={{ false: '#334155', true: 'cyan' }}
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
                        <Ionicons name="arrow-back" size={20} color="white" />
                    </TouchableOpacity>

                    <ImageBackground source={{ uri: avatarUri }} style={styles.profileImage} resizeMode="cover">
                        <View style={styles.gradientOverlay}>
                            <TouchableOpacity style={styles.imageEditIcon} onPress={handlePickImage}>
                                <View style={styles.editIconContainer}>
                                    <Ionicons name="camera-outline" size={18} color="white" />
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
                                            <Ionicons name="checkmark" size={20} color="cyan" />
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => setIsEditingName(false)} style={styles.editActionBtn}>
                                            <Ionicons name="close" size={20} color="#94a3b8" />
                                        </TouchableOpacity>
                                    </>
                                ) : (
                                    <>
                                        <Text style={styles.username}>{displayName}</Text>
                                        <TouchableOpacity style={styles.editIconBtn} onPress={() => setIsEditingName(true)}>
                                            <Ionicons name="pencil" size={16} color="#94a3b8" />
                                        </TouchableOpacity>
                                    </>
                                )}
                            </View>

                            <View style={styles.levelBadge}>
                                <View style={styles.levelContainer}>
                                    <Text style={styles.levelText}>Level {parsedUserInfo?.user_level || 1}</Text>
                                </View>
                            </View>
                        </View>
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
                    <View style={styles.settingsContainer}>
                        <SettingRow title="Notifications" icon="notifications-outline" value={settings.notifications} onValueChange={() => toggleSetting('notifications')} />
                    </View>
                </View>

                {/* ── ACCOUNT ACTIONS ── */}
                <View style={styles.accountActions}>
                    <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                        <View style={styles.logoutContainer}>
                            <Ionicons name="log-out-outline" size={18} color="#0a0f1a" />
                            <Text style={styles.logoutText}>Logout</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.deleteButton} onPress={() => setDeleteModalVisible(true)}>
                        <View style={styles.deleteContainer}>
                            <Ionicons name="trash-outline" size={18} color="white" />
                            <Text style={styles.deleteText}>Delete Account</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                <View style={styles.bottomPadding} />

            </ScrollView>

            {/* ── DELETE MODAL ── */}
            <Modal visible={deleteModalVisible} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <View style={styles.modalIconContainer}>
                            <Ionicons name="warning-outline" size={40} color="#ef4444" />
                        </View>
                        <Text style={styles.modalTitle}>Delete Account?</Text>
                        <Text style={styles.modalText}>This action is permanent and cannot be undone.</Text>
                        <View style={styles.modalButtons}>
                            <TouchableOpacity style={styles.cancelButton} onPress={() => setDeleteModalVisible(false)}>
                                <Text style={styles.cancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.confirmDeleteButton} onPress={handleDeleteAccount}>
                                <View style={styles.confirmContainer}>
                                    <Text style={styles.confirmDeleteText}>Delete</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
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
        marginTop: 15,
    },
    sectionTitle: {
        color: '#fff',
        fontSize: 17,
        fontWeight: '700',
        marginBottom: 14,
        letterSpacing: -0.5,
    },

    // Header
    imageContainer: {
        width: '100%',
        height: 280,
        position: 'relative',
    },
    backButton: {
        position: 'absolute',
        top: 20,
        left: 15,
        backgroundColor: 'rgba(0,0,0,0.6)',
        padding: 8,
        zIndex: 10,
        borderRadius: 25,
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
        padding: 16,
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    imageEditIcon: {
        position: 'absolute',
        top: 20,
        right: 20,
        zIndex: 10,
    },
    editIconContainer: {
        width: 38,
        height: 38,
        borderRadius: 19,
        justifyContent: 'center',
        backgroundColor: '#1e293b',
        alignItems: 'center',
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    nameInput: {
        color: '#fff',
        fontSize: 22,
        fontWeight: 'bold',
        borderBottomWidth: 2,
        borderBottomColor: 'cyan',
        marginRight: 8,
        minWidth: 180,
        paddingVertical: 3,
    },
    username: {
        color: '#fff',
        fontSize: 22,
        fontWeight: 'bold',
        letterSpacing: -0.5,
    },
    editIconBtn: {
        marginLeft: 10,
        backgroundColor: 'rgba(255,255,255,0.2)',
        padding: 6,
        borderRadius: 18,
    },
    editActionBtn: {
        marginLeft: 6,
        backgroundColor: 'rgba(255,255,255,0.1)',
        padding: 5,
        borderRadius: 18,
    },
    levelBadge: {
        alignSelf: 'flex-start',
    },
    levelContainer: {
        paddingHorizontal: 14,
        paddingVertical: 3,
        borderRadius: 8,
        backgroundColor: '#1e293b',
        borderWidth: 1.5,
        borderColor: '#2d3a4e',
    },
    levelText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 11,
    },

    // Stats - Now scrollable horizontally
    statsScrollContainer: {
        paddingHorizontal: 4,
        gap: 10,
        flexDirection: 'row',
    },
    statCard: {
        width: 100,
        backgroundColor: '#1e293b',
        borderRadius: 16,
        padding: 12,
        borderWidth: 1,
        borderColor: '#2d3a4e',
    },
    statHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 8,
    },
    iconContainer: {
        width: 30,
        height: 30,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    statTitle: {
        fontSize: 11,
        color: '#94a3b8',
        fontWeight: '500',
    },
    statValue: {
        fontSize: 18,
        fontWeight: '700',
        color: '#fff',
        letterSpacing: -0.5,
    },

    // Achievements
    achievementsScroll: {
        paddingVertical: 6,
        paddingHorizontal: 4,
        gap: 10,
        flexDirection: 'row',
    },
    achievementCard: {
        width: 150,
        backgroundColor: '#0f172a',
        borderRadius: 16,
        padding: 12,
        marginRight: 10,
        borderWidth: 1,
        borderColor: '#2d3a4e',
    },
    unlockedAchievement: {
        borderColor: '#10b981',
        backgroundColor: '#1e293b',
    },
    achievementIconContainer: {
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    achievementTitle: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 6,
    },
    progressContainer: {
        marginVertical: 6,
    },
    progressBar: {
        height: 3,
        backgroundColor: '#334155',
        borderRadius: 2,
        overflow: 'hidden',
        marginBottom: 3,
    },
    progressFill: {
        height: '100%',
        backgroundColor: 'cyan',
        borderRadius: 2,
    },
    progressText: {
        color: '#94a3b8',
        fontSize: 10,
    },
    statusBadge: {
        marginTop: 6,
        paddingVertical: 3,
        borderRadius: 10,
        alignItems: 'center',
    },
    statusText: {
        fontSize: 10,
        fontWeight: '600',
        color: '#fff',
    },

    // Settings
    settingsContainer: {
        backgroundColor: '#1e293b',
        borderRadius: 16,
        padding: 14,
        paddingVertical: 2,
        borderWidth: 1,
        borderColor: '#2d3a4e',
    },
    settingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
    },
    settingLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    settingIconContainer: {
        width: 28,
        height: 28,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    settingText: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '500',
    },

    // Account actions
    accountActions: {
        paddingHorizontal: 16,
        marginTop: 20,
        marginBottom: 20,
        gap: 10,
    },
    logoutButton: {
        borderRadius: 12,
        overflow: 'hidden',
    },
    logoutContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        backgroundColor: 'cyan',
        paddingVertical: 12,
    },
    logoutText: {
        fontWeight: '700',
        color: '#0a0f1a',
        fontSize: 13,
    },
    deleteButton: {
        borderRadius: 12,
        overflow: 'hidden',
    },
    deleteContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        backgroundColor: '#ef4444',
        paddingVertical: 12,
    },
    deleteText: {
        fontWeight: '700',
        color: 'white',
        fontSize: 13,
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
        backgroundColor: '#1e293b',
        borderRadius: 20,
        padding: 20,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#2d3a4e',
    },
    modalIconContainer: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: '#ef444420',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 14,
    },
    modalTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 6,
    },
    modalText: {
        color: '#94a3b8',
        textAlign: 'center',
        marginBottom: 20,
        fontSize: 12,
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 10,
        width: '100%',
    },
    cancelButton: {
        flex: 1,
        backgroundColor: '#334155',
        paddingVertical: 10,
        borderRadius: 10,
        alignItems: 'center',
    },
    cancelText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 12,
    },
    confirmDeleteButton: {
        flex: 1,
        borderRadius: 10,
        overflow: 'hidden',
    },
    confirmContainer: {
        paddingVertical: 10,
        alignItems: 'center',
        backgroundColor: '#ef4444',
    },
    confirmDeleteText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 12,
    },
})