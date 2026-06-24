
const API_BASE_URL = 'https://weblockk.netlify.app';
const EXTENSION_ID = 'YOUR_EXTENSION_ID_HERE';

document.addEventListener('DOMContentLoaded', async () => {
  const statusDiv = document.getElementById('status');
  const activateBtn = document.getElementById('activateBtn');
  const input = document.getElementById('licenseInput');
  
  const { isLocked, licenseKey } = await chrome.storage.local.get(['isLocked', 'licenseKey']);

  if (licenseKey && !isLocked) {
    input.value = licenseKey;
    statusDiv.innerText = '✓ Extension is active and secure.';
    statusDiv.className = 'status success';
  }

  activateBtn.addEventListener('click', async () => {
    const key = input.value.trim();
    if (!key) return;

    statusDiv.innerText = 'Verifying license...';
    statusDiv.className = 'status';
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ extensionId: EXTENSION_ID, licenseKey: key })
      });
      
      const result = await response.json();
      
      if (result.valid) {
        await chrome.storage.local.set({ licenseKey: key, isLocked: false });
        statusDiv.innerText = '✓ Success! Extension activated.';
        statusDiv.className = 'status success';
        setTimeout(() => window.close(), 1500);
      } else {
        statusDiv.innerText = result.message || 'Invalid license key.';
        statusDiv.className = 'status error';
      }
    } catch (error) {
      statusDiv.innerText = 'Connection error. Check internet.';
      statusDiv.className = 'status error';
    }
  });
});
