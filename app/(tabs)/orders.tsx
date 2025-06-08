import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { apiService, type Order } from "../../services/api";

export default function OrdersScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const ordersData = await apiService.getOrders();
      setOrders(ordersData);
    } catch (error) {
      console.error("Error loading orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  };

  const cancelOrder = async (orderId: string) => {
    Alert.alert("Cancel Order", "Are you sure you want to cancel this order?", [
      { text: "No", style: "cancel" },
      {
        text: "Yes",
        style: "destructive",
        onPress: async () => {
          try {
            await fetch(
              `https://amberfoods.onrender.com/api/orders/${orderId}/cancel`,
              {
                method: "PUT",
                headers: {
                  Authorization: `Bearer ${apiService.token}`,
                },
              }
            );
            await loadOrders();
          } catch (error) {
            Alert.alert("Error", "Failed to cancel order");
          }
        },
      },
    ]);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "#FFA500";
      case "CONFIRMED":
        return "#4CAF50";
      case "PREPARING":
        return "#2196F3";
      case "READY":
        return "#9C27B0";
      case "EN_ROUTE":
        return "#FF9800";
      case "DELIVERED":
        return "#4CAF50";
      case "CANCELLED":
        return "#F44336";
      default:
        return "#666666";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING":
        return "time-outline";
      case "CONFIRMED":
        return "checkmark-circle-outline";
      case "PREPARING":
        return "restaurant-outline";
      case "READY":
        return "bag-check-outline";
      case "EN_ROUTE":
        return "car-outline";
      case "DELIVERED":
        return "checkmark-done-outline";
      case "CANCELLED":
        return "close-circle-outline";
      default:
        return "help-outline";
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading orders...</Text>
      </View>
    );
  }

  if (orders.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="receipt-outline" size={80} color="#666666" />
        <Text style={styles.emptyTitle}>No orders yet</Text>
        <Text style={styles.emptySubtitle}>
          Start ordering to see your order history
        </Text>
        <TouchableOpacity
          style={styles.browseButton}
          onPress={() => router.push("/(tabs)/menu")}
        >
          <Text style={styles.browseButtonText}>Browse Menu</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>Your Orders</Text>
      </View>

      {orders.map((order) => (
        <TouchableOpacity
          key={order._id}
          style={styles.orderCard}
          onPress={() => router.push(`/order/${order._id}`)}
        >
          <View style={styles.orderHeader}>
            <View style={styles.orderInfo}>
              <Text style={styles.orderId}>Order #{order._id.slice(-6)}</Text>
              <Text style={styles.orderDate}>
                {new Date(order.created_at).toLocaleDateString()}
              </Text>
            </View>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(order.status) },
              ]}
            >
              <Ionicons
                name={getStatusIcon(order.status) as any}
                size={16}
                color="#ffffff"
              />
              <Text style={styles.statusText}>{order.status}</Text>
            </View>
          </View>

          <View style={styles.orderItems}>
            <Text style={styles.itemsText}>
              {order.items.length} item{order.items.length > 1 ? "s" : ""}
            </Text>
            <Text style={styles.orderTotal}>
              ${order.total_amount.toFixed(2)}
            </Text>
          </View>

          <View style={styles.orderActions}>
            <TouchableOpacity
              style={styles.trackButton}
              onPress={() => router.push(`/order/${order._id}`)}
            >
              <Text style={styles.trackButtonText}>Track Order</Text>
            </TouchableOpacity>
            {order.status === "PENDING" && (
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => cancelOrder(order._id)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000000",
  },
  loadingText: {
    color: "#ffffff",
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000000",
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
    marginBottom: 32,
  },
  browseButton: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  browseButtonText: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "bold",
  },
  header: {
    padding: 20,
    paddingTop: 40,
  },
  title: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "bold",
  },
  orderCard: {
    backgroundColor: "#1a1a1a",
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  orderInfo: {
    flex: 1,
  },
  orderId: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
  orderDate: {
    color: "#cccccc",
    fontSize: 14,
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "bold",
    marginLeft: 4,
  },
  orderItems: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  itemsText: {
    color: "#cccccc",
    fontSize: 14,
  },
  orderTotal: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
  },
  orderActions: {
    flexDirection: "row",
    gap: 12,
  },
  trackButton: {
    flex: 1,
    backgroundColor: "#ffffff",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  trackButtonText: {
    color: "#000000",
    fontSize: 14,
    fontWeight: "bold",
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#333333",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "bold",
  },
});
