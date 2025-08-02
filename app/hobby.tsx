import React, { useState, useEffect } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, Text, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import WorkbenchPreview from "@/components/workbench/WorkbenchPreview";
import CategorySelector from "@/components/workbench/CategorySelector";
import HobbyOptions from "@/components/workbench/HobbyOptions";
import useWorkbench from "@/hooks/useWorkbench";
import Toast from 'react-native-toast-message';

export default function WorkbenchScreen() {
  const [selectedCategory, setSelectedCategory] = useState("hobby");
  const [localState, setLocalState] = useState({
    hobbies: [] as string[],
  });
  const workbench = useWorkbench();

  useEffect(() => {
    if (workbench?.hobbies) {
      setLocalState({ hobbies: workbench.hobbies });
    }
  }, [workbench]);

  const toggleHobby = (value: string) => {
    setLocalState((prev) => {
      const exists = prev.hobbies.includes(value);
      const updated = exists
        ? prev.hobbies.filter((h) => h !== value)
        : [...prev.hobbies, value];
      return { ...prev, hobbies: updated };
    });
  };

  const saveToBackend = async () => {
  const token = await AsyncStorage.getItem("token");
  try {
    await fetch("https://80c5d230b09e.ngrok-free.app/api/hobby/saveHobby", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ hobbies: localState.hobbies }),
    });

    Toast.show({
      type: 'success',
      text1: 'Harika!',
      text2: 'Hobiler başarıyla kaydedildi 💾',
    });
    } catch (err) {
    console.error("Hobi kaydedilemedi:", err);

    Toast.show({
      type: 'error',
      text1: 'Oops!',
      text2: 'Bir şeyler ters gitti, tekrar dene 😥',
    });
  }
};

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Choice Your Hobby</Text>
      </View>
      <WorkbenchPreview hobbies={localState.hobbies} />
      <CategorySelector
        selected={selectedCategory}
        onSelect={setSelectedCategory}
      />

      <HobbyOptions
        category={selectedCategory}
        selectedList={localState.hobbies}
        onToggle={toggleHobby}
      />

      <TouchableOpacity
        style={styles.saveButton}
        onPress={saveToBackend}
      >
        <Text style={styles.saveText}>Hobileri Kaydet</Text>
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
