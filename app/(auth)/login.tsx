import { useAuth } from "@/contexts/auth-context";
import { signIn } from "aws-amplify/auth";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useThemeColor } from "@/hooks/use-theme-color";

// Web için alert fonksiyonu
const showAlert = (message: string) => {
  if (Platform.OS === "web") {
    window.alert(message);
  } else {
    alert(message);
  }
};

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { setAuthenticated } = useAuth();

  const textColor = useThemeColor({}, "text");
  const placeholderColor = useThemeColor({}, "icon");

  const handleLogin = async () => {
    try {
      setLoading(true);

      await signIn({ username: email, password });
      setAuthenticated(true);

      // Login başarılı → tabs ekranına yönlendiriyoruz
      router.replace("/");
    } catch (error) {
      console.log("Login error:", error);
      showAlert((error as Error).message || "Giriş yapılamadı");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.logoContainer}>
        <Image
          source={require("@/assets/images/haftaman-logo-2.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

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

      <TouchableOpacity
        style={[styles.btn, loading && { opacity: 0.5 }]}
        disabled={loading}
        onPress={handleLogin}
      >
        <ThemedText style={styles.btnText}>
          {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
        </ThemedText>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
        <ThemedText style={styles.link}>Hesabın yok mu? Kaydol</ThemedText>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/(auth)/forgot" as any)}>
        <ThemedText style={styles.smallLink}>Şifremi unuttum</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  logoContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  logo: {
    width: 160,
    height: 160,
  },
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
  smallLink: {
    marginTop: 8,
    textAlign: "center",
  },
});
