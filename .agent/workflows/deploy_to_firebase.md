---
description: How to deploy the application to Firebase Hosting
---

Since you are already using Firebase for the database, the easiest way to make your app live is **Firebase Hosting**.

### Prerequisites
You need Node.js installed (which you have).

### Step 1: Login to Firebase
This will open a browser window to authenticate you.
```bash
npx firebase login
```

### Step 2: Initialize Hosting
Run this command in your project root:
```bash
npx firebase init hosting
```
**Follow these prompts carefully:**
1.  **"Are you ready to proceed?"** -> Yes
2.  **"Please select an option:"** -> Use an existing project
3.  **"Select a default Firebase project:"** -> Choose `autodirect-5320e`
4.  **"What do you want to use as your public directory?"** -> `dist` (Important! Vite builds to 'dist')
5.  **"Configure as a single-page app?"** -> Yes (This is a React app)
6.  **"Set up automatic builds and deploys with GitHub?"** -> No (unless you want that)
7.  **"File dist/index.html already exists. Overwrite?"** -> No (We just built it)

### Step 3: Build & Deploy
Unsure if your latest code is built? Run:
```bash
npm run build
```
Then push it to the live web:
```bash
npx firebase deploy
```

### Success!
The terminal will verify "Deploy complete!" and give you a Hosting URL (e.g., `https://autodirect-5320e.web.app`). Your app is now live!
