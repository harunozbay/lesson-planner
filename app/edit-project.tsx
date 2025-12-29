import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Collapsible } from "@/components/ui/collapsible";
import { useThemeColor } from "@/hooks/use-theme-color";
import { deletePlan, updatePlan } from "@/src/graphql/mutations";
import { generatePlan, getPlan } from "@/src/graphql/queries";
import { generateClient } from "aws-amplify/api";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";

const client = generateClient({ authMode: "userPool" });

export default function EditProjectScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [projeAdi, setProjeAdi] = useState("");
  const [haftaNo, setHaftaNo] = useState("");
  const [tarihAraligi, setTarihAraligi] = useState("");
  const [kurumAdi, setKurumAdi] = useState("");
  const [muzikListesi, setMuzikListesi] = useState("");

  // Her gün için alt alanlar
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
  const dayNames = useMemo(
    () => ["pazartesi", "sali", "carsamba", "persembe", "cuma"],
    []
  );
  const dayDisplayNames: Record<string, string> = {
    pazartesi: "Pazartesi",
    sali: "Salı",
    carsamba: "Çarşamba",
    persembe: "Perşembe",
    cuma: "Cuma",
  };

  const emptyDays = useMemo<Record<string, Record<string, string>>>(
    () => ({
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
    }),
    []
  );

  const [days, setDays] =
    useState<Record<string, Record<string, string>>>(emptyDays);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [deleting, setDeleting] = useState(false);

  const textColor = useThemeColor({}, "text");
  const placeholderColor = useThemeColor({}, "icon");
  const tintColor = useThemeColor({}, "tint");

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        setFetching(true);
        const result: any = await client.graphql({
          query: getPlan,
          variables: { id },
        });

        const plan = result.data.getPlan;
        if (plan) {
          setProjeAdi(plan.title || "");
          setTarihAraligi(plan.dateRange || "");

          if (plan.fields) {
            try {
              const parsedFields = JSON.parse(plan.fields);
              // Merge with empty days to ensure all fields exist
              const mergedDays = { ...emptyDays };
              for (const day of dayNames) {
                if (parsedFields[day]) {
                  mergedDays[day] = { ...emptyDays[day], ...parsedFields[day] };
                }
              }
              setDays(mergedDays);

              // Extract extra fields if stored
              if (parsedFields.haftaNo) setHaftaNo(parsedFields.haftaNo);
              if (parsedFields.kurumAdi) setKurumAdi(parsedFields.kurumAdi);
              if (parsedFields.muzikListesi)
                setMuzikListesi(parsedFields.muzikListesi);
            } catch (e) {
              console.error("Error parsing fields:", e);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching plan:", error);
        Alert.alert("Hata", "Proje yüklenemedi.");
      } finally {
        setFetching(false);
      }
    };
    if (id) {
      fetchPlan();
    }
  }, [id, dayNames, emptyDays]);

  const handleSave = async () => {
    if (!projeAdi.trim()) {
      Alert.alert("Hata", "Lütfen proje adı girin.");
      return;
    }

    try {
      setSaving(true);
      await client.graphql({
        query: updatePlan,
        variables: {
          input: {
            id,
            title: projeAdi,
            dateRange: tarihAraligi,
            fields: JSON.stringify({
              ...days,
              haftaNo,
              kurumAdi,
              muzikListesi,
            }),
          },
        },
      });
      Alert.alert("Başarılı", "Proje güncellendi.");
      router.replace("/");
    } catch (error) {
      console.error("Error updating plan:", error);
      Alert.alert("Hata", (error as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert("Projeyi Sil", "Bu projeyi silmek istediğinize emin misiniz?", [
      { text: "İptal", style: "cancel" },
      {
        text: "Sil",
        style: "destructive",
        onPress: async () => {
          try {
            setDeleting(true);
            await client.graphql({
              query: deletePlan,
              variables: { input: { id } },
            });
            Alert.alert("Başarılı", "Proje silindi.");
            router.replace("/");
          } catch (error) {
            console.error("Error deleting plan:", error);
            Alert.alert("Hata", (error as Error).message);
          } finally {
            setDeleting(false);
          }
        },
      },
    ]);
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

  if (fetching) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={tintColor} />
        <ThemedText style={{ marginTop: 10 }}>Yükleniyor...</ThemedText>
      </ThemedView>
    );
  }

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
          placeholder="Proje Adı *"
          placeholderTextColor={placeholderColor}
          value={projeAdi}
          onChangeText={setProjeAdi}
        />
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

        {dayNames.map((day) => (
          <ThemedView key={day} style={styles.daySection}>
            <Collapsible title={dayDisplayNames[day]}>
              {dayFields.map((field) => (
                <TextInput
                  key={`${day}-${field}`}
                  style={[
                    styles.textArea,
                    { color: textColor, borderColor: placeholderColor },
                  ]}
                  placeholder={dayLabels[field]}
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
              ))}
              <ThemedView style={styles.copyButtonsRow}>
                <ThemedText style={styles.copyLabel}>Kopyala:</ThemedText>
                {dayNames
                  .filter((d) => d !== day)
                  .map((otherDay) => (
                    <TouchableOpacity
                      key={`copy-${day}-${otherDay}`}
                      style={styles.copyBtn}
                      onPress={() =>
                        setDays((prev) => ({
                          ...prev,
                          [day]: { ...prev[otherDay] },
                        }))
                      }
                    >
                      <ThemedText style={styles.copyBtnText}>
                        {dayDisplayNames[otherDay]}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
              </ThemedView>
            </Collapsible>
          </ThemedView>
        ))}

        <ThemedView style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.btn, styles.saveBtn, saving && { opacity: 0.5 }]}
            disabled={saving}
            onPress={handleSave}
          >
            <ThemedText style={styles.btnText}>
              {saving ? "Kaydediliyor..." : "Güncelle"}
            </ThemedText>
          </TouchableOpacity>

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
        </ThemedView>

        <TouchableOpacity
          style={[styles.deleteBtn, deleting && { opacity: 0.5 }]}
          disabled={deleting}
          onPress={handleDelete}
        >
          <ThemedText style={styles.deleteBtnText}>
            {deleting ? "Siliniyor..." : "Projeyi Sil"}
          </ThemedText>
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
  header: { marginTop: 20, marginBottom: 10 },
  input: {
    borderWidth: 1,
    padding: 12,
    marginVertical: 5,
    borderRadius: 8,
    fontSize: 16,
  },
  daySection: {
    marginBottom: 10,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  textArea: {
    borderWidth: 1,
    padding: 12,
    marginVertical: 5,
    borderRadius: 8,
    fontSize: 16,
    height: 80,
    textAlignVertical: "top",
    width: "100%",
  },
  btn: {
    padding: 15,
    borderRadius: 8,
    flex: 1,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 30,
  },
  saveBtn: {
    backgroundColor: "#4CAF50",
  },
  btnText: {
    color: "black",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },
  deleteBtn: {
    padding: 15,
    borderRadius: 8,
    marginTop: 15,
    marginBottom: 50,
    backgroundColor: "#f44336",
  },
  deleteBtnText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },
  copyButtonsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 6,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  copyLabel: {
    fontSize: 12,
    opacity: 0.7,
    marginRight: 4,
  },
  copyBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: "#e0e0e0",
    borderRadius: 12,
  },
  copyBtnText: {
    fontSize: 11,
    color: "#333",
  },
});
