import { AppColors } from "@/constants/colors";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface TabBarProps {
  currentRoute: string;
}

type TabItem = {
  id: string;
  route: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconOutline: keyof typeof Ionicons.glyphMap;
};

const tabs: TabItem[] = [
  {
    id: "home",
    route: "/",
    label: "Ana Sayfa",
    icon: "home",
    iconOutline: "home-outline",
  },
  {
    id: "theme",
    route: "/theme",
    label: "Tema",
    icon: "color-palette",
    iconOutline: "color-palette-outline",
  },
  {
    id: "profile",
    route: "/profile",
    label: "Profil",
    icon: "person",
    iconOutline: "person-outline",
  },
];

export function TabBar({ currentRoute }: TabBarProps) {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const backgroundColor = isDark ? "#1F2937" : "#fff";
  const inactiveColor = isDark ? "#9CA3AF" : "#6B7280";

  const handlePress = (route: string) => {
    if (route !== currentRoute) {
      router.push(route as any);
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor,
          paddingBottom: insets.bottom + 8,
        },
      ]}
    >
      {tabs.map((tab) => {
        const isActive = currentRoute === tab.route;
        const iconName = isActive ? tab.icon : tab.iconOutline;
        const color = isActive ? AppColors.primary : inactiveColor;

        return (
          <Pressable
            key={tab.id}
            style={styles.tab}
            onPress={() => handlePress(tab.route)}
          >
            <Ionicons name={iconName} size={26} color={color} />
            <Text style={[styles.label, { color }]}>{tab.label}</Text>
            {isActive && <View style={styles.activeIndicator} />}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 8,
      },
      default: {
        boxShadow: "0px -2px 4px rgba(0, 0, 0, 0.05)",
      },
    }),
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
  },
  label: {
    fontSize: 11,
    fontWeight: "500",
    marginTop: 4,
  },
  activeIndicator: {
    position: "absolute",
    top: -10,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: AppColors.primary,
  },
});
