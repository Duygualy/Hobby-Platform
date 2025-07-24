import { View, Text, TextInput, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

const handleLogin = async () => {
  if (!email || !password) {
    alert("Please fill in all fields.");
    return;
  }

  try {
    const res = await fetch("https://f34347b0860d.ngrok-free.app/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (res.ok) {
      await AsyncStorage.setItem("token", data.token);
      router.replace("/HomeScreen");
    } else {
      alert(data.message || "Login failed.");
    }
  } catch (err) {
    console.error("Login error:", err);
    alert("An error occurred during login.");
  }
};


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Log In</Text>
      <TextInput placeholder="E-mail" value={email} onChangeText={setEmail} style={styles.input} />
      <TextInput placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} style={styles.input} />
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Log in</Text>
      </TouchableOpacity>
      <Text style={styles.link} onPress={() => router.push("/SignUp")}>  {"Don't"} you have an account? Sign up!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: "center", 
    padding: 20 
  },
  title: { 
    fontSize: 24, 
    fontWeight: "bold", 
    marginBottom: 20, 
    textAlign: "center" 
  },
  input: { 
    borderWidth: 1, 
    padding: 10, 
    marginBottom: 10, 
    borderRadius: 18 
  },

  button: {
    backgroundColor: "brown",
    padding: 12,
    borderRadius: 38,
    alignItems: "center",
    marginTop: 12,
    width: 130,
    alignSelf: "center", 
  },

  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },

  link: { 
    marginTop: 10, 
    color: "brown", 
    textAlign: "center" 
  },
});
