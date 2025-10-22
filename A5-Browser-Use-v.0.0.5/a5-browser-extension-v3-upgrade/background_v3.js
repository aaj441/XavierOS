// Updated background script for Manifest V3

// Replace chrome.extension.onMessage with chrome.runtime.onMessage
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    // chrome.pageAction.show is deprecated in MV3, use action.show instead
    // However, this doesn't seem to be needed as the panel is now injected via content script
    // If necessary, you can enable this line: chrome.action.show(sender.tab.id);
    sendResponse();
  });

console.log('A5 Browser Automation background service worker loaded.');
