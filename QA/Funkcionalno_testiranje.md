# Funkcionalno testiranje (ISO/IEC/IEEE 29119-3)

## Povzetek in opomba o izvedbi

Dokument vsebuje testno dokumentacijo za tri funkcionalne scenarije aplikacije MindMend (dnevna prijava, rezervacija s plačilom, odpoved z vračilom), pripravljeno po strukturi standarda ISO/IEC/IEEE 29119-3:2021.

## 1. Obstoječa dokumentacija in obnovljene funkcionalnosti

Obstoječa dokumentacija opisuje namestitev in namen aplikacije, ne pa funkcionalnih zahtev in tokov, zato sem ključne funkcionalnosti obnovili iz izvorne kode (zaslonov, storitev in Cloud Functions).

### 1.1 Pregled obstoječe dokumentacije

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
| F11 | Terapevt: urnik razpoložljivosti, termini, stranke, vsebine | terapevt | `TherapistDashboard`, `TherapistContentEditor` |

### 1.3 Izbira scenarijev

Izbrala sem tri tokove, ki vključujejo več plasti (zaslon, Firestore, zaledje, zunanje storitve): F3 + F4, F7 + F8 in F9. Pokrivajo uporabnikovo vsakodnevno uporabo, denarni tok in pravila z največ poslovnega tveganja.

## 2. Testni scenariji in odgovorne osebe

Izbrani trije funkcionalni scenariji, vsak z eno odgovorno osebo:

| ID | Naziv scenarija | Funkcionalnosti | Vloga testerja | Odgovorna oseba | Izvajalec | Prioriteta |
| --- | --- | --- | --- | --- | --- | --- |
| TS-01 | Dnevna prijava in posodobitev serije dni | F3, F4, F5 | uporabnik | `hanahorvat`, avtorica `DailyCheckIn` | Hana Lia Horvat | Visoka |
| TS-02 | Rezervacija termina in plačilo s Stripe | F7, F8, F10 | uporabnik | `zivasumak`, avtorica `BookAppointmentFlow` | Hana Lia Horvat | Kritična |
| TS-03 | Odpoved potrjenega termina in pravila vračila | F9, F10 | uporabnik, terapevt | `anacvetkoo`, avtorica `payments.ts` in `cancelAppointmentWithPayment` | Hana Lia Horvat | Kritična |


### 2.1 Zakaj ravno ti scenariji

- **TS-01** je najpogostejša uporabnikova akcija in povezuje obrazec, Firestore (`dnevniki`), izračun serije in AI nasvete.
- **TS-02** je celoten denarni tok: urnik, ustvarjanje termina, Cloud Function, Stripe in potrditev.
- **TS-03** vsebuje poslovno pravilo z največjim tveganjem (vračilo denarja le pri odpovedi terapevta ali ≥ 72 ur pred terminom).

TS-03 predpostavlja potrjen termin iz TS-02, zato se izvedejo v vrstnem redu TS-01, TS-02, TS-03.

### 2.2 Slediljivost: funkcionalnost → scenarij

| Funkcionalnost | TS-01 | TS-02 | TS-03 |
| --- | --- | --- | --- |
| F3 Dnevna prijava | x |  |  |
| F4 AI nasveti | x |  |  |
| F5 Dnevnik | x |  |  |
| F7 Rezervacija |  | x |  |
| F8 Plačilo |  | x |  |
| F9 Odpoved in vračilo |  |  | x |
| F10 Obvestila |  | x | x |

## 3. Testno okolje, podatki in merila

Scenarije izvajamo na delujoči spletni aplikaciji z uporabniškimi računi iz `README.md`. Pred prvim zagonom je treba potrditi, da Stripe deluje v testnem načinu.

### 3.1 Okolje (Test Environment Requirements)

| Postavka | Vrednost |
| --- | --- |
| Aplikacija | https://mindmend-a8839.web.app (Firebase Hosting) |
| Brskalnik | Chrome, zadnja različica; dodatno mobilni pogled (ozko okno) |
| Zaledje | Firebase Auth, Firestore, Cloud Functions (`createPaymentIntent`, `cancelAppointmentWithPayment`) |
| Zunanje storitve | Stripe (EUR), Gemini za AI nasvete |
| Časovni pas testerja | Europe/Ljubljana (pomemben za izračun 72 ur) |
| Dva brskalniška profila | eden za uporabnika, drugi za terapevta, da sta seji hkrati prijavljeni |

### 3.2 Testni podatki (Test Data Requirements)

| Podatek | Vrednost | Opomba |
| --- | --- | --- |
| Uporabnik | lia@gmail.com, geslo iz `README.md` | ima že vnesene podatke |
| Terapevt | ana@gmail.si, geslo iz `README.md` | prijava na domači zaslon terapevta |
| Terapevt za rezervacijo | Dr. Amara Diallo, PsyD | po `README.md` primeren za testiranje |
| Testna kartica Stripe | 4242 4242 4242 4242, poljuben prihodnji datum, poljubna CVC | velja le v testnem načinu |
| Zavrnjena kartica | 4000 0000 0000 0002 | Stripe testna kartica za zavrnitev |
| Datum termina za pravilo 72 ur | en termin ≥ 72 ur in en < 72 ur v prihodnost | glej TS-03 |

### 3.3 Pogoji za začetek (Entry Criteria)

- Aplikacija je dostopna in prijava z obema računoma uspe.
- Stripe deluje v testnem načinu (objavljivi ključ se začne s pk\_test\_, v Stripe nadzorni plošči je vklopljen testni način); sicer se TS-02 in TS-03 ne izvajata, prave kartice se ne uporabljajo.
- Terapevt ima nastavljen urnik in verificiran Stripe račun (`stripeAccountStatus = verified`).
- Za TS-01 danes še ni oddane dnevne prijave testnega uporabnika.

### 3.4 Pogoji za zaključek (Exit Criteria)

- Vsi koraki vseh treh scenarijev so izvedeni in imajo zabeležen rezultat.
- Vsak scenarij ima status Pass, Fail ali Blocked z razlogom.
- Vse napake so vpisane v poročilo o napaki (razdelek 9).
- Ni odprte napake resnosti Kritična ali Visoka brez dogovorjenega ukrepa.

### 3.5 Lestvica resnosti napak

| Resnost | Pomen |
| --- | --- |
| Kritična | napačen denarni izid ali izguba podatkov; funkcionalnost ne deluje |
| Visoka | glavni tok je moten, obstaja zaobhod |
| Srednja | napačno ali zavajajoče besedilo, stranski učinek |
| Nizka | kozmetična napaka |

## 4. TS-01: Dnevna prijava in posodobitev serije dni

Scenarij preveri, da uporabnik odda 10-stopenjsko dnevno prijavo, da se zapis shrani v `dnevniki`, da se serija dni posodobi in da se prijava prikaže v dnevniku. Pričakovani rezultati so izpeljani iz izvorne kode (`DailyCheckIn.tsx`, `HomeDashboard.tsx`, `JournalHistory.tsx`).

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
- Ob napaki shranjevanja se prikaže slovensko opozorilo »Nekaj je šlo narobe pri shranjevanju. Poskusi znova!«, preostala aplikacija pa je v angleščini.

## 5. TS-02: Rezervacija termina in plačilo s Stripe

Scenarij preveri celoten tok od izbire terapevta do potrjenega termina: izbira tipa, datuma in ure, ustvarjanje termina, Stripe plačilo, potrditev in obvestila. Pričakovani rezultati so izpeljani iz `BookAppointmentFlow.tsx`, `PaymentCheckout.tsx`, `services/appointments.ts` in `functions/src/index.ts`.

### 5.1 Specifikacija

| Polje | Vrednost |
| --- | --- |
| ID, naziv | TS-02, Rezervacija termina in plačilo s Stripe |
| Cilj | Potrditi, da uporabnik rezervira in plača termin ter da ta postane CONFIRMED |
| Funkcionalnosti | F7, F8, F10 |
| Predpogoji | Pogoji za začetek iz razdelka 3.3; terapevt Dr. Amara Diallo ima urnik in verificiran Stripe račun |
| Podatki | Uporabnik; kartica 4242 4242 4242 4242; tip termina Chat |
| Odgovorna oseba | Živa Šumak |
| Prioriteta | Kritična |

### 5.2 Postopek in pričakovani rezultati

| Korak | Akcija | Pričakovani rezultat |
| --- | --- | --- |
| 1 | Kot uporabnik odpri seznam terapevtov in klikni »Book« pri Dr. Amara Diallo | Odpre se »Book Appointment« z »with Dr. Amara Diallo«, korak »Session Type« |
| 2 | Ne izberi tipa | Gumb »Continue« je onemogočen |
| 3 | Izberi »Text Chat«, klikni »Continue« | Korak 2 »Select Date«, prikazan koledar |
| 4 | Poskusi izbrati pretekli dan in nedelovni dan | Dnevi so onemogočeni |
| 5 | Izberi prvi prosti delovni dan v prihodnosti, klikni »Continue« | Korak 3 »Select Time« s seznamom ur (začetek in konec) |
| 6 | Brez izbire ure poglej gumb | Gumb za nadaljevanje ni na voljo, dokler ura ni izbrana |
| 7 | Izberi uro, v »Notes (Optional)« vpiši »Test booking«, klikni »Continue to Payment« | Odpre se »Payment« z »Appointment Summary«: terapevt, tip, datum, ura, »Total« |
| 8 | Preveri znesek | Skupaj = cena terapevta za Chat + 15 % (uporabnikov dodatek); zapiši znesek |
| 9 | V Firebase konzoli poglej `appointments` | Nov termin s statusom PENDING\_PAYMENT, `paymentStatus = unpaid`, `price`, `platformFeePercent` |
| 10 | Kot terapevt poglej obvestila | »New appointment booked« z imenom uporabnika, datumom in uro (obvestilo se pošlje že pred plačilom) |
| 11 | Kot uporabnik vpiši kartico 4242 4242 4242 4242, prihodnji datum, CVC 123; klikni »Pay €...« | Gumb »Processing...«, nato »Payment Successful!« ok. 1,2 s |
| 12 | Po uspehu | Aplikacija odpre »My Appointments«; termin je v zavihku »Upcoming« s statusom »Confirmed« |
| 13 | V Firebase konzoli poglej termin | `status = CONFIRMED`, `paymentStatus = paid`, `stripePaymentIntentId` je nastavljen |
| 14 | V Stripe testni nadzorni plošči poglej plačila | PaymentIntent v EUR z enakim zneskom, status Succeeded |
| 15 | Kot uporabnik poglej obvestila | »Appointment confirmed« z datumom in uro |
| 16 | Kot terapevt poglej zavihek Upcoming | Termin je viden z imenom stranke, statusom »Confirmed« in gumbom »Cancel« |

### 5.3 Dodatni preizkusi

| ID | Preizkus | Pričakovano |
| --- | --- | --- |
| 5a | Plačilo z zavrnjeno kartico 4000 0000 0000 0002 | Sporočilo Stripe o zavrnitvi; termin dobi status PAYMENT\_FAILED; denar se ne zadrži |
| 5b | V plačilnem zaslonu klikni puščico nazaj | Vrnitev na »My Appointments«; termin ostane PENDING\_PAYMENT |
| 5c | Pri tem terminu klikni »Complete Payment« | Plačilni zaslon se ponovno odpre in je mogoče plačati |
| 5d | Dan brez prostih ur | »No available time slots«, gumb za nadaljevanje skrit, na voljo »Request Different Time« |
| 5e | Dva uporabnika izbereta isto uro, prvi še ni plačal | Ura je zasedena šele po potrditvi (koda šteje samo CONFIRMED), mogoča je dvojna rezervacija; zabeleži kot opazovanje |

### 5.4 Pričakovane točke tveganja (iz statične analize kode)

- Cena med koraki 1 do 3 ni prikazana, prvi prikaz je v plačilnem zaslonu.
- Uporabniku se doda 15 % (`App.tsx`), zaledje pa privzeto uporablja 20 % (`PLATFORM_FEE_PERCENT || 20`); pri primerjavi zneska s Stripe in `platformFeePercent` v Firestore preveri, kateri odstotek je dejansko uporabljen.
- Napaka zaledja (npr. »Therapist has not connected Stripe yet«) se uporabniku ne prikaže dobesedno, prikaže se »Payment could not be prepared. Please try again.« in termin dobi PAYMENT\_FAILED.

## 6. TS-03: Odpoved potrjenega termina in pravila vračila

Scenarij preveri, da odpoved potrjenega in plačanega termina sledi pravilu: terapevt vedno vrne denar, uporabnik le, če odpove vsaj 72 ur pred začetkom. Pričakovani rezultati izhajajo iz `cancelAppointmentWithPayment` (`functions/src/index.ts`), `UserAppointmentsScreen.tsx` in `TherapistDashboard.tsx`.

### 6.1 Specifikacija

| Polje | Vrednost |
| --- | --- |
| ID, naziv | TS-03, Odpoved potrjenega termina in pravila vračila |
| Cilj | Potrditi pravilno vračilo, statuse, obvestila in sprostitev ure |
| Funkcionalnosti | F9, F10 |
| Predpogoji | Izveden TS-02; trije plačani termini: A (≥ 72 ur v prihodnosti), B (manj kot 72 ur, vsaj 1 uro) in C (≥ 72 ur, ki ga bo odpovedal terapevt) |
| Podatki | Računa iz razdelka 3.2; kartica 4242 4242 4242 4242 |
| Odgovorna oseba | Ana Cvetko |
| Prioriteta | Kritična |

Opomba: termin B rezerviraj za uro znotraj naslednjih 72 ur; če terapevt takih ur nima, mora ekipa urnik za test začasno prilagoditi.

### 6.2 Postopek in pričakovani rezultati: uporabnik odpove termin A (≥ 72 ur)

| Korak | Akcija | Pričakovani rezultat |
| --- | --- | --- |
| 1 | Kot uporabnik odpri »My Appointments«, zavihek »Upcoming« | Termin A je viden z gumbom »Cancel« |
| 2 | Klikni »Cancel« | Okno »Cancel appointment?« z besedilom o polnem vračilu najmanj 72 ur pred terminom; gumba »Keep« in »Cancel« |
| 3 | Klikni »Keep« | Okno se zapre, termin ostane Confirmed |
| 4 | Ponovno »Cancel« in potrdi »Cancel« | Termin izgine iz zavihka »Upcoming« (preklicani termini se v nobenem zavihku ne prikazujejo) |
| 5 | V Firebase konzoli poglej termin A | `status = CANCELLED`, `cancelledBy = user`, `refundStatus = refunded`, `paymentStatus = refunded`, `stripeRefundId` nastavljen, `therapistPayoutStatus = cancelled` |
| 6 | V Stripe testni plošči poglej plačilo | Povrnjen celoten znesek |
| 7 | Kot terapevt poglej obvestila | »Appointment cancelled« z imenom uporabnika, datumom in uro |
| 8 | Kot drug uporabnik odpri izbiro ur za isti dan | Ura termina A je spet prosta |

### 6.3 Postopek in pričakovani rezultati: uporabnik odpove termin B (< 72 ur)

| Korak | Akcija | Pričakovani rezultat |
| --- | --- | --- |
| 1 | Kot uporabnik klikni »Cancel« pri terminu B in potrdi | Termin izgine iz »Upcoming« |
| 2 | V Firebase konzoli poglej termin B | `status = CANCELLED`, `refundStatus = notRefundable`, `paymentStatus = notRefundable`, brez `stripeRefundId`, `therapistPayoutStatus` ostane `pending` |
| 3 | V Stripe testni plošči poglej plačilo | Plačilo ostane Succeeded, brez vračila |
| 4 | Kot terapevt poglej obvestila | »Appointment cancelled« |

### 6.4 Postopek in pričakovani rezultati: terapevt odpove termin C

| Korak | Akcija | Pričakovani rezultat |
| --- | --- | --- |
| 1 | Kot terapevt odpri Upcoming in klikni »Cancel« pri terminu C | Okno »Cancel appointment?« z besedilom, da stranka prejme polno vračilo; »Keep«, »Cancel« |
| 2 | Potrdi »Cancel« | Termin izgine iz zavihka Upcoming |
| 3 | V Firebase konzoli poglej termin C | `status = CANCELLED_BY_THERAPIST`, `cancelledBy = therapist`, `refundStatus = refunded`, `paymentStatus = refunded`, `therapistPayoutStatus = cancelled` |
| 4 | V Stripe testni plošči poglej plačilo | Povrnjen celoten znesek |
| 5 | Kot uporabnik poglej obvestila | »Appointment cancelled«, ki navaja terapevta, datum in uro |

### 6.5 Dodatni preizkusi

| ID | Preizkus | Pričakovano |
| --- | --- | --- |
| 6a | Odpoved termina z še neplačanim statusom (PENDING\_PAYMENT) | Ni vračila; preveri, da status ni zavajajoči |
| 6b | Zavrnitev zahteve (REQUESTED) z »Decline« | Uporabnik prejme »Request declined«; v bazi preveri `refundStatus` (koda nastavi `refundPending`, čeprav ni bilo plačila) |
| 6c | Odpoved natanko ob meji 72 ur | Pravilo je `>= 72`: pri natanko 72 urah je vračilo odobreno |
| 6d | Odpoved prekinjene povezave | Aplikacija ne prikaže sporočila o napaki (brez try/catch); zabeleži kot opazovanje |

### 6.6 Pričakovane točke tveganja (iz statične analize kode)

- Obvestila ne omenjajo vračila ali pravila 72 ur.
- Preklicani termini niso vidni v nobenem zavihku, uporabnik nima potrdila o odpovedi.
- Napaka pri odpovedi (omrežje, Stripe) ni prikazana uporabniku.

## 7. Dnevnik izvedbe testov (Test Execution Log)

Ta dnevnik izpolni izvajalec med testiranjem; scenariji do zdaj niso bili izvedeni v živi aplikaciji, zato so vsi rezultati »Ni izvedeno«. Status je Pass, Fail, Blocked ali Ni izvedeno.

| Preizkus | Datum in ura | Izvajalec | Dejanski rezultat | Status | Napaka (ID) |
| --- | --- | --- | --- | --- | --- |
| TS-01 koraki 1 do 16 |  |  |  | Ni izvedeno |  |
| TS-01 4a prekinitev prijave |  |  |  | Ni izvedeno |  |
| TS-01 4b druga prijava istega dne |  |  |  | Ni izvedeno |  |
| TS-01 4c prijava po polnoči |  |  |  | Ni izvedeno |  |
| TS-01 4d besedilo s presledki |  |  |  | Ni izvedeno |  |
| TS-02 koraki 1 do 16 |  |  |  | Ni izvedeno |  |
| TS-02 5a zavrnjena kartica |  |  |  | Ni izvedeno |  |
| TS-02 5b nazaj iz plačila |  |  |  | Ni izvedeno |  |
| TS-02 5c Complete Payment |  |  |  | Ni izvedeno |  |
| TS-02 5d dan brez ur |  |  |  | Ni izvedeno |  |
| TS-02 5e dvojna rezervacija |  |  |  | Ni izvedeno |  |
| TS-03 6.2 termin A (uporabnik, ≥ 72 ur) |  |  |  | Ni izvedeno |  |
| TS-03 6.3 termin B (uporabnik, < 72 ur) |  |  |  | Ni izvedeno |  |
| TS-03 6.4 termin C (terapevt) |  |  |  | Ni izvedeno |  |
| TS-03 6a odpoved neplačanega termina |  |  |  | Ni izvedeno |  |
| TS-03 6b zavrnitev zahteve |  |  |  | Ni izvedeno |  |
| TS-03 6c meja 72 ur |  |  |  | Ni izvedeno |  |
| TS-03 6d odpoved brez povezave |  |  |  | Ni izvedeno |  |

Priporočilo: ob vsakem koraku, ki odstopa od pričakovanega, shrani posnetek zaslona in ga priloži poročilu o napaki.

## 8. Poročilo o testiranju (Test Completion Report)

Testiranje v živi aplikaciji še ni izvedeno, zato so rezultati prazni in jih izpolni ekipa po izvedbi; pripravljena sta struktura poročila in seznam napak, ki jih je zaznala statična analiza kode.

### 8.1 Povzetek stanja

| Postavka | Vrednost |
| --- | --- |
| Predmet testiranja | MindMend, spletna različica na https://mindmend-a8839.web.app |
| Način testiranja | funkcionalno, ročno, črna skrinjica |
| Načrtovani scenariji | 3 (TS-01, TS-02, TS-03), skupaj 18 preizkusov |
| Izvedeni scenariji | 0 (izpolni ekipa) |
| Pass / Fail / Blocked | *izpolni ekipa* |
| Odstopanja od načrta | Izvedba je odložena, ker avtomatiziranega dostopa do aplikacije v tej seji ni bilo |
| Datum zaključka | *izpolni ekipa* |

### 8.2 Rezultati po scenarijih

| Scenarij | Odgovorna oseba | Status | Pokritost korakov | Odprte napake |
| --- | --- | --- | --- | --- |
| TS-01 Dnevna prijava | Hana Horvat | Ni izvedeno | 0 od 20 | *izpolni ekipa* |
| TS-02 Rezervacija in plačilo | Živa Šumak | Ni izvedeno | 0 od 21 | *izpolni ekipa* |
| TS-03 Odpoved in vračilo | Ana Cvetko | Ni izvedeno | 0 od 21 | *izpolni ekipa* |

### 8.3 Domnevne pomanjkljivosti, najdene s statično analizo (za potrditev med izvedbo)

To niso rezultati testov, ampak hipoteze iz branja kode, ki jih mora izvedba potrditi ali ovreči.

| ID | Opis | Scenarij | Predvidena resnost |
| --- | --- | --- | --- |
| H-01 | Datum prijave je v UTC, serija in »danes« pa se primerjata lokalno; ob polnoči je mogoč zamik | TS-01 | Srednja |
| H-02 | Druga prijava istega dne ni preprečena v kodi, le skrita kartica | TS-01 | Srednja |
| H-03 | Uporabnikova cena (+15 %) in zaledje (privzeto 20 %) se ne ujemata | TS-02 | Visoka |
| H-04 | PENDING\_PAYMENT ne blokira ure, mogoča dvojna rezervacija | TS-02 | Visoka |
| H-05 | Napaka Stripe ali zaledja se ne prikaže dobesedno | TS-02 | Nizka |
| H-06 | Zavrnitev zahteve (REQUESTED) nastavi `refundStatus = refundPending` brez plačila | TS-03 | Srednja |
| H-07 | Odpoved brez obravnave napak, uporabnik ne dobi sporočila ob neuspehu | TS-03 | Srednja |
| H-08 | Obvestila ne omenjajo vračila ali pravila 72 ur | TS-03 | Nizka |

### 8.4 Ocena in priporočilo

*Izpolni ekipa po izvedbi:* ali so izpolnjena merila za zaključek (razdelek 3.4), kateri scenariji so Pass, in ali se aplikacija sprosti brez odprtih napak resnosti Kritična ali Visoka.

## 9. Predloga poročila o napaki in viri

Za vsako odstopanje od pričakovanega rezultata se izpolni eno poročilo po spodnji predlogi (Incident Report po ISO/IEC/IEEE 29119-3).

### 9.1 Predloga poročila o napaki

| Polje | Vsebina |
| --- | --- |
| ID napake | BUG-001, BUG-002, ... |
| Naslov | kratek opis, kaj ne deluje |
| Scenarij in korak | npr. TS-03, korak 5 |
| Poročevalec in datum | ime, datum in ura |
| Okolje | brskalnik, različica, časovni pas, račun |
| Koraki za ponovitev | oštevilčen seznam |
| Pričakovani rezultat | iz tabele postopka |
| Dejanski rezultat | kaj se je zgodilo, s posnetkom zaslona |
| Resnost | Kritična, Visoka, Srednja, Nizka (razdelek 3.5) |
| Status | Odprta, V popravljanju, Popravljena, Zavrnjena |
| Odgovorna oseba za popravek | ime |

### 9.2 Prilagoditve standarda

Standard ISO/IEC/IEEE 29119-3:2021 predpisuje vrste dokumentov, ne njihovega videza, zato smo jih prilagodili obsegu projekta:

| Dokument po standardu | Kje v tem poročilu |
| --- | --- |
| Test Plan (obseg, merila, okolje) | razdelka 2 in 3 |
| Test Case Specification | razdelki 4.1, 5.1, 6.1 |
| Test Procedure Specification | razdelki 4.2, 5.2, 6.2 do 6.4 |
| Test Data Requirements | razdelek 3.2 |
| Test Environment Requirements | razdelek 3.1 |
| Test Execution Log | razdelek 7 |
| Incident Report | razdelek 9.1 |
| Test Completion Report | razdelek 8 |

### 9.3 Viri

- ISO/IEC/IEEE 29119-3:2021, Software and systems engineering, Software testing, Part 3: Test documentation.
- Izvorna koda in dokumentacija projekta: https://github.com/anacvetkoo/mind-mend (`README.md`, `_PROMOCIJA/opis_projekta.md`, `functions/src/index.ts`, zasloni v `web-template/src/app/components/screens`).
- Stripe, testne kartice: dokumentacija Stripe o testiranju (4242 4242 4242 4242 in 4000 0000 0000 0002).
