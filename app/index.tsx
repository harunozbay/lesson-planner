import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { AppColors } from "@/constants/colors";
import { TOP_BAR_PADDING, useScroll } from "@/contexts/scroll-context";
import { useThemeColor } from "@/hooks/use-theme-color";
import { listPlans } from "@/src/graphql/queries";
import { Ionicons } from "@expo/vector-icons";
import { generateClient } from "aws-amplify/api";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

const client = generateClient({ authMode: "userPool" });

export default function ProjectsScreen() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const iconColor = useThemeColor({}, "icon");
  const { handleScroll, resetTopBar } = useScroll();

  useFocusEffect(
    useCallback(() => {
      resetTopBar();
    }, [resetTopBar])
  );

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const result = await client.graphql({ query: listPlans });
      setPlans(result.data.listPlans.items);
    } catch (error) {
      console.error("Error fetching plans:", error);
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={AppColors.primary} />
        <ThemedText style={{ marginTop: 10 }}>
          Projeler yükleniyor...
        </ThemedText>
      </ThemedView>
    );
  }

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => router.push(`/edit-project?id=${item.id}`)}
    >
      <View style={styles.itemContent}>
        <View style={styles.itemIcon}>
          <Ionicons name="document-text" size={24} color={AppColors.primary} />
        </View>
        <View style={styles.itemText}>
          <ThemedText type="defaultSemiBold">{item.title}</ThemedText>
          <ThemedText style={styles.dateText}>{item.dateRange}</ThemedText>
        </View>
      </View>
      <IconSymbol name="chevron.right" size={20} color={iconColor} />
    </TouchableOpacity>
  );

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={plans}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        refreshing={loading}
        onRefresh={fetchPlans}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={[
          styles.listContent,
          { paddingTop: TOP_BAR_PADDING },
        ]}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons
              name="folder-open-outline"
              size={64}
              color={AppColors.primary}
            />
            <ThemedText style={styles.emptyText}>
              Henüz bir proje yok.
            </ThemedText>
            <ThemedText style={styles.emptySubtext}>
              Yeni bir proje oluşturmak için + butonuna tıklayın.
            </ThemedText>
          </View>
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push("/new-project")}
      >
        <Ionicons name="add" size={32} color="#fff" />
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    flexGrow: 1,
  },
  itemContainer: {
    padding: 16,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  itemIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: `${AppColors.primary}15`,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  itemText: {
    flex: 1,
  },
  dateText: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 16,
    fontSize: 18,
    fontWeight: "600",
  },
  emptySubtext: {
    textAlign: "center",
    marginTop: 8,
    opacity: 0.6,
    fontSize: 14,
  },
  fab: {
    position: "absolute",
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: AppColors.primary,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
