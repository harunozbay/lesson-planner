import { signUp } from "aws-amplify/auth";
import { router } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, TextInput, TouchableOpacity } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useThemeColor } from "@/hooks/use-theme-color";

export default function RegisterScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [loading, setLoading] = useState(false);

  const textColor = useThemeColor({}, "text");
  const placeholderColor = useThemeColor({}, "icon");

  const handleRegister = async () => {
    if (password !== confirmPass) {
      alert("Şifreler uyuşmuyor");
      return;
    }

    try {
      setLoading(true);

      await signUp({
        username: email,
        password,
        options: {
          userAttributes: { email },
        },
      });

      // Kayıt başarılı → Kullanıcıyı doğrulama ekranına yönlendiriyoruz
      router.push({
        pathname: "/(auth)/confirm",
        params: { email },
      });
    } catch (error) {
      console.error("Register error:", error);
      alert((error as Error).message || "Kayıt yapılamadı");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        Kayıt Ol
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

      <TextInput
        style={[
          styles.input,
          { color: textColor, borderColor: placeholderColor },
        ]}
        placeholder="Şifre"
        placeholderTextColor={placeholderColor}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TextInput
        style={[
          styles.input,
          { color: textColor, borderColor: placeholderColor },
        ]}
        placeholder="Şifre Tekrar"
        placeholderTextColor={placeholderColor}
        secureTextEntry
        value={confirmPass}
        onChangeText={setConfirmPass}
      />

      <TouchableOpacity
        style={[styles.btn, loading && { opacity: 0.5 }]}
        disabled={loading}
        onPress={handleRegister}
      >
        <ThemedText style={styles.btnText}>
          {loading ? "Kaydediliyor..." : "Kayıt Ol"}
        </ThemedText>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
        <ThemedText style={styles.link}>
          Zaten hesabın var mı? Giriş Yap
        </ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  title: {
    marginBottom: 20,
    textAlign: "center",
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
    marginTop: 15,
    textAlign: "center",
    color: "#4a67d6",
    fontSize: 16,
    fontWeight: "500",
  },
});
