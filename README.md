# Finance Tracker

A full-stack wallet management app with Vue 3, node.js, and MySQL.

## Features

- **User system**: Register, login, JWT auth, token refresh
- **Transactions**: Quick accounting, categories, accounts
- **Charts**: Expense trend, monthly comparison, category pie
- **Theme**: Dark mode, custom primary color
- **Import/Export**: CSV and Excel support

## Setup

### Database

1. Create a MySQL database and configure `wallet-server/.env`:
   ```
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=wallet
   ```

2. Run migration:
   ```sh
   cd wallet-server && node scripts/run-migration.js
   ```

3. Ensure the existing `transactions` and `categories` tables exist (from your original schema).

### Backend

```sh
cd wallet-server && npm run dev
```

### Frontend

```sh
cd Wallet && npm run dev
```

Open http://localhost:5173. Register a new user to get started.

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Recommended Browser Setup

- Chromium-based browsers (Chrome, Edge, Brave, etc.):
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
  - [Turn on Custom Object Formatter in Chrome DevTools](http://bit.ly/object-formatters)
- Firefox:
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [Turn on Custom Object Formatter in Firefox DevTools](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```
