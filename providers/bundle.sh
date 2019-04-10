#!/usr/bin/env bash

set -ex

rm -rf dist
cp providers/aws/index.js src
npm run build
rm src/index.js

cp -r src/config.yml src/templates dist
cd dist
zip -r bundle.zip .

(
    cd ..
    mv dist/bundle.zip .
    rm -rf dist
)
