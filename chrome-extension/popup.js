
const API_BASE_URL = 'https://your-guardext-app.vercel.app';
const EXTENSION_ID = 'YOUR_EXTENSION_ID_FROM_DASHBOARD';

document.getElementById('activateBtn').addEventListener('click', async () => {
  const key = document.getElementById('licenseInput').value.trim();
  const statusDiv = document.getElementById('status');
  
  if (!key) return;

  statusDiv.innerText = 'Verifying...';
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ extensionId: EXTENSION_ID, licenseKey: key })
    });
    
    const result = await response.json();
    
    if (result.valid) {
      await chrome.storage.local.set({ licenseKey: key, isLocked: false });
      statusDiv.style.color = 'green';
      statusDiv.innerText = 'Success! Extension activated.';
      chrome.action.setPopup({ popup: 'popup.html' });
      setTimeout(() => window.close(), 1500);
    } else {
      statusDiv.style.color = 'red';
      statusDiv.innerText = result.message || 'Invalid license key.';
    }
  } catch (error) {
    statusDiv.style.color = 'red';
    statusDiv.innerText = 'Server error. Try again later.';
  }
});
