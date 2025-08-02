import React from "react";
import { View, Image, StyleSheet } from "react-native";

type Props = {
  hobbies: string[];
};

const normalize = (text: string | null | undefined) => {
  if (typeof text !== "string") return "";
  return text.toLowerCase().replace(/\s+/g, "");
};

const hobbyImages: Record<string, any> = {
  coding: require("../../assets/images/HobbyTools/Coding.png"),
  lego: require("../../assets/images/HobbyTools/Lego.png"),
  movie: require("../../assets/images/HobbyTools/Movie.png"),
  reading: require("../../assets/images/HobbyTools/Reading.png"),
  weightlifting: require("../../assets/images/HobbyTools/Weightlifting.png"),
  yoga: require("../../assets/images/HobbyTools/Yoga.png"),
};

const hobbyPositions: Record<string, any> = {
  coding: { top: 60, right: 60, width: 50, height: 50 },
  lego: { top: 64, right: 110, width: 50, height: 50 },
  movie: { top: 66, left: 64, width: 40, height: 40 },
  reading: { top: 101, left: 45, width: 40, height: 40 },
  weightlifting: { top: 100, left: 200, width: 50, height: 50 },
  yoga: { top: 66, left: 105, width: 50, height: 50 },
};

export default function WorkbenchPreview({ hobbies }: Props) {
  return (
    <View style={styles.container}>
      <Image source={require("../../assets/images/bench.png")} style={styles.bench} />

      {hobbies.map((hobby) => {
        const key = normalize(hobby);
        const source = hobbyImages[key];
        const style = hobbyPositions[key];
        if (!source || !style) return null;

        return (
          <Image
            key={key}
            source={source}
            style={[styles.overlay, style]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    position: "relative",
  },
  bench: {
    width: 300,
    height: 300,
    resizeMode: "contain",
  },
  overlay: {
    position: "absolute",
    resizeMode: "contain",
  },
});
