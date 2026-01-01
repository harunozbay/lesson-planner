import { useColorScheme } from "@/hooks/use-color-scheme";
import React from "react";
import {
  Animated,
  Image,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface TopBarProps {
  title: string;
  translateY: Animated.Value;
}

export function TopBar({ title, translateY }: TopBarProps) {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const backgroundColor = isDark ? "#1F2937" : "#fff";
  const textColor = isDark ? "#fff" : "#11181C";

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor,
          paddingTop: insets.top + 8,
          transform: [{ translateY }],
        },
      ]}
    >
      {/* Sol: Logo */}
      <View style={styles.leftSection}>
        <Image
          source={require("@/assets/images/haftaman-logo-2.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {/* Sağ: Sayfa Adı */}
      <View style={styles.rightSection}>
        <Text
          style={[styles.pageTitle, { color: textColor }]}
          numberOfLines={1}
        >
          {title}
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 8,
    zIndex: 100,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
      default: {
        boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
      },
    }),
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  rightSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  logo: {
    width: 56,
    height: 56,
  },
  pageTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
});
