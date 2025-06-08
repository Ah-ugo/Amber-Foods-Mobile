import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
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

export default function AddressesScreen() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      const authToken = await AsyncStorage.getItem("auth_token");
      if (!authToken) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(
        "https://amberfoods.onrender.com/api/addresses/",
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      const addressesData = await response.json();
      setAddresses(addressesData);
    } catch (error) {
      console.error("Error loading addresses:", error);
      Alert.alert("Error", "Failed to load addresses. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAddresses();
    setRefreshing(false);
  };

  const deleteAddress = async (addressId: string) => {
    Alert.alert(
      "Delete Address",
      "Are you sure you want to delete this address?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const authToken = await AsyncStorage.getItem("auth_token");
              if (!authToken) {
                throw new Error("No authentication token found");
              }

              const response = await fetch(
                `https://amberfoods.onrender.com/api/addresses/${addressId}`,
                {
                  method: "DELETE",
                  headers: {
                    Authorization: `Bearer ${authToken}`,
                  },
                }
              );

              if (response.ok) {
                await loadAddresses();
              } else {
                throw new Error("Failed to delete address");
              }
            } catch (error) {
              Alert.alert("Error", "Failed to delete address");
            }
          },
        },
      ]
    );
  };

  const setDefaultAddress = async (addressId: string) => {
    try {
      const authToken = await AsyncStorage.getItem("auth_token");
      if (!authToken) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(
        `https://amberfoods.onrender.com/api/addresses/${addressId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({ is_default: true }),
        }
      );

      if (response.ok) {
        await loadAddresses();
      } else {
        throw new Error("Failed to set default address");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to set default address");
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading addresses...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.title}>Delivery Addresses</Text>
        <TouchableOpacity
          onPress={() => router.push("/add-address")}
          style={styles.addButton}
        >
          <Ionicons name="add" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {addresses.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="location-outline" size={80} color="#666666" />
            <Text style={styles.emptyTitle}>No addresses found</Text>
            <Text style={styles.emptySubtitle}>
              Add your first delivery address
            </Text>
            <TouchableOpacity
              style={styles.addFirstButton}
              onPress={() => router.push("/add-address")}
            >
              <Text style={styles.addFirstButtonText}>Add Address</Text>
            </TouchableOpacity>
          </View>
        ) : (
          addresses.map((address) => (
            <View key={address._id} style={styles.addressCard}>
              <View style={styles.addressHeader}>
                <View style={styles.addressLabelContainer}>
                  <Text style={styles.addressLabel}>{address.label}</Text>
                  {address.is_default && (
                    <View style={styles.defaultBadge}>
                      <Text style={styles.defaultText}>Default</Text>
                    </View>
                  )}
                </View>
                <TouchableOpacity
                  style={styles.menuButton}
                  onPress={() => {
                    Alert.alert("Address Options", "", [
                      { text: "Cancel", style: "cancel" },
                      {
                        text: "Edit",
                        onPress: () =>
                          router.push(`/edit-address/${address._id}`),
                      },
                      {
                        text: "Set as Default",
                        onPress: () => setDefaultAddress(address._id),
                      },
                      {
                        text: "Delete",
                        style: "destructive",
                        onPress: () => deleteAddress(address._id),
                      },
                    ]);
                  }}
                >
                  <Ionicons
                    name="ellipsis-vertical"
                    size={20}
                    color="#ffffff"
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.addressInfo}>
                <Text style={styles.addressText}>
                  {address.address_line1}
                  {address.address_line2 ? `, ${address.address_line2}` : ""}
                </Text>
                <Text style={styles.addressText}>
                  {address.city}, {address.state} {address.postal_code}
                </Text>
                <Text style={styles.addressText}>{address.country}</Text>
                <Text style={styles.addressPhone}>{address.phone}</Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
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
  },
  addButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    paddingVertical: 100,
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
  addFirstButton: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  addFirstButtonText: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "bold",
  },
  addressCard: {
    backgroundColor: "#1a1a1a",
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
  },
  addressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  addressLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  addressLabel: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
    marginRight: 12,
  },
  defaultBadge: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  defaultText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "bold",
  },
  menuButton: {
    padding: 8,
  },
  addressInfo: {
    marginTop: 8,
  },
  addressText: {
    color: "#cccccc",
    fontSize: 16,
    marginBottom: 4,
  },
  addressPhone: {
    color: "#cccccc",
    fontSize: 14,
    marginTop: 8,
  },
});
