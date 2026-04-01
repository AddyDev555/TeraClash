import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    Modal,
    Image,
    ScrollView,
    Dimensions
} from 'react-native'
import React from 'react'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import BottomBar from '@/components/bottomBar'

const { width } = Dimensions.get('window')

export default function index() {
    const router = useRouter();

    const [selectedPowerup, setSelectedPowerup] = React.useState(null);
    const [modalVisible, setModalVisible] = React.useState(false);
    const [filter, setFilter] = React.useState("all");

    const [powerups, setPowerups] = React.useState([
        {
            id: 1,
            name: 'Gods Shield',
            description: 'Warriors cant take over your Areas for 24 hours.',
            price: 50,
            inStock: 10,
            icon: 'shield',
            type: 'defensive',
        },
        {
            id: 2,
            name: 'Sweat Boost',
            description: 'Earn 50% more sweat coins for 24 hours.',
            price: 30,
            inStock: 0,
            icon: 'flash',
            type: 'attacking',
        },
        {
            id: 3,
            name: 'Double XP',
            description: 'Double experience points for 12 hours.',
            price: 40,
            inStock: 5,
            icon: 'trending-up',
            type: 'attacking',
        },
        {
            id: 4,
            name: 'Stealth Mode',
            description: 'Hide your territory captures from leaderboard.',
            price: 25,
            inStock: 3,
            icon: 'eye-off',
            type: 'defensive',
        }
    ])

    const openInfo = (powerup) => {
        setSelectedPowerup(powerup)
        setModalVisible(true)
    }

    const filteredPowerups =
        filter === "all"
            ? powerups
            : powerups.filter((p) => p.type === filter)

    const getTypeColor = (type) => {
        return type === 'defensive' ? '#3b82f6' : '#f59e0b'
    }

    const PowerupCard = ({ powerup }) => (
        <LinearGradient
            colors={['#1e293b', '#0f172a']}
            style={styles.powerupCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
        >
            <View style={styles.cardHeader}>
                <View style={[styles.iconContainer, { backgroundColor: `${powerup.color}20` }]}>
                    <Ionicons name={powerup.icon} size={28} color="#fff" />
                </View>
                <View style={styles.headerInfo}>
                    <Text style={styles.powerupName}>{powerup.name}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <View style={[styles.typeBadge, { backgroundColor: `${getTypeColor(powerup.type)}20` }]}>
                            <Text style={[styles.typeText, { color: getTypeColor(powerup.type) }]}>
                                {powerup.type.toUpperCase()}
                            </Text>
                        </View>
                        <View style={styles.stockContainer}>
                            <Text style={styles.stockText}>
                                {powerup.inStock > 0 ? `${powerup.inStock} left` : 'Out of stock'}
                            </Text>
                        </View>
                    </View>
                </View>
                <TouchableOpacity
                    style={styles.infoButton}
                    onPress={() => openInfo(powerup)}
                >
                    <Ionicons name="information-circle-outline" size={22} color="#94a3b8" />
                </TouchableOpacity>
            </View>

            <View style={styles.cardFooter}>
                <View style={styles.priceContainer}>
                    <View style={styles.coinIcon}>
                        <Ionicons name="flame" size={14} color="#facc15" />
                    </View>
                    <Text style={styles.powerupPrice}>{powerup.price}</Text>
                </View>

                <TouchableOpacity
                    style={[
                        styles.buyButton,
                        powerup.inStock === 0 && styles.soldOutButton,
                    ]}
                    disabled={powerup.inStock === 0}
                >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 20, paddingVertical: 8 }}>
                        <Text style={styles.buyText}>
                            {powerup.inStock === 0 ? 'Sold Out' : 'Purchase'}
                        </Text>
                        {powerup.inStock > 0 && (
                            <Ionicons name="cart-outline" size={16} color="#fff" />
                        )}
                    </View>
                </TouchableOpacity>
            </View>
        </LinearGradient>
    )

    return (
        <View style={styles.container}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerTop}>
                        <Text style={styles.headerTitle}>Powerups</Text>
                        <View style={styles.sweatsContainer}>
                            <View
                                style={styles.sweatsGradient}
                            >
                                <Ionicons name="flame" size={16} color="#facc15" />
                                <Text style={styles.sweatsText}>1,250</Text>
                            </View>
                        </View>
                    </View>
                    <Text style={styles.headerSubtitle}>
                        Boost your gameplay with special powerups
                    </Text>
                </View>

                {/* Filter Tabs */}
                <View style={styles.filterContainer}>
                    {[
                        { id: 'all', label: 'All', icon: 'apps-outline' },
                        { id: 'defensive', label: 'Defensive', icon: 'shield-outline' },
                        { id: 'attacking', label: 'Attacking', icon: 'flash-outline' }
                    ].map((item) => (
                        <TouchableOpacity
                            key={item.id}
                            style={[
                                styles.filterBtn,
                                filter === item.id && styles.activeFilter
                            ]}
                            onPress={() => setFilter(item.id)}
                        >
                            <Ionicons
                                name={item.icon}
                                size={16}
                                color={'#94a3b8'}
                            />
                            <Text style={[
                                styles.filterText,
                                { color: '#94a3b8'}
                            ]}>
                                {item.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Powerups Grid */}
                <View style={styles.powerupsContainer}>
                    {filteredPowerups.map((powerup) => (
                        <PowerupCard key={powerup.id} powerup={powerup} />
                    ))}
                </View>

                {/* Empty State */}
                {filteredPowerups.length === 0 && (
                    <View style={styles.emptyState}>
                        <Ionicons name="cube-outline" size={64} color="#334155" />
                        <Text style={styles.emptyStateTitle}>No powerups found</Text>
                        <Text style={styles.emptyStateText}>
                            Try changing your filter or check back later
                        </Text>
                    </View>
                )}

                <View style={styles.bottomPadding} />
            </ScrollView>

            {/* Info Modal */}
            <Modal visible={modalVisible} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <LinearGradient
                        colors={['#1e293b', '#0f172a']}
                        style={styles.modalCard}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <View style={styles.modalIconContainer}>
                            <Ionicons
                                name={selectedPowerup?.icon}
                                size={48}
                                color="#fff"
                            />
                        </View>

                        <Text style={styles.modalTitle}>
                            {selectedPowerup?.name}
                        </Text>

                        <Text style={styles.modalDescription}>
                            {selectedPowerup?.description}
                        </Text>

                        <View style={styles.modalDetails}>
                            <View style={styles.modalDetailItem}>
                                <Ionicons name="flame" size={16} color="#facc15" />
                                <Text style={styles.modalDetailText}>
                                    {selectedPowerup?.price}
                                </Text>
                            </View>
                            <View style={styles.modalDetailItem}>
                                <Ionicons name="cube-outline" size={16} color="#94a3b8" />
                                <Text style={styles.modalDetailText}>
                                    {selectedPowerup?.inStock > 0 ? `${selectedPowerup?.inStock} available` : 'Out of stock'}
                                </Text>
                            </View>
                        </View>

                        <TouchableOpacity
                            style={styles.closeBtn}
                            onPress={() => setModalVisible(false)}
                        >
                            <Text style={styles.closeBtnText}>Got it</Text>
                        </TouchableOpacity>
                    </LinearGradient>
                </View>
            </Modal>

            <BottomBar />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a0f1a',
    },
    scrollContent: {
        paddingBottom: 30,
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 16,
        backgroundColor: '#0a0f1a',
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
        marginTop: 30,
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: '700',
        color: '#fff',
        letterSpacing: -0.5,
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#64748b',
        letterSpacing: -0.3,
    },
    sweatsContainer: {
        borderRadius: 20,
        overflow: 'hidden',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 4,
    },
    sweatsGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 8,
        gap: 6,
    },
    sweatsText: {
        color: '#facc15',
        fontWeight: 'bold',
        fontSize: 14,
    },
    filterContainer: {
        flexDirection: "row",
        justifyContent: "center",
        marginHorizontal: 20,
        marginBottom: 20,
        gap: 12,
        backgroundColor: '#1e293b',
        borderRadius: 12,
        padding: 4,
    },
    filterBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 10,
        borderRadius: 10,
        backgroundColor: 'transparent',
    },
    activeFilter: {
        borderWidth: 1,
        borderColor: '#3b82f6',
    },
    filterText: {
        fontWeight: "600",
        color: '#94a3b8',
        fontSize: 13,
    },
    powerupsContainer: {
        paddingHorizontal: 16,
        gap: 16,
    },
    powerupCard: {
        borderRadius: 20,
        padding: 16,
        borderWidth: 1,
        borderColor: '#2d3a4e',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    iconContainer: {
        width: 52,
        height: 52,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    headerInfo: {
        flex: 1,
    },
    powerupName: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 4,
    },
    typeBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
    },
    typeText: {
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    infoButton: {
        padding: 6,
    },
    powerupDescription: {
        color: '#94a3b8',
        fontSize: 13,
        lineHeight: 18,
        marginBottom: 16,
    },
    cardFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: 'rgba(0,0,0,0.3)',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
    },
    coinIcon: {
        backgroundColor: 'rgba(250,204,21,0.2)',
        padding: 4,
        borderRadius: 8,
    },
    powerupPrice: {
        color: '#facc15',
        fontSize: 16,
        fontWeight: 'bold',
    },
    priceLabel: {
        color: '#64748b',
        fontSize: 11,
    },
    stockContainer: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 8,
    },
    stockText: {
        color: '#94a3b8',
        fontSize: 11,
    },
    buyButton: {
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 2,
    },
    buyGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingHorizontal: 20,
        paddingVertical: 8,
    },
    soldOutButton: {
        opacity: 0.8,
    },
    buyText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 13,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
        marginHorizontal: 20,
    },
    emptyStateTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
        marginTop: 16,
        marginBottom: 8,
    },
    emptyStateText: {
        color: '#64748b',
        fontSize: 14,
        textAlign: 'center',
    },
    bottomPadding: {
        height: 20,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.8)',
        padding: 20,
    },
    modalCard: {
        borderRadius: 24,
        padding: 24,
        width: '100%',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#2d3a4e',
    },
    modalIconContainer: {
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    modalIconGradient: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalTitle: {
        color: '#fff',
        fontSize: 24,
        fontWeight: '700',
        marginBottom: 8,
        textAlign: 'center',
    },
    modalDescription: {
        color: '#94a3b8',
        textAlign: 'center',
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 20,
    },
    modalDetails: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 24,
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 12,
    },
    modalDetailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    modalDetailText: {
        color: '#e2e8f0',
        fontSize: 13,
        fontWeight: '500',
    },
    closeBtn: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        paddingHorizontal: 32,
        paddingVertical: 12,
        borderRadius: 12,
        minWidth: 120,
        alignItems: 'center',
    },
    closeBtnText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 14,
    },
})