"use client";

import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
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
import { apiService, type MenuItem } from "../../services/api";

interface Review {
  _id?: string;
  menu_item_id: string;
  rating: number;
  comment: string;
}

export default function ReviewScreen() {
  const { id, reviewId } = useLocalSearchParams();
  const [menuItem, setMenuItem] = useState<MenuItem | null>(null);
  const [review, setReview] = useState<Review>({
    menu_item_id: id as string,
    rating: 5,
    comment: "",
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const isEditing = !!reviewId;

  useEffect(() => {
    loadData();
  }, [id, reviewId]);

  const loadData = async () => {
    try {
      // Load menu item
      const itemData = await apiService.getMenuItem(id as string);
      setMenuItem(itemData);

      // If editing, load existing review
      if (reviewId) {
        const reviewsResponse = await fetch(
          `https://amberfoods.onrender.com/api/reviews/${reviewId}`,
          {
            headers: {
              Authorization: `Bearer ${apiService.token}`,
            },
          }
        );
        const reviewData = await reviewsResponse.json();
        setReview({
          _id: reviewData._id,
          menu_item_id: reviewData.menu_item_id,
          rating: reviewData.rating,
          comment: reviewData.comment,
        });
      }
    } catch (error) {
      console.error("Error loading data:", error);
      Alert.alert("Error", "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleRatingChange = (newRating: number) => {
    setReview((prev) => ({ ...prev, rating: newRating }));
  };

  const handleSubmit = async () => {
    if (!review.comment.trim()) {
      Alert.alert("Error", "Please enter a comment");
      return;
    }

    try {
      setSubmitting(true);

      if (isEditing) {
        // Update existing review
        await apiService.updateReview(reviewId as string, {
          rating: review.rating,
          comment: review.comment,
        });
        Alert.alert("Success", "Review updated successfully", [
          { text: "OK", onPress: () => router.back() },
        ]);
      } else {
        // Create new review
        await apiService.createReview({
          menu_item_id: id as string,
          rating: review.rating,
          comment: review.comment,
        });
        Alert.alert("Success", "Review submitted successfully", [
          { text: "OK", onPress: () => router.back() },
        ]);
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      Alert.alert("Error", "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={100}
    >
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.title}>
          {isEditing ? "Edit Review" : "Add Review"}
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        {menuItem && (
          <View style={styles.itemInfo}>
            <Text style={styles.itemName}>{menuItem.name}</Text>
            <Text style={styles.itemDescription} numberOfLines={2}>
              {menuItem.description}
            </Text>
          </View>
        )}

        <View style={styles.ratingContainer}>
          <Text style={styles.ratingLabel}>Your Rating</Text>
          <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                onPress={() => handleRatingChange(star)}
              >
                <Ionicons
                  name={star <= review.rating ? "star" : "star-outline"}
                  size={36}
                  color={star <= review.rating ? "#FFD700" : "#666666"}
                  style={styles.star}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.commentContainer}>
          <Text style={styles.commentLabel}>Your Review</Text>
          <TextInput
            style={styles.commentInput}
            placeholder="Share your experience with this item..."
            placeholderTextColor="#666666"
            value={review.comment}
            onChangeText={(text) =>
              setReview((prev) => ({ ...prev, comment: text }))
            }
            multiline
            numberOfLines={5}
            textAlignVertical="top"
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.submitButton,
            submitting && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          <Text style={styles.submitButtonText}>
            {submitting
              ? "Submitting..."
              : isEditing
              ? "Update Review"
              : "Submit Review"}
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
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  itemInfo: {
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  itemName: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  itemDescription: {
    color: "#cccccc",
    fontSize: 14,
  },
  ratingContainer: {
    marginBottom: 24,
  },
  ratingLabel: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
  },
  starsContainer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  star: {
    marginHorizontal: 8,
  },
  commentContainer: {
    marginBottom: 24,
  },
  commentLabel: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
  },
  commentInput: {
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 16,
    color: "#ffffff",
    fontSize: 16,
    minHeight: 150,
  },
  footer: {
    padding: 20,
    paddingBottom: Platform.OS === "ios" ? 40 : 20,
  },
  submitButton: {
    backgroundColor: "#ffffff",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "bold",
  },
});
