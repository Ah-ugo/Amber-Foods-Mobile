import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../../contexts/AuthContext";

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/auth/login");
        },
      },
    ]);
  };

  const menuItems = [
    {
      icon: "person-outline",
      title: "Edit Profile",
      onPress: () => router.push("/edit-profile"),
    },
    {
      icon: "location-outline",
      title: "Delivery Addresses",
      onPress: () => router.push("/addresses"),
    },
    {
      icon: "card-outline",
      title: "Payment Methods",
      onPress: () => {},
    },
    {
      icon: "notifications-outline",
      title: "Notifications",
      onPress: () => {},
    },
    {
      icon: "help-circle-outline",
      title: "Help & Support",
      onPress: () => {},
    },
    {
      icon: "information-circle-outline",
      title: "About",
      onPress: () => {},
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.profileInfo}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={40} color="#ffffff" />
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>
              {user?.full_name || "Guest User"}
            </Text>
            <Text style={styles.userEmail}>
              {user?.email || "guest@example.com"}
            </Text>
            <Text style={styles.userPhone}>
              {user?.phone || "No phone number"}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.menuSection}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={item.onPress}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons name={item.icon as any} size={24} color="#ffffff" />
              <Text style={styles.menuItemText}>{item.title}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#666666" />
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={24} color="#ff4444" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  header: {
    padding: 20,
    paddingTop: 40,
  },
  profileInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#333333",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  userEmail: {
    color: "#cccccc",
    fontSize: 16,
    marginBottom: 2,
  },
  userPhone: {
    color: "#cccccc",
    fontSize: 14,
  },
  menuSection: {
    marginTop: 32,
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#1a1a1a",
    marginHorizontal: 20,
    marginBottom: 2,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuItemText: {
    color: "#ffffff",
    fontSize: 16,
    marginLeft: 16,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1a1a1a",
    marginHorizontal: 20,
    marginTop: 32,
    marginBottom: 40,
    paddingVertical: 16,
    borderRadius: 12,
  },
  logoutText: {
    color: "#ff4444",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
});
