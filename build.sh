#!/bin/sh
. ~/.nvm/nvm.sh
. ~/.profile
. ~/.bashrc
nvm use 18.14
git pull
npm run build
