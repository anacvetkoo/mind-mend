#!/usr/bin/env bash
# Namerna napaka: preveri, ali avtomatski test zazna okvaro v aplikaciji.
# Napaka: v DailyCheckIn.tsx gumb Next ne bi bil več onemogočen brez odgovora
# (funkcija canProceed vedno vrne true). Pričakovano: TS-01-B pade.
# Zagon (iz mape web-template):  bash e2e/inject-fault.sh
set -u
cd "$(dirname "$0")/.."

FILE="src/app/components/screens/DailyCheckIn.tsx"
BACKUP="$(mktemp)"
cp "$FILE" "$BACKUP"
trap 'cp "$BACKUP" "$FILE"; rm -f "$BACKUP"' EXIT   # datoteko vedno povrnemo

RUN=(npx playwright test ts01-dnevna-prijava.spec.ts -g "TS-01-B" --reporter=line)

echo "== 1. Brez napake (pričakovano: test uspe)"
"${RUN[@]}"; BEFORE=$?

echo "== 2. Vnos napake"
sed -i "s/return answer !== undefined \&\& answer !== '';/return true; \/\/ NAMERNA NAPAKA/" "$FILE"
if cmp -s "$FILE" "$BACKUP"; then echo "Napake ni bilo mogoče vnesti (vrstica ni najdena)"; exit 2; fi
git --no-pager diff --no-index --stat "$BACKUP" "$FILE" | tail -1

echo "== 3. Z napako (pričakovano: test pade)"
"${RUN[@]}"; AFTER=$?

cp "$BACKUP" "$FILE"
echo "== 4. Napaka povrnjena"
echo "Brez napake: izhodna koda $BEFORE (0 = uspel). Z napako: izhodna koda $AFTER (različna od 0 = napaka zaznana)."
if [ "$BEFORE" -eq 0 ] && [ "$AFTER" -ne 0 ]; then echo "REZULTAT: skripta je namerno napako ZAZNALA."; exit 0; fi
echo "REZULTAT: pričakovano obnašanje ni doseženo, preveri izpis."; exit 1
