# oppkjøringsvarsel_oppkjøringsvakt_gratis_vegvesen
Et helt gratis alternativ til Oppkjøringsvarsel og Oppkjøringsvakt. Sjekker automatisk etter ledige oppkjøringstimer (klasse B) hos Statens vegvesen og sender push-varsel til mobilen via ntfy.sh. Userscript for Tampermonkey.

# Oppkjøringsvarsel & Oppkjøringsvakt – Helt Gratis Monitor for Vegvesen (Tampermonkey)

Leter du etter et **gratis alternativ til Oppkjøringsvarsel.no og Oppkjøringsvakt**? 

I stedet for å betale for dyre SMS-tjenester eller månedlige abonnementer, kan du bruke dette åpne og helt gratis overvåknings-scriptet (userscript) for å finne en **ledig oppkjøring** hos Statens vegvesen langt raskere.

Scriptet kjører trygt og lokalt i din egen nettleser via **Tampermonkey** og overvåker ledige oppkjøringstimer på din valgte trafikkstasjon (f.eks. Kristiansand, Arendal, Risløkka osv.). Så fort en tidligere time blir avbestilt eller en ny time blir lagt ut, spilles det av en alarmlyd på PC-en din, og du får et **push-varsel direkte på mobilen**.

---

## 🆚 Hvorfor velge dette fremfor betalt Oppkjøringsvarsel / Oppkjøringsvakt?

| Funksjon | Dette Scriptet | Betalte apper (Oppkjøringsvakt / Varsel) |
| :--- | :---: | :---: |
| **Pris** | **100 % Gratis** | Koster penger / Engangsavgift per varsel |
| **Sikkerhet** | Kjører lokalt på din PC (ingen deling av BankID) | Krever ofte innloggingsdetaljer eller ekstern tilgang |
| **Hastighet** | Umiddelbar (sjekker hvert 15-35 sek i din nettleser) | Kan ha forsinkelser på opptil flere minutter |
| **Varsling** | Ubegrenset gratis push-varsler via ntfy.sh | Ofte begrenset antall SMS-varsler |

---

## 🚀 Slik installerer du din gratis oppkjøringsvakt

### Trinn 1: Installer Tampermonkey i nettleseren din
For å kjøre scriptet trenger du en utvidelse som kan kjøre "userscripts". Vi anbefaler å bruke Microsoft Edge eller Google Chrome:
- **[Last ned Tampermonkey for Chrome / Vivaldi / Brave](https://chromewebstore.google.com/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)**
- **[Last ned Tampermonkey for Microsoft Edge](https://microsoftedge.microsoft.com/addons/detail/tampermonkey/iikmkjmpaadaobahmlephedocbihglce)**

### Trinn 2: Installer dette overvåknings-scriptet
1. Klikk på denne lenken for å installere: **[Installer Gratis Oppkjøringsvarsel (Ett-klikks installasjon)](https://raw.githubusercontent.com/Shadkader/oppkj-ringsvarsel_oppkj-ringsvakt_gratis_vegvesen/main/vegvesen-oppkjoring.user.js)**
2. Tampermonkey vil automatisk åpne en ny fane. Klikk på den grønne **Install** (eller *Installer*) knappen.

### Trinn 3: Klargjør gratis push-varsel på mobilen din (iOS / Android)
Vi bruker **ntfy.sh**, en lynrask og helt gratis varslingstjeneste uten reklame eller krav om registrering:
1. Last ned appen **ntfy** på telefonen din ([App Store for iPhone](https://apps.apple.com/no/app/ntfy/id1625396347) / [Google Play for Android](https://play.google.com/store/apps/details?id=io.heckel.ntfy)).
2. Åpne appen på telefonen, trykk på **+** (Subscribe to topic) og skriv inn et unikt, hemmelig ord (f.eks. `oppkjoring-kristiansand-dittnavn-2026`).
3. Åpne scriptet i Tampermonkey-kontrollpanelet på PC-en din. 
4. Finn linjen `const NTFY_TOPIC = "..."` helt øverst i koden, og endre verdien til det samme hemmelige ordet du valgte i appen.
5. Lagre scriptet inne i Tampermonkey-editoren (**Ctrl + S**).

---

## 💡 Bruksanvisning: Slik finner du en ledig oppkjøringstime raskt
1. Logg inn på Statens vegvesen sin **[Timebestilling for oppkjøring](https://www.vegvesen.no/dinside/dittforerkort/timebestilling/timer)**.
2. Klikk deg frem til kalendersiden der du velger dato og tidspunkt.
3. Når siden lastes inn, vil du se en blå tekst i nettleserens konsoll (F12 -> Console):
   `[Tampermonkey] Vegvesen Overvåker lastet inn. Venter på...`
4. Klikk én gang et vilkårlig sted på Vegvesen-siden (dette kreves av nettleseren for at den skal få tillatelse til å spille av alarmlyder).
5. **La fanen stå åpen i bakgrunnen.** Scriptet vil nå gjøre et tilfeldig søk i bakgrunnen (mellom hvert 15. og 35. sekund) for å simulere normal menneskelig aktivitet og unngå sikkerhetssperrer.

Når en ledig time i din valgte periode dukker opp, får du umiddelbart push-varsel på telefonen med nøyaktig dato og klokkeslett!

---

## 🛠️ Tilpasning og innstillinger (Konfigurasjon)
Øverst i scriptet kan du enkelt justere innstillingene dine for å snevre inn søket:
- `MIN_DATO`: Ignorerer datoer før denne grensen (f.eks. hvis du ikke ønsker en oppkjøringstime som er altfor tidlig).
- `MAKS_DATO`: Sjekker kun datoer før denne grensen (f.eks. før teoriprøven din utløper).
- `MIN_SEKUNDER` og `MAKS_SEKUNDER`: Definerer tidsrommet for de tilfeldige søkene.

---

## 🔒 Sikkerhet og personvern
* **Lokal kjøring:** Scriptet kjører 100 % lokalt i din egen nettleser. Ingen passord, personopplysninger eller sensitive BankID-tokens blir sendt til eksterne servere.
* **Ingen sporing:** Koden er helt åpen (open source). Den eneste eksterne kommunikasjonen som gjøres er det krypterte kallet til `ntfy.sh` for å gi deg beskjed på telefonen.
* **Ufarlig for kontoen din:** Scriptet gjør kun vanlige søk i ditt eget nettleservindu på en rolig og tilfeldig måte. Det utfører aldri automatiske bestillinger eller handlinger som bryter med brukervilkårene.

---
*Ansvarsfraskrivelse: Dette prosjektet er et uavhengig gratisalternativ og er ikke tilknyttet, sponset eller godkjent av Statens vegvesen, Oppkjøringsvarsel.no eller Oppkjøringsvakt.*
