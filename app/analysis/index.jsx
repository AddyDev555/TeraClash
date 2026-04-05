import React, { useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, StatusBar } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import { Ionicons } from '@expo/vector-icons';
import { AppDataContext } from '../context/AppDataProvider';
import Navbar from '@/components/navbar';
import BottomBar from '@/components/bottomBar';
import { useTheme } from '@react-navigation/native'
const { width } = Dimensions.get('window');

export default function AnalysisPage() {
    const {
        user,
        setUser,
        userInfo,
        userLocation,
        setUserLocation,
        userFlags,
    } = useContext(AppDataContext);

    const { colors } = useTheme();

    const weeklySteps = [4000, 6500, 8000, 5000, 9000, 12000, 7000];
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    // Calculate statistics
    const totalSteps = weeklySteps.reduce((sum, steps) => sum + steps, 0);
    const avgSteps = Math.round(totalSteps / weeklySteps.length);
    const maxSteps = Math.max(...weeklySteps);
    const bestDay = days[weeklySteps.indexOf(maxSteps)];

    const barData = weeklySteps.map((value, index) => ({
        value,
        label: days[index],
        frontColor: value === maxSteps ? '#10b981' : 'cyan',
        gradientColor: value === maxSteps ? '#059669' : '#a8b6c4',
        spacing: 4,
        labelWidth: 30,
    }));

    const history = [
        { date: '2026-03-16', steps: 5000, area: '1.2 km²', trend: 'down' },
        { date: '2026-03-17', steps: 7200, area: '1.8 km²', trend: 'up' },
        { date: '2026-03-18', steps: 6100, area: '1.4 km²', trend: 'down' },
        { date: '2026-03-19', steps: 8900, area: '2.3 km²', trend: 'up' },
        { date: '2026-03-20', steps: 10000, area: '2.8 km²', trend: 'up' },
    ];

    const StatCard = ({ title, value, subtitle, icon, color }) => (
        <View style={styles.statCard}>
            <View style={styles.statHeader}>
                <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
                    <Ionicons name={icon} size={22} color={color} />
                </View>
                <Text style={styles.statTitle}>{title}</Text>
            </View>
            <Text style={styles.statValue}>{value}</Text>
            {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
        </View>
    );

    const HistoryItem = ({ item, index }) => (
        <View style={styles.historyItem}>
            <View style={styles.historyDateContainer}>
                <Text style={styles.historyDate}>
                    {new Date(item.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </Text>
            </View>
            <View style={styles.historyStats}>
                <View style={styles.historyStat}>
                    <Ionicons name="footsteps-outline" size={15} color="#94a3b8" />
                    <Text style={styles.historyStatValue}>{item.steps.toLocaleString()}</Text>
                </View>
                <View style={styles.historyStat}>
                    <Ionicons name="map-outline" size={15} color="#94a3b8" />
                    <Text style={styles.historyStatValue}>{item.area}</Text>
                </View>
                <View style={[
                    styles.trendBadge,
                    { backgroundColor: item.trend === 'up' ? '#10b98120' : '#ef444420' }
                ]}>
                    <Ionicons
                        name={item.trend === 'up' ? 'trending-up' : 'trending-down'}
                        size={13}
                        color={item.trend === 'up' ? '#10b981' : '#ef4444'}
                    />
                    <Text style={[
                        styles.trendText,
                        { color: item.trend === 'up' ? '#10b981' : '#ef4444' }
                    ]}>
                        {item.trend === 'up' ? '+12%' : '-8%'}
                    </Text>
                </View>
            </View>
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar style="light" translucent backgroundColor="transparent" hidden />

            {/* Scrollable Content */}
            <Navbar userInfo={userInfo} />

            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContentContainer}
            >
                {/* Stats Grid */}
                <View style={styles.statsGrid}>
                    <StatCard
                        title="Total Steps"
                        value={userInfo?.total_steps?.toLocaleString() || 0}
                        icon="footsteps-outline"
                        color="cyan"
                    />
                    <StatCard
                        title="Daily Average"
                        value={avgSteps.toLocaleString()}
                        icon="bar-chart-outline"
                        color="cyan"
                    />
                    <StatCard
                        title="Best Day"
                        value={bestDay}
                        subtitle={`${maxSteps.toLocaleString()} steps`}
                        icon="trophy-outline"
                        color="cyan"
                    />
                </View>

                {/* Chart Section */}
                <View style={styles.chartContainer}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Weekly Progress</Text>
                        <Text style={styles.sectionSubtitle}>Last 7 days</Text>
                    </View>
                    <BarChart
                        data={barData}
                        barWidth={30}
                        spacing={11}
                        roundedTop
                        roundedBottom={7}
                        hideRules
                        xAxisThickness={0}
                        yAxisThickness={0}
                        yAxisTextStyle={{ color: '#94a3b8', fontSize: 11 }}
                        xAxisLabelTextStyle={{ color: '#94a3b8', fontSize: 11, fontWeight: '500' }}
                        frontColor="cyan"
                        showValuesAsTopLabel
                        topLabelTextStyle={{ color: '#fff', fontSize: 10, fontWeight: '600' }}
                        height={210}
                        yAxisLabelPrefix=""
                        yAxisLabelSuffix=""
                        stepValue={3000}
                        maxValue={14000}
                        noOfSections={5}
                        backgroundColor="transparent"
                        dashWidth={0}
                    />
                </View>

                {/* History Section */}
                <View style={styles.historyContainer}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Recent Activity</Text>
                        <Text style={styles.sectionSubtitle}>Last 5 days</Text>
                    </View>
                    <View style={styles.historyList}>
                        {history.map((item, index) => (
                            <HistoryItem key={index} item={item} index={index} />
                        ))}
                    </View>
                </View>
            </ScrollView>

            {/* Bottom Bar - Fixed at bottom */}
            <BottomBar />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        height: '100%',
        backgroundColor: '#0a0f1a',
    },
    scrollView: {
        flex: 1,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 16,
        gap: 11,
        marginBottom: 22,
        marginTop: 15,
    },
    statCard: {
        flex: 1,
        minWidth: (width - 44) / 3,
        backgroundColor: '#1e293b',
        borderRadius: 18,
        padding: 14,
        borderWidth: 1,
        borderColor: '#2d3a4e',
    },
    statHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 7,
        marginBottom: 10,
    },
    iconContainer: {
        width: 32,
        height: 32,
        borderRadius: 11,
        justifyContent: 'center',
        alignItems: 'center',
    },
    statTitle: {
        fontSize: 12,
        color: '#94a3b8',
        fontWeight: '500',
        letterSpacing: -0.2,
    },
    statValue: {
        fontSize: 21,
        fontWeight: '700',
        color: '#fff',
        marginBottom: 3,
        marginLeft: 8,
        letterSpacing: -0.4,
    },
    statSubtitle: {
        fontSize: 11,
        color: '#64748b',
        marginLeft: 8,
    },
    chartContainer: {
        backgroundColor: '#1e293b',
        marginHorizontal: 16,
        marginBottom: 22,
        borderRadius: 22,
        padding: 18,
        borderWidth: 1,
        borderColor: '#2d3a4e',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginBottom: 18,
    },
    sectionTitle: {
        fontSize: 17,
        fontWeight: '600',
        color: '#fff',
        letterSpacing: -0.3,
    },
    sectionSubtitle: {
        fontSize: 12,
        color: '#64748b',
    },
    historyContainer: {
        marginHorizontal: 16,
    },
    historyList: {
        gap: 11,
        marginBottom: 16,
    },
    historyItem: {
        backgroundColor: '#1e293b',
        borderRadius: 15,
        padding: 14,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#2d3a4e',
    },
    historyDateContainer: {
        flex: 1,
    },
    historyDate: {
        fontSize: 13,
        fontWeight: '600',
        color: '#fff',
        marginBottom: 3,
    },
    historyStats: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
    },
    historyStat: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    historyStatValue: {
        fontSize: 13,
        color: '#e2e8f0',
        fontWeight: '500',
    },
    trendBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        paddingHorizontal: 7,
        paddingVertical: 3,
        borderRadius: 18,
    },
    trendText: {
        fontSize: 11,
        fontWeight: '600',
    },
    bottomPadding: {
        height: 80,
    },
    floatingHead: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingTop: 10,
  },
});