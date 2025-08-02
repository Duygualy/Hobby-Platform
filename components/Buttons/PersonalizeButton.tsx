import React from "react";
import { TouchableOpacity, StyleSheet, Image, GestureResponderEvent } from "react-native";

type Props = {
  onPress: (event: GestureResponderEvent) => void;
};

export default function PersonalizeButton({ onPress }: Props) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.button}>
      <Image
        source={require("../../assets/images/button/personalizeButton.png")} 
        style={styles.image}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    alignSelf: "center",
  },
  image: {
    width: 60,
    height: 60,
    backgroundColor: "#F3A26D",
    borderRadius: 68,
    bottom: 650,
    right: 150,
    resizeMode: "contain",
  },
});
