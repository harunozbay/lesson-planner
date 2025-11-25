import { resetPassword } from "aws-amplify/auth";
import { router } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, TextInput, TouchableOpacity } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useThemeColor } from "@/hooks/use-theme-color";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const textColor = useThemeColor({}, "text");
  const placeholderColor = useThemeColor({}, "icon");

  const handleReset = async () => {
    try {
      setLoading(true);

      const output = await resetPassword({ username: email });

      console.log("resetPassword output:", output);

      // Başarılı → Kod girme ekranına yönlendir
      router.push({
        pathname: "/(auth)/forgot-confim",
        params: { email },
      });
    } catch (error) {
      console.error("Forgot password error:", error);
      alert((error as Error).message || "Şifre sıfırlama başlatılamadı.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        Şifre Sıfırlama
      </ThemedText>
      <ThemedText style={styles.subtitle}>
        Email adresinizi girin, şifre sıfırlama kodu gönderilecek.
      </ThemedText>

      <TextInput
        style={[
          styles.input,
          { color: textColor, borderColor: placeholderColor },
        ]}
        placeholder="Email"
        placeholderTextColor={placeholderColor}
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      <TouchableOpacity
        style={[styles.btn, loading && { opacity: 0.5 }]}
        disabled={loading}
        onPress={handleReset}
      >
        <ThemedText style={styles.btnText}>
          {loading ? "Gönderiliyor..." : "Kod Gönder"}
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
