waterline_scaffold
==================

## Install prerequisites

  0. node & npm (tested with node v4 and npm v3.3.4 on Ubuntu 15.04 x64)
  1. Run: `npm install -g tsd typescript`
  2. `cd` to directory you've cloned this repo into
  3. Run: `npm install`
  4. Run: `tsd install`

## Compile+run app

    tsc --sourcemap --module commonjs db.ts && npm start
