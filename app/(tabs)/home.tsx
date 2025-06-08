import { useAuth } from "@/contexts/AuthContext";
import { apiService, type Category, type MenuItem } from "@/services/api";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function HomeScreen() {
  const { user } = useAuth();
  const [featuredItems, setFeaturedItems] = useState<MenuItem[]>([]);
  const [bestSellingItems, setBestSellingItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [featuredData, bestSellingData, categoriesData] = await Promise.all(
        [
          apiService.getMenuItems({ featured: true }),
          apiService.getBestSellingItems(5),
          apiService.getCategories(),
        ]
      );

      setFeaturedItems(featuredData);
      setBestSellingItems(bestSellingData);
      setCategories(categoriesData);
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const renderFeaturedItem = ({ item }: { item: MenuItem }) => (
    <TouchableOpacity
      style={styles.featuredCard}
      onPress={() => router.push(`/item/${item._id}`)}
    >
      <Image
        source={{
          uri: item.images[0].url || "/placeholder.svg?height=120&width=200",
        }}
        style={styles.featuredImage}
      />
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.8)"]}
        style={styles.featuredGradient}
      >
        <Text style={styles.featuredTitle}>{item.name}</Text>
        <Text style={styles.featuredPrice}>${item.price.toFixed(2)}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderBestSellingItem = ({ item }: { item: MenuItem }) => (
    <TouchableOpacity
      style={styles.bestSellingCard}
      onPress={() => router.push(`/item/${item._id}`)}
    >
      <Image
        source={{
          uri: item.images[0].url || "/placeholder.svg?height=80&width=80",
        }}
        style={styles.bestSellingImage}
      />
      <View style={styles.bestSellingInfo}>
        <Text style={styles.bestSellingTitle}>{item.name}</Text>
        <Text style={styles.bestSellingDescription} numberOfLines={2}>
          {item.description}
        </Text>
        <Text style={styles.bestSellingPrice}>${item.price.toFixed(2)}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderCategory = ({ item }: { item: Category }) => (
    <TouchableOpacity
      style={styles.categoryCard}
      onPress={() => router.push(`/menu?category=${item._id}`)}
    >
      <View style={styles.categoryIcon}>
        <Ionicons name="restaurant" size={24} color="#ffffff" />
      </View>
      <Text style={styles.categoryTitle}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <LinearGradient colors={["#000000", "#333333"]} style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>
              Hello, {user?.full_name || "Guest"}!
            </Text>
            <Text style={styles.subtitle}>
              What would you like to eat today?
            </Text>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <Ionicons name="notifications-outline" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color="#666666"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for food..."
            placeholderTextColor="#666666"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={() => router.push(`/menu?search=${searchQuery}`)}
          />
        </View>
      </LinearGradient>

      {/* Categories */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Categories</Text>
        <FlatList
          data={categories}
          renderItem={renderCategory}
          keyExtractor={(item) => item._id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}
        />
      </View>

      {/* Featured Items */}
      {featuredItems.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Featured Items</Text>
          <FlatList
            data={featuredItems}
            renderItem={renderFeaturedItem}
            keyExtractor={(item) => item._id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.featuredList}
          />
        </View>
      )}

      {/* Best Selling */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Best Selling</Text>
          <TouchableOpacity onPress={() => router.push("/menu")}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        {bestSellingItems.map((item) => (
          <View key={item._id}>{renderBestSellingItem({ item })}</View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  greeting: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
  },
  subtitle: {
    fontSize: 16,
    color: "#cccccc",
    marginTop: 4,
  },
  notificationButton: {
    padding: 8,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    color: "#ffffff",
    fontSize: 16,
  },
  section: {
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ffffff",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  seeAllText: {
    color: "#cccccc",
    fontSize: 14,
  },
  categoriesList: {
    paddingHorizontal: 20,
  },
  categoryCard: {
    alignItems: "center",
    marginRight: 16,
    width: 80,
  },
  categoryIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#333333",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  categoryTitle: {
    color: "#ffffff",
    fontSize: 12,
    textAlign: "center",
  },
  featuredList: {
    paddingHorizontal: 20,
  },
  featuredCard: {
    width: 200,
    height: 120,
    borderRadius: 12,
    overflow: "hidden",
    marginRight: 16,
  },
  featuredImage: {
    width: "100%",
    height: "100%",
  },
  featuredGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
  },
  featuredTitle: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
  featuredPrice: {
    color: "#ffffff",
    fontSize: 14,
    marginTop: 4,
  },
  bestSellingCard: {
    flexDirection: "row",
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 20,
    marginBottom: 12,
  },
  bestSellingImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  bestSellingInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "space-between",
  },
  bestSellingTitle: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
  bestSellingDescription: {
    color: "#cccccc",
    fontSize: 14,
    marginTop: 4,
  },
  bestSellingPrice: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 8,
  },
});
