docker-compose up --detach &&
docker-compose -f docker-compose.ssl.yaml &&
docker-compose down &&
docker-compose -f docker-compose.yaml -f docker-compose.httpsOverride.yaml up