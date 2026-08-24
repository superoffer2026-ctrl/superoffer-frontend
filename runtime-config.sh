#!/bin/sh
set -eu

# Writes the API base URL into a file the app loads before hydration, so one image
# can be promoted across environments without rebuilding.
cat > /app/public/config.js <<CONFIG
window.SUPER_OFFER_API_URL = "${SUPER_OFFER_API_URL:-https://api.superoffer.net/api/v1}";
CONFIG
