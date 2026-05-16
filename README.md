# MindMend

MindMend je mobilna aplikacija za izboljšanje duševnega zdravja in dobrega počutja uporabnikov.  
Aplikacija združuje spremljanje razpoloženja, AI analizo, sprostitvene vsebine ter komunikacijo s terapevti v eno interaktivno platformo.

---

# Opis projekta

Projekt je izdelan kot kombinacija:

- React Native + Expo mobilne aplikacije
- React + Vite spletnega vmesnika (Figma Make template)

Trenutno aplikacija deluje tako, da se originalni Figma Make frontend zažene kot spletna aplikacija (Vite development server), nato pa se preko `react-native-webview` prikaže znotraj Expo mobilne aplikacije.

To omogoča:

- identičen izgled kot v Figma Make templatu
- identične animacije
- identičen flow med stranmi
- hitrejši razvoj UI-ja
- ohranitev vseh funkcionalnosti iz templata

Mobilna aplikacija je zato trenutno tehnično:
- native Expo aplikacija
- ki znotraj sebe prikazuje React/Vite frontend preko WebView komponente

---

# Tehnologije

## Mobilna aplikacija
- React Native
- Expo
- React Native WebView

## Spletni frontend
- React
- Vite
- TypeScript
- TailwindCSS

## Backend / Baza
- Firebase

## Design
- Figma
- Figma Make

---

# Struktura projekta

```txt
mind-mend/
│
├── App.js
├── package.json
├── README.md
│
├── web-template/
│   ├── src/
│   ├── package.json
│   ├── vite.config.ts
│   └── ...
│
└── assets/

# Namestitev projekta

## 1. Kloniranje repozitorija

```bash
git clone https://github.com/anacvetkoo/mind-mend.git
cd mind-mend
```

---

# Prvi setup projekta

## 1. Namestitev Expo odvisnosti

V root mapi projekta:

```bash
npm install
```

## 2. Namestitev WebView

```bash
npm install react-native-webview
```

## 3. Setup web-template projekta

Premakni se v mapo:

```bash
cd web-template
```

Namesti odvisnosti:

```bash
npm install
```

Če pride do dependency napake:

```bash
npm install --legacy-peer-deps
```

## 4. Ustvari .env datoteko
V root mapi (`mind-mend/`) ustvari datoteko `.env` — **vsak razvijalec mora ustvariti svojo lokalno kopijo!**

Za pomoč si poglej `.env.example`:
```bash
cp .env.example .env
```

Nato v `.env` nastavi svoj IP (glej korak Terminal 1 spodaj):

```bash
EXPO_PUBLIC_WEB_APP_URL=http://192.168.x.x:5173
```

> ⚠️ `.env` je dodan v `.gitignore` in se ne committa v repozitorij. Vsak razvijalec ima svoj lokalni IP!

---

# Zagon projekta

Projekt potrebuje **DVA terminala**.

---

# TERMINAL 1 – Web frontend

Premakni se v `web-template`:

```bash
cd web-template
```

Zaženi Vite development server:

```bash
npm run dev -- --host 0.0.0.0
```

Po zagonu terminal izpiše nekaj takega:

```txt
Local:   http://localhost:5173/
Network: http://192.168.x.x:5173/
```

> ⚠️ **POMEMBNO:** Kopiraj `Network` URL in ga nastavi v svoji `.env` datoteki:

```bash
EXPO_PUBLIC_WEB_APP_URL=http://192.168.x.x:5173
```

---

# TERMINAL 2 – Expo mobilna aplikacija

Vrni se v root projekta:

```bash
cd ..
```

Zaženi Expo:

```bash
npx expo start -c
```

---

# Kako aplikacija trenutno deluje

Trenutna arhitektura:

```txt
React/Vite frontend
↓
Vite development server
↓
React Native WebView
↓
Expo mobilna aplikacija
↓
Android/iOS naprava
```

To pomeni:

- frontend dejansko teče kot spletna aplikacija
- Expo aplikacija pa ga prikazuje kot mobilno aplikacijo preko WebView-a
