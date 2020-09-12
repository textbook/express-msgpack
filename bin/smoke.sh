#! /usr/bin/env bash

set -x -e

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [[ "$1" =~ '--local' ]]; then
    pushd "$HERE/.."
        npm run build
        npm pack
        PACKAGE_VERSION=$(node -p 'require("./package.json").version')
    popd
    PACKAGE="$HERE/../express-msgpack-$PACKAGE_VERSION.tgz"
else
    PACKAGE="express-msgpack@$TRAVIS_TAG"
fi

pushd "$HERE/../smoke"
    for MSGPACK_VERSION in '^1.3.2' '^2.0.0'; do
        MSGPACK="@msgpack/msgpack@$MSGPACK_VERSION"
        rm -rf ./node_modules/
        for ITEM in '' "$MSGPACK" "$PACKAGE"; do
            npm install "$ITEM" --no-optional --no-package-lock --no-save
        done
        if [[ "$1" =~ '--local' ]]; then
            npm test
        else
            npm test || npm unpublish "$PACKAGE" "Smoke testing against $MSGPACK failed"
        fi
    done
popd
