#!/usr/bin/env bash

READLINK=""

if [ "$(uname)" == "Darwin" ]; then
    READLINK="greadlink"
elif [ "$(expr substr $(uname -s) 1 5)" == "Linux" ]; then
    READLINK="readlink"
fi

project_url=$($READLINK -f $1)
command=$2

container=$(docker run \
    -u root \
    -i \
    -t \
    -d \
    --rm \
    -v $project_url:/project \
    cloud-downloader-worker bash)

docker exec -it $container $command
docker stop $container > /dev/null
