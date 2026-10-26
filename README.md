# Project Board — MERN Internship Starter

A small, responsive full-stack task board created as a starter project using the ICTAK MERN guide's suggested separation of frontend and backend, environment variables, validation, API testing and deployment workflow.

> **Important scope note:** The supplied internship-report document is a blank report template and the MERN guide is a general reference. Neither defines a specific project problem or domain. This ZIP therefore contains a working starter/example app, not a finished project tailored to a project idea that was never specified.

## Features

- React + Vite responsive UI
- Express + Node.js REST API
- MongoDB + Mongoose persistence
- Create tasks, mark tasks done/to-do, delete tasks
- Input validation, clear loading/error/empty states
- `/api/health` health endpoint
- Environment-based API URL and CORS allow-list
- Ready-to-follow GitHub, Render and Vercel deployment instructions

## Folder layout

```text
mern-internship-starter/
├── client/                 # React/Vite frontend
│   ├── src/App.jsx
│   ├── src/styles.css
│   ├── .env.example
│   └── package.json
├── server/                 # Express API
│   ├── src/models/Task.js
│   ├── src/server.js
│   ├── .env.example
│   └── package.json
├── .gitignore
├── render.yaml
└── vercel.json
```

## 1. Install tools

Install Node.js LTS from https://nodejs.org/ and Git from https://git-scm.com/downloads. Use VS Code if you prefer a code editor. Open a new VS Code terminal and verify:

```powershell
node -v
npm -v
git --version
```

## 2. Run locally

1. Extract the ZIP.
2. Open the extracted `mern-internship-starter` folder in VS Code.
3. Create a free MongoDB Atlas cluster/database and database user. In Atlas Network Access, allow access from your current IP for local development. For production, follow Atlas/Render guidance rather than leaving broad access enabled unnecessarily.
4. Copy `server/.env.example` to `server/.env`, then replace `MONGODB_URI` with your actual Atlas connection string. URL-encode special characters in the database password. Do not share or commit this file.
5. Copy `client/.env.example` to `client/.env.local`. Its default local API URL should be `http://localhost:5000/api`.
6. Open **two** terminals in VS Code.

Terminal 1 — backend:

```powershell
cd server
npm install
npm run dev
```

Terminal 2 — frontend:

```powershell
cd client
npm install
npm run dev
```

Open the local URL printed by Vite, normally `http://localhost:5173`. Check the backend at `http://localhost:5000/api/health`.

If you don't configure MongoDB, the health endpoint can still start, but task operations will not work until `MONGODB_URI` is set.

## 3. Push to GitHub

1. Sign in to https://github.com and create a **new empty repository**. Do not add a README or .gitignore there, because this folder already contains them.
2. In the VS Code terminal, make sure you're inside the extracted project root (the folder containing `client`, `server`, and `.gitignore`).
3. Run:

```powershell
git init
git add .
git status
git commit -m "Create MERN project board starter"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPOSITORY.git
git push -u origin main
```

Replace the example repository URL with your own. Before `git add`, verify that neither `server/.env` nor `client/.env.local` is listed by `git status`. If Git says a remote already exists, use `git remote -v` to inspect it rather than adding a second remote.

## 4. Create the MongoDB Atlas database

1. Sign in at https://www.mongodb.com/atlas and create a cluster/database if you don't already have one.
2. Create a **database user** (this is separate from your Atlas website login).
3. In the cluster's Connect flow, choose the application/driver connection string.
4. Replace the placeholder username/password/database in the URI with your own values.
5. Configure Network Access so the deployed Render service can reach Atlas. Follow the current Render/Atlas instructions and use the narrowest practical access rule for your setup.
6. Keep this URI private. Add it as a Render environment variable; never put it in React code, GitHub, or Vercel frontend variables.

## 5. Deploy the backend to Render

Official guide: https://render.com/docs/deploy-node-express-app

1. Sign in at https://render.com and connect your GitHub account.
2. Choose **New → Web Service** and select this repository.
3. Configure:
   - **Root Directory:** `server`
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Health Check Path:** `/api/health` (if the field is shown)
4. In the service's Environment settings, add:
   - `MONGODB_URI` = your real MongoDB Atlas connection string
   - `CLIENT_URL` = `http://localhost:5173` for the initial setup; after Vercel is live, change it to your Vercel production origin, e.g. `https://your-project.vercel.app` (no path, no trailing slash). If you have more than one allowed origin, separate them with commas.
   - `NODE_ENV` = `production` (optional)
5. Create the service and wait for the deploy to finish. Copy the service URL, e.g. `https://your-api-name.onrender.com`.
6. Open `https://YOUR-RENDER-URL/api/health`. It should return JSON. If it says the database is not connected, inspect Render logs and the Atlas connection/network settings.

Render free services may sleep when idle; the first request after inactivity can be slower. Check current plan limits before relying on it.

## 6. Deploy the frontend to Vercel

Official guide: https://vercel.com/docs/frameworks/frontend/vite

1. Sign in at https://vercel.com and choose **Add New → Project**.
2. Import the same GitHub repository.
3. Set **Root Directory** to `client`.
4. Confirm the framework is Vite and the build command is `npm run build`, output directory is `dist`.
5. Add this environment variable before deploying:
   - `VITE_API_URL` = `https://YOUR-RENDER-URL/api` (use your actual Render URL and keep `/api` at the end).
6. Deploy and open the Vercel URL. Test creating, completing and deleting a task.
7. Return to Render and update `CLIENT_URL` to the exact Vercel production origin, for example `https://your-project.vercel.app`. Save and redeploy/restart the backend if prompted.
8. If you later change `VITE_API_URL` in Vercel, redeploy the frontend because Vite variables are included at build time.

## 7. Test the deployed project

- [ ] Vercel site opens over HTTPS.
- [ ] `https://YOUR-RENDER-URL/api/health` responds.
- [ ] Add a task; it appears in the list.
- [ ] Refresh the page; the task remains (MongoDB persistence).
- [ ] Mark a task Done and back to To do.
- [ ] Delete a task.
- [ ] Try a blank task title; the form should reject it.
- [ ] Browser developer tools show no CORS or failed API requests.
- [ ] No `.env` file or database secret is in GitHub.

## Common problems

- **CORS error:** `CLIENT_URL` on Render must match the Vercel origin exactly (`https://...vercel.app`), without a path. Include any preview origin only if you intentionally want to allow it.
- **Frontend says it cannot connect:** verify Vercel's `VITE_API_URL` is the full Render API URL ending in `/api`, then redeploy Vercel.
- **MongoDB connection error:** verify the URI, database user/password, URL encoding, and Atlas network access. Check Render logs.
- **Render deploy fails:** verify root directory is `server`, build command is `npm install`, start command is `npm start`.
- **Vercel deploy fails:** verify root directory is `client`, build command is `npm run build`, output directory is `dist`.
- **Secrets were committed:** rotate the exposed credentials immediately. Deleting the file in a later commit is not enough to remove a secret from Git history.

## Project/report next steps

The supplied report template asks for an executive summary, introduction, objectives, scope and deliverables, methodology, project activities, results/findings, conclusion and appendix. Fill these with what you actually built, tested and learned; do not claim features or test results that you have not verified. Before treating this as your final internship submission, replace this example Task Board with your approved project idea if it differs.
