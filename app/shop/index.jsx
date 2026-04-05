import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    Modal,
    StatusBar,
    ScrollView,
    Dimensions
} from 'react-native'
import React, {useContext} from 'react'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@react-navigation/native'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import BottomBar from '@/components/bottomBar';
import { AppDataContext } from '../context/AppDataProvider';
import Navbar from '@/components/navbar';

const { width } = Dimensions.get('window')

export default function index() {
    const {
            user,
            setUser,
            userInfo,
            userLocation,
            setUserLocation,
            userFlags,
        } = useContext(AppDataContext);
    
    const router = useRouter();

    const { colors } = useTheme();

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
        // Use cyan as the primary app color for all powerup accents
        return 'cyan'
    }

    const PowerupCard = ({ powerup }) => (
        <View
            style={styles.powerupCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
        >
            <View style={styles.cardHeader}>
                <View style={[styles.iconContainer, { backgroundColor: `${powerup.color}20` }]}>
                    <Ionicons name={powerup.icon} size={24} color="cyan" />
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
                    <Ionicons name="information-circle-outline" size={20} color="#94a3b8" />
                </TouchableOpacity>
            </View>

            <View style={styles.cardFooter}>
                <View style={styles.priceContainer}>
                    <View style={styles.coinIcon}>
                        <Ionicons name="flame" size={12} color="#facc15" />
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
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 6 }}>
                        <Text style={styles.buyText}>
                            {powerup.inStock === 0 ? 'Sold Out' : 'Purchase'}
                        </Text>
                        {powerup.inStock > 0 && (
                            <Ionicons name="cart-outline" size={14} />
                        )}
                    </View>
                </TouchableOpacity>
            </View>
        </View>
    )

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar style="light" translucent backgroundColor="transparent" hidden />
            <View style={styles.floatingHead}>
            <Navbar userInfo={userInfo} />
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
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
                                size={14}
                                color={'#94a3b8'}
                                style={filter === item.id && { color: 'cyan' }}
                            />
                            <Text style={[
                                styles.filterText,
                                filter === item.id && styles.activeFilterText
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
                        <Ionicons name="cube-outline" size={56} color="#334155" />
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
                            <LinearGradient
                                colors={[getTypeColor(selectedPowerup?.type || 'defensive'), '#0ea5e9']}
                                style={styles.modalIconGradient}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                            >
                                <Ionicons name={selectedPowerup?.icon} size={40} color="#fff" />
                            </LinearGradient>
                        </View>

                        <Text style={styles.modalTitle}>
                            {selectedPowerup?.name}
                        </Text>

                        <Text style={styles.modalDescription}>
                            {selectedPowerup?.description}
                        </Text>

                        <View style={styles.modalDetails}>
                            <View style={styles.modalDetailItem}>
                                <Ionicons name="flame" size={14} color="#facc15" />
                                <Text style={styles.modalDetailText}>
                                    {selectedPowerup?.price}
                                </Text>
                            </View>
                            <View style={styles.modalDetailItem}>
                                <Ionicons name="cube-outline" size={14} color="#94a3b8" />
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
        paddingTop: 70,
        paddingBottom: 30,
    },
    filterContainer: {
        flexDirection: "row",
        justifyContent: "center",
        marginHorizontal: 20,
        marginBottom: 15,
        gap: 12,
        backgroundColor: '#1e293b',
        borderRadius: 12,
        padding: 4,
        marginTop: 15,
    },
    filterBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 8,
        borderRadius: 10,
        backgroundColor: 'transparent',
    },
    activeFilter: {
        borderWidth: 1,
        borderColor: 'cyan',
    },
    filterText: {
        fontWeight: "600",
        fontSize: 12,
        color: '#94a3b8'
    },
    activeFilterText: {
        color: 'cyan',
        fontWeight: '700',
    },
    powerupsContainer: {
        paddingHorizontal: 16,
        gap: 14,
    },
    powerupCard: {
        borderRadius: 18,
        padding: 14,
        borderWidth: 1,
        borderColor: '#2d3a4e',
        backgroundColor: '#1e293b',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    headerInfo: {
        flex: 1,
    },
    powerupName: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 4,
    },
    typeBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 5,
    },
    typeText: {
        fontSize: 9,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    infoButton: {
        padding: 5,
    },
    powerupDescription: {
        color: '#94a3b8',
        fontSize: 12,
        lineHeight: 17,
        marginBottom: 14,
    },
    cardFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 10,
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        backgroundColor: 'rgba(0,0,0,0.3)',
        paddingHorizontal: 8,
        paddingVertical: 5,
        borderRadius: 10,
    },
    coinIcon: {
        backgroundColor: 'rgba(250,204,21,0.2)',
        padding: 3,
        borderRadius: 7,
    },
    powerupPrice: {
        color: '#facc15',
        fontSize: 14,
        fontWeight: 'bold',
    },
    priceLabel: {
        color: '#64748b',
        fontSize: 10,
    },
    stockContainer: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 7,
    },
    stockText: {
        color: '#94a3b8',
        fontSize: 10,
    },
    buyButton: {
        borderRadius: 10,
        overflow: 'hidden',
        backgroundColor: 'cyan',
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
        paddingHorizontal: 16,
        paddingVertical: 6,
    },
    soldOutButton: {
        opacity: 0.8,
        backgroundColor: '#475569',
    },
    buyText: {
        fontWeight: '700',
        fontSize: 12,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 50,
        marginHorizontal: 20,
    },
    emptyStateTitle: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        marginTop: 14,
        marginBottom: 6,
    },
    emptyStateText: {
        color: '#64748b',
        fontSize: 12,
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
        borderRadius: 22,
        padding: 20,
        width: '100%',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#2d3a4e',
    },
    modalIconContainer: {
        marginBottom: 14,
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
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 6,
        textAlign: 'center',
    },
    modalDescription: {
        color: '#94a3b8',
        textAlign: 'center',
        fontSize: 13,
        lineHeight: 19,
        marginBottom: 18,
    },
    modalDetails: {
        flexDirection: 'row',
        gap: 14,
        marginBottom: 20,
        paddingVertical: 10,
        paddingHorizontal: 14,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 10,
    },
    modalDetailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    modalDetailText: {
        color: '#e2e8f0',
        fontSize: 12,
        fontWeight: '500',
    },
    closeBtn: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        paddingHorizontal: 28,
        paddingVertical: 10,
        borderRadius: 10,
        minWidth: 100,
        alignItems: 'center',
    },
    closeBtnText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 13,
    },
    floatingHead: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
})