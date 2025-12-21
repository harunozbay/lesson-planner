import { PropsWithChildren, useState } from "react";
import { LayoutChangeEvent, StyleSheet, TouchableOpacity } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

const ANIMATION_DURATION = 400;

export function Collapsible({
  children,
  title,
}: PropsWithChildren & { title: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const [contentMeasuredHeight, setContentMeasuredHeight] = useState(0);
  const theme = useColorScheme() ?? "light";
  const rotation = useSharedValue(0);
  const height = useSharedValue(0);
  const opacity = useSharedValue(0);

  const onContentLayout = (event: LayoutChangeEvent) => {
    const measuredHeight = event.nativeEvent.layout.height;
    if (measuredHeight > 0 && contentMeasuredHeight === 0) {
      setContentMeasuredHeight(measuredHeight);
    }
  };

  const toggleOpen = () => {
    const willOpen = !isOpen;

    if (willOpen) {
      setShouldRender(true);
      setIsOpen(true);
    } else {
      // Kapanış animasyonu sonrasında state'i güncelle
      setTimeout(() => {
        setIsOpen(false);
        setShouldRender(false);
      }, ANIMATION_DURATION);
    }

    rotation.value = withTiming(willOpen ? 90 : 0, {
      duration: ANIMATION_DURATION,
      easing: Easing.bezier(0.4, 0, 0.2, 1),
    });

    height.value = withTiming(willOpen ? contentMeasuredHeight || 500 : 0, {
      duration: ANIMATION_DURATION,
      easing: Easing.bezier(0.4, 0, 0.2, 1),
    });

    opacity.value = withTiming(willOpen ? 1 : 0, {
      duration: ANIMATION_DURATION,
      easing: Easing.bezier(0.4, 0, 0.2, 1),
    });
  };

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const contentStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    height: contentMeasuredHeight > 0 ? height.value : undefined,
    overflow: "hidden" as const,
  }));

  return (
    <ThemedView>
      <TouchableOpacity
        style={styles.heading}
        onPress={toggleOpen}
        activeOpacity={0.8}
      >
        <Animated.View style={chevronStyle}>
          <IconSymbol
            name="chevron.right"
            size={18}
            weight="medium"
            color={theme === "light" ? Colors.light.icon : Colors.dark.icon}
          />
        </Animated.View>

        <ThemedText type="defaultSemiBold">{title}</ThemedText>
      </TouchableOpacity>
      {shouldRender && (
        <Animated.View
          style={[styles.content, contentStyle]}
          onLayout={onContentLayout}
        >
          {children}
        </Animated.View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  heading: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  content: {
    marginTop: 10,
  },
});
