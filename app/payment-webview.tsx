"use client";

import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { WebView } from "react-native-webview";

export default function PaymentWebViewScreen() {
  const { paymentUrl, orderId } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);

  // Handle navigation state changes
  const handleNavigationStateChange = (navState: any) => {
    // Check if the URL contains success or callback parameters
    if (navState.url.includes("callback") || navState.url.includes("success")) {
      // Payment completed, redirect to order details
      router.replace(`/order/${orderId}`);
    }
  };

  if (!paymentUrl) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Invalid payment URL</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.closeButton}
        >
          <Ionicons name="close" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.title}>Payment</Text>
        <View style={styles.placeholder} />
      </View>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ffffff" />
          <Text style={styles.loadingText}>Loading payment gateway...</Text>
        </View>
      )}

      <WebView
        source={{ uri: paymentUrl as string }}
        style={styles.webview}
        onLoadEnd={() => setLoading(false)}
        onNavigationStateChange={handleNavigationStateChange}
      />
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
    backgroundColor: "#000000",
    zIndex: 10,
  },
  closeButton: {
    padding: 8,
  },
  title: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "bold",
  },
  placeholder: {
    width: 40,
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.8)",
    zIndex: 5,
  },
  loadingText: {
    color: "#ffffff",
    fontSize: 16,
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000000",
    padding: 20,
  },
  errorText: {
    color: "#ffffff",
    fontSize: 18,
    marginBottom: 20,
    textAlign: "center",
  },
  backButton: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "bold",
  },
});
