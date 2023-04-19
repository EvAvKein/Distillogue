docker-compose down &&
docker-compose up --detach --build --force-recreate &&
docker-compose -f compose.ssl.yaml up --build --force-recreate &&
docker-compose down &&
docker-compose -f compose.yaml -f compose.prodOverride.yaml up --build --force-recreate