import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const api = axios.create({
  baseURL: "https://cinema-api-production-a533.up.railway.app/api",
});

// Vsaki zahtevi priloži žeton
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// AuthContext sem preda svojo funkcijo za odjavo
let odjaviUporabnika = null;
export const nastaviOdjavo = (fn) => {
  odjaviUporabnika = fn;
};

// Ob poteku ali neveljavnem žetonu uporabnika odjavi
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    if ((status === 401 || status === 403) && odjaviUporabnika) {
      await odjaviUporabnika();
    }
    return Promise.reject(error);
  },
);

// Auth
export const login = (data) => api.post("/auth/login", data);
export const register = (data) => api.post("/auth/register", data);

// Filmi & predstave
export const getScreenings = () => api.get("/screenings");
export const getScreeningSeats = (id) => api.get(`/screenings/${id}/seats`);

// Rezervacije
export const getMyReservations = () => api.get("/reservations/my");
export const createReservation = (data) => api.post("/reservations", data);
export const cancelReservation = (id) => api.put(`/reservations/${id}/cancel`);

export default api;
