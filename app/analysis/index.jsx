import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import BottomBar from '@/components/bottomBar';
const { width } = Dimensions.get('window');

export default function AnalysisPage() {
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
        frontColor: value === maxSteps ? '#10b981' : '#3b82f6',
        gradientColor: value === maxSteps ? '#059669' : '#2563eb',
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
        <LinearGradient
            colors={[color + '20', color + '05']}
            style={styles.statCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
        >
            <View style={styles.statHeader}>
                <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
                    <Ionicons name={icon} size={24} color={color} />
                </View>
                <Text style={styles.statTitle}>{title}</Text>
            </View>
            <Text style={styles.statValue}>{value}</Text>
            {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
        </LinearGradient>
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
                    <Ionicons name="footsteps-outline" size={16} color="#94a3b8" />
                    <Text style={styles.historyStatValue}>{item.steps.toLocaleString()}</Text>
                </View>
                <View style={styles.historyStat}>
                    <Ionicons name="map-outline" size={16} color="#94a3b8" />
                    <Text style={styles.historyStatValue}>{item.area}</Text>
                </View>
                <View style={[
                    styles.trendBadge,
                    { backgroundColor: item.trend === 'up' ? '#10b98120' : '#ef444420' }
                ]}>
                    <Ionicons
                        name={item.trend === 'up' ? 'trending-up' : 'trending-down'}
                        size={14}
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
        <View style={styles.container}>
            {/* Scrollable Content */}
            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContentContainer}
            >
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Analytics</Text>
                    <Text style={styles.headerSubtitle}>Top performers this week</Text>
                </View>

                {/* Stats Grid */}
                <View style={styles.statsGrid}>
                    <StatCard
                        title="Total Steps"
                        value={totalSteps.toLocaleString()}
                        icon="footsteps-outline"
                        color="#3b82f6"
                    />
                    <StatCard
                        title="Daily Average"
                        value={avgSteps.toLocaleString()}
                        icon="bar-chart-outline"
                        color="#8b5cf6"
                    />
                    <StatCard
                        title="Best Day"
                        value={bestDay}
                        subtitle={`${maxSteps.toLocaleString()} steps`}
                        icon="trophy-outline"
                        color="#f59e0b"
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
                        barWidth={32}
                        spacing={12}
                        roundedTop
                        roundedBottom={8}
                        hideRules
                        xAxisThickness={0}
                        yAxisThickness={0}
                        yAxisTextStyle={{ color: '#94a3b8', fontSize: 12 }}
                        xAxisLabelTextStyle={{ color: '#94a3b8', fontSize: 12, fontWeight: '500' }}
                        frontColor="#3b82f6"
                        showGradient
                        gradientColor="#2563eb"
                        showValuesAsTopLabel
                        topLabelTextStyle={{ color: '#fff', fontSize: 11, fontWeight: '600' }}
                        height={220}
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

                {/* Add extra bottom padding to ensure content doesn't get hidden behind BottomBar */}
                <View style={styles.bottomPadding} />
            </ScrollView>

            {/* Bottom Bar - Fixed at bottom */}
            <BottomBar />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a0f1a',
    },
    scrollView: {
        flex: 1,
    },
    scrollContentContainer: {
        paddingBottom: 0, // This will be overridden by bottomPadding
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 24,
        backgroundColor: '#0a0f1a',
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: '700',
        color: '#fff',
        marginBottom: 2,
        letterSpacing: -0.5,
    },
    headerSubtitle: {
        fontSize: 15,
        color: '#64748b',
        letterSpacing: -0.3,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 16,
        gap: 12,
        marginBottom: 24,
        marginTop: 16, // Added top margin for spacing
    },
    statCard: {
        flex: 1,
        minWidth: (width - 44) / 3,
        backgroundColor: '#1e293b',
        borderRadius: 20,
        padding: 16,
        borderWidth: 1,
        borderColor: '#2d3a4e',
    },
    statHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    statTitle: {
        fontSize: 13,
        color: '#94a3b8',
        fontWeight: '500',
        letterSpacing: -0.2,
    },
    statValue: {
        fontSize: 24,
        fontWeight: '700',
        color: '#fff',
        marginBottom: 4,
        letterSpacing: -0.5,
    },
    statSubtitle: {
        fontSize: 12,
        color: '#64748b',
    },
    chartContainer: {
        backgroundColor: '#1e293b',
        marginHorizontal: 16,
        marginBottom: 24,
        borderRadius: 24,
        padding: 20,
        borderWidth: 1,
        borderColor: '#2d3a4e',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#fff',
        letterSpacing: -0.3,
    },
    sectionSubtitle: {
        fontSize: 13,
        color: '#64748b',
    },
    historyContainer: {
        marginHorizontal: 16,
    },
    historyList: {
        gap: 12,
        marginBottom: 16,
    },
    historyItem: {
        backgroundColor: '#1e293b',
        borderRadius: 16,
        padding: 16,
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
        fontSize: 14,
        fontWeight: '600',
        color: '#fff',
        marginBottom: 4,
    },
    historyStats: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    historyStat: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    historyStatValue: {
        fontSize: 14,
        color: '#e2e8f0',
        fontWeight: '500',
    },
    trendBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 20,
    },
    trendText: {
        fontSize: 12,
        fontWeight: '600',
    },
    bottomPadding: {
        height: 80, // Adjust this value based on your BottomBar height
    },
});