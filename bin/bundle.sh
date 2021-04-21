#!/usr/bin/env sh

set -e

clean() {
    rm -rf dist bundle
}

bundle() {
    cp -r src bundle

    cp "providers/$1/index.js" bundle
    npm run gen
    npm run bundle
}

compact() {
    cd dist
    zip -r bundle.zip .

    cd ..
    mv dist/bundle.zip .
}

get_artifact() {
    mv dist/index.js .
}

bundle "$1"

case "$1" in
    aws)
        compact
        ;;

    server)
        get_artifact
        ;;
esac

clean
