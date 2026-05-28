# PRD: Currency Converter UI

## Introduction

A client-side React application for currency conversion with configurable per-pair fees.
The app has two tabs: a **Fee Manager** for configuring directional conversion fees (persisted
to localStorage), and a **Converter** for calculating converted amounts using live ECB exchange
rates and the configured fees.

## Goals

- Allow operators to configure directional fees per currency pair (EUR→GBP ≠ GBP→EUR)
- Persist fee configuration in localStorage across sessions
- Fetch live exchange rates from ECB and support conversion between any two supported currencies
- Apply the formula `(amount - amount * fee) * rate` with a default fee of 0.01
- Run entirely client-side; proxy ECB requests through Vite to bypass CORS
- Be runnable with a single Docker command

---

## User Stories

### US-001: Project scaffold
**Description:** As a developer, I need a working Vite + React + TypeScript project with Radix UI, Zustand, and a Vite proxy configured for ECB.

**Acceptance Criteria:**
- [ ] `npm run dev` starts the dev server without errors
- [ ] Vite proxy forwards `/ecb-rates` → `https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml`
- [ ] Zustand and `@radix-ui/themes` are installed
- [ ] TypeScript strict mode enabled, `npm run typecheck` passes
- [ ] `src/constants/currencies.ts` exports `currencyMeta: Record<string, { symbol: string; name: string }>` covering at least EUR, USD, GBP, JPY, CHF, SEK, NOK, DKK, PLN, CZK with a `getSymbol(code)` / `getName(code)` helper that falls back to the code string
- [ ] `currencyMeta` is used only for display (symbols, names) — it is never the source of available currencies
- [ ] `App.tsx` fetches ECB rates on mount and passes `rates`, `ratesLoading`, `ratesError` as props to both tabs
- [ ] Available currency lists in all selectors (Fee Manager and Converter) are derived exclusively from `Object.keys(rates)`

### US-002: Zustand fee store
**Description:** As a developer, I need a Zustand store that holds the fee map and persists it to localStorage.

**Acceptance Criteria:**
- [ ] Store shape: `fees: Record<string, Record<string, number>>`
- [ ] Actions: `setFee(from, to, fee)`, `removeFee(from, to)`
- [ ] `getFee(from, to): number` selector returns stored fee or `0.01` default
- [ ] Store is persisted via Zustand `persist` middleware under key `currency-fees`
- [ ] Reloading the page preserves configured fees
- [ ] `npm run typecheck` passes

### US-003: Fee Manager tab — list & delete fees
**Description:** As an operator, I want to see all configured fees in a table and delete individual entries so that I can manage the fee schedule.

**Acceptance Criteria:**
- [ ] "Fee Manager" tab renders a table with columns: From, To, Fee (%), Actions
- [ ] Each row shows currency symbol + code (e.g. `€ EUR`) in From/To columns
- [ ] Fee is displayed as percentage (e.g. `0.05` → `5%`)
- [ ] Each row has a Delete button that calls `removeFee(from, to)`
- [ ] Empty state message shown when no fees are configured
- [ ] Verify in browser: table updates immediately after delete without page reload

### US-004: Fee Manager tab — add fee
**Description:** As an operator, I want to add a new directional fee for a currency pair so that custom rates are applied during conversion.

**Acceptance Criteria:**
- [ ] Inline form (or row at the bottom of the table) with: From selector, To selector, Fee input
- [ ] From and To selectors are populated from `Object.keys(rates)` passed from App — never from `currencyMeta`
- [ ] Fee input accepts decimals; validates that value is a number where `0 <= fee < 1` (0 is allowed, 1 and above are not)
- [ ] Submitting calls `setFee(from, to, fee)` and clears the form
- [ ] Saving a fee for an existing pair overwrites it (upsert behaviour)
- [ ] Cannot set From === To (validation error shown)
- [ ] `npm run typecheck` passes
- [ ] Verify in browser: new row appears in table immediately after submit

### US-005: ECB rate service
**Description:** As a developer, I need a service that fetches ECB XML rates, parses them with DOMParser, and returns a `Record<string, number>` (EUR-based rates).

**Acceptance Criteria:**
- [ ] `src/services/ecbRates.ts` exports `fetchRates(): Promise<Record<string, number>>`
- [ ] Result always includes `EUR: 1` as the base
- [ ] Parsing uses `DOMParser` — no third-party XML library
- [ ] Function throws a typed error if the fetch or parse fails
- [ ] `npm run typecheck` passes

### US-006: Cross-currency rate derivation
**Description:** As a developer, I need a pure function that derives the exchange rate between any two ECB-supported currencies via EUR as the base.

**Acceptance Criteria:**
- [ ] `src/utils/rates.ts` exports `deriveRate(rates: Record<string, number>, from: string, to: string): number`
- [ ] EUR → X: returns `rates[to]`
- [ ] X → EUR: returns `1 / rates[from]`
- [ ] X → Y: returns `(1 / rates[from]) * rates[to]`
- [ ] Throws if either currency is not in `rates`
- [ ] Unit tests cover all three cases and the error case (`npm test` passes)

### US-007: Conversion breakdown — pure function
**Description:** As a developer, I need a pure function that applies the fee formula and returns a full numeric breakdown so that the Converter component stays thin and the logic is unit-testable.

**Acceptance Criteria:**
- [ ] `src/utils/conversion.ts` exports `calculateConversion(input: ConversionInput): ConversionBreakdown`
- [ ] `ConversionInput` type: `{ amount: number; fee: number; rate: number }`
- [ ] `ConversionBreakdown` type: `{ originalAmount: number; fee: number; feeAmount: number; amountAfterFee: number; rate: number; result: number }` — no formatted strings
- [ ] Formula: `feeAmount = amount * fee`, `amountAfterFee = amount - feeAmount`, `result = amountAfterFee * rate`
- [ ] Function is pure: no side effects, no imports from React/Zustand/ECB service
- [ ] Unit tests cover: standard case, default fee (0.01), fee = 0
- [ ] `npm run typecheck` passes, `npm test` passes

### US-008: Converter tab — form
**Description:** As a user, I want to enter an amount, select From and To currencies, and see the converted result so that I can calculate conversions with fees applied.

**Acceptance Criteria:**
- [ ] "Converter" tab receives `rates`, `ratesLoading`, `ratesError` as props from App
- [ ] Currency selectors are populated from `Object.keys(rates)`; selectors are disabled while `ratesLoading` is true
- [ ] EUR is pre-selected as the default From currency; USD as default To
- [ ] Amount input rejects non-numeric input; shows validation message if empty on submit
- [ ] From and To selectors cannot be the same currency — Convert button is disabled and an error shown if they match
- [ ] Clicking Convert derives rate via `deriveRate(rates, from, to)`, looks up fee via `getFee(from, to)`, calls `calculateConversion({ amount, fee, rate })`
- [ ] `npm run typecheck` passes

### US-009: Converter tab — result display
**Description:** As a user, I want to see the conversion result with a breakdown of the fee applied so that I understand the calculation.

**Acceptance Criteria:**
- [ ] Result section renders a `ConversionBreakdown` object: original amount, fee %, fee amount, amount after fee, rate, final result with currency symbol
- [ ] Example: "100 EUR → 84.50 GBP (fee: 1%, fee amount: 1 EUR, after fee: 99 EUR, rate: 0.8535)"
- [ ] Formatting (symbols, decimals, percentages) lives in the component/formatter layer — not in `calculateConversion`
- [ ] While `ratesLoading` is true a spinner is shown and the Convert button is disabled
- [ ] If `ratesError` is set an error message is shown inline (not a crash)
- [ ] Verify in browser: result renders correctly for EUR→USD, GBP→USD, and JPY→CHF

### US-010: Docker setup
**Description:** As a reviewer, I want to run the app with a single Docker command so that I can evaluate it without installing Node locally.

**Acceptance Criteria:**
- [ ] `Dockerfile` uses multi-stage build: node image builds the app, nginx image serves the dist
- [ ] `docker build -t currency-converter . && docker run -p 8080:80 currency-converter` serves the production build on port 8080
- [ ] Alternatively, `docker-compose up` works if a compose file is provided
- [ ] The Vite proxy is replaced by an nginx `proxy_pass` for the ECB endpoint in production
- [ ] App is fully functional inside Docker (no localhost-only assumptions)

### US-011: README
**Description:** As a reviewer, I want clear instructions for running and testing the app so that I can evaluate the submission without guessing.

**Acceptance Criteria:**
- [ ] README covers: prerequisites, `npm install`, `npm run dev`, `npm test`, `npm run typecheck`
- [ ] README covers Docker: build command, run command, which port to open
- [ ] Brief description of architecture decisions (Zustand, ECB, DOMParser, cross-currency formula)
- [ ] README is in English

---

## Functional Requirements

- **FR-1:** Fee storage shape is `Record<string, Record<string, number>>` keyed `fees[from][to]`
- **FR-2:** `getFee(from, to)` returns the stored fee or `0.01` if not configured
- **FR-3:** Fees are persisted to localStorage under key `currency-fees` via Zustand persist
- **FR-4:** `calculateConversion(input: ConversionInput): ConversionBreakdown` — pure function, raw numbers only, no formatted strings
- **FR-5:** Conversion formula: `feeAmount = amount * fee`, `amountAfterFee = amount - feeAmount`, `result = amountAfterFee * rate`
- **FR-6:** ECB rates are fetched once in `App.tsx` on mount; `rates`, `ratesLoading`, `ratesError` are passed as props to both Fee Manager and Converter tabs
- **FR-7:** Cross-currency rate: `rate(X→Y) = (1 / rates[X]) * rates[Y]`
- **FR-8:** Available currencies in all selectors come exclusively from `Object.keys(rates)`; `currencyMeta` is used only for display labels
- **FR-9:** Currency metadata provides symbol and name; unknown codes fall back to the ISO code
- **FR-10:** The Vite proxy target is `https://www.ecb.europa.eu`; in Docker, nginx handles the proxy
- **FR-11:** `npm test` runs unit tests; `npm run typecheck` runs `tsc --noEmit`

---

## Non-Goals

- No authentication or user accounts
- No server-side logic (pure client-side)
- No historical rate charts or data
- No real payment processing
- No fee configuration import/export
- No mobile-native build (responsive web is sufficient)
- No production deployment pipeline (Docker is enough)

---

## Technical Considerations

### Stack
| Concern | Choice | Reason |
|---|---|---|
| Framework | React 18 + TypeScript | Assignment requirement |
| Build tool | Vite | Fast HMR, built-in proxy |
| State + persistence | Zustand + persist middleware | 1KB, eliminates manual localStorage sync |
| UI primitives | Radix UI | Accessible, unstyled, minimal overhead |
| XML parsing | Browser `DOMParser` | Zero deps, sufficient for ECB flat XML |
| Tests | Vitest | Same config as Vite, no extra setup |

### ECB XML structure
```xml
<gesmes:Envelope>
  <Cube>
    <Cube time="2025-05-27">
      <Cube currency="USD" rate="1.0823"/>
      <Cube currency="GBP" rate="0.8601"/>
      ...
    </Cube>
  </Cube>
</gesmes:Envelope>
```
Parse with: `doc.querySelectorAll('Cube[currency]')` → map to `{ [currency]: parseFloat(rate) }` + add `EUR: 1`.

### Vite proxy config (dev)
```ts
// vite.config.ts
server: {
  proxy: {
    '/ecb-rates': {
      target: 'https://www.ecb.europa.eu',
      changeOrigin: true,
      rewrite: (path) => '/stats/eurofxref/eurofxref-daily.xml',
    },
  },
}
```

### nginx proxy config (Docker/prod)
```nginx
location /ecb-rates {
  proxy_pass https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml;
  proxy_ssl_server_name on;
}
```

---

## File Structure

```
src/
  constants/
    currencies.ts       # currencyMeta + getSymbol/getName helpers
  services/
    ecbRates.ts         # fetchRates(): Promise<Record<string, number>>
  store/
    feeStore.ts         # Zustand store with persist
  utils/
    rates.ts            # deriveRate() pure function
    conversion.ts       # ConversionInput, ConversionBreakdown types + calculateConversion() pure function
  components/
    FeeManager/
      FeeTable.tsx
      AddFeeForm.tsx
    Converter/
      ConverterForm.tsx
      ConversionResult.tsx
  App.tsx               # fetchRates() on mount → passes rates/ratesLoading/ratesError to both tabs; Radix UI Tabs
  main.tsx
tasks/
  prd-currency-converter.md
Dockerfile
nginx.conf
docker-compose.yml
README.md
vite.config.ts
```

---

## Success Metrics

- `npm run dev` → app loads, both tabs render without console errors
- `npm test` → all unit tests pass (at minimum: `deriveRate`, `calculateConversion`, `getFee`)
- `npm run typecheck` → zero type errors
- `docker build && docker run` → app accessible on port 8080, conversion works end-to-end

---

## Open Questions

- None — all design decisions resolved in brainstorming session.
