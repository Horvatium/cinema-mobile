import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

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

export const registerForPushNotifications = async () => {
  if (!Device.isDevice) return null;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") return null;

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
        },
      )} je bilo preklicano.`,
      sound: true,
    },
    trigger: null,
  });
};
