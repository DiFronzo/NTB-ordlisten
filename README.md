# Søk i NTB-ordlisten

Nettbasert søk i NTBs rettskrivningsordliste. Fullstendig TypeScript — søkelogikken kjører på serveren via et JSON API.

![Screenshot 2026-03-01 at 22 17 34](https://github.com/user-attachments/assets/62cbabd8-c5a3-4a4a-9d5b-0a21dfe8fc90)


## Kjør lokalt

```sh
deno task dev
```

Åpne <http://localhost:8000>.

## Test

```sh
deno task test      # Kjør alle tester (27 stk)
deno task check     # Type-sjekk
deno task lint      # Lint
```

## Deploy

Prosjektet er laget for [Deno Deploy](https://deno.com/deploy).

1. Push repoet til GitHub.
2. Opprett et nytt prosjekt på <https://dash.deno.com>.
3. Koble til GitHub-repoet og sett entrypoint til `main.ts`.

## API

```
GET /api/search?q=<søkeord>
```

Returnerer JSON:

```json
{
  "count": 4,
  "matches": ["abbed, -en", "abbedi, -et, -er", "abbedisse, -n", "abbor, -en"]
}
```

## Struktur

```
main.ts                         Deno-server (routing + static files)
deno.json                       Oppgaver, importkart og konfigurasjon
src/
  dictionary.ts                 Laster ordlistedata
  search.ts                     Søkelogikk (normalise, escapeRegex, search)
data/
  dictionary.txt                Ordlisten (ren tekst, ~22 000 oppføringer)
static/
  index.html                    Nettsiden (klient)
tests/
  search_test.ts                Enhetstester for søkelogikk
  dictionary_test.ts            Enhetstester for ordlistedata
  api_test.ts                   Integrasjonstester for API og statiske filer
```

## Kreditt

- Ordliste: Rune Wikstøl
- Opprinnelig kode: Jo Christian Oterhals, NTB (2018)
