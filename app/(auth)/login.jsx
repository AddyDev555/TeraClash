import {
    StyleSheet,
    Text,
    View,
    TextInput,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    Image,
} from 'react-native'
import React, { useState } from 'react'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'

export default function Login() {

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const router = useRouter()

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
                    <View style={styles.inputContainer}>
                        <Ionicons name="mail" size={20} color="cyan" />
                        <TextInput
                            placeholder="Email"
                            placeholderTextColor="#64748B"
                            style={styles.input}
                            value={email}
                            onChangeText={setEmail}
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Ionicons name="lock-closed" size={20} color="cyan" />
                        <TextInput
                            placeholder="Password"
                            placeholderTextColor="#64748B"
                            secureTextEntry
                            style={styles.input}
                            value={password}
                            onChangeText={setPassword}
                        />
                    </View>

                    {/* Login Button */}
                    <TouchableOpacity
                        style={styles.loginButton}
                        onPress={() => router.replace('/home')}
                    >
                        <Text style={styles.loginText}>ENTER ARENA</Text>
                    </TouchableOpacity>

                    {/* Divider */}
                    {/* <View style={styles.dividerContainer}>
                        <View style={styles.divider} />
                        <Text style={styles.orText}>OR</Text>
                        <View style={styles.divider} />
                    </View> */}

                    {/* Social Buttons */}
                    {/* <View style={styles.socialRow}>
                        <TouchableOpacity style={styles.socialBtn}>
                            <Ionicons name="logo-google" size={20} color="white" />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.socialBtn}>
                            <Ionicons name="logo-apple" size={20} color="white" />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.socialBtn}>
                            <Ionicons name="logo-facebook" size={20} color="white" />
                        </TouchableOpacity>
                    </View> */}

                    <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
                        <Text style={styles.signupText}>New warrior? <Text style={{ color: 'cyan' }}>Create Account</Text></Text>
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
    }
})