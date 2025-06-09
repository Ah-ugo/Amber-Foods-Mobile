"use client";

import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../../contexts/AuthContext";
import { apiService, type MenuItem } from "../../services/api";

interface Review {
  _id: string;
  user_id: string;
  user_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

export default function ItemDetailScreen() {
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const [item, setItem] = useState<MenuItem | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [userReview, setUserReview] = useState<Review | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadItemData();
    }
  }, [id]);

  const loadItemData = async () => {
    try {
      // Get menu item
      const itemData = await apiService.getMenuItem(id as string);
      setItem(itemData);

      // Load reviews
      const reviewsResponse = await fetch(
        `https://amberfoods.onrender.com/api/reviews/items/${id}`,
        {
          headers: {
            Authorization: `Bearer ${apiService.token}`,
          },
        }
      );
      const reviewsData = await reviewsResponse.json();

      // Check if user has already reviewed this item
      if (user) {
        const userReviewData = reviewsData.find(
          (review: Review) => review.user_id === user._id
        );
        if (userReviewData) {
          setUserReview(userReviewData);
        }
      }

      setReviews(reviewsData);
    } catch (error) {
      console.error("Error loading item data:", error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async () => {
    if (!item) return;

    try {
      await apiService.addToCart(item._id, quantity);
      Alert.alert("Success", "Item added to cart!", [
        { text: "Continue Shopping", style: "default" },
        { text: "View Cart", onPress: () => router.push("/(tabs)/cart") },
      ]);
    } catch (error) {
      Alert.alert("Error", "Failed to add item to cart");
    }
  };

  const handleReviewAction = () => {
    if (userReview) {
      // Edit existing review
      router.push(`/review/${id}?reviewId=${userReview._id}`);
    } else {
      // Add new review
      router.push(`/review/${id}`);
    }
  };

  const renderReview = ({ item }: { item: Review }) => (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <Text style={styles.reviewerName}>{item.user_name}</Text>
        <View style={styles.ratingContainer}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Ionicons
              key={star}
              name={star <= item.rating ? "star" : "star-outline"}
              size={16}
              color="#FFD700"
            />
          ))}
        </View>
      </View>
      <Text style={styles.reviewComment}>{item.comment}</Text>
      <Text style={styles.reviewDate}>
        {new Date(item.created_at).toLocaleDateString()}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!item) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Item not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Item Images */}
        <View style={styles.imageContainer}>
          <Image
            source={{
              uri:
                item.images[0].url || "/placeholder.svg?height=300&width=400",
            }}
            style={styles.itemImage}
          />
        </View>

        {/* Item Info */}
        <View style={styles.itemInfo}>
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.itemPrice}>₦{item.price.toFixed(2)}</Text>
          <Text style={styles.itemDescription}>{item.description}</Text>

          {/* Quantity Selector */}
          <View style={styles.quantitySection}>
            <Text style={styles.quantityLabel}>Quantity</Text>
            <View style={styles.quantityContainer}>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Ionicons name="remove" size={20} color="#ffffff" />
              </TouchableOpacity>
              <Text style={styles.quantityText}>{quantity}</Text>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => setQuantity(quantity + 1)}
              >
                <Ionicons name="add" size={20} color="#ffffff" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Reviews Section */}
          <View style={styles.reviewsSection}>
            <View style={styles.reviewsHeader}>
              <Text style={styles.sectionTitle}>
                Reviews ({reviews.length})
              </Text>
              <TouchableOpacity
                style={styles.reviewButton}
                onPress={handleReviewAction}
              >
                <Text style={styles.reviewButtonText}>
                  {userReview ? "Edit Review" : "Add Review"}
                </Text>
              </TouchableOpacity>
            </View>

            {reviews.length > 0 ? (
              <FlatList
                data={reviews}
                renderItem={renderReview}
                keyExtractor={(item) => item._id}
                scrollEnabled={false}
              />
            ) : (
              <Text style={styles.noReviewsText}>No reviews yet</Text>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Add to Cart Button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.addToCartButton} onPress={addToCart}>
          <Text style={styles.addToCartText}>
            Add to Cart - ₦{(item.price * quantity).toFixed(2)}
          </Text>
        </TouchableOpacity>
      </View>
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
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    height: 300,
  },
  itemImage: {
    width: "100%",
    height: "100%",
  },
  itemInfo: {
    padding: 20,
  },
  itemName: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  itemPrice: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
  },
  itemDescription: {
    color: "#cccccc",
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
  },
  quantitySection: {
    marginBottom: 32,
  },
  quantityLabel: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#333333",
    justifyContent: "center",
    alignItems: "center",
  },
  quantityText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
    marginHorizontal: 20,
  },
  reviewsSection: {
    marginTop: 24,
  },
  reviewsHeader: {
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
  reviewButton: {
    backgroundColor: "#333333",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  reviewButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "bold",
  },
  reviewCard: {
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  reviewerName: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
  ratingContainer: {
    flexDirection: "row",
  },
  reviewComment: {
    color: "#cccccc",
    fontSize: 14,
    marginBottom: 8,
  },
  reviewDate: {
    color: "#666666",
    fontSize: 12,
  },
  noReviewsText: {
    color: "#666666",
    fontSize: 14,
    textAlign: "center",
    padding: 20,
  },
  footer: {
    backgroundColor: "#1a1a1a",
    padding: 20,
  },
  addToCartButton: {
    backgroundColor: "#ffffff",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  addToCartText: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "bold",
  },
});
