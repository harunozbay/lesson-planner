import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Collapsible } from "@/components/ui/collapsible";
import { AppColors } from "@/constants/colors";
import { TOP_BAR_PADDING, useScroll } from "@/contexts/scroll-context";
import { useThemeColor } from "@/hooks/use-theme-color";
import { createPlan } from "@/src/graphql/mutations";
import { generatePlan } from "@/src/graphql/queries";
import { Ionicons } from "@expo/vector-icons";
import { generateClient } from "aws-amplify/api";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const client = generateClient({ authMode: "userPool" });

// Gün renkleri
const dayColors: Record<string, string> = {
  pazartesi: AppColors.days.pazartesi,
  sali: AppColors.days.sali,
  carsamba: AppColors.days.carsamba,
  persembe: AppColors.days.persembe,
  cuma: AppColors.days.cuma,
};

// Field renkleri
const fieldColors: Record<string, string> = {
  genel: AppColors.fields.genel,
  kuran: AppColors.fields.kuran,
  dini_bilgiler: AppColors.fields.dini_bilgiler,
  degerler_egitimi: AppColors.fields.degerler_egitimi,
  tamamlayici_kazanim: AppColors.fields.tamamlayici_kazanim,
};

export default function NewProjectScreen() {
  const [projeAdi, setProjeAdi] = useState("");
  const [haftaNo, setHaftaNo] = useState("");
  const [tarihAraligi, setTarihAraligi] = useState("");
  const [kurumAdi, setKurumAdi] = useState("");
  const [muzikListesi, setMuzikListesi] = useState("");

  const dayFields = [
    "genel",
    "kuran",
    "dini_bilgiler",
    "degerler_egitimi",
    "tamamlayici_kazanim",
  ];
  const dayLabels: Record<string, string> = {
    genel: "Genel",
    kuran: "Kur'an",
    dini_bilgiler: "Dini Bilgiler",
    degerler_egitimi: "Değerler Eğitimi",
    tamamlayici_kazanim: "Tamamlayıcı Kazanım",
  };
  const dayNames = ["pazartesi", "sali", "carsamba", "persembe", "cuma"];
  const dayDisplayNames: Record<string, string> = {
    pazartesi: "Pazartesi",
    sali: "Salı",
    carsamba: "Çarşamba",
    persembe: "Perşembe",
    cuma: "Cuma",
  };

  const [days, setDays] = useState<Record<string, Record<string, string>>>({
    pazartesi: {
      genel: "",
      kuran: "",
      dini_bilgiler: "",
      degerler_egitimi: "",
      tamamlayici_kazanim: "",
    },
    sali: {
      genel: "",
      kuran: "",
      dini_bilgiler: "",
      degerler_egitimi: "",
      tamamlayici_kazanim: "",
    },
    carsamba: {
      genel: "",
      kuran: "",
      dini_bilgiler: "",
      degerler_egitimi: "",
      tamamlayici_kazanim: "",
    },
    persembe: {
      genel: "",
      kuran: "",
      dini_bilgiler: "",
      degerler_egitimi: "",
      tamamlayici_kazanim: "",
    },
    cuma: {
      genel: "",
      kuran: "",
      dini_bilgiler: "",
      degerler_egitimi: "",
      tamamlayici_kazanim: "",
    },
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const textColor = useThemeColor({}, "text");
  const placeholderColor = useThemeColor({}, "icon");
  const backgroundColor = useThemeColor({}, "background");
  const { handleScroll, resetTopBar } = useScroll();

  useFocusEffect(
    useCallback(() => {
      resetTopBar();
    }, [resetTopBar])
  );

  const handleSave = async () => {
    if (!projeAdi.trim()) {
      Alert.alert("Hata", "Lütfen proje adı girin.");
      return;
    }

    try {
      setSaving(true);
      await client.graphql({
        query: createPlan,
        variables: {
          input: {
            title: projeAdi,
            dateRange: tarihAraligi,
            fields: JSON.stringify({
              ...days,
              haftaNo,
              kurumAdi,
              muzikListesi,
            }),
            docxUrl: null,
          },
        },
      });
      Alert.alert("Başarılı", "Proje kaydedildi.");
      router.replace("/");
    } catch (error) {
      console.error("Error saving plan:", error);
      Alert.alert("Hata", (error as Error).message);
    } finally {
      setSaving(false);
    }
  };

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
        sections: JSON.stringify({}),
        fields: JSON.stringify({
          pazartesi: days.pazartesi,
          sali: days.sali,
          carsamba: days.carsamba,
          persembe: days.persembe,
          cuma: days.cuma,
        }),
      };

      const result: any = await client.graphql({
        query: generatePlan,
        variables: input,
      });

      const responseString = result.data.generatePlan;
      const response = JSON.parse(responseString);

      if (response.url) {
        Linking.openURL(response.url);
        Alert.alert("Başarılı", "Dosya indiriliyor.");
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
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: TOP_BAR_PADDING },
        ]}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <ThemedText type="subtitle" style={styles.header}>
          Genel Bilgiler
        </ThemedText>

        <TextInput
          style={[
            styles.input,
            {
              color: textColor,
              borderColor: placeholderColor,
              backgroundColor,
            },
          ]}
          placeholder="Proje Adı *"
          placeholderTextColor={placeholderColor}
          value={projeAdi}
          onChangeText={setProjeAdi}
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
          placeholder="Hafta No"
          placeholderTextColor={placeholderColor}
          value={haftaNo}
          onChangeText={setHaftaNo}
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
          placeholder="Tarih Aralığı"
          placeholderTextColor={placeholderColor}
          value={tarihAraligi}
          onChangeText={setTarihAraligi}
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
          placeholder="Kurum Adı"
          placeholderTextColor={placeholderColor}
          value={kurumAdi}
          onChangeText={setKurumAdi}
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
          placeholder="Müzik Listesi (virgülle ayırın)"
          placeholderTextColor={placeholderColor}
          value={muzikListesi}
          onChangeText={setMuzikListesi}
        />

        <ThemedText type="subtitle" style={styles.header}>
          Günlük Plan
        </ThemedText>

        {dayNames.map((day) => (
          <View
            key={day}
            style={[
              styles.daySection,
              { borderLeftColor: dayColors[day], borderLeftWidth: 4 },
            ]}
          >
            <Collapsible
              title={dayDisplayNames[day]}
              titleStyle={{ color: dayColors[day], fontWeight: "bold" }}
            >
              {dayFields.map((field) => (
                <View key={`${day}-${field}`} style={styles.fieldContainer}>
                  <View
                    style={[
                      styles.fieldLabel,
                      { backgroundColor: `${fieldColors[field]}20` },
                    ]}
                  >
                    <View
                      style={[
                        styles.fieldDot,
                        { backgroundColor: fieldColors[field] },
                      ]}
                    />
                    <ThemedText
                      style={[
                        styles.fieldLabelText,
                        { color: fieldColors[field] },
                      ]}
                    >
                      {dayLabels[field]}
                    </ThemedText>
                  </View>
                  <TextInput
                    style={[
                      styles.textArea,
                      {
                        color: textColor,
                        borderColor: `${fieldColors[field]}40`,
                        backgroundColor,
                      },
                    ]}
                    placeholder={`${dayLabels[field]} için not ekleyin...`}
                    placeholderTextColor={placeholderColor}
                    multiline
                    value={days[day][field]}
                    onChangeText={(text) =>
                      setDays((prev) => ({
                        ...prev,
                        [day]: { ...prev[day], [field]: text },
                      }))
                    }
                  />
                </View>
              ))}
              <View style={styles.copyButtonsRow}>
                <ThemedText style={styles.copyLabel}>Kopyala:</ThemedText>
                {dayNames
                  .filter((d) => d !== day)
                  .map((otherDay) => (
                    <TouchableOpacity
                      key={`copy-${day}-${otherDay}`}
                      style={[
                        styles.copyBtn,
                        { backgroundColor: `${dayColors[otherDay]}20` },
                      ]}
                      onPress={() =>
                        setDays((prev) => ({
                          ...prev,
                          [day]: { ...prev[otherDay] },
                        }))
                      }
                    >
                      <ThemedText
                        style={[
                          styles.copyBtnText,
                          { color: dayColors[otherDay] },
                        ]}
                      >
                        {dayDisplayNames[otherDay]}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
              </View>
            </Collapsible>
          </View>
        ))}

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.btn, styles.saveBtn, saving && styles.disabled]}
            disabled={saving}
            onPress={handleSave}
          >
            <Ionicons name="save" size={18} color="#fff" />
            <ThemedText style={styles.btnTextWhite}>
              {saving ? "Kaydediliyor..." : "Kaydet"}
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btn, styles.downloadBtn, loading && styles.disabled]}
            disabled={loading}
            onPress={handleDownload}
          >
            <Ionicons name="download" size={18} color="#fff" />
            <ThemedText style={styles.btnTextWhite}>
              {loading ? "Oluşturuluyor..." : "İndir"}
            </ThemedText>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 20 },
  header: { marginTop: 20, marginBottom: 10, color: AppColors.primary },
  input: {
    borderWidth: 1,
    padding: 14,
    marginVertical: 6,
    borderRadius: 12,
    fontSize: 16,
  },
  daySection: {
    marginBottom: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    backgroundColor: "rgba(0,0,0,0.02)",
  },
  fieldContainer: {
    marginBottom: 10,
  },
  fieldLabel: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginBottom: 6,
  },
  fieldDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  fieldLabelText: {
    fontSize: 13,
    fontWeight: "600",
  },
  textArea: {
    borderWidth: 1,
    padding: 12,
    borderRadius: 10,
    fontSize: 15,
    minHeight: 80,
    textAlignVertical: "top",
  },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 14,
    borderRadius: 12,
    flex: 1,
    gap: 6,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 30,
    marginBottom: 50,
  },
  saveBtn: {
    backgroundColor: AppColors.success,
  },
  downloadBtn: {
    backgroundColor: AppColors.primary,
  },
  disabled: {
    opacity: 0.5,
  },
  btnTextWhite: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
  },
  copyButtonsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 6,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  copyLabel: {
    fontSize: 12,
    opacity: 0.7,
    marginRight: 4,
  },
  copyBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  copyBtnText: {
    fontSize: 12,
    fontWeight: "600",
  },
});
