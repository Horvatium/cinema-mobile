import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useState } from "react";
import { nastaviOdjavo } from "../services/api";
const AuthContext = createContext();

// Hrani prijavljenega uporabnika in sejo. Za razliko od spletne različice
// uporablja AsyncStorage, ki je asinhron, zato so vse funkcije async.
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Odjava počisti sejo. Isto funkcijo prek nastaviOdjavo() dobi tudi
  // api.js, da lahko uporabnika odjavi ob poteklem žetonu.
  const logoutUser = async () => {
    await AsyncStorage.removeItem("user");
    await AsyncStorage.removeItem("token");
    setUser(null);
  };

  // Ob zagonu obnovimo sejo in api.js povemo, kako naj odjavi uporabnika
  useEffect(() => {
    restoreSession();
    nastaviOdjavo(logoutUser);
  }, []);

  // Prijava naj preživi zaprtje aplikacije: podatke preberemo iz pomnilnika
  // naprave. Žetona ne preverjamo — če je potekel, to ugotovi prvi klic API.
  const restoreSession = async () => {
    try {
      const storedUser = await AsyncStorage.getItem("user");
      const storedToken = await AsyncStorage.getItem("token");
      if (storedUser && storedToken) {
        setUser(JSON.parse(storedUser));
      }
    } catch (err) {
      console.error("Napaka pri obnovi seje:", err);
    } finally {
      setLoading(false);
    }
  };

  // Po uspešni prijavi shranimo uporabnika in žeton
  const loginUser = async (userData, token) => {
    await AsyncStorage.setItem("user", JSON.stringify(userData));
    await AsyncStorage.setItem("token", token);
    setUser(userData);
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginUser, logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
