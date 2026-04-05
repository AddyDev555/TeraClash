import { StyleSheet, View, Text, TouchableOpacity, Animated } from 'react-native'
import React, { useEffect, useRef, useState, useContext } from 'react'
import { BlurView } from 'expo-blur'
import { Ionicons } from '@expo/vector-icons'
import { AppDataContext } from '../app/context/AppDataProvider'

const mascotImages = {
    hi: require('../assets/mascot/hi.png'),
    normal: require('../assets/mascot/normal.png'),
    charm: require('../assets/mascot/charm.png'),
}

export default function Mascot({
    message,
    mood = "normal",
    onNext,
    onPrev,
    onEnd,
    isFirst,
    isLast,
    highlight
}) {
    const avatar = mascotImages[mood] || mascotImages.hi

    const bounceAnim = useRef(new Animated.Value(0)).current
    const fadeAnim = useRef(new Animated.Value(0)).current
    const highlightOpacity = useRef(new Animated.Value(0)).current
    const highlightScale = useRef(new Animated.Value(0.95)).current
    const bounceLoop = useRef(null)
    const glowLoop = useRef(null)

    const [displayedText, setDisplayedText] = useState('')
    const [isTyping, setIsTyping] = useState(false)
    const typingRef = useRef(null)

    const startBounce = () => {
        if (!disableEntryAnimations) {
            bounceLoop.current = Animated.loop(
                Animated.sequence([
                    Animated.timing(bounceAnim, { toValue: -10, duration: 300, useNativeDriver: true }),
                    Animated.timing(bounceAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
                ])
            )
            bounceLoop.current.start()
        }
    }

    const stopBounce = () => {
        if (bounceLoop.current) {
            bounceLoop.current.stop()
            bounceLoop.current = null
        }
        Animated.timing(bounceAnim, { toValue: 0, duration: 150, useNativeDriver: true }).start()
    }

    // Animate highlight in/out when it changes
    const { disableEntryAnimations } = useContext(AppDataContext)

    useEffect(() => {
        if (glowLoop.current) {
            glowLoop.current.stop()
            glowLoop.current = null
        }

        if (highlight) {
            highlightOpacity.setValue(0)
            highlightScale.setValue(0.95)

            if (disableEntryAnimations) {
                highlightOpacity.setValue(1)
                highlightScale.setValue(1)
            } else {
                Animated.parallel([
                    Animated.timing(highlightOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
                    Animated.spring(highlightScale, { toValue: 1, useNativeDriver: true, friction: 6 }),
                ]).start(() => {
                    // Pulsing glow after appearing
                    glowLoop.current = Animated.loop(
                        Animated.sequence([
                            Animated.timing(highlightOpacity, { toValue: 0.5, duration: 700, useNativeDriver: true }),
                            Animated.timing(highlightOpacity, { toValue: 1, duration: 700, useNativeDriver: true }),
                        ])
                    )
                    glowLoop.current.start()
                })
            }
        } else {
            if (disableEntryAnimations) {
                highlightOpacity.setValue(0)
            } else {
                Animated.timing(highlightOpacity, { toValue: 0, duration: 200, useNativeDriver: true }).start()
            }
        }

        return () => {
            if (glowLoop.current) {
                glowLoop.current.stop()
                glowLoop.current = null
            }
        }
    }, [highlight])

    // Typing animation
    useEffect(() => {
        if (typingRef.current) clearInterval(typingRef.current)

        setDisplayedText('')
        setIsTyping(true)

        if (disableEntryAnimations) {
            fadeAnim.setValue(1)
            // show full message instantly
            setDisplayedText(message)
            setIsTyping(false)
        } else {
            fadeAnim.setValue(0)
            Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start()

            startBounce()

            let i = 0
            typingRef.current = setInterval(() => {
                i++
                setDisplayedText(message.slice(0, i))
                if (i >= message.length) {
                    clearInterval(typingRef.current)
                    setIsTyping(false)
                    stopBounce()
                }
            }, 35)
        }

        return () => {
            if (typingRef.current) clearInterval(typingRef.current)
            stopBounce()
        }
    }, [message])

    return (
        <View style={styles.wrapper}>

            {/* Blur behind everything except the highlight */}
            <BlurView intensity={100} tint="dark" style={styles.blurBackground} pointerEvents="none" />

            {/* Highlight box */}
            {highlight && (
                <Animated.View
                    pointerEvents="none"
                    style={[
                        styles.highlightBox,
                        {
                            left: highlight.x - 8,
                            top: highlight.y - 8,
                            width: highlight.width + 16,
                            height: highlight.height + 16,
                            borderColor: highlight.borderColor ?? 'cyan',
                            opacity: highlightOpacity,
                            transform: [{ scale: highlightScale }],
                        }
                    ]}
                >
                    {/* Corner accents */}
                    <View style={[styles.corner, styles.cornerTL, { borderColor: highlight.borderColor ?? 'cyan' }]} />
                    <View style={[styles.corner, styles.cornerTR, { borderColor: highlight.borderColor ?? 'cyan' }]} />
                    <View style={[styles.corner, styles.cornerBL, { borderColor: highlight.borderColor ?? 'cyan' }]} />
                    <View style={[styles.corner, styles.cornerBR, { borderColor: highlight.borderColor ?? 'cyan' }]} />
                </Animated.View>
            )}

            <View style={styles.container}>

                <Animated.View style={[styles.bubbleWrapper, { opacity: fadeAnim }]}>
                    <View style={styles.messageBubble}>

                        <Text style={styles.message}>
                            {displayedText}
                            {isTyping && <Text style={styles.cursor}>|</Text>}
                        </Text>

                        {!isTyping && (
                            <View style={styles.controls}>

                                {!isFirst && (
                                    <TouchableOpacity onPress={() => onPrev?.()} style={styles.button}>
                                        <Ionicons name="chevron-back" size={14} color="white" />
                                    </TouchableOpacity>
                                )}

                                {!isLast && (
                                    <TouchableOpacity onPress={() => onNext?.()} style={styles.button}>
                                        <Ionicons name="chevron-forward" size={14} color="white" />
                                    </TouchableOpacity>
                                )}

                                {isLast ? (
                                    <TouchableOpacity onPress={() => onEnd?.()} style={styles.endButton}>
                                        <Text style={styles.buttonText}>Finish</Text>
                                    </TouchableOpacity>
                                ) : (
                                    <TouchableOpacity onPress={() => onEnd?.()} style={styles.endButton}>
                                        <Text style={styles.buttonText}>Skip</Text>
                                    </TouchableOpacity>
                                )}

                            </View>
                        )}

                    </View>
                </Animated.View>

                <Animated.Image
                    source={avatar}
                    style={[styles.hiImg, { transform: [{ translateY: bounceAnim }] }]}
                />

            </View>

        </View>
    )
}

const CORNER_SIZE = 14
const CORNER_THICKNESS = 2

const styles = StyleSheet.create({

    wrapper: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 1000,
        justifyContent: 'flex-end',
    },

    blurBackground: {
        ...StyleSheet.absoluteFillObject,
    },

    highlightBox: {
        position: 'absolute',
        borderWidth: 1.5,
        borderRadius: 10,
        borderStyle: 'dashed',
        backgroundColor: 'rgba(255,255,255,0.04)',
    },

    // Corner L-shaped accents
    corner: {
        position: 'absolute',
        width: CORNER_SIZE,
        height: CORNER_SIZE,
        borderColor: 'cyan',
    },

    cornerTL: {
        top: -CORNER_THICKNESS,
        left: -CORNER_THICKNESS,
        borderTopWidth: CORNER_THICKNESS * 2,
        borderLeftWidth: CORNER_THICKNESS * 2,
        borderTopLeftRadius: 4,
    },

    cornerTR: {
        top: -CORNER_THICKNESS,
        right: -CORNER_THICKNESS,
        borderTopWidth: CORNER_THICKNESS * 2,
        borderRightWidth: CORNER_THICKNESS * 2,
        borderTopRightRadius: 4,
    },

    cornerBL: {
        bottom: -CORNER_THICKNESS,
        left: -CORNER_THICKNESS,
        borderBottomWidth: CORNER_THICKNESS * 2,
        borderLeftWidth: CORNER_THICKNESS * 2,
        borderBottomLeftRadius: 4,
    },

    cornerBR: {
        bottom: -CORNER_THICKNESS,
        right: -CORNER_THICKNESS,
        borderBottomWidth: CORNER_THICKNESS * 2,
        borderRightWidth: CORNER_THICKNESS * 2,
        borderBottomRightRadius: 4,
    },

    container: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        padding: 15,
        position: 'absolute',
        bottom: 50,
    },

    hiImg: {
        width: 140,
        height: 140,
    },

    bubbleWrapper: {
        flex: 1,
    },

    messageBubble: {
        maxWidth: 200,
        position: 'relative',
        left: 25,
        bottom: 80,
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
        borderBottomLeftRadius: 12,
        backgroundColor: 'rgba(30, 41, 59, 0.9)',
    },

    message: {
        color: 'white',
        fontSize: 16,
        lineHeight: 20,
    },

    cursor: {
        color: 'cyan',
        fontWeight: '300',
    },

    controls: {
        flexDirection: 'row',
        gap: 6,
        marginTop: 12,
    },

    button: {
        backgroundColor: 'transparent',
        padding: 6,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: 'cyan',
        alignItems: 'center',
        justifyContent: 'center',
        width: 30,
        height: 30,
    },

    endButton: {
        backgroundColor: 'transparent',
        paddingVertical: 5,
        paddingHorizontal: 5,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: 'red',
    },

    buttonText: {
        color: 'white',
        fontSize: 11,
        fontWeight: '600'
    }

})