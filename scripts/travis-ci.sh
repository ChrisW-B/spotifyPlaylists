#! /bin/bash
set -e # exit w/ non-zero if there's a failure
yarn build
yarn lint:js
yarn lint:css
yarn test
exit 0