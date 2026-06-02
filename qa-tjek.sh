#!/usr/bin/env bash
# Aevia Health, hurtigt QA-tjek efter regenerering.
# Sadan ko:  abn Terminal, skriv "cd " (med mellemrum),
#            trak mappen "Aevia Health" ind, tryk Enter, og skriv:
#            bash qa-tjek.sh
# Gron = OK, rod = noget skal rettes.

cd "$(dirname "$0")" || exit 1
G="\033[32m"; R="\033[31m"; B="\033[1m"; N="\033[0m"
fejl=0

echo -e "${B}== Aevia QA-tjek ==${N}\n"

# 1) Ingen "Kob nu" / Stripe-checkout pa knapperne
n=$(grep -rIl "Køb nu" --include="*.html" . 2>/dev/null | wc -l | tr -d ' ')
a=$(grep -rIl "/api/checkout" --include="*.html" . 2>/dev/null | wc -l | tr -d ' ')
if [ "$n" = "0" ] && [ "$a" = "0" ]; then
  echo -e "1. Knapper (skal vaere 'Book nu'):        ${G}OK${N}"
else
  echo -e "1. Knapper:                               ${R}FEJL${N} - 'Køb nu'/api fundet i:"
  grep -rIl "Køb nu\|/api/checkout" --include="*.html" . | sed 's|^\./|   |'
  fejl=1
fi

# 2) Ingen em-dashes i brodtekst (space-emdash-space)
m=$(grep -rIl " — " --include="*.html" . 2>/dev/null | wc -l | tr -d ' ')
if [ "$m" = "0" ]; then
  echo -e "2. Em-dashes i tekst (skal vaere 0):       ${G}OK${N}"
else
  echo -e "2. Em-dashes:                             ${R}FEJL${N} - fundet i:"
  grep -rIl " — " --include="*.html" . | sed 's|^\./|   |'
  fejl=1
fi

# 3) Ingen lokale billed-stier (kun logo er tilladt)
b=$(grep -rIl "assets/ydelser\|assets/billeder" --include="*.html" . 2>/dev/null | wc -l | tr -d ' ')
if [ "$b" = "0" ]; then
  echo -e "3. Lokale billeder (skal vaere hostede):   ${G}OK${N}"
else
  echo -e "3. Billeder:                              ${R}FEJL${N} - lokale stier i:"
  grep -rIl "assets/ydelser\|assets/billeder" --include="*.html" . | sed 's|^\./|   |'
  fejl=1
fi

# 4) book.html bruger Cal.com
if grep -q "provider:'calcom'" book.html 2>/dev/null; then
  echo -e "4. Booking (Cal.com pa book.html):        ${G}OK${N}"
else
  echo -e "4. Booking:                               ${R}FEJL${N} - book.html bruger ikke Cal.com"
  fejl=1
fi

echo ""
if [ "$fejl" = "0" ]; then
  echo -e "${G}${B}Alt ser godt ud. Klar til upload.${N}"
else
  echo -e "${R}${B}Der er fejl ovenfor, ret dem for du uploader.${N}"
fi
