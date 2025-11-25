import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useThemeColor } from "@/hooks/use-theme-color";
import { createPlan } from "@/src/graphql/mutations";
import { generatePlan } from "@/src/graphql/queries";
import { generateClient } from "aws-amplify/api";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";

const client = generateClient();

export default function NewProjectScreen() {
  const [haftaNo, setHaftaNo] = useState("");
  const [tarihAraligi, setTarihAraligi] = useState("");
  const [kurumAdi, setKurumAdi] = useState("");
  const [muzikListesi, setMuzikListesi] = useState("");

  // Daily fields
  const [days, setDays] = useState({
    pazartesi: "",
    sali: "",
    carsamba: "",
    persembe: "",
    cuma: "",
  });

  const [loading, setLoading] = useState(false);
  const textColor = useThemeColor({}, "text");
  const placeholderColor = useThemeColor({}, "icon");
  const tintColor = useThemeColor({}, "tint");

  const handleDownload = async () => {
    try {
      setLoading(true);

      const musicArray = muzikListesi
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s);

      const input = {
        hafta_no: haftaNo,
        tarih_araligi: tarihAraligi,
        kurum_adi: kurumAdi,
        muzik_listesi: musicArray,
        sections: JSON.stringify({}), // Add sections if needed
        fields: JSON.stringify(days),
      };

      const result: any = await client.graphql({
        query: generatePlan,
        variables: input,
      });

      const responseString = result.data.generatePlan;
      const response = JSON.parse(responseString);

      if (response.url) {
        // Save to DB
        try {
          await client.graphql({
            query: createPlan,
            variables: {
              input: {
                title: `${kurumAdi} - ${haftaNo}. Hafta`,
                dateRange: tarihAraligi,
                fields: JSON.stringify(days),
                docxUrl: response.url,
              },
            },
          });
        } catch (saveError) {
          console.error("Error saving plan:", saveError);
        }

        Linking.openURL(response.url);
        Alert.alert("Başarılı", "Dosya indiriliyor ve proje kaydedildi.");
        router.replace("/");
      } else {
        Alert.alert("Hata", "Dosya oluşturulamadı.");
      }
    } catch (error) {
      console.error("Error generating plan:", error);
      Alert.alert("Hata", (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ThemedText type="subtitle" style={styles.header}>
          Genel Bilgiler
        </ThemedText>

        <TextInput
          style={[
            styles.input,
            { color: textColor, borderColor: placeholderColor },
          ]}
          placeholder="Hafta No"
          placeholderTextColor={placeholderColor}
          value={haftaNo}
          onChangeText={setHaftaNo}
        />
        <TextInput
          style={[
            styles.input,
            { color: textColor, borderColor: placeholderColor },
          ]}
          placeholder="Tarih Aralığı"
          placeholderTextColor={placeholderColor}
          value={tarihAraligi}
          onChangeText={setTarihAraligi}
        />
        <TextInput
          style={[
            styles.input,
            { color: textColor, borderColor: placeholderColor },
          ]}
          placeholder="Kurum Adı"
          placeholderTextColor={placeholderColor}
          value={kurumAdi}
          onChangeText={setKurumAdi}
        />
        <TextInput
          style={[
            styles.input,
            { color: textColor, borderColor: placeholderColor },
          ]}
          placeholder="Müzik Listesi (virgülle ayırın)"
          placeholderTextColor={placeholderColor}
          value={muzikListesi}
          onChangeText={setMuzikListesi}
        />

        <ThemedText type="subtitle" style={styles.header}>
          Günlük Plan
        </ThemedText>

        {Object.keys(days).map((day) => (
          <TextInput
            key={day}
            style={[
              styles.textArea,
              { color: textColor, borderColor: placeholderColor },
            ]}
            placeholder={day.charAt(0).toUpperCase() + day.slice(1)}
            placeholderTextColor={placeholderColor}
            multiline
            value={(days as any)[day]}
            onChangeText={(text) =>
              setDays((prev) => ({ ...prev, [day]: text }))
            }
          />
        ))}

        <TouchableOpacity
          style={[
            styles.btn,
            { backgroundColor: tintColor },
            loading && { opacity: 0.5 },
          ]}
          disabled={loading}
          onPress={handleDownload}
        >
          <ThemedText style={styles.btnText}>
            {loading ? "Oluşturuluyor..." : "İndir"}
          </ThemedText>
        </TouchableOpacity>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 20 },
  header: { marginTop: 20, marginBottom: 10 },
  input: {
    borderWidth: 1,
    padding: 12,
    marginVertical: 5,
    borderRadius: 8,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    padding: 12,
    marginVertical: 5,
    borderRadius: 8,
    fontSize: 16,
    height: 100,
    textAlignVertical: "top",
  },
  btn: {
    padding: 15,
    borderRadius: 8,
    marginTop: 30,
    marginBottom: 50,
  },
  btnText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },
});
