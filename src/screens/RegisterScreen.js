import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { register } from "../services/api";

export default function RegisterScreen({ navigation }) {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();

  const handleChange = (name, value) => {
    setForm({ ...form, [name]: value });
  };

  const handleRegister = async () => {
    setError("");

    if (!form.first_name || !form.last_name || !form.email || !form.password) {
      return setError("Prosimo, izpolnite vsa obvezna polja.");
    }
    if (form.password !== form.confirmPassword) {
      return setError("Gesli se ne ujemata.");
    }
    if (form.password.length < 6) {
      return setError("Geslo mora imeti vsaj 6 znakov.");
    }

    setLoading(true);
    try {
      const response = await register({
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        password: form.password,
        phone: form.phone,
      });
      await loginUser(response.data.user, response.data.token);
    } catch (err) {
      setError(err.response?.data?.message || "Prišlo je do napake.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ padding: 24 }}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Ustvari račun</Text>

        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <View style={styles.row}>
          <View style={styles.half}>
            <Text style={styles.label}>Ime *</Text>
            <TextInput
              style={styles.input}
              value={form.first_name}
              onChangeText={(v) => handleChange("first_name", v)}
              placeholder="Janez"
              placeholderTextColor="#555"
            />
          </View>
          <View style={styles.half}>
            <Text style={styles.label}>Priimek *</Text>
            <TextInput
              style={styles.input}
              value={form.last_name}
              onChangeText={(v) => handleChange("last_name", v)}
              placeholder="Novak"
              placeholderTextColor="#555"
            />
          </View>
        </View>

        <Text style={styles.label}>E-pošta *</Text>
        <TextInput
          style={styles.input}
          value={form.email}
          onChangeText={(v) => handleChange("email", v)}
          placeholder="janez@email.com"
          placeholderTextColor="#555"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.label}>Telefon (neobvezno)</Text>
        <TextInput
          style={styles.input}
          value={form.phone}
          onChangeText={(v) => handleChange("phone", v)}
          placeholder="041 234 567"
          placeholderTextColor="#555"
          keyboardType="phone-pad"
        />

        <Text style={styles.label}>Geslo *</Text>
        <TextInput
          style={styles.input}
          value={form.password}
          onChangeText={(v) => handleChange("password", v)}
          placeholder="Vsaj 6 znakov"
          placeholderTextColor="#555"
          secureTextEntry
        />

        <Text style={styles.label}>Potrdi geslo *</Text>
        <TextInput
          style={styles.input}
          value={form.confirmPassword}
          onChangeText={(v) => handleChange("confirmPassword", v)}
          placeholder="Ponovite geslo"
          placeholderTextColor="#555"
          secureTextEntry
        />

        <TouchableOpacity
          style={styles.button}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.buttonText}>Ustvari račun</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.switchButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.switchText}>
            Že imate račun? <Text style={styles.switchLink}>Prijavite se</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0a0a0a" },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 24,
  },
  row: { flexDirection: "row", gap: 12 },
  half: { flex: 1 },
  label: { color: "#aaa", fontSize: 14, marginBottom: 6 },
  input: {
    backgroundColor: "#1a1a1a",
    color: "#fff",
    padding: 14,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#333",
  },
  button: {
    backgroundColor: "#e50914",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: { color: "white", fontSize: 16, fontWeight: "bold" },
  errorBox: {
    backgroundColor: "#2c1010",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: { color: "#e74c3c" },
  switchButton: { marginTop: 20, alignItems: "center", paddingBottom: 40 },
  switchText: { color: "#aaa", fontSize: 14 },
  switchLink: { color: "#e50914", fontWeight: "bold" },
});
