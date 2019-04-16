#!/usr/bin/env bash

set -e

clean() {
    rm -rf dist bundle
}

PROVIDER=$1

# ...
clean
cp -r src bundle

# ...
cp "providers/$PROVIDER/index.js" bundle
npm run prepare
npm run bundle

# ...
cd dist
zip -r bundle.zip .

# ...
(
    cd ..
    mv dist/bundle.zip .
    clean
)
