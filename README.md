# Søk i NTB-ordlisten

Nettbasert søk i NTBs rettskrivningsordliste, med NTBs språknorm som egen side.
Nettsiden er helt statisk: ordlisten lastes én gang, og søk kjøres lokalt i nettleseren.
Ingen Deno, API-server eller eksterne kjøretidsavhengigheter er nødvendig.

<img width="1719" height="1266" alt="Screenshot 2026-10-10 at 22 28 15" src="https://github.com/user-attachments/assets/7e633b18-fdbb-48df-84d4-813bd559b9e2" />

## Kjør lokalt

Installer Bun 1.4.2 eller nyere (CI bruker Bun 1.4.2):

```sh
bun install --frozen-lockfile
bun run dev
```

Åpne <http://localhost:8000>. Kjør kommandoen på nytt etter kildeendringer.
Sett `PORT` hvis du ønsker en annen port.

## Test og bygg

```sh
bun run lint    # Oxlint (advarsler behandles som feil)
bun test        # Enhets- og byggetester med Buns testkjører
bun run build   # Generer den statiske nettsiden i dist/
bun run preview # Vis den ferdigbygde nettsiden lokalt
```

Bygget kopierer HTML og JavaScript og genererer `dist/assets/dictionary.json`.
Linjer som er delt midt i en parentesmerknad, slås sammen til én oppføring.
Søket støtter prefiks, store/små bokstaver og aksenter, men skiller mellom
norske æ, ø og å. Ett tegn etterfulgt av mellomrom finner også ett-tegnsord.

## Deploy til GitHub Pages

1. Åpne **Settings → Pages** i GitHub-repoet.
2. Velg **GitHub Actions** under **Build and deployment → Source**.
3. Push til `main`, eller start workflowen **Build and deploy GitHub Pages** manuelt.

Workflowen i `.github/workflows/pages.yml` installerer med Buns låsefil,
kjører Oxlint og tester, bygger
nettsiden og publiserer `dist/` til GitHub Pages. Pull requests mot `main`
bygges og testes uten å publiseres.

For dette repoet blir standardadressen <https://difronzo.github.io/NTB-ordlisten/>.
Alle interne lenker og ressursadresser er relative, så nettsiden fungerer både
under repoets undermappe og på et eget domene.

GitHub Pages trenger et **statisk byggeartefakt**, ikke et Docker-image.
Den tidligere `/api/search`-ruten er fjernet; søket kjører nå i nettleseren.

## Struktur

```text
.github/workflows/pages.yml     CI og GitHub Pages-deploy
scripts/build.js                Genererer dist/
scripts/serve.js                Lokal forhåndsvisning
src/dictionary.js               Parser ordlistedata og samler delte linjer
src/search.js                   Søkeindeks og normalisering
src/app.js                      Nettlesergrensesnitt
static/index.html               Søkesiden
static/spraknorm.html           NTBs språknorm
static/404.html                 Egen feilside (GitHub Pages)
static/favicon.svg              Ikon
data/dictionary.txt             Ordlisten (~22 000 oppføringer)
tests/*.test.js                 Regresjonstester og byggetest
```

## Kreditt

- Ordliste: Rune Wikstøl
- Opprinnelig kode: Jo Christian Oterhals, NTB (2018)
