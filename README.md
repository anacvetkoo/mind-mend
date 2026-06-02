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
## Plačila
- Stripe
- Firebase Cloud Functions
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
├── functions/
│   ├── src/
│   ├── package.json
│   └── .env
│
└── assets/
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
## 3. Namestitev Google Auth odvisnosti
```bash
npx expo install expo-auth-session expo-web-browser
```
## 4. Setup web-template projekta
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
## 5. Ustvari .env datoteko
V root mapi (`mind-mend/`) ustvari datoteko `.env` — **vsak razvijalec mora ustvariti svojo lokalno kopijo!**
Za pomoč si poglej `.env.example`:
```bash
cp .env.example .env
```
Nato v `.env` nastavi svoj IP (glej korak Terminal 2 spodaj):
```bash
EXPO_PUBLIC_WEB_APP_URL=http://192.168.x.x:5173
```
> ⚠️ `.env` je dodan v `.gitignore` in se ne committa v repozitorij. Vsak razvijalec ima svoj lokalni IP!
## 6. Setup Stripe plačil
Projekt uporablja Stripe za plačilo appointmentov. Stripe secret key se ne sme uporabljati v frontend aplikaciji, zato je plačilna logika dodana v Firebase Functions.
### Namestitev Firebase CLI
Če Firebase CLI še ni nameščen:
```bash
npm install -g firebase-tools
```
### Prijava v Firebase
```bash
firebase login
```
### Namestitev Functions odvisnosti
V root mapi projekta:
```bash
cd functions
npm install
```
Če Stripe odvisnosti še niso nameščene:
```bash
npm install stripe cors
npm install --save-dev @types/cors
```
### Firebase Functions env
V mapi `functions/` ustvari lokalno datoteko `.env`:
```bash
STRIPE_SECRET_KEY=sk_test_tvoj_stripe_secret_key
```
> ⚠️ `functions/.env` se ne committa v GitHub. Vsak razvijalec mora uporabiti svoj lokalni Stripe test secret key.
### Web-template env
V mapi `web-template/` ustvari lokalno datoteko `.env`:
```bash
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_tvoj_stripe_publishable_key
VITE_FUNCTIONS_BASE_URL=http://127.0.0.1:5001/mindmend-a8839/us-central1
```
> ⚠️ Za lokalni razvoj mora biti `VITE_FUNCTIONS_BASE_URL` nastavljen na lokalni Firebase Functions emulator URL.
---
# Zagon projekta
Projekt potrebuje **TRI terminale**.
---
# TERMINAL 1 – Firebase Functions emulator
V root mapi projekta zaženi:
```bash
firebase emulators:start
```
Emulator mora izpisati nekaj takega:
```txt
functions[us-central1-createPaymentIntent]: http function initialized
```
Lokalni Functions URL za ta projekt je:
```txt
http://127.0.0.1:5001/mindmend-a8839/us-central1
```
> ⚠️ Ta terminal mora ostati odprt med testiranjem Stripe plačil.
---
# TERMINAL 2 – Web frontend
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
# TERMINAL 3 – Expo mobilna aplikacija
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
---
# Generiranje Google Gemini API Key
1. Pojdi na https://aistudio.google.com/prompts/new_chat
2. prijava z google računom
3. Pojdi na Dashboard -> API Keys -> Create API Key
4. Poimenuj EXPO_PUBLIC_GEMINI_API_KEY, izberi projekt MindMend
5. Kopiraj ustvarjen ključ in ga prilepi v **.env** datoteko kot: **EXPO_PUBLIC_GEMINI_API_KEY=dobljen_ključ**
---
# Testiranje Stripe plačil
Stripe plačila se testirajo v Stripe Test mode.
Testna kartica za uspešno plačilo:
```txt
Card number: 4242 4242 4242 4242
Expiry: 12/34
CVC: 123
ZIP: 1000
```
Po uspešnem plačilu se appointment posodobi v Firestore:
```txt
status: CONFIRMED
paymentId: pi_...
```
Če se Stripe obrazec ne prikaže ali plačilo ne uspe:
- preveri, da Firebase emulator teče
- preveri `web-template/.env`
- preveri `functions/.env`
- preveri, da sta Stripe ključa oba v test mode: `pk_test_...` `sk_test_...`
- po spremembi `.env` vedno ponovno zaženi `npm run dev`
---
# Opombe
> ⚠️ Google prijava ne deluje v navadnem brskalniku na telefonu. Zahteva Expo build ali Expo Go.

> ⚠️ Spremembe v `web-template/` se avtomatsko deployajo na Firebase Hosting ob vsakem pushu na `main`. Spremembe v `App.js` (Expo native) pa zahtevajo nov `eas build`.