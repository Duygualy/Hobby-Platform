import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function useAvatar() {
  const [avatar, setAvatar] = useState<any>(null);

  useEffect(() => {
    const fetchAvatar = async () => {
      const token = await AsyncStorage.getItem("token"); 
      console.log("TOKEN:", token);

      try {
        const res = await fetch("https://f34347b0860d.ngrok-free.app/api/avatar/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        console.log("AVATAR:", data);

        if (res.ok) setAvatar(data);
        else console.warn("Avatar çekilemedi:", data.message);
      } catch (err) {
        console.error("Avatar fetch error:", err);
      }
    };

    fetchAvatar();
  }, []);

  return avatar;
}
