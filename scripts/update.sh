#! /bin/bash
{
  git pull
  yarn forceDev
  yarn build
} > update.log 2>&1
