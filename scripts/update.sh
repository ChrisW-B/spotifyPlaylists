#! /bin/bash
{
  date
  git pull
  yarn forceDev
  yarn build
} > update.log 2>&1
