#!/usr/bin/env bash

command=$1

container=$(docker run \
    -u root \
    -i \
    -t \
    -d \
    --rm \
    btdownloader)

docker exec -it $container $command
docker stop $container > /dev/null
