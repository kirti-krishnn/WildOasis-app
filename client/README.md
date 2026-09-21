# React + Vite

## Deployment

For the Vercel client project, set this environment variable for Production, Preview, and Development as needed:

```text
VITE_API_URL=https://wild-oasis-api.vercel.app/api/v1
```

`VITE_API_URL` is the only client-side Vercel environment variable required. Vite embeds `VITE_*` values at build time, so redeploy after changing it.

For the Vercel API project, also set:

```text
CLIENT_URL=https://<your-client-vercel-domain>
```

Use the exact deployed customer/client origin without a trailing slash. This is required for credentialed login requests.

The client includes a Vercel SPA rewrite so refreshing routes such as `/bookings/123` serves the React application.

Local development uses:

```text
VITE_API_URL=http://localhost:5000/api/v1
```

When `VITE_API_URL` is omitted, the client defaults to `http://localhost:5000/api/v1`. The Vite proxy forwards `/api` and `/uploads` to the local API.

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
