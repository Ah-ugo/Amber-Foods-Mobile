import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { apiService, type Cart } from "../services/api";

interface Address {
  _id: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
  label: string;
  phone: string;
}

export default function CheckoutScreen() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string>("");
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCheckoutData();
  }, []);

  const loadCheckoutData = async () => {
    try {
      const [cartData, addressesData] = await Promise.all([
        apiService.getCart(),
        fetch("https://amberfoods.onrender.com/api/addresses/", {
          headers: {
            Authorization: `Bearer ${apiService.token}`,
          },
        }).then((res) => res.json()),
      ]);

      setCart(cartData);
      setAddresses(addressesData);

      // Select default address if available
      const defaultAddress = addressesData.find(
        (addr: Address) => addr.is_default
      );
      if (defaultAddress) {
        setSelectedAddress(defaultAddress._id);
      }
    } catch (error) {
      console.error("Error loading checkout data:", error);
    } finally {
      setLoading(false);
    }
  };

  const placeOrder = async () => {
    if (!selectedAddress) {
      Alert.alert("Error", "Please select a delivery address");
      return;
    }

    if (!cart || cart.items.length === 0) {
      Alert.alert("Error", "Your cart is empty");
      return;
    }

    try {
      const orderData = {
        delivery_address_id: selectedAddress,
        special_instructions: specialInstructions,
        cart_id: cart._id,
      };

      const order = await apiService.createOrder(orderData);

      // Initialize payment
      const paymentResponse = await fetch(
        `https://amberfoods.onrender.com/api/payments/paystack/initialize?order_id=${order._id}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiService.token}`,
          },
        }
      );

      const paymentUrl = await paymentResponse.text();

      Alert.alert("Order Placed!", "Your order has been placed successfully", [
        {
          text: "View Order",
          onPress: () => router.replace(`/order/${order._id}`),
        },
      ]);
    } catch (error) {
      Alert.alert("Error", "Failed to place order. Please try again.");
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Your cart is empty</Text>
        <TouchableOpacity
          style={styles.browseButton}
          onPress={() => router.push("/(tabs)/menu")}
        >
          <Text style={styles.browseButtonText}>Browse Menu</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const deliveryFee = 5.0;
  const tax = cart.total * 0.1;
  const totalAmount = cart.total + deliveryFee + tax;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Checkout</Text>
      </View>

      {/* Delivery Address */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Delivery Address</Text>
          <TouchableOpacity onPress={() => router.push("/addresses")}>
            <Text style={styles.addAddressText}>Add New</Text>
          </TouchableOpacity>
        </View>

        {addresses.length === 0 ? (
          <View style={styles.noAddressContainer}>
            <Text style={styles.noAddressText}>
              No delivery addresses found
            </Text>
            <TouchableOpacity
              style={styles.addAddressButton}
              onPress={() => router.push("/addresses")}
            >
              <Text style={styles.addAddressButtonText}>Add Address</Text>
            </TouchableOpacity>
          </View>
        ) : (
          addresses.map((address) => (
            <TouchableOpacity
              key={address._id}
              style={[
                styles.addressCard,
                selectedAddress === address._id && styles.addressCardSelected,
              ]}
              onPress={() => setSelectedAddress(address._id)}
            >
              <View style={styles.addressInfo}>
                <Text style={styles.addressLabel}>{address.label}</Text>
                <Text style={styles.addressText}>
                  {address.address_line1}
                  {address.address_line2 ? `, ${address.address_line2}` : ""}
                </Text>
                <Text style={styles.addressText}>
                  {address.city}, {address.state} {address.postal_code}
                </Text>
                <Text style={styles.addressPhone}>{address.phone}</Text>
              </View>
              <View style={styles.radioButton}>
                {selectedAddress === address._id && (
                  <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                )}
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>

      {/* Order Items */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Order Items</Text>
        {cart.items.map((item) => (
          <View key={item._id} style={styles.orderItem}>
            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemQuantity}>Qty: {item.quantity}</Text>
            </View>
            <Text style={styles.itemPrice}>${item.subtotal.toFixed(2)}</Text>
          </View>
        ))}
      </View>

      {/* Special Instructions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Special Instructions</Text>
        <TextInput
          style={styles.instructionsInput}
          placeholder="Any special instructions for your order..."
          placeholderTextColor="#666666"
          value={specialInstructions}
          onChangeText={setSpecialInstructions}
          multiline
          numberOfLines={3}
        />
      </View>

      {/* Order Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Order Summary</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal</Text>
          <Text style={styles.summaryValue}>${cart.total.toFixed(2)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Delivery Fee</Text>
          <Text style={styles.summaryValue}>${deliveryFee.toFixed(2)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Tax</Text>
          <Text style={styles.summaryValue}>${tax.toFixed(2)}</Text>
        </View>
        <View style={[styles.summaryRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>${totalAmount.toFixed(2)}</Text>
        </View>
      </View>

      {/* Place Order Button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.placeOrderButton} onPress={placeOrder}>
          <Text style={styles.placeOrderText}>
            Place Order - ${totalAmount.toFixed(2)}
          </Text>
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
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000000",
    paddingHorizontal: 40,
  },
  emptyText: {
    color: "#ffffff",
    fontSize: 18,
    marginBottom: 20,
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
  section: {
    backgroundColor: "#1a1a1a",
    margin: 20,
    borderRadius: 12,
    padding: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
  },
  addAddressText: {
    color: "#4CAF50",
    fontSize: 14,
    fontWeight: "bold",
  },
  noAddressContainer: {
    alignItems: "center",
    paddingVertical: 20,
  },
  noAddressText: {
    color: "#cccccc",
    fontSize: 16,
    marginBottom: 16,
  },
  addAddressButton: {
    backgroundColor: "#333333",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addAddressButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "bold",
  },
  addressCard: {
    flexDirection: "row",
    backgroundColor: "#333333",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  addressCardSelected: {
    backgroundColor: "#2a4a2a",
    borderWidth: 2,
    borderColor: "#4CAF50",
  },
  addressInfo: {
    flex: 1,
  },
  addressLabel: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  addressText: {
    color: "#cccccc",
    fontSize: 14,
    marginBottom: 2,
  },
  addressPhone: {
    color: "#cccccc",
    fontSize: 14,
  },
  radioButton: {
    justifyContent: "center",
    alignItems: "center",
    width: 30,
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
  instructionsInput: {
    backgroundColor: "#333333",
    borderRadius: 8,
    padding: 16,
    color: "#ffffff",
    fontSize: 16,
    textAlignVertical: "top",
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
  footer: {
    padding: 20,
  },
  placeOrderButton: {
    backgroundColor: "#ffffff",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  placeOrderText: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "bold",
  },
});
