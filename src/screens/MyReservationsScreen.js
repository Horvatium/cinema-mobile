import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Colors from "../../constants/colors";
import { cancelReservation, getMyReservations } from "../services/api";
import {
  formatPrice,
  showBookingCancelledNotification,
} from "../services/notifications";

export default function MyReservationsScreen() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      const response = await getMyReservations();
      setReservations(response.data);
    } catch (_err) {
      setError("Napaka pri nalaganju rezervacij.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = (id, filmTitle) => {
    Alert.alert(
      "Preklic rezervacije",
      "Ste prepričani, da želite preklicati to rezervacijo?",
      [
        { text: "Ne", style: "cancel" },
        {
          text: "Da, prekliči",
          style: "destructive",
          onPress: async () => {
            try {
              await cancelReservation(id);
              await showBookingCancelledNotification(filmTitle);
              fetchReservations();
            } catch (_err) {
              Alert.alert("Napaka", "Napaka pri preklicu rezervacije.");
            }
          },
        },
      ],
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed":
        return Colors.primary;
      case "cancelled":
        return Colors.error;
      default:
        return "#f39c12";
    }
  };

  if (loading)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );

  if (error)
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      data={reservations}
      keyExtractor={(item) => item.id.toString()}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🎟️</Text>
          <Text style={styles.emptyText}>Napaka pri preklicu rezervacije.</Text>
          <Text style={styles.emptySubtext}>
            Rezervirajte prvo predvajanje!
          </Text>
        </View>
      }
      renderItem={({ item: r }) => (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.filmTitle} numberOfLines={1}>
              {r.film_title}
            </Text>
            <Text style={[styles.status, { color: getStatusColor(r.status) }]}>
              {r.status.toUpperCase()}
            </Text>
          </View>

          <View style={styles.divider} />

          <Text style={styles.meta}>
            📅{" "}
            {new Date(r.start_time).toLocaleDateString("sl-SI", {
              weekday: "short",
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
            {"  ob  "}
            {new Date(r.start_time).toLocaleTimeString("sl-SI", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            })}
          </Text>
          <Text style={styles.meta}>🏛️ {r.room_name}</Text>
          <Text style={styles.meta}>💺 Sedeži: {r.seats}</Text>
          <Text style={styles.meta}>
            💰 Skupaj:{" "}
            <Text style={styles.price}>{formatPrice(r.total_price)}</Text>
          </Text>

          {r.status === "confirmed" && new Date(r.start_time) > new Date() && (
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => handleCancel(r.id, r.film_title)}
            >
              <Text style={styles.cancelButtonText}>Prekliči rezervacijo</Text>
            </TouchableOpacity>
          )}

          <Text style={styles.bookedAt}>
            Rezervirano {new Date(r.reserved_at).toLocaleDateString("sl-SI")}
          </Text>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  filmTitle: {
    color: Colors.white,
    fontSize: 17,
    fontWeight: "700",
    flex: 1,
    marginRight: 8,
  },
  status: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.surfaceBorder,
    marginBottom: 12,
  },
  meta: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 13,
    marginBottom: 6,
  },
  price: { color: Colors.primary, fontWeight: "700" },
  cancelButton: {
    borderWidth: 1,
    borderColor: Colors.error,
    backgroundColor: Colors.errorLight,
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 12,
    marginBottom: 4,
  },
  cancelButtonText: {
    color: Colors.error,
    fontWeight: "700",
    fontSize: 13,
  },
  bookedAt: {
    color: "rgba(255,255,255,0.25)",
    fontSize: 11,
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceBorder,
    paddingTop: 8,
  },
  emptyContainer: { alignItems: "center", marginTop: 80 },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 6,
  },
  emptySubtext: { color: Colors.grey, fontSize: 14 },
  errorText: { color: Colors.error },
});
