import {
    StyleSheet,
    Text,
    View,
    TextInput,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
} from 'react-native'
import React, { useState, useEffect } from 'react'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { API } from "@/utils/api"
import Toast from 'react-native-toast-message'

export default function Login() {

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [errors, setErrors] = useState({})
    const router = useRouter()

    useEffect(() => {
        const checkUser = async () => {
            const user = await AsyncStorage.getItem('user')
            if (user) {
                router.replace('/home')
            }
        }

        checkUser()
    }, [])

    const handleLogin = async () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        let newErrors = {}

        if (!email) {
            newErrors.email = "Email address is required"
        } else if (!emailRegex.test(email)) {
            newErrors.email = "Please enter a valid email address"
        }

        if (!password) {
            newErrors.password = "Password is required"
        }

        setErrors(newErrors)

        if (Object.keys(newErrors).length > 0) return;

        try {
            const data = await API.post("/api/auth/login", { email, password })

            await AsyncStorage.setItem("access_token", data.access_token)
            await AsyncStorage.setItem("user", JSON.stringify(data.user))

            Toast.show({
                type: "success",
                text1: "Welcome back warrior!",
                text2: "Let's conquer the world."
            });

            router.replace("/home");

        } catch (error) {
            setErrors({ general: "Invalid email or password. Please try again." })
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />

            <LinearGradient
                colors={['#0F172A', '#111827', '#1E293B']}
                style={styles.gradient}
            >

                {/* Logo / Title */}
                <View style={styles.header}>
                    <Ionicons name="flash" size={48} color="cyan" />
                    <Text style={styles.title}>Tera<Text style={{ color: 'cyan' }}>Clash</Text></Text>
                    <Text style={styles.subtitle}>
                        Welcome back, warrior!
                    </Text>
                </View>

                {/* Form */}
                <View style={styles.form}>

                    {/* General Error */}
                    {errors.general && (
                        <Text style={styles.errorText}>{errors.general}</Text>
                    )}

                    {/* EMAIL */}
                    <Text style={styles.label}>Email Address</Text>
                    <View style={[styles.inputContainer, errors.email && styles.inputError]}>
                        <Ionicons name="mail" size={20} color="cyan" />
                        <TextInput
                            placeholder="example@gmail.com"
                            placeholderTextColor="#64748B"
                            style={styles.input}
                            value={email}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                            textContentType="emailAddress"
                            autoComplete="email"
                            onChangeText={setEmail}
                        />
                    </View>
                    {errors.email && (
                        <Text style={styles.fieldError}>{errors.email}</Text>
                    )}

                    {/* PASSWORD */}
                    <Text style={styles.label}>Password</Text>
                    <View style={[styles.inputContainer, errors.password && styles.inputError]}>
                        <Ionicons name="lock-closed" size={20} color="cyan" />
                        <TextInput
                            placeholder="••••••••"
                            placeholderTextColor="#64748B"
                            secureTextEntry
                            style={styles.input}
                            value={password}
                            onChangeText={setPassword}
                        />
                    </View>
                    {errors.password && (
                        <Text style={styles.fieldError}>{errors.password}</Text>
                    )}

                    {/* Login Button */}
                    <TouchableOpacity
                        style={styles.loginButton}
                        onPress={handleLogin}
                    >
                        <Text style={styles.loginText}>ENTER ARENA</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
                        <Text style={styles.signupText}>
                            New warrior? <Text style={{ color: 'cyan' }}>Create Account</Text>
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
        marginBottom: 50
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
        marginLeft: 4,
        fontWeight: '500'
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1E293B',
        borderRadius: 14,
        paddingHorizontal: 14,
        paddingVertical: 8,
        marginBottom: 4,
        borderWidth: 1,
        borderColor: 'transparent'
    },
    inputError: {
        borderColor: '#EF4444'
    },
    input: {
        flex: 1,
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
    },
    fieldError: {
        color: '#EF4444',
        fontSize: 11,
        marginLeft: 4,
        marginBottom: 8,
        marginTop: -2
    }
})