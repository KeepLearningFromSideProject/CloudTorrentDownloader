#!/usr/bin/env bash

QUEUE_URL=$1
TABLE_NAME=$2

kubectl exec -it aws-cli -- aws sqs get-queue-attributes --queue-url $1 --attribute-names All
kubectl exec -it aws-cli -- aws dynamodb describe-table --table-name $2
