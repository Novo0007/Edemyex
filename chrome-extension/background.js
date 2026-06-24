/**
 * Weblock Protection Logic
 * Monitors the remote kill switch status and license validity.
 */

// IMPORTANT: Replace with your actual deployed URL (no trailing slash)
const API_BASE_URL = 'https://your-weblock-app.vercel.app'; 
// IMPORTANT: Replace with the Extension ID generated in your Weblock Dashboard
const EXTENSION_ID = 'YOUR_EXTENSION_ID_FROM_DASHBOARD';

chrome.runtime.onInstalled.addListener(() => {
  console.log('Weblock Security Active');
  checkLicenseStatus();
});

// Re-check security status every 30 minutes
chrome.alarms.create('checkSecurity', { periodInMinutes: 30 });
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'checkSecurity') {
    checkLicenseStatus();
  }
});

async function checkLicenseStatus() {
  const { licenseKey } = await chrome.storage.local.get(['licenseKey']);
  
  if (!licenseKey) {
    lockExtension('No license key found.');
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ extensionId: EXTENSION_ID, licenseKey })
    });
    
    const result = await response.json();
    
    if (!result.valid) {
      // result.reason will be 'EXTENSION_LOCKED' if the remote kill switch is ON
      lockExtension(result.message, result.reason);
    } else {
      unlockExtension();
    }
  } catch (error) {
    console.error('Security handshake failed:', error);
    // Optional: lock if offline protection is desired
    // lockExtension('Unable to reach security server.');
  }
}

/**
 * Disables extension functionality and shows the lock screen
 */
function lockExtension(reason, code) {
  chrome.action.setPopup({ popup: 'locked.html' });
  chrome.storage.local.set({ 
    isLocked: true, 
    lockReason: reason,
    lockCode: code 
  });
  
  // Notify other parts of your extension that it is locked
  chrome.runtime.sendMessage({ status: 'locked', reason, code });
}

function unlockExtension() {
  chrome.action.setPopup({ popup: 'popup.html' });
  chrome.storage.local.set({ isLocked: false, lockReason: null, lockCode: null });
}
