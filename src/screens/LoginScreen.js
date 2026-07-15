import { useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Colors from "../../constants/colors";
import { useAuth } from "../context/AuthContext";
import { login } from "../services/api";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();

  const handleLogin = async () => {
    setError("");
    if (!email || !password) {
      return setError("Prosimo, izpolnite vsa polja.");
    }
    setLoading(true);
    try {
      const response = await login({ email, password });
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
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={require("../../assets/logo-transparent.png")}
            style={styles.logoImg}
            resizeMode="contain"
          />
          <Text style={styles.logoText}>KinoPlex</Text>
          <Text style={styles.logoTagline}>Kino v vaših rokah</Text>
        </View>

        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <View style={styles.form}>
          <Text style={styles.label}>E-pošta</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="janez@email.com"
            placeholderTextColor={Colors.greyDark}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text style={styles.label}>Geslo</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Vaše geslo"
            placeholderTextColor={Colors.greyDark}
            secureTextEntry
          />

          <TouchableOpacity
            style={styles.button}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.buttonText}>Prijava</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.switchButton}
            onPress={() => navigation.navigate("Register")}
          >
            <Text style={styles.switchText}>
              Nimate še računa?{" "}
              <Text style={styles.switchLink}>Registrirajte se tukaj</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: Colors.background,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  logoIcon: { fontSize: 56, marginBottom: 12 },
  logoText: {
    fontSize: 32,
    fontWeight: "700",
    color: Colors.primary,
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  logoTagline: {
    color: Colors.grey,
    fontSize: 14,
  },
  logoImg: {
    width: 160,
    height: 60,
    marginBottom: 12,
  },
  form: { width: "100%", maxWidth: 400 },
  label: {
    color: Colors.grey,
    fontSize: 13,
    fontWeight: "500",
    marginBottom: 6,
  },
  input: {
    backgroundColor: Colors.surface,
    color: Colors.white,
    padding: 14,
    borderRadius: 10,
    fontSize: 15,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  button: {
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },
  errorBox: {
    backgroundColor: Colors.errorLight,
    borderWidth: 1,
    borderColor: Colors.error,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    width: "100%",
    maxWidth: 400,
  },
  errorText: { color: Colors.error, fontSize: 14 },
  switchButton: { marginTop: 24, alignItems: "center" },
  switchText: { color: Colors.grey, fontSize: 14 },
  switchLink: { color: Colors.primary, fontWeight: "700" },
});
