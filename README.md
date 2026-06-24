
# Weblock - Extension Protection Platform

Weblock allows you to remotely lock, manage, and monetize your Chrome Extensions with ease.

## 🚀 Deployment Instructions

1. **Deploy the Web App**: This project is ready for Netlify or Vercel. 
2. **Firebase Setup**: Ensure Firestore and Auth are active.
3. **Admin Setup**: Your primary email is configured as an admin for managing global settings.

## 🛠 How to Download Extension Files

Since we are in a code editor, follow these steps to get your extension files onto your computer:

1. **Create a Folder**: Create a new folder on your PC named `weblock-extension`.
2. **Copy Code**: For each file in the `chrome-extension/` directory of this project:
   - Click the file in the sidebar.
   - Copy the entire contents.
   - Create a new file with the *exact same name* in your local PC folder.
3. **Required Assets**: You **MUST** add an image named `icon128.png` (128x128 pixels) to that folder for the extension to load.

## 📦 Uploading to Chrome Web Store

1. **Test Locally**:
   - Go to `chrome://extensions/`.
   - Enable "Developer mode".
   - Click "Load unpacked" and select your folder.
2. **Configure IDs**:
   - Get your **Extension ID** from your Weblock Dashboard.
   - Replace `YOUR_EXTENSION_ID_HERE` in `background.js` and `popup.js`.
3. **Zip It**: Select all files in your folder and compress them into a `.zip` file.
4. **Dev Console**: Upload the zip to the [Chrome Web Store Developer Console](https://chrome.google.com/webstore/devconsole).

## 📁 Project Structure
- `chrome-extension/`: Source files for your protected extension.
- `src/app/api/verify/`: The remote verification endpoint.
- `src/app/dashboard/`: The developer management portal.

---
Built with Weblock Security.
