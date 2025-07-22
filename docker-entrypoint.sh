#!/bin/sh

# Set default values if environment variables are not provided
export BACKEND_HOST="${BACKEND_HOST:-backend}"
export BACKEND_PORT="${BACKEND_PORT:-1111}"
export FRONTEND_URL="${FRONTEND_URL:-*}"

# Extract host from URL if BACKEND_HOST contains a URL
if echo "$BACKEND_HOST" | grep -q "://"; then
    # Extract hostname from URL (remove protocol, port, and trailing slash)
    BACKEND_HOST=$(echo "$BACKEND_HOST" | sed 's|^https\?://||' | sed 's|:.*$||' | sed 's|/$||')
    echo "🔧 Extracted hostname from URL: $BACKEND_HOST"
fi

echo "🚀 Starting nginx with configuration:"
echo "   Backend: ${BACKEND_HOST}:${BACKEND_PORT}"
echo "   Frontend URL: ${FRONTEND_URL}"

# Replace environment variables in nginx.conf
envsubst '${BACKEND_HOST} ${BACKEND_PORT} ${FRONTEND_URL}' < /etc/nginx/nginx.conf > /tmp/nginx.conf
mv /tmp/nginx.conf /etc/nginx/nginx.conf

# Test nginx configuration
nginx -t

# Start nginx
exec nginx -g "daemon off;" 