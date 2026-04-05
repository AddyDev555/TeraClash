import React, { useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from 'expo-router';
import BottomBar from '@/components/bottomBar';
import { AppDataContext } from '../context/AppDataProvider';
import Navbar from '@/components/navbar';

const { width } = Dimensions.get('window');

const leaderboardData = [
  { id: 1, name: "Rohan", level: 15, steps: 12450, territories: 8, avatar: "https://i.pravatar.cc/150?img=1" },
  { id: 2, name: "Sneha", level: 14, steps: 11820, territories: 5, avatar: "https://i.pravatar.cc/150?img=2" },
  { id: 3, name: "Aditya", level: 13, steps: 10900, territories: 12, avatar: "https://i.pravatar.cc/150?img=3" },
  { id: 4, name: "Arjun", level: 11, steps: 8320, territories: 5, avatar: "https://i.pravatar.cc/150?img=4" },
  { id: 5, name: "Meera", level: 10, steps: 7980, territories: 2, avatar: "https://i.pravatar.cc/150?img=5" },
  { id: 14, name: "Dev", level: 9, steps: 7020, territories: 3, avatar: "https://i.pravatar.cc/150?img=6" }
];

export default function Leaderboard() {
  const {
    user,
    setUser,
    userInfo,
    userLocation,
    setUserLocation,
    userFlags,
  } = useContext(AppDataContext);


  const USERS_PER_PAGE = 5;
  const [currentPage, setCurrentPage] = React.useState(1);
  const router = useRouter();
  const [filter, setFilter] = React.useState("today");

  const sortedData = [...leaderboardData].sort(
    (a, b) => b.steps - a.steps || b.territories - a.territories
  );

  const topThree = sortedData.slice(0, 3);
  const restUsers = sortedData.slice(3);

  const totalPages = Math.ceil(restUsers.length / USERS_PER_PAGE);

  const paginatedData = restUsers.slice(
    (currentPage - 1) * USERS_PER_PAGE,
    currentPage * USERS_PER_PAGE
  );

  const getMedalGradient = (rank) => {
    switch (rank) {
      case 0:
        return { colors: ['#FFD700', '#FDB931'], shadow: '#FFD70040' };
      case 1:
        return { colors: ['#C0C0C0', '#A8A8A8'], shadow: '#C0C0C040' };
      case 2:
        return { colors: ['#CD7F32', '#B87333'], shadow: '#CD7F3240' };
      default:
        return { colors: ['cyan', '#a8b6c4'], shadow: 'cyan40' };
    }
  };

  const formatSteps = (steps) => {
    if (steps >= 10000) {
      return `${(steps / 1000).toFixed(1)}k`;
    }
    return steps.toString();
  };

  const TopThreeCard = ({ user, rank }) => {
    const medalGradient = getMedalGradient(rank);
    const medalIcon = rank === 0 ? "🥇" : rank === 1 ? "🥈" : "🥉";
    const rankText = rank === 0 ? "1st" : rank === 1 ? "2nd" : "3rd";

    return (
      <View style={[
        styles.topThreeCardWrapper,
        rank === 0 && styles.firstPlaceWrapper,
      ]}>
        <LinearGradient
          colors={medalGradient.colors}
          style={styles.topThreeCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* Medal Icon - Smaller */}
          <View style={styles.medalIconContainer}>
            <Text style={styles.medalIconText}>{medalIcon}</Text>
          </View>

          {/* Avatar */}
          <View style={[
            styles.avatarContainer,
            rank === 0 && styles.firstAvatarContainer,
          ]}>
            <Image source={{ uri: user.avatar }} style={[
              styles.avatar,
              rank === 0 && styles.firstAvatar
            ]} />
          </View>

          {/* User Info */}
          <Text style={styles.userName} numberOfLines={1}>{user.name}</Text>

          {/* Stats - Improved layout */}
          <View style={styles.statsWrapper}>
            <View style={styles.statItem}>
              <Ionicons name="footsteps-outline" size={10} color="#fff" />
              <Text style={styles.statValue} numberOfLines={1}>
                {formatSteps(user.steps)}
              </Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Ionicons name="map-outline" size={10} color="#fff" />
              <Text style={styles.statValue} numberOfLines={1}>
                {user.territories}
              </Text>
            </View>
          </View>

          {/* Level Badge */}
          <View style={styles.levelBadge}>
            <Ionicons name="flash" size={9} color="white" />
            <Text style={styles.levelText}>Lvl {user.level}</Text>
          </View>
        </LinearGradient>
      </View>
    );
  };

  const TableRow = ({ item, index }) => {
    const globalRank = index + 4;

    return (
      <View style={styles.tableRow}>
        <View style={styles.tableRankContainer}>
          <Text style={styles.tableRank}>#{globalRank}</Text>
        </View>

        <View style={styles.tableUserInfo}>
          <Image source={{ uri: item.avatar }} style={styles.tableAvatar} />
          <View style={styles.tableUserText}>
            <Text style={styles.tableName} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.tableLevel}>Lvl {item.level}</Text>
          </View>
        </View>

        <View style={styles.tableStats}>
          <View style={styles.tableStatItem}>
            <Ionicons name="footsteps-outline" size={11} color="#94a3b8" />
            <Text style={styles.tableStatValue}>{formatSteps(item.steps)}</Text>
          </View>
          <View style={styles.tableStatItem}>
            <Ionicons name="map-outline" size={11} color="#94a3b8" />
            <Text style={styles.tableStatValue}>{item.territories}</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" translucent backgroundColor="transparent" hidden />
      <View style={styles.floatingHead}>
        <Navbar userInfo={userInfo} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Filter Tabs */}
        <View style={styles.filterContainer}>
          {["today", "weekly", "monthly"].map((item) => (
            <TouchableOpacity
              key={item}
              style={[
                styles.filterButton,
                filter === item && styles.activeFilter,
              ]}
              onPress={() => setFilter(item)}
            >
              <Text
                style={[
                  styles.filterText,
                  filter === item && styles.activeFilterText,
                ]}
              >
                {item.charAt(0).toUpperCase() + item.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Top 3 Section */}
        <View style={styles.topThreeSection}>
          {/* Second Place (Left) */}
          <View style={styles.topThreeItem}>
            <TopThreeCard user={topThree[1]} rank={1} />
          </View>

          {/* First Place (Center) */}
          <View style={[styles.topThreeItem, styles.firstPlaceItem]}>
            <TopThreeCard user={topThree[0]} rank={0} />
          </View>

          {/* Third Place (Right) */}
          <View style={styles.topThreeItem}>
            <TopThreeCard user={topThree[2]} rank={2} />
          </View>
        </View>

        {/* Rest of Leaderboard */}
        <View style={styles.tableSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>All Players</Text>
            <Text style={styles.sectionCount}>{sortedData.length} total</Text>
          </View>

          <View style={styles.tableContainer}>
            {paginatedData.map((item, index) => (
              <TableRow key={item.id} item={item} index={index} />
            ))}
          </View>

          {/* Pagination */}
          {totalPages > 1 && (
            <View style={styles.paginationContainer}>
              <TouchableOpacity
                onPress={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                style={[styles.pageButton, currentPage === 1 && styles.pageButtonDisabled]}
              >
                <Ionicons name="chevron-back" size={18} color={currentPage === 1 ? "#475569" : "cyan"} />
                <Text style={[styles.pageButtonText, currentPage === 1 && styles.pageButtonDisabledText]}>Previous</Text>
              </TouchableOpacity>

              <View style={styles.pageInfo}>
                <Text style={styles.pageInfoText}>
                  Page {currentPage} of {totalPages}
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                style={[styles.pageButton, currentPage === totalPages && styles.pageButtonDisabled]}
              >
                <Text style={[styles.pageButtonText, currentPage === totalPages && styles.pageButtonDisabledText]}>Next</Text>
                <Ionicons name="chevron-forward" size={18} color={currentPage === totalPages ? "#475569" : "cyan"} />
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

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
    paddingTop: 70,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  filterContainer: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginBottom: 20,
    marginTop: 15,
    backgroundColor: "#1e293b",
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: "center",
  },
  activeFilter: {
    borderWidth: 1,
    borderColor: "cyan",
  },
  filterText: {
    color: "#94a3b8",
    fontWeight: "600",
    fontSize: 12,
  },
  activeFilterText: {
    color: "cyan",
  },
  topThreeSection: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "flex-end",
    marginBottom: 28,
    paddingHorizontal: 8,
    gap: 4,
  },
  topThreeItem: {
    flex: 1,
    alignItems: "center",
  },
  firstPlaceItem: {
    transform: [{ scale: 1.02 }],
    zIndex: 10,
  },
  topThreeCardWrapper: {
    width: '100%',
    alignItems: "center",
  },
  firstPlaceWrapper: {
    marginTop: -8,
  },
  topThreeCard: {
    width: '100%',
    alignItems: "center",
    borderRadius: 18,
    padding: 12,
    paddingTop: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  medalIconContainer: {
    position: "absolute",
    top: -8,
    left: -8,
    backgroundColor: "#0a0f1a",
    borderRadius: 20,
    padding: 5,
    zIndex: 10,
  },
  medalIconText: {
    fontSize: 16,
  },
  rankNumberContainer: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "#0a0f1a",
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  rankNumberText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#fff",
  },
  avatarContainer: {
    marginBottom: 10,
    position: "relative",
  },
  firstAvatarContainer: {
    marginBottom: 10,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: "#fff",
  },
  firstAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 3,
  },
  crownBadge: {
    position: "absolute",
    bottom: -3,
    right: -3,
    backgroundColor: "#0a0f1a",
    borderRadius: 15,
    padding: 3,
    borderWidth: 1,
    borderColor: "#FFD700",
  },
  userName: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 6,
    textAlign: "center",
    maxWidth: '100%',
  },
  statsWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
    marginBottom: 6,
    backgroundColor: "rgba(0,0,0,0.3)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 14,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  statValue: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
  },
  statDivider: {
    width: 1,
    height: 10,
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  levelBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    backgroundColor: "rgba(0,0,0,0.3)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  levelText: {
    color: "white",
    fontSize: 9,
    fontWeight: "600",
  },
  tableSection: {
    marginHorizontal: 16,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 14,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  sectionCount: {
    fontSize: 12,
    color: "#64748b",
  },
  tableContainer: {
    backgroundColor: "#1e293b",
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#2d3a4e",
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#2d3a4e",
    backgroundColor: '#1e293b',
  },
  tableRankContainer: {
    width: 40,
  },
  tableRank: {
    color: "#94a3b8",
    fontSize: 12,
    fontWeight: "500",
  },
  tableUserInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  tableUserText: {
    flex: 1,
  },
  tableAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  tableName: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 2,
  },
  tableLevel: {
    color: "#64748b",
    fontSize: 10,
  },
  tableStats: {
    flexDirection: "row",
    gap: 10,
  },
  tableStatItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  tableStatValue: {
    color: "#e2e8f0",
    fontSize: 11,
    fontWeight: "500",
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 18,
    paddingHorizontal: 8,
  },
  pageButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: "#1e293b",
    borderRadius: 8,
  },
  pageButtonDisabled: {
    opacity: 0.5,
  },
  pageButtonText: {
    color: "cyan",
    fontWeight: "600",
    fontSize: 12,
  },
  pageButtonDisabledText: {
    color: "#475569",
  },
  pageInfo: {
    backgroundColor: "#1e293b",
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  pageInfoText: {
    color: "#94a3b8",
    fontSize: 12,
  },
  bottomPadding: {
    height: 20,
  },
  floatingHead: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
});