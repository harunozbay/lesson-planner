import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Collapsible } from "@/components/ui/collapsible";
import { AppColors } from "@/constants/colors";
import { TOP_BAR_PADDING, useScroll } from "@/contexts/scroll-context";
import { useThemeColor } from "@/hooks/use-theme-color";
import { deletePlan, updatePlan } from "@/src/graphql/mutations";
import { generatePlan, getPlan } from "@/src/graphql/queries";
import { Ionicons } from "@expo/vector-icons";
import { generateClient } from "aws-amplify/api";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
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

export default function EditProjectScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [projeAdi, setProjeAdi] = useState("");
  const [haftaNo, setHaftaNo] = useState("");
  const [tarihAraligi, setTarihAraligi] = useState("");
  const [kurumAdi, setKurumAdi] = useState("");
  const [muzikListesi, setMuzikListesi] = useState("");

  // Orijinal değerler (değişiklik takibi için)
  const [originalData, setOriginalData] = useState<any>(null);

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
  const [copyMode, setCopyMode] = useState<Record<string, "to" | "from">>({
    pazartesi: "to",
    sali: "to",
    carsamba: "to",
    persembe: "to",
    cuma: "to",
  });

  const textColor = useThemeColor({}, "text");
  const placeholderColor = useThemeColor({}, "icon");
  const backgroundColor = useThemeColor({}, "background");
  const { handleScroll, resetTopBar } = useScroll();

  useFocusEffect(
    useCallback(() => {
      resetTopBar();
    }, [resetTopBar])
  );

  // Değişiklik kontrolü
  const hasChanges = useMemo(() => {
    if (!originalData) return false;
    return (
      projeAdi !== originalData.projeAdi ||
      haftaNo !== originalData.haftaNo ||
      tarihAraligi !== originalData.tarihAraligi ||
      kurumAdi !== originalData.kurumAdi ||
      muzikListesi !== originalData.muzikListesi ||
      JSON.stringify(days) !== JSON.stringify(originalData.days)
    );
  }, [
    originalData,
    projeAdi,
    haftaNo,
    tarihAraligi,
    kurumAdi,
    muzikListesi,
    days,
  ]);

  // Undo fonksiyonu
  const handleUndo = useCallback(() => {
    if (!originalData) return;
    setProjeAdi(originalData.projeAdi);
    setHaftaNo(originalData.haftaNo);
    setTarihAraligi(originalData.tarihAraligi);
    setKurumAdi(originalData.kurumAdi);
    setMuzikListesi(originalData.muzikListesi);
    setDays(JSON.parse(JSON.stringify(originalData.days)));
  }, [originalData]);

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
          const title = plan.title || "";
          const dateRange = plan.dateRange || "";
          setProjeAdi(title);
          setTarihAraligi(dateRange);

          let parsedDays = { ...emptyDays };
          let extraFields = { haftaNo: "", kurumAdi: "", muzikListesi: "" };

          if (plan.fields) {
            try {
              const parsedFields = JSON.parse(plan.fields);
              const mergedDays = { ...emptyDays };
              for (const day of dayNames) {
                if (parsedFields[day]) {
                  mergedDays[day] = { ...emptyDays[day], ...parsedFields[day] };
                }
              }
              parsedDays = mergedDays;
              setDays(mergedDays);

              if (parsedFields.haftaNo) {
                setHaftaNo(parsedFields.haftaNo);
                extraFields.haftaNo = parsedFields.haftaNo;
              }
              if (parsedFields.kurumAdi) {
                setKurumAdi(parsedFields.kurumAdi);
                extraFields.kurumAdi = parsedFields.kurumAdi;
              }
              if (parsedFields.muzikListesi) {
                setMuzikListesi(parsedFields.muzikListesi);
                extraFields.muzikListesi = parsedFields.muzikListesi;
              }
            } catch (e) {
              console.error("Error parsing fields:", e);
            }
          }

          // Orijinal veriyi kaydet
          setOriginalData({
            projeAdi: title,
            tarihAraligi: dateRange,
            days: JSON.parse(JSON.stringify(parsedDays)),
            ...extraFields,
          });
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

      // Orijinal veriyi güncelle
      setOriginalData({
        projeAdi,
        tarihAraligi,
        haftaNo,
        kurumAdi,
        muzikListesi,
        days: JSON.parse(JSON.stringify(days)),
      });

      Alert.alert("Başarılı", "Proje güncellendi.");
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
        <ActivityIndicator size="large" color={AppColors.primary} />
        <ThemedText style={{ marginTop: 10 }}>Yükleniyor...</ThemedText>
      </ThemedView>
    );
  }

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
          placeholder="Müzik Listesi(virgülle ayırın)"
          placeholderTextColor={placeholderColor}
          value={muzikListesi}
          onChangeText={setMuzikListesi}
        />

        <ThemedText type="subtitle" style={styles.header}>
          Günlük Plan
        </ThemedText>

        {dayNames.map((day, dayIndex) => (
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
                <View style={styles.copyModeSelector}>
                  <TouchableOpacity
                    style={[
                      styles.copyModeBtn,
                      copyMode[day] === "to" && styles.copyModeBtnActive,
                    ]}
                    onPress={() =>
                      setCopyMode((prev) => ({ ...prev, [day]: "to" }))
                    }
                  >
                    <ThemedText
                      style={[
                        styles.copyModeBtnText,
                        copyMode[day] === "to" && styles.copyModeBtnTextActive,
                      ]}
                    >
                      Güne Kopyala
                    </ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.copyModeBtn,
                      copyMode[day] === "from" && styles.copyModeBtnActive,
                    ]}
                    onPress={() =>
                      setCopyMode((prev) => ({ ...prev, [day]: "from" }))
                    }
                  >
                    <ThemedText
                      style={[
                        styles.copyModeBtnText,
                        copyMode[day] === "from" &&
                          styles.copyModeBtnTextActive,
                      ]}
                    >
                      Günden Kopyala
                    </ThemedText>
                  </TouchableOpacity>
                </View>
                <View style={styles.copyDaysRow}>
                  {dayNames
                    .filter((d) => d !== day)
                    .map((otherDay) => (
                      <TouchableOpacity
                        key={`copy-${day}-${otherDay}`}
                        style={[
                          styles.copyBtn,
                          { backgroundColor: `${dayColors[otherDay]}20` },
                        ]}
                        onPress={() => {
                          if (copyMode[day] === "to") {
                            // Bu günün içeriğini diğer güne kopyala
                            setDays((prev) => ({
                              ...prev,
                              [otherDay]: { ...prev[day] },
                            }));
                          } else {
                            // Diğer günden bu güne kopyala
                            setDays((prev) => ({
                              ...prev,
                              [day]: { ...prev[otherDay] },
                            }));
                          }
                        }}
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
                  {copyMode[day] === "to" && (
                    <TouchableOpacity
                      style={[styles.copyBtn, styles.copyAllBtn]}
                      onPress={() => {
                        // Bu günün içeriğini tüm günlere kopyala
                        setDays((prev) => {
                          const newDays = { ...prev };
                          dayNames.forEach((d) => {
                            if (d !== day) {
                              newDays[d] = { ...prev[day] };
                            }
                          });
                          return newDays;
                        });
                      }}
                    >
                      <ThemedText style={styles.copyAllBtnText}>
                        Tümü
                      </ThemedText>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </Collapsible>
          </View>
        ))}

        {/* Action Buttons */}
        <View style={styles.buttonRow}>
          {hasChanges && (
            <>
              <TouchableOpacity
                style={[styles.btn, styles.undoBtn]}
                onPress={handleUndo}
              >
                <Ionicons name="arrow-undo" size={18} color="#fff" />
                <ThemedText style={styles.btnTextWhite}>Geri Al</ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.btn, styles.saveBtn, saving && styles.disabled]}
                disabled={saving}
                onPress={handleSave}
              >
                <Ionicons name="save" size={18} color="#fff" />
                <ThemedText style={styles.btnTextWhite}>
                  {saving ? "Kaydediliyor..." : "Güncelle"}
                </ThemedText>
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity
            style={[
              styles.btn,
              styles.downloadBtn,
              loading && styles.disabled,
              !hasChanges && { flex: 1 },
            ]}
            disabled={loading}
            onPress={handleDownload}
          >
            <Ionicons name="download" size={18} color="#fff" />
            <ThemedText style={styles.btnTextWhite}>
              {loading ? "Oluşturuluyor..." : "İndir"}
            </ThemedText>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.deleteBtn, deleting && styles.disabled]}
          disabled={deleting}
          onPress={handleDelete}
        >
          <Ionicons name="trash" size={18} color="#fff" />
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
  },
  undoBtn: {
    backgroundColor: AppColors.warning,
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
  deleteBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 14,
    borderRadius: 12,
    marginTop: 15,
    marginBottom: 50,
    backgroundColor: AppColors.error,
    gap: 6,
  },
  deleteBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
  },
  copyButtonsRow: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  copyModeSelector: {
    flexDirection: "row",
    marginBottom: 10,
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: AppColors.primary,
  },
  copyModeBtn: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: "center",
    backgroundColor: "transparent",
  },
  copyModeBtnActive: {
    backgroundColor: AppColors.primary,
  },
  copyModeBtnText: {
    fontSize: 12,
    fontWeight: "600",
    color: AppColors.primary,
  },
  copyModeBtnTextActive: {
    color: "#fff",
  },
  copyDaysRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
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
  copyAllBtn: {
    backgroundColor: AppColors.primary,
  },
  copyAllBtnText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#fff",
  },
});
