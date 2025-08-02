import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
} from "react-native";

type Props = {
  category: string;
  selected: string;
  onSelect: (value: string) => void;
};

const normalize = (text: string) => text.toLowerCase().replace(/\s+/g, "");

const options = {
  skinTone: ["Light", "Medium", "Tan"],
  hair: ["Yellow 1", "Yellow 2", "Yellow 3", "Black 1", "Black 2"],
  eyes: ["Black"],
  lips: ["Red 1", "Red 2", "Pink"],
  top: ["Black", "White"],
  bottom: ["Black"],
};

const skinToneImages: Record<string, any> = {
  Light: require("../../assets/images/base_light.png"),
  Medium: require("../../assets/images/base_medium.png"),
  Tan: require("../../assets/images/base_tan.png"),
};

const hairImages: Record<string, any> = {
  yellow1: require("../../assets/images/hair/yellow1.png"),
  yellow2: require("../../assets/images/hair/yellow2.png"),
  yellow3: require("../../assets/images/hair/yellow3.png"),
  black1: require("../../assets/images/hair/black1.png"),
  black2: require("../../assets/images/hair/black2.png"),
};

const eyesImages: Record<string, any> = {
  black: require("../../assets/images/eyes/black.png"),
};

const lipsImages: Record<string, any> = {
  red1: require("../../assets/images/lips/red1.png"),
  red2: require("../../assets/images/lips/red2.png"),
  pink: require("../../assets/images/lips/pink.png"),
};

const topImages: Record<string, any> = {
  black: require("../../assets/images/top/black.png"),
  white: require("../../assets/images/top/white.png"),
};

const bottomImages: Record<string, any> = {
  black: require("../../assets/images/bottom/bottom.png"),
};

export default function StyleOptions({ category, selected, onSelect }: Props) {
  const currentOptions = options[category as keyof typeof options] || [];

  return (
    <View style={styles.wrapper}>
      <Text style={styles.title}>Choose:</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {currentOptions.map((opt) => {
          const normalized = normalize(opt);
          let imageSource: any = null;

          switch (category) {
            case "hair":
              imageSource = hairImages[normalized];
              break;
            case "eyes":
              imageSource = eyesImages[normalized];
              break;
            case "lips":
              imageSource = lipsImages[normalized];
              break;
            case "top":
              imageSource = topImages[normalized];
              break;
            case "bottom":
              imageSource = bottomImages[normalized];
              break;
            case "skinTone":
              imageSource = skinToneImages[opt];
              break;
          }

          return (
            <TouchableOpacity
              key={opt}
              style={[
                styles.option,
                selected === opt && styles.selectedOption,
              ]}
              onPress={() => onSelect(opt)}
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
