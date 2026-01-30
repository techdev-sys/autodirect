---
description: How to setup Firebase credentials
---

1.  **Go to Firebase Console**: Open your browser and navigate to [console.firebase.google.com](https://console.firebase.google.com/).
2.  **Select Project**: Click on your existing project (or create a new one).
3.  **Project Settings**: Click the **Gear Icon** (Settings) in the top-left sidebar and select **Project settings**.
4.  **Find App Config**: Scroll down to the **Your apps** section.
    *   If you haven't created a web app yet, click the **</>** (Web) icon to register a new app. Give it a name (e.g., "AutoDirect") and register it.
5.  **Copy Config**: You will see a code snippet with `const firebaseConfig = { ... }`. Copy the object inside the braces. It looks like this:
    ```javascript
    {
      apiKey: "AIzaSy...",
      authDomain: "your-project.firebaseapp.com",
      projectId: "your-project",
      storageBucket: "your-project.appspot.com",
      messagingSenderId: "123456789",
      appId: "1:1234:web:..."
    }
    ```
6.  **Paste in Code**:
    *   Open `src/firebaseConfig.js`.
    *   Replace the existing `firebaseConfig` object with the one you copied.

7.  **Enable Firestore**:
    *   Go to **Build > Firestore Database** in the left sidebar.
    *   Click **Create Database**.
    *   Choose **Start in Test Mode** (for development) and click **Next/Enable**.

8.  **Restart App**: Run `npm run dev` again to ensure the new config is loaded.
