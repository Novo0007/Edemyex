# Weblock - Chrome Extension Protection Platform

Weblock allows you to remotely lock, manage, and monetize your Chrome Extensions with ease.

## 🚀 Deployment Instructions

1. **Deploy the Web App**: Deploy this Next.js project to Vercel or any other provider.
2. **Setup Firebase**: Ensure your Firestore database and Authentication are active.
3. **Configure Environment**: Set your production domain in the extension source code.

## 🛠 Integration Guide (How to get your files)

The source code for your "Locked" extension is located in the `chrome-extension/` directory.

### Step 1: Prepare the Source
Copy all files from the `chrome-extension/` folder to a new folder on your local computer.

### Step 2: Configure the API
Open `background.js` and `popup.js` in your text editor.
- Update `API_BASE_URL` to your deployed web app URL (e.g., `https://my-weblock.vercel.app`).
- Update `EXTENSION_ID` with the ID generated when you "Add Extension" in your Developer Dashboard.

### Step 3: Local Testing
1. Open Google Chrome.
2. Go to `chrome://extensions/`.
3. Toggle **Developer mode** (top right).
4. Click **Load unpacked**.
5. Select the folder where you copied the extension files.

### Step 4: Using the Remote Kill Switch
1. Log in to your Weblock Dashboard.
2. Register your extension.
3. Click **LOCK NOW**.
4. Within 30 minutes (or on browser restart), your local extension will automatically switch to the `locked.html` view and disable its features.

## 📁 File Structure
- `chrome-extension/manifest.json`: Configuration for Chrome.
- `chrome-extension/background.js`: Security heartbeat and remote locking logic.
- `chrome-extension/popup.html/js`: License activation UI.
- `chrome-extension/locked.html`: The screen shown when access is denied.

---
Built by [Jyotirmoy Sarkar](https://www.linkedin.com/in/nnctec/)
