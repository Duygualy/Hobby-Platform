import React from "react";
import { View, Image, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

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
  coding: { top: 75, right: 60, width: 65, height: 65 },
  lego: { top: 80, right: 140, width: 60, height: 60 },
  movie: { top: 76, left: 45, width: 50, height: 50 },
  reading: { top: 128, left: 25, width: 52, height: 52 },
  weightlifting: { top: 120, left: 190, width: 70, height: 70 },
  yoga: { top: 80, left: 105, width: 70, height: 70 },
};

const hobbyRoutes = {
  coding: "/coding",
  lego: "/lego",
  movie: "/movie",
  reading: "/reading",
  weightlifting: "/weightlifting",
  yoga: "/yoga",
} as const;

export default function Workbench({ hobbies }: Props) {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Image source={require("../../assets/images/bench.png")} style={styles.bench} />

      {hobbies?.filter(Boolean).map((hobby) => {
        const key = normalize(hobby);
        const source = hobbyImages[key];
        const style = hobbyPositions[key];
        const route = hobbyRoutes[key as keyof typeof hobbyRoutes];

        if (!source || !style || !route) return null;

        return (
          <TouchableOpacity
            key={key}
            style={[styles.overlay, style]}
            onPress={() => {
              router.push(route as `${string}`);
            }}
          >
            <Image
              source={source}
              style={{
                width: style.width * 1.2,
                height: style.height * 1.2,
                resizeMode: "contain",
              }}
            />
          </TouchableOpacity>
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
    width: 400,
    height: 400,
    resizeMode: "contain",
  },
  overlay: {
    position: "absolute",
  },
  image: {
    resizeMode: "contain",
  },
});
