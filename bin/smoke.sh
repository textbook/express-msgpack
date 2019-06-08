#! /usr/bin/env bash

set -x -e

HERE="$(dirname "$0")"
PACKAGE="express-msgpack@$TRAVIS_TAG"

pushd "$HERE/../smoke"
    npm install
    npm install $PACKAGE --no-optional
    npm test || npm deprecate $PACKAGE 'Smoke testing failed'
popd
