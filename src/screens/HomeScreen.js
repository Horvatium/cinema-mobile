import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Colors from "../../constants/colors";
import { useAuth } from "../context/AuthContext";
import { getScreenings } from "../services/api";

export default function HomeScreen({ navigation }) {
  const [screenings, setScreenings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [heroIndex, setHeroIndex] = useState(0);
  const { user, logoutUser } = useAuth();

  const fetchScreenings = useCallback(async () => {
    try {
      const response = await getScreenings();
      const data = Array.isArray(response.data) ? response.data : [];
      setScreenings(data);
    } catch (_err) {
      setScreenings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchScreenings();
  }, [fetchScreenings]);

  const filmMap = {};
  screenings.forEach((s) => {
    if (!filmMap[s.film_title]) {
      filmMap[s.film_title] = {
        title: s.film_title,
        title_sl: s.film_title_sl,
        genre: s.genre,
        duration_minutes: s.duration_minutes,
        age_rating: s.age_rating,
        poster_url: s.poster_url,
        backdrop_url: s.backdrop_url,
        synopsis: s.synopsis,
        director: s.director,
        release_year: s.release_year,
        cast_members: s.cast_members,
        imdb_url: s.imdb_url,
        trailer_url: s.trailer_url,
        screenings: [],
      };
    }
    filmMap[s.film_title].screenings.push(s);
  });

  const allFilms = Object.values(filmMap);
  const films = search
    ? allFilms.filter((f) =>
        f.title.toLowerCase().includes(search.toLowerCase()),
      )
    : allFilms;

  useEffect(() => {
    if (allFilms.length <= 1) return;
    const interval = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % allFilms.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [allFilms.length]);

  const heroFilm = allFilms[heroIndex];

  if (loading)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );

  return (
    <View style={styles.container}>
      <FlatList
        data={films}
        keyExtractor={(item) => item.title}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={() => (
          <View>
            {/* ── Hero Banner ── */}
            {heroFilm && (
              <ImageBackground
                source={{
                  uri: heroFilm.backdrop_url || heroFilm.poster_url,
                }}
                style={styles.hero}
                imageStyle={styles.heroImage}
              >
                <View style={styles.heroOverlay}>
                  <View style={styles.heroContent}>
                    <View style={styles.genreTag}>
                      <Text style={styles.genreText}>{heroFilm.genre}</Text>
                    </View>
                    <Text style={styles.heroTitle}>
                      {heroFilm.title_sl || heroFilm.title}
                    </Text>
                    {heroFilm.synopsis && (
                      <Text style={styles.heroSynopsis}>
                        {heroFilm.synopsis.length > 120
                          ? heroFilm.synopsis.substring(0, 120) + "..."
                          : heroFilm.synopsis}
                      </Text>
                    )}
                    <TouchableOpacity
                      style={styles.heroBtn}
                      onPress={() =>
                        navigation.navigate("FilmDetail", {
                          screening: heroFilm.screenings[0],
                          film: heroFilm,
                        })
                      }
                    >
                      <Text style={styles.heroBtnText}>
                        → Rezerviraj vstopnice
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Hero dots */}
                <View style={styles.heroDots}>
                  {allFilms.map((_, i) => (
                    <TouchableOpacity
                      key={i}
                      onPress={() => setHeroIndex(i)}
                      style={[
                        styles.heroDot,
                        i === heroIndex && styles.heroDotActive,
                      ]}
                    />
                  ))}
                </View>
              </ImageBackground>
            )}

            {/* ── Top Bar: Navigation buttons only ── */}
            <View style={styles.topBar}>
              <View style={styles.topBarRight}>
                <Text style={styles.greeting}>
                  Pozdravljeni, {user?.first_name}!
                </Text>
                {user?.role === "admin" && (
                  <Text style={styles.adminBadge}>👑 Admin</Text>
                )}
                <TouchableOpacity
                  onPress={() => navigation.navigate("MyReservations")}
                >
                  <Text style={styles.myTicketsBtn}>Moje vstopnice →</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={logoutUser}>
                  <Text style={styles.logoutBtn}>Odjava</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* ── Search ── */}
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="🔍 Išči filme..."
                placeholderTextColor={Colors.greyDark}
                value={search}
                onChangeText={setSearch}
              />
            </View>

            {/* ── Section Label ── */}
            <View style={styles.sectionLabelRow}>
              <Text style={styles.sectionLabel}>ZDAJ V KINODVORANAH</Text>
            </View>
          </View>
        )}
        renderItem={({ item: film }) => (
          <TouchableOpacity
            style={styles.filmRow}
            onPress={() =>
              navigation.navigate("FilmDetail", {
                screening: film.screenings[0],
                film,
              })
            }
          >
            {/* Poster */}
            <ImageBackground
              source={{ uri: film.poster_url }}
              style={styles.poster}
              imageStyle={styles.posterImage}
            >
              {!film.poster_url && (
                <View style={styles.posterPlaceholder}>
                  <Text style={{ fontSize: 28 }}>🎬</Text>
                </View>
              )}
            </ImageBackground>

            {/* Info */}
            <View style={styles.filmInfo}>
              <View style={styles.tagsRow}>
                <View style={styles.genreTag}>
                  <Text style={styles.genreText}>{film.genre}</Text>
                </View>
                <View style={styles.ratingTag}>
                  <Text style={styles.ratingText}>{film.age_rating}</Text>
                </View>
              </View>
              <Text style={styles.filmTitle} numberOfLines={2}>
                {film.title_sl || film.title}
              </Text>
              <Text style={styles.filmMeta}>{film.duration_minutes} min</Text>

              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.timesRow}>
                  {film.screenings.slice(0, 4).map((s) => (
                    <TouchableOpacity
                      key={s.id}
                      style={styles.timeChip}
                      onPress={() =>
                        navigation.navigate("FilmDetail", {
                          screening: s,
                          film,
                        })
                      }
                    >
                      <Text style={styles.timeText}>
                        {new Date(s.start_time).toLocaleTimeString("sl-SI", {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: false,
                        })}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            {/* Price */}
            <View style={styles.priceCol}>
              <Text style={styles.priceFrom}>od</Text>
              <Text style={styles.price}>€{film.screenings[0].price}</Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Ni najdenih filmov.</Text>
        }
      />
    </View>
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

  // ── Hero ──
  hero: { height: 320, justifyContent: "flex-end" },
  heroImage: { resizeMode: "cover" },
  heroOverlay: {
    position: "absolute",
    inset: 0,
    backgroundColor: "rgba(8,11,26,0.55)",
    justifyContent: "flex-end",
  },
  heroContent: { padding: 20, paddingBottom: 40 },
  heroTitle: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  heroSynopsis: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 14,
  },
  heroBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  heroBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  heroDots: {
    position: "absolute",
    bottom: 12,
    alignSelf: "center",
    flexDirection: "row",
    gap: 6,
  },
  heroDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.35)",
  },
  heroDotActive: {
    backgroundColor: Colors.primary,
    width: 20,
    borderRadius: 4,
  },

  // ── Top Bar ──
  topBar: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceBorder,
  },
  logoImg: {
    width: 120,
    height: 45,
    resizeMode: "contain",
  },
  topBarRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  greeting: {
    color: Colors.grey,
    fontSize: 12,
  },
  adminBadge: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: "700",
  },
  myTicketsBtn: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: "600",
  },
  logoutBtn: {
    color: Colors.grey,
    fontSize: 13,
  },

  // ── Search ──
  searchContainer: { padding: 16, paddingBottom: 8 },
  searchInput: {
    backgroundColor: Colors.surface,
    color: Colors.white,
    padding: 12,
    borderRadius: 10,
    fontSize: 14,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },

  // ── Section Label ──
  sectionLabelRow: {
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  sectionLabel: {
    color: Colors.primary,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 2,
  },

  // ── Film Row ──
  filmRow: {
    flexDirection: "row",
    gap: 14,
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    padding: 12,
  },
  poster: {
    width: 80,
    height: 115,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: Colors.navy,
    flexShrink: 0,
  },
  posterImage: { borderRadius: 8 },
  posterPlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  filmInfo: { flex: 1 },
  tagsRow: { flexDirection: "row", gap: 6, marginBottom: 6 },
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
    color: Colors.white,
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 4,
  },
  filmMeta: { color: Colors.grey, fontSize: 12, marginBottom: 10 },
  timesRow: { flexDirection: "row", gap: 6 },
  timeChip: {
    backgroundColor: Colors.primaryLight,
    borderWidth: 1,
    borderColor: Colors.primaryBorder,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  timeText: { color: Colors.primary, fontSize: 12, fontWeight: "700" },
  priceCol: { alignItems: "center", flexShrink: 0 },
  priceFrom: { color: Colors.grey, fontSize: 10, marginBottom: 2 },
  price: { color: Colors.white, fontSize: 18, fontWeight: "700" },
  emptyText: {
    color: Colors.grey,
    textAlign: "center",
    marginTop: 40,
    padding: 16,
  },
});
