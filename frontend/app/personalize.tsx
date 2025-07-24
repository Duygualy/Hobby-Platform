import React, { useState } from "react";
import { ScrollView, StyleSheet, Button, View, Alert} from "react-native";
import AvatarPreview from "@/components/avatar/AvatarPreview";
import CategorySelector from "@/components/avatar/CategorySelector";
import StyleOptions from "@/components/avatar/StyleOptions";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function PersonalizeScreen() {
  const [selectedCategory, setSelectedCategory] = useState("skinTone");

  const [skinTone, setSkinTone] = useState("Light");
  const [hair, setHair] = useState("Yellow 1");
  const [eyes, setEyes] = useState("Black");
  const [lips, setLips] = useState("Red 1");
  const [top, setTop] = useState("Black");
  const [bottom, setBottom] = useState("Black");

  const getSelectedValueForCategory = () => {
    switch (selectedCategory) {
      case "skinTone":
        return skinTone;
      case "hair":
        return hair;
      case "eyes":
        return eyes;
      case "lips":
        return lips;
      case "top":
        return top;
      case "bottom":
        return bottom;
      default:
        return "";
    }
  };

  const setSelectedValueForCategory = (value: string) => {
    switch (selectedCategory) {
      case "skinTone":
        setSkinTone(value);
        break;
      case "hair":
        setHair(value);
        break;
      case "eyes":
        setEyes(value);
        break;
      case "lips":
        setLips(value);
        break;
      case "top":
        setTop(value);
        break;
      case "bottom":
        setBottom(value);
        break;
    }
  };

  const saveToBackend = async () => {
    const token = await AsyncStorage.getItem("token");

    const avatarData = {
      hair,
      eyes,
      top,
      bottom,
      skintone: skinTone.toLowerCase(),
    };

    try {
      const res = await fetch("https://f34347b0860d.ngrok-free.app/api/avatar/save", {
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
      <AvatarPreview
        category={selectedCategory}
        skinTone={skinTone}
        hair={hair}
        eyes={eyes}
        lips={lips}
        top={top}
        bottom={bottom}
      />

      <CategorySelector
        selected={selectedCategory}
        onSelect={(val) => setSelectedCategory(val)}
      />

      <StyleOptions
        category={selectedCategory}
        selected={getSelectedValueForCategory()}
        onSelect={setSelectedValueForCategory}
      />

      <View style={{ marginTop: 40 }}>
        <Button title="Avatarı Kaydet" onPress={saveToBackend} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
  },
});
