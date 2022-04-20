#!/usr/bin/env bash

SLEEP_INTERVAL="${1:-600}"

while true;
do
    echo "[START]: $(date)"
    node src/download_magnet.js
    echo "[END]: $(date)"
    sleep $SLEEP_INTERVAL
done
