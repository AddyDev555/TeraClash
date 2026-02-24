import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from 'expo-router'
import BottomBar from '@/components/bottomBar'


const leaderboardData = [
  { id: 1, name: "Rohan", level: 15, steps: 12450, territories: 8, avatar: "https://i.pravatar.cc/150?img=1" },
  { id: 2, name: "Sneha", level: 14, steps: 11820, territories: 5, avatar: "https://i.pravatar.cc/150?img=2" },
  { id: 3, name: "Aditya", level: 13, steps: 10900, territories: 12, avatar: "https://i.pravatar.cc/150?img=3" },
  { id: 4, name: "Arjun", level: 11, steps: 8320, territories: 5, avatar: "https://i.pravatar.cc/150?img=4" },
  { id: 5, name: "Meera", level: 10, steps: 7980, territories: 2, avatar: "https://i.pravatar.cc/150?img=5" },
  { id: 6, name: "Dev", level: 9, steps: 7020, territories: 3, avatar: "https://i.pravatar.cc/150?img=6" },
  { id: 7, name: "Dev", level: 9, steps: 7020, territories: 3, avatar: "https://i.pravatar.cc/150?img=6" },
  { id: 8, name: "Dev", level: 9, steps: 7020, territories: 3, avatar: "https://i.pravatar.cc/150?img=6" },
  { id: 9, name: "Dev", level: 9, steps: 7020, territories: 3, avatar: "https://i.pravatar.cc/150?img=6" },
  { id: 10, name: "Dev", level: 9, steps: 7020, territories: 3, avatar: "https://i.pravatar.cc/150?img=6" },
  { id: 11, name: "Dev", level: 9, steps: 7020, territories: 3, avatar: "https://i.pravatar.cc/150?img=6" },
  { id: 12, name: "Dev", level: 9, steps: 7020, territories: 3, avatar: "https://i.pravatar.cc/150?img=6" },
  { id: 13, name: "Dev", level: 9, steps: 7020, territories: 3, avatar: "https://i.pravatar.cc/150?img=6" },
  { id: 14, name: "Dev", level: 9, steps: 7020, territories: 3, avatar: "https://i.pravatar.cc/150?img=6" },
];

export default function Leaderboard() {
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

  const renderItem = ({ item, index }) => (
    <View style={styles.tableRow}>
      <Text style={[styles.cell, { flex: 0.7 }]}>
        {index + 4}
      </Text>

      <View style={[styles.nameCell, { flex: 2 }]}>
        <Image source={{ uri: item.avatar }} style={styles.tableAvatar} />
        <Text style={styles.cell}>{item.name}</Text>
      </View>

      <Text style={[styles.cell, { flex: 1.5, textAlign: "right" }]}>
        {item.steps.toLocaleString()}
      </Text>

      <Text style={[styles.cell, { flex: 1.2, textAlign: "right" }]}>
        {item.territories}
      </Text>
    </View>
  );

  const renderTopUser = (user, index) => {
    const medal = index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉";

    const isFirst = index === 0;

    const borderColor =
      index === 0
        ? "#FFD700"
        : index === 1
          ? "#C0C0C0"
          : "#CD7F32";

    return (
      <View
        style={[
          styles.topUserContainer,
          isFirst && { marginTop: -20 },
        ]}
      >
        <View style={styles.heroAvatarContainer}>
          <Image
            source={{ uri: user.avatar }}
            style={[
              styles.heroAvatar,
              {
                borderColor: borderColor,
                width: isFirst ? 110 : 85,
                height: isFirst ? 110 : 85,
              },
            ]}
          />

          <View style={styles.heroMedal}>
            <Text style={styles.heroMedalText}>{medal}</Text>
          </View>
        </View>

        <Text style={styles.heroName}>{user.name}</Text>
        <Text style={styles.heroStat}>
          {user.steps.toLocaleString()}
        </Text>

        <Text style={styles.heroSubStat}>
          {user.territories} Territories
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
        <Text style={styles.title}>Leaderboard</Text>

      <View style={styles.toggleContainer}>
        {["today", "weekly", "monthly"].map((item) => (
          <TouchableOpacity
            key={item}
            style={[
              styles.toggleButton,
              filter === item && styles.activeToggle,
            ]}
            onPress={() => setFilter(item)}
          >
            <Text
              style={[
                styles.toggleText,
                filter === item && styles.activeToggleText,
              ]}
            >
              {item.charAt(0).toUpperCase() + item.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* HERO TOP 3 */}
      <View style={styles.heroSection}>
        {renderTopUser(topThree[1], 1)}
        {renderTopUser(topThree[0], 0)}
        {renderTopUser(topThree[2], 2)}
      </View>

      {/* TABLE HEADER */}
      <View style={styles.tableHeader}>
        <Text style={[styles.headerCell, { flex: 0.7 }]}>#</Text>
        <Text style={[styles.headerCell, { flex: 2 }]}>Name</Text>
        <Text style={[styles.headerCell, { flex: 1.5, textAlign: "right" }]}>
          Steps
        </Text>
        <Text style={[styles.headerCell, { flex: 1.2, textAlign: "right" }]}>
          Terr.
        </Text>
      </View>

      {/* TABLE AREA */}
      <View style={styles.tableWrapper}>
        <View style={styles.tableContainer}>
          {paginatedData.map((item, index) =>
            renderItem({ item, index })
          )}
        </View>

        {/* PAGINATION */}
        <View style={styles.paginationContainer}>
          <TouchableOpacity
            disabled={currentPage === 1}
            onPress={() => setCurrentPage(currentPage - 1)}
          >
            <Text
              style={[
                styles.pageButton,
                currentPage === 1 && { opacity: 0.3 },
              ]}
            >
              ◀ Prev
            </Text>
          </TouchableOpacity>

          <Text style={styles.pageInfo}>
            Page {currentPage} / {totalPages}
          </Text>

          <TouchableOpacity
            disabled={currentPage === totalPages}
            onPress={() => setCurrentPage(currentPage + 1)}
          >
            <Text
              style={[
                styles.pageButton,
                currentPage === totalPages && { opacity: 0.3 },
              ]}
            >
              Next ▶
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <BottomBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F172A",
    padding: 20,
    paddingTop: 55,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
  },

  backButton: {
    marginRight: 15,
    padding: 5,
  },

  title: {
    color: "white",
    fontSize: 26,
    marginBottom: 20,
    fontWeight: "bold",
    textAlign: "center",
  },

  toggleContainer: {
    flexDirection: "row",
    backgroundColor: "#1E293B",
    borderRadius: 12,
    padding: 4,
    marginBottom: 25,
  },

  toggleButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: "center",
  },

  activeToggle: {
    backgroundColor: "cyan",
  },

  toggleText: {
    color: "#94A3B8",
    fontWeight: "600",
  },

  activeToggleText: {
    color: "#0F172A",
    fontWeight: "bold",
  },

  /* HERO SECTION */

  heroSection: {
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 30,
  },

  topUserContainer: {
    alignItems: "center",
    flex: 1,
  },

  heroAvatarContainer: {
    position: "relative",
  },

  heroAvatar: {
    width: 85,
    height: 85,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: "#FFD700",
  },

  heroMedal: {
    position: "absolute",
    bottom: -5,
    right: -5,
    backgroundColor: "#1E293B",
    borderRadius: 15,
    padding: 4,
  },

  heroMedalText: {
    fontSize: 18,
  },

  heroName: {
    color: "#fff",
    fontWeight: "bold",
    marginTop: 8,
  },

  heroStat: {
    color: "cyan",
    fontWeight: "bold",
    marginTop: 4,
  },

  heroSubStat: {
    color: "#94A3B8",
    fontSize: 12,
  },

  /* TABLE */

  tableContainer: {
    height: 240,           // Fixed table height
    backgroundColor: "#1E293B",
    overflow: "hidden",
  },

  paginationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    paddingHorizontal: 5,
  },

  tableHeader: {
    flexDirection: "row",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "cyan",
    borderTopColor: "cyan",
    backgroundColor: "#1E293B",
    padding: 15,
  },

  headerCell: {
    color: "#94A3B8",
    fontWeight: "bold",
    fontSize: 12,
  },

  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#1E293B",
    backgroundColor: "#1E293B",
    padding: 15,
  },

  cell: {
    color: "#FFFFFF",
    fontSize: 14,
  },

  nameCell: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  tableAvatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    marginRight: 8,
  },

  /* PAGINATION */

  paginationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 15,
  },

  pageButton: {
    color: "cyan",
    fontWeight: "bold",
  },

  pageInfo: {
    color: "#aaa",
  },
});