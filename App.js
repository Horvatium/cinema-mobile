import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useEffect } from "react";
import { ActivityIndicator, Image, Text, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider, useAuth } from "./src/context/AuthContext";
import { registerForPushNotifications } from "./src/services/notifications";

import FilmDetailScreen from "./src/screens/FilmDetailScreen";
import HomeScreen from "./src/screens/HomeScreen";
import LoginScreen from "./src/screens/LoginScreen";
import MyReservationsScreen from "./src/screens/MyReservationsScreen";
import RegisterScreen from "./src/screens/RegisterScreen";

// Korenska datoteka mobilne aplikacije: nastavi ovojnice (varno območje,
// stanje prijave) in sklad zaslonov.
const Stack = createNativeStackNavigator();

// Navigacija je odvisna od prijave, zato mora biti znotraj AuthProvider —
// od tod ločena komponenta namesto vsega neposredno v App().
function Navigation() {
  const { user, loading } = useAuth();

  // Za obvestila zaprosimo šele po prijavi, ne ob prvem zagonu — uporabnik
  // takrat že ve, čemu bodo namenjena
  useEffect(() => {
    if (user) {
      registerForPushNotifications();
    }
  }, [user]);

  // Med obnavljanjem seje iz pomnilnika naprave pokažemo vrtavko, da
  // prijavljen uporabnik za trenutek ne vidi prijavnega zaslona
  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#0a0a0a",
        }}
      >
        <ActivityIndicator size="large" color="#e50914" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: "#111" },
          headerTintColor: "#fff",
          headerTitleStyle: { fontWeight: "bold" },
          contentStyle: { backgroundColor: "#0a0a0a" },
        }}
      >
        {/* Sklada sta ločena: neprijavljen uporabnik do zaslonov aplikacije
            sploh nima poti, zato se nanje ni mogoče vrniti z gumbom nazaj */}
        {!user ? (
          <>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Register"
              component={RegisterScreen}
              options={{ title: "Ustvarite račun" }}
            />
          </>
        ) : (
          <>
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{
                headerTitle: () => (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 10,
                    }}
                  >
                    <Image
                      source={require("./assets/logo-transparent.png")}
                      style={{ width: 40, height: 40 }}
                      resizeMode="contain"
                    />
                    <Text
                      style={{
                        color: "#00c9b1",
                        fontSize: 20,
                        fontWeight: "700",
                        letterSpacing: -0.5,
                      }}
                    >
                      KinoPlex
                    </Text>
                  </View>
                ),
                headerStyle: { backgroundColor: "#080b1a" },
                headerTintColor: "#fff",
                headerTitleAlign: "left",
              }}
            />
            <Stack.Screen
              name="FilmDetail"
              component={FilmDetailScreen}
              options={({ route }) => ({
                title: route.params?.film?.title || "Izberite sedeže",
              })}
            />
            <Stack.Screen
              name="MyReservations"
              component={MyReservationsScreen}
              options={{ title: "Moje rezervacije" }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <Navigation />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
