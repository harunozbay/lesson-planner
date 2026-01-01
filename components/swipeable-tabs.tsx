import React, { useCallback, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  PanResponder,
  StyleSheet,
  View,
} from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SWIPE_THRESHOLD = 80;

interface SwipeableTabsProps {
  children: React.ReactNode[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
}

export function SwipeableTabs({
  children,
  currentIndex,
  onIndexChange,
}: SwipeableTabsProps) {
  const translateX = useRef(
    new Animated.Value(-currentIndex * SCREEN_WIDTH)
  ).current;
  const [isAnimating, setIsAnimating] = useState(false);

  const animateToIndex = useCallback(
    (index: number) => {
      setIsAnimating(true);
      Animated.spring(translateX, {
        toValue: -index * SCREEN_WIDTH,
        useNativeDriver: true,
        friction: 20,
        tension: 100,
      }).start(() => {
        setIsAnimating(false);
        onIndexChange(index);
      });
    },
    [translateX, onIndexChange]
  );

  // currentIndex değiştiğinde animasyon yap
  React.useEffect(() => {
    if (!isAnimating) {
      Animated.spring(translateX, {
        toValue: -currentIndex * SCREEN_WIDTH,
        useNativeDriver: true,
        friction: 20,
        tension: 100,
      }).start();
    }
  }, [currentIndex, translateX, isAnimating]);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Yatay hareket dikey hareketten büyükse
        return (
          Math.abs(gestureState.dx) > Math.abs(gestureState.dy) &&
          Math.abs(gestureState.dx) > 15
        );
      },
      onPanResponderGrant: () => {
        translateX.stopAnimation();
      },
      onPanResponderMove: (_, gestureState) => {
        // Mevcut pozisyon + sürükleme mesafesi
        const newValue = -currentIndex * SCREEN_WIDTH + gestureState.dx;
        // Sınırlar içinde tut
        const minValue = -(children.length - 1) * SCREEN_WIDTH;
        const maxValue = 0;
        const clampedValue = Math.max(minValue, Math.min(maxValue, newValue));
        translateX.setValue(clampedValue);
      },
      onPanResponderRelease: (_, gestureState) => {
        let newIndex = currentIndex;

        if (
          gestureState.dx < -SWIPE_THRESHOLD &&
          currentIndex < children.length - 1
        ) {
          // Sola kaydır = sonraki tab
          newIndex = currentIndex + 1;
        } else if (gestureState.dx > SWIPE_THRESHOLD && currentIndex > 0) {
          // Sağa kaydır = önceki tab
          newIndex = currentIndex - 1;
        }

        animateToIndex(newIndex);
      },
    })
  ).current;

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      <Animated.View
        style={[
          styles.content,
          {
            width: SCREEN_WIDTH * children.length,
            transform: [{ translateX }],
          },
        ]}
      >
        {React.Children.map(children, (child, index) => (
          <View key={index} style={[styles.page, { width: SCREEN_WIDTH }]}>
            {child}
          </View>
        ))}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: "hidden",
  },
  content: {
    flex: 1,
    flexDirection: "row",
  },
  page: {
    flex: 1,
  },
});
