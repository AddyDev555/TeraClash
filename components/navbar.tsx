import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import React from 'react'
import { Ionicons } from '@expo/vector-icons'

export default function Navbar() {
    return (
        <View style={styles.container}>
            
            {/* Profile */}
            <TouchableOpacity style={styles.profile}>
                <Text style={styles.profileText}>
                    PR
                </Text>
            </TouchableOpacity>

            {/* Sweats Currency */}
            <TouchableOpacity style={styles.sweatsContainer}>
                <Ionicons name="flame" size={16} color="#facc15" />
                <Text style={styles.sweatsText}>
                    100
                </Text>
            </TouchableOpacity>

        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        paddingTop: 5,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'rgba(30, 41, 59)',
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
})