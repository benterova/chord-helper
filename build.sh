#!/bin/bash

# Create dist directory
mkdir -p dist

# Download jsmidgen library if not present
if [ ! -f dist/jsmidgen.js ]; then
    echo "Downloading jsmidgen..."
    curl -L https://unpkg.com/jsmidgen@0.1.5/lib/jsmidgen.js -o dist/jsmidgen.js
fi

# Concatenate source files into app.js
echo "Building app.js..."
cat src/constants.js src/theory.js src/midi.js src/engine.js src/ui.js src/main.js > dist/app.js

echo "Build complete! Files are in dist/"
