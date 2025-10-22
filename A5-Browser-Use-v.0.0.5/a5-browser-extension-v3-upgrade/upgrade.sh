#!/bin/bash

# A5-Browser-Use Manifest V2 to V3 Upgrade Script

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

echo "A5 Browser Automation - Manifest V2 to V3 Upgrade Script"
echo "======================================================="
echo

# Check if Chrome_extension directory exists
if [ ! -d "$SCRIPT_DIR/Chrome_extension" ]; then
  echo "Error: Chrome_extension directory not found!"
  exit 1
fi

# Create backup directory
BACKUP_DIR="$SCRIPT_DIR/Chrome_extension_backup_v2_$(date +%Y%m%d_%H%M%S)"
echo "Creating backup at: $BACKUP_DIR"
cp -r "$SCRIPT_DIR/Chrome_extension" "$BACKUP_DIR"
echo "Backup created successfully."
echo

# Replace manifest.json
echo "Updating manifest.json to Manifest V3..."
mv "$SCRIPT_DIR/Chrome_extension/manifest_v3.json" "$SCRIPT_DIR/Chrome_extension/manifest.json"

# Update background.js
echo "Updating background.js..."
mv "$SCRIPT_DIR/Chrome_extension/src/bg/background_v3.js" "$SCRIPT_DIR/Chrome_extension/src/bg/background.js"

# Update inject.js
echo "Updating inject.js..."
mv "$SCRIPT_DIR/Chrome_extension/src/inject/inject_v3.js" "$SCRIPT_DIR/Chrome_extension/src/inject/inject.js"

# Remove background.html
echo "Removing background.html (no longer needed in Manifest V3)..."
rm -f "$SCRIPT_DIR/Chrome_extension/src/bg/background.html"

echo
echo "Upgrade completed successfully!"
echo "A backup of the original extension has been saved to: $BACKUP_DIR"
echo "You can now load the updated extension in Chrome from the Chrome_extension directory."
echo
echo "For troubleshooting and more information, refer to the upgrade_instructions.md file."
