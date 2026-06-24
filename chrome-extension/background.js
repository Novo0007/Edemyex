
/**
 * GuardExt Protection Logic (Production Version)
 * Monitors the remote kill switch status and license validity.
 */

// Replace with your actual deployed URL
const API_BASE_URL = 'https://your-weblock-app.vercel.app'; 
const EXTENSION_ID = 'YOUR_EXTENSION_ID_FROM_DASHBOARD';

chrome.runtime.onInstalled.addListener(() => {
  console.log('Weblock Security Active');
  checkLicenseStatus();
});

// Re-check license every hour to respect the remote kill switch
chrome.alarms.create('checkSecurity', { periodInMinutes: 60 });
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
      // result.reason will tell us if it's a global lock or just a bad key
      lockExtension(result.message, result.reason);
    } else {
      unlockExtension();
    }
  } catch (error) {
    console.error('Security handshake failed:', error);
    // Be conservative: lock if we can't verify status (Offline protection)
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
  
  // Optional: Injects code into tabs to block usage
  // chrome.scripting.executeScript(...)
}

function unlockExtension() {
  chrome.action.setPopup({ popup: 'popup.html' });
  chrome.storage.local.set({ isLocked: false, lockReason: null, lockCode: null });
}
