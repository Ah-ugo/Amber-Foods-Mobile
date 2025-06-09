"use client";

import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { apiService } from "../services/api";

interface Review {
  _id: string;
  menu_item_id: string;
  menu_item_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

export default function MyReviewsScreen() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      const response = await fetch(
        "https://amberfoods.onrender.com/api/reviews/my-reviews",
        {
          headers: {
            Authorization: `Bearer ${apiService.token}`,
          },
        }
      );
      const reviewsData = await response.json();
      setReviews(reviewsData);
    } catch (error) {
      console.error("Error loading reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadReviews();
    setRefreshing(false);
  };

  const deleteReview = async (reviewId: string) => {
    Alert.alert(
      "Delete Review",
      "Are you sure you want to delete this review?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await apiService.deleteReview(reviewId);
              setReviews((prevReviews) =>
                prevReviews.filter((review) => review._id !== reviewId)
              );
            } catch (error) {
              Alert.alert("Error", "Failed to delete review");
            }
          },
        },
      ]
    );
  };

  const renderReviewItem = ({ item }: { item: Review }) => (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <Text style={styles.itemName}>{item.menu_item_name}</Text>
        <Text style={styles.reviewDate}>
          {new Date(item.created_at).toLocaleDateString()}
        </Text>
      </View>

      <View style={styles.ratingContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Ionicons
            key={star}
            name={star <= item.rating ? "star" : "star-outline"}
            size={16}
            color="#FFD700"
            style={styles.star}
          />
        ))}
      </View>

      <Text style={styles.reviewComment}>{item.comment}</Text>

      <View style={styles.reviewActions}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() =>
            router.push(`/review/${item.menu_item_id}?reviewId=${item._id}`)
          }
        >
          <Ionicons name="pencil" size={16} color="#ffffff" />
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => deleteReview(item._id)}
        >
          <Ionicons name="trash" size={16} color="#ff4444" />
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.title}>My Reviews</Text>
        <View style={styles.placeholder} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading reviews...</Text>
        </View>
      ) : reviews.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="star-outline" size={80} color="#666666" />
          <Text style={styles.emptyTitle}>No Reviews Yet</Text>
          <Text style={styles.emptySubtitle}>
            You haven't reviewed any items yet
          </Text>
          <TouchableOpacity
            style={styles.browseButton}
            onPress={() => router.push("/(tabs)/menu")}
          >
            <Text style={styles.browseButtonText}>Browse Menu</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={reviews}
          renderItem={renderReviewItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.reviewsList}
          refreshing={refreshing}
          onRefresh={onRefresh}
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
  },
  placeholder: {
    width: 40,
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
  reviewsList: {
    padding: 20,
  },
  reviewCard: {
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  itemName: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
  reviewDate: {
    color: "#666666",
    fontSize: 12,
  },
  ratingContainer: {
    flexDirection: "row",
    marginBottom: 12,
  },
  star: {
    marginRight: 4,
  },
  reviewComment: {
    color: "#cccccc",
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  reviewActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#333333",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 12,
  },
  editButtonText: {
    color: "#ffffff",
    fontSize: 14,
    marginLeft: 4,
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#331111",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  deleteButtonText: {
    color: "#ff4444",
    fontSize: 14,
    marginLeft: 4,
  },
});
