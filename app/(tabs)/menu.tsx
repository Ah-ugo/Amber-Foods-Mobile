import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { apiService, type Category, type MenuItem } from "../../services/api";

export default function MenuScreen() {
  const params = useLocalSearchParams();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(
    (params.category as string) || ""
  );
  const [searchQuery, setSearchQuery] = useState<string>(
    (params.search as string) || ""
  );
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, [selectedCategory, searchQuery]);

  const loadData = async () => {
    try {
      const [itemsData, categoriesData] = await Promise.all([
        apiService.getMenuItems({
          category: selectedCategory || undefined,
          search: searchQuery || undefined,
        }),
        apiService.getCategories(),
      ]);

      setMenuItems(itemsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error("Error loading menu data:", error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const addToCart = async (item: MenuItem) => {
    try {
      await apiService.addToCart(item._id, 1);
      // Show success feedback
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  };

  const renderCategory = ({ item }: { item: Category }) => (
    <TouchableOpacity
      style={[
        styles.categoryChip,
        selectedCategory === item._id && styles.categoryChipActive,
      ]}
      onPress={() =>
        setSelectedCategory(selectedCategory === item._id ? "" : item._id)
      }
    >
      <Text
        style={[
          styles.categoryChipText,
          selectedCategory === item._id && styles.categoryChipTextActive,
        ]}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const renderMenuItem = ({ item }: { item: MenuItem }) => (
    <TouchableOpacity
      style={styles.menuItemCard}
      onPress={() => router.push(`/item/${item._id}`)}
    >
      <Image
        source={{
          uri: item.images[0].url || "/placeholder.svg?height=120&width=120",
        }}
        style={styles.menuItemImage}
      />
      <View style={styles.menuItemInfo}>
        <Text style={styles.menuItemName}>{item.name}</Text>
        <Text style={styles.menuItemDescription} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.menuItemFooter}>
          <Text style={styles.menuItemPrice}>₦{item.price.toFixed(2)}</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => addToCart(item)}
          >
            <Ionicons name="add" size={20} color="#000000" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
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
          placeholder="Search menu items..."
          placeholderTextColor="#666666"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={() => setSearchQuery("")}
            style={styles.clearButton}
          >
            <Ionicons name="close" size={20} color="#666666" />
          </TouchableOpacity>
        )}
      </View>

      {/* Categories */}
      <View style={styles.categoriesSection}>
        <FlatList
          data={[
            {
              _id: "",
              name: "All",
              description: "",
              created_at: "",
              updated_at: "",
            },
            ...categories,
          ]}
          renderItem={renderCategory}
          keyExtractor={(item) => item._id || "all"}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}
        />
      </View>

      {/* Menu Items */}
      <FlatList
        data={menuItems}
        renderItem={renderMenuItem}
        keyExtractor={(item) => item._id}
        numColumns={2}
        contentContainerStyle={styles.menuItemsList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="restaurant-outline" size={60} color="#666666" />
            <Text style={styles.emptyText}>No items found</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    margin: 20,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    color: "#ffffff",
    fontSize: 16,
  },
  clearButton: {
    padding: 4,
  },
  categoriesSection: {
    marginBottom: 20,
  },
  categoriesList: {
    paddingHorizontal: 20,
  },
  categoryChip: {
    backgroundColor: "#1a1a1a",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
  },
  categoryChipActive: {
    backgroundColor: "#ffffff",
  },
  categoryChipText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "500",
  },
  categoryChipTextActive: {
    color: "#000000",
  },
  menuItemsList: {
    paddingHorizontal: 20,
  },
  menuItemCard: {
    flex: 1,
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    margin: 6,
    overflow: "hidden",
  },
  menuItemImage: {
    width: "100%",
    height: 120,
  },
  menuItemInfo: {
    padding: 12,
  },
  menuItemName: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  menuItemDescription: {
    color: "#cccccc",
    fontSize: 12,
    marginBottom: 8,
  },
  menuItemFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  menuItemPrice: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
  addButton: {
    backgroundColor: "#ffffff",
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    color: "#666666",
    fontSize: 16,
    marginTop: 12,
  },
});
