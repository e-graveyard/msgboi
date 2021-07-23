#!/usr/bin/env sh

set -e

clean() {
    rm -rf dist bundle
}

bundle() {
    cp -r src bundle
    (
        cd bundle/providers
        cp "$1/index.js" ..
    )

    npm run gen
    npm run bundle
}

compact() {
    (
        cd dist
        zip -r bundle.zip .
    )
}

clean
bundle "$1"

case "$1" in
    aws)
        compact
        ;;
esac
