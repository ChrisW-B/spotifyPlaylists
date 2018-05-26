#! /bin/bash
{
  date
  git pull
  npm i
  npm run build
} > update.log 2>&1
