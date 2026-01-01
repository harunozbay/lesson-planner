import { AppColors } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useRef } from "react";
import {
  Animated,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface BottomBarProps {
  title: string;
  onMenuPress?: () => void;
}

export function BottomBar({ title, onMenuPress }: BottomBarProps) {
  const insets = useSafeAreaInsets();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handleLogoPress = () => {
    // Basma animasyonu
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Ana sayfaya yönlendir
      router.push("/");
    });
  };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + 10 }]}>
      {/* Sol: Sayfa Başlığı */}
      <View style={styles.leftSection}>
        <Text style={styles.pageTitle} numberOfLines={1}>
          {title}
        </Text>
      </View>

      {/* Orta: Logo */}
      <Pressable onPress={handleLogoPress}>
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <Image
            source={require("@/assets/images/app-logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>
      </Pressable>

      {/* Sağ: Menü butonu */}
      <View style={styles.rightSection}>
        {onMenuPress && (
          <TouchableOpacity onPress={onMenuPress} style={styles.iconBtn}>
            <Ionicons name="menu" size={26} color="#fff" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 10,
    backgroundColor: AppColors.primary,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 8,
      },
      default: {
        boxShadow: "0px -2px 4px rgba(0, 0, 0, 0.2)",
      },
    }),
  },
  leftSection: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  rightSection: {
    flex: 1,
    alignItems: "flex-end",
  },
  logo: {
    width: 64,
    height: 64,
  },
  pageTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "rgba(255,255,255,0.9)",
    marginLeft: 4,
  },
  iconBtn: {
    padding: 6,
  },
});
