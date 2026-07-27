#!/bin/sh
set -eu

cat > /usr/share/nginx/html/config.js <<EOF
window.SUPER_OFFER_API_URL = "${SUPER_OFFER_API_URL:-https://api.superoffer.net/api/v1}";
EOF
