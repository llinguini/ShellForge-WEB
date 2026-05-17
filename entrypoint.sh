#!/bin/sh
set -e

echo "Configuring runtime environment..."

# Reemplaza el placeholder RUNTIME_API_URL con la variable real
if [ -n "$NEXT_PUBLIC_API_URL" ]; then
  echo "Setting API URL to: $NEXT_PUBLIC_API_URL"
  find /app/.next -type f -name "*.js" -exec \
    sed -i "s|RUNTIME_API_URL|${NEXT_PUBLIC_API_URL}|g" {} \;
else
  echo "WARNING: NEXT_PUBLIC_API_URL is not set"
fi

exec "$@"
