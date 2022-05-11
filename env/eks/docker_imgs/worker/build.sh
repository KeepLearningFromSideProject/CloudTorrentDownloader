#!/usr/bin/env bash

docker build -t btdownloader --build-arg SRC_PATH=. -f ./dockerfile ../../../../
