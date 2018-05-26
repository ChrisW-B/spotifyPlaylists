#! /bin/bash
set -e # exit w/ non-zero if there's a failure
npm run lint:js
npm run lint:css
npm run test
npm run build
exit 0
