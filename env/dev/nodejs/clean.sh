#!/usr/bin/env bash

docker ps -aqf ancestor=cloud-downloader-worker | xargs -I{} docker stop {}
