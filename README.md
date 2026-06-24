# Estratto di revisione tecnica di EnrollMate

Questo repository è un estratto mirato alla revisione tecnica di EnrollMate per valutazione accademica.

Non si tratta del repository privato completo di produzione. I segreti, `.env.local`, gli artefatti di build generati, lo stato di deployment, i dati privati e i moduli di prodotto non pertinenti sono esclusi intenzionalmente.

## Criteri di progetto coperti

### Tipo di applicazione

EnrollMate è una **multi-page application (MPA)** costruita con Next.js App Router.

L’estratto di revisione include pagine separate per:

- Registrazione
- Login
- Callback di autenticazione
- Logout
- Redirect dashboard / gestione sessione
- Gestione del profilo utente

### API utente RESTful

L’estratto include gli endpoint REST necessari per la gestione utenti:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

Questi endpoint usano Supabase Auth, validazione con Zod, risposte JSON strutturate e gestione della sessione lato server.

### Frontend

Il frontend usa React con Next.js App Router.

Aree UI incluse:

- Form di registrazione
- Form di login
- Form di login con magic link
- Campo di sicurezza Turnstile
- Checklist della robustezza della password
- Form del profilo
- Form aggiornamento email
- Form aggiornamento password
- Pulsante di logout
- Selettore lingua
- Toggle del tema

### Stato frontend

Zustand è incluso per uno stato client-side mirato dell’interfaccia:

- `src/stores/chat-ui-store.ts`
- `src/stores/onboarding-store.ts`

Gli store gestiscono lo stato di interazione UI come lingua, bozze, stato voce/trascrizione, stato di streaming, step di onboarding, bozza del nome organizzazione e slug generato.

I dati di proprietà del server restano in Supabase e non vengono memorizzati in Zustand.

### Server Actions

L’estratto include l’helper condiviso per le Server Action:

- `src/lib/actions/action.ts`

Centralizza:

- Validazione Zod
- Controlli di autenticazione
- Controlli di ruolo
- Verifica opzionale di sessione fresca
- Selezione del client Supabase in base al contesto
- Gestione strutturata degli errori

Le action di profilo, login, registrazione e onboarding usano questo helper dove appropriato.

### Funzionalità API aggiuntive

È inclusa anche la funzionalità extra per il profilo utente:

- Aggiornamento del nome visualizzato
- Aggiornamento della lingua preferita
- Cambio email
- Cambio password con verifica della password corrente

### Documentazione

L’intera cartella `docs/` è inclusa per la revisione architetturale.

## Cosa è escluso intenzionalmente

- `.env.local`
- API key e segreti
- `node_modules`
- `.next`
- Stato runtime locale di Supabase
- Moduli completi di enrolment-concierge non necessari per i criteri della scuola
- Cronologia completa del repository privato
- Dati di produzione

## Ordine consigliato di revisione

1. Leggere `docs/architecture.md`.
2. Leggere `PROJECT-README.md` per il riepilogo completo del prodotto.
3. Esaminare `src/app/api/auth/`.
4. Esaminare `src/app/auth/`.
5. Esaminare `src/app/dashboard/profile/`.
6. Esaminare `src/lib/actions/action.ts`.
7. Esaminare `src/stores/`.
8. Esaminare i test focalizzati sotto `src/test/`.

## Note

Questo estratto è pensato per code review e presentazione, non come applicazione deployabile autonoma. Alcuni import possono fare riferimento a contesto di framework o di progetto presente nel repository privato completo.