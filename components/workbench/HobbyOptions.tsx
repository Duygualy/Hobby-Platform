import React from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image } from "react-native";

type Props = {
  category: string;
  selectedList: string[];
  onToggle: (value: string) => void;
};

const options = {
  hobby: ["Coding", "Lego", "Movie", "Reading", "Weightlifting", "Yoga"],
};

const hobbyImages: Record<string, any> = {
  Coding: require("../../assets/images/HobbyTools/Coding.png"),
  Lego: require("../../assets/images/HobbyTools/Lego.png"),
  Movie: require("../../assets/images/HobbyTools/Movie.png"),
  Reading: require("../../assets/images/HobbyTools/Reading.png"),
  Weightlifting: require("../../assets/images/HobbyTools/Weightlifting.png"),
  Yoga: require("../../assets/images/HobbyTools/Yoga.png"),
};

export default function HobbyOptions({ category, selectedList, onToggle }: Props) {
  const currentOptions = options[category as keyof typeof options] || [];

  return (
    <View style={styles.wrapper}>
      <Text style={styles.title}>Choose:</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {currentOptions.map((opt) => {
          const imageSource = hobbyImages[opt];
          const isSelected = selectedList.includes(opt);

          return (
            <TouchableOpacity
              key={opt}
              style={[styles.option, isSelected && styles.selectedOption]}
              onPress={() => onToggle(opt)}
            >
              {imageSource ? (
                <Image source={imageSource} style={styles.image} />
              ) : (
                <Text style={styles.text}>{opt}</Text>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 20,
  },
  title: {
    fontWeight: "bold",
    marginBottom: 8,
    fontSize: 16,
  },
  option: {
    backgroundColor: "#eee",
    padding: 8,
    borderRadius: 10,
    marginRight: 10,
    width: 80,
    height: 80,
    justifyContent: "center",
    alignItems: "center",
  },
  selectedOption: {
    backgroundColor: "#fcb6d0",
  },
  text: {
    fontSize: 14,
  },
  image: {
    width: 60,
    height: 60,
    resizeMode: "contain",
  },
});
