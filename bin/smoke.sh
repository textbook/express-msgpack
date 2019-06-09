#! /usr/bin/env bash

set -x -e

HERE="$(dirname "$0")"
PACKAGE="express-msgpack@$TRAVIS_TAG"

pushd "$HERE/../smoke"
    npm ci
    npm install $PACKAGE --no-optional --no-save
    npm test || npm deprecate $PACKAGE 'Smoke testing failed'
popd
