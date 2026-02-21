import { StyleSheet, Text, View, TextInput, Image, TouchableOpacity } from 'react-native'
import React from 'react'
import { Ionicons } from '@expo/vector-icons'

export default function Navbar() {
    return (
        <View style={styles.container}>

            {/* Search Box */}
            <View style={styles.searchBox}>
                <Ionicons
                    name="search-outline"
                    size={18}
                    color="#CBD5E1"
                    style={styles.searchIcon}
                />

                <TextInput
                    placeholder="Search location or users"
                    placeholderTextColor="#CBD5E1"
                    style={styles.input}
                />
            </View>


            {/* Profile Image */}
            <TouchableOpacity>
                <Text
                    style={styles.profile}
                >
                    PR
                </Text>
            </TouchableOpacity>

        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 16,
        paddingVertical: 10,
    },

    searchBox: {
        position: 'relative',
        flexDirection: 'row',
        alignItems: 'center',
        height: 42,
        backgroundColor: 'rgba(30, 41, 59, 0.9)',
        borderRadius: 20,
        paddingLeft: 14,
        paddingRight: 52,
    },

    input: {
        flex: 1,
        marginLeft: 8,
        color: '#F8FAFC',
        fontSize: 14,
    },

    profile: {
        position: 'absolute', // 👈 overlay magic
        right: 4,
        top: -38,
        width: 34,
        height: 34,
        borderRadius: 18,
        backgroundColor: 'cyan',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center', 
        textAlignVertical: 'center',
    },

    profileText: {
        color: '#020617',
        fontWeight: 'bold',
        fontSize: 13,
    },
})
