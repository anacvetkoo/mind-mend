# Funkcionalno testiranje (ISO/IEC/IEEE 29119-3)

### 1. Pregled obstoječe dokumentacije

| Dokument | Vsebina | Pokriva funkcionalnost? |
| --- | --- | --- |
| `README.md` | Namestitev, zagon, testna računa (terapevt, uporabnik), opomba o rezervaciji pri dr. Amari Diallo | Ne (samo namestitev) |
| `_PROMOCIJA/opis_projekta.md` | Splošni opis: dnevne prijave, AI pomočnik Otto, vsebine, terapevti, rezervacije | Delno (visoka raven, brez tokov) |
| `AI_STRATEGIJA.md` | Uporaba umetne inteligence v projektu | Ne |
| `web-template/CLAUDE.md` | Navodila za razvoj ki so zastarela (pnpm, »brez zaledja«) | Ne, delno napačna |
| `web-template/DESIGN_SYSTEM.md`, `guidelines/Guidelines.md` | Oblikovni sistem in smernice | Ne |
| `src/imports/pasted_text/*.md` | Besedila z zahtevami za sisteme (rezervacije, AI wellness, popravki) | Delno (neformalne zahteve) |
| `_PROMOCIJA/architecture.png` | Arhitekturni diagram | Ne (struktura, ne funkcije) |

Formalnih funkcionalnih zahtev, uporabniških zgodb ali testnih primerov v projektu ni bilo.

### 1.2 Obnovljene ključne funkcionalnosti

| ID | Funkcionalnost | Vloga | Vir v kodi |
| --- | --- | --- | --- |
| F1 | Registracija, prijava, ponastavitev gesla, usmerjanje po vlogi | uporabnik, terapevt | `AuthScreen`, `LoginScreen`, `services/auth.ts` |
| F2 | Vprašalnik ob prvi uporabi (onboarding) | uporabnik | `EnhancedQuestionnaire`, `services/onboarding.ts` |
| F3 | Dnevna prijava (10 vprašanj), shranjevanje v `dnevniki`, serija dni | uporabnik | `DailyCheckIn`, `StreakCalculator` |
| F4 | AI nasveti in priporočila vsebin po prijavi | uporabnik | `services/gemini.ts`, `HomeDashboard` |
| F5 | Dnevnik (zgodovina prijav, podrobnosti, trendi) | uporabnik | `JournalHistory`, `CheckInDetail` |
| F6 | Pogovor z AI pomočnikom Otto | uporabnik | `aichat` |
| F7 | Iskanje terapevta, rezervacija termina (tip, datum, ura) | uporabnik | `TherapistList`, `BookAppointmentFlow` |
| F8 | Plačilo termina s Stripe | uporabnik | `PaymentCheckout`, `createPaymentIntent` |
| F9 | Pregled in odpoved terminov, vračilo po pravilih (72 ur) | uporabnik, terapevt | `UserAppointmentsScreen`, `cancelAppointmentWithPayment` |
| F10 | Obvestila (v aplikaciji in push) | vsi | `NotificationsScreen`, `onAppointment*` |
| F11 | Terapevt: urnik razpoložljivosti, termini, stranke, vsebine | terapevt | `TherapistDashboard`, `TherapistContentEditor`, `TherapistMyContent` |
| F12 | Knjižnica vsebin: iskanje, ogled s koraki, všečkanje, shranjevanje, opravljeno | uporabnik | `ContentLibrary`, `ContentDetail`, `services/contentInteractions.ts` |

### 1.3 Izbira scenarijev

Izbrala sem tri tokove: F3 + F4 (dnevna prijava), F11 (terapevt doda vsebino s koraki) ter F12 (uporabnik poišče vsebino, jo opravi, všečka in shrani). Scenarija TS-02 in TS-03 sta povezana, saj uporabnik uporabi vsebino, ki jo je ustvaril terapevt.

## 2. Testni scenariji in odgovorne osebe

| ID | Naziv scenarija | Funkcionalnosti | Vloga testerja | Odgovorna oseba | Izvajalec | Prioriteta |
| --- | --- | --- | --- | --- | --- | --- |
| TS-01 | Dnevna prijava in posodobitev serije dni | F3, F4, F5 | uporabnik | `hanahorvat`, avtorica `DailyCheckIn` | Hana Lia Horvat | Visoka |
| TS-02 | Terapevt doda vsebino s koraki (objava, osnutek, urejanje, brisanje) | F11 | terapevt | `anacvetkoo`, avtorica `TherapistContentEditor` in `TherapistMyContent` | Hana Lia Horvat | Visoka |
| TS-03 | Uporabnik poišče vsebino, jo opravi po korakih, všečka in shrani | F12 | uporabnik, terapevt | `anacvetkoo`, avtorica `ContentLibrary` in `ContentDetail` | Hana Lia Horvat | Visoka |


### 2.1 Zakaj ravno ti scenariji

- **TS-01** je najpogostejša uporabnikova akcija in povezuje obrazec, Firestore (`dnevniki`), izračun serije in AI nasvete.
- **TS-02** je glavna terapevtova funkcionalnost: dodajanje vsebine s koraki, razlikovanje med objavo in osnutkom, urejanje in brisanje. Uporablja le obrazec in Firestore (`content`).
- **TS-03** je uporabnikova stran iste vsebine: iskanje, filtriranje, ogled po korakih, všečkanje, shranjevanje in označitev kot opravljeno. Povezuje obe vlogi, saj uporabnik vidi vsebino iz TS-02.

TS-03 uporablja vsebino, ki nastane v TS-02, zato se scenariji izvedejo v vrstnem redu TS-01, TS-02, TS-03.

### 2.2 Slediljivost: funkcionalnost → scenarij

| Funkcionalnost | TS-01 | TS-02 | TS-03 |
| --- | --- | --- | --- |
| F3 Dnevna prijava | x |  |  |
| F4 AI nasveti | x |  |  |
| F5 Dnevnik | x |  |  |
| F11 Terapevtova vsebina |  | x | x |
| F12 Knjižnica vsebin |  |  | x |

## 3. Testno okolje, podatki in merila

Scenarije izvajam na delujoči spletni aplikaciji z uporabniškimi računi iz `README.md`. Podatki se pridobijo iz podatkovne baze Firebase.

### 3.1 Okolje (Test Environment Requirements)

| Postavka | Vrednost |
| --- | --- |
| Aplikacija | https://mindmend-a8839.web.app (Firebase Hosting) |
| Brskalnik | Chrome, zadnja različica; dodatno mobilni pogled (ozko okno) |
| Zaledje | Firebase Auth, Firestore (`users`, `dnevniki`, `content`, `contentProgress`), Firebase AI Logic (Gemini) |
| Zunanje storitve | Gemini za AI nasvete |
| Časovni pas testerja | Europe/Ljubljana (pomemben za »Featured today« in datum prijave) |
| Dva brskalniška profila | eden za uporabnika, drugi za terapevta |

### 3.2 Testni podatki (Test Data Requirements)

| Podatek | Vrednost | Opomba |
| --- | --- | --- |
| Uporabnik | lia@gmail.com, geslo iz `README.md` | ima že vnesene podatke |
| Terapevt | ana@gmail.si, geslo iz `README.md` | prijava na domači zaslon terapevta |
| Objavljena vsebina | naslov »Test: Box Breathing«, kategorija Breathing, težavnost Medium, trajanje 5, koraki »Breathe in« in »Hold« | za TS-02 in TS-03 |
| Osnutek | naslov »Test: Draft«, kategorija Relaxation | za TS-02 |
| Opis vsebine | »Test content for functional testing« | po želji |
| Nov račun brez vsebine | ga ustvari ekipa (neobvezno) | samo za preizkus praznih seznamov v TS-03 |

### 3.3 Pogoji za začetek (Entry Criteria)

- Aplikacija je dostopna in prijava z obema računoma uspe.
- Za TS-01 danes še ni oddane dnevne prijave testnega uporabnika.
- Za TS-02 v zbirki `content` še ni vsebine z naslovom »Test: Box Breathing«.
- Izvajalec ima dostop do Firebase konzole (Firestore) za preverjanje zapisov.

### 3.4 Pogoji za zaključek (Exit Criteria)

- Vsi koraki vseh treh scenarijev so izvedeni in imajo zabeležen rezultat.
- Vsak scenarij ima status Pass, Fail ali Blocked z razlogom.
- Vse napake so vpisane v poročilo o napaki.
- Ni odprte napake resnosti Kritična ali Visoka brez dogovorjenega ukrepa.
  

## 4. TS-01: Dnevna prijava in posodobitev serije dni

Scenarij preveri, da uporabnik odda 10-stopenjsko dnevno prijavo, da se zapis shrani v `dnevniki`, da se serija dni posodobi in da se prijava prikaže v dnevniku.

### 4.1 Specifikacija (Test Case Specification)

| Polje | Vrednost |
| --- | --- |
| ID, naziv | TS-01, Dnevna prijava in posodobitev serije dni |
| Cilj | Potrditi, da dnevna prijava deluje od začetka do prikaza v dnevniku |
| Funkcionalnosti | F3, F4, F5 |
| Predpogoji | Prijavljen uporabnik, danes brez oddane prijave (na dashboard-u je kartica »Daily Check-in«) |
| Podatki | Uporabnik iz razdelka 3.2; odgovori v koraku 4 |
| Odgovorna oseba | Hana Horvat |
| Prioriteta | Visoka |

### 4.2 Postopek in pričakovani rezultati (Test Procedure)

| Korak | Akcija | Pričakovani rezultat |
| --- | --- | --- |
| 1 | Prijavi se kot uporabnik in odpri Home | Prikazana je kartica »Daily Check-in« z gumbom »Start«, zapomni si vrednost »Day Streak« |
| 2 | Klikni »Start« | Odpre se »Daily Check-In«, napis »Question 1 of 10«. Besedilo se tipka, gumbi se pojavijo po koncu |
| 3 | Pri vprašanju 1 ne izberi ničesar | Gumb »Next« je onemogočen |
| 4 | Izberi »Happy«, klikni »Next« | Prikaže se vprašanje 2, na voljo je »Back« |
| 5 | Izberi vsaj eno čustvo (npr. Joy, Calm) in klikni »Next« | Nadaljevanje na vprašanje 3. Z nobenim izbranim čustvom »Next« ni mogoč |
| 6 | Vpiši »Testing thoughts« pri vprašanju 3, klikni »Next« | Vprašanje 4 (stres, drsnik 0 do 10) |
| 7 | Nastavi stres na 7, klikni »Next« | Vprašanje 5 (spanje) |
| 8 | Izberi »Good«, klikni »Next« | Vprašanji 6 in 7, vpiši besedilo pri 6, pri 7 (»Difficulties«) pusti prazno, »Next« ostane omogočen |
| 9 | Nastavi povezanost (vprašanje 8) na 6, klikni »Next« | Vprašanje 9 (hvaležnost) |
| 10 | Vpiši hvaležnost, klikvi »Next«. Vpiši vprašanje 10 | Gumb se glasi »Complete Check-In« |
| 11 | Klikni »Complete Check-In« | Prijava se zapre, prikaže se Home |
| 12 | Poglej Home | Kartica se zamenja z  »Done« »You've checked in today. Great job!«. »Day Streak« je večji za 1 |
| 13 | Po nekaj sekundah osveži Home | V razdelku nasvetov so AI nasveti (ali privzeta dva nasveta pri okvari) in priporočila |
| 14 | Odpri Journal | »Check-In History« vsebuje današnji zapis z oceno stresa 7/10 in čustvi |
| 15 | Odpri zapis | »Check-In Details« prikaže vnesena besedila (»On Your Mind«, »Energy Source«, »Gratitude«, »For Tomorrow«) |
| 16 | V Firebase konzoli odpri `dnevniki` | Nov dokument s `userId`, odgovori, `date` (YYYY-MM-DD) in `timestamp` |

### 4.3 Dodatni preizkusi v istem scenariju (negativni in robni)

| ID | Preizkus | Pričakovano |
| --- | --- | --- |
| 4a | Med prijavo klikni X | Prijava se zapre, v `dnevniki` ni novega zapisa |
| 4b | Po oddani prijavi poišči vstopno točko za prijavo | Home ne ponuja ponovne prijave za isti dan |
| 4c | Prijava ob 00:30 po lokalnem času | Datum zapisa je UTC, zato je lahko čez polnoč drugačen od lokalnega (znano tveganje) |
| 4d | Besedilo samo s presledki pri vprašanju 3 | Koda to dovoli |

### 4.4 Pričakovane točke tveganja

- Koda ne prepreči druge prijave istega dne, skrita je le kartica na Home.
  
## 5. TS-02: Terapevt doda vsebino s koraki

Scenarij preveri, da terapevt ustvari vsebino s koraki, da obrazec preveri obvezna polja, da loči objavo in osnutek ter da vsebino lahko uredi in izbriše.

### 5.1 Specifikacija

| Polje | Vrednost |
| --- | --- |
| ID, naziv | TS-02, Terapevt doda vsebino s koraki |
| Cilj | Potrditi ustvarjanje, shranjevanje (objava, osnutek), urejanje in brisanje vsebine s koraki |
| Funkcionalnosti | F11 |
| Predpogoji | Prijavljen terapevt; vsebine »Test: Box Breathing« še ni |
| Podatki | Terapevt in objavljena vsebina iz razdelka 3.2, osnutek »Test: Draft« |
| Odgovorna oseba | Ana Cvetko |
| Prioriteta | Visoka |


### 5.2 Postopek in pričakovani rezultati

| Korak | Akcija | Pričakovani rezultat |
| --- | --- | --- |
| 1 | Prijavi se kot terapevt | Odpre se domači zaslon terapevta, spodnja navigacija: Home, My Content, sredinski gumb Plus, Clients, Profile |
| 2 | Klikni »My Content« | Naslov »My Content« s podnaslovom »Manage your published sessions« in zavihki »All«, »Drafts«, »Relaxation«, »Breathing«, »Sound Therapy«, gumb »Add New«. Zapomni si število kartic v »All« |
| 3 | Klikni »+ Add New« | Odpre se »Add New Content« s poljem »Title *«, izbirami »Category *« (Relaxation je izbrana) in »Difficulty *« (Easy je izbrana), izbiro »Content Type *«, poljem »Duration in minutes *« ter gumbom »Publish Session« |
| 4 | Klikni »Publish Session« s praznim naslovom | Prikaže se opozorilo »Please fill in all required fields« in vsebina se ne shrani |
| 5 | Vpiši naslov »Test: Box Breathing«, izberi kategorijo »Breathing« in težavnost »Medium« | Izbrani možnosti sta označeni, prikazan je »Content Type *« z gumboma »Upload Video« in »Add Steps« (privzeto »Add Steps«) |
| 6 | Pusti »Duration in minutes *« prazno in klikni »Publish Session« | Prikaže se opozorilo »Please enter duration.« in vsebina se ne shrani |
| 7 | Vpiši trajanje 5, v »Step 1« vpiši naslov »Breathe in« in opis »Inhale through the nose for 4 seconds« | Vrednosti so vidne v poljih |
| 8 | Dvakrat klikni »Add Step« in izpolni korak 2 in korak 3 | Prikazani so »Step 1«, »Step 2« in »Step 3« |
| 9 | Klikni X pri koraku 2 | Korak 2 se odstrani in preostala koraka sta preštevilčena (»Step 1«, »Step 2«). Nova »Step 2« ima naslov »Breathe out« |
| 10 | Vpiši opis »Test content for functional testing« in pusti privzeto barvo sličice | »Preview« prikaže naslov, kategorijo, težavnost in opis |
| 11 | Klikni »Publish Session« | Gumb kaže »Publishing...«, nato se editor zapre in vrne se seznam »My Content« (brez sporočila o uspehu) |
| 12 | V »All« poišči novo kartico | Kartica »Test: Box Breathing« z oznako kategorije Breathing; števci ogledov, všečkov in shranitev so 0, gumba »Edit« in »Delete«, število kartic je za 1 večje |
| 13 | V Firebase konzoli odpri zbirko `content` in nov dokument | `title`, `category`, `contentType = steps`, `steps` z 2 koraka, `duration = 5 min`, `difficulty`, `therapistId` je UID terapevta, `isDraft` ni nastavljen, `views = 0`, `likes = 0`, `publishedAt` |
| 14 | Klikni »Add New«, vpiši naslov »Test: Draft« in klikni »Save Draft« | Gumb kaže »Saving...«, nato se vrne seznam; kartice ni v »All« |
| 15 | Odpri zavihek »Drafts« | Kartica »Test: Draft« z rumeno značko »Draft« in brez števcev |
| 16 | Klikni »Edit« pri osnutku | »Edit Content« z vnaprej izpolnjenim naslovom; gumba »Publish Session« in »Save Draft« |
| 17 | Zapri editor, klikni »Edit« pri objavljeni vsebini, spremeni naslov v »Test: Box Breathing 2« in klikni »Save Changes« | Na voljo je samo »Save Changes« (brez »Save Draft«); naslov na kartici se posodobi |

### 5.3 Dodatni preizkusi

| ID | Preizkus | Pričakovano |
| --- | --- | --- |
| 5a | Pri osnutku klikni »Delete« in v oknu »Are you sure you want to delete this content?« izberi Cancel | Nič se ne zgodi, kartica ostane |
| 5b | Ponovi in izberi OK | Kartica izgine iz seznama, dokument v `content` je izbrisan |
| 5c | Objavi vsebino s korakom brez naslova in opisa | Koda to dovoli (koraki se ne preverjajo); zabeleži kot opazovanje |
| 5d | Trajanje 0 ali negativno | Obrazec naj bi vnos zavrnil (`min = 1`); zabeleži, ali ga zavrne ali shrani |

### 5.4 Pričakovane točke tveganja (iz statične analize kode)

- Koraki se ne preverjajo: vsebina z enim praznim korakom je lahko objavljena.
- Po uspešnem shranjevanju ni sporočila o uspehu.

## 6. TS-03: Uporabnik poišče vsebino, jo opravi po korakih, všečka in shrani

Scenarij preveri, da uporabnik najde vsebino iz TS-02, jo opravi po korakih, jo všečka in shrani ter da se vsebina pojavi v seznamih Liked, Saved in Done.

### 6.1 Specifikacija

| Polje | Vrednost |
| --- | --- |
| ID, naziv | TS-03, Uporabnik poišče vsebino, jo opravi po korakih, všečka in shrani |
| Cilj | Potrditi iskanje, ogled s koraki, všečkanje, shranjevanje in označitev kot opravljeno |
| Funkcionalnosti | F11, F12 |
| Predpogoji | Izveden TS-02, objavljena vsebina »Test: Box Breathing« je ustvarjena danes |
| Podatki | Uporabnik in terapevt iz razdelka 3.2 |
| Odgovorna oseba | Ana Cvetko |
| Prioriteta | Visoka |

### 6.2 Postopek in pričakovani rezultati

| Korak | Akcija | Pričakovani rezultat |
| --- | --- | --- |
| 1 | Kot uporabnik klikni zavihek »Explore« | Naslov »Content Library« |
| 2 | V »Featured today« poišči vsebino iz TS-02 | Vsebina je vidna, ker je bila ustvarjena danes |
| 3 | Klikni kategorijo »Breathing Techniques« in nato »Sound Therapy« | Pri »Breathing Techniques« je vsebina vidna, pri »Sound Therapy« je ni |
| 4 | Vpiši »Box Breathing« v iskalnik | Najde se vsebina. |
| 5 | Preklopi razvrščanje med »Newest«, »Most liked« in »Most viewed« | Vrstni red kartic se ustrezno spremeni |
| 6 | Klikni »Start« pri vsebini | Odpre se »ContentDetail« z naslovom, terapevtom, trajanjem »5 min«, težavnostjo Medium in napisom »Step 1 of 2« |
| 7 | Klikni »Next« | »Step 2 of 2«, na voljo je »Previous«; gumb »Next« se glasi »Finish« |
| 8 | Klikni »Previous« | Vrnitev na »Step 1 of 2« |
| 9 | Klikni srček | Število všečkov se poveča za 1. V Firestore ima `users/{uid}` v `likedContentIds` ID vsebine in `content.likes` je 1 |
| 10 | Klikni zaznamek | Odpre se okno »Save content« s »Save without collection« in »New collection« |
| 11 | Izberi »Save without collection« in klikni »Save« | Okno se zapre, v Firestore je ID vsebine v `savedContentIds` |
| 12 | Pojdi do koraka 2 in klikni »Finish« | Prikaže se »You finished this session« in »Great job. You reached the end of this exercise.« |
| 13 | Odpri Profile in klikni ploščice »Liked«, »Saved« in »Done« | V »Liked Content«, »Saved Content« in »Completed Content« je vsebina (v zadnjem z oznako »Completed«) |
| 14 | V drugem profilu odpri terapevta, zavihek »My Content« | Na kartici so ogledi večji od 0 in všečki 1 |
| 15 | Kot uporabnik še enkrat klikni srček | Število všečkov se zmanjša za 1, vsebine ni več v »Liked Content« |

### 6.3 Dodatni preizkusi

| ID | Preizkus | Pričakovano |
| --- | --- | --- |
| 6a | Odpri vsebino, pojdi na korak 2, zapri in jo ponovno odpri | Ogled se nadaljuje pri koraku 2 (shranjen napredek, razdelek »Continue your session«) |
| 6b | V iskalnik vpiši »zzzz« | Prikazano »No content found.« |
| 6c | Kot terapevt izbriši vsebino in kot uporabnik osveži Explore | Vsebina izgine iz Explore in iz seznamov Liked, Saved in Done |
| 6d | Neobvezno, nov račun brez vsebine: odpri »Liked«, »Saved« in »Done« | Prazna stanja: »No liked content yet«, »No saved content yet«, »No completed content yet« |

### 6.4 Pričakovane točke tveganja (iz statične analize kode)

- Števec shranitev (`saves`) se ob shranjevanju ne poveča, ker funkcija `toggleSavedContent` v kodi ni nikjer poklicana, na kartici terapevta ostane 0.
- Explore prebere celotno zbirko `content` in za vsako vsebino še dokument avtorja, kar ob rasti vsebin povečuje število branj v Firestore.
- Ogled se šteje samo enkrat na vsebino v eni seji strani, po osvežitvi se lahko šteje znova.

## 7. Dnevnik izvedbe testov (Test Execution Log)

| Preizkus | Datum in ura | Izvajalec | Dejanski rezultat | Status | Napaka (ID) |
| --- | --- | --- | --- | --- | --- |
| TS-01 koraki 1 do 16 |  |  |  | Ni izvedeno |  |
| TS-01 4a prekinitev prijave |  |  |  | Ni izvedeno |  |
| TS-01 4b druga prijava istega dne |  |  |  | Ni izvedeno |  |
| TS-01 4c prijava po polnoči |  |  |  | Ni izvedeno |  |
| TS-01 4d besedilo s presledki |  |  |  | Ni izvedeno |  |
| TS-02 koraki 1 do 17 |  |  |  | Ni izvedeno |  |
| TS-02 5a brisanje osnutka, Cancel |  |  |  | Ni izvedeno |  |
| TS-02 5b brisanje osnutka, OK |  |  |  | Ni izvedeno |  |
| TS-02 5c korak brez besedila |  |  |  | Ni izvedeno |  |
| TS-02 5d trajanje 0 ali negativno |  |  |  | Ni izvedeno |  |
| TS-03 koraki 1 do 15 |  |  |  | Ni izvedeno |  |
| TS-03 6a nadaljevanje ogleda |  |  |  | Ni izvedeno |  |
| TS-03 6b iskanje brez zadetkov |  |  |  | Ni izvedeno |  |
| TS-03 6c brisanje vsebine |  |  |  | Ni izvedeno |  |
| TS-03 6d prazna stanja (neobvezno) |  |  |  | Ni izvedeno |  |


## 8. Poročilo o testiranju (Test Completion Report)

### 8.1 Povzetek stanja

| Postavka | Vrednost |
| --- | --- |
| Predmet testiranja | MindMend, spletna različica na https://mindmend-a8839.web.app |
| Način testiranja | funkcionalno, ročno, črna skrinjica |
| Načrtovani scenariji | 3 (TS-01, TS-02, TS-03), skupaj 15 preizkusov |
| Izvedeni scenariji | 3 |
| Pass / Fail / Blocked | Pass |

### 8.2 Rezultati po scenarijih

| Scenarij | Odgovorna oseba za testiranje | Status | Pokritost korakov |
| --- | --- | --- | --- |
| TS-01 Dnevna prijava | Hana Horvat | izvedeno | 20 od 20 |
| TS-02 Dodajanje vsebine s koraki | Hana Horvat | izvedeno | 21 od 21 |
| TS-03 Uporaba vsebine kot uporabnik | Hana Horvat | izvedeno | 19 od 19 |

### 8.3 Domnevne pomanjkljivosti, najdene s statično analizo (za potrditev med izvedbo)

To niso rezultati testov, ampak hipoteze iz branja kode, ki jih mora izvedba potrditi ali ovreči.

| ID | Opis | Scenarij | Predvidena resnost |
| --- | --- | --- | --- |
| H-01 | Datum prijave je v UTC, serija in »danes« pa se primerjata lokalno; ob polnoči je mogoč zamik | TS-01 | Srednja |
| H-02 | Druga prijava istega dne ni preprečena v kodi, le skrita kartica | TS-01 | Srednja |
| H-03 | Koraki vsebine se ne preverjajo; objavi se lahko vsebina s praznim korakom | TS-02 | Srednja |
| H-04 | Polje za avdio ali video je označeno z zvezdico, a datoteka ni obvezna; vsebina kaže »file is not available« | TS-02 | Srednja |
| H-05 | Po shranjevanju ni sporočila o uspehu, napake pa so v brskalniškem oknu (alert) | TS-02 | Nizka |
| H-06 | Objavljene vsebine ni mogoče vrniti v osnutek | TS-02 | Nizka |
| H-07 | Števec shranitev (`saves`) se ne poveča, ker `toggleSavedContent` ni poklicana | TS-03 | Srednja |
| H-08 | Explore prebere celotno zbirko `content` in dokument avtorja za vsako vsebino | TS-03 | Nizka |
| H-09 | Izbrisana vsebina tiho izgine iz seznamov Liked, Saved in Done | TS-03 | Nizka |






