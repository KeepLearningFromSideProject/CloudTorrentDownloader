#!/usr/bin/env bash

docker ps -aqf ancestor=btdownloader | xargs -I{} docker stop {}
