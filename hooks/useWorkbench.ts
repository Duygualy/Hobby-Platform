import { useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function useWorkbench() {
  const [workbench, setWorkbench] = useState<any>(null);

  useFocusEffect(
    useCallback(() => {
      const fetchWorkbench = async () => {
        const token = await AsyncStorage.getItem("token");

        try {
          const res = await fetch("https://80c5d230b09e.ngrok-free.app/api/hobby/myHobby", {
            headers: { Authorization: `Bearer ${token}` },
          });

          const data = await res.json();
          if (res.ok) setWorkbench(data);
          else console.warn("Workbench çekilemedi:", data.message);
        } catch (err) {
          console.error("Workbench fetch error:", err);
        }
      };

      fetchWorkbench();
    }, [])
  );

  return workbench;
}
