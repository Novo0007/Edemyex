
/**
 * Weblock Security Heartbeat
 * Monitors remote kill switch and license validity.
 */

// REPLACE with your actual deployed URL if different
const API_BASE_URL = 'https://weblockk.netlify.app'; 
// REPLACE with your Extension ID from the Weblock Dashboard
const EXTENSION_ID = 'YOUR_EXTENSION_ID_HERE';

chrome.runtime.onInstalled.addListener(() => {
  console.log('Weblock Security Initialized');
  checkSecurityStatus();
});

// Check security every 15 minutes for maximum protection
chrome.alarms.create('securityCheck', { periodInMinutes: 15 });
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'securityCheck') {
    checkSecurityStatus();
  }
});

async function checkSecurityStatus() {
  const { licenseKey } = await chrome.storage.local.get(['licenseKey']);
  
  if (!licenseKey) {
    lockExtension('Activation Required', 'NO_LICENSE');
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
      lockExtension(result.message, result.reason);
    } else {
      unlockExtension();
    }
  } catch (error) {
    console.warn('Weblock heartbeat failed. Retrying in next cycle.');
    // Keep current state if server is unreachable to allow offline usage if preferred
  }
}

function lockExtension(reason, code) {
  chrome.action.setPopup({ popup: 'locked.html' });
  chrome.storage.local.set({ 
    isLocked: true, 
    lockReason: reason,
    lockCode: code 
  });
  
  // Show notification for important locks
  if (code === 'EXTENSION_LOCKED') {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icon128.png',
      title: 'Access Suspended',
      message: 'This extension has been remotely locked by the developer.',
      priority: 2
    });
  }
}

function unlockExtension() {
  chrome.action.setPopup({ popup: 'popup.html' });
  chrome.storage.local.set({ isLocked: false, lockReason: null, lockCode: null });
}
