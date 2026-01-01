import { TabBar } from "@/components/tab-bar";
import { TopBar } from "@/components/top-bar";
import { AuthProvider, useAuth } from "@/contexts/auth-context";
import { ScrollProvider, useScroll } from "@/contexts/scroll-context";
import { ThemeProvider as AppThemeProvider } from "@/contexts/theme-context";
import { useColorScheme } from "@/hooks/use-color-scheme";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack, router, usePathname } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useRef } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  PanResponder,
  View,
} from "react-native";
import "react-native-reanimated";

import { Amplify } from "aws-amplify";
import awsconfig from "./aws-exports";

Amplify.configure(awsconfig);

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SWIPE_THRESHOLD = 80;

// Ana sayfa rotaları (tab bar'da gösterilecek)
const TAB_ROUTES = ["/", "/theme", "/profile"];

function AppContent() {
  const colorScheme = useColorScheme();
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useAuth();
  const { topBarTranslateY } = useScroll();
  const pathnameRef = useRef(pathname);
  const swipeAnim = useRef(new Animated.Value(0)).current;

  // pathname değiştiğinde ref'i güncelle
  useEffect(() => {
    pathnameRef.current = pathname;
    // Sayfa değiştiğinde animasyonu sıfırla
    swipeAnim.setValue(0);
  }, [pathname, swipeAnim]);

  // Auth durumuna göre yönlendirme
  useEffect(() => {
    if (isLoading) return;

    if (isAuthenticated && pathname.includes("(auth)")) {
      router.replace("/");
    } else if (!isAuthenticated && !pathname.includes("(auth)")) {
      router.replace("/(auth)/login");
    }
  }, [isAuthenticated, isLoading, pathname]);

  // Swipe navigation için
  const panResponder = React.useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (evt, gestureState) => {
          // Yatay hareket dikey hareketten büyükse ve yeterli hızda ise
          return (
            Math.abs(gestureState.dx) > Math.abs(gestureState.dy) &&
            Math.abs(gestureState.dx) > 20
          );
        },
        onPanResponderMove: (_, gestureState) => {
          const currentPath = pathnameRef.current;
          const currentIndex = TAB_ROUTES.indexOf(currentPath);
          if (currentIndex === -1) return;

          // Sınırları kontrol et
          if (gestureState.dx > 0 && currentIndex === 0) return;
          if (gestureState.dx < 0 && currentIndex === TAB_ROUTES.length - 1)
            return;

          swipeAnim.setValue(gestureState.dx);
        },
        onPanResponderRelease: (evt, gestureState) => {
          const currentPath = pathnameRef.current;
          const currentIndex = TAB_ROUTES.indexOf(currentPath);
          if (currentIndex === -1) return;

          if (
            gestureState.dx < -SWIPE_THRESHOLD &&
            currentIndex < TAB_ROUTES.length - 1
          ) {
            // Sola kaydır = sonraki tab
            Animated.timing(swipeAnim, {
              toValue: -SCREEN_WIDTH,
              duration: 250,
              useNativeDriver: true,
            }).start(() => {
              router.replace(TAB_ROUTES[currentIndex + 1] as any);
            });
          } else if (gestureState.dx > SWIPE_THRESHOLD && currentIndex > 0) {
            // Sağa kaydır = önceki tab
            Animated.timing(swipeAnim, {
              toValue: SCREEN_WIDTH,
              duration: 250,
              useNativeDriver: true,
            }).start(() => {
              router.replace(TAB_ROUTES[currentIndex - 1] as any);
            });
          } else {
            // Geri dön
            Animated.spring(swipeAnim, {
              toValue: 0,
              useNativeDriver: true,
              friction: 8,
            }).start();
          }
        },
      }),
    [swipeAnim]
  );

  const getPageTitle = () => {
    switch (pathname) {
      case "/":
        return "Projelerim";
      case "/profile":
        return "Profil";
      case "/new-project":
        return "Yeni Proje";
      case "/theme":
        return "Tema";
      default:
        if (pathname.includes("edit-project")) return "Proje Düzenle";
        return "";
    }
  };

  const showNavigation = isAuthenticated && !pathname.includes("(auth)");
  const isTabRoute = TAB_ROUTES.includes(pathname);

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <View
        style={{ flex: 1 }}
        {...(isTabRoute && isAuthenticated ? panResponder.panHandlers : {})}
      >
        {showNavigation && (
          <TopBar title={getPageTitle()} translateY={topBarTranslateY} />
        )}

        <Animated.View
          style={{
            flex: 1,
            transform: isTabRoute ? [{ translateX: swipeAnim }] : [],
          }}
        >
          <Stack
            screenOptions={{
              headerShown: false,
              animation: "none",
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen
              name="new-project"
              options={{ animation: "slide_from_right" }}
            />
            <Stack.Screen
              name="edit-project"
              options={{ animation: "slide_from_right" }}
            />
            <Stack.Screen name="profile" />
            <Stack.Screen name="theme" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="modal" options={{ presentation: "modal" }} />
          </Stack>
        </Animated.View>

        {showNavigation && <TabBar currentRoute={pathname} />}
      </View>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      {isLoading && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: colorScheme === "dark" ? "#000" : "#fff",
            zIndex: 999,
          }}
        >
          <ActivityIndicator size="large" />
        </View>
      )}
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AppThemeProvider>
      <AuthProvider>
        <ScrollProvider>
          <AppContent />
        </ScrollProvider>
      </AuthProvider>
    </AppThemeProvider>
  );
}
