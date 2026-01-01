import React, { createContext, useContext, useRef } from "react";
import {
  Animated,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from "react-native";

interface ScrollContextType {
  topBarTranslateY: Animated.Value;
  handleScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  resetTopBar: () => void;
}

const ScrollContext = createContext<ScrollContextType | null>(null);

const TOP_BAR_HEIGHT = 100;

export function ScrollProvider({ children }: { children: React.ReactNode }) {
  const topBarTranslateY = useRef(new Animated.Value(0)).current;
  const lastScrollY = useRef(0);
  const isTopBarVisible = useRef(true);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const currentScrollY = event.nativeEvent.contentOffset.y;
    const diff = currentScrollY - lastScrollY.current;

    // Yukarı scroll - bar'ı göster
    if (diff < -5 && !isTopBarVisible.current && currentScrollY > 0) {
      isTopBarVisible.current = true;
      Animated.spring(topBarTranslateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 12,
      }).start();
    }
    // Aşağı scroll - bar'ı gizle
    else if (
      diff > 5 &&
      isTopBarVisible.current &&
      currentScrollY > TOP_BAR_HEIGHT
    ) {
      isTopBarVisible.current = false;
      Animated.spring(topBarTranslateY, {
        toValue: -TOP_BAR_HEIGHT,
        useNativeDriver: true,
        tension: 100,
        friction: 12,
      }).start();
    }
    // En üstte - bar'ı göster
    else if (currentScrollY <= 10 && !isTopBarVisible.current) {
      isTopBarVisible.current = true;
      Animated.spring(topBarTranslateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 12,
      }).start();
    }

    lastScrollY.current = currentScrollY;
  };

  const resetTopBar = () => {
    isTopBarVisible.current = true;
    lastScrollY.current = 0;
    Animated.spring(topBarTranslateY, {
      toValue: 0,
      useNativeDriver: true,
      tension: 100,
      friction: 12,
    }).start();
  };

  return (
    <ScrollContext.Provider
      value={{
        topBarTranslateY,
        handleScroll,
        resetTopBar,
      }}
    >
      {children}
    </ScrollContext.Provider>
  );
}

export function useScroll() {
  const context = useContext(ScrollContext);
  if (!context) {
    throw new Error("useScroll must be used within a ScrollProvider");
  }
  return context;
}

export const TOP_BAR_PADDING = TOP_BAR_HEIGHT;
