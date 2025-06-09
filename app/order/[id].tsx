import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { apiService, type Order } from "../../services/api";

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadOrderDetail();
    }
  }, [id]);

  const loadOrderDetail = async () => {
    try {
      const orderData = await apiService.getOrder(id as string);
      setOrder(orderData);
    } catch (error) {
      console.error("Error loading order detail:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusSteps = (currentStatus: string) => {
    const steps = [
      { key: "PENDING", label: "Order Placed", icon: "checkmark-circle" },
      { key: "CONFIRMED", label: "Confirmed", icon: "checkmark-circle" },
      { key: "PREPARING", label: "Preparing", icon: "restaurant" },
      { key: "READY", label: "Ready", icon: "bag-check" },
      { key: "EN_ROUTE", label: "On the way", icon: "car" },
      { key: "DELIVERED", label: "Delivered", icon: "checkmark-done" },
    ];

    const currentIndex = steps.findIndex((step) => step.key === currentStatus);
    return steps.map((step, index) => ({
      ...step,
      completed: index <= currentIndex,
      active: index === currentIndex,
    }));
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading order details...</Text>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Order not found</Text>
      </View>
    );
  }

  const statusSteps = getStatusSteps(order.status);

  return (
    <ScrollView style={styles.container}>
      {/* Order Header */}
      <View style={styles.header}>
        <Text style={styles.orderTitle}>Order #{order._id.slice(-6)}</Text>
        <Text style={styles.orderDate}>
          Placed on {new Date(order.created_at).toLocaleDateString()}
        </Text>
      </View>

      {/* Order Status Tracking */}
      <View style={styles.trackingSection}>
        <Text style={styles.sectionTitle}>Order Status</Text>
        <View style={styles.statusTracker}>
          {statusSteps.map((step, index) => (
            <View key={step.key} style={styles.statusStep}>
              <View style={styles.statusStepLeft}>
                <View
                  style={[
                    styles.statusIcon,
                    step.completed && styles.statusIconCompleted,
                    step.active && styles.statusIconActive,
                  ]}
                >
                  <Ionicons
                    name={step.icon as any}
                    size={20}
                    color={step.completed ? "#ffffff" : "#666666"}
                  />
                </View>
                {index < statusSteps.length - 1 && (
                  <View
                    style={[
                      styles.statusLine,
                      step.completed && styles.statusLineCompleted,
                    ]}
                  />
                )}
              </View>
              <View style={styles.statusStepRight}>
                <Text
                  style={[
                    styles.statusLabel,
                    step.completed && styles.statusLabelCompleted,
                  ]}
                >
                  {step.label}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Order Items */}
      <View style={styles.itemsSection}>
        <Text style={styles.sectionTitle}>Order Items</Text>
        {order.items.map((item) => (
          <View key={item._id} style={styles.orderItem}>
            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemQuantity}>Qty: {item.quantity}</Text>
            </View>
            <Text style={styles.itemPrice}>₦{item.subtotal.toFixed(2)}</Text>
          </View>
        ))}
      </View>

      {/* Order Summary */}
      <View style={styles.summarySection}>
        <Text style={styles.sectionTitle}>Order Summary</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal</Text>
          <Text style={styles.summaryValue}>₦{order.subtotal.toFixed(2)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Delivery Fee</Text>
          <Text style={styles.summaryValue}>
            ₦{order.delivery_fee.toFixed(2)}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Tax</Text>
          <Text style={styles.summaryValue}>₦{order.tax.toFixed(2)}</Text>
        </View>
        <View style={[styles.summaryRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>
            ₦{order.total_amount.toFixed(2)}
          </Text>
        </View>
      </View>

      {/* Special Instructions */}
      {order.special_instructions && (
        <View style={styles.instructionsSection}>
          <Text style={styles.sectionTitle}>Special Instructions</Text>
          <Text style={styles.instructionsText}>
            {order.special_instructions}
          </Text>
        </View>
      )}

      {/* Actions */}
      <View style={styles.actionsSection}>
        {order.status === "PENDING" && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => {
              Alert.alert("Cancel Order", "Are you sure?", [
                { text: "No", style: "cancel" },
                { text: "Yes", onPress: () => router.back() },
              ]);
            }}
          >
            <Text style={styles.cancelButtonText}>Cancel Order</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.reorderButton}
          onPress={() => router.push("/(tabs)/menu")}
        >
          <Text style={styles.reorderButtonText}>Reorder</Text>
        </TouchableOpacity>
      </View>
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
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000000",
  },
  errorText: {
    color: "#ffffff",
    fontSize: 16,
  },
  header: {
    padding: 20,
    paddingTop: 40,
  },
  orderTitle: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "bold",
  },
  orderDate: {
    color: "#cccccc",
    fontSize: 16,
    marginTop: 4,
  },
  trackingSection: {
    backgroundColor: "#1a1a1a",
    margin: 20,
    borderRadius: 12,
    padding: 20,
  },
  sectionTitle: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  statusTracker: {
    paddingLeft: 10,
  },
  statusStep: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  statusStepLeft: {
    alignItems: "center",
    marginRight: 16,
  },
  statusIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#333333",
    justifyContent: "center",
    alignItems: "center",
  },
  statusIconCompleted: {
    backgroundColor: "#4CAF50",
  },
  statusIconActive: {
    backgroundColor: "#2196F3",
  },
  statusLine: {
    width: 2,
    height: 40,
    backgroundColor: "#333333",
    marginTop: 8,
  },
  statusLineCompleted: {
    backgroundColor: "#4CAF50",
  },
  statusStepRight: {
    flex: 1,
    paddingTop: 8,
  },
  statusLabel: {
    color: "#666666",
    fontSize: 16,
  },
  statusLabelCompleted: {
    color: "#ffffff",
    fontWeight: "bold",
  },
  itemsSection: {
    backgroundColor: "#1a1a1a",
    margin: 20,
    borderRadius: 12,
    padding: 20,
  },
  orderItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#333333",
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
  itemQuantity: {
    color: "#cccccc",
    fontSize: 14,
    marginTop: 2,
  },
  itemPrice: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
  summarySection: {
    backgroundColor: "#1a1a1a",
    margin: 20,
    borderRadius: 12,
    padding: 20,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  summaryLabel: {
    color: "#cccccc",
    fontSize: 16,
  },
  summaryValue: {
    color: "#ffffff",
    fontSize: 16,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: "#333333",
    marginTop: 8,
    paddingTop: 16,
  },
  totalLabel: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
  },
  totalValue: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
  },
  instructionsSection: {
    backgroundColor: "#1a1a1a",
    margin: 20,
    borderRadius: 12,
    padding: 20,
  },
  instructionsText: {
    color: "#cccccc",
    fontSize: 16,
    lineHeight: 24,
  },
  actionsSection: {
    padding: 20,
    gap: 12,
  },
  cancelButton: {
    backgroundColor: "#333333",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
  reorderButton: {
    backgroundColor: "#ffffff",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  reorderButtonText: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "bold",
  },
});
