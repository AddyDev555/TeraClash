import {
    StyleSheet,
    Text,
    View,
    TextInput,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    Modal,
    ScrollView,
    Image
} from 'react-native'
import React, { useState } from 'react'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API } from "@/utils/api"
import Toast from 'react-native-toast-message'

export default function SignUp() {

    const [form, setForm] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: ''
    })

    const [acceptedPolicy, setAcceptedPolicy] = useState(false)
    const [showPolicy, setShowPolicy] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    const [errors, setErrors] = useState({})
    const router = useRouter()

    const handleChange = (key, value) => {
        setForm(prev => ({
            ...prev,
            [key]: value
        }))
    }

    const handleSignUp = async () => {
        const { firstName, lastName, email, password, confirmPassword } = form;

        let newErrors = {}

        if (!firstName) {
            newErrors.firstName = "First name is required"
        }

        if (!lastName) {
            newErrors.lastName = "Last name is required"
        }

        if (!email) {
            newErrors.email = "Email address is required"
        }

        if (!password) {
            newErrors.password = "Password is required"
        } else if (password.length < 6) {
            newErrors.password = "Password must be at least 6 characters"
        }

        if (!confirmPassword) {
            newErrors.confirmPassword = "Confirm your password"
        } else if (password !== confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match"
        }

        if (!acceptedPolicy) {
            newErrors.policy = "You must accept the Privacy Policy"
        }

        setErrors(newErrors)

        if (Object.keys(newErrors).length > 0) return;

        try {

            const data = await API.post("/api/auth/signup", {
                firstName,
                lastName,
                email,
                password,
            })

            await AsyncStorage.setItem("access_token", data.access_token)
            await AsyncStorage.setItem("user", JSON.stringify(data.user))

            Toast.show({
                type: "success",
                text1: "Your career begins Warrior!",
                text2: "Let's conquer the world."
            });

            router.replace("/home")

        } catch (error) {
            setErrors({ general: "Server error. Please try again." })
        }
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
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Image source={require('@/assets/images/Logo.png')} style={styles.logo} />
                        <Text style={styles.title}>
                            Tera<Text style={{ color: 'cyan' }}>Clash</Text>
                        </Text>
                    </View>
                    <Text style={styles.subtitle}>
                        Track. Compete. Conquer.
                    </Text>
                </View>

                {/* Form */}
                <View style={styles.form}>

                    {/* General Error */}
                    {errors.general && (
                        <Text style={styles.errorText}>{errors.general}</Text>
                    )}

                    {/* First + Last Name Row */}
                    <View style={styles.row}>
                        <View style={styles.halfField}>
                            <Text style={styles.label}>First Name</Text>
                            <View style={[styles.inputContainer, errors.firstName && styles.inputError]}>
                                <Ionicons name="person" size={20} color="cyan" />
                                <TextInput
                                    placeholder="e.g. John"
                                    placeholderTextColor="#64748B"
                                    style={styles.input}
                                    value={form.firstName}
                                    onChangeText={(text) => handleChange('firstName', text)}
                                />
                            </View>
                            {errors.firstName && (
                                <Text style={styles.fieldError}>{errors.firstName}</Text>
                            )}
                        </View>

                        <View style={styles.halfField}>
                            <Text style={styles.label}>Last Name</Text>
                            <View style={[styles.inputContainer, errors.lastName && styles.inputError]}>
                                <Ionicons name="person-outline" size={20} color="cyan" />
                                <TextInput
                                    placeholder="e.g. Carter"
                                    placeholderTextColor="#64748B"
                                    style={styles.input}
                                    value={form.lastName}
                                    onChangeText={(text) => handleChange('lastName', text)}
                                />
                            </View>
                            {errors.lastName && (
                                <Text style={styles.fieldError}>{errors.lastName}</Text>
                            )}
                        </View>
                    </View>

                    {/* Email */}
                    <Text style={styles.label}>Email Address</Text>
                    <View style={[styles.inputContainer, errors.email && styles.inputError]}>
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
                    {errors.email && (
                        <Text style={styles.fieldError}>{errors.email}</Text>
                    )}

                    {/* Password */}
                    <Text style={styles.label}>Password</Text>

                    <View style={[styles.inputContainer, errors.password && styles.inputError]}>
                        <Ionicons name="lock-closed" size={20} color="cyan" />

                        <TextInput
                            placeholder="Minimum 6 characters"
                            placeholderTextColor="#64748B"
                            secureTextEntry={!showPassword}
                            style={styles.input}
                            value={form.password}
                            onChangeText={(text) => handleChange('password', text)}
                        />

                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                            <Ionicons
                                name={showPassword ? "eye-off" : "eye"}
                                size={20}
                                color="#94A3B8"
                            />
                        </TouchableOpacity>
                    </View>

                    {errors.password && (
                        <Text style={styles.fieldError}>{errors.password}</Text>
                    )}

                    {/* Confirm Password */}
                    <Text style={styles.label}>Confirm Password</Text>

                    <View style={[styles.inputContainer, errors.confirmPassword && styles.inputError]}>
                        <Ionicons name="lock-closed-outline" size={20} color="cyan" />

                        <TextInput
                            placeholder="Re-enter password"
                            placeholderTextColor="#64748B"
                            secureTextEntry={!showConfirmPassword}
                            style={styles.input}
                            value={form.confirmPassword}
                            onChangeText={(text) => handleChange('confirmPassword', text)}
                        />

                        <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                            <Ionicons
                                name={showConfirmPassword ? "eye-off" : "eye"}
                                size={20}
                                color="#94A3B8"
                            />
                        </TouchableOpacity>
                    </View>

                    {errors.confirmPassword && (
                        <Text style={styles.fieldError}>{errors.confirmPassword}</Text>
                    )}

                    <View style={styles.policyRow}>
                        <TouchableOpacity
                            style={styles.checkbox}
                            onPress={() => setAcceptedPolicy(!acceptedPolicy)}
                        >
                            {acceptedPolicy && (
                                <Ionicons name="checkmark" size={16} color="black" />
                            )}
                        </TouchableOpacity>

                        <Text style={styles.policyText}>
                            I have read the{" "}
                            <Text
                                style={styles.policyLink}
                                onPress={() => setShowPolicy(true)}
                            >
                                Privacy Policy
                            </Text>
                        </Text>

                    </View>
                    {errors.policy && (
                        <Text style={styles.fieldError}>{errors.policy}</Text>
                    )}

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

            <Modal
                visible={showPolicy}
                animationType="slide"
                transparent={true}
            >

                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>

                        <Text style={styles.modalTitle}>Privacy Policy</Text>

                        <ScrollView>

                            <Text style={styles.modalText}>
                                We respect your privacy. Your personal information such as
                                name, email, and account activity will only be used for
                                providing and improving the TeraClash platform.

                                We do not sell or share your personal information with
                                third parties without consent.

                                By using this application, you agree to our data
                                collection and usage policies for authentication,
                                analytics, and improving user experience.
                            </Text>

                        </ScrollView>

                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => setShowPolicy(false)}
                        >
                            <Text style={{ color: "white" }}>Close</Text>
                        </TouchableOpacity>

                    </View>
                </View>

            </Modal>
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
    },
    subtitle: {
        color: '#94A3B8',
        marginTop: 6
    },
    logo: {
        width: 42,
        height: 42,
        marginRight: 10,
        borderRadius: 8,
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
        paddingVertical: 5,
        marginBottom: 4,
        borderWidth: 1,
        borderColor: 'transparent'
    },
    inputError: {
        borderColor: '#EF4444'
    },
    input: {
        color: 'white',
        marginLeft: 10,
        flex: 1
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
    },
    policyRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
        marginTop: 8,
        marginLeft: 8
    },
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: "cyan",
        marginRight: 8,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "cyan"
    },

    policyText: {
        color: "#CBD5E1",
        fontSize: 13
    },

    policyLink: {
        color: "cyan",
        textDecorationLine: "underline"
    },

    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.6)",
        justifyContent: "center",
        padding: 20
    },

    modalContent: {
        backgroundColor: "#1E293B",
        borderRadius: 12,
        padding: 20,
        maxHeight: "70%"
    },

    modalTitle: {
        fontSize: 18,
        color: "white",
        fontWeight: "bold",
        marginBottom: 10
    },

    modalText: {
        color: "#CBD5E1",
        lineHeight: 20
    },

    closeButton: {
        backgroundColor: "cyan",
        padding: 10,
        borderRadius: 8,
        alignItems: "center",
        marginTop: 15
    }
})