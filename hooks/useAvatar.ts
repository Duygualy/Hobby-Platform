import { useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function useAvatar() {
  const [avatar, setAvatar] = useState<any>(null);

  useFocusEffect(
    useCallback(() => {
      const fetchAvatar = async () => {
        const token = await AsyncStorage.getItem("token");

        try {
          const res = await fetch("https://80c5d230b09e.ngrok-free.app/api/avatar/me", {
            headers: { Authorization: `Bearer ${token}` },
          });

          const data = await res.json();
          if (res.ok) setAvatar(data);
          else console.warn("Avatar çekilemedi:", data.message);
        } catch (err) {
          console.error("Avatar fetch error:", err);
        }
      };

      fetchAvatar();
    }, [])
  );

  return avatar;
}
