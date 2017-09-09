#! /bin/bash
{
  date
  git pull
  yarn
  yarn build
} > update.log 2>&1
