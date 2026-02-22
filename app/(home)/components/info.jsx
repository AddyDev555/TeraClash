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
} from 'react-native';

const { height } = Dimensions.get('window');

const SimpleBadge = ({ count, onPress }) => {
    const scale = useRef(new Animated.Value(1)).current;
    const ring = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(ring, {
                    toValue: 1.2,
                    duration: 900,
                    useNativeDriver: true,
                }),
                Animated.timing(ring, {
                    toValue: 1,
                    duration: 0,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
            <View style={styles.badgeWrapper}>
                <Animated.View
                    style={[
                        styles.ring,
                        { transform: [{ scale: ring }] },
                    ]}
                />
                <View style={styles.badge}>
                    <Text style={styles.badgeCount}>{count}</Text>
                    <Text style={styles.badgeLabel}>Territory</Text>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const ConqueredAreasWidget = ({ areas, onAreaPress }) => {
    const [visible, setVisible] = useState(false);
    const translateY = useRef(new Animated.Value(300)).current;

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
            {/* Floating Badge */}
            <View style={styles.floating}>
                <SimpleBadge count={areas.length} onPress={open} />
            </View>

            {/* Bottom Sheet */}
            <Modal visible={visible} transparent animationType="none">
                <Pressable style={styles.backdrop} onPress={close} />

                <Animated.View
                    style={[
                        styles.sheet,
                        { transform: [{ translateY }] },
                    ]}
                >
                    <Text style={styles.title}>Conquered Territories</Text>

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
    floating: {
        position: 'absolute',
        bottom: 80,
        right: 16,
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
        color: 'cyan',
        fontWeight: 'bold',
        fontSize: 16,
    },

    badgeLabel: {
        fontSize: 8,
        color: '#94a3b8',
    },

    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
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
});

export default ConqueredAreasWidget;