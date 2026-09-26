import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useState } from "react";
import { nastaviOdjavo } from "../services/api";
const AuthContext = createContext();

// Vrne čas poteka žetona v milisekundah ali null, če ga ni mogoče prebrati.
// Podpisa ne preverjamo (to zna le zaledje), zanima nas samo polje exp.
function casPoteka(token) {
  try {
    const del = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const { exp } = JSON.parse(atob(del + "=".repeat((4 - (del.length % 4)) % 4)));
    return typeof exp === "number" ? exp * 1000 : null;
  } catch {
    return null;
  }
}

// Hrani prijavljenega uporabnika in sejo. Za razliko od spletne različice
// uporablja AsyncStorage, ki je asinhron, zato so vse funkcije async.
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [potek, setPotek] = useState(null);
  const [loading, setLoading] = useState(true);

  // Odjava počisti sejo. Isto funkcijo prek nastaviOdjavo() dobi tudi
  // api.js, da lahko uporabnika odjavi ob poteklem žetonu.
  const logoutUser = async () => {
    await AsyncStorage.removeItem("user");
    await AsyncStorage.removeItem("token");
    setUser(null);
    setPotek(null);
  };

  // Ob zagonu obnovimo sejo in api.js povemo, kako naj odjavi uporabnika
  useEffect(() => {
    restoreSession();
    nastaviOdjavo(logoutUser);
    // Samo enkrat ob zagonu aplikacije
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Ko žeton poteče med uporabo, odjavi takoj in ne šele ob naslednjem klicu API
  useEffect(() => {
    if (!potek) return;
    const timer = setTimeout(logoutUser, Math.max(potek - Date.now(), 0));
    return () => clearTimeout(timer);
  }, [potek]);

  // Prijava naj preživi zaprtje aplikacije: podatke preberemo iz pomnilnika
  // naprave. Potekel žeton takoj zavržemo, sicer bi bil uporabnik prijavljen
  // le na videz.
  const restoreSession = async () => {
    try {
      const storedUser = await AsyncStorage.getItem("user");
      const storedToken = await AsyncStorage.getItem("token");
      const cas = storedToken ? casPoteka(storedToken) : null;
      if (storedUser && cas > Date.now()) {
        setUser(JSON.parse(storedUser));
        setPotek(cas);
      } else if (storedUser || storedToken) {
        await logoutUser();
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
    setPotek(casPoteka(token));
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
