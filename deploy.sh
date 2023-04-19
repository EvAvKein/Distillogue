docker-compose down &&
docker-compose up --detach --build --force-recreate &&
docker-compose -f docker-compose.ssl.yaml up --build --force-recreate &&
docker-compose down &&
docker-compose -f docker-compose.yaml -f docker-compose.httpsOverride.yaml up --build --force-recreate