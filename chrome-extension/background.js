
// Replace with your actual deployed URL
const API_BASE_URL = 'https://your-guardext-app.vercel.app'; 
const EXTENSION_ID = 'YOUR_EXTENSION_ID_FROM_DASHBOARD';

chrome.runtime.onInstalled.addListener(() => {
  console.log('GuardExt Protection Active');
  checkLicenseStatus();
});

// Re-check license every hour
chrome.alarms.create('checkLicense', { periodInMinutes: 60 });
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'checkLicense') {
    checkLicenseStatus();
  }
});

async function checkLicenseStatus() {
  const { licenseKey } = await chrome.storage.local.get(['licenseKey']);
  
  if (!licenseKey) {
    lockExtension();
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
      lockExtension();
    } else {
      unlockExtension();
    }
  } catch (error) {
    console.error('License check failed:', error);
    // Optionally allow grace period or lock on failure
  }
}

function lockExtension() {
  chrome.action.setPopup({ popup: 'locked.html' });
  chrome.storage.local.set({ isLocked: true });
}

function unlockExtension() {
  chrome.action.setPopup({ popup: 'popup.html' });
  chrome.storage.local.set({ isLocked: false });
}
