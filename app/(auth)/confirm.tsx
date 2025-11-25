import { confirmSignUp, resendSignUpCode } from "aws-amplify/auth";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, TextInput, TouchableOpacity } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useThemeColor } from "@/hooks/use-theme-color";

export default function ConfirmScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const textColor = useThemeColor({}, "text");
  const placeholderColor = useThemeColor({}, "icon");

  const handleConfirm = async () => {
    try {
      setLoading(true);

      await confirmSignUp({
        username: email!,
        confirmationCode: code,
      });

      alert("Hesabınız doğrulandı! Şimdi giriş yapabilirsiniz.");
      router.replace("/(auth)/login");
    } catch (error) {
      console.error("Confirm error:", error);
      alert((error as Error).message || "Doğrulama başarısız");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      setResending(true);
      await resendSignUpCode({ username: email! });
      alert("Kod tekrar gönderildi.");
    } catch (error) {
      console.error("Resend error:", error);
      alert((error as Error).message || "Kod gönderilemedi");
    } finally {
      setResending(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        Hesabı Doğrula
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

      <TouchableOpacity
        style={[styles.btn, loading && { opacity: 0.5 }]}
        disabled={loading}
        onPress={handleConfirm}
      >
        <ThemedText style={styles.btnText}>
          {loading ? "Doğrulanıyor..." : "Doğrula"}
        </ThemedText>
      </TouchableOpacity>

      <TouchableOpacity
        style={{ marginTop: 15 }}
        onPress={handleResend}
        disabled={resending}
      >
        <ThemedText style={styles.link}>
          {resending ? "Gönderiliyor..." : "Kodu tekrar gönder"}
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
  link: {
    textAlign: "center",
    color: "#4a67d6",
    fontSize: 16,
    fontWeight: "500",
  },
  smallLink: {
    marginTop: 8,
    textAlign: "center",
  },
});
