import React from "react";
import { View, StyleSheet, Image } from "react-native";

export default function Workbench() {
  return (
    <View>
  <Image
    source={require("../../assets/images/bench.png")}
    style={styles.bench}
  />
</View>
  );
}

const styles = StyleSheet.create({
  bench: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
});
