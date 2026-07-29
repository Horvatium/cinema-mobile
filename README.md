# KinoPlex — Mobilna aplikacija 📱

Mobilna aplikacija informacijskega sistema za upravljanje kinematografa, izdelana z React
Native in Expo. Projekt je bil izdelan v okviru diplomske naloge.

## O projektu

Mobilna aplikacija strankam omogoča pregledovanje filmskega sporeda, izbiro sedežev in
rezervacijo vstopnic neposredno s telefona, vključno s potisnimi obvestili ob potrditvi ali
preklicu rezervacije. Aplikacija uporablja poenostavljen postopek rezervacije brez neposrednega
plačila znotraj aplikacije — plačevanje vstopnic je v celoti podprto v spletni aplikaciji
[cinema-web](https://github.com/Horvatium/cinema-web).

Podatke pridobiva iz istega zalednega sistema kot spletna aplikacija:
[cinema-api](https://github.com/Horvatium/cinema-api).

## Tehnologije

- **React Native** — ogrodje za razvoj mobilnih aplikacij
- **Expo** — razvojno okolje in orodja za gradnjo
- **React Navigation** — navigacija med zasloni
- **Axios** — komunikacija z zalednim sistemom
- **Expo Notifications** — lokalna potisna obvestila

## Funkcionalnosti

- Prijava in registracija uporabnikov
- Pregled filmskega sporeda in podrobnosti filmov
- Izbira sedežev na interaktivnem zemljevidu dvorane
- Rezervacija vstopnic s potisnim obvestilom ob potrditvi
- Pregled in preklic lastnih rezervacij

## Zagon projekta

```
npm install
npx expo start
```

Aplikacijo lahko med razvojem zaženeš prek aplikacije Expo Go na telefonu, ali zgradiš
namestitveno datoteko (APK) za Android:

```
npx expo prebuild --platform android --clean
cd android
gradlew assembleRelease
```

APK datoteka se ustvari v `android/app/build/outputs/apk/release/app-release.apk`.

## Diagrami

Diagrami sistema (EER, primeri uporabe, razredni diagram, arhitektura namestitve) so na voljo
v mapi [`docs/diagrami`](./docs/diagrami).

## Avtor

Diplomska naloga — Vid Gudič, CPU, 2026.
