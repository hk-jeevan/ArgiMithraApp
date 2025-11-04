# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## AgriMithra

Starter app with small tools for farmers:

- Agri Assistant (canned Q&A)
- Weather (OpenWeatherMap)
- Market Prices (configurable endpoint)
- Disease Detection (image upload placeholder)

Setup

1. Copy `.env.example` to `.env` and set `VITE_OPENWEATHER_KEY`.
2. Install deps and run:

```powershell
npm install
npm run dev
```

Notes

- The Weather tool uses OpenWeatherMap. Get a free API key at <https://openweathermap.org/> and set `VITE_OPENWEATHER_KEY`.
- Market prices require a provider. Set `VITE_MARKET_API_URL` to an endpoint that accepts `commodity` and `location` query params and returns JSON. If not set the app shows mock data.
- Disease detection is a placeholder. Integrate a TensorFlow.js model or call an inference API for production.

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
