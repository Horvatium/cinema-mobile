# KinoPlex – mobilna aplikacija

[![CI](https://github.com/Horvatium/cinema-mobile/actions/workflows/ci.yml/badge.svg)](https://github.com/Horvatium/cinema-mobile/actions/workflows/ci.yml)

Aplikacija v React Native (Expo) za **KinoPlex**, sistem za rezervacijo kinovstopnic. Stranke
na telefonu pregledujejo spored, izberejo sedeže in rezervirajo vstopnice, o rezervacijah pa
jih obveščajo obvestila. Uporablja isti API kot spletna aplikacija. Nastala je v okviru
diplomske naloge.

**API:** [cinema-api](https://github.com/Horvatium/cinema-api) ·
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
- Obvestila: lokalna obvestila ob potrditvi ali preklicu rezervacije in potisna obvestila API-ja
  (prek Expo Push), ko kino odpove predstavo

## Tehnologije

| Področje         | Tehnologija                                               |
| ---------------- | --------------------------------------------------------- |
| Ogrodje          | React Native 0.81, Expo SDK 54                            |
| Navigacija       | React Navigation (native stack)                           |
| Odjemalec za API | Axios s prestreznikom za JWT in odjavo ob poteklem žetonu |
| Shramba          | AsyncStorage                                              |
| Obvestila        | expo-notifications, Expo Push                             |
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

QR kodo skeniraj z Expo Go. Privzeto aplikacija uporablja produkcijski API. Za lokalni API,
na primer iz nastavitve za Docker v [cinema-api](https://github.com/Horvatium/cinema-api),
kopiraj `.env.example` v `.env` in nastavi `EXPO_PUBLIC_API_URL`. Na pravem telefonu uporabi
IP naslov računalnika v lokalnem omrežju, ne `localhost`.

```bash
EXPO_PUBLIC_API_URL=http://192.168.0.17:5000/api
```

Z lokalnim API-jem in podatki iz seeda se lahko prijaviš kot `demo@kinoplex.test` /
`Demo123!`. Račun obstaja samo v lokalni bazi s seed podatki.

### Gradnja APK

Z [EAS Build](https://docs.expo.dev/build/introduction/):

```bash
npx eas build --platform android --profile preview
```

Ali lokalno z nameščenim Android SDK: na Windowsu zaženi `build.bat`, ki izvede
`expo prebuild` in nato `gradlew assembleRelease`.

## CI

Ob vsakem pushu in pull requestu se zažene [CI workflow](.github/workflows/ci.yml): ESLint,
preverjanje s Prettierjem in sestavljanje JavaScript paketa za Android z Expo. Slednje ujame
pokvarjene uvoze in skladenjske napake brez celotne nativne gradnje.

## Avtor

**Vid Gudič** · diplomska naloga, CPU, 2026
