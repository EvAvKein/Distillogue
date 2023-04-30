#!/bin/bash

docker-compose down &&
docker-compose -f compose.cert.yaml up --build --force-recreate &&
docker-compose down &&
echo "PROD=TRUE" > ./prod.env && # sufficient for now as it's (as of writing) only used to inform backend whether to create test endpoints, it'll obviously be replaced when actual confidential data is used
docker-compose -f compose.yaml -f compose.prodOverride.yaml up --build --force-recreate