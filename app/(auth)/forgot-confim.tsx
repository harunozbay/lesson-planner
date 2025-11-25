import { confirmResetPassword } from "aws-amplify/auth";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function ForgotConfirmScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

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
    <View style={styles.container}>
      <Text style={styles.title}>Yeni Şifre Belirle</Text>
      <Text style={styles.subtitle}>{email}</Text>

      <TextInput
        style={styles.input}
        placeholder="Doğrulama Kodu"
        keyboardType="numeric"
        value={code}
        onChangeText={setCode}
      />

      <TextInput
        style={styles.input}
        placeholder="Yeni Şifre"
        secureTextEntry
        value={newPassword}
        onChangeText={setNewPassword}
      />

      <TouchableOpacity
        style={[styles.btn, loading && { opacity: 0.5 }]}
        disabled={loading}
        onPress={handleConfirm}
      >
        <Text style={styles.btnText}>
          {loading ? "Kaydediliyor..." : "Şifreyi Güncelle"}
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
    fontSize: 14,
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
  smallLink: {
    marginTop: 12,
    textAlign: "center",
    color: "#555",
  },
});
