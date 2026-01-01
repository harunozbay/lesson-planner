import { useTheme } from "@/contexts/theme-context";

/**
 * Web için tema hook'u - ThemeContext'ten alır
 */
export function useColorScheme() {
  const { colorScheme } = useTheme();
  return colorScheme;
}
