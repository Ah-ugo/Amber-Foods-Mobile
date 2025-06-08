import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function AddAddressScreen() {
  const [formData, setFormData] = useState({
    label: "",
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    postal_code: "",
    phone: "",
    is_default: false,
  });
  const [loading, setLoading] = useState(false);

  const updateFormData = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const saveAddress = async () => {
    const { label, address_line1, city, state, postal_code, phone } = formData;

    if (!label || !address_line1 || !city || !state || !postal_code || !phone) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      // Retrieve auth_token from AsyncStorage
      const authToken = await AsyncStorage.getItem("auth_token");

      if (!authToken) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(
        "https://amberfoods.onrender.com/api/addresses/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            ...formData,
            country: "Nigeria",
          }),
        }
      );

      if (response.ok) {
        Alert.alert("Success", "Address added successfully", [
          { text: "OK", onPress: () => router.back() },
        ]);
      } else {
        throw new Error("Failed to add address");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to add address. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.title}>Add Address</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Address Label *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Home, Office"
              placeholderTextColor="#666666"
              value={formData.label}
              onChangeText={(value) => updateFormData("label", value)}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Address Line 1 *</Text>
            <TextInput
              style={styles.input}
              placeholder="Street address"
              placeholderTextColor="#666666"
              value={formData.address_line1}
              onChangeText={(value) => updateFormData("address_line1", value)}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Address Line 2</Text>
            <TextInput
              style={styles.input}
              placeholder="Apartment, suite, etc. (optional)"
              placeholderTextColor="#666666"
              value={formData.address_line2}
              onChangeText={(value) => updateFormData("address_line2", value)}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>City *</Text>
              <TextInput
                style={styles.input}
                placeholder="City"
                placeholderTextColor="#666666"
                value={formData.city}
                onChangeText={(value) => updateFormData("city", value)}
              />
            </View>

            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>State *</Text>
              <TextInput
                style={styles.input}
                placeholder="State"
                placeholderTextColor="#666666"
                value={formData.state}
                onChangeText={(value) => updateFormData("state", value)}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Postal Code *</Text>
            <TextInput
              style={styles.input}
              placeholder="Postal code"
              placeholderTextColor="#666666"
              value={formData.postal_code}
              onChangeText={(value) => updateFormData("postal_code", value)}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number *</Text>
            <TextInput
              style={styles.input}
              placeholder="Phone number"
              placeholderTextColor="#666666"
              value={formData.phone}
              onChangeText={(value) => updateFormData("phone", value)}
              keyboardType="phone-pad"
            />
          </View>

          <TouchableOpacity
            style={styles.defaultCheckbox}
            onPress={() => updateFormData("is_default", !formData.is_default)}
          >
            <View
              style={[
                styles.checkbox,
                formData.is_default && styles.checkboxChecked,
              ]}
            >
              {formData.is_default && (
                <Ionicons name="checkmark" size={16} color="#ffffff" />
              )}
            </View>
            <Text style={styles.checkboxLabel}>Set as default address</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={saveAddress}
          disabled={loading}
        >
          <Text style={styles.saveButtonText}>
            {loading ? "Saving..." : "Save Address"}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  form: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    color: "#ffffff",
    fontSize: 16,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  defaultCheckbox: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#666666",
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: {
    backgroundColor: "#4CAF50",
    borderColor: "#4CAF50",
  },
  checkboxLabel: {
    color: "#ffffff",
    fontSize: 16,
  },
  footer: {
    padding: 20,
  },
  saveButton: {
    backgroundColor: "#ffffff",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "bold",
  },
});
