import {
    StyleSheet,
    Text,
    View,
    TextInput,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
} from 'react-native'
import React, { useState } from 'react'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'

export default function SignUp() {

    const [form, setForm] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: ''
    })

    const [error, setError] = useState('')
    const router = useRouter()

    const handleChange = (key, value) => {
        setForm(prev => ({
            ...prev,
            [key]: value
        }))
    }

    const handleSignUp = () => {
        const { firstName, lastName, email, password, confirmPassword } = form

        if (!firstName || !lastName || !email || !password || !confirmPassword) {
            setError('All fields are required')
            return
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters')
            return
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match')
            return
        }

        setError('')
        router.replace('/home')
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />

            <LinearGradient
                colors={['#0F172A', '#111827', '#1E293B']}
                style={styles.gradient}
            >

                {/* Header */}
                <View style={styles.header}>
                    <Ionicons name="flash" size={48} color="cyan" />
                    <Text style={styles.title}>
                        Tera<Text style={{ color: 'cyan' }}>Clash</Text>
                    </Text>
                    <Text style={styles.subtitle}>
                        Track. Compete. Conquer.
                    </Text>
                </View>

                {/* Form */}
                <View style={styles.form}>

                    {/* First + Last Name Row */}
                    <View style={styles.row}>
                        <View style={styles.halfField}>
                            <Text style={styles.label}>First Name</Text>
                            <View style={styles.inputContainer}>
                                <Ionicons name="person" size={20} color="cyan" />
                                <TextInput
                                    placeholder="e.g. John"
                                    placeholderTextColor="#64748B"
                                    style={styles.input}
                                    value={form.firstName}
                                    onChangeText={(text) => handleChange('firstName', text)}
                                />
                            </View>
                        </View>

                        <View style={styles.halfField}>
                            <Text style={styles.label}>Last Name</Text>
                            <View style={styles.inputContainer}>
                                <Ionicons name="person-outline" size={20} color="cyan" />
                                <TextInput
                                    placeholder="e.g. Carter"
                                    placeholderTextColor="#64748B"
                                    style={styles.input}
                                    value={form.lastName}
                                    onChangeText={(text) => handleChange('lastName', text)}
                                />
                            </View>
                        </View>
                    </View>

                    {/* Email */}
                    <Text style={styles.label}>Email Address</Text>
                    <View style={styles.inputContainer}>
                        <Ionicons name="mail" size={20} color="cyan" />
                        <TextInput
                            placeholder="e.g. john@email.com"
                            placeholderTextColor="#64748B"
                            style={styles.input}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            value={form.email}
                            onChangeText={(text) => handleChange('email', text)}
                        />
                    </View>

                    {/* Password */}
                    <Text style={styles.label}>Password</Text>
                    <View style={styles.inputContainer}>
                        <Ionicons name="lock-closed" size={20} color="cyan" />
                        <TextInput
                            placeholder="Minimum 6 characters"
                            placeholderTextColor="#64748B"
                            secureTextEntry
                            style={styles.input}
                            value={form.password}
                            onChangeText={(text) => handleChange('password', text)}
                        />
                    </View>

                    {/* Confirm Password */}
                    <Text style={styles.label}>Confirm Password</Text>
                    <View style={styles.inputContainer}>
                        <Ionicons name="lock-closed-outline" size={20} color="cyan" />
                        <TextInput
                            placeholder="Re-enter password"
                            placeholderTextColor="#64748B"
                            secureTextEntry
                            style={styles.input}
                            value={form.confirmPassword}
                            onChangeText={(text) => handleChange('confirmPassword', text)}
                        />
                    </View>

                    {/* Error */}
                    {error ? (
                        <Text style={styles.errorText}>{error}</Text>
                    ) : null}

                    {/* Button */}
                    <TouchableOpacity
                        style={styles.loginButton}
                        onPress={handleSignUp}
                    >
                        <Text style={styles.loginText}>START CAREER</Text>
                    </TouchableOpacity>

                    {/* Navigate to Login */}
                    <TouchableOpacity
                        onPress={() => router.push('/(auth)/login')}
                    >
                        <Text style={styles.signupText}>
                            Already a warrior? <Text style={{ color: 'cyan' }}>Login</Text>
                        </Text>
                    </TouchableOpacity>

                </View>

            </LinearGradient>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0F172A'
    },
    gradient: {
        flex: 1,
        paddingHorizontal: 24,
        justifyContent: 'center'
    },
    header: {
        alignItems: 'center',
        marginBottom: 30
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: 'white',
        marginTop: 10
    },
    subtitle: {
        color: '#94A3B8',
        marginTop: 6
    },
    form: {
        width: '100%'
    },
    label: {
        color: '#CBD5E1',
        fontSize: 13,
        marginBottom: 6,
        marginLeft: 4
    },

    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12
    },

    halfField: {
        flex: 1
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1E293B',
        borderRadius: 14,
        paddingHorizontal: 14,
        paddingVertical: 8,
        marginBottom: 16
    },
    input: {
        color: 'white',
        marginLeft: 10
    },
    loginButton: {
        backgroundColor: 'cyan',
        paddingVertical: 8,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
        shadowColor: 'cyan',
        shadowOpacity: 0.6,
        shadowRadius: 8,
        elevation: 6
    },
    loginText: {
        fontWeight: 'bold',
        color: '#0F172A',
        fontSize: 16
    },
    signupText: {
        marginTop: 20,
        textAlign: 'center',
        color: '#94A3B8'
    },
    errorText: {
        color: '#EF4444',
        textAlign: 'center',
        marginBottom: 10,
        fontSize: 13
    }
})