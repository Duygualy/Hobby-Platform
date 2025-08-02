import React from "react";
import { View, Image, StyleSheet } from "react-native";

type Props = {
  category: string;
  skinTone: string;
  hair: string;
  eyes: string;
  lips: string;
  top: string;
  bottom: string;
};

const normalize = (text: string) => (text || "").toLowerCase().replace(/\s+/g, "");

const baseImages: Record<string, any> = {
  face_light: require("../../assets/images/face_light.png"),
  face_medium: require("../../assets/images/face_medium.png"),
  face_tan: require("../../assets/images/face_tan.png"),
  base_light: require("../../assets/images/base_light.png"),
  base_medium: require("../../assets/images/base_medium.png"),
  base_tan: require("../../assets/images/base_tan.png"),
  default: require("../../assets/images/base_light.png"),
};

// 🔹 Saç
const faceHairImages: Record<string, any> = {
  yellow1: require("../../assets/images/hair/yellow1.png"),
  yellow2: require("../../assets/images/hair/yellow2.png"),
  yellow3: require("../../assets/images/hair/yellow3.png"),
  black1: require("../../assets/images/hair/black1.png"),
  black2: require("../../assets/images/hair/black2.png"),
};
const faceHairPositions: Record<string, any> = {
  yellow1: { top: 16, left: -24, height: 225, width: 400 },
  yellow2: { top: 12, left: 78 },
  yellow3: { top: -20, left: -24, width: 400, height: 255 },
  black1: { top: 14, left: 91, height: 185, width: 170 },
  black2: { top: -7, left: 76, height: 230, width: 200 },
};

const bodyHairImages = faceHairImages;
const bodyHairPositions: Record<string, any> = {
  yellow1: { top: -5, left: 76, height: 155, width: 200 },
  yellow2: { top: -6, left: 77.4, height: 132, width: 200 },
  yellow3: { top: -29, left: 110, width: 132, height: 170},
  black1: { top:-3, left: 116, height: 115, width: 120 },
  black2: { top: -21, left: 106.5, height: 155, width: 140 },
};

// 🔹 Göz
const faceEyesImages: Record<string, any> = {
  black: require("../../assets/images/eyes/black.png"),
};
const faceEyesPositions: Record<string, any> = {
  black: { top: 25, left: 76 },
};
const bodyEyesImages = faceEyesImages;
const bodyEyesPositions: Record<string, any> = {
  black: { top: 2, left: 106, height: 130, width: 140 },
};

// 🔹 Dudak
const faceLipsImages: Record<string, any> = {
  red1: require("../../assets/images/lips/red1.png"),
  red2: require("../../assets/images/lips/red2.png"),
  pink: require("../../assets/images/lips/pink.png"),
};
const faceLipsPositions: Record<string, any> = {
  red1: { top: 125, left: 160, height: 33, width: 33 },
  red2: { top: 125, left: 160, height: 33, width: 33 },
  pink: { top: 125, left: 160, height: 32, width: 32 },
};
const bodyLipsImages = faceLipsImages;
const bodyLipsPositions: Record<string, any> = {
  red1: { top: 68, left: 167, height: 20, width: 20 },
  red2: { top: 69, left: 167, height: 19, width: 19 },
  pink: { top: 68, left: 166, height: 20, width: 20 },
};

// 🔹 Üst
const topImages: Record<string, any> = {
  black: require("../../assets/images/top/black.png"),
  white: require("../../assets/images/top/white.png"),
};
const topPositions: Record<string, any> = {
  black: { top: 46, left: 76, height: 175, width: 200 },
  white: { top: 46, left: 76, height: 175, width: 200 },
};

// 🔹 Alt
const bottomImages: Record<string, any> = {
  black: require("../../assets/images/bottom/bottom.png"),
};
const bottomPositions: Record<string, any> = {
  black: { top: 126, left: 77, height: 96, width: 200 },
};

export default function AvatarPreview({
  category,
  skinTone,
  hair,
  eyes,
  lips,
  top,
  bottom,
}: Props) {
  const isFaceMode = ["hair", "eyes", "lips"].includes(category);
  const imageKey = isFaceMode
    ? `face_${normalize(skinTone)}`
    : `base_${normalize(skinTone)}`;
  const baseSource = baseImages[imageKey] || baseImages["default"];

  const hairKey = normalize(hair);
  const eyesKey = normalize(eyes);
  const lipsKey = normalize(lips);
  const topKey = normalize(top);
  const bottomKey = normalize(bottom);

  const hairSource = isFaceMode
    ? faceHairImages[hairKey]
    : bodyHairImages[hairKey];
  const hairStyle = isFaceMode
    ? faceHairPositions[hairKey]
    : bodyHairPositions[hairKey];

  const eyesSource = isFaceMode
    ? faceEyesImages[eyesKey]
    : bodyEyesImages[eyesKey];
  const eyesStyle = isFaceMode
    ? faceEyesPositions[eyesKey]
    : bodyEyesPositions[eyesKey];

  const lipsSource = isFaceMode
    ? faceLipsImages[lipsKey]
    : bodyLipsImages[lipsKey];
  const lipsStyle = isFaceMode
    ? faceLipsPositions[lipsKey]
    : bodyLipsPositions[lipsKey];

  const topSource = topImages[topKey];
  const topStyle = topPositions[topKey];

  const bottomSource = bottomImages[bottomKey];
  const bottomStyle = bottomPositions[bottomKey];

  return (
    <View style={styles.container}>
      <Image source={baseSource} style={styles.avatar} />
      {!isFaceMode && bottomSource && (
        <Image
          source={bottomSource}
          style={[styles.avatar, styles.overlay, bottomStyle]}
        />
      )}
      {!isFaceMode && topSource && (
        <Image
          source={topSource}
          style={[styles.avatar, styles.overlay, topStyle]}
        />
      )}
      {hairSource && (
        <Image
          source={hairSource}
          style={[styles.avatar, styles.overlay, hairStyle]}
        />
      )}
      {eyesSource && (
        <Image
          source={eyesSource}
          style={[styles.avatar, styles.overlay, eyesStyle]}
        />
      )}
      {lipsSource && (
        <Image
          source={lipsSource}
          style={[styles.avatar, styles.overlay, lipsStyle]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginBottom: 20,
    position: "relative",
    top: 20,
  },
  avatar: {
    width: 200,
    height: 200,
    resizeMode: "contain",
  },
  overlay: {
    position: "absolute",
  },
});
