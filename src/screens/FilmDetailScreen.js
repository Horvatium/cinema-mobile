import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ImageBackground,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Colors from "../../constants/colors";
import { createReservation, getScreeningSeats } from "../services/api";
import { showBookingConfirmedNotification } from "../services/notifications";

export default function FilmDetailScreen({ route, navigation }) {
  const { screening, film } = route.params;

  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState("");

  const fetchSeats = useCallback(async () => {
    try {
      const response = await getScreeningSeats(screening.id);
      setSeats(response.data);
    } catch (_err) {
      setError("Napaka pri nalaganju sedežev.");
    } finally {
      setLoading(false);
    }
  }, [screening.id]);

  useEffect(() => {
    fetchSeats();
  }, [fetchSeats]);

  const toggleSeat = (seat) => {
    if (seat.status === "taken") return;
    setSelectedSeats((prev) => {
      const isSelected = prev.find((s) => s.id === seat.id);
      if (isSelected) return prev.filter((s) => s.id !== seat.id);
      return [...prev, seat];
    });
  };

  const handleReserve = async () => {
    if (selectedSeats.length === 0) {
      return Alert.alert(
        "Ni izbranih sedežev",
        "Prosimo, izberite vsaj en sedež.",
      );
    }
    setBooking(true);
    setError("");
    try {
      await createReservation({
        screening_id: parseInt(screening.id),
        seat_ids: selectedSeats.map((s) => parseInt(s.id)),
      });
      await showBookingConfirmedNotification(
        film.title_sl || film.title,
        selectedSeats.map((s) => `${s.row_label}${s.seat_number}`).join(", "),
        (selectedSeats.length * screening.price).toFixed(2),
      );
      Alert.alert(
        "Rezervacija potrjena!",
        `${selectedSeats.length} sedež/ev rezerviranih za ${film.title_sl || film.title}.`,
        [{ text: "V redu", onPress: () => navigation.goBack() }],
      );
      setSelectedSeats([]);
      fetchSeats();
    } catch (err) {
      setError(err.response?.data?.message || "Rezervacija ni uspela.");
    } finally {
      setBooking(false);
    }
  };

  // Razporeditev sedežev po vrstah
  const rows = {};
  seats.forEach((seat) => {
    if (!rows[seat.row_label]) rows[seat.row_label] = [];
    rows[seat.row_label].push(seat);
  });

  const totalPrice = (selectedSeats.length * screening.price).toFixed(2);

  if (loading)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );

  return (
    <ScrollView style={styles.container}>
      {/* Ozadje filma */}
      <ImageBackground
        source={{
          uri: film.backdrop_url || film.poster_url,
        }}
        style={styles.backdrop}
        imageStyle={styles.backdropImage}
      >
        <View style={styles.backdropOverlay}>
          <View style={styles.filmHeaderRow}>
            {/* Poster */}
            {film.poster_url && (
              <ImageBackground
                source={{ uri: film.poster_url }}
                style={styles.poster}
                imageStyle={styles.posterImage}
              />
            )}

            {/* Informacije */}
            <View style={styles.filmInfo}>
              <View style={styles.tagsRow}>
                <View style={styles.genreTag}>
                  <Text style={styles.genreText}>{film.genre}</Text>
                </View>
                <View style={styles.ratingTag}>
                  <Text style={styles.ratingText}>{film.age_rating}</Text>
                </View>
              </View>
              <Text style={styles.filmTitle}>
                {film.title_sl || film.title}
              </Text>
              {film.title_sl && film.title_sl !== film.title && (
                <Text style={styles.originalTitle}>{film.title}</Text>
              )}
              <Text style={styles.filmMeta}>
                {film.duration_minutes} min
                {film.release_year ? ` · ${film.release_year}` : ""}
              </Text>
            </View>
          </View>
        </View>
      </ImageBackground>

      <View style={styles.content}>
        {/* Režiser */}
        {film.director && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Režiser: </Text>
            <Text style={styles.detailValue}>{film.director}</Text>
          </View>
        )}

        {/* Zasedba */}
        {film.cast_members && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Zasedba: </Text>
            <Text style={styles.detailValue}>{film.cast_members}</Text>
          </View>
        )}

        {/* IMDB in Trailer gumbi */}
        {(film.imdb_url || film.trailer_url) && (
          <View style={styles.linksRow}>
            {film.imdb_url && (
              <TouchableOpacity
                style={styles.imdbBtn}
                onPress={() => Linking.openURL(film.imdb_url)}
              >
                <Text style={styles.imdbBtnText}>IMDB</Text>
              </TouchableOpacity>
            )}
            {film.trailer_url && (
              <TouchableOpacity
                style={styles.trailerBtn}
                onPress={() => Linking.openURL(film.trailer_url)}
              >
                <Text style={styles.trailerBtnText}>Napovednik</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Sinopsis */}
        {film.synopsis && (
          <View style={styles.synopsisBox}>
            <Text style={styles.synopsisText}>{film.synopsis}</Text>
          </View>
        )}

        {/* Informacije o predvajanju */}
        <View style={styles.screeningInfo}>
          <Text style={styles.screeningText}>
            {new Date(screening.start_time).toLocaleDateString("sl-SI", {
              weekday: "long",
              month: "long",
              day: "numeric",
              timeZone: "UTC",
            })}
          </Text>
          <Text style={styles.screeningText}>
            {"ob "}
            {new Date(screening.start_time).toLocaleTimeString("sl-SI", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
              timeZone: "UTC",
            })}
            {"  ·  "}
            {screening.room_name}
            {"  ·  "}
            {"\u20AC"}
            {screening.price} na sedež
          </Text>
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {/* Legenda */}
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View
              style={[styles.legendDot, { backgroundColor: Colors.surface }]}
            />
            <Text style={styles.legendText}>Prosto</Text>
          </View>
          <View style={styles.legendItem}>
            <View
              style={[styles.legendDot, { backgroundColor: Colors.primary }]}
            />
            <Text style={styles.legendText}>Izbrano</Text>
          </View>
          <View style={styles.legendItem}>
            <View
              style={[
                styles.legendDot,
                { backgroundColor: Colors.purple, opacity: 0.6 },
              ]}
            />
            <Text style={styles.legendText}>Zasedeno</Text>
          </View>
        </View>

        {/* Zaslon */}
        <View style={styles.screen}>
          <Text style={styles.screenText}>ZASLON</Text>
        </View>

        {/* Zemljevid sedežev */}
        <View style={styles.seatMap}>
          {Object.entries(rows).map(([rowLabel, rowSeats]) => (
            <View key={rowLabel} style={styles.seatRow}>
              <Text style={styles.rowLabel}>{rowLabel}</Text>
              {rowSeats.map((seat) => {
                const isSelected = selectedSeats.find((s) => s.id === seat.id);
                const isTaken = seat.status === "taken";
                return (
                  <TouchableOpacity
                    key={seat.id}
                    onPress={() => toggleSeat(seat)}
                    disabled={isTaken}
                    style={[
                      styles.seat,
                      {
                        backgroundColor: isTaken
                          ? Colors.purple
                          : isSelected
                            ? Colors.primary
                            : Colors.surface,
                        opacity: isTaken ? 0.6 : 1,
                        borderColor: isSelected
                          ? Colors.primary
                          : Colors.surfaceBorder,
                      },
                    ]}
                  >
                    <Text style={styles.seatText}>{seat.seat_number}</Text>
                  </TouchableOpacity>
                );
              })}
              <Text style={styles.rowLabel}>{rowLabel}</Text>
            </View>
          ))}
        </View>

        {/* Povzetek rezervacije */}
        <View style={styles.summary}>
          {selectedSeats.length === 0 ? (
            <Text style={styles.summaryEmpty}>
              Kliknite sedeže zgoraj, da jih izberete
            </Text>
          ) : (
            <>
              <Text style={styles.summarySeats}>
                Izbrani:{" "}
                {selectedSeats
                  .map((s) => `${s.row_label}${s.seat_number}`)
                  .join(", ")}
              </Text>
              <View style={styles.summaryRow}>
                <View>
                  <Text style={styles.totalLabel}>Skupaj</Text>
                  <Text style={styles.totalPrice}>
                    {"\u20AC"}
                    {totalPrice}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.bookBtn}
                  onPress={handleReserve}
                  disabled={booking}
                >
                  {booking ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text style={styles.bookBtnText}>Potrdi</Text>
                  )}
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>
    </ScrollView>
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
  backdrop: { height: 220, justifyContent: "flex-end" },
  backdropImage: { resizeMode: "cover" },
  backdropOverlay: {
    position: "absolute",
    inset: 0,
    backgroundColor: "rgba(8,11,26,0.65)",
    justifyContent: "flex-end",
    padding: 16,
  },
  filmHeaderRow: {
    flexDirection: "row",
    gap: 16,
    alignItems: "flex-end",
  },
  poster: {
    width: 80,
    height: 115,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: Colors.navy,
  },
  posterImage: { borderRadius: 8 },
  filmInfo: { flex: 1, paddingBottom: 4 },
  tagsRow: { flexDirection: "row", gap: 6, marginBottom: 8 },
  genreTag: {
    backgroundColor: Colors.primaryLight,
    borderWidth: 1,
    borderColor: Colors.primaryBorder,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 20,
  },
  genreText: { color: Colors.primary, fontSize: 10, fontWeight: "600" },
  ratingTag: {
    backgroundColor: Colors.purpleLight,
    borderWidth: 1,
    borderColor: Colors.purpleBorder,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 20,
  },
  ratingText: { color: Colors.purple, fontSize: 10, fontWeight: "600" },
  filmTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 2,
  },
  originalTitle: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 12,
    fontStyle: "italic",
    marginBottom: 4,
  },
  filmMeta: { color: Colors.grey, fontSize: 12 },
  content: { padding: 16 },

  // Podrobnosti filma
  detailRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 6,
  },
  detailLabel: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: "600",
  },
  detailValue: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 13,
    flex: 1,
  },

  // IMDB in Trailer gumbi
  linksRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
    marginBottom: 14,
  },
  imdbBtn: {
    backgroundColor: "#f5c518",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  imdbBtnText: {
    color: "#000",
    fontSize: 13,
    fontWeight: "700",
  },
  trailerBtn: {
    backgroundColor: "#ff0000",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  trailerBtnText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
  },

  // Sinopsis
  synopsisBox: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    borderRadius: 10,
    padding: 14,
    marginBottom: 14,
  },
  synopsisText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 13,
    lineHeight: 20,
  },

  // Predvajanje
  screeningInfo: {
    backgroundColor: Colors.primaryLight,
    borderWidth: 1,
    borderColor: Colors.primaryBorder,
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
    gap: 4,
  },
  screeningText: { color: Colors.white, fontSize: 13 },
  errorText: {
    color: Colors.error,
    textAlign: "center",
    marginBottom: 12,
    fontSize: 13,
  },

  // Legenda
  legend: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
    marginBottom: 16,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendDot: { width: 14, height: 14, borderRadius: 3 },
  legendText: { color: Colors.grey, fontSize: 11 },

  // Zaslon
  screen: {
    backgroundColor: Colors.primaryLight,
    borderWidth: 1,
    borderColor: Colors.primaryBorder,
    padding: 8,
    borderRadius: 4,
    alignItems: "center",
    alignSelf: "center",
    paddingHorizontal: 30,
    marginBottom: 20,
  },
  screenText: {
    color: Colors.primary,
    fontSize: 10,
    letterSpacing: 4,
    fontWeight: "700",
  },

  // Zemljevid sedežev
  seatMap: { alignItems: "center", marginBottom: 24 },
  seatRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginBottom: 5,
  },
  rowLabel: {
    color: Colors.grey,
    fontSize: 11,
    width: 14,
    textAlign: "center",
  },
  seat: {
    width: 32,
    height: 32,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },
  seatText: { color: Colors.white, fontSize: 10, fontWeight: "600" },

  // Povzetek
  summary: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    borderRadius: 12,
    padding: 16,
    marginBottom: 40,
  },
  summaryEmpty: {
    color: Colors.grey,
    textAlign: "center",
    fontSize: 13,
  },
  summarySeats: { color: Colors.grey, fontSize: 13, marginBottom: 12 },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: { color: Colors.grey, fontSize: 11, marginBottom: 2 },
  totalPrice: { color: Colors.white, fontSize: 24, fontWeight: "700" },
  bookBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 10,
  },
  bookBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
});
