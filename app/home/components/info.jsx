import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    FlatList,
    StyleSheet,
    Animated,
    Dimensions,
    Pressable,
    PanResponder
} from 'react-native';

const { height } = Dimensions.get('window');

const StreakBadge = ({ streak, onPress }) => {
    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
            <View style={styles.badgeWrapper}>
                <View style={styles.streakRing} />
                <View style={styles.streakBadge}>
                    <Text style={styles.streakCount}>{streak}</Text>
                    <Text style={styles.streakLabel}>Streak</Text>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const SimpleBadge = ({ count, onPress }) => {
    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
            <View style={styles.badgeWrapper}>
                <View style={styles.ring} />
                <View style={styles.badge}>
                    <Text style={styles.badgeCount}>{count}</Text>
                    <Text style={styles.badgeLabel}>Territory</Text>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const ConqueredAreasWidget = ({ areas, onAreaPress, userInfo }) => {
    const [visible, setVisible] = useState(false);
    const translateY = useRef(new Animated.Value(300)).current;

    const panY = useRef(new Animated.Value(0)).current;

const panResponder = useRef(
    PanResponder.create({
        onMoveShouldSetPanResponder: (_, gestureState) => {
            return Math.abs(gestureState.dy) > 5;
        },
        onPanResponderMove: (_, gestureState) => {
            if (gestureState.dy > 0) {
                panY.setValue(gestureState.dy);
            }
        },
        onPanResponderRelease: (_, gestureState) => {
            if (gestureState.dy > 120) {
                close(); // drag enough → close
                panY.setValue(0);
            } else {
                // snap back
                Animated.spring(panY, {
                    toValue: 0,
                    useNativeDriver: true,
                }).start();
            }
        },
    })
).current;

    const open = () => {
        setVisible(true);
        Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
        }).start();
    };

    const close = () => {
        Animated.timing(translateY, {
            toValue: 300,
            duration: 200,
            useNativeDriver: true,
        }).start(() => setVisible(false));
    };

    return (
        <>
            {/* Streak Floating Left */}
            <View style={styles.floatingLeft}>
                    <StreakBadge
                        streak={userInfo?.streak ?? 0}
                        onPress={() => console.log("Streak pressed")}
                    />
            </View>

            {/* Floating Badge */}
            <View style={styles.floating}>
                <SimpleBadge count={userInfo?.areas_captured ?? 0} onPress={open} />
            </View>

            {/* Bottom Sheet */}
            <Modal visible={visible} transparent animationType="none">
                <Pressable style={styles.backdrop} onPress={close} />
                <Animated.View
                    {...panResponder.panHandlers}
                    style={[
                        styles.sheet,
                        {
                            transform: [
                                {
                                    translateY: Animated.add(translateY, panY),
                                },
                            ],
                        },
                    ]}
                >
                    <View style={styles.handle} />
                    {/* <Text style={styles.title}>Conquered Territories</Text> */}

                    <FlatList
                        data={areas}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={styles.item}
                                onPress={() => {
                                    close();
                                    onAreaPress(item);
                                }}
                            >
                                <Text style={styles.itemText}>{item.name}</Text>
                            </TouchableOpacity>
                        )}
                        ListEmptyComponent={
                            <Text style={styles.empty}>No territories yet</Text>
                        }
                    />
                </Animated.View>
            </Modal>
        </>
    );
};

const styles = StyleSheet.create({
    floatingLeft: {
        position: 'absolute',
        bottom: 60,
        left: 16,
    },

    streakRing: {
        position: 'absolute',
        width: 60,
        height: 60,
        borderRadius: 30,
        borderWidth: 2,
        borderColor: '#f97316',
        opacity: 0.4,
    },

    streakBadge: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#1e293b',
        alignItems: 'center',
        justifyContent: 'center',
    },

    streakCount: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 14,
    },

    streakLabel: {
        fontSize: 8,
        color: '#94a3b8',
    },

    floating: {
        position: 'absolute',
        bottom: 60,
        left: 80,
    },

    badgeWrapper: {
        width: 60,
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
    },

    ring: {
        position: 'absolute',
        width: 60,
        height: 60,
        borderRadius: 30,
        borderWidth: 2,
        borderColor: 'cyan',
        opacity: 0.4,
    },

    badge: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#1e293b',
        alignItems: 'center',
        justifyContent: 'center',
    },

    badgeCount: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },

    badgeLabel: {
        fontSize: 8,
        color: '#94a3b8',
    },

    backdrop: {
        flex: 1,
        // backgroundColor: 'rgba(0,0,0,0.6)',
    },

    sheet: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        maxHeight: height * 0.6,
        backgroundColor: '#1e293b',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 16,
    },

    title: {
        color: 'cyan',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 12,
    },

    item: {
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)',
    },

    itemText: {
        color: '#f1f5f9',
    },

    empty: {
        color: '#94a3b8',
        textAlign: 'center',
        marginTop: 20,
    },

    handle: {
        width: 60,
        height: 5,
        borderRadius: 3,
        backgroundColor: '#64748b',
        alignSelf: 'center',
        marginBottom: 5,
},
});

export default ConqueredAreasWidget;