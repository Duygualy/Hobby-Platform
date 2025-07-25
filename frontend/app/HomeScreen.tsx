import { View, StyleSheet, Dimensions, Text } from "react-native";
import AvatarPreview from "@/components/avatar/AvatarPreview";
import useAvatar from "@/hooks/useAvatar";
import Workbench from "@/components/workbench/Workbench";
import PersonalizeButton from "@/components/Buttons/PersonalizeButton";
import HobbyButton from "@/components/Buttons/HobbyButton";
import LogoutButton from "@/components/Buttons/LogOutButton";
import { useRouter } from "expo-router";

const { width } = Dimensions.get("window");

export default function HomeScreen() {
  const router = useRouter();
  const avatar = useAvatar();

  return (
    <View style={styles.container}>
      <View style={styles.avatarContainer}>
        {avatar ? (
          <AvatarPreview
            category="top"
            skinTone={avatar.skintone}
            hair={avatar.hair}
            eyes={avatar.eyes}
            lips={avatar.lips}
            top={avatar.top}
            bottom={avatar.bottom}
          />
        ) : (
          <Text style={{ color: "black" }}>Avatar yükleniyor...</Text>
        )}
      </View>

      <View style={styles.benchContainer}>
        <Workbench />
      </View>

      <View style={styles.buttonContainer}>
        <PersonalizeButton onPress={() => router.push("/personalize")} />
      </View>

      <View style={styles.hbuttonContainer}>
        <HobbyButton onPress={() => router.push("/hobby")} />
      </View>

      <LogoutButton />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9dea8ff",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  avatarContainer: {
    position: "absolute",
    bottom: 340,
    zIndex: 1,
  },
  benchContainer: {
    width: width,
    height: 400,
    justifyContent: "flex-end",
    zIndex: 2,
    bottom: 60,
  },
  buttonContainer: {
    position: "absolute",
    bottom: 20,
    zIndex: 3,
  },
  hbuttonContainer: {
    position: "absolute",
    bottom: -50,
    zIndex: 3,
  },
  logoutButton: {
    backgroundColor: "brown",
    padding: 10,
    borderRadius: 20,
    position: "absolute",
    top: 40,
    right: 20,
  },
  logoutText: {
    color: "white",
    fontWeight: "bold",
  },
});
