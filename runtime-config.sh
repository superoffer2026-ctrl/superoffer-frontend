#!/bin/sh
set -eu

cat > /usr/share/nginx/html/config.js <<EOF
window.SUPER_OFFER_API_URL = "${SUPER_OFFER_API_URL}";
EOF
