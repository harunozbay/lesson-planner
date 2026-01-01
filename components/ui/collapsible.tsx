import { PropsWithChildren, useState } from "react";
import { StyleSheet, TextStyle, TouchableOpacity } from "react-native";
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

interface CollapsibleProps {
  title: string;
  titleStyle?: TextStyle;
}

export function Collapsible({
  children,
  title,
  titleStyle,
}: PropsWithChildren<CollapsibleProps>) {
  const [isOpen, setIsOpen] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const theme = useColorScheme() ?? "light";
  const rotation = useSharedValue(0);
  const height = useSharedValue(0);
  const opacity = useSharedValue(0);

  const toggleOpen = () => {
    const willOpen = !isOpen;

    if (willOpen) {
      // Açılırken: önce render et, sonra animasyon
      setShouldRender(true);
      setIsOpen(true);
    } else {
      // Kapanırken: önce animasyon, sonra render kaldır
      setIsOpen(false);
      setTimeout(() => {
        setShouldRender(false);
      }, ANIMATION_DURATION);
    }

    rotation.value = withTiming(willOpen ? 90 : 0, {
      duration: ANIMATION_DURATION,
      easing: Easing.bezier(0.4, 0, 0.2, 1),
    });

    // Açıkken büyük bir maxHeight kullan, kapalıyken 0
    height.value = withTiming(willOpen ? 2000 : 0, {
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
    maxHeight: height.value,
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

        <ThemedText type="defaultSemiBold" style={titleStyle}>
          {title}
        </ThemedText>
      </TouchableOpacity>
      {shouldRender && (
        <Animated.View style={[styles.content, contentStyle]}>
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
