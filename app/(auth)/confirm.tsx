import { confirmSignUp, resendSignUpCode } from "aws-amplify/auth";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function ConfirmScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

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
    <View style={styles.container}>
      <Text style={styles.title}>Hesabı Doğrula</Text>
      <Text style={styles.subtitle}>{email}</Text>

      <TextInput
        style={styles.input}
        placeholder="Doğrulama Kodu"
        keyboardType="numeric"
        value={code}
        onChangeText={setCode}
      />

      <TouchableOpacity
        style={[styles.btn, loading && { opacity: 0.5 }]}
        disabled={loading}
        onPress={handleConfirm}
      >
        <Text style={styles.btnText}>
          {loading ? "Doğrulanıyor..." : "Doğrula"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={{ marginTop: 15 }}
        onPress={handleResend}
        disabled={resending}
      >
        <Text style={styles.link}>
          {resending ? "Gönderiliyor..." : "Kodu tekrar gönder"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
        <Text style={styles.smallLink}>Giriş ekranına dön</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    textAlign: "center",
    color: "#444",
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
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
    color: "#555",
  },
});
