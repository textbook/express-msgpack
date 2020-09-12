#! /usr/bin/env bash

set -x -e

HERE="$(dirname "$0")"
PACKAGE="express-msgpack@$TRAVIS_TAG"

pushd "$HERE/../smoke"
    for MSGPACK_VERSION in '^1.3.2' '^2.0.0'; do
        MSGPACK="@msgpack/msgpack@$MSGPACK_VERSION"
        rm -rf ./node_modules/
        for ITEM in '' "$MSGPACK" "$PACKAGE"; do
            npm install "$ITEM" --no-optional --no-package-lock --no-save
        done
        npm test || npm unpublish "$PACKAGE" "Smoke testing against $MSGPACK failed"
    done
popd
