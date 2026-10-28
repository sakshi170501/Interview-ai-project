# Deploy Interview AI to Vercel

The repository root is the single Vercel project. Keep `Backend` and `Frontend` as workspaces in this repository; do not import either subfolder as a separate Vercel project.

1. Push this repository to GitHub and import it in Vercel.
2. Leave **Root Directory** set to the repository root. `vercel.json` configures the frontend output and serverless API.
3. Add these environment variables in **Project Settings → Environment Variables**:
   - `MONGO_URI` — a MongoDB connection string. Allow Vercel deployments in the MongoDB network access settings.
   - `JWT_SECRET` — a long, random secret used to sign session cookies.
   - `GOOGLE_GENAI_API_KEY` — your Gemini API key.
   - `NODE_ENV` — `production`.
4. Optionally set `GOOGLE_GENAI_MODEL` to override the default `gemini-3.8-flash`.
5. Deploy. The API is served from the same origin under `/api`; the frontend does not need a separate API URL.

The health check at `/api/health` does not require MongoDB. The report-fetch and resume-PDF API routes have explicit Vercel function entries under `api/interview` so nested URLs are routed to the serverless handler. The other API routes connect to MongoDB on demand and reuse the connection while a serverless instance remains warm.

For local development, run `npm install` at the repository root, then use two terminals:

```powershell
npm run dev:backend
```

```powershell
npm run dev:frontend
```

Vite proxies `/api` to the local backend at `http://localhost:3000`. Root scripts `npm run lint`, `npm test`, and `npm run build` run checks across the respective workspaces.
