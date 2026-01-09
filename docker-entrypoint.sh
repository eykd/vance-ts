#!/bin/bash
# Entrypoint script for development container
# Ensures node_modules is populated for Linux platform

set -e

cd /workspace

# Check if node_modules needs to be populated
# We check for a marker that indicates a successful install
if [ ! -f node_modules/.install-complete ]; then
    echo "Installing npm dependencies for Linux platform..."
    npm install
    touch node_modules/.install-complete
    echo "Dependencies installed successfully."
fi

# Execute the command passed to the container
exec "$@"
