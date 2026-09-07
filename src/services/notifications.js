import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

// Obvestila v mobilni aplikaciji. Vsa spodnja obvestila so lokalna —
// naprava jih prikaže sama takoj po dejanju uporabnika in ne pridejo
// s strežnika.

// Privzeto se obvestilo, ki pride med uporabo aplikacije, ne pokaže;
// s tem rokovalnikom ga prikažemo tudi takrat.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Zapiše znesek v slovenski obliki, npr. 9,99 €
export const formatPrice = (value) =>
  `${Number(value).toFixed(2).replace(".", ",")} €`;

// Zaprosi za dovoljenje za obvestila in na Androidu pripravi kanal
export const registerForPushNotifications = async () => {
  // Simulator obvestil ne podpira
  if (!Device.isDevice) return null;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") return null;

  // Android od različice 8 naprej zahteva kanal, sicer se obvestilo
  // ne prikaže
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "KinoPlex",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#e50914",
    });
  }

  return true;
};

// Obvestilo po uspešni rezervaciji (trigger: null pomeni takoj)
export const showBookingConfirmedNotification = async (
  filmTitle,
  seats,
  total,
) => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "🎬 Rezervacija potrjena!",
      body: `${filmTitle} — Sedeži: ${seats} — Skupaj: ${formatPrice(total)}`,
      sound: true,
    },
    trigger: null,
  });
};

// Obvestilo po preklicu rezervacije s strani uporabnika
export const showBookingCancelledNotification = async (filmTitle) => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "❌ Rezervacija preklicana",
      body: `Vaša rezervacija za ${filmTitle} je bila preklicana.`,
      sound: true,
    },
    trigger: null,
  });
};

// Obvestilo ob odpovedi predvajanja s strani kinematografa
export const showScreeningCancelledNotification = async (
  filmTitle,
  screeningTime,
) => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "⚠️ Predvajanje odpovedano",
      body: `${filmTitle} na ${new Date(screeningTime).toLocaleDateString(
        "sl-SI",
        {
          weekday: "short",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          timeZone: "UTC",
        },
      )} je bilo preklicano.`,
      sound: true,
    },
    trigger: null,
  });
};
