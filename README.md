# Interview AI

Interview AI creates a personalized interview preparation report from a job description and either a PDF resume or a short profile. Reports include a role match score, technical and behavioral interview questions, skill gaps, and a day-by-day preparation plan. Signed-in users can revisit saved reports and export a candidate-profile PDF.

## Requirements

- Node.js 22 or newer
- MongoDB (local or hosted)
- A Google Gemini API key

## Configuration

Create `Backend/.env` with:

```dotenv
PORT=3000
MONGO_URI=mongodb://127.0.0.1:27017/interview-ai
JWT_SECRET=replace-with-a-long-random-secret
GOOGLE_GENAI_API_KEY=your-google-genai-api-key
# Optional:
GOOGLE_GENAI_MODEL=gemini-3.8-flash
MONGO_DNS_SERVERS=8.8.8.8,8.8.4.4
FRONTEND_ORIGIN=http://localhost:5173
NODE_ENV=development
```

For a deployed frontend, set `VITE_API_URL` to the backend origin when building the frontend, and set `FRONTEND_ORIGIN` to the frontend origin on the backend. Use HTTPS in production so secure authentication cookies work.

## Run locally

Open two terminals from the repository root:

```powershell
cd Backend
npm install
npm run dev
```

```powershell
cd Frontend
npm install
npm run dev
```

Open the Vite URL shown in the frontend terminal (normally `http://localhost:5173`). The backend health endpoint is `http://localhost:3000/api/health`.

## Verify

```powershell
cd Backend
npm test
```

```powershell
cd Frontend
npm run lint
npm run build
```
