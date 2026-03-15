import {
    StyleSheet, Text, TouchableOpacity, View,
    ScrollView, ImageBackground, Switch, Modal, TextInput
} from 'react-native'
import React, { useState, useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { Ionicons } from '@expo/vector-icons'
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
    { id: 1, title: "First 1,000 Steps", icon: "walk", unlocked: true },
    { id: 2, title: "Earn 1,000 Coins", icon: "flame", unlocked: true },
    { id: 3, title: "Capture 10 Territories", icon: "map", unlocked: true },
    { id: 4, title: "Reach Level 20", icon: "trophy", unlocked: false },
    { id: 5, title: "100K Total Steps", icon: "fitness", unlocked: false },
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

const showToast = (type, text1, text2) =>
    Toast.show({ type, text1, ...(text2 && { text2 }) })

/* ─────────────────────────────────────────────
   SUB-COMPONENTS
───────────────────────────────────────────── */
const StatCard = ({ title, value, icon }) => (
    <View style={styles.statCard}>
        <View style={styles.row}>
            <Ionicons name={icon} size={22} color="cyan" />
            <Text style={styles.statValue}>{value}</Text>
        </View>
        <Text style={styles.statTitle}>{title}</Text>
    </View>
)

const AchievementCard = ({ item }) => (
    <View style={[styles.achievementCard, { backgroundColor: item.unlocked ? '#1E293B' : '#0F172A' }]}>
        <Ionicons name={item.icon} size={32} color={item.unlocked ? 'cyan' : '#475569'} />
        <Text style={styles.achievementTitle}>{item.title}</Text>
        <View style={[styles.statusBadge, { backgroundColor: item.unlocked ? 'cyan' : '#334155' }]}>
            <Text style={styles.statusText}>{item.unlocked ? 'Unlocked' : 'Locked'}</Text>
        </View>
    </View>
)

const SettingRow = ({ title, icon, value, onValueChange }) => (
    <View style={styles.settingRow}>
        <View style={styles.row}>
            <Ionicons name={icon} size={20} color="cyan" />
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

            <ScrollView showsVerticalScrollIndicator={false}>

                {/* ── HEADER IMAGE ── */}
                <View style={styles.imageContainer}>
                    <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={22} color="white" />
                    </TouchableOpacity>

                    <ImageBackground source={{ uri: avatarUri }} style={styles.profileImage} resizeMode="cover">
                        <View style={styles.blurOverlay}>

                            <TouchableOpacity style={styles.imageEditIcon} onPress={handlePickImage}>
                                <Ionicons name="create-outline" size={22} color="white" />
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
                                        <TouchableOpacity onPress={handleSaveName}>
                                            <Ionicons name="checkmark" size={22} color="cyan" />
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => setIsEditingName(false)} style={{ marginLeft: 8 }}>
                                            <Ionicons name="close" size={22} color="#94A3B8" />
                                        </TouchableOpacity>
                                    </>
                                ) : (
                                    <>
                                        <Text style={styles.username}>{displayName}</Text>
                                        <TouchableOpacity style={{ marginLeft: 8 }} onPress={() => setIsEditingName(true)}>
                                            <Ionicons name="pencil" size={18} color="white" />
                                        </TouchableOpacity>
                                    </>
                                )}
                            </View>

                            <View style={styles.levelBadge}>
                                <Text style={styles.levelText}>Level {parsedUserInfo.user_level}</Text>
                            </View>

                        </View>
                    </ImageBackground>
                </View>

                {/* ── STATS ── */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Stats</Text>
                    <View style={styles.statsGrid}>
                        <StatCard title="Total Steps" value={parsedUserInfo.total_steps} icon="walk" />
                        <StatCard title="Sweat Coins" value={parsedUserInfo.sweat_coins} icon="flame" />
                        <StatCard title="Territories" value={parsedUserInfo.areas_captured} icon="map" />
                    </View>
                </View>

                {/* ── ACHIEVEMENTS ── */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Achievements</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 12 }}>
                        {ACHIEVEMENTS.map(item => <AchievementCard key={item.id} item={item} />)}
                    </ScrollView>
                </View>

                {/* ── SETTINGS ── */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Settings</Text>
                    <View style={styles.settingsCon}>
                        <SettingRow title="Location Sharing" icon="location" value={settings.location} onValueChange={() => toggleSetting('location')} />
                        <SettingRow title="Privacy Mode" icon="lock-closed" value={settings.privacy} onValueChange={() => toggleSetting('privacy')} />
                        <SettingRow title="Dark Mode" icon="moon" value={settings.darkMode} onValueChange={() => toggleSetting('darkMode')} />
                        <SettingRow title="Notifications" icon="notifications" value={settings.notifications} onValueChange={() => toggleSetting('notifications')} />
                    </View>
                </View>

                {/* ── ACCOUNT ACTIONS ── */}
                <View style={styles.accountActions}>
                    <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                        <Ionicons name="log-out-outline" size={20} color="#0F172A" />
                        <Text style={styles.logoutText}>Logout</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.deleteButton} onPress={() => setDeleteModalVisible(true)}>
                        <Ionicons name="trash-outline" size={20} color="white" />
                        <Text style={styles.deleteText}>Delete Account</Text>
                    </TouchableOpacity>
                </View>

            </ScrollView>

            {/* ── DELETE MODAL ── */}
            <Modal visible={deleteModalVisible} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Ionicons name="warning-outline" size={40} color="#DC2626" />
                        <Text style={styles.modalTitle}>Delete Account?</Text>
                        <Text style={styles.modalText}>This action is permanent and cannot be undone.</Text>
                        <View style={styles.modalButtons}>
                            <TouchableOpacity style={styles.cancelButton} onPress={() => setDeleteModalVisible(false)}>
                                <Text style={styles.cancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.confirmDeleteButton} onPress={handleDeleteAccount}>
                                <Text style={styles.confirmDeleteText}>Delete</Text>
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
    container: { flex: 1, backgroundColor: '#0F172A', position: 'relative', bottom: 20 },
    row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    section: { paddingHorizontal: 16 },
    sectionTitle: { color: 'white', fontSize: 20, fontWeight: 'bold', paddingTop: 20, paddingLeft: 5 },

    // Header
    imageContainer: { width: '100%', height: 260 },
    backButton: { position: 'absolute', top: 20, left: 15, backgroundColor: 'rgba(0,0,0,0.6)', padding: 8, zIndex: 10, borderRadius: 20 },
    profileImage: { width: '100%', height: '100%', justifyContent: 'flex-end' },
    blurOverlay: { width: '100%', height: '100%', padding: 20, justifyContent: 'flex-end' },
    imageEditIcon: { position: 'absolute', top: 20, right: 20, backgroundColor: 'rgba(0,0,0,0.4)', padding: 8, borderRadius: 20 },
    nameRow: { flexDirection: 'row', alignItems: 'center' },
    nameInput: { color: 'white', fontSize: 22, fontWeight: 'bold', borderBottomWidth: 1, borderBottomColor: 'cyan', marginRight: 10, minWidth: 150 },
    username: { color: 'white', fontSize: 24, fontWeight: 'bold' },
    levelBadge: { backgroundColor: '#1E293B', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, marginTop: 8, alignSelf: 'flex-start' },
    levelText: { color: 'cyan', fontWeight: '600' },

    // Stats
    statsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
    statCard: { backgroundColor: '#1E293B', width: '32%', borderRadius: 16, padding: 16 },
    statValue: { color: 'white', fontSize: 18, fontWeight: 'bold' },
    statTitle: { color: '#94A3B8', fontSize: 12, marginTop: 4 },

    // Achievements
    achievementCard: { width: 160, borderRadius: 20, padding: 16, marginRight: 12, justifyContent: 'space-between', elevation: 5 },
    achievementTitle: { color: 'white', fontSize: 13, fontWeight: '600', marginTop: 12 },
    statusBadge: { marginTop: 10, paddingVertical: 4, borderRadius: 12, alignItems: 'center' },
    statusText: { fontSize: 11, fontWeight: '600', color: '#0F172A' },

    // Settings
    settingsCon: { marginTop: 20, backgroundColor: '#1E293B', borderRadius: 20, padding: 16, paddingTop: 0, marginBottom: 40 },
    settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 0.5, borderBottomColor: '#334155' },
    settingText: { color: 'white', fontSize: 14 },

    // Account actions
    accountActions: { paddingHorizontal: 16, marginTop: 5, marginBottom: 60 },
    logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: 'white', paddingVertical: 12, borderRadius: 14, marginBottom: 14 },
    logoutText: { fontWeight: 'bold', color: '#0F172A', fontSize: 14 },
    deleteButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#DC2626', paddingVertical: 12, borderRadius: 14 },
    deleteText: { fontWeight: 'bold', color: 'white', fontSize: 14 },

    // Modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 20 },
    modalContainer: { width: '100%', backgroundColor: '#1E293B', borderRadius: 20, padding: 24, alignItems: 'center' },
    modalTitle: { color: 'white', fontSize: 18, fontWeight: 'bold', marginTop: 12 },
    modalText: { color: '#94A3B8', textAlign: 'center', marginTop: 8, marginBottom: 20 },
    modalButtons: { flexDirection: 'row', gap: 12 },
    cancelButton: { backgroundColor: '#334155', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 12 },
    cancelText: { color: 'white', fontWeight: '600' },
    confirmDeleteButton: { backgroundColor: '#DC2626', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 12 },
    confirmDeleteText: { color: 'white', fontWeight: '600' },
})