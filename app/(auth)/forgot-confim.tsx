import { confirmResetPassword } from "aws-amplify/auth";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, TextInput, TouchableOpacity } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useThemeColor } from "@/hooks/use-theme-color";

export default function ForgotConfirmScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const textColor = useThemeColor({}, "text");
  const placeholderColor = useThemeColor({}, "icon");

  const handleConfirm = async () => {
    try {
      setLoading(true);

      await confirmResetPassword({
        username: email!,
        confirmationCode: code,
        newPassword,
      });

      alert("Şifre başarıyla yenilendi! Şimdi giriş yapabilirsiniz.");
      router.replace("/(auth)/login");
    } catch (error) {
      console.error("Confirm reset error:", error);
      alert((error as Error).message || "İşlem tamamlanamadı.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        Yeni Şifre Belirle
      </ThemedText>
      <ThemedText style={styles.subtitle}>{email}</ThemedText>

      <TextInput
        style={[
          styles.input,
          { color: textColor, borderColor: placeholderColor },
        ]}
        placeholder="Doğrulama Kodu"
        placeholderTextColor={placeholderColor}
        keyboardType="numeric"
        value={code}
        onChangeText={setCode}
      />

      <TextInput
        style={[
          styles.input,
          { color: textColor, borderColor: placeholderColor },
        ]}
        placeholder="Yeni Şifre"
        placeholderTextColor={placeholderColor}
        secureTextEntry
        value={newPassword}
        onChangeText={setNewPassword}
      />

      <TouchableOpacity
        style={[styles.btn, loading && { opacity: 0.5 }]}
        disabled={loading}
        onPress={handleConfirm}
      >
        <ThemedText style={styles.btnText}>
          {loading ? "Kaydediliyor..." : "Şifreyi Güncelle"}
        </ThemedText>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
        <ThemedText style={styles.smallLink}>Giriş ekranına dön</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  title: {
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    textAlign: "center",
    marginBottom: 20,
    fontSize: 14,
  },
  input: {
    borderWidth: 1,
    padding: 12,
    marginVertical: 10,
    borderRadius: 8,
    fontSize: 16,
  },
  btn: {
    backgroundColor: "#4a67d6",
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
  },
  btnText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },
  smallLink: {
    marginTop: 12,
    textAlign: "center",
  },
});
