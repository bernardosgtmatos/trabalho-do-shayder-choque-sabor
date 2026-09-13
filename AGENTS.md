# AGENTS.md

## Project overview

School project ("Choque Sabor") — a food delivery/restaurant site with two independent apps:

- **`backend/`** — Express 5 + Sequelize + SQLite (CommonJS)
- **`frontend/`** — React 19 + TypeScript + Vite 8 (ESM)

No monorepo tooling. Each directory has its own `package.json` and `node_modules/`.

## Running the apps

```bash
# Backend (from backend/)
npm install
npm run dev        # nodemon on src/server.js, port 5000 (.env)
npm start          # production: node src/server.js

# Frontend (from frontend/)
npm install
npm run dev        # Vite dev server, proxies /Cliente and /Admin to localhost:5000
npm run build      # tsc -b && vite build
npm run lint       # eslint .
```

## Architecture

- Backend routes are prefixed `/Admin` (owner CRUD) and `/Cliente` (client-facing orders/products).
- Frontend Vite proxy (`vite.config.ts`) only forwards `/Cliente` and `/Admin` to the backend.
- SQLite database file lives at `backend/database.sqlite` (gitignored).
- `.env` in `backend/` sets `PORT=5000` and `JWT_SECRET` (empty). `.env` is gitignored.
- Models define Portuguese table/column names: `Clientes`, `Produtos`, `Pedido`, `itens_pedido`, `owner`.

## Important gotchas

- **No `typecheck` script** — frontend type-checking only happens via `npm run build` (`tsc -b`). Run `npx tsc -b --noEmit` for a standalone check.
- **No backend tests or lint** — there are no test or lint scripts in `backend/package.json`.
- **Port mismatch** — `server.js` defaults to `8080` if `PORT` env is unset, but `.env` sets `5000`. Ensure `.env` is loaded.
- **Model sync is commented out** in `backend/src/models/EventModel.js` (lines 103-106) and `UserModel.js` (line 47). Tables are never auto-created — you must uncomment the `.sync()` calls or run them manually once for the app to work.
- Backend uses `express()` router instances (not `express.Router()`), then mounts them via `app.use()`.
- `backend/src/controllers/correct newOrder req.body` is a JSON sample file, not code — skip it.
- `UserModel.js` uses `AllowNull` (capital A) on lines 8 and 12 — this is a typo (Sequelize expects lowercase `allowNull`), so those fields may silently allow nulls.
- Route names and field names are in Portuguese (`/Pedido`, `/Produtos`, `/NovoUsuario`, `/NovoProduto`, `endereço`, `quatidade`, `senha`).

## Verification

There are no automated tests. Manual verification:
1. Start backend (`npm run dev` in `backend/`)
2. Start frontend (`npm run dev` in `frontend/`)
3. Frontend at `http://localhost:5173`, backend at `http://localhost:5000`
4. API endpoints: `GET /Cliente/Produtos`, `POST /Cliente/Pedido`, `POST /Admin/NovoUsuario`, `POST /Admin/NovoProduto`
