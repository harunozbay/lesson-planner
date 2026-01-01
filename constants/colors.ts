/**
 * Planlıyorum App Colors
 */

// Ana tema renkleri
export const AppColors = {
  primary: "#6366F1", // Indigo
  primaryDark: "#4F46E5",
  primaryLight: "#818CF8",
  secondary: "#EC4899", // Pink
  accent: "#10B981", // Emerald

  // Gradient için
  gradientStart: "#6366F1",
  gradientMiddle: "#8B5CF6",
  gradientEnd: "#EC4899",

  // Gün renkleri
  days: {
    pazartesi: "#3B82F6", // Blue
    sali: "#10B981", // Emerald
    carsamba: "#F59E0B", // Amber
    persembe: "#8B5CF6", // Violet
    cuma: "#EF4444", // Red
  },

  // Field/Label renkleri
  fields: {
    genel: "#6366F1", // Indigo
    kuran: "#059669", // Emerald dark
    dini_bilgiler: "#D97706", // Amber dark
    degerler_egitimi: "#7C3AED", // Violet
    tamamlayici_kazanim: "#DC2626", // Red
  },

  // UI renkleri
  success: "#10B981",
  warning: "#F59E0B",
  error: "#EF4444",
  info: "#3B82F6",
};

export const Colors = {
  light: {
    text: "#11181C",
    background: "#fff",
    tint: AppColors.primary,
    icon: "#687076",
    tabIconDefault: "#687076",
    tabIconSelected: AppColors.primary,
    headerBackground: AppColors.primary,
    headerText: "#fff",
  },
  dark: {
    text: "#ECEDEE",
    background: "#151718",
    tint: AppColors.primaryLight,
    icon: "#9BA1A6",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: AppColors.primaryLight,
    headerBackground: "#1F2937",
    headerText: "#fff",
  },
};
