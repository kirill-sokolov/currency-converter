# Currency Converter

A client-side React application for currency conversion with configurable per-pair fees.

## Prerequisites

- Node.js 20+
- npm 9+
- Docker (optional, for containerised run)

## Getting started

```bash
npm install
npm run dev        # starts dev server at http://localhost:5173
```

## Available commands

| Command              | Description                        |
|----------------------|------------------------------------|
| `npm run dev`        | Start development server           |
| `npm run build`      | Type-check and build for production|
| `npm run typecheck`  | Run `tsc --noEmit`                 |
| `npm test`           | Run unit tests with Vitest         |

## Docker

```bash
# Build and run
docker build -t currency-converter .
docker run -p 8080:80 currency-converter
```

Or with Compose:

```bash
docker-compose up
```

Open **http://localhost:8080** in your browser.

## Architecture decisions

### State — Zustand with persist middleware
Fee configuration is stored in a Zustand store and persisted to `localStorage` under the key `currency-fees` via the built-in `persist` middleware. This eliminates manual serialisation and keeps the store shape as the single source of truth.

### Exchange rates — ECB XML feed
Rates are fetched once on mount from the European Central Bank daily feed (`eurofxref-daily.xml`). All rates are EUR-based, so `EUR: 1` is always added to the result.

### XML parsing — browser DOMParser
The ECB endpoint returns XML. Parsing uses the native `DOMParser` API (`doc.querySelectorAll('Cube[currency]')`), avoiding any third-party dependency.

### Cross-currency rate derivation
Since ECB exposes only EUR-based rates, cross-currency conversion uses EUR as the pivot:

```
EUR → X  : rates[to]
X   → EUR: 1 / rates[from]
X   → Y  : (1 / rates[from]) * rates[to]
```

### CORS proxy — environment-transparent
The client always fetches the relative URL `/ecb-rates`. The proxy layer is swapped per environment without any code or env-var changes:

| Environment       | Proxy              |
|-------------------|--------------------|
| `npm run dev`     | Vite `server.proxy`|
| Docker            | nginx `proxy_pass` |

### Pure utility functions
`getFee`, `deriveRate`, and `calculateConversion` are pure functions with no framework imports, making them straightforward to unit-test in isolation.
