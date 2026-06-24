// IMPORTANT: Replace with your actual deployed URL
const API_BASE_URL = 'https://your-weblock-app.vercel.app';
// IMPORTANT: Replace with the Extension ID from your dashboard
const EXTENSION_ID = 'YOUR_EXTENSION_ID_FROM_DASHBOARD';

document.addEventListener('DOMContentLoaded', async () => {
  const { isLocked, licenseKey } = await chrome.storage.local.get(['isLocked', 'licenseKey']);
  const statusDiv = document.getElementById('status');
  const activateBtn = document.getElementById('activateBtn');
  const input = document.getElementById('licenseInput');

  if (licenseKey && !isLocked) {
    input.value = licenseKey;
    statusDiv.innerText = 'Extension is active and secure.';
    statusDiv.style.color = 'green';
  }

  activateBtn.addEventListener('click', async () => {
    const key = input.value.trim();
    
    if (!key) {
      statusDiv.innerText = 'Please enter a key.';
      return;
    }

    statusDiv.innerText = 'Verifying...';
    statusDiv.style.color = '#666';
    
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
        setTimeout(() => window.close(), 1500);
      } else {
        statusDiv.style.color = 'red';
        statusDiv.innerText = result.message || 'Invalid license key.';
      }
    } catch (error) {
      statusDiv.style.color = 'red';
      statusDiv.innerText = 'Network error. Check connection.';
    }
  });
});
