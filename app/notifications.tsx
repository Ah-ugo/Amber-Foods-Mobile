"use client";

import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: "order" | "promotion" | "system";
  is_read: boolean;
  created_at: string;
  order_id?: string;
}

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      // Mock notifications for now - replace with actual API call
      const mockNotifications: Notification[] = [
        {
          _id: "1",
          title: "Order Confirmed",
          message:
            "Your order #12345 has been confirmed and is being prepared.",
          type: "order",
          is_read: false,
          created_at: new Date().toISOString(),
          order_id: "12345",
        },
        {
          _id: "2",
          title: "Special Offer",
          message: "Get 20% off on your next order! Use code SAVE20",
          type: "promotion",
          is_read: true,
          created_at: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          _id: "3",
          title: "Order Delivered",
          message: "Your order #12344 has been delivered successfully.",
          type: "order",
          is_read: true,
          created_at: new Date(Date.now() - 172800000).toISOString(),
          order_id: "12344",
        },
      ];

      setNotifications(mockNotifications);
    } catch (error) {
      console.error("Error loading notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  const markAsRead = async (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification._id === notificationId
          ? { ...notification, is_read: true }
          : notification
      )
    );
  };

  const handleNotificationPress = (notification: Notification) => {
    if (!notification.is_read) {
      markAsRead(notification._id);
    }

    if (notification.type === "order" && notification.order_id) {
      router.push(`/order/${notification.order_id}`);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "order":
        return "receipt-outline";
      case "promotion":
        return "gift-outline";
      case "system":
        return "information-circle-outline";
      default:
        return "notifications-outline";
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "order":
        return "#4CAF50";
      case "promotion":
        return "#FF9800";
      case "system":
        return "#2196F3";
      default:
        return "#666666";
    }
  };

  const renderNotification = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      style={[
        styles.notificationCard,
        !item.is_read && styles.unreadNotification,
      ]}
      onPress={() => handleNotificationPress(item)}
    >
      <View style={styles.notificationContent}>
        <View style={styles.notificationHeader}>
          <View style={styles.notificationIconContainer}>
            <Ionicons
              name={getNotificationIcon(item.type) as any}
              size={24}
              color={getNotificationColor(item.type)}
            />
          </View>
          <View style={styles.notificationInfo}>
            <Text
              style={[
                styles.notificationTitle,
                !item.is_read && styles.unreadTitle,
              ]}
            >
              {item.title}
            </Text>
            <Text style={styles.notificationTime}>
              {new Date(item.created_at).toLocaleDateString()}
            </Text>
          </View>
          {!item.is_read && <View style={styles.unreadDot} />}
        </View>
        <Text style={styles.notificationMessage}>{item.message}</Text>
      </View>
    </TouchableOpacity>
  );

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.title}>Notifications</Text>
        {unreadCount > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
          </View>
        )}
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading notifications...</Text>
        </View>
      ) : notifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="notifications-outline" size={80} color="#666666" />
          <Text style={styles.emptyTitle}>No Notifications</Text>
          <Text style={styles.emptySubtitle}>
            You're all caught up! Check back later for updates.
          </Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderNotification}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.notificationsList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  title: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
  },
  unreadBadge: {
    backgroundColor: "#ff4444",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 24,
    alignItems: "center",
  },
  unreadBadgeText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#ffffff",
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyTitle: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubtitle: {
    color: "#cccccc",
    fontSize: 16,
    textAlign: "center",
  },
  notificationsList: {
    padding: 20,
  },
  notificationCard: {
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  unreadNotification: {
    backgroundColor: "#2a2a2a",
    borderLeftWidth: 4,
    borderLeftColor: "#4CAF50",
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  notificationIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#333333",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  notificationInfo: {
    flex: 1,
  },
  notificationTitle: {
    color: "#cccccc",
    fontSize: 16,
    fontWeight: "bold",
  },
  unreadTitle: {
    color: "#ffffff",
  },
  notificationTime: {
    color: "#666666",
    fontSize: 12,
    marginTop: 2,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#4CAF50",
  },
  notificationMessage: {
    color: "#cccccc",
    fontSize: 14,
    lineHeight: 20,
  },
});
