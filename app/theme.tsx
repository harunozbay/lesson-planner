import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { AppColors } from "@/constants/colors";
import { TOP_BAR_PADDING, useScroll } from "@/contexts/scroll-context";
import { useTheme } from "@/contexts/theme-context";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import React, { useCallback } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";

type ThemeOption = {
  id: "light" | "dark" | "system";
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  description: string;
};

const themeOptions: ThemeOption[] = [
  {
    id: "light",
    label: "Açık Tema",
    icon: "sunny",
    description: "Her zaman açık tema kullan",
  },
  {
    id: "dark",
    label: "Koyu Tema",
    icon: "moon",
    description: "Her zaman koyu tema kullan",
  },
  {
    id: "system",
    label: "Sistem",
    icon: "phone-portrait",
    description: "Cihaz ayarlarını takip et",
  },
];

export default function ThemeScreen() {
  const { theme, setTheme, colorScheme } = useTheme();
  const { resetTopBar } = useScroll();
  const isDark = colorScheme === "dark";
  const borderColor = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)";

  useFocusEffect(
    useCallback(() => {
      resetTopBar();
    }, [resetTopBar])
  );

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: TOP_BAR_PADDING },
        ]}
      >
        <ThemedText type="subtitle" style={styles.title}>
          Tema Seçimi
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          Uygulamanın görünümünü özelleştirin
        </ThemedText>

        <View style={styles.options}>
          {themeOptions.map((option) => {
            const isActive = theme === option.id;
            return (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.option,
                  { borderColor },
                  isActive && styles.optionActive,
                ]}
                onPress={() => setTheme(option.id)}
              >
                <View
                  style={[
                    styles.iconContainer,
                    isActive && styles.iconContainerActive,
                  ]}
                >
                  <Ionicons
                    name={option.icon}
                    size={24}
                    color={isActive ? "#fff" : AppColors.primary}
                  />
                </View>
                <View style={styles.optionContent}>
                  <ThemedText style={styles.optionLabel}>
                    {option.label}
                  </ThemedText>
                  <ThemedText style={styles.optionDescription}>
                    {option.description}
                  </ThemedText>
                </View>
                {isActive && (
                  <Ionicons
                    name="checkmark-circle"
                    size={24}
                    color={AppColors.primary}
                  />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {
    opacity: 0.7,
    marginBottom: 30,
  },
  options: {
    gap: 12,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    gap: 16,
  },
  optionActive: {
    borderColor: AppColors.primary,
    backgroundColor: `${AppColors.primary}10`,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: `${AppColors.primary}15`,
    justifyContent: "center",
    alignItems: "center",
  },
  iconContainerActive: {
    backgroundColor: AppColors.primary,
  },
  optionContent: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  optionDescription: {
    fontSize: 13,
    opacity: 0.6,
  },
});
