#!/usr/bin/env bash

docker ps -aqf ancestor=btdownloader-dev | xargs -I{} docker stop {}
