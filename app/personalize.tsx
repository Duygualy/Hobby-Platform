import React, { useState, useEffect } from "react";
import { ScrollView, StyleSheet, Alert, Text, TouchableOpacity,View } from "react-native";
import AvatarPreview from "@/components/avatar/AvatarPreview";
import CategorySelector from "@/components/avatar/CategorySelector";
import StyleOptions from "@/components/avatar/StyleOptions";
import AsyncStorage from "@react-native-async-storage/async-storage";
import useAvatar from "@/hooks/useAvatar";

export default function PersonalizeScreen() {
  const avatar = useAvatar();

  const [selectedCategory, setSelectedCategory] = useState("skinTone");
  const [localState, setLocalState] = useState({
    skinTone: "Light",
    hair: "",
    eyes: "",
    lips: "",
    top: "",
    bottom: "",
  });

  useEffect(() => {
    if (avatar) {
      setLocalState({
        skinTone: avatar.skintone?.[0]?.toUpperCase() + avatar.skintone?.slice(1) || "Light",
        hair: avatar.hair || "",
        eyes: avatar.eyes || "",
        lips: avatar.lips || "",
        top: avatar.top || "",
        bottom: avatar.bottom || "",
      });
    }
  }, [avatar]);

  const getSelectedValueForCategory = () => localState[selectedCategory as keyof typeof localState];

  const setSelectedValueForCategory = (value: string) => {
    setLocalState((prev) => ({ ...prev, [selectedCategory]: value }));
  };

  const saveToBackend = async () => {
    const token = await AsyncStorage.getItem("token");

    const avatarData = {
      skintone: localState.skinTone.toLowerCase(),
      ...(localState.hair && { hair: localState.hair }),
      ...(localState.eyes && { eyes: localState.eyes }),
      ...(localState.lips && { lips: localState.lips }),
      ...(localState.top && { top: localState.top }),
      ...(localState.bottom && { bottom: localState.bottom }),
    };

    try {
      const res = await fetch("https://80c5d230b09e.ngrok-free.app/api/avatar/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(avatarData),
      });

      const data = await res.json();
      if (res.ok) {
        Alert.alert("Başarılı", "Avatar kaydedildi 💖");
      } else {
        Alert.alert("Hata", data.message || "Kayıt başarısız");
      }
    } catch (err: any) {
      Alert.alert("Sunucu Hatası", err.message);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Create Your Avatar</Text>
      </View>
      <AvatarPreview
        category={selectedCategory}
        skinTone={localState.skinTone}
        hair={localState.hair}
        eyes={localState.eyes}
        lips={localState.lips}
        top={localState.top}
        bottom={localState.bottom}
      />

      <CategorySelector selected={selectedCategory} onSelect={setSelectedCategory} />

      {selectedCategory === "skinTone" || localState[selectedCategory as keyof typeof localState] ? (
        <StyleOptions
          category={selectedCategory}
          selected={getSelectedValueForCategory()}
          onSelect={setSelectedValueForCategory}
        />
      ) : (
        <Text style={{ textAlign: "center", marginTop: 20 }}>Lütfen önce bir değer seçin.</Text>
      )}
      
      <TouchableOpacity
        style={styles.saveButton}
        onPress={saveToBackend}
      >
        <Text style={styles.saveText} >Save</Text>
      </TouchableOpacity>
      
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    backgroundColor: "#FFF8E7",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#8B4513',
    marginBottom: 5,
  },
  saveButton: {
    backgroundColor: "#FFE5B4",
    padding: 12,
    borderRadius: 10,
    marginTop: 20,
    alignItems: "center",
  },
  saveText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
