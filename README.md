# KinoPlex – mobilna aplikacija

[![CI](https://github.com/Horvatium/cinema-mobile/actions/workflows/ci.yml/badge.svg)](https://github.com/Horvatium/cinema-mobile/actions/workflows/ci.yml)

Aplikacija v React Native (Expo) za **KinoPlex**, sistem za rezervacijo kinovstopnic. Stranke
na telefonu pregledujejo spored, izberejo sedeže in rezervirajo vstopnice. Uporablja isti API
kot spletna aplikacija. Nastala je v okviru diplomske naloge.

**API:** [cinema-api](https://github.com/Horvatium/cinema-api)
([dokumentacija](https://api.kinoplex.si/api/docs/)) ·
**Spletna aplikacija:** [cinema-web](https://github.com/Horvatium/cinema-web) ([kinoplex.si](https://www.kinoplex.si)) ·
[English version](README.en.md)

| Prijava                                        | Spored                               | Izbira sedežev                                   |
| ---------------------------------------------- | ------------------------------------ | ------------------------------------------------ |
| ![Prijavni zaslon](docs/screenshots/login.png) | ![Spored](docs/screenshots/home.png) | ![Zemljevid sedežev](docs/screenshots/seats.png) |

## Funkcionalnosti

- Prijava in registracija s potrditvijo e-poštnega naslova. Seja se hrani v AsyncStorage in
  se samodejno konča, ko JWT poteče.
- Spored z vrtiljakom izpostavljenih filmov in iskanjem
- Podrobnosti filma s povezavo na IMDb in napovednikom
- Zemljevid sedežev, ki se prilagodi širini zaslona
- Rezervacija brez plačila v aplikaciji; spletno plačilo je na voljo v spletni aplikaciji
- »Moje vstopnice«: pregled in preklic lastnih rezervacij
- Lokalna obvestila ob potrditvi in preklicu rezervacije

## Povezava z API-jem

Aplikacija uporablja iste poti kot spletna stran. Vsa pravila (zasedenost sedežev, predstave,
ki so se že začele, preverjanje vhodnih podatkov) preverja API, zato veljajo enako za obe
aplikaciji.

| Zaslon         | Pot API-ja                                             |
| -------------- | ------------------------------------------------------ |
| Prijava        | `POST /auth/login`, `POST /auth/resend-verification`   |
| Registracija   | `POST /auth/register`                                  |
| Spored         | `GET /screenings`                                      |
| Film in sedeži | `GET /screenings/:id/seats`, `POST /reservations`      |
| Moje vstopnice | `GET /reservations/my`, `PUT /reservations/:id/cancel` |

- **Rezervacija:** aplikacija uporablja `POST /reservations`, ki rezervacijo takoj potrdi. Če
  sedež medtem rezervira nekdo drug, API vrne `409` in aplikacija to sporoči; API tudi pri
  hkratnih zahtevkih za isti sedež uspešno potrdi samo enega.
- **Seja:** žeton JWT se hrani v AsyncStorage in se pripne vsakemu zahtevku. Ko API vrne `401`
  ali `403` ali ko žeton poteče, aplikacija uporabnika odjavi.
- **Napake:** API vrne sporočila v slovenščini (npr. »Geslo mora imeti vsaj 6 znakov.«), ki
  jih aplikacija prikaže uporabniku.

## Tehnologije

| Področje         | Tehnologija                                               |
| ---------------- | --------------------------------------------------------- |
| Ogrodje          | React Native 0.81, Expo SDK 54                            |
| Navigacija       | React Navigation (native stack)                           |
| Odjemalec za API | Axios s prestreznikom za JWT in odjavo ob poteklem žetonu |
| Shramba          | AsyncStorage                                              |
| Obvestila        | expo-notifications                                        |
| Izdaja           | EAS Build, EAS Update                                     |
| Orodja           | ESLint (eslint-config-expo), Prettier, GitHub Actions     |

## Zagon

Potrebuješ Node.js 22 in aplikacijo [Expo Go](https://expo.dev/go) na telefonu ali Android
emulator.

```bash
git clone https://github.com/Horvatium/cinema-mobile.git
cd cinema-mobile
npm install
npx expo start
```

QR kodo skeniraj z Expo Go. Za hiter ogled brez telefona aplikacijo zaženeš v brskalniku z
`npm run web`. V brskalniku se prijava ne obdrži: API žeton v odgovoru prijave vrne samo
odjemalcem brez glave `Origin` (aplikacija na napravi), brskalnikom pa le piškotek.

Privzeto aplikacija uporablja produkcijski API. Za lokalni API, na primer iz nastavitve za
Docker v [cinema-api](https://github.com/Horvatium/cinema-api), kopiraj `.env.example` v `.env`
in nastavi `EXPO_PUBLIC_API_URL`. Na pravem telefonu uporabi IP naslov računalnika v lokalnem
omrežju, ne `localhost`.

```bash
EXPO_PUBLIC_API_URL=http://192.168.0.17:5000/api
```

Z lokalnim API-jem in podatki iz seeda se lahko prijaviš kot `demo@kinoplex.test` /
`Demo123!`. Račun obstaja samo v lokalni bazi s seed podatki.

### Skripte

| Ukaz                              | Opis                                           |
| --------------------------------- | ---------------------------------------------- |
| `npm start`                       | Razvojni strežnik Expo (QR koda za Expo Go)    |
| `npm run android` / `ios`         | Nativna gradnja in zagon na napravi/emulatorju |
| `npm run web`                     | Zagon v brskalniku                             |
| `npm run lint`                    | ESLint, pade ob opozorilih                     |
| `npm run format` / `format:check` | Prettier                                       |

### Gradnja APK

Z [EAS Build](https://docs.expo.dev/build/introduction/):

```bash
npx eas build --platform android --profile preview
```

Ali lokalno z nameščenim Android SDK: na Windowsu zaženi `build.bat`, ki izvede
`expo prebuild` in nato `gradlew assembleRelease`.

## Struktura projekta

```
├── App.js                   navigacija (ločena sklada za prijavljene in neprijavljene)
├── src/
│   ├── context/AuthContext.js   seja: prijava, odjava, potek žetona
│   ├── screens/                 zasloni (spored, film in sedeži, prijava, ...)
│   └── services/
│       ├── api.js               odjemalec za API (Axios, JWT)
│       └── notifications.js     lokalna obvestila
├── constants/colors.js      barve
├── app.json, eas.json       nastavitve Expo in EAS
└── .github/workflows/       CI
```

## CI

Ob vsakem pushu in pull requestu se zažene [CI workflow](.github/workflows/ci.yml): ESLint,
preverjanje s Prettierjem in sestavljanje JavaScript paketa za Android z Expo. Slednje ujame
pokvarjene uvoze in skladenjske napake brez celotne nativne gradnje.

## Načrti

- Potisna obvestila ob odpovedi predstave: API jih že pošilja prek Expo Push, aplikacija pa
  mora še pridobiti žeton naprave in ga poslati na `POST /notifications/token`
- Testi zaslonov (Jest z jest-expo in React Native Testing Library)
- Plačilo v aplikaciji (Stripe React Native SDK) namesto rezervacije brez plačila

## Avtor

**Vid Gudič** · diplomska naloga, CPU, 2026
