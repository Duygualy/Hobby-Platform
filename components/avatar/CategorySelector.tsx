import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

type Props = {
  selected: string;
  onSelect: (value: string) => void;
};

const categories = [
  { key: "skinTone", label: "Skin" },
  { key: "hair", label: "Hair" },
  { key: "eyes", label: "Eye" },
  { key: "lips", label: "Mouth" },
  { key: "top", label: "Top" },
  { key: "bottom", label: "Bottom" },
];

export default function CategorySelector({ selected, onSelect }: Props) {
  return (
    <View style={styles.container}>
      {categories.map((cat) => (
        <TouchableOpacity
          key={cat.key}
          style={[
            styles.button,
            selected === cat.key && styles.selectedButton,
          ]}
          onPress={() => onSelect(cat.key)}
        >
          <Text style={styles.label}>{cat.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 60,
    top: 40,
  },
  button: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "#eee",
  },
  selectedButton: {
    backgroundColor: "#fcb6d0",
  },
  label: {
    fontSize: 14,
    fontWeight: "bold",
  },
});
