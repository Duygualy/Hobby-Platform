import { TouchableOpacity, StyleSheet, Image } from "react-native"; 
import { useRouter } from "expo-router";
import { removeToken } from "@/utils/auth";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await removeToken();
    router.replace("/Login");
  };

  return (
    <TouchableOpacity onPress={handleLogout} style={styles.button}>
      <Image 
        source={require("../../assets/images/button/logoutbutton.png")} 
        style={styles.image} 
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 10,
    borderRadius: 20,
    position: "absolute",
    top: 40,
    right: 2,
  },
  image: { 
    width: 40, 
    height: 40,
    resizeMode: "contain",
  },
});