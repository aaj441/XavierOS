# A5 Browser Automation - Manifest V3 Upgrade

This document provides instructions for upgrading the A5 Browser Automation extension from Manifest V2 to Manifest V3.

## What Changed in Manifest V3?

The key changes made to upgrade to Manifest V3 include:

1. Changed `manifest_version` from 2 to 3
2. Replaced `browser_action` with `action`
3. Changed the background script configuration:
   - Replaced `"page"` with `"service_worker"`
   - Removed `"persistent"` flag (service workers are event-based by design)
4. Moved host permissions from `permissions` to a separate `host_permissions` array
5. Updated the `web_accessible_resources` format to specify which origins can access them
6. Updated Chrome API calls to use the new Promise-based syntax
7. Added the `scripting` permission to support modern script execution

## Upgrade Instructions

1. **Replace the manifest.json file**
   Replace the original manifest file with the new Manifest V3 version:
   ```bash
   mv /path/to/Chrome_extension/manifest_v3.json /path/to/Chrome_extension/manifest.json
   ```

2. **Update the background script**
   Replace the original background script with the V3 compatible version:
   ```bash
   mv /path/to/Chrome_extension/src/bg/background_v3.js /path/to/Chrome_extension/src/bg/background.js
   ```

3. **Update the inject.js file**
   Replace the original inject.js with the V3 compatible version:
   ```bash
   mv /path/to/Chrome_extension/src/inject/inject_v3.js /path/to/Chrome_extension/src/inject/inject.js
   ```

4. **Delete unnecessary background.html**
   The background HTML page is no longer needed in Manifest V3, as it uses service workers:
   ```bash
   rm /path/to/Chrome_extension/src/bg/background.html
   ```

## Key API Changes

1. **Chrome Storage API**
   - Old: `chrome.storage.local.get(key, callback)`
   - New: `chrome.storage.local.get(key).then(callback)`

2. **Message Passing**
   - Old: `chrome.extension.onMessage`
   - New: `chrome.runtime.onMessage`

3. **Tab Actions**
   - Old: `chrome.pageAction.show(tabId)`
   - New: `chrome.action.show(tabId)`

4. **Content Script Injection**
   - Old: `chrome.tabs.executeScript`
   - New: `chrome.scripting.executeScript` (requires "scripting" permission)

## Testing the Updated Extension

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" in the top-right corner
3. Click "Load unpacked" and select the `Chrome_extension` folder
4. Verify the extension loads without errors
5. Test all functionality to ensure it still works as expected

## Troubleshooting

If you encounter issues:

1. Check the browser console for errors
2. Verify all API calls are using the updated Manifest V3 syntax
3. Ensure the service worker is registered correctly
4. Check permissions in the manifest.json file

For more information on Manifest V3, see [Chrome's official documentation](https://developer.chrome.com/docs/extensions/mv3/intro/).