import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { AppColors } from "@/constants/colors";
import { useAuth } from "@/contexts/auth-context";
import { TOP_BAR_PADDING, useScroll } from "@/contexts/scroll-context";
import { useThemeColor } from "@/hooks/use-theme-color";
import { Ionicons } from "@expo/vector-icons";
import {
  fetchUserAttributes,
  signOut,
  updatePassword,
  updateUserAttribute,
} from "aws-amplify/auth";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// Web için alert fonksiyonu
const showAlert = (title: string, message: string, buttons?: any[]) => {
  if (Platform.OS === "web") {
    if (buttons && buttons.length > 1) {
      const confirmed = window.confirm(`${title}\n\n${message}`);
      if (confirmed) {
        const destructiveBtn = buttons.find((b) => b.style === "destructive");
        if (destructiveBtn?.onPress) destructiveBtn.onPress();
      }
    } else {
      window.alert(`${title}\n\n${message}`);
    }
  } else {
    Alert.alert(title, message, buttons);
  }
};

export default function ProfileScreen() {
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const { setAuthenticated } = useAuth();

  const textColor = useThemeColor({}, "text");
  const placeholderColor = useThemeColor({}, "icon");
  const backgroundColor = useThemeColor({}, "background");
  const { handleScroll, resetTopBar } = useScroll();

  useFocusEffect(
    useCallback(() => {
      resetTopBar();
    }, [resetTopBar])
  );

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setFetching(true);
      const attributes = await fetchUserAttributes();
      setEmail(attributes.email || "");
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setFetching(false);
    }
  };

  const handleUpdateEmail = async () => {
    if (!email.trim()) {
      Alert.alert("Hata", "Lütfen e-posta adresinizi girin.");
      return;
    }

    try {
      setLoading(true);
      await updateUserAttribute({
        userAttribute: {
          attributeKey: "email",
          value: email,
        },
      });
      showAlert("Başarılı", "E-posta güncellendi. Doğrulama kodu gönderildi.");
    } catch (error) {
      console.error("Error updating email:", error);
      showAlert("Hata", (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      showAlert("Hata", "Lütfen tüm şifre alanlarını doldurun.");
      return;
    }

    if (newPassword !== confirmPassword) {
      showAlert("Hata", "Yeni şifreler eşleşmiyor.");
      return;
    }

    if (newPassword.length < 8) {
      showAlert("Hata", "Şifre en az 8 karakter olmalıdır.");
      return;
    }

    try {
      setLoading(true);
      await updatePassword({
        oldPassword: currentPassword,
        newPassword: newPassword,
      });
      showAlert("Başarılı", "Şifreniz güncellendi.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("Error updating password:", error);
      showAlert("Hata", (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    showAlert("Çıkış Yap", "Hesabınızdan çıkış yapmak istiyor musunuz?", [
      { text: "İptal", style: "cancel" },
      {
        text: "Çıkış Yap",
        style: "destructive",
        onPress: async () => {
          try {
            await signOut();
            setAuthenticated(false);
            router.replace("/(auth)/login");
          } catch (error) {
            console.error("Error signing out:", error);
          }
        },
      },
    ]);
  };

  if (fetching) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={AppColors.primary} />
        <ThemedText style={{ marginTop: 10 }}>Yükleniyor...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: TOP_BAR_PADDING },
        ]}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {/* Email Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="mail" size={24} color={AppColors.primary} />
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              E-posta Adresi
            </ThemedText>
          </View>

          <TextInput
            style={[
              styles.input,
              {
                color: textColor,
                borderColor: placeholderColor,
                backgroundColor,
              },
            ]}
            placeholder="E-posta"
            placeholderTextColor={placeholderColor}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TouchableOpacity
            style={[styles.btn, styles.primaryBtn, loading && styles.disabled]}
            disabled={loading}
            onPress={handleUpdateEmail}
          >
            <ThemedText style={styles.btnText}>E-postayı Güncelle</ThemedText>
          </TouchableOpacity>
        </View>

        {/* Password Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons
              name="lock-closed"
              size={24}
              color={AppColors.secondary}
            />
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Şifre Değiştir
            </ThemedText>
          </View>

          <TextInput
            style={[
              styles.input,
              {
                color: textColor,
                borderColor: placeholderColor,
                backgroundColor,
              },
            ]}
            placeholder="Mevcut Şifre"
            placeholderTextColor={placeholderColor}
            value={currentPassword}
            onChangeText={setCurrentPassword}
            secureTextEntry
          />

          <TextInput
            style={[
              styles.input,
              {
                color: textColor,
                borderColor: placeholderColor,
                backgroundColor,
              },
            ]}
            placeholder="Yeni Şifre"
            placeholderTextColor={placeholderColor}
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
          />

          <TextInput
            style={[
              styles.input,
              {
                color: textColor,
                borderColor: placeholderColor,
                backgroundColor,
              },
            ]}
            placeholder="Yeni Şifre (Tekrar)"
            placeholderTextColor={placeholderColor}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={[
              styles.btn,
              styles.secondaryBtn,
              loading && styles.disabled,
            ]}
            disabled={loading}
            onPress={handleUpdatePassword}
          >
            <ThemedText style={styles.btnTextWhite}>
              Şifreyi Güncelle
            </ThemedText>
          </TouchableOpacity>
        </View>

        {/* Sign Out */}
        <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
          <Ionicons name="log-out" size={20} color="#fff" />
          <ThemedText style={styles.signOutText}>Çıkış Yap</ThemedText>
        </TouchableOpacity>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: { padding: 20 },
  section: {
    marginBottom: 30,
    padding: 20,
    borderRadius: 16,
    backgroundColor: "rgba(99, 102, 241, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(99, 102, 241, 0.1)",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    marginLeft: 10,
  },
  input: {
    borderWidth: 1,
    padding: 14,
    marginVertical: 6,
    borderRadius: 12,
    fontSize: 16,
  },
  btn: {
    padding: 15,
    borderRadius: 12,
    marginTop: 10,
    alignItems: "center",
  },
  primaryBtn: {
    backgroundColor: AppColors.primary,
  },
  secondaryBtn: {
    backgroundColor: AppColors.secondary,
  },
  disabled: {
    opacity: 0.5,
  },
  btnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  btnTextWhite: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  signOutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    borderRadius: 12,
    backgroundColor: AppColors.error,
    marginTop: 10,
    marginBottom: 50,
    gap: 8,
  },
  signOutText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
