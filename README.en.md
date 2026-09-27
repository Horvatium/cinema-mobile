# KinoPlex Mobile

[![CI](https://github.com/Horvatium/cinema-mobile/actions/workflows/ci.yml/badge.svg)](https://github.com/Horvatium/cinema-mobile/actions/workflows/ci.yml)

React Native (Expo) app for **KinoPlex**, a cinema ticket booking system. Customers browse the
programme, pick seats and book tickets from their phone. It uses the same API as the web app.
Built as part of my bachelor's thesis.

**API:** [cinema-api](https://github.com/Horvatium/cinema-api)
([docs](https://cinema-api-production-a533.up.railway.app/api/docs/)) ·
**Web app:** [cinema-web](https://github.com/Horvatium/cinema-web) ([kinoplex.si](https://www.kinoplex.si)) ·
[Slovenska različica](README.md)

| Login                                       | Programme                               | Seat selection                          |
| ------------------------------------------- | --------------------------------------- | --------------------------------------- |
| ![Login screen](docs/screenshots/login.png) | ![Programme](docs/screenshots/home.png) | ![Seat map](docs/screenshots/seats.png) |

## Features

- Login and registration with email verification. The session is kept in AsyncStorage and ends
  automatically when the JWT expires.
- Programme with a featured-film carousel and search
- Film details with an IMDb link and trailer
- Seat map that scales to the screen width
- Booking without in-app payment; online payment is available on the web app
- "My tickets": view and cancel your own bookings
- Local notifications when a booking is confirmed or cancelled

## How it uses the API

The app calls the same routes as the web app. All rules (seat availability, screenings that
have already started, input validation) are enforced by the API, so they apply equally to both
apps.

| Screen         | API route                                              |
| -------------- | ------------------------------------------------------ |
| Login          | `POST /auth/login`, `POST /auth/resend-verification`   |
| Registration   | `POST /auth/register`                                  |
| Programme      | `GET /screenings`                                      |
| Film and seats | `GET /screenings/:id/seats`, `POST /reservations`      |
| My tickets     | `GET /reservations/my`, `PUT /reservations/:id/cancel` |

- **Booking:** the app uses `POST /reservations`, which confirms the booking immediately. If
  someone else takes the seat first, the API returns `409` and the app shows the message; for
  simultaneous requests for the same seat, the API confirms only one.
- **Session:** the JWT is kept in AsyncStorage and attached to every request. When the API
  returns `401` or `403`, or the token expires, the app logs the user out.
- **Errors:** the API returns messages in Slovenian (for example "Geslo mora imeti vsaj 6
  znakov."), which the app shows to the user.

## Tech stack

| Area          | Technology                                               |
| ------------- | -------------------------------------------------------- |
| Framework     | React Native 0.81, Expo SDK 54                           |
| Navigation    | React Navigation (native stack)                          |
| API client    | Axios with a JWT interceptor and logout on expired token |
| Storage       | AsyncStorage                                             |
| Notifications | expo-notifications                                       |
| Delivery      | EAS Build, EAS Update                                    |
| Tooling       | ESLint (eslint-config-expo), Prettier, GitHub Actions    |

## Getting started

Requires Node.js 22 and the [Expo Go](https://expo.dev/go) app on your phone, or an Android
emulator.

```bash
git clone https://github.com/Horvatium/cinema-mobile.git
cd cinema-mobile
npm install
npx expo start
```

Scan the QR code with Expo Go. For a quick look without a phone, run the app in a browser with
`npm run web`.

By default the app talks to the production API. To use a local API, for example the Docker
setup from [cinema-api](https://github.com/Horvatium/cinema-api), copy `.env.example` to `.env`
and set `EXPO_PUBLIC_API_URL`. On a physical phone, use your computer's LAN IP address, not
`localhost`.

```bash
EXPO_PUBLIC_API_URL=http://192.168.0.17:5000/api
```

With a local API from the seed data, you can log in as `demo@kinoplex.test` / `Demo123!`.
This account exists only in the local seed database.

### Scripts

| Command                           | Description                                  |
| --------------------------------- | -------------------------------------------- |
| `npm start`                       | Expo dev server (QR code for Expo Go)        |
| `npm run android` / `ios`         | Native build and run on a device or emulator |
| `npm run web`                     | Run in a browser                             |
| `npm run lint`                    | ESLint, fails on warnings                    |
| `npm run format` / `format:check` | Prettier                                     |

### Building an APK

With [EAS Build](https://docs.expo.dev/build/introduction/):

```bash
npx eas build --platform android --profile preview
```

Or locally, with the Android SDK installed, run `build.bat` on Windows. It runs
`expo prebuild` and then `gradlew assembleRelease`.

## Project structure

```
├── App.js                   navigation (separate stacks for logged-in and guest users)
├── src/
│   ├── context/AuthContext.js   session: login, logout, token expiry
│   ├── screens/                 screens (programme, film and seats, login, ...)
│   └── services/
│       ├── api.js               API client (Axios, JWT)
│       └── notifications.js     local notifications
├── constants/colors.js      colours
├── app.json, eas.json       Expo and EAS configuration
└── .github/workflows/       CI
```

## CI

Every push and pull request runs [the CI workflow](.github/workflows/ci.yml): ESLint, a
Prettier check and an Expo export of the Android JavaScript bundle. The export catches broken
imports and syntax errors without a full native build.

## Roadmap

- Push notifications when a screening is cancelled: the API already sends them via Expo Push,
  but the app still needs to get the device's push token and send it to
  `POST /notifications/token`
- Screen tests (Jest with jest-expo and React Native Testing Library)
- In-app payment (Stripe React Native SDK) instead of booking without payment

## Author

**Vid Gudič** · bachelor's thesis, CPU, 2026
