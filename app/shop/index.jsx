import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    Modal,
    Image
} from 'react-native'
import React from 'react'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'

export default function index() {
    const router = useRouter();

    const [selectedPowerup, setSelectedPowerup] = React.useState(null);
    const [modalVisible, setModalVisible] = React.useState(false);
    const [filter, setFilter] = React.useState("all");

    const [powerups, setPowerups] = React.useState([
        {
            id: 1,
            name: 'Gods Shield',
            description: 'Warriors cant take over your Areas.',
            price: 50,
            inStock: 10,
            icon: 'shield',
            type: 'defensive'
        },
        {
            id: 2,
            name: 'Sweat Boost',
            description: 'Earn 50% more sweat coins for 24 hours.',
            price: 30,
            inStock: 0,
            icon: 'flash',
            type: 'attacking'
        },
    ])

    const openInfo = (powerup) => {
        setSelectedPowerup(powerup)
        setModalVisible(true)
    }

    const filteredPowerups =
        filter === "all"
            ? powerups
            : powerups.filter((p) => p.type === filter)

    return (
        <View style={styles.container}>

            {/* NAVBAR */}
            <View style={styles.navbar}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={22} color="white" />
                    </TouchableOpacity>

                    <Text style={styles.navbarHeader}>Powerups Shop</Text>
                </View>

                <View style={styles.sweatsContainer}>
                    <Ionicons name="flame" size={16} color="#facc15" />
                    <Text style={styles.sweatsText}>10</Text>
                </View>
            </View>

            <View style={styles.filterContainer}>

                <TouchableOpacity
                    style={[styles.filterBtn, filter === "all" && styles.activeFilter]}
                    onPress={() => setFilter("all")}
                >
                    <Text style={[styles.filterText, { color: filter === "all" ? "black" : "white" }]}>
                        All
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.filterBtn, filter === "defensive" && styles.activeFilter]}
                    onPress={() => setFilter("defensive")}
                >
                    <Text style={[styles.filterText, { color: filter === "defensive" ? "black" : "white" }]}>
                        Defensive
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.filterBtn, filter === "attacking" && styles.activeFilter]}
                    onPress={() => setFilter("attacking")}
                >
                    <Text style={[styles.filterText, { color: filter === "attacking" ? "black" : "white" }]}>
                        Attacking
                    </Text>
                </TouchableOpacity>

            </View>


            {/* POWERUPS */}
            <View>
                {filteredPowerups.map((powerup) => (
                    <View key={powerup.id} style={styles.powerupCard}>

                        {/* Icon + Name */}
                        <View style={styles.headerRow}>
                            <Ionicons name={powerup.icon} size={26} color="#22d3ee" />
                            <Text style={styles.powerupName}>{powerup.name}</Text>

                            <TouchableOpacity
                                style={{ marginLeft: 'auto' }}
                                onPress={() => openInfo(powerup)}
                            >
                                <Ionicons name="information-circle-outline" size={22} color="#cbd5e1" />
                            </TouchableOpacity>
                        </View>


                        {/* Price + Buy */}
                        <View style={styles.bottomRow}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                <Ionicons name="flame" size={16} color="#facc15" />
                                <Text style={styles.powerupPrice}>
                                    {powerup.price}
                                </Text>
                            </View>

                            <TouchableOpacity
                                style={[
                                    styles.buyButton,
                                    powerup.inStock === 0 && styles.soldOutButton
                                ]}
                                disabled={powerup.inStock === 0}
                            >

                                {powerup.inStock === 0 ? (
                                    <Text style={styles.buyText}>Sold Out</Text>
                                ) : (
                                    <Text style={styles.buyText}>Buy</Text>
                                )}

                            </TouchableOpacity>

                        </View>
                    </View>
                ))}
            </View>


            {/* INFO MODAL */}
            <Modal visible={modalVisible} transparent animationType="fade">

                <View style={styles.modalOverlay}>

                    <View style={styles.modalCard}>

                        <Ionicons
                            name={selectedPowerup?.icon}
                            size={40}
                            color="#22d3ee"
                        />

                        <Text style={styles.modalTitle}>
                            {selectedPowerup?.name}
                        </Text>

                        <Text style={styles.modalDescription}>
                            {selectedPowerup?.description}
                        </Text>

                        <TouchableOpacity
                            style={styles.closeBtn}
                            onPress={() => setModalVisible(false)}
                        >
                            <Text style={{ fontWeight: "bold" }}>Close</Text>
                        </TouchableOpacity>

                    </View>

                </View>

            </Modal>

        </View>
    )
}

const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: '#0F172A',
    },

    navbar: {
        marginTop: 20,
        padding: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    navbarHeader: {
        color: '#fff',
        fontSize: 20,
        marginLeft: 10,
        fontWeight: 'bold',
    },

    backButton: {
        padding: 8,
        borderRadius: 20
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
    },

    sweatsText: {
        color: '#facc15',
        fontWeight: 'bold',
        fontSize: 14,
        marginLeft: 6,
    },

    filterContainer: {
        flexDirection: "row",
        justifyContent: "center",
        marginBottom: 15,
        gap: 10
    },

    filterBtn: {
        paddingVertical: 6,
        paddingHorizontal: 14,
        borderRadius: 10,
        backgroundColor: "#1e293b",
        borderWidth: 1,
        borderColor: "#334155"
    },

    activeFilter: {
        backgroundColor: "cyan"
    },

    filterText: {
        fontWeight: "600"
    },


    powerupCard: {
        backgroundColor: '#1e293b',
        padding: 15,
        borderRadius: 10,
        marginBottom: 15,
        marginHorizontal: 20,
    },

    headerRow: {
        flexDirection: 'row',
        alignItems: 'center'
    },

    powerupName: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 10
    },

    bottomRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 15
    },

    powerupPrice: {
        color: '#facc15',
        fontSize: 16,
        fontWeight: 'bold',
    },

    buyButton: {
        backgroundColor: 'cyan',
        paddingVertical: 8,
        paddingHorizontal: 20,
        borderRadius: 6,
    },

    soldOutButton: {
        backgroundColor: '#ef4444'
    },

    buyText: {
        fontWeight: 'bold'
    },


    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.7)'
    },

    modalCard: {
        backgroundColor: '#1e293b',
        padding: 25,
        borderRadius: 12,
        width: '80%',
        alignItems: 'center'
    },

    modalTitle: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 10
    },

    modalDescription: {
        color: '#cbd5e1',
        textAlign: 'center',
        marginTop: 10
    },

    closeBtn: {
        backgroundColor: '#22d3ee',
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 6,
        marginTop: 20
    }

})