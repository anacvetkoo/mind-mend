# Namerna napaka: v LoginScreen.tsx očka za prikaz gesla ne dela
set -u
cd "$(dirname "$0")/.."

FILE="src/app/components/screens/LoginScreen.tsx"
BACKUP="$(mktemp)"
cp "$FILE" "$BACKUP"
trap 'cp "$BACKUP" "$FILE"; rm -f "$BACKUP"' EXIT 

RUN=(npx playwright test 00-prijava-brez-zaledja.spec.ts -g "geslo je privzeto skrito" --reporter=line)

echo "== 1. Brez napake (pričakovano: test uspe)"
"${RUN[@]}"; BEFORE=$?

echo "== 2. Vnos napake"
sed -i.bak "s/type={showPassword ? 'text' : 'password'}/type=\"password\" \/\/ NAMERNA NAPAKA/" "$FILE"
rm -f "$FILE.bak"
if cmp -s "$FILE" "$BACKUP"; then echo "Napake ni bilo mogoče vnesti (vrstica ni najdena)"; exit 2; fi
diff "$BACKUP" "$FILE"

echo "== 3. Z napako (pričakovano: test pade)"
"${RUN[@]}"; AFTER=$?

cp "$BACKUP" "$FILE"
echo "== 4. Napaka povrnjena"
echo "Brez napake: izhodna koda $BEFORE (0 = uspel). Z napako: izhodna koda $AFTER (različna od 0 = napaka zaznana)."
if [ "$BEFORE" -eq 0 ] && [ "$AFTER" -ne 0 ]; then echo "REZULTAT: skripta je namerno napako ZAZNALA."; exit 0; fi
echo "REZULTAT: pričakovano obnašanje ni doseženo, preveri izpis."; exit 1